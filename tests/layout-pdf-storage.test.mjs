import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import ts from "typescript"

const source = await readFile(new URL("../lib/layout-pdf-storage.ts", import.meta.url), "utf8")
const exports = {}
new Function("exports", ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(exports)
const { layoutPdfUpload, layoutPdfDownload, MAX_LAYOUT_PDF_BYTES } = exports
const ORIGIN = "https://puttbrothers.example"
const PATH = "/layout-pdfs/2026/10/01234567-89ab-4cde-8fab-0123456789ab.pdf"
const KEY = PATH.replace("/layout-pdfs/", "layout-plans/")
const PDF = "%PDF-1.4\nfixture-only-no-client-data\n%%EOF"

function fixture({ deny = false, failPut = false, failGet = false, failRate = false, missing = false } = {}) {
  const puts = [], reads = [], limits = []
  const data = new TextEncoder().encode(PDF)
  const metadata = { size: data.byteLength, httpEtag: '"fixture-etag"', uploaded: new Date("2026-10-23T00:00:00Z") }
  const bucket = {
    put: async (key, body, options) => {
      puts.push({ key, body, options })
      if (failPut) throw new Error("private R2 diagnostic")
      return metadata
    },
    head: async key => {
      reads.push({ key, method: "head" })
      if (failGet) throw new Error("private R2 diagnostic")
      return missing ? null : metadata
    },
    get: async (key, options) => {
      reads.push({ key, method: "get", options })
      if (failGet) throw new Error("private R2 diagnostic")
      const bytes = options?.range ? data.slice(options.range.offset, options.range.offset + options.range.length) : data
      return missing ? null : { ...metadata, body: new Response(bytes).body }
    },
  }
  const limiter = { limit: async ({ key }) => {
    limits.push(key)
    if (failRate) throw new Error("private limiter diagnostic")
    return { success: !deny }
  } }
  return { bucket, limiter, puts, reads, limits }
}

function uploadRequest({ body = PDF, type = "application/pdf", filename = "fixture@example.invalid-123.pdf", headers = {}, fields, origin = ORIGIN, url = ORIGIN } = {}) {
  const form = new FormData()
  form.append("file", new Blob([body], { type }), filename)
  if (fields) fields(form)
  return new Request(`${url}/api/layout-pdf/upload`, { method: "POST", body: form, headers: {
    Origin: origin, "CF-Connecting-IP": "203.0.113.10", ...headers,
  } })
}
const downloadRequest = (headers = {}, method = "GET", path = PATH) => new Request(`${ORIGIN}${path}`, { headers, method })

function privateResponse(response) {
  assert.equal(response.headers.get("Cache-Control"), "private, no-store")
  assert.equal(response.headers.get("CDN-Cache-Control"), "no-store")
  assert.match(response.headers.get("X-Robots-Tag"), /noindex/)
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff")
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer")
}

test("R2 upload preserves the client contract while UUID keys and stored metadata contain no email", async () => {
  const f = fixture()
  const response = await layoutPdfUpload(uploadRequest(), f.bucket, f.limiter)
  assert.equal(response.status, 200)
  privateResponse(response)
  const result = await response.json()
  assert.deepEqual(Object.keys(result), ["success", "url", "key", "filename"])
  assert.equal(result.success, true)
  assert.equal(result.filename, "fixture@example.invalid-123.pdf")
  assert.match(result.key, /^layout-plans\/\d{4}\/\d{2}\/[a-f0-9-]{36}\.pdf$/)
  assert.equal(result.url, `${ORIGIN}/${result.key.replace("layout-plans/", "layout-pdfs/")}`)
  assert.equal(f.puts.length, 1)
  assert.equal(f.puts[0].key, result.key)
  assert.equal(await f.puts[0].body.text(), PDF)
  assert.deepEqual(f.puts[0].options, { httpMetadata: {
    contentType: "application/pdf", contentDisposition: 'inline; filename="layout-summary.pdf"', cacheControl: "private, no-store",
  } })
  assert.deepEqual(f.limits, ["layout-pdf:203.0.113.10"])
  assert.ok(!JSON.stringify({ key: result.key, url: result.url, options: f.puts[0].options }).includes("fixture@"))
  const second = await (await layoutPdfUpload(uploadRequest(), f.bucket, f.limiter)).json()
  assert.notEqual(second.key, result.key)
})

test("upload rejects nonmatching/missing origins, methods, and production bindings without a write", async () => {
  const f = fixture()
  for (const request of [uploadRequest({ origin: "https://foreign.example" }), uploadRequest({ headers: { Origin: "" } })]) {
    assert.equal((await layoutPdfUpload(request, f.bucket, f.limiter)).status, 403)
  }
  assert.equal((await layoutPdfUpload(new Request(`${ORIGIN}/api/layout-pdf/upload`), f.bucket, f.limiter)).status, 405)
  assert.equal((await layoutPdfUpload(uploadRequest(), undefined, f.limiter)).status, 503)
  assert.equal((await layoutPdfUpload(uploadRequest(), f.bucket)).status, 503)
  assert.equal(f.puts.length, 0)
  assert.equal(f.limits.length, 0)
})

test("only local loopback requests may use a missing client-IP header", async () => {
  const f = fixture()
  assert.equal((await layoutPdfUpload(uploadRequest({ headers: { "CF-Connecting-IP": "" } }), f.bucket, f.limiter)).status, 503)
  assert.equal((await layoutPdfUpload(uploadRequest({ headers: { "CF-Connecting-IP": "not-an-IP" } }), f.bucket, f.limiter)).status, 503)
  assert.equal(f.puts.length, 0)
  for (const url of ["http://localhost:8792", "http://127.0.0.1:8792", "http://[::1]:8792"]) {
    const r = await layoutPdfUpload(uploadRequest({ url, origin: url, headers: { "CF-Connecting-IP": "" } }), f.bucket, f.limiter)
    assert.equal(r.status, 200)
  }
  assert.deepEqual(f.limits, ["layout-pdf:local", "layout-pdf:local", "layout-pdf:local"])
})

test("limiter denial or outage and R2 failures expose no backend details", async () => {
  for (const option of ["deny", "failRate", "failPut"]) {
    const f = fixture({ [option]: true })
    const response = await layoutPdfUpload(uploadRequest(), f.bucket, f.limiter)
    assert.equal(response.status, option === "deny" ? 429 : 503)
    privateResponse(response)
    assert.ok(!(await response.text()).includes("private"))
    assert.equal(f.puts.length, option === "failPut" ? 1 : 0)
    if (option === "deny") assert.equal(response.headers.get("Retry-After"), "60")
  }
})

test("uploads require one nonempty PDF with both declared MIME and PDF signature", async () => {
  const f = fixture()
  for (const request of [
    uploadRequest({ body: "" }), uploadRequest({ type: "text/plain" }), uploadRequest({ body: "fake-pdf" }),
    uploadRequest({ fields: form => form.append("file", new Blob([PDF], { type: "application/pdf" }), "other.pdf") }),
    new Request(`${ORIGIN}/api/layout-pdf/upload`, { method: "POST", headers: {
      Origin: ORIGIN, "CF-Connecting-IP": "203.0.113.10", "Content-Type": "application/json",
    }, body: "{}" }),
    new Request(`${ORIGIN}/api/layout-pdf/upload`, { method: "POST", headers: {
      Origin: ORIGIN, "CF-Connecting-IP": "203.0.113.10", "Content-Type": "multipart/form-data; boundary=invalid",
    }, body: "broken multipart" }),
  ]) {
    const response = await layoutPdfUpload(request, f.bucket, f.limiter)
    assert.equal(response.status, 400)
    privateResponse(response)
  }
  assert.equal(f.puts.length, 0)
})

test("file and multipart limits reject oversized bodies including chunked requests", async () => {
  const f = fixture()
  const oversized = new Uint8Array(MAX_LAYOUT_PDF_BYTES + 1)
  oversized.set(new TextEncoder().encode("%PDF-"))
  assert.equal((await layoutPdfUpload(uploadRequest({ body: oversized }), f.bucket, f.limiter)).status, 413)
  let cancelled = false
  let readCount = 0
  const stream = new ReadableStream({
    pull(controller) { readCount++; controller.enqueue(new Uint8Array(1024 * 1024)) },
    cancel() { cancelled = true },
  }, { highWaterMark: 0 })
  const request = new Request(`${ORIGIN}/api/layout-pdf/upload`, { method: "POST", body: stream, duplex: "half", headers: {
    Origin: ORIGIN, "CF-Connecting-IP": "203.0.113.10", "Content-Type": "multipart/form-data; boundary=fixture",
  } })
  assert.equal((await layoutPdfUpload(request, f.bucket, f.limiter)).status, 413)
  assert.equal(cancelled, true)
  assert.equal(readCount, 13)
  assert.equal(f.puts.length, 0)
  const declared = uploadRequest({ headers: { "Content-Length": String(13 * 1024 * 1024) } })
  assert.equal((await layoutPdfUpload(declared, f.bucket, f.limiter)).status, 413)
  assert.equal(f.puts.length, 0)
})

test("download and HEAD stream only an exact UUID capability with generic private response metadata", async () => {
  const f = fixture()
  const head = await layoutPdfDownload(downloadRequest({}, "HEAD"), f.bucket)
  assert.equal(head.status, 200)
  assert.equal(await head.text(), "")
  assert.deepEqual(f.reads, [{ key: KEY, method: "head" }])
  const response = await layoutPdfDownload(downloadRequest(), f.bucket)
  assert.equal(response.status, 200)
  privateResponse(response)
  assert.equal(response.headers.get("Content-Type"), "application/pdf")
  assert.equal(response.headers.get("Content-Disposition"), 'inline; filename="layout-summary.pdf"')
  assert.match(response.headers.get("Content-Security-Policy"), /sandbox/)
  assert.equal(response.headers.get("Content-Length"), String(new TextEncoder().encode(PDF).byteLength))
  assert.equal(await response.text(), PDF)
  assert.equal(f.reads.at(-1).key, KEY)
})

test("PDF single byte ranges support seeking; invalid ranges never read the object body", async () => {
  const size = new TextEncoder().encode(PDF).byteLength
  const f = fixture()
  for (const [range, expected] of [["bytes=0-4", "%PDF-"], ["bytes=5-", PDF.slice(5)], ["bytes=-5", "%%EOF"], [`bytes=${size - 5}-99999`, "%%EOF"]]) {
    const response = await layoutPdfDownload(downloadRequest({ Range: range }), f.bucket)
    assert.equal(response.status, 206)
    assert.equal(response.headers.get("Content-Length"), String(expected.length))
    assert.equal(await response.text(), expected)
    assert.ok(f.reads.at(-1).options.range)
  }
  for (const range of [`bytes=${size}-`, "bytes=9-2", "bytes=-0", "bytes=999999999999999999999-"]) {
    const before = f.reads.filter(read => read.method === "get").length
    const response = await layoutPdfDownload(downloadRequest({ Range: range }), f.bucket)
    assert.equal(response.status, 416)
    assert.equal(response.headers.get("Content-Range"), `bytes */${size}`)
    assert.equal(f.reads.filter(read => read.method === "get").length, before)
  }
  const stale = await layoutPdfDownload(downloadRequest({ Range: "bytes=0-4", "If-Range": '"old-etag"' }), f.bucket)
  assert.equal(stale.status, 200)
  assert.equal(await stale.text(), PDF)
})

test("download forbids listings, caller-chosen keys, traversal, and writing methods", async () => {
  const f = fixture()
  for (const path of ["/layout-pdfs/", "/layout-pdfs/2026/10/fixture@example.invalid.pdf", PATH.replace("/10/", "/13/"),
    PATH.replace("01234567", "%3001234567"), "/layout-pdfs/../private.pdf", PATH + "/extra"]) {
    assert.equal((await layoutPdfDownload(downloadRequest({}, "GET", path), f.bucket)).status, 404)
  }
  assert.equal((await layoutPdfDownload(downloadRequest({}, "POST"), f.bucket)).status, 405)
  assert.equal(f.reads.length, 0)
  assert.equal((await layoutPdfDownload(downloadRequest())).status, 503)
  for (const options of [{ missing: true }, { failGet: true }]) {
    const response = await layoutPdfDownload(downloadRequest(), fixture(options).bucket)
    assert.equal(response.status, options.missing ? 404 : 503)
    privateResponse(response)
    assert.ok(!(await response.text()).includes("private R2 diagnostic"))
  }
})
