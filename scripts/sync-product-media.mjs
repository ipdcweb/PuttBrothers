#!/usr/bin/env node
/**
 * Seed the reviewed catalogue release, without deploying a Worker.
 *   node scripts/sync-product-media.mjs                 # validate only
 *   node scripts/sync-product-media.mjs --local         # Wrangler local R2 state
 *   node scripts/sync-product-media.mjs --remote        # fixed review bucket
 *   node scripts/sync-product-media.mjs --remote --verify # recheck saved receipts
 *   node scripts/sync-product-media.mjs --remote --cli    # slower CLI fallback
 *   node scripts/sync-product-media.mjs --remote --production # fixed production bucket
 *
 * Production target authorized by Rafael on 23 October for complete AWS retirement.
 *
 * A future release needs a deliberate update to the constants below. This tool
 * never lists, deletes, or writes objects outside this release prefix. Remote
 * upload receipts are saved only after downloading and hashing each R2 object.
 * Existing Wrangler authentication is used in memory for the same REST endpoint
 * as its R2 CLI. Credentials are never printed or copied to project files.
 */
import { createHash } from "node:crypto"
import { createReadStream } from "node:fs"
import { mkdir, readFile, realpath, stat, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import path from "node:path"
import { spawn } from "node:child_process"
import { fileURLToPath, pathToFileURL } from "node:url"
import { Readable } from "node:stream"
import os from "node:os"
import { setTimeout as delay } from "node:timers/promises"

const ACCOUNT = "5929fdac0cd2d82d7378551cf4c20774"
const BUCKET = process.argv.includes("--production") ? "puttbrothers-product-media-production" : "puttbrothers-product-media-review"
const RELEASE = "catalog-20261023-v1"
const EXPECTED_FILES = 198
const EXPECTED_BYTES = 409_833_999
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SOURCE_ROOT = path.join(ROOT, "tmp", "product-media")
const STATE_ROOT = path.join(ROOT, "tmp", process.argv.includes("--production") ? "sync-product-media-production" : "sync-product-media", RELEASE)
const CACHE_CONTROL = "public, max-age=31536000, immutable"
const args = new Set(process.argv.slice(2))
for (const arg of args) {
  if (!["--local", "--remote", "--verify", "--cli", "--production"].includes(arg)) throw new Error(`Unknown argument: ${arg}`)
}
if (args.has("--local") && args.has("--remote")) throw new Error("Choose --local or --remote, never both")
const mode = args.has("--remote") ? "remote" : args.has("--local") ? "local" : "dry-run"
if (path.basename(ROOT) !== "WebsiteLocal_02") throw new Error("Run only from the V2 review workspace")

async function hashFile(filename) {
  const hash = createHash("sha256")
  for await (const chunk of createReadStream(filename)) hash.update(chunk)
  return hash.digest("hex")
}

function within(parent, candidate) {
  const relative = path.relative(parent, candidate)
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)
}

async function readJson(filename, optional = false) {
  try { return JSON.parse(await readFile(filename, "utf8")) }
  catch (error) { if (optional && error.code === "ENOENT") return undefined; throw error }
}

