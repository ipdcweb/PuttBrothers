import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { withReleaseLock } from './release-lock.mjs'
import {
  ACCOUNT_ID, PREVIEW_WORKER, PRODUCTION_WORKER, assertPreviewReceipt,
  assertTarget, assertTargetConfig, parseDeployedVersion, parseReleaseArguments,
  prepareTargetAssets, targetConfigName,
} from './release-safety.mjs'

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = path.resolve(webRoot, '..')

function gitClient() {
  const pointer = readFileSync(path.join(repositoryRoot, '.git'), 'utf8').trim()
  assert.ok(pointer.startsWith('gitdir: '), 'Use the canonical WebsiteLocal Git worktree')
  const gitDir = path.resolve(repositoryRoot, pointer.slice(8))
  return (...args) => execFileSync('git', [`--git-dir=${gitDir}`, `--work-tree=${repositoryRoot}`, ...args], {
    cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  }).trim()
}

function readConfig(filename) {
  const parsed = ts.parseConfigFileTextToJson(filename, readFileSync(path.join(webRoot, filename), 'utf8'))
  assert.equal(parsed.error, undefined, `Invalid configuration: ${filename}`)
  return parsed.config
}

function websiteFingerprint(git) {
  // Git supplies common source plus new, non-ignored files during a local build.
  // Caches, private state and editing masters stay outside release fingerprints.
  const files = [...new Set(git('ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', 'website').split('\0').filter(Boolean))].sort()
  assert.ok(files.some(file => file === 'website/package.json'), 'Website sources not found in the canonical worktree')
  const digest = createHash('sha256')
  for (const relative of files) {
    assert.ok(relative.startsWith('website/') && !relative.split('/').includes('..'), 'Unexpected source path')
    assert.ok(!/(?:^|\/)\.(?:env|dev\.vars)(?:\.|$)/.test(relative) || relative.endsWith('.example'), 'Private environment file must not be tracked')
    const filename = path.join(repositoryRoot, relative)
    digest.update(`${relative}\0`)
    if (!existsSync(filename)) { digest.update('missing\0'); continue }
    assert.ok(lstatSync(filename).isFile(), `Release source must be a regular file: ${relative}`)
    digest.update(createHash('sha256').update(readFileSync(filename)).digest())
  }
  return digest.digest('hex')
}

function assertPublishable(git) {
  assert.match(git('remote', 'get-url', 'origin'), /github\.com[/:]ipdcweb\/PuttBrothers(?:\.git)?$/i, 'Unexpected source repository')
  assert.equal(git('status', '--porcelain'), '', 'Commit and review the changes before publication')
  const upstream = git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}')
  assert.ok(upstream.startsWith('origin/'), 'Configure the reviewed branch upstream on origin')
  assert.equal(git('rev-parse', 'HEAD'), git('rev-parse', '@{upstream}'), 'Push the exact reviewed commit before publication')
}

function checkAssets(directory) {
  for (const name of readdirSync(directory)) {
    const filename = path.join(directory, name), stat = lstatSync(filename)
    assert.ok(!stat.isSymbolicLink(), `Public assets must not link outside the project: ${filename}`)
    if (stat.isDirectory()) checkAssets(filename)
    else assert.ok(stat.size <= 25 * 1024 * 1024, `Asset exceeds 25 MiB: ${filename}`)
  }
}

function verifyMediaReceipts(target, config) {
  const media = JSON.parse(readFileSync(path.join(webRoot, 'assets/product-media-manifest.json'), 'utf8'))
  assert.equal(media.files.length, 198)
  const production = target === 'production'
  const receipts = path.join(webRoot, 'tmp', production ? 'sync-product-media-production' : 'sync-product-media', 'catalog-20261023-v1', 'remote')
  for (const file of media.files) {
    const id = createHash('sha256').update(file.key).digest('hex')
    const receipt = JSON.parse(readFileSync(path.join(receipts, `${id}.json`), 'utf8'))
    assert.equal(receipt.account, config.account_id)
    assert.equal(receipt.bucket, production ? 'puttbrothers-product-media-production' : 'puttbrothers-product-media-review')
    assert.equal(receipt.objectKey, `catalog-20261023-v1/${file.key}`)
    assert.equal(receipt.bytes, file.bytes)
    assert.equal(receipt.sha256, file.sha256)
    assert.equal(receipt.contentType, file.contentType)
    assert.match(receipt.verification, /SHA-256/)
    assert.ok(Number.isFinite(Date.parse(receipt.verifiedAt)))
  }
}

