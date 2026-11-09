import { createRequire } from 'node:module'
import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve('next/package.json'))('sharp')
const masters = path.join(root, 'assets/v2-originals')
const output = path.join(root, 'public/images/v2/team')
await mkdir(masters, { recursive: true })
await mkdir(output, { recursive: true })

const portraits = [
  { name: 'imre-szenttornyay', generated: 'exec-ae96a0a5-b6bf-4a65-90f1-653b29722e7b.png' },
  { name: 'rubens-tonsic', generated: 'exec-6f82f223-f923-4a59-8bc9-085ae52680ae.png' },
]
for (const person of portraits) {
  const master = path.join(masters, `${person.name}-studio-v4.png`)
  if (process.argv.includes('--import-generated')) {
    await copyFile(path.join(process.env.USERPROFILE, '.codex/generated_images/01a1b0a1-a98a-7773-aebd-91e8e07e11e9', person.generated), master)
  }
  const result = await sharp(master)
    .resize(640, 640, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85, alphaQuality: 100, effort: 6 })
    .toFile(path.join(output, `${person.name}-studio-v4.webp`))
  console.log(JSON.stringify({ name: person.name, width: result.width, height: result.height, bytes: result.size }))
}
