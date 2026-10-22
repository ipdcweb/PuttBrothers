import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const manifest = JSON.parse(await readFile(new URL('../assets/product-media-manifest.json', import.meta.url), 'utf8'))
const source = (await readFile(new URL('../lib/product-media-response.ts', import.meta.url), 'utf8'))
  .replace('import manifest from "../assets/product-media-manifest.json"', '')
const exports = {}
new Function('manifest', 'exports', ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(manifest, exports)
const respond = exports.productMediaResponse
const original = manifest.files.find(file => file.key.endsWith('.wasm'))
const fixtureManifest = { files: [{ ...original, bytes: 10 }] }
const fixtureExports = {}
new Function('manifest', 'exports', ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText)(fixtureManifest, fixtureExports)
const calls = []
const bucket = { get: async (key, options) => {
  calls.push({ key, options })
  const value = '0123456789'
  const bytes = options?.range ? value.slice(options.range.offset, options.range.offset + options.range.length) : value
  return { body: new Response(bytes).body }
} }
const request = (headers = {}, method = 'GET') => new Request(`https://preview.workers.dev/product-media/${encodeURI(original.key)}`, { headers, method })

test('R2 serves exact filenames, MIME and byte ranges without buffering or AWS fallback', async () => {
  for (const [range, body, contentRange] of [
    ['bytes=2-5', '2345', 'bytes 2-5/10'], ['bytes=8-', '89', 'bytes 8-9/10'],
    ['bytes=-3', '789', 'bytes 7-9/10'], ['bytes=8-99', '89', 'bytes 8-9/10'],
  ]) {
    const r = await fixtureExports.productMediaResponse(request({ Range: range }), bucket)
    assert.equal(r.status, 206)
    assert.equal(r.headers.get('Content-Type'), 'application/wasm')
    assert.equal(r.headers.get('Content-Encoding'), null)
    assert.equal(r.headers.get('Content-Range'), contentRange)
    assert.equal(r.headers.get('Content-Length'), String(body.length))
    assert.equal(await r.text(), body)
    assert.equal(calls.at(-1).key, `${exports.PRODUCT_MEDIA_RELEASE}/${original.key}`)
  }
})

test('HEAD and matching cache validators never read an object body', async () => {
  const noRead = { get: () => { throw Error('Body must not be loaded') } }
  const head = await respond(request({}, 'HEAD'), noRead)
  assert.equal(head.status, 200)
  assert.equal(head.headers.get('Content-Length'), String(original.bytes))
  assert.equal(await head.text(), '')
  const cached = await respond(request({ 'If-None-Match': head.headers.get('ETag') }), noRead)
  assert.equal(cached.status, 304)
  assert.equal(cached.headers.get('Content-Length'), null)
})

test('invalid ranges do not read R2; stale If-Range returns the complete file', async () => {
  for (const range of ['bytes=10-', 'bytes=5-3', 'bytes=-0', 'bytes=999999999999999999999-']) {
    const r = await fixtureExports.productMediaResponse(request({ Range: range }), { get: () => { throw Error('Must not read') } })
    assert.equal(r.status, 416)
    assert.equal(r.headers.get('Content-Range'), 'bytes */10')
  }
  const r = await fixtureExports.productMediaResponse(request({ Range: 'bytes=0-1', 'If-Range': '"old"' }), bucket)
  assert.equal(r.status, 200)
  assert.equal(await r.text(), '0123456789')
})

test('only listed assets and read methods are public, and storage failures are not cached', async () => {
  for (const key of ['%ZZ', 'UNKNOWN/media/mobile.png', 'JN1-BOWLING/build/secret.json', '../private.pdf']) {
    const r = await respond(new Request(`https://preview.workers.dev/product-media/${key}`), bucket)
    assert.equal(r.status, 404)
    assert.equal(r.headers.get('Cache-Control'), 'no-store')
  }
  assert.equal((await respond(request({}, 'POST'), bucket)).status, 405)
  assert.equal((await respond(request())).status, 503)
  const missing = await respond(request(), { get: async () => null })
  assert.equal(missing.status, 404)
  const failure = await respond(request(), { get: async () => { throw Error('R2 unavailable') } })
  assert.equal(failure.status, 503)
  assert.equal(failure.headers.get('Cache-Control'), 'no-store')
})

test('migration manifest covers all product images and every advertised Unity entrypoint', async () => {
  const machines = JSON.parse(await readFile(new URL('../lib/catalog/machines.json', import.meta.url), 'utf8'))
  const models = JSON.parse(await readFile(new URL('../lib/catalog/three-d-folders.json', import.meta.url), 'utf8'))
  const paths = new Set(manifest.files.map(file => file.key))
  assert.equal(paths.size, manifest.files.length)
  for (const machine of machines) for (const variant of ['desktop', 'mobile']) {
    assert.ok(paths.has(`${machine.FolderName}/media/${variant}.png`))
  }
  for (const folder of models) {
    assert.ok(paths.has(`${folder}/build/index.html`))
    for (const suffix of ['.loader.js', '.framework.js', '.wasm', '.data']) {
      assert.ok(manifest.files.some(file => file.key.startsWith(`${folder}/build/Build/`) && file.key.endsWith(suffix)))
    }
  }
  for (const file of manifest.files) {
    assert.match(file.sha256, /^[a-f0-9]{64}$/)
    assert.ok(file.bytes > 0)
    assert.ok(!file.key.split('/').includes('..'))
  }
})
