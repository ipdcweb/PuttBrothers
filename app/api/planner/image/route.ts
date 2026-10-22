import { NextResponse } from "next/server"
import { resolveProductImagePath } from "@/lib/product-media"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return NextResponse.json({ success: false, message: "Missing image URL" }, { status: 400 })
  }

  // Historical saved planner entries may still contain S3 URLs. The resolver
  // maps only known migrated product images to their local Cloudflare path.
  const imagePath = resolveProductImagePath(imageUrl)
  if (!imagePath) {
    return NextResponse.json({ success: false, message: "Product image is not allowed" }, { status: 400 })
  }

  try {
    const response = await fetch(new URL(imagePath, request.url).toString(), {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(6000),
    })
    if (!response.ok) {
      return NextResponse.json({ success: false, message: "Unable to fetch image" }, { status: response.status })
    }

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.startsWith("image/")) {
      await response.body?.cancel()
      return NextResponse.json({ success: false, message: "URL is not an image" }, { status: 400 })
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return NextResponse.json({ success: false, message: "Image temporarily unavailable" }, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    })
  }
}
