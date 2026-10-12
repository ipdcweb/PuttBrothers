import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../lib/scroll-hero.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const exports = {}
new Function('exports', compiled)(exports)
const { mediaTimeForProgress, chapterPresentation, heroChapters } = exports
const duration = 28.125

test('the poster opening holds before the film, and the final frame holds before unpinning', () => {
  for (const p of [-1, 0, 0.02, 0.035]) assert.equal(mediaTimeForProgress(p, duration), 0)
  const lastFrame = duration - 1 / 24
  for (const p of [0.94, 0.97, 1, 2]) assert.ok(Math.abs(mediaTimeForProgress(p, duration) - lastFrame) < 1e-10)
  assert.equal(mediaTimeForProgress(0.5, 0), 0)
})

test('native scroll maps monotonically to bounded media time and reverses without time-based playback', () => {
  let previous = 0
  const forward = []
  for (let i = 0; i <= 1000; i++) {
    const current = mediaTimeForProgress(i / 1000, duration)
    assert.ok(current >= previous && current < duration)
    forward.push(current)
    previous = current
  }
  for (let i = 1000; i >= 0; i--) assert.equal(mediaTimeForProgress(i / 1000, duration), forward[i])
})

test('approved scenes select the matching message without overlapping readable chapters', () => {
  for (const [time, id] of [[4, 'minigolf'], [10, 'destination'], [15, 'racing'], [20, 'space-z'], [27, 'project']]) {
    const visible = heroChapters.filter((_chapter, i) => chapterPresentation(time, i).opacity >= 0.5)
    assert.deepEqual(visible.map(chapter => chapter.id), [id])
  }
  for (let frame = 0; frame < 675; frame++) {
    const states = heroChapters.map((_chapter, i) => chapterPresentation(frame / 24, i))
    assert.ok(states.every(state => state.opacity >= 0 && state.opacity <= 1))
    assert.ok(states.filter(state => state.opacity >= 0.5).length <= 1)
  }
})

test('final CTA stays readable on the last frame and points to the existing contact flow', () => {
  const last = heroChapters.length - 1
  assert.equal(chapterPresentation(duration - 1 / 24, last).opacity, 1)
  assert.equal(chapterPresentation(duration - 1 / 24, last).offset, 0)
  assert.equal(heroChapters[last].href, '/contact#contact')
  assert.ok(heroChapters.every(chapter => !/[\u2013\u2014]/u.test(`${chapter.title} ${chapter.accent} ${chapter.body}`)))
})
