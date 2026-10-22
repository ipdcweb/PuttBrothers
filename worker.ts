import app from "vinext/server/fetch-handler"
import { productMediaResponse, type ProductMediaBucket } from "./lib/product-media-response"
import { resolveProductImagePath } from "./lib/product-media"
import { layoutPdfUpload, layoutPdfDownload, type LayoutPdfBucket, type LayoutPdfRateLimiter } from "./lib/layout-pdf-storage"

const CANONICAL_HOST = "puttbrothers.com"
const PRODUCT_MEDIA_PREFIX = "/product-media/"

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
    // The Contact/WorkOrg contract is preserved; PDF storage uses native Cloudflare R2.
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

    const pdfEnv = env as { LAYOUT_PDFS?: LayoutPdfBucket; PDF_UPLOAD_RATE_LIMITER?: LayoutPdfRateLimiter }
    if (url.pathname.replace(/\/$/, "") === "/api/layout-pdf/upload") {
      return layoutPdfUpload(request, pdfEnv.LAYOUT_PDFS, pdfEnv.PDF_UPLOAD_RATE_LIMITER)
    }
    if (url.pathname.startsWith("/layout-pdfs/")) {
      return layoutPdfDownload(request, pdfEnv.LAYOUT_PDFS)
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
