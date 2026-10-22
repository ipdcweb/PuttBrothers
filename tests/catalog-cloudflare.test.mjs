import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import test from "node:test"
import ts from "typescript"

const root = fileURLToPath(new URL("../", import.meta.url))
const catalog = JSON.parse(readFileSync(path.join(root, "lib/catalog/machines.json"), "utf8"))
const threeDFolders = JSON.parse(readFileSync(path.join(root, "lib/catalog/three-d-folders.json"), "utf8"))
const s3 = "https://puttbrothers-images.s3.ap-southeast-2.amazonaws.com"

// Execute the actual actions/routes/helpers against the captured release data.
// fetch is always isolated: an unexpected external dependency fails the test.
function fixture(upstream = async () => { throw new Error("Unexpected network request") }) {
  const modules = new Map()
  const calls = []
  const fetchStub = async (url, options) => {
    calls.push({ url: String(url), options })
    return upstream(url, options)
  }

  function load(relative) {
    let filename = path.resolve(root, relative)
    if (!existsSync(filename)) {
      filename = [".ts", ".js", ".json"].map(extension => `${filename}${extension}`).find(existsSync)
    }
    assert.ok(filename && filename.startsWith(root), "Only local release modules may load")
    if (modules.has(filename)) return modules.get(filename)
    if (filename.endsWith(".json")) {
      const value = JSON.parse(readFileSync(filename, "utf8"))
      modules.set(filename, value)
      return value
    }

    const exports = {}
    modules.set(filename, exports)
    const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText
    const requireStub = name => {
      if (name === "next/server") return { NextResponse: Response }
      if (name.startsWith("@/")) return load(name.slice(2))
      if (name.startsWith(".")) return load(path.relative(root, path.resolve(path.dirname(filename), name)))
      throw new Error(`Unexpected dependency ${name}`)
    }
    new Function("require", "fetch", "exports", compiled)(requireStub, fetchStub, exports)
    return exports
  }

  return { load, calls }
}

test("bundled catalogue preserves the complete 39 machine records without network access", async () => {
  const f = fixture()
  const actions = f.load("app/actions/products_db.js")
  assert.equal(catalog.length, 39)
  assert.equal(new Set(catalog.map(machine => machine.MachineID)).size, 39)
  assert.equal(new Set(catalog.map(machine => machine.FolderName)).size, 39)
  assert.deepEqual(await actions.getMachines(), catalog)
  assert.deepEqual(await actions.getMachinesAll(), catalog)
  assert.deepEqual(await actions.getMachinesAllResult(), { machines: catalog, isFallback: false })

  const mutable = await actions.getMachinesAll()
  mutable[0].Machine = "Changed only by caller"
  assert.equal((await actions.getMachinesAll())[0].Machine, catalog[0].Machine)
  assert.equal(f.calls.length, 0)
})

test("product API includes exactly the migrated Unity viewers and identifies Cloudflare data", async () => {
  const f = fixture()
  const response = await f.load("app/api/products/machines/route.ts").GET()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get("X-Catalog-Source"), "cloudflare")
  assert.match(response.headers.get("Cache-Control"), /public/)
  const machines = await response.json()
  assert.equal(machines.length, catalog.length)
  assert.deepEqual(machines.filter(machine => machine.has3D).map(machine => machine.FolderName).sort(), [...threeDFolders].sort())
  for (const [index, machine] of machines.entries()) {
    const { has3D, ...record } = machine
    assert.deepEqual(record, catalog[index])
  }
  assert.equal(f.calls.length, 0)
})

test("planner keeps the 30 course holes, original IDs and millimeter dimensions in meters", async () => {
  const f = fixture()
  const response = await f.load("app/api/planner/machines/route.ts").GET()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get("X-Catalog-Source"), "cloudflare")
  const machines = await response.json()
  const courseHoles = catalog.filter(machine => machine.FolderName.startsWith("JN"))
  assert.equal(machines.length, 30)
  assert.equal(machines.length, courseHoles.length)
  for (const [index, machine] of machines.entries()) {
    const original = courseHoles[index]
    assert.equal(machine.id, String(original.MachineID))
    assert.equal(machine.name, original.Machine)
    assert.equal(machine.width, Number(original.Width) / 1000)
    assert.equal(machine.depth, Number(original.Depth ?? original.Deep) / 1000)
    assert.equal(machine.height, Number(original.Height) / 1000)
    assert.equal(machine.image, `/product-media/${original.FolderName}/media/desktop.png`)
  }
  assert.equal(f.calls.length, 0)
})

