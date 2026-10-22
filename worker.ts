import app from "vinext/server/fetch-handler"
import videoFiles from "./lib/scroll-video-files.json"
import { productMediaResponse, type ProductMediaBucket } from "./lib/product-media-response"
import { resolveProductImagePath } from "./lib/product-media"

const CANONICAL_HOST = "puttbrothers.com"
const PRODUCT_MEDIA_PREFIX = "/product-media/"

// Workers Static Assets returned 200/full files for Range requests in the live
// preview. Supply single byte ranges for browser video seeking without buffering
// whole videos. Other asset paths retain Cloudflare's direct static serving.
async function videoResponse(request: Request, assets: { fetch(request: Request): Promise<Response> }): Promise<Response> {
  const assetHeaders = new Headers(request.headers)
  assetHeaders.delete("Range")
  assetHeaders.delete("If-Range")
  assetHeaders.set("Accept-Encoding", "identity")
  const asset = await assets.fetch(new Request(request, { headers: assetHeaders }))
  if (asset.status !== 200) return asset
  const headers = new Headers(asset.headers)
  headers.set("Accept-Ranges", "bytes")
  const range = request.method === "GET" ? request.headers.get("Range") : null
  const ifRange = request.headers.get("If-Range")
  const validatorMatches = !ifRange ||
    (!ifRange.startsWith("W/") && ifRange === headers.get("ETag")) ||
    (headers.has("Last-Modified") && ifRange === headers.get("Last-Modified"))
  const match = range?.match(/^bytes=(\d*)-(\d*)$/)
  if (!match || (!match[1] && !match[2]) || !validatorMatches || !asset.body) {
    return new Response(asset.body, { status: asset.status, headers })
  }
  // The deployed asset binding omits Content-Length even though Cloudflare adds
  // it later on the wire. These exact source sizes are verified before deployment.
  const size = Number(headers.get("Content-Length") ??
    (videoFiles as Record<string, number>)[new URL(request.url).pathname])
  if (!Number.isSafeInteger(size) || size <= 0 || headers.has("Content-Encoding")) {
    return new Response(asset.body, { status: asset.status, headers })
  }
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]))
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) {
    await asset.body.cancel()
    headers.set("Content-Range", `bytes */${size}`)
    headers.delete("Content-Length")
    return new Response(null, { status: 416, headers })
  }
  const reader = asset.body.getReader()
  let offset = 0
  const slice = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) throw new Error("Video asset ended before the requested range")
          const from = Math.max(0, start - offset)
          const to = Math.min(value.byteLength, end + 1 - offset)
          offset += value.byteLength
          if (to > from) controller.enqueue(value.subarray(from, to))
          if (offset > end) {
            controller.close()
            await reader.cancel()
            return
          }
          if (to > from) return
        }
      } catch (error) {
        controller.error(error)
      }
    },
    cancel(reason) { return reader.cancel(reason) },
  })
  const length = end - start + 1
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`)
  headers.set("Content-Length", String(length))
  // Workers ignores manually set Content-Length on arbitrary streams. Its native
  // FixedLengthStream preserves this header; Node tests use the standard stream.
  const FixedStream = (globalThis as typeof globalThis & {
    FixedLengthStream?: new (length: number) => TransformStream<Uint8Array, Uint8Array>
  }).FixedLengthStream
  if (FixedStream) {
    const fixed = new FixedStream(length)
    void slice.pipeTo(fixed.writable).catch(() => { /* pipeTo aborts the response on failure */ })
    return new Response(fixed.readable, { status: 206, headers })
  }
  return new Response(slice, { status: 206, headers })
}

const REDIRECT_HOSTS = new Set([
  "www.puttbrothers.com",
  "puttbrothers.ch",
  "www.puttbrothers.ch",
  "puttbrothers.de",
  "www.puttbrothers.de",
  "puttbrothers.uk",
  "www.puttbrothers.uk",
])

export default {
  async fetch(
    request: Request,
    env: Parameters<typeof app.fetch>[1],
    ctx: Parameters<typeof app.fetch>[2],
  ): Promise<Response> {
    const url = new URL(request.url)
    const preview = (env as { PREVIEW_MODE?: string }).PREVIEW_MODE === "true"

    // Review environments never send leads or write to the production PDF bucket.
    // The existing Contact/WorkOrg and AWS implementations remain unchanged.
    if (preview && request.method === "POST" &&
      ["/api/contact", "/api/layout-pdf/upload"].includes(url.pathname.replace(/\/$/, ""))) {
      return Response.json({
        success: false,
        message: "This is a review website. Form submissions and PDF uploads are disabled; nothing was sent.",
      }, { status: 403, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" } })
    }

    if (REDIRECT_HOSTS.has(url.hostname.toLowerCase())) {
      url.protocol = "https:"
      url.hostname = CANONICAL_HOST
      url.port = ""

      // Domain-specific responses must never enter a hostname-agnostic cache.
      return new Response(null, {
        status: 301,
        headers: {
          Location: url.toString(),
          "Cache-Control": "no-store",
          "CDN-Cache-Control": "no-store",
        },
      })
    }

    if (["GET", "HEAD"].includes(request.method) && /^\/videos\/[^/]+\.mp4$/.test(url.pathname)) {
      const assets = (env as { ASSETS?: { fetch(request: Request): Promise<Response> } }).ASSETS
      if (assets) {
        const response = await videoResponse(request, assets)
        const headers = new Headers(response.headers)
        if (preview) headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
        return new Response(response.body, { status: response.status, headers })
      }
    }

    if (url.pathname.startsWith(PRODUCT_MEDIA_PREFIX)) {
      const response = await productMediaResponse(request, (env as { PRODUCT_MEDIA?: ProductMediaBucket }).PRODUCT_MEDIA)
      const headers = new Headers(response.headers)
      if (preview) headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
      return new Response(response.body, { status: response.status, headers })
    }

    if (["GET", "HEAD"].includes(request.method) && url.pathname === "/api/planner/image") {
      const imagePath = resolveProductImagePath(url.searchParams.get("url"))
      if (!imagePath) return Response.json({ success: false, message: "Product image is not allowed" }, {
        status: 400, headers: { "Cache-Control": "no-store" },
      })
      const imageUrl = new URL(imagePath, url)
      const response = await productMediaResponse(new Request(imageUrl, { method: request.method, headers: request.headers }), (env as { PRODUCT_MEDIA?: ProductMediaBucket }).PRODUCT_MEDIA)
      const headers = new Headers(response.headers)
      if (preview) headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")
      return new Response(response.body, { status: response.status, headers })
    }

    const isPublicProductsRequest = request.method === "GET" && url.pathname === "/api/products/machines"
    // Separate the corrected catalog format from older cached fallback data.
    const apiCacheUrl = new URL(url)
    apiCacheUrl.searchParams.set("__catalog_version", "cloudflare-20261023-v1")
    const apiCacheKey = isPublicProductsRequest ? new Request(apiCacheUrl.toString(), { method: "GET" }) : null

    if (apiCacheKey) {
      const cachedResponse = await caches.default.match(apiCacheKey)
      if (cachedResponse) {
        return cachedResponse
      }
    }

    const response = await app.fetch(request, env, ctx)
    const headers = new Headers(response.headers)
    if (preview) headers.set("X-Robots-Tag", "noindex, nofollow, noarchive")

    if (headers.get("Content-Type")?.includes("text/html")) {
      headers.set("Cache-Control", "no-store")
      headers.set("CDN-Cache-Control", "no-store")

      // One-time recovery for browsers that stored the former self-redirect.
      // Only HTTP cache is cleared; cookies, forms and local storage are retained.
      if (response.ok && url.pathname === "/" && url.searchParams.get("refresh") === "20261001") {
        headers.set("Clear-Site-Data", '"cache"')
      }
    } else if (response.ok && url.pathname.startsWith("/_next/static/")) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable")
    } else if (response.ok && /\.(?:avif|gif|ico|jpe?g|png|svg|webp|woff2?)$/i.test(url.pathname)) {
      headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800")
    }

    const finalResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })

    if (apiCacheKey && finalResponse.ok && !/\b(no-store|private)\b/i.test(headers.get("Cache-Control") || "")) {
      ctx.waitUntil(caches.default.put(apiCacheKey, finalResponse.clone()))
    }

    return finalResponse
  },
}
