import assert from 'node:assert/strict'

const origin = 'https://puttbrothers-v2-preview.team-web-592.workers.dev'
const results = []
async function check(path, options = {}) {
  const response = await fetch(`${origin}${path}`, { ...options, signal: AbortSignal.timeout(30000), redirect: 'error' })
  return response
}
for (const path of ['/', '/products', '/about', '/contact', '/layout-planner']) {
  const response = await check(path)
  const html = await response.text()
  assert.equal(response.status, 200, path)
  assert.match(response.headers.get('content-type'), /text\/html/)
  assert.match(response.headers.get('x-robots-tag'), /noindex/)
  assert.doesNotMatch(html, /Application error: a (client|server)-side exception/i)
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1]
  assert.ok(title, `${path} has a title`)
  if (path === '/') assert.match(html, /pb-scroll-hero/)
  results.push({ path, status: response.status, title, noindex: true })
}
for (const path of ['/api/products/machines', '/api/planner/machines']) {
  const response = await check(path)
  const json = await response.json()
  assert.equal(response.status, 200, path)
  assert.ok(Array.isArray(json) ? json.length : Object.keys(json).length, `${path} is not empty`)
  results.push({ path, status: response.status, keys: Object.keys(json), count: json.machines?.length ?? json.length })
}
for (const variant of ['desktop', 'mobile']) {
  const path = `/videos/putt-brothers-scroll-v1-${variant}.mp4`
  const response = await check(path, { headers: { Range: 'bytes=0-1023' } })
  assert.equal(response.status, 206, `${path} supports seeking`)
  assert.equal((await response.arrayBuffer()).byteLength, 1024)
  results.push({ path, status: response.status, range: response.headers.get('content-range') })
}
for (const name of ['douglas-tonsic', 'imre-szenttornyay', 'joao-nascimento', 'luiz-tonsic']) {
  const path = `/images/v2/team/${name}-studio-v3.webp`
  const response = await check(path, { method: 'HEAD' })
  assert.equal(response.status, 200, path)
  assert.equal(response.headers.get('content-type'), 'image/webp')
  results.push({ path, status: response.status })
}
const catalogue = await check('/catalogues/puttbrothers-2026.pdf', { method: 'HEAD' })
assert.equal(catalogue.status, 200)
assert.equal(catalogue.headers.get('content-type'), 'application/pdf')
results.push({ path: '/catalogues/puttbrothers-2026.pdf', status: catalogue.status })
const robots = await check('/robots.txt')
assert.equal(robots.status, 200)
assert.match(await robots.text(), /Disallow:\s*\//)
// Empty requests only to the isolated preview; never send personal data/test leads.
for (const path of ['/api/contact', '/api/layout-pdf/upload']) {
  const response = await check(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
  const json = await response.json()
  assert.equal(response.status, 403, `${path} must be blocked before its real handler`)
  assert.equal(json.success, false)
  assert.match(json.message, /nothing was sent/i)
  results.push({ path, status: response.status, writesBlocked: true })
}
console.log(JSON.stringify({ origin, checkedAt: new Date().toISOString(), results }, null, 2))
