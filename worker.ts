import app from "vinext/server/fetch-handler"

const CANONICAL_HOST = "puttbrothers.com"
const PRODUCT_MEDIA_PREFIX = "/product-media/"
const S3_MEDIA_ORIGIN = "https://puttbrothers-images.s3.ap-southeast-2.amazonaws.com"

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

    if (request.method === "GET" && url.pathname.startsWith(PRODUCT_MEDIA_PREFIX)) {
      const mediaMatch = url.pathname.match(/^\/product-media\/([^/]+)\/media\/(desktop|mobile)\.png$/)
      if (!mediaMatch) {
        return new Response("Not found", { status: 404 })
      }

      const [, encodedFolder, variant] = mediaMatch
      let folder: string
      try {
        folder = decodeURIComponent(encodedFolder)
      } catch {
        return new Response("Not found", { status: 404 })
      }
      if (!/^[A-Za-z0-9_-]+$/.test(folder)) {
        return new Response("Not found", { status: 404 })
      }

      const cache = caches.default
      const cacheKey = new Request(url.toString(), { method: "GET" })
      const cachedResponse = await cache.match(cacheKey)
      if (cachedResponse) {
        return cachedResponse
      }

      const upstreamUrl = `${S3_MEDIA_ORIGIN}/${encodeURIComponent(folder)}/media/${variant}.png`
      let upstreamResponse: Response
      try {
        upstreamResponse = await fetch(upstreamUrl, { signal: AbortSignal.timeout(6000) })
      } catch {
        return new Response("Image temporarily unavailable", {
          status: 504,
          headers: { "Cache-Control": "no-store" },
        })
      }
      if (!upstreamResponse.ok) {
        return new Response(upstreamResponse.body, {
          status: upstreamResponse.status,
          headers: upstreamResponse.headers,
        })
      }

      const headers = new Headers(upstreamResponse.headers)
      headers.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400")
      headers.set("X-Content-Type-Options", "nosniff")
      headers.delete("Set-Cookie")

      const response = new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers,
      })
      ctx.waitUntil(cache.put(cacheKey, response.clone()))
      return response
    }

    const isPublicProductsRequest = request.method === "GET" && url.pathname === "/api/products/machines"
    // Separate the corrected catalog format from older cached fallback data.
    const apiCacheUrl = new URL(url)
    apiCacheUrl.searchParams.set("__catalog_version", "2")
    const apiCacheKey = isPublicProductsRequest ? new Request(apiCacheUrl.toString(), { method: "GET" }) : null

    if (apiCacheKey) {
      const cachedResponse = await caches.default.match(apiCacheKey)
      if (cachedResponse) {
        return cachedResponse
      }
    }

    const response = await app.fetch(request, env, ctx)
    const headers = new Headers(response.headers)

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
