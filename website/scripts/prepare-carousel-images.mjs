#!/usr/bin/env node
/**
 * Reproduce the carousel's small transparent WebP derivatives from the verified
 * original PNG copies. This never changes originals, R2, or the migration ledger.
 *
 * node scripts/prepare-carousel-images.mjs
 *   Verify all 78 source SHA-256 hashes before generating versioned derivatives.
 * node scripts/prepare-carousel-images.mjs --verify
 *   Check every deployed derivative's hash, dimensions and alpha channel offline.
 *   Original PNG copies are not required for this check.
 */
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_ROOT = path.join(ROOT, 'public')
const OUTPUT_PREFIX = '/images/products/carousel-v1/'
const OUTPUT_ROOT = path.join(PUBLIC_ROOT, 'images', 'products', 'carousel-v1')
const MANIFEST_PATH = path.join(ROOT, 'assets', 'carousel-images-manifest.json')
const SOURCE_MANIFEST_PATH = path.join(ROOT, 'assets', 'product-media-manifest.json')
const CATALOG_PATH = path.join(ROOT, 'lib', 'catalog', 'machines.json')
const ORIGINAL_ROOT = path.join(ROOT, 'tmp', 'product-media')
const SPECS = [
  { variant: 'mobile', width: 300, quality: 82, filename: 'mobile-300.webp' },
  { variant: 'desktop', width: 720, quality: 84, filename: 'desktop-720.webp' },
]
const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve('next/package.json'))('sharp')
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const json = (value) => `${JSON.stringify(value, null, 2)}\n`
const args = process.argv.slice(2)
if (args.length > 1 || (args.length && args[0] !== '--verify')) {
  throw new Error('Usage: node scripts/prepare-carousel-images.mjs [--verify]')
}

