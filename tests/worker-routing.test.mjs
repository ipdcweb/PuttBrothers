import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import ts from "typescript"

const source = await readFile(new URL("../worker.ts", import.meta.url), "utf8")
const mediaManifest = JSON.parse(await readFile(new URL("../assets/product-media-manifest.json", import.meta.url), "utf8"))
const mediaSource = (await readFile(new URL("../lib/product-media-response.ts", import.meta.url), "utf8")).replace('import manifest from "../assets/product-media-manifest.json"', "")
const mediaExports = {}
new Function("manifest", "exports", ts.transpileModule(mediaSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(mediaManifest, mediaExports)
const machines = JSON.parse(await readFile(new URL("../lib/catalog/machines.json", import.meta.url), "utf8"))
const threeDFolders = JSON.parse(await readFile(new URL("../lib/catalog/three-d-folders.json", import.meta.url), "utf8"))
const helperSource = (await readFile(new URL("../lib/product-media.ts", import.meta.url), "utf8")).replace('import machines from "./catalog/machines.json"', "").replace('import threeDFolders from "./catalog/three-d-folders.json"', "")
const helperExports = {}
new Function("machines", "threeDFolders", "exports", ts.transpileModule(helperSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(machines, threeDFolders, helperExports)
const pdfSource = await readFile(new URL("../lib/layout-pdf-storage.ts", import.meta.url), "utf8")
const pdfExports = {}
new Function("exports", ts.transpileModule(pdfSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(pdfExports)
const compiled = ts.transpileModule(source.replace('import app from "vinext/server/fetch-handler"', "")
  .replace('import { productMediaResponse, type ProductMediaBucket } from "./lib/product-media-response"', "")
  .replace('import { resolveProductImagePath } from "./lib/product-media"', "")
  .replace('import { layoutPdfUpload, layoutPdfDownload, type LayoutPdfBucket, type LayoutPdfRateLimiter } from "./lib/layout-pdf-storage"', ""), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

function fixture(appResponse = () => new Response("website"), upstream = async () => new Response("image"), env = {}) {
  const entries = new Map()
  const pending = []
  let appCalls = 0
  const exports = {}
  const cache = {
    match: async (request) => entries.get(request.url)?.clone(),
    put: async (request, response) => { entries.set(request.url, response.clone()) },
  }
  new Function("app", "caches", "fetch", "exports", "productMediaResponse", "resolveProductImagePath", "layoutPdfUpload", "layoutPdfDownload", compiled)(
    { fetch: async () => { appCalls++; return appResponse() } },
    { default: cache }, upstream, exports, mediaExports.productMediaResponse, helperExports.resolveProductImagePath, pdfExports.layoutPdfUpload, pdfExports.layoutPdfDownload,
  )
  return {
    request: (url, method = "GET", headers = {}) => exports.default.fetch(new Request(url, { method, headers }), env, {
      waitUntil: (promise) => pending.push(promise),
    }),
    flush: () => Promise.all(pending), entries,
    get appCalls() { return appCalls },
  }
}

test("hostname-agnostic Workers Cache stays disabled for this multi-domain Worker", async () => {
  const config = JSON.parse((await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"))
    .replace(/^\s*\/\/.*$/gm, ""))
  assert.equal(config.cache.enabled, false)
})

test("preview blocks contact and PDF writes before invoking the app or an upstream", async () => {
  const f = fixture(undefined, async () => { throw new Error('Must not send data') }, { PREVIEW_MODE: 'true' })
  for (const path of ['/api/contact', '/api/contact/', '/api/layout-pdf/upload']) {
    const response = await f.request(`https://preview.workers.dev${path}`, 'POST')
    assert.equal(response.status, 403)
    assert.equal((await response.json()).success, false)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
  }
  assert.equal(f.appCalls, 0)
})

test("preview HTML is not indexable, while read-only browsing still works", async () => {
  const f = fixture(() => new Response('<html>review</html>', { headers: { 'Content-Type': 'text/html' } }), undefined, { PREVIEW_MODE: 'true' })
  const response = await f.request('https://preview.workers.dev/')
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow, noarchive')
  assert.equal(f.appCalls, 1)
})

test("visiting an alias first cannot redirect the canonical page to itself", async () => {
  const f = fixture()
  const hosts = ["www.puttbrothers.com", "puttbrothers.ch", "www.puttbrothers.ch", "puttbrothers.de",
    "www.puttbrothers.de", "puttbrothers.uk", "www.puttbrothers.uk"]
  for (const host of hosts) {
    for (const path of ["/", "/contact?source=event&name=John%20Doe"]) {
      const redirect = await f.request(`https://${host}${path}`)
      assert.equal(redirect.status, 301)
      assert.equal(redirect.headers.get("Location"), `https://puttbrothers.com${path}`)
      assert.equal(redirect.headers.get("Cache-Control"), "no-store")
      assert.equal(redirect.headers.get("CDN-Cache-Control"), "no-store")
      const canonical = await f.request(redirect.headers.get("Location"))
      assert.equal(canonical.status, 200)
      assert.equal(canonical.headers.get("Location"), null)
    }
  }
})

test("a cached canonical catalog never bypasses the alias redirect", async () => {
  const f = fixture(() => Response.json({ machines: [] }, { headers: { "Cache-Control": "public, max-age=300" } }))
  const url = "https://puttbrothers.com/api/products/machines"
  await f.request(url)
  await f.flush()
  await f.request(url)
  assert.equal(f.appCalls, 1)
  const alias = await f.request("https://puttbrothers.de/api/products/machines")
  assert.equal(alias.status, 301)
  assert.equal(alias.headers.get("Location"), url)
})

test("fallback catalog responses are not cached", async () => {
  const f = fixture(() => Response.json({ machines: [] }, { headers: { "Cache-Control": "no-store" } }))
  await f.request("https://puttbrothers.com/api/products/machines")
  await f.flush()
  assert.equal(f.entries.size, 0)
})

test("invalid media folders never reach any upstream or throw a server error", async () => {
  const f = fixture(undefined, async () => { throw new Error("should not fetch") })
  for (const folder of ["%ZZ", "%2Fetc", "bad.folder"]) {
    assert.equal((await f.request(`https://puttbrothers.com/product-media/${folder}/media/mobile.png`)).status, 404)
  }
})

test("missing R2 binding fails closed without returning to AWS", async () => {
  const f = fixture(undefined, async () => { throw new Error("must not fetch AWS") })
  const response = await f.request("https://puttbrothers.com/product-media/JN1-BOWLING/media/mobile.png")
  assert.equal(response.status, 503)
  assert.equal(response.headers.get("Cache-Control"), "no-store")
  assert.equal(f.entries.size, 0)
})

test("HTML is fresh and only the recovery link clears the site's HTTP cache", async () => {
  const f = fixture(() => new Response("<html>website</html>", { headers: { "Content-Type": "text/html" } }))
  const normal = await f.request("https://puttbrothers.com/")
  assert.equal(normal.headers.get("Cache-Control"), "no-store")
  assert.equal(normal.headers.get("Clear-Site-Data"), null)
  const recovery = await f.request("https://puttbrothers.com/?refresh=20261001")
  assert.equal(recovery.status, 200)
  assert.equal(recovery.headers.get("Clear-Site-Data"), '"cache"')
})

test("planner image export reads R2 directly and rewrites historical S3 URLs without a subrequest", async () => {
  const f = fixture(undefined, async () => { throw Error("No network allowed") }, {
    PRODUCT_MEDIA: { get: async key => {
      assert.equal(key, "catalog-20261023-v1/JN1-BOWLING/media/mobile.png")
      return { body: new Response("png-bytes").body }
    } },
  })
  for (const image of ["/product-media/JN1-BOWLING/media/mobile.png", "https://puttbrothers-images.s3.ap-southeast-2.amazonaws.com/JN1-BOWLING/media/mobile.png"]) {
    const r = await f.request(`https://preview.workers.dev/api/planner/image?url=${encodeURIComponent(image)}`)
    assert.equal(r.status, 200)
    assert.equal(r.headers.get("Content-Type"), "image/png")
    assert.equal(await r.text(), "png-bytes")
  }
  assert.equal((await f.request("https://preview.workers.dev/api/planner/image?url=https://evil.example/test.png")).status, 400)
  assert.equal(f.appCalls, 0)
})

test("PDF endpoints execute native storage handlers before the app without any external request", async () => {
  const f = fixture(undefined, async () => { throw Error("No network allowed") })
  const upload = await f.request("https://puttbrothers.com/api/layout-pdf/upload", "POST")
  assert.equal(upload.status, 403)
  assert.equal((await upload.json()).success, false)
  const download = await f.request("https://puttbrothers.com/layout-pdfs/invalid.pdf")
  assert.equal(download.status, 404)
  assert.equal(download.headers.get("Cache-Control"), "private, no-store")
  assert.equal(f.appCalls, 0)
})

test("retirement review isolates routes, form writes, PDF storage and rate limiting from production", async () => {
  const config = JSON.parse((await readFile(new URL("../wrangler.review.jsonc", import.meta.url), "utf8"))
    .replace(/^\s*\/\/.*$/gm, ""))
  assert.equal(config.name, "puttbrothers-aws-retirement-review")
  assert.deepEqual(config.routes, [])
  assert.equal(config.vars.PREVIEW_MODE, "true")
  assert.equal(config.r2_buckets.find(binding => binding.binding === "LAYOUT_PDFS").bucket_name, "puttbrothers-layout-pdfs-review")
  assert.equal(config.ratelimits[0].namespace_id, "2026102303")
})
