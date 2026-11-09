import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { assertPreviewConfig } from './preview-safety.mjs'
import { assertProductionConfig } from './production-safety.mjs'

export const PREVIEW_WORKER = 'puttbrothers-v2-preview'
export const PRODUCTION_WORKER = 'puttbrothers-com'
export const ACCOUNT_ID = '5929fdac0cd2d82d7378551cf4c20774'
export const NOINDEX = 'noindex, nofollow, noarchive'

export function assertTarget(target) {
  assert.ok(['preview', 'production'].includes(target), 'Choose preview or production explicitly')
  return target
}

export function parseReleaseArguments(args) {
  assert.ok(args.every(arg => arg === '--publish'), 'Only --publish is supported; no argument builds locally')
  assert.equal(new Set(args).size, args.length, 'Duplicate arguments are not allowed')
  return { publish: args.includes('--publish') }
}

export function targetConfigName(target) {
  return assertTarget(target) === 'preview' ? 'wrangler.preview.jsonc' : 'wrangler.jsonc'
}

export function assertTargetConfig(target, config, generated = false) {
  if (assertTarget(target) === 'production') assertProductionConfig(config, generated)
  else {
    assertPreviewConfig(config)
    assert.equal(config.main, generated ? 'index.js' : 'worker.ts')
    assert.equal(config.assets?.directory, generated ? '../client' : 'dist/client')
    assert.equal(config.assets?.binding, 'ASSETS')
    assert.equal(config.assets?.not_found_handling, 'none')
    assert.equal(config.cache?.enabled, false)
    assert.equal(config.compatibility_date, '2026-08-31')
    assert.deepEqual(config.compatibility_flags, ['nodejs_compat'])
  }
}

// Only generated static files change by target. Common source and form are never overwritten.
export function prepareTargetAssets(clientDirectory, target) {
  assertTarget(target)
  if (target === 'preview') {
    writeFileSync(path.join(clientDirectory, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
    const headersPath = path.join(clientDirectory, '_headers')
    const sourceHeaders = readFileSync(headersPath, 'utf8')
    assert.doesNotMatch(sourceHeaders, /X-Robots-Tag:\s*noindex/i,
      'Expected a fresh build from the common source, not a previously prepared preview')
    writeFileSync(headersPath, `${sourceHeaders.trimEnd()}\n\n/*\n  X-Robots-Tag: ${NOINDEX}\n`)
  }
  assertTargetAssets(clientDirectory, target)
}

export function assertTargetAssets(clientDirectory, target) {
  const robots = readFileSync(path.join(clientDirectory, 'robots.txt'), 'utf8')
  const headers = readFileSync(path.join(clientDirectory, '_headers'), 'utf8')
  if (assertTarget(target) === 'preview') {
    assert.match(robots, /^Disallow:\s*\/\s*$/m)
    assert.doesNotMatch(robots, /^Allow:/m)
    assert.match(headers, /\/\*\s*\n\s+X-Robots-Tag: noindex, nofollow, noarchive/)
  } else {
    assert.match(robots, /^Allow:\s*\/\s*$/m)
    assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m)
    assert.doesNotMatch(headers, /X-Robots-Tag:\s*noindex/i)
  }
}

export function assertPreviewReceipt(receipt, { commit, sourceFingerprint }) {
  assert.equal(receipt?.schemaVersion, 1, 'Missing or unsupported dev deployment receipt')
  assert.equal(receipt.status, 'deployed', 'A local build is not a dev deployment')
  assert.equal(receipt.target, 'preview')
  assert.equal(receipt.worker, PREVIEW_WORKER)
  assert.equal(receipt.accountId, ACCOUNT_ID)
  assert.match(receipt.versionId ?? '', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  assert.ok(Number.isFinite(Date.parse(receipt.deployedAt)), 'Invalid dev deployment time')
  assert.match(commit, /^[0-9a-f]{40}$/)
  assert.match(sourceFingerprint, /^[0-9a-f]{64}$/)
  assert.equal(receipt.commit, commit, 'Publish this exact commit to dev before promoting it')
  assert.equal(receipt.sourceFingerprint, sourceFingerprint, 'The website differs from the version published to dev')
}

export function parseDeployedVersion(output) {
  const version = /Current Version ID:\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(output)?.[1]
  assert.ok(version, 'Wrangler did not confirm a deployed version; no promotion receipt was recorded')
  return version
}
