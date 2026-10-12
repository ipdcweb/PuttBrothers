import { readFileSync, readdirSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import ts from 'typescript'
import { assertPreviewConfig } from './preview-safety.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)
if (process.argv.slice(2).some(arg => arg !== '--publish')) throw new Error('Only --publish is supported')
const source = ts.parseConfigFileTextToJson('wrangler.jsonc', readFileSync('wrangler.jsonc', 'utf8'))
if (source.error) throw new Error('Invalid Wrangler configuration')
assertPreviewConfig(source.config)
// Explicit paths also support linked Windows worktrees owned by an earlier agent session.
const pointer = readFileSync('.git', 'utf8').trim()
if (!pointer.startsWith('gitdir: ')) throw new Error('Run this from the linked V2 worktree')
const gitDir = path.resolve(root, pointer.slice(8))
const git = (...args) => execFileSync('git', [`--git-dir=${gitDir}`, `--work-tree=${root}`, ...args], { encoding: 'utf8' }).trim()
if (git('branch', '--show-current') !== 'website-v2') throw new Error('Deploy only from website-v2')
if (!/github\.com[/:]ipdcweb\/PuttBrothers(?:\.git)?$/i.test(git('remote', 'get-url', 'origin'))) throw new Error('Unexpected source repository')
if (git('status', '--porcelain')) throw new Error('Commit and review the V2 changes before publishing')
if (git('rev-parse', 'HEAD') !== git('rev-parse', 'refs/remotes/origin/website-v2')) throw new Error('Push website-v2 before publishing')
function checkAssets(dir) {
  for (const name of readdirSync(dir)) {
    const file = path.join(dir, name), stat = statSync(file)
    if (stat.isDirectory()) checkAssets(file)
    else if (stat.size > 25 * 1024 * 1024) throw new Error(`Asset exceeds 25 MiB: ${file}`)
  }
}
checkAssets('public')
if (!process.argv.includes('--publish')) {
  console.log('Preview preflight passed. Pass --publish to test, build and deploy only puttbrothers-v2-preview.')
} else {
  const run = (...args) => execFileSync(process.execPath, args, { stdio: 'inherit' })
  run('--test', ...readdirSync('tests').filter(name => name.endsWith('.test.mjs')).map(name => `tests/${name}`))
  run('node_modules/vinext/dist/cli.js', 'build')
  assertPreviewConfig(JSON.parse(readFileSync('dist/server/wrangler.json', 'utf8')))
  const deployArgs = ['node_modules/wrangler/bin/wrangler.js', 'deploy', '--config', 'dist/server/wrangler.json', '--keep-vars', '--message', `website-v2 ${git('rev-parse', '--short', 'HEAD')} client preview`]
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(execFileSync(process.execPath, deployArgs, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }))
      break
    } catch (error) {
      const diagnostics = `${error.stdout ?? ''}\n${error.stderr ?? ''}`
      if (attempt === 3 || !/50[234]|Gateway Timeout|temporarily unavailable/i.test(diagnostics)) {
        console.error(diagnostics)
        throw error
      }
      console.warn(`Cloudflare temporary API failure. Retrying the same validated preview build (${attempt}/3).`)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}
