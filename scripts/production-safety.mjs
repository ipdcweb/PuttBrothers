import assert from 'node:assert/strict'

export const PRODUCTION_ROUTES = ['puttbrothers.com', 'www.puttbrothers.com', 'puttbrothers.ch',
  'www.puttbrothers.ch', 'puttbrothers.de', 'www.puttbrothers.de', 'puttbrothers.uk', 'www.puttbrothers.uk']
  .map(host => ({ pattern: `${host}/*`, zone_name: host.replace(/^www\./, '') }))

export function assertProductionConfig(config, generated = false) {
  assert.equal(config.name, 'puttbrothers-com', 'Deploy only the official Putt Brothers Worker')
  assert.equal(config.account_id, '5929fdac0cd2d82d7378551cf4c20774')
  assert.deepEqual(config.routes, PRODUCTION_ROUTES, 'Keep exactly the eight existing production routes')
  assert.equal(config.route, undefined)
  assert.equal(config.workers_dev, false)
  assert.equal(config.preview_urls, false)
  assert.equal(config.compatibility_date, '2026-08-31')
  assert.deepEqual(config.compatibility_flags, ['nodejs_compat'])
  assert.deepEqual(config.vars, { PREVIEW_MODE: 'false' }, 'Official form writes must be enabled')
  assert.equal(config.main, generated ? 'index.js' : 'worker.ts')
  assert.equal(config.assets?.directory, generated ? '../client' : 'dist/client')
  assert.equal(config.assets?.binding, 'ASSETS')
  assert.equal(config.assets?.not_found_handling, 'none')
  assert.deepEqual(config.assets?.run_worker_first, ['/videos/*'])
  assert.equal(config.cache?.enabled, false)
  assert.deepEqual(Object.keys(config.env ?? {}), [])
  assert.deepEqual((config.r2_buckets ?? []).map(({ binding, bucket_name }) => ({ binding, bucket_name })), [
    { binding: 'PRODUCT_MEDIA', bucket_name: 'puttbrothers-product-media-production' },
    { binding: 'LAYOUT_PDFS', bucket_name: 'puttbrothers-layout-pdfs-production' },
  ])
  assert.deepEqual(config.ratelimits, [{ name: 'PDF_UPLOAD_RATE_LIMITER', namespace_id: '2026102302',
    simple: { limit: 5, period: 60 } }])
  for (const resource of ['services', 'd1_databases', 'secrets_store_secrets', 'send_email']) {
    assert.equal((config[resource] ?? []).length, 0, `Unexpected ${resource} binding`)
  }
}