const manifest = await readJson(path.join(ROOT, "assets", "product-media-manifest.json"))
if (!Array.isArray(manifest.files) || manifest.files.length !== EXPECTED_FILES) {
  throw new Error(`Incomplete release: expected ${EXPECTED_FILES} manifest files`)
}
const servingSource = await readFile(path.join(ROOT, "lib", "product-media-response.ts"), "utf8")
if (!servingSource.includes(`PRODUCT_MEDIA_RELEASE = "${RELEASE}"`)) {
  throw new Error("Serving code and fixed upload release differ")
}
const keys = new Set()
let totalBytes = 0
const sourceRealRoot = await realpath(SOURCE_ROOT)
const files = []
// Complete this pass before creating a destination or uploading a single byte.
for (const file of manifest.files) {
  if (typeof file.key !== "string" || file.key.startsWith("/") || /[\\\u0000-\u001f\u007f]/.test(file.key)
      || file.key.split("/").some(segment => !segment || segment === "." || segment === "..")
      || keys.has(file.key) || file.path !== `/product-media/${file.key}`) {
    throw new Error(`Unsafe, duplicate, or inconsistent key: ${file.key}`)
  }
  if (!Number.isSafeInteger(file.bytes) || file.bytes < 1 || !/^[a-f0-9]{64}$/.test(file.sha256)
      || typeof file.contentType !== "string" || !/^[\w.+-]+\/[\w.+-]+(?:;[\w =.-]+)?$/.test(file.contentType)) {
    throw new Error(`Invalid file metadata: ${file.key}`)
  }
  const filename = await realpath(path.join(SOURCE_ROOT, ...file.key.split("/")))
  if (!within(sourceRealRoot, filename)) throw new Error(`Source escapes imported media directory: ${file.key}`)
  const info = await stat(filename)
  if (!info.isFile() || info.size !== file.bytes || await hashFile(filename) !== file.sha256) {
    throw new Error(`Missing or altered imported file: ${file.key}`)
  }
  keys.add(file.key)
  totalBytes += file.bytes
  files.push({ ...file, filename })
}
if (totalBytes !== EXPECTED_BYTES) throw new Error(`Incomplete release: expected ${EXPECTED_BYTES} bytes, got ${totalBytes}`)
const releaseHash = createHash("sha256").update(JSON.stringify(files.map(({ key, bytes, sha256, contentType }) => ({ key, bytes, sha256, contentType })).sort((a, b) => a.key.localeCompare(b.key)))).digest("hex")
console.log(`Validated ${files.length} files, ${totalBytes} bytes, SHA-256 complete.`)
console.log(`Destination: ${mode}, account ${ACCOUNT}, bucket ${BUCKET}, prefix ${RELEASE}/`)
if (mode === "dry-run") {
  console.log("Validation only. Choose --local or --remote to write this fixed release.")
  process.exit(0)
}

await mkdir(STATE_ROOT, { recursive: true })
const lockPath = path.join(STATE_ROOT, "release.json")
const lock = await readJson(lockPath, true)
if (lock && (lock.releaseHash !== releaseHash || lock.bucket !== BUCKET || lock.account !== ACCOUNT)) {
  throw new Error("This immutable release already has a different manifest or destination. Use a new release.")
}
if (!lock) await writeFile(lockPath, `${JSON.stringify({ account: ACCOUNT, bucket: BUCKET, release: RELEASE, releaseHash, fileCount: files.length, bytes: totalBytes }, null, 2)}\n`, { flag: "wx" })
const receiptRoot = path.join(STATE_ROOT, mode)
await mkdir(receiptRoot, { recursive: true })
function receiptPath(file) { return path.join(receiptRoot, `${createHash("sha256").update(file.key).digest("hex")}.json`) }
async function receiptFor(file) {
  const receipt = await readJson(receiptPath(file), true)
  return receipt?.sha256 === file.sha256 && receipt?.bytes === file.bytes && receipt?.releaseHash === releaseHash ? receipt : undefined
}
async function saveReceipt(file, method) {
  await writeFile(receiptPath(file), `${JSON.stringify({ account: ACCOUNT, bucket: BUCKET, objectKey: `${RELEASE}/${file.key}`, sha256: file.sha256, bytes: file.bytes, contentType: file.contentType, releaseHash, verifiedAt: new Date().toISOString(), verification: method }, null, 2)}\n`)
}

let completed = 0
async function concurrency(items, count, operation) {
  let cursor = 0
  let failed
  const workers = Array.from({ length: count }, async () => {
    while (!failed && cursor < items.length) {
      const index = cursor++
      try { await operation(items[index], index) }
      catch (error) { failed ??= error }
    }
  })
  await Promise.all(workers)
  if (failed) throw failed
}
function progress() {
  completed++
  if (completed % 10 === 0 || completed === files.length) console.log(`${mode}: ${completed}/${files.length} verified`)
}

