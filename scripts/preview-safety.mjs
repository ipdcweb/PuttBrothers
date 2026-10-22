import assert from 'node:assert/strict'

export function assertPreviewConfig(config) {
  assert.equal(config.name, 'puttbrothers-v2-preview', 'Only the isolated V2 Worker may be deployed')
  assert.equal(config.account_id, '5929fdac0cd2d82d7378551cf4c20774', 'Unexpected Cloudflare account')
  assert.deepEqual(config.routes ?? [], [], 'No production or custom-domain routes are allowed')
  assert.equal(config.route, undefined)
  assert.equal(config.workers_dev, true)
  assert.equal(config.preview_urls, false)
  assert.deepEqual(config.assets.run_worker_first, ['/videos/*'], 'Only video assets require Worker-first routing')
  assert.deepEqual(config.vars, { PREVIEW_MODE: 'true' }, 'Preview must not write production data')
  assert.deepEqual(Object.keys(config.env ?? {}), [], 'Do not introduce undeclared deploy environments')
  assert.deepEqual((config.r2_buckets ?? []).map(({ binding, bucket_name }) => ({ binding, bucket_name })), [{ binding: 'PRODUCT_MEDIA', bucket_name: 'puttbrothers-product-media-review' }, { binding: 'LAYOUT_PDFS', bucket_name: 'puttbrothers-layout-pdfs-review' }], 'Only isolated read-only product media may be bound')
  assert.deepEqual(config.ratelimits, [{ name: 'PDF_UPLOAD_RATE_LIMITER', namespace_id: '2026102301', simple: { limit: 5, period: 60 } }], 'PDF upload limits must remain configured')
  for (const resource of ['services', 'd1_databases', 'secrets_store_secrets', 'send_email']) {
    assert.equal((config[resource] ?? []).length, 0, `Unexpected ${resource} binding`)
  }
}