test("3D checks use the release manifest and reject malformed folder names without probing storage", async () => {
  const f = fixture()
  const { GET } = f.load("app/api/check-3d/route.ts")
  for (const folder of threeDFolders) {
    const response = await GET(new Request(`https://preview.example/api/check-3d?folderName=${encodeURIComponent(folder)}`))
    assert.equal((await response.json()).exists, true)
  }
  const unknown = await GET(new Request("https://preview.example/api/check-3d?folderName=UNKNOWN"))
  assert.deepEqual(await unknown.json(), { exists: false })
  for (const folder of ["", "../BRIDGE", "%ZZ", "BRIDGE/build/index.html"]) {
    const response = await GET(new Request(`https://preview.example/api/check-3d?folderName=${encodeURIComponent(folder)}`))
    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { exists: false })
  }
  assert.equal(f.calls.length, 0)
})

test("planner PDF images resolve local and legacy URLs only to the current site's migrated image", async () => {
  const f = fixture(async (_url, options) => {
    assert.equal(options.redirect, "error")
    assert.ok(options.signal instanceof AbortSignal)
    return new Response("image bytes", { headers: { "Content-Type": "image/png" } })
  })
  const { GET } = f.load("app/api/planner/image/route.ts")
  for (const image of ["/product-media/JN1-BOWLING/media/mobile.png", `${s3}/JN1-BOWLING/media/mobile.png`]) {
    const response = await GET(new Request(`https://preview.example/api/planner/image?url=${encodeURIComponent(image)}`))
    assert.equal(response.status, 200)
    assert.equal(response.headers.get("Content-Type"), "image/png")
    assert.equal(await response.text(), "image bytes")
    assert.equal(f.calls.at(-1).url, "https://preview.example/product-media/JN1-BOWLING/media/mobile.png")
  }
  assert.equal(f.calls.length, 2)
})

test("planner image proxy cannot fetch arbitrary hosts, Unity files, traversal or unknown products", async () => {
  const f = fixture()
  const { GET } = f.load("app/api/planner/image/route.ts")
  for (const image of [
    "", "https://example.invalid/secret.png", "http://127.0.0.1/private.png",
    `${s3}/UNKNOWN/media/mobile.png`, `${s3}/BRIDGE/build/index.html`,
    "/product-media/UNKNOWN/media/desktop.png", "/product-media/BRIDGE/build/index.html",
    "/product-media/JN1-BOWLING/media/../../private.png",
    "//example.invalid/product-media/JN1-BOWLING/media/desktop.png",
  ]) {
    const response = await GET(new Request(`https://preview.example/api/planner/image?url=${encodeURIComponent(image)}`))
    assert.equal(response.status, 400, image)
  }
  assert.equal(f.calls.length, 0)
})

test("planner image proxy rejects non-images and returns a bounded error on fetch failure", async () => {
  const request = () => new Request("https://preview.example/api/planner/image?url=%2Fproduct-media%2FJN1-BOWLING%2Fmedia%2Fmobile.png")
  const nonImage = fixture(async () => new Response("html", { headers: { "Content-Type": "text/html" } }))
  assert.equal((await nonImage.load("app/api/planner/image/route.ts").GET(request())).status, 400)

  const unavailable = fixture(async () => { throw new TypeError("Redirect or upstream unavailable") })
  const response = await unavailable.load("app/api/planner/image/route.ts").GET(request())
  assert.equal(response.status, 502)
  assert.equal(response.headers.get("Cache-Control"), "no-store")
  assert.equal(unavailable.calls.length, 1)
})