function imagePath(folder, spec) {
  if (!/^[A-Za-z0-9_-]+$/.test(folder)) throw new Error(`Unsafe product folder: ${folder}`)
  return `${OUTPUT_PREFIX}${folder}/${spec.filename}`
}
function outputFile(image) {
  const spec = SPECS.find((entry) => entry.variant === image.variant)
  if (!spec || image.path !== imagePath(image.folderName, spec)) throw new Error(`Unexpected derivative path: ${image.path}`)
  const filename = path.resolve(PUBLIC_ROOT, `.${image.path}`)
  if (!filename.startsWith(`${OUTPUT_ROOT}${path.sep}`)) throw new Error(`Outside derivative folder: ${image.path}`)
  return filename
}
async function atomicWrite(filename, bytes) {
  await mkdir(path.dirname(filename), { recursive: true })
  await writeFile(`${filename}.new`, bytes)
  await rename(`${filename}.new`, filename)
}
function summary(files) {
  const sourceBytes = files.reduce((total, file) => total + file.sourceBytes, 0)
  const bytes = files.reduce((total, file) => total + file.bytes, 0)
  const variants = Object.fromEntries(SPECS.map((spec) => {
    const group = files.filter((file) => file.variant === spec.variant)
    const originalBytes = group.reduce((total, file) => total + file.sourceBytes, 0)
    const derivativeBytes = group.reduce((total, file) => total + file.bytes, 0)
    return [spec.variant, {
      files: group.length, bytes: derivativeBytes, sourceBytes: originalBytes,
      minBytes: Math.min(...group.map((file) => file.bytes)),
      maxBytes: Math.max(...group.map((file) => file.bytes)),
      reductionPercent: Number((100 * (1 - derivativeBytes / originalBytes)).toFixed(2)),
    }]
  }))
  return {
    files: files.length, bytes, sourceBytes, savedBytes: sourceBytes - bytes,
    reductionPercent: Number((100 * (1 - bytes / sourceBytes)).toFixed(2)), variants,
  }
}
async function validateDerivative(image) {
  const file = outputFile(image)
  const bytes = await readFile(file)
  if (bytes.length !== image.bytes || sha256(bytes) !== image.sha256) throw new Error(`Derivative checksum mismatch: ${image.path}`)
  const meta = await sharp(bytes).metadata()
  const spec = SPECS.find((entry) => entry.variant === image.variant)
  if (meta.format !== 'webp' || !meta.hasAlpha || meta.width !== image.width || meta.height !== image.height || meta.width !== spec.width) {
    throw new Error(`Derivative format, dimensions or transparency mismatch: ${image.path}`)
  }
}
async function verify() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  if (manifest.version !== 1 || manifest.files?.length !== 78) throw new Error('Expected a complete version 1 manifest of 78 derivatives')
  const uniquePaths = new Set()
  const folders = new Map()
  for (const image of manifest.files) {
    if (uniquePaths.has(image.path)) throw new Error(`Duplicate derivative: ${image.path}`)
    uniquePaths.add(image.path)
    if (!folders.has(image.folderName)) folders.set(image.folderName, new Set())
    folders.get(image.folderName).add(image.variant)
    await validateDerivative(image)
  }
  if (folders.size !== 39 || [...folders.values()].some((variants) => variants.size !== 2)) throw new Error('Expected mobile and desktop derivatives for each of 39 products')
  const totals = summary(manifest.files)
  if (JSON.stringify(totals) !== JSON.stringify(manifest.totals)) throw new Error('Manifest totals do not match the derivative records')
  console.log(json({ verified: true, ...totals }))
}
async function prepare() {
  const sourceManifestBytes = await readFile(SOURCE_MANIFEST_PATH)
  const sourceManifest = JSON.parse(sourceManifestBytes.toString('utf8'))
  const catalogBytes = await readFile(CATALOG_PATH)
  const machines = JSON.parse(catalogBytes.toString('utf8'))
  if (sourceManifest.version !== 1 || machines.length !== 39 || sha256(catalogBytes) !== sourceManifest.catalogSha256) {
    throw new Error('Catalogue or source media manifest differs from the verified migration snapshot')
  }
  const originals = new Map(sourceManifest.files.map((file) => [file.key, file]))
  const jobs = []
  for (const machine of machines) {
    for (const spec of SPECS) {
      const folder = machine.FolderName
      imagePath(folder, spec)
      const key = `${folder}/media/${spec.variant}.png`
      const source = originals.get(key)
      if (!source || source.contentType !== 'image/png') throw new Error(`Missing PNG in source manifest: ${key}`)
      const sourceFile = path.join(ORIGINAL_ROOT, ...key.split('/'))
      const sourceBytes = await readFile(sourceFile)
      if (sourceBytes.length !== source.bytes || sha256(sourceBytes) !== source.sha256) throw new Error(`Original PNG SHA-256 mismatch: ${key}`)
      const meta = await sharp(sourceBytes).metadata()
      if (meta.format !== 'png' || !meta.hasAlpha) throw new Error(`Unexpected original format/transparency: ${key}`)
      jobs.push({ folder, spec, source, sourceFile, sourceMeta: meta })
    }
  }
  console.log(`Verified ${jobs.length} original PNG hashes before generating derivatives.`)
  const files = []
  for (const { folder, spec, source, sourceFile, sourceMeta } of jobs) {
    // Preserve each original variant's own composition and alpha. The four
    // 299px-wide mobile sources are resized by one pixel to exactly 300px.
    const { data, info } = await sharp(sourceFile)
      .resize({ width: spec.width })
      .webp({ quality: spec.quality, effort: 6, alphaQuality: 90 })
      .toBuffer({ resolveWithObject: true })
    const image = {
      folderName: folder, variant: spec.variant,
      src: source.path, path: imagePath(folder, spec),
      width: info.width, height: info.height, bytes: data.length, sha256: sha256(data),
      sourceWidth: sourceMeta.width, sourceHeight: sourceMeta.height,
      sourceBytes: source.bytes, sourceSha256: source.sha256,
    }
    const expectedHeight = Math.round(sourceMeta.height * spec.width / sourceMeta.width)
    if (info.width !== spec.width || info.height !== expectedHeight) throw new Error(`Unexpected resize dimensions: ${image.path}`)
    await atomicWrite(outputFile(image), data)
    await validateDerivative(image)
    files.push(image)
    console.log(`${image.path}: ${image.width}x${image.height}, ${image.bytes} bytes`)
  }
  files.sort((a, b) => a.path.localeCompare(b.path, 'en'))
  const manifest = {
    version: 1, generatedAt: new Date().toISOString(),
    sourceManifest: 'assets/product-media-manifest.json', sourceManifestSha256: sha256(sourceManifestBytes),
    encoder: { sharp: sharp.versions.sharp, webp: sharp.versions.webp, effort: 6, alphaQuality: 90 },
    variants: SPECS.map(({ variant, width, quality, filename }) => ({ variant, width, quality, filename })),
    files, totals: summary(files),
  }
  await atomicWrite(MANIFEST_PATH, json(manifest))
  await verify()
}

try {
  if (args[0] === '--verify') await verify()
  else await prepare()
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}
