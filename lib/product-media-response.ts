import manifest from "../assets/product-media-manifest.json"

type MediaFile = { key: string; bytes: number; sha256: string; contentType: string }
type ObjectBody = { body: ReadableStream<Uint8Array> }
export type ProductMediaBucket = {
  get(key: string, options?: { range?: { offset: number; length: number } }): Promise<ObjectBody | null>
}

export const PRODUCT_MEDIA_RELEASE = "catalog-20261023-v1"
const files = new Map<string, MediaFile>(manifest.files.map(file => [file.key, file]))

export async function productMediaResponse(request: Request, bucket?: ProductMediaBucket): Promise<Response> {
  const fail = (message: string, status: number, extra?: Record<string, string>) =>
    new Response(message, { status, headers: { "Cache-Control": "no-store", ...extra } })
  if (!["GET", "HEAD"].includes(request.method)) return fail("Method not allowed", 405, { Allow: "GET, HEAD" })
  let key: string
  try { key = decodeURIComponent(new URL(request.url).pathname.slice("/product-media/".length)) }
  catch { return fail("Not found", 404) }
  // The manifest, not a caller-controlled bucket key, defines the public surface.
  const file = files.get(key)
  if (!file) return fail("Not found", 404)
  if (!bucket) return fail("Product media storage unavailable", 503)

  const etag = `"${file.sha256}"`
  const headers = new Headers({
    "Content-Type": file.contentType,
    "Content-Length": String(file.bytes),
    "ETag": etag,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600, must-revalidate",
    "X-Content-Type-Options": "nosniff",
    "X-Media-Source": "cloudflare-r2",
  })
  if (request.headers.get("If-None-Match")?.split(",").some(value => value.trim() === etag || value.trim() === `W/${etag}` || value.trim() === "*")) {
    headers.delete("Content-Length")
    return new Response(null, { status: 304, headers })
  }
  if (request.method === "HEAD") return new Response(null, { headers })

  let range: { offset: number; length: number } | undefined
  const rangeHeader = request.headers.get("Range")
  const ifRange = request.headers.get("If-Range")
  const match = (!ifRange || ifRange === etag) && rangeHeader?.match(/^bytes=(\d*)-(\d*)$/)
  if (match && (match[1] || match[2])) {
    const start = match[1] ? Number(match[1]) : Math.max(0, file.bytes - Number(match[2]))
    const end = match[1] && match[2] ? Math.min(Number(match[2]), file.bytes - 1) : file.bytes - 1
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= file.bytes || start > end) {
      return fail("Range not satisfiable", 416, { "Content-Range": `bytes */${file.bytes}` })
    }
    range = { offset: start, length: end - start + 1 }
    headers.set("Content-Range", `bytes ${start}-${end}/${file.bytes}`)
    headers.set("Content-Length", String(range.length))
  }
  try {
    const object = await bucket.get(`${PRODUCT_MEDIA_RELEASE}/${file.key}`, range ? { range } : undefined)
    if (!object) return fail("Not found", 404)
    // Stream directly from R2. Never buffer Unity models in Worker memory.
    return new Response(object.body, { status: range ? 206 : 200, headers })
  } catch {
    return fail("Product media storage unavailable", 503)
  }
}
