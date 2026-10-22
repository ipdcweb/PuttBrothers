#!/usr/bin/env node
/**
 * Copy the publicly readable, currently used AWS catalogue/media without changing
 * either the source or the original Unity HTML, JavaScript and binaries.
 *
 * node scripts/import-product-media.mjs --download
 *   Captures the full catalogue, discovers each Unity build's exact dependencies,
 *   downloads at most four files concurrently, and writes the verified manifest.
 *   Repeat safely to resume: local hashes/sizes and upstream ETags are checked.
 * node scripts/import-product-media.mjs --verify
 *   Offline verification of every file against the completed manifest (default).
 *
 * Files remain outside public/ because some Unity assets exceed Workers' 25 MiB
 * static-asset limit. A separate publication step uploads these exact files to R2.
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DOWNLOAD_ROOT = path.join(ROOT, 'tmp', 'product-media')
const MANIFEST_PATH = path.join(ROOT, 'assets', 'product-media-manifest.json')
const CATALOG_PATH = path.join(ROOT, 'lib', 'catalog', 'machines.json')
const FOLDERS_PATH = path.join(ROOT, 'lib', 'catalog', 'three-d-folders.json')
const CHECKPOINT_PATH = path.join(DOWNLOAD_ROOT, '.import-state.json')
const SOURCE = 'https://puttbrothers-images.s3.ap-southeast-2.amazonaws.com/'
const CATALOG_URL = 'https://va0d7iedl5.execute-api.ap-southeast-2.amazonaws.com/listMachines?all=true'
const THREE_D_FOLDERS = [
  'JN5-RACK_EM_UP', 'JN18-QUACK_ATTACK', 'JN25-WINDMILL',
  'JN29_CRANK_TO_11', 'JN30_THE_DANCE_OFF', 'BRIDGE', 'BULLS_EYES',
  'CHESS', 'PACKMAN', 'SUPER_BOWL',
]
const args = process.argv.slice(2)
if (args.some((arg) => !['--download', '--verify'].includes(arg)) || args.length > 1) {
  throw new Error('Usage: node scripts/import-product-media.mjs [--download|--verify]')
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const asJson = (value) => `${JSON.stringify(value, null, 2)}\n`
function localPath(key) {
  if (!key || key.includes('\\') || key.split('/').some((part) => !part || part === '.' || part === '..')) {
    throw new Error(`Unsafe media key: ${key}`)
  }
  const target = path.resolve(DOWNLOAD_ROOT, ...key.split('/'))
  if (!target.startsWith(`${DOWNLOAD_ROOT}${path.sep}`)) throw new Error(`Outside download root: ${key}`)
  return target
}
function sourceUrl(key) {
  return new URL(key.split('/').map(encodeURIComponent).join('/'), SOURCE).href
}
function contentType(key) {
  const types = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
    '.wasm': 'application/wasm', '.data': 'application/octet-stream',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/vnd.microsoft.icon',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  }
  const type = types[path.posix.extname(key).toLowerCase()]
  if (!type) throw new Error(`Unexpected file type requires explicit review: ${key}`)
  return type
}
async function atomicWrite(filename, bytes) {
  await mkdir(path.dirname(filename), { recursive: true })
  await writeFile(`${filename}.new`, bytes)
  await rename(`${filename}.new`, filename)
}
async function loadJson(filename, fallback) {
  try { return JSON.parse(await readFile(filename, 'utf8')) } catch (error) {
    if (error.code === 'ENOENT') return fallback
    throw error
  }
}
async function checkedLocal(entry) {
  try {
    if ((await stat(localPath(entry.key))).size !== entry.bytes) return false
    return sha256(await readFile(localPath(entry.key))) === entry.sha256
  } catch (error) {
    if (error.code === 'ENOENT') return false
    throw error
  }
}
async function request(url, method = 'GET') {
  let lastError
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { method, redirect: 'error', signal: AbortSignal.timeout(180_000) })
      if (!response.ok) {
        await response.body?.cancel()
        const error = new Error(`${method} ${response.status} ${url}`)
        if (response.status < 500 && response.status !== 429) throw Object.assign(error, { final: true })
        throw error
      }
      return response
    } catch (error) {
      lastError = error
      if (error.final || attempt === 2) throw error
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt))
    }
  }
  throw lastError
}

async function verify() {
  const manifest = await loadJson(MANIFEST_PATH, null)
  if (!manifest || manifest.version !== 1 || !manifest.files?.length) throw new Error('No completed media manifest. Run --download first.')
  if (sha256(await readFile(CATALOG_PATH)) !== manifest.catalogSha256) throw new Error('Catalogue SHA-256 mismatch')
  for (const file of manifest.files) {
    if (!await checkedLocal(file)) throw new Error(`Missing, truncated or changed file: ${file.key}`)
  }
  console.log(asJson({ verified: true, files: manifest.files.length, totals: manifest.totals }))
}

async function download() {
  // mkdir only reuses/creates these inspected, project-local output locations.
  await mkdir(DOWNLOAD_ROOT, { recursive: true })
  const catalogResponse = await request(CATALOG_URL)
  const catalogBytes = Buffer.from(await catalogResponse.arrayBuffer())
  const catalog = JSON.parse(catalogBytes.toString('utf8'))
  if (!Array.isArray(catalog) || catalog.length !== 39) throw new Error(`Expected 39 complete machine objects, received ${catalog?.length}`)
  const folders = catalog.map((machine) => machine.FolderName)
  if (new Set(folders).size !== 39 || folders.some((folder) => !/^[A-Za-z0-9_-]+$/.test(folder))) throw new Error('Unexpected or duplicate catalogue folder names')
  if (THREE_D_FOLDERS.some((folder) => !folders.includes(folder))) throw new Error('A current 3D folder is missing from the catalogue')
  await atomicWrite(CATALOG_PATH, catalogBytes)
  await atomicWrite(FOLDERS_PATH, asJson(THREE_D_FOLDERS))
  console.log(`Catalogue captured unchanged: ${catalog.length} machines, ${THREE_D_FOLDERS.length} interactive builds.`)

  const previous = await loadJson(CHECKPOINT_PATH, { files: {} })
  const existingManifest = await loadJson(MANIFEST_PATH, { files: [] })
  for (const entry of existingManifest.files) previous.files[entry.key] ??= entry
  const tasks = new Map()
  const files = new Map()
  const audit = { externalUrls: new Set(), streamingAssetsDirectories: new Set(), explicitStreamingAssets: new Set() }
  let running = 0
  const waiting = []
  let checkpointWrite = Promise.resolve()
  async function limited(operation) {
    if (running >= 4) await new Promise((resolve) => waiting.push(resolve))
    else running++
    try { return await operation() } finally {
      // Transfer the held slot directly to the next waiter, so a newly discovered
      // dependency cannot race that waiter and temporarily exceed four requests.
      const next = waiting.shift()
      if (next) next()
      else running--
    }
  }
  function checkpoint(entry) {
    previous.files[entry.key] = entry
    const snapshot = asJson(previous)
    checkpointWrite = checkpointWrite.then(() => atomicWrite(CHECKPOINT_PATH, snapshot))
    return checkpointWrite
  }
  function getFile(key) {
    localPath(key)
    if (!tasks.has(key)) tasks.set(key, limited(async () => {
      const url = sourceUrl(key)
      const existing = previous.files[key]
      if (existing && existing.sourceUrl === url && existing.sourceETag && await checkedLocal(existing)) {
        const head = await request(url, 'HEAD')
        if (head.headers.get('etag') === existing.sourceETag && Number(head.headers.get('content-length')) === existing.bytes) {
          files.set(key, existing)
          console.log(`Verified ${key} (${existing.bytes} bytes)`)
          return existing
        }
      }
      const response = await request(url)
      if (response.headers.get('content-encoding')) throw new Error(`Unexpected compressed source: ${key}`)
      const bytes = Buffer.from(await response.arrayBuffer())
      const declaredLength = response.headers.get('content-length')
      if (!bytes.length || (declaredLength && Number(declaredLength) !== bytes.length)) throw new Error(`Incomplete download: ${key}`)
      const entry = {
        path: `/product-media/${key}`, key, bytes: bytes.length, sha256: sha256(bytes),
        contentType: contentType(key), sourceUrl: url, sourceETag: response.headers.get('etag'),
      }
      if (!entry.sourceETag) throw new Error(`Source returned no ETag: ${key}`)
      await atomicWrite(localPath(key), bytes)
      if (!await checkedLocal(entry)) throw new Error(`Post-write checksum mismatch: ${key}`)
      files.set(key, entry)
      await checkpoint(entry)
      console.log(`Downloaded ${key} (${bytes.length} bytes)`)
      return entry
    }))
    return tasks.get(key)
  }
  function resolveDependency(reference, parentKey) {
    const value = reference.trim().replace(/&amp;/g, '&')
    if (!value || /^(?:data:|blob:|#)/i.test(value)) return null
    const resolved = new URL(value, sourceUrl(parentKey))
    if (resolved.origin !== new URL(SOURCE).origin) {
      audit.externalUrls.add(resolved.href)
      throw new Error(`External dependency requires review: ${resolved.href} in ${parentKey}`)
    }
    if (resolved.search || resolved.hash) throw new Error(`Unexpected query/fragment in dependency: ${value} in ${parentKey}`)
    const key = decodeURIComponent(resolved.pathname.slice(1))
    if (!key.startsWith(`${parentKey.split('/')[0]}/build/`)) throw new Error(`Dependency leaves its build folder: ${value} in ${parentKey}`)
    return key
  }
  const parsedStyles = new Set()
  async function importCss(key) {
    await getFile(key)
    if (parsedStyles.has(key)) return
    parsedStyles.add(key)
    const css = (await readFile(localPath(key), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
    const references = [
      ...[...css.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^\s)'";]+))\s*\)/gi)].map((match) => match[1] || match[2] || match[3]),
      ...[...css.matchAll(/@import\s+["']([^"']+)["']/gi)].map((match) => match[1]),
    ]
    await Promise.all(references.map(async (reference) => {
      const dependency = resolveDependency(reference, key)
      if (!dependency) return
      if (dependency.endsWith('.css')) await importCss(dependency)
      else await getFile(dependency)
    }))
  }
  async function importBuild(folder) {
    const key = `${folder}/build/index.html`
    await getFile(key)
    const html = await readFile(localPath(key), 'utf8')
    const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]).join('\n')
    const activeScript = scripts.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    const buildUrl = activeScript.match(/\b(?:var|let|const)\s+buildUrl\s*=\s*["']([^"']+)["']/)?.[1]
    if (!buildUrl) throw new Error(`Could not identify Unity buildUrl: ${key}`)
    const names = ['loaderUrl', 'dataUrl', 'frameworkUrl', 'codeUrl']
    const supportedUrlFields = new Set(['buildUrl', ...names, 'streamingAssetsUrl'])
    for (const field of activeScript.matchAll(/\b([A-Za-z]+Url)\s*[:=]/g)) {
      if (!supportedUrlFields.has(field[1])) throw new Error(`Unexpected Unity URL field requires review: ${field[1]} in ${key}`)
    }
    const buildDependencies = names.map((name) => {
      const match = activeScript.match(new RegExp(`\\b${name}\\s*[:=]\\s*buildUrl\\s*\\+\\s*["']([^"']+)["']`))
      if (!match) throw new Error(`Could not identify Unity ${name}: ${key}`)
      return resolveDependency(`${buildUrl}${match[1]}`, key)
    })
    const streamingDirectory = activeScript.match(/\bstreamingAssetsUrl\s*:\s*["']([^"']+)["']/)?.[1]
    if (streamingDirectory) audit.streamingAssetsDirectories.add(resolveDependency(streamingDirectory, key))
    const references = [...html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1])
    await Promise.all([...buildDependencies, ...references.map((reference) => resolveDependency(reference, key))].filter(Boolean).map(async (dependency) => {
      if (dependency.endsWith('.css')) await importCss(dependency)
      else await getFile(dependency)
    }))
    // Unity supplies streamingAssetsUrl even when a viewer contains no streamed
    // files. Import any concrete references present in the original runtime; do
    // not enumerate the source bucket or invent files from that directory name.
    for (const runtimeKey of buildDependencies.filter((dependency) => dependency.endsWith('.js'))) {
      const runtime = await readFile(localPath(runtimeKey), 'utf8')
      const explicit = [...runtime.matchAll(/["']((?:\.\/)?StreamingAssets\/[^"'\s]+)["']/g)].map((match) => match[1])
      for (const reference of explicit) {
        const dependency = resolveDependency(reference, key)
        audit.explicitStreamingAssets.add(dependency)
        await getFile(dependency)
      }
      // Capture URLs for a reviewable audit. Unity runtime strings also include
      // diagnostic/documentation links; those are not network dependencies.
      for (const match of runtime.matchAll(/https?:\/\/[^\s"'<>`\\]+/g)) audit.externalUrls.add(match[0])
    }
  }
  await Promise.all([
    ...folders.flatMap((folder) => ['desktop', 'mobile'].map((size) => getFile(`${folder}/media/${size}.png`))),
    ...THREE_D_FOLDERS.map(importBuild),
  ])
  await checkpointWrite
  const sortedFiles = [...files.values()].sort((a, b) => a.key.localeCompare(b.key, 'en'))
  const largest = sortedFiles.reduce((max, file) => file.bytes > max.bytes ? file : max, sortedFiles[0])
  const manifest = {
    version: 1, capturedAt: new Date().toISOString(), sourceCatalogUrl: CATALOG_URL,
    catalogSha256: sha256(catalogBytes), files: sortedFiles,
    totals: {
      machines: catalog.length, interactiveBuilds: THREE_D_FOLDERS.length,
      files: sortedFiles.length, bytes: sortedFiles.reduce((sum, file) => sum + file.bytes, 0),
      images: sortedFiles.filter((file) => /\/media\/(desktop|mobile)\.png$/.test(file.key)).length,
      largestKey: largest.key, largestBytes: largest.bytes,
      exceedsWorkersStaticAssetLimit: sortedFiles.filter((file) => file.bytes > 25 * 1024 * 1024).length,
    },
    dependencyAudit: {
      missing: [], externalAssetDependencies: [],
      runtimeUrlStrings: [...audit.externalUrls].sort(),
      streamingAssetsDirectories: [...audit.streamingAssetsDirectories].sort(),
      explicitStreamingAssets: [...audit.explicitStreamingAssets].sort(),
      note: 'Unity declares StreamingAssets directories by default. Only concrete references are copied; no source bucket listing was used. Runtime URL strings include diagnostic links and are not treated as asset dependencies.',
    },
  }
  await atomicWrite(MANIFEST_PATH, asJson(manifest))
  await verify()
}

try {
  if (args[0] === '--download') await download()
  else await verify()
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}
