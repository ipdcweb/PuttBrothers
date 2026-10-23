import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const manifest = JSON.parse(readFileSync(new URL('../lib/catalogue-pages.json', import.meta.url), 'utf8'))
const digest = data => createHash('sha256').update(data).digest('hex')

for (const [id, expectedPages] of [['minigolf', 33], ['tablegolf', 12]]) {
  test(`${id} reader has every page and responsive WebP exports from the current PDF`, () => {
    const catalogue = manifest[id]
    const pdf = readFileSync(new URL(`../public${catalogue.pdf}`, import.meta.url))
    assert.equal(digest(pdf), catalogue.sourceSha256, 'PDF changed: regenerate catalogue pages')
    assert.equal(catalogue.pages.length, expectedPages)
    const paths = new Set()
    for (const page of catalogue.pages) {
      for (const width of [900, 1800]) {
        const variant = page[width]
        assert.match(variant.src, /^\/images\/catalogues\/[a-z]+-[a-f0-9]{10}\/page-\d{2}-(900|1800)\.webp$/)
        assert.ok(!paths.has(variant.src), 'Each page must have a unique image')
        paths.add(variant.src)
        const image = readFileSync(new URL(`../public${variant.src}`, import.meta.url))
        assert.equal(image.toString('ascii', 0, 4), 'RIFF')
        assert.equal(image.toString('ascii', 8, 12), 'WEBP')
        assert.equal(image.length, variant.bytes)
        assert.equal(digest(image), variant.sha256)
        assert.ok(variant.width > 0 && variant.width <= width)
        assert.ok(variant.height > 0 && variant.height <= width)
      }
      assert.ok(Math.abs(page['900'].width / page['900'].height - page['1800'].width / page['1800'].height) < 0.003, 'Responsive variants retain the same page proportion')
    }
  })
}
