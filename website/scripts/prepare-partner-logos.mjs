import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve('next/package.json'))('sharp')
const destination = path.join(root, 'public/images/v2/partners')
await mkdir(destination, { recursive: true })

const logos = [
  { source: 'public/images/v2/partners/ehp-interiors-logo.png', output: 'ehp-interiors-logo.webp' },
  { source: 'assets/v2-originals/one-grid-black-cutout.png', output: 'one-grid-black-logo.webp' },
  { source: 'public/images/v2/partners/ipdc-logo.png', output: 'ipdc-logo.webp' },
]
for (const logo of logos) {
  const mark = await sharp(path.join(root, logo.source))
    .trim({ threshold: 5 })
    .resize({ width: 560, height: 110, fit: 'inside' })
    .png()
    .toBuffer()
  const { width, height } = await sharp(mark).metadata()
  const result = await sharp({ create: { width: 600, height: 180, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: mark, left: Math.floor((600 - width) / 2), top: Math.floor((180 - height) / 2) }])
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(path.join(destination, logo.output))
  console.log(JSON.stringify({ file: logo.output, width: result.width, height: result.height, markWidth: width, markHeight: height, bytes: result.size }))
}
