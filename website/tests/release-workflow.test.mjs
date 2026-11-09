import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import ts from 'typescript'
import { withReleaseLock } from '../scripts/release-lock.mjs'
import {
  ACCOUNT_ID, PREVIEW_WORKER, assertPreviewReceipt, assertTargetAssets,
  assertTargetConfig, parseDeployedVersion, parseReleaseArguments,
  prepareTargetAssets, targetConfigName,
} from '../scripts/release-safety.mjs'

const commit = 'a'.repeat(40)
const sourceFingerprint = 'b'.repeat(64)
const versionId = '1a234567-1234-1234-1234-123456789abc'
const receipt = {
  schemaVersion: 1, status: 'deployed', target: 'preview', accountId: ACCOUNT_ID,
  worker: PREVIEW_WORKER, commit, sourceFingerprint, versionId,
  deployedAt: '2026-11-06T00:00:00.000Z',
}

test('local builds do not imply publication and unknown publish arguments fail closed', () => {
  assert.deepEqual(parseReleaseArguments([]), { publish: false })
  assert.deepEqual(parseReleaseArguments(['--publish']), { publish: true })
  for (const args of [['--publish', '--publish'], ['--force'], ['--skip-tests'], ['--publish', '--target=production']]) {
    assert.throws(() => parseReleaseArguments(args))
  }
  assert.equal(targetConfigName('preview'), 'wrangler.preview.jsonc')
  assert.equal(targetConfigName('production'), 'wrangler.jsonc')
  assert.throws(() => targetConfigName('unexpected'))
})

test('each target accepts only its own source and generated resources', () => {
  const configs = Object.fromEntries(['preview', 'production'].map(target => [target,
    ts.parseConfigFileTextToJson(targetConfigName(target), readFileSync(new URL(`../${targetConfigName(target)}`, import.meta.url), 'utf8')).config,
  ]))
  for (const target of ['preview', 'production']) {
    assertTargetConfig(target, configs[target])
    const generated = { ...configs[target], main: 'index.js', assets: { ...configs[target].assets, directory: '../client' } }
    assertTargetConfig(target, generated, true)
    assert.throws(() => assertTargetConfig(target, configs[target === 'preview' ? 'production' : 'preview']))
    assert.throws(() => assertTargetConfig(target, { ...generated, assets: { ...generated.assets, directory: '../../public' } }, true))
  }
})

test('dev static assets are noindex without changing the common public source', t => {
  const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), 'pb-release-assets-'))
  t.after(() => {
    assert.equal(path.dirname(path.resolve(temporaryRoot)), path.resolve(os.tmpdir()))
    assert.ok(path.basename(temporaryRoot).startsWith('pb-release-assets-'))
    rmSync(temporaryRoot, { recursive: true })
  })
  const original = {
    robots: readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8'),
    headers: readFileSync(new URL('../public/_headers', import.meta.url), 'utf8'),
  }
  for (const target of ['preview', 'production']) {
    const client = path.join(temporaryRoot, target)
    mkdirSync(client)
    writeFileSync(path.join(client, 'robots.txt'), original.robots)
    writeFileSync(path.join(client, '_headers'), original.headers)
    prepareTargetAssets(client, target)
    assertTargetAssets(client, target)
    assert.throws(() => assertTargetAssets(client, target === 'preview' ? 'production' : 'preview'))
    if (target === 'preview') {
      assert.match(readFileSync(path.join(client, '_headers'), 'utf8'), /Cache-Control:/)
      assert.throws(() => prepareTargetAssets(client, 'preview'), /fresh build/)
    } else {
      assert.equal(readFileSync(path.join(client, 'robots.txt'), 'utf8'), original.robots)
      assert.equal(readFileSync(path.join(client, '_headers'), 'utf8'), original.headers)
    }
  }
  assert.equal(readFileSync(new URL('../public/robots.txt', import.meta.url), 'utf8'), original.robots)
  assert.equal(readFileSync(new URL('../public/_headers', import.meta.url), 'utf8'), original.headers)
})

test('promotion requires the exact dev source commit and fingerprint', () => {
  assertPreviewReceipt(receipt, { commit, sourceFingerprint })
  assert.throws(() => assertPreviewReceipt(receipt, { commit: 'c'.repeat(40), sourceFingerprint }), /exact commit/)
  assert.throws(() => assertPreviewReceipt(receipt, { commit, sourceFingerprint: 'd'.repeat(64) }), /differs/)
})

test('local, incomplete, wrong-account or production receipts cannot authorize promotion', () => {
  for (const invalid of [
    null, {}, { ...receipt, status: 'built' }, { ...receipt, target: 'production' },
    { ...receipt, worker: 'puttbrothers-com' }, { ...receipt, accountId: 'other' },
    { ...receipt, versionId: undefined }, { ...receipt, deployedAt: 'not-a-date' },
  ]) assert.throws(() => assertPreviewReceipt(invalid, { commit, sourceFingerprint }))
})

test('only a confirmed deployed Worker version can create a release receipt', () => {
  assert.equal(parseDeployedVersion(`Uploaded Worker\nDeployed Worker\nCurrent Version ID: ${versionId}\n`), versionId)
  assert.throws(() => parseDeployedVersion('Build complete; no deployment performed'))
  assert.throws(() => parseDeployedVersion('Uploaded Worker; deployment failed'))
})

test('a shared release lock rejects overlapping targets and is released after success or failure', async t => {
  const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), 'pb-release-lock-'))
  t.after(() => {
    assert.equal(path.dirname(path.resolve(temporaryRoot)), path.resolve(os.tmpdir()))
    assert.ok(path.basename(temporaryRoot).startsWith('pb-release-lock-'))
    rmSync(temporaryRoot, { recursive: true })
  })
  const lockPath = path.join(temporaryRoot, 'releases/build.lock')
  await withReleaseLock(lockPath, 'preview', async () => {
    assert.equal(JSON.parse(readFileSync(lockPath, 'utf8')).target, 'preview')
    await assert.rejects(withReleaseLock(lockPath, 'production', () => assert.fail('Concurrent build ran')), /Another website build/)
    assert.ok(existsSync(lockPath), 'A rejected competitor must not remove the active lock')
  })
  assert.ok(!existsSync(lockPath))
  await assert.rejects(withReleaseLock(lockPath, 'production', () => { throw new Error('simulated build failure') }), /simulated build failure/)
  assert.ok(!existsSync(lockPath), 'Failed builds release their lock')
  assert.equal(await withReleaseLock(lockPath, 'preview', () => 'ready'), 'ready')
})
