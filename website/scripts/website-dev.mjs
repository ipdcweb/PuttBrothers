import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertTargetAssets, assertTargetConfig } from './release-safety.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
assert.ok(args.length === 0 || (args.length === 1 && args[0] === '--built'), 'Only --built is supported')
process.chdir(root)
const env = { ...process.env, PB_DEPLOY_TARGET: 'preview' }
delete env.CLOUDFLARE_ENV
if (args.includes('--built')) {
  assertTargetConfig('preview', JSON.parse(readFileSync('dist/server/wrangler.json', 'utf8')), true)
  assertTargetAssets(path.join(root, 'dist/client'), 'preview')
  execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'dev', '--config', 'dist/server/wrangler.json', '--port', '8792', '--local', '--persist-to', '.wrangler/state'], { cwd: root, env, stdio: 'inherit' })
} else {
  execFileSync(process.execPath, ['node_modules/vinext/dist/cli.js', 'dev', '--port', '3002'], { cwd: root, env, stdio: 'inherit' })
}
