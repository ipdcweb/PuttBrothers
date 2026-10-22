import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { assertProductionConfig } from './production-safety.mjs'
import { assertPreviewConfig } from './preview-safety.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)
const args = process.argv.slice(2)
if (args.some(arg => arg !== '--publish') || new Set(args).size !== args.length) throw new Error('Only --publish is supported')
const publish = args.includes('--publish')
const pointer = readFileSync('.git', 'utf8').trim()
if (!pointer.startsWith('gitdir: ')) throw new Error('Use the isolated V2 production worktree')
const gitDir = path.resolve(root, pointer.slice(8))
const git = (...argv) => execFileSync('git', [`--git-dir=${gitDir}`, `--work-tree=${root}`, ...argv], { encoding: 'utf8' }).trim()
if (git('branch', '--show-current') !== 'website-v2-production') throw new Error('Deploy only website-v2-production')
if (!/github\.com[/:]ipdcweb\/PuttBrothers(?:\.git)?$/i.test(git('remote', 'get-url', 'origin'))) throw new Error('Unexpected repository')
if (git('status', '--porcelain')) throw new Error('Commit and review production changes first')
const commit = git('rev-parse', 'HEAD')
if (publish && commit !== git('rev-parse', 'refs/remotes/origin/website-v2-production')) throw new Error('Push the exact reviewed production commit first')
function config(filename) {
  const parsed = ts.parseConfigFileTextToJson(filename, readFileSync(filename, 'utf8'))
  if (parsed.error) throw new Error(`Invalid configuration: ${filename}`)
  return parsed.config
}
const production = config('wrangler.jsonc')
assertProductionConfig(production)
assertPreviewConfig(config('wrangler.preview.jsonc'))
const robots = readFileSync('public/robots.txt', 'utf8')
assert.match(robots, /Allow:\s*\//)
assert.doesNotMatch(robots, /Disallow:\s*\//)
assert.match(readFileSync('app/layout.tsx', 'utf8'), /robots:\s*\{\s*index:\s*true,\s*follow:\s*true\s*\}/)
assert.doesNotMatch(readFileSync('public/_headers', 'utf8'), /X-Robots-Tag:\s*noindex/i)
function assets(directory) {
  for (const name of readdirSync(directory)) {
    const filename = path.join(directory, name), stat = statSync(filename)
    if (stat.isDirectory()) assets(filename)
    else if (stat.size > 25 * 1024 * 1024) throw new Error(`Asset exceeds 25 MiB: ${filename}`)
  }
}
assets('public')
const videos = JSON.parse(readFileSync('lib/scroll-video-files.json', 'utf8'))
for (const [url, bytes] of Object.entries(videos)) {
  assert.match(url, /^\/videos\/[a-z0-9-]+\.mp4$/)
  assert.equal(statSync(path.join('public', url.slice(1))).size, bytes)
}
if (publish) {
  const media = JSON.parse(readFileSync('assets/product-media-manifest.json', 'utf8'))
  assert.equal(media.files.length, 198)
  const receipts = path.resolve(root, '../WebsiteLocal_02/tmp/sync-product-media-production/catalog-20261023-v1/remote')
  for (const file of media.files) {
    const id = createHash('sha256').update(file.key).digest('hex')
    const receipt = JSON.parse(readFileSync(path.join(receipts, `${id}.json`), 'utf8'))
    assert.equal(receipt.account, production.account_id)
    assert.equal(receipt.bucket, 'puttbrothers-product-media-production')
    assert.equal(receipt.objectKey, `catalog-20261023-v1/${file.key}`)
    assert.equal(receipt.bytes, file.bytes)
    assert.equal(receipt.sha256, file.sha256)
    assert.equal(receipt.contentType, file.contentType)
    assert.match(receipt.verification, /SHA-256/)
    assert.ok(Number.isFinite(Date.parse(receipt.verifiedAt)))
  }
}
const run = (...argv) => execFileSync(process.execPath, argv, { stdio: 'inherit' })
run('scripts/prepare-carousel-images.mjs', '--verify')
run('--test', ...readdirSync('tests').filter(name => name.endsWith('.test.mjs')).map(name => `tests/${name}`))
run('node_modules/vinext/dist/cli.js', 'build')
assertProductionConfig(JSON.parse(readFileSync('dist/server/wrangler.json', 'utf8')), true)
if (git('rev-parse', 'HEAD') !== commit || git('status', '--porcelain')) throw new Error('Source changed during release validation')
console.log(`Validated V2 production ${commit}; preview remains a separate Worker and worktree.`)
if (publish) {
  run('node_modules/wrangler/bin/wrangler.js', 'deploy', '--config', 'dist/server/wrangler.json', '--keep-vars',
    '--message', `website-v2-production ${git('rev-parse', '--short', 'HEAD')} approved V2 promotion`)
} else console.log('Dry preflight complete; no deployment performed. Add --publish only for an authorized release.')