export async function runWebsiteRelease(target, args) {
  assertTarget(target)
  parseReleaseArguments(args)
  return withReleaseLock(path.join(webRoot, 'tmp/releases/build.lock'), target, () => runWebsiteReleaseLocked(target, args))
}

async function runWebsiteReleaseLocked(target, args) {
  assertTarget(target)
  const { publish } = parseReleaseArguments(args)
  assert.equal(path.basename(webRoot), 'website')
  assert.equal(path.basename(repositoryRoot), 'WebsiteLocal')
  process.chdir(webRoot)
  const git = gitClient()
  const commit = git('rev-parse', 'HEAD')
  const sourceFingerprint = websiteFingerprint(git)
  const config = readConfig(targetConfigName(target))
  assertTargetConfig('production', readConfig('wrangler.jsonc'))
  assertTargetConfig('preview', readConfig('wrangler.preview.jsonc'))
  const receiptDirectory = path.join(webRoot, 'tmp/releases')
  if (publish) {
    assertPublishable(git)
    verifyMediaReceipts(target, config)
    if (target === 'production') {
      const receiptPath = path.join(receiptDirectory, 'dev-latest.json')
      assert.ok(existsSync(receiptPath), 'Publish and review this version on dev before production')
      assertPreviewReceipt(JSON.parse(readFileSync(receiptPath, 'utf8')), { commit, sourceFingerprint })
    }
  }

  checkAssets(path.join(webRoot, 'public'))
  const videos = JSON.parse(readFileSync(path.join(webRoot, 'lib/scroll-video-files.json'), 'utf8'))
  for (const [url, bytes] of Object.entries(videos)) {
    assert.match(url, /^\/videos\/[a-z0-9-]+\.mp4$/)
    assert.equal(statSync(path.join(webRoot, 'public', url.slice(1))).size, bytes)
  }
  const env = { ...process.env, PB_DEPLOY_TARGET: target }
  delete env.CLOUDFLARE_ENV
  const run = (...argv) => execFileSync(process.execPath, argv, { cwd: webRoot, env, stdio: 'inherit' })
  run('scripts/prepare-carousel-images.mjs', '--verify')
  // Local builds are available independently. Publication always runs the full
  // suite before its fresh build; there is no skip-test publication flag.
  if (publish) run('--test', ...readdirSync(path.join(webRoot, 'tests')).filter(name => name.endsWith('.test.mjs')).map(name => `tests/${name}`))
  run('node_modules/vinext/dist/cli.js', 'build')
  const generated = JSON.parse(readFileSync(path.join(webRoot, 'dist/server/wrangler.json'), 'utf8'))
  assertTargetConfig(target, generated, true)
  prepareTargetAssets(path.join(webRoot, 'dist/client'), target)
  assert.equal(git('rev-parse', 'HEAD'), commit, 'Commit changed during the build')
  assert.equal(websiteFingerprint(git), sourceFingerprint, 'Website source changed during the build')
  if (!publish) {
    console.log(`Built and validated ${target} from the single website source. No deployment or dev approval receipt created.`)
    return
  }
  assertPublishable(git)
  const output = execFileSync(process.execPath, [
    'node_modules/wrangler/bin/wrangler.js', 'deploy', '--config', 'dist/server/wrangler.json', '--keep-vars',
    '--message', `WebsiteLocal ${commit.slice(0, 12)} ${target === 'preview' ? 'dev review' : 'approved promotion'}`,
  ], { cwd: webRoot, env, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  console.log(output)
  const versionId = parseDeployedVersion(output)
  const receipt = {
    schemaVersion: 1, status: 'deployed', target, accountId: ACCOUNT_ID,
    worker: target === 'preview' ? PREVIEW_WORKER : PRODUCTION_WORKER,
    commit, sourceFingerprint, versionId, deployedAt: new Date().toISOString(),
  }
  mkdirSync(receiptDirectory, { recursive: true })
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`
  writeFileSync(path.join(receiptDirectory, `${target}-${commit}-${versionId}.json`), receiptText, { flag: 'wx' })
  writeFileSync(path.join(receiptDirectory, target === 'preview' ? 'dev-latest.json' : 'production-latest.json'), receiptText)
  console.log(`Recorded ${target} deployment ${versionId}. ${target === 'preview' ? 'Production promotion still requires Rafael\'s approval.' : 'Dev remains independently hosted.'}`)
}
