import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import ts from "typescript"

const source = await readFile(new URL("../worker.ts", import.meta.url), "utf8")
const compiled = ts.transpileModule(source.replace('import app from "vinext/server/fetch-handler"', ""), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

function fixture(appResponse = () => new Response("website"), upstream = async () => new Response("image")) {
  const entries = new Map()
  const pending = []
  let appCalls = 0
  const exports = {}
  const cache = {
    match: async (request) => entries.get(request.url)?.clone(),
    put: async (request, response) => { entries.set(request.url, response.clone()) },
  }
  new Function("app", "caches", "fetch", "exports", compiled)(
    { fetch: async () => { appCalls++; return appResponse() } },
    { default: cache }, upstream, exports,
  )
  return {
    request: (url, method = "GET") => exports.default.fetch(new Request(url, { method }), {}, {
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

test("invalid media folders do not reach Amazon or throw a server error", async () => {
  const f = fixture(undefined, async () => { throw new Error("should not fetch") })
  for (const folder of ["%ZZ", "%2Fetc", "bad.folder"]) {
    assert.equal((await f.request(`https://puttbrothers.com/product-media/${folder}/media/mobile.png`)).status, 404)
  }
})

test("Amazon failures return promptly and are not cached", async () => {
  const f = fixture(undefined, async (_url, options) => {
    assert.ok(options.signal instanceof AbortSignal)
    throw new DOMException("Timed out", "TimeoutError")
  })
  const response = await f.request("https://puttbrothers.com/product-media/JN1-BOWLING/media/mobile.png")
  assert.equal(response.status, 504)
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
