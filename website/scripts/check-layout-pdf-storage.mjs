import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import { jsPDF } from 'jspdf'

// Disposable local R2 only. No contact handler, AWS credential or external API.
const requireFromWrangler = createRequire(createRequire(import.meta.url).resolve('wrangler/package.json'))
const { Miniflare, convertV4MiniflareOptions } = await import(pathToFileURL(requireFromWrangler.resolve('miniflare')).href)
const source = await readFile(new URL('../lib/layout-pdf-storage.ts', import.meta.url), 'utf8')
const library = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText
const worker = `import { layoutPdfUpload, layoutPdfDownload } from './layout-pdf-storage.js';
export default { async fetch(request, env) {
  return new URL(request.url).pathname === '/api/layout-pdf/upload'
    ? layoutPdfUpload(request, env.LAYOUT_PDFS, env.PDF_UPLOAD_RATE_LIMITER)
    : layoutPdfDownload(request, env.LAYOUT_PDFS);
}};`
const mf = new Miniflare(convertV4MiniflareOptions({
  compatibilityDate: '2026-08-31',
  modules: [{ type: 'ESModule', path: 'worker.js', contents: worker }, { type: 'ESModule', path: 'layout-pdf-storage.js', contents: library }],
  r2Buckets: { LAYOUT_PDFS: 'puttbrothers-layout-pdfs-disposable-test' },
  ratelimits: { PDF_UPLOAD_RATE_LIMITER: { namespace_id: '2026102399', simple: { limit: 5, period: 60 } } },
}))
try {
  const pdf = new jsPDF()
  pdf.text('Cloudflare storage migration verification. Synthetic test only.', 10, 10)
  const original = new Uint8Array(pdf.output('arraybuffer'))
  const form = new FormData()
  form.append('file', new File([original], 'storage-verification.pdf', { type: 'application/pdf' }))
  const multipart = new Request('http://localhost/api/layout-pdf/upload', { method: 'POST', body: form })
  const response = await mf.dispatchFetch('http://localhost/api/layout-pdf/upload', {
    method: 'POST', headers: { Origin: 'http://localhost', 'CF-Connecting-IP': '127.0.0.1', 'Content-Type': multipart.headers.get('Content-Type') }, body: await multipart.arrayBuffer(),
  })
  assert.equal(response.status, 200, await response.clone().text())
  const uploaded = await response.json()
  assert.equal(uploaded.success, true)
  assert.match(uploaded.url, /^http:\/\/localhost\/layout-pdfs\/\d{4}\/\d{2}\/[a-f0-9-]+\.pdf$/)
  const downloaded = await mf.dispatchFetch(uploaded.url)
  assert.equal(downloaded.status, 200)
  assert.equal(downloaded.headers.get('Content-Type'), 'application/pdf')
  assert.match(downloaded.headers.get('Cache-Control'), /no-store/)
  assert.deepEqual(new Uint8Array(await downloaded.arrayBuffer()), original)
  const partial = await mf.dispatchFetch(uploaded.url, { headers: { Range: 'bytes=0-4' } })
  assert.equal(partial.status, 206)
  assert.equal(await partial.text(), '%PDF-')
  const head = await mf.dispatchFetch(uploaded.url, { method: 'HEAD' })
  assert.equal(head.status, 200)
  assert.equal(Number(head.headers.get('Content-Length')), original.length)
  assert.equal(await head.text(), '')
  const rejected = await mf.dispatchFetch('http://localhost/api/layout-pdf/upload', {
    method: 'POST', headers: { Origin: 'https://example.invalid', 'Content-Type': 'application/json' }, body: '{}',
  })
  assert.equal(rejected.status, 403)
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), backend: 'native local R2 and rate limiter', upload: 200, download: 200, range: 206, head: 200, originalBytes: original.length, sameBytes: true, externalCalls: 0 }, null, 2))
  if (process.argv.includes('--serve')) {
    console.log(JSON.stringify({ browserPdfUrl: new URL(new URL(uploaded.url).pathname, await mf.ready).href }))
    await new Promise(resolve => process.once('SIGINT', resolve))
  }
} finally {
  await mf.dispose()
}
