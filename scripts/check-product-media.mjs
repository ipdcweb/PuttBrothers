import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'

// The only remote target is the authorized V2 preview. Local compiled preview is
// useful before publishing, and the origin may not be an arbitrary external URL.
const origin = process.argv.includes('--local') ? 'http://127.0.0.1:8792' : 'https://puttbrothers-v2-preview.team-web-592.workers.dev'
if (process.argv.slice(2).some(arg => arg !== '--local')) throw Error('Only --local is supported')
const manifest = JSON.parse(await readFile(new URL('../assets/product-media-manifest.json', import.meta.url), 'utf8'))
const catalog = JSON.parse(await readFile(new URL('../lib/catalog/machines.json', import.meta.url), 'utf8'))
const results = []
async function get(path, options) {
  return fetch(`${origin}${path}`, { ...options, headers: { 'Accept-Encoding': 'identity', ...options?.headers }, redirect: 'error', signal: AbortSignal.timeout(60000) })
}
for (const path of ['/api/products/machines', '/api/planner/machines']) {
  const response = await get(path)
  assert.equal(response.status, 200, path)
  assert.equal(response.headers.get('X-Catalog-Source'), 'cloudflare')
  const data = await response.json()
  assert.equal(data.length, path.includes('/products/') ? 39 : 30)
  if (path.includes('/products/')) {
    assert.equal(data.filter(machine => machine.has3D).length, 10)
    assert.deepEqual(data.map(({ has3D, ...machine }) => machine), catalog)
  } else assert.ok(data.every(machine => machine.image.startsWith('/product-media/')))
  results.push({ path, status: 200, count: data.length, source: 'cloudflare' })
}
let index = 0
async function worker() {
  while (index < manifest.files.length) {
    const file = manifest.files[index++]
    const path = `/product-media/${file.key.split('/').map(encodeURIComponent).join('/')}`
    const head = await get(path, { method: 'HEAD' })
    assert.equal(head.status, 200, path)
    // Cloudflare strips length/ETag from HTML at the edge, even for HEAD.
    // Its full GET below still must match the original SHA-256 byte for byte.
    const html = file.contentType.startsWith('text/html')
    if (!html || head.headers.has('Content-Length')) assert.equal(Number(head.headers.get('Content-Length')), file.bytes, path)
    assert.equal(head.headers.get('Content-Type'), file.contentType, path)
    assert.equal(head.headers.get('Content-Encoding'), null, path)
    if (!html || head.headers.has('ETag')) assert.equal(head.headers.get('ETag'), `"${file.sha256}"`, path)
    assert.equal(head.headers.get('X-Media-Source'), 'cloudflare-r2', path)
    const large = file.bytes > 1024 * 1024
    const response = await get(path, large ? { headers: { Range: 'bytes=0-1023' } } : {})
    assert.equal(response.status, large ? 206 : 200, path)
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (large) {
      assert.equal(bytes.length, 1024)
      assert.equal(response.headers.get('Content-Range'), `bytes 0-1023/${file.bytes}`)
    } else assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, path)
    results.push({ path, bytes: file.bytes, status: response.status, verification: large ? 'range-1024-and-manifest-etag' : 'full-sha256' })
  }
}
await Promise.all(Array.from({ length: 4 }, worker))
for (const value of ['/product-media/JN1-BOWLING/media/mobile.png', 'https://puttbrothers-images.s3.ap-southeast-2.amazonaws.com/JN1-BOWLING/media/mobile.png']) {
  const response = await get(`/api/planner/image?url=${encodeURIComponent(value)}`)
  assert.equal(response.status, 200)
  const expected = manifest.files.find(file => file.key === 'JN1-BOWLING/media/mobile.png')
  assert.equal(createHash('sha256').update(new Uint8Array(await response.arrayBuffer())).digest('hex'), expected.sha256)
}
assert.equal((await get('/api/planner/image?url=https://example.com/image.png')).status, 400)
assert.equal((await get('/product-media/UNKNOWN/build/index.html')).status, 404)
const result = { checkedAt: new Date().toISOString(), origin, totalMediaFiles: manifest.files.length, results }
await mkdir(new URL('../tmp/', import.meta.url), { recursive: true })
await writeFile(new URL(`../tmp/product-media-check-${process.argv.includes('--local') ? 'local' : 'preview'}.json`, import.meta.url), `${JSON.stringify(result, null, 2)}\n`)
console.log(JSON.stringify({ checkedAt: result.checkedAt, origin, catalogue: 39, planner: 30, unity: 10, mediaFiles: manifest.files.length, result: 'passed' }, null, 2))
