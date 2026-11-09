import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// Dev and official share dist: hold this lock from before the fresh build until
// after deployment/receipt, so a second invocation cannot replace the artifacts.
export async function withReleaseLock(lockPath, target, action) {
  mkdirSync(path.dirname(lockPath), { recursive: true })
  const token = randomUUID()
  try {
    writeFileSync(lockPath, JSON.stringify({ token, target, pid: process.pid, startedAt: new Date().toISOString() }), { flag: 'wx' })
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(`Another website build or publication holds ${lockPath}. Wait for it to finish. If it was interrupted, verify that its process has ended before removing that lock.`)
    }
    throw error
  }
  try {
    return await action()
  } finally {
    const owner = JSON.parse(readFileSync(lockPath, 'utf8'))
    assert.equal(owner.token, token, 'The website release lock changed ownership; refusing to remove it')
    unlinkSync(lockPath)
  }
}