if (mode === "local") {
  // Use the same Miniflare conversion and persistence root as Wrangler's R2 CLI.
  // Resolving from Wrangler avoids adding a direct/transitive dependency entry.
  const requireFromWrangler = createRequire(createRequire(import.meta.url).resolve("wrangler/package.json"))
  const { Miniflare, convertV4MiniflareOptions } = await import(pathToFileURL(requireFromWrangler.resolve("miniflare")).href)
  const mf = new Miniflare(convertV4MiniflareOptions({
    modules: true,
    compatibilityDate: "2026-08-31",
    resourcePersistencePath: path.join(ROOT, ".wrangler", "state", "v3"),
    r2Buckets: { PRODUCT_MEDIA: BUCKET },
    script: `export default { async fetch(request, env) {
      const key = decodeURIComponent(new URL(request.url).pathname.slice(1));
      const options = JSON.parse(request.headers.get("Upload-Options"));
      await env.PRODUCT_MEDIA.put(key, request.body, options);
      return new Response(null, {status: 204});
    } };`,
  }))
  try {
    const bucket = await mf.getR2Bucket("PRODUCT_MEDIA")
    await concurrency(files, 3, async file => {
      const objectKey = `${RELEASE}/${file.key}`
      const existing = await bucket.get(objectKey)
      if (existing) {
        const hash = createHash("sha256")
        for await (const chunk of existing.body) hash.update(chunk)
        if (existing.size !== file.bytes || hash.digest("hex") !== file.sha256 || existing.httpMetadata.contentType !== file.contentType) {
          throw new Error(`Refusing to overwrite different local release object: ${file.key}`)
        }
      } else {
        const response = await mf.dispatchFetch(`http://localhost/${objectKey.split("/").map(encodeURIComponent).join("/")}`, {
          method: "PUT",
          body: Readable.toWeb(createReadStream(file.filename)),
          duplex: "half",
          headers: {
            "Content-Length": String(file.bytes),
            "Upload-Options": JSON.stringify({ httpMetadata: { contentType: file.contentType, cacheControl: CACHE_CONTROL }, customMetadata: { sha256: file.sha256 } }),
          },
        })
        if (response.status !== 204) throw new Error(`Local R2 upload failed: ${file.key}, status ${response.status}`)
        const object = await bucket.get(objectKey)
        if (!object) throw new Error(`Local R2 object missing after upload: ${file.key}`)
        const hash = createHash("sha256")
        for await (const chunk of object.body) hash.update(chunk)
        if (object.size !== file.bytes || hash.digest("hex") !== file.sha256 || object.httpMetadata.contentType !== file.contentType) throw new Error(`Local R2 verification failed: ${file.key}`)
      }
      await saveReceipt(file, "Miniflare R2 get, byte count, content type, SHA-256")
      progress()
    })
  } finally { await mf.dispose() }
} else {
  // A dedicated generated config prevents environment/project account drift.
  // No workers, routes, public bucket endpoints, or credentials are configured.
  const configPath = path.join(STATE_ROOT, "wrangler.json")
  await writeFile(configPath, `${JSON.stringify({ name: "puttbrothers-product-media-sync", account_id: ACCOUNT, compatibility_date: "2026-08-31" }, null, 2)}\n`)
  const wranglerPath = path.join(path.dirname(createRequire(import.meta.url).resolve("wrangler/package.json")), "bin", "wrangler.js")
  const verifyRoot = path.join(STATE_ROOT, "remote-downloads")
  await mkdir(verifyRoot, { recursive: true })
  async function wrangler(commandArgs) {
    return await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [wranglerPath, ...commandArgs, "--config", configPath], {
        cwd: ROOT, env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT, CI: "true", WRANGLER_SEND_METRICS: "false" },
        shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
      })
      let output = ""
      for (const stream of [child.stdout, child.stderr]) stream.on("data", chunk => { output = (output + chunk.toString()).slice(-5000) })
      child.on("error", reject)
      child.on("close", code => {
        if (code === 0) resolve()
        else reject(new Error(`Wrangler failed (${code}): ${output.replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(-2500)}`))
      })
    })
  }
  if (args.has("--cli")) {
    await concurrency(files, 3, async file => {
      const existingReceipt = await receiptFor(file)
      if (existingReceipt && !args.has("--verify")) { progress(); return }
      const objectPath = `${BUCKET}/${RELEASE}/${file.key}`
      if (!existingReceipt) {
        await wrangler(["r2", "object", "put", objectPath, "--remote", "--file", file.filename, "--content-type", file.contentType, "--cache-control", CACHE_CONTROL])
      }
      const downloaded = path.join(verifyRoot, `${createHash("sha256").update(file.key).digest("hex")}.bin`)
      await wrangler(["r2", "object", "get", objectPath, "--remote", "--file", downloaded])
      if ((await stat(downloaded)).size !== file.bytes || await hashFile(downloaded) !== file.sha256) {
        throw new Error(`Remote R2 SHA-256 verification failed: ${file.key}`)
      }
      await saveReceipt(file, "Wrangler remote R2 get, byte count, SHA-256")
      progress()
    })
  } else {
    // Same storage location and REST object endpoint as installed Wrangler.
    // Only the access token is extracted; refresh tokens never leave storage.
    let accessToken = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN
    if (!accessToken) {
      const legacyRoot = path.join(os.homedir(), ".wrangler")
      let authRoot
      try { if ((await stat(legacyRoot)).isDirectory()) authRoot = legacyRoot } catch (error) { if (error.code !== "ENOENT") throw error }
      const xdgRoot = process.env.XDG_CONFIG_HOME || (process.platform === "win32"
        ? path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "xdg.config")
        : process.platform === "darwin" ? path.join(os.homedir(), "Library", "Preferences") : path.join(os.homedir(), ".config"))
      const authText = await readFile(path.join(authRoot || path.join(xdgRoot, ".wrangler"), "config", "default.toml"), "utf8")
      const tokenMatch = authText.match(/^oauth_token\s*=\s*"([^"\r\n]+)"\s*$/m)
      if (!tokenMatch) throw new Error("No stored Wrangler OAuth access token. Authenticate with Wrangler or use --cli.")
      accessToken = tokenMatch[1]
    }
    // Fixed trusted API origin, no redirects: never forward authorization to a
    // caller-selected host. Object keys are encoded individually, preserving /.
    async function objectRequest(file, method) {
      const objectKey = `${RELEASE}/${file.key}`.split("/").map(encodeURIComponent).join("/")
      const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/r2/buckets/${BUCKET}/objects/${objectKey}`
      for (let attempt = 0; attempt < 4; attempt++) {
        const headers = { Authorization: `Bearer ${accessToken}`, "User-Agent": "puttbrothers-reviewed-media-sync/1" }
        const options = { method, headers, redirect: "error", signal: AbortSignal.timeout(180_000) }
        if (method === "PUT") {
          headers["Content-Type"] = file.contentType
          headers["Content-Length"] = String(file.bytes)
          headers["Cache-Control"] = CACHE_CONTROL
          headers["cf-r2-data-catalog-check"] = "true"
          options.body = Readable.toWeb(createReadStream(file.filename))
          options.duplex = "half"
        }
        const response = await fetch(url, options)
        if (response.ok || (method === "GET" && response.status === 404)) return response
        const status = response.status
        const retrySeconds = Number(response.headers.get("Retry-After"))
        await response.body?.cancel()
        if ((status === 429 || status >= 500) && attempt < 3) {
          await delay(Number.isFinite(retrySeconds) && retrySeconds > 0 ? Math.min(retrySeconds * 1000, 30_000) : 1000 * 2 ** attempt)
          continue
        }
        throw new Error(`R2 ${method} failed with HTTP ${status}: ${file.key}. No credentials are logged.`)
      }
    }
    async function verifyObject(file, response) {
      if (!response.ok || !response.body) throw new Error(`Remote R2 object missing: ${file.key}`)
      const actualType = response.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase()
      const expectedType = file.contentType.split(";")[0].trim().toLowerCase()
      const hash = createHash("sha256")
      let bytes = 0
      for await (const chunk of response.body) { bytes += chunk.byteLength; hash.update(chunk) }
      if (bytes !== file.bytes || hash.digest("hex") !== file.sha256 || actualType !== expectedType) {
        throw new Error(`Remote R2 bytes, SHA-256, or MIME mismatch; refusing overwrite: ${file.key} (MIME ${actualType})`)
      }
    }
    await concurrency(files, 4, async file => {
      const existingReceipt = await receiptFor(file)
      if (existingReceipt && !args.has("--verify")) { progress(); return }
      const existing = await objectRequest(file, "GET")
      if (existing.status === 404) {
        await existing.body?.cancel()
        if (existingReceipt) throw new Error(`Previously verified remote object was removed: ${file.key}`)
        const uploaded = await objectRequest(file, "PUT")
        await uploaded.body?.cancel()
        await verifyObject(file, await objectRequest(file, "GET"))
      } else {
        await verifyObject(file, existing)
      }
      await saveReceipt(file, "Cloudflare REST R2 get, byte count, MIME, SHA-256")
      progress()
    })
    accessToken = undefined
  }
}
console.log(`${mode}: complete. ${files.length} verified objects, ${totalBytes} bytes. No Worker deployed.`)
