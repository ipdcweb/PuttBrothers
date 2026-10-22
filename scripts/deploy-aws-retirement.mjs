import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)
const args = process.argv.slice(2)
if (args.some(arg => !['--review', '--production', '--publish'].includes(arg)) ||
  args.filter(arg => ['--review', '--production'].includes(arg)).length !== 1 ||
  new Set(args).size !== args.length) {
  throw new Error('Use exactly one of --review or --production; add --publish only for explicit deployment.')
}
const review = args.includes('--review')
const publish = args.includes('--publish')
const account = '5929fdac0cd2d82d7378551cf4c20774'
const workerName = review ? 'puttbrothers-aws-retirement-review' : 'puttbrothers-com'
const release = 'catalog-20261023-v1'
const routes = ['puttbrothers.com', 'www.puttbrothers.com', 'puttbrothers.ch', 'www.puttbrothers.ch',
  'puttbrothers.de', 'www.puttbrothers.de', 'puttbrothers.uk', 'www.puttbrothers.uk']
  .map(host => ({ pattern: `${host}/*`, zone_name: host.replace(/^www\./, '') }))
const pointer = readFileSync('.git', 'utf8').trim()
if (!pointer.startsWith('gitdir: ')) throw new Error('Run only from the isolated linked AWS retirement worktree.')
const gitDir = path.resolve(root, pointer.slice(8))
const git = (...argv) => execFileSync('git', [`--git-dir=${gitDir}`, `--work-tree=${root}`, ...argv], { encoding: 'utf8' }).trim()
if (git('branch', '--show-current') !== 'aws-retirement-production') throw new Error('Unexpected source branch.')
if (!/github\.com[/:]ipdcweb\/PuttBrothers(?:\.git)?$/i.test(git('remote', 'get-url', 'origin'))) {
  throw new Error('Unexpected source repository.')
}
if (git('status', '--porcelain')) throw new Error('Commit and review all source changes before running this release guard.')
const commit = git('rev-parse', 'HEAD')
if (publish && commit !== git('rev-parse', 'refs/remotes/origin/aws-retirement-production')) {
  throw new Error('Push the reviewed retirement branch before publishing.')
}

function parseConfig(filename) {
  const parsed = ts.parseConfigFileTextToJson(filename, readFileSync(filename, 'utf8'))
  if (parsed.error) throw new Error(`Invalid configuration: ${filename}`)
  return parsed.config
}
function assertConfig(config, isReview, generated = false) {
  assert.equal(config.name, isReview ? 'puttbrothers-aws-retirement-review' : 'puttbrothers-com')
  assert.equal(config.account_id, account)
  assert.deepEqual(config.routes, isReview ? [] : routes)
  assert.equal(config.cache?.enabled, false)
  assert.equal(config.vars?.PREVIEW_MODE, isReview ? 'true' : 'false')
  assert.equal(config.compatibility_date, '2026-08-31')
  assert.deepEqual(config.compatibility_flags, ['nodejs_compat'])
  assert.equal(config.assets?.binding, 'ASSETS')
  assert.equal(config.assets?.not_found_handling, 'none')
  assert.equal(config.main, generated ? 'index.js' : 'worker.ts')
  assert.equal(config.assets?.directory, generated ? '../client' : 'dist/client')
  assert.deepEqual(config.r2_buckets?.map(({ binding, bucket_name }) => ({ binding, bucket_name })), [
    { binding: 'PRODUCT_MEDIA', bucket_name: 'puttbrothers-product-media-production' },
    { binding: 'LAYOUT_PDFS', bucket_name: isReview ? 'puttbrothers-layout-pdfs-review' : 'puttbrothers-layout-pdfs-production' },
  ])
  assert.deepEqual(config.ratelimits, [{ name: 'PDF_UPLOAD_RATE_LIMITER',
    namespace_id: isReview ? '2026102303' : '2026102302', simple: { limit: 5, period: 60 } }])
  if (isReview) {
    assert.equal(config.workers_dev, true)
    assert.equal(config.preview_urls, false)
  }
  if (config.env && Object.keys(config.env).length) throw new Error('Unexpected alternate deployment environment.')
}
const production = parseConfig('wrangler.jsonc')
const selected = parseConfig(review ? 'wrangler.review.jsonc' : 'wrangler.jsonc')
assertConfig(production, false)
assertConfig(selected, review)

function checkAssets(directory) {
  for (const name of readdirSync(directory)) {
    const filename = path.join(directory, name)
    const stat = statSync(filename)
    if (stat.isDirectory()) checkAssets(filename)
    else if (stat.size > 25 * 1024 * 1024) throw new Error(`Asset exceeds 25 MiB: ${filename}`)
  }
}
checkAssets('public')
if (publish) {
  // These receipts are created only after remote object download, byte count,
  // MIME and SHA-256 verification by the dedicated production-media sync.
  const media = JSON.parse(readFileSync('assets/product-media-manifest.json', 'utf8'))
  assert.equal(media.files.length, 198)
  const receipts = path.resolve(root, '../WebsiteLocal_02/tmp/sync-product-media-production', release, 'remote')
  for (const file of media.files) {
    const id = createHash('sha256').update(file.key).digest('hex')
    const receipt = JSON.parse(readFileSync(path.join(receipts, `${id}.json`), 'utf8'))
    assert.equal(receipt.account, account)
    assert.equal(receipt.bucket, 'puttbrothers-product-media-production')
    assert.equal(receipt.objectKey, `${release}/${file.key}`)
    assert.equal(receipt.sha256, file.sha256)
    assert.equal(receipt.bytes, file.bytes)
    assert.equal(receipt.contentType, file.contentType)
    assert.match(receipt.verification, /SHA-256/)
    assert.ok(Number.isFinite(Date.parse(receipt.verifiedAt)))
  }
}
const run = (...argv) => execFileSync(process.execPath, argv, { stdio: 'inherit' })
run('--test', ...readdirSync('tests').filter(name => name.endsWith('.test.mjs')).map(name => `tests/${name}`))
run('node_modules/vinext/dist/cli.js', 'build')
const built = JSON.parse(readFileSync('dist/server/wrangler.json', 'utf8'))
assertConfig(built, false, true)
let deployConfig = 'dist/server/wrangler.json'
if (review) {
  // Keep generated module/assets paths beside the original generated config.
  // Only reviewed deployment settings differ; no source config is rewritten.
  const isolated = { ...built, name: selected.name, topLevelName: selected.name,
    account_id: selected.account_id, routes: [], vars: selected.vars,
    workers_dev: true, preview_urls: false, r2_buckets: selected.r2_buckets,
    ratelimits: selected.ratelimits, configPath: path.resolve('wrangler.review.jsonc'),
    userConfigPath: path.resolve('wrangler.review.jsonc') }
  assertConfig(isolated, true, true)
  deployConfig = 'dist/server/wrangler.review.json'
  writeFileSync(deployConfig, `${JSON.stringify(isolated, null, 2)}\n`)
}
if (git('rev-parse', 'HEAD') !== commit || git('status', '--porcelain')) throw new Error('Source changed during release validation.')
console.log(`Validated ${workerName} from ${commit}; generated configuration ${deployConfig}.`)
if (!publish) {
  console.log('Dry preflight complete. No deployment performed. Add --publish only with release authorization.')
} else {
  run('node_modules/wrangler/bin/wrangler.js', 'deploy', '--config', deployConfig, '--keep-vars',
    '--message', `AWS retirement ${git('rev-parse', '--short', 'HEAD')} ${review ? 'isolated review' : 'V1 backend migration'}`)
}
