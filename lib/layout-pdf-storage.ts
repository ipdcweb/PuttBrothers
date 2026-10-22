// Layout PDFs remain private in R2. The random link is a bearer capability;
// neither client emails nor caller-selected keys form part of that link.
type PdfObject = {
  size: number
  httpEtag?: string
  uploaded?: Date
}
type PdfObjectBody = PdfObject & { body: ReadableStream<Uint8Array> }
export type LayoutPdfBucket = {
  put(key: string, body: Blob, options: { httpMetadata: {
    contentType: string; contentDisposition: string; cacheControl: string
  } }): Promise<unknown>
  head(key: string): Promise<PdfObject | null>
  get(key: string, options?: { range: { offset: number; length: number } }): Promise<PdfObjectBody | null>
}
export type LayoutPdfRateLimiter = {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

export const MAX_LAYOUT_PDF_BYTES = 10 * 1024 * 1024
const MAX_ENVELOPE_BYTES = 12 * 1024 * 1024
const PDF_DISPOSITION = 'inline; filename="layout-summary.pdf"'
const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
  "CDN-Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
}

function failure(message: string, status: number, extra?: Record<string, string>) {
  return Response.json({ success: false, message }, {
    status, headers: { ...PRIVATE_HEADERS, ...extra },
  })
}

// Content-Length is only an early rejection. Enforce the limit while reading as
// well, including for chunked bodies or dishonest/missing length headers.
async function readEnvelope(request: Request): Promise<ArrayBuffer | null> {
  if (Number(request.headers.get("Content-Length")) > MAX_ENVELOPE_BYTES) {
    return null
  }
  if (!request.body) return new ArrayBuffer(0)
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      length += chunk.value.byteLength
      if (length > MAX_ENVELOPE_BYTES) {
        await reader.cancel()
        return null
      }
      chunks.push(chunk.value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes.buffer
}

function uploadRateKey(request: Request): string | null {
  const ip = request.headers.get("CF-Connecting-IP")
  if (ip && ip.length <= 64 && /^[a-fA-F0-9:.]+$/.test(ip)) return `layout-pdf:${ip}`
  // Only local development may lack Cloudflare's trusted client-IP header.
  const hostname = new URL(request.url).hostname
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname) ? "layout-pdf:local" : null
}

export async function layoutPdfUpload(
  request: Request,
  bucket?: LayoutPdfBucket,
  limiter?: LayoutPdfRateLimiter,
): Promise<Response> {
  if (request.method !== "POST") return failure("Method not allowed", 405, { Allow: "POST" })
  const url = new URL(request.url)
  if (request.headers.get("Origin") !== url.origin) return failure("Upload origin is not allowed", 403)
  if (!bucket || !limiter) return failure("Layout PDF storage unavailable", 503)
  const rateKey = uploadRateKey(request)
  if (!rateKey) return failure("Layout PDF storage unavailable", 503)
  try {
    if (!(await limiter.limit({ key: rateKey })).success) {
      return failure("Too many PDF uploads. Please try again shortly.", 429, { "Retry-After": "60" })
    }
  } catch {
    return failure("Layout PDF storage unavailable", 503)
  }
  const contentType = request.headers.get("Content-Type") || ""
  if (!/^multipart\/form-data\s*;/i.test(contentType)) {
    return failure("A multipart PDF upload is required", 400)
  }
  let form: FormData
  try {
    const bytes = await readEnvelope(request)
    if (!bytes) return failure("PDF upload is too large", 413)
    form = await new Response(bytes, { headers: { "Content-Type": contentType } }).formData()
  } catch {
    return failure("Invalid PDF upload", 400)
  }
  const files = form.getAll("file")
  const file = files[0]
  if (files.length !== 1 || !(file instanceof File)) return failure("One PDF file is required", 400)
  if (file.size === 0) return failure("The PDF file is empty", 400)
  if (file.size > MAX_LAYOUT_PDF_BYTES) return failure("PDF upload is too large", 413)
  if (file.type !== "application/pdf" || await file.slice(0, 5).text() !== "%PDF-") {
    return failure("Only PDF files are allowed", 400)
  }

  const filename = file.name.replace(/[^a-zA-Z0-9._@-]/g, "_").slice(0, 180) || "layout-summary.pdf"
  const now = new Date()
  const suffix = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.pdf`
  const key = `layout-plans/${suffix}`
  try {
    await bucket.put(key, file, { httpMetadata: {
      contentType: "application/pdf",
      contentDisposition: PDF_DISPOSITION,
      cacheControl: "private, no-store",
    } })
  } catch {
    return failure("Layout PDF storage unavailable", 503)
  }
  return Response.json({ success: true, url: `${url.origin}/layout-pdfs/${suffix}`, key, filename }, {
    headers: PRIVATE_HEADERS,
  })
}

export async function layoutPdfDownload(request: Request, bucket?: LayoutPdfBucket): Promise<Response> {
  if (!["GET", "HEAD"].includes(request.method)) return failure("Method not allowed", 405, { Allow: "GET, HEAD" })
  const path = new URL(request.url).pathname
  const match = path.match(/^\/layout-pdfs\/(\d{4}\/(?:0[1-9]|1[0-2])\/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.pdf)$/)
  if (!match) return failure("Not found", 404)
  if (!bucket) return failure("Layout PDF storage unavailable", 503)
  const key = `layout-plans/${match[1]}`
  try {
    const object = await bucket.head(key)
    if (!object) return failure("Not found", 404)
    if (!Number.isSafeInteger(object.size) || object.size <= 0) return failure("Layout PDF storage unavailable", 503)
    const headers = new Headers({
      ...PRIVATE_HEADERS,
      "Content-Type": "application/pdf",
      "Content-Disposition": PDF_DISPOSITION,
      "Content-Security-Policy": "sandbox; default-src 'none'; frame-ancestors 'self'",
      "Content-Length": String(object.size),
      "Accept-Ranges": "bytes",
    })
    if (object.httpEtag) headers.set("ETag", object.httpEtag)
    if (object.uploaded) headers.set("Last-Modified", object.uploaded.toUTCString())
    if (request.method === "HEAD") return new Response(null, { headers })

    let range: { offset: number; length: number } | undefined
    const ifRange = request.headers.get("If-Range")
    const rangeHeader = request.headers.get("Range")
    const validatorMatches = !ifRange || ifRange === object.httpEtag || ifRange === headers.get("Last-Modified")
    const rangeMatch = validatorMatches && rangeHeader?.match(/^bytes=(\d*)-(\d*)$/)
    if (rangeMatch && (rangeMatch[1] || rangeMatch[2])) {
      const start = rangeMatch[1] ? Number(rangeMatch[1]) : Math.max(0, object.size - Number(rangeMatch[2]))
      const end = rangeMatch[1] && rangeMatch[2] ? Math.min(Number(rangeMatch[2]), object.size - 1) : object.size - 1
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= object.size || start > end) {
        return failure("Range not satisfiable", 416, { "Content-Range": `bytes */${object.size}` })
      }
      range = { offset: start, length: end - start + 1 }
      headers.set("Content-Range", `bytes ${start}-${end}/${object.size}`)
      headers.set("Content-Length", String(range.length))
    }
    const body = await bucket.get(key, range ? { range } : undefined)
    if (!body) return failure("Not found", 404)
    return new Response(body.body, { status: range ? 206 : 200, headers })
  } catch {
    return failure("Layout PDF storage unavailable", 503)
  }
}
