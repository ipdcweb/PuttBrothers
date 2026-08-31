import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ALLOWED_HOSTS = new Set([
  "puttbrothers-images.s3.ap-southeast-2.amazonaws.com",
])

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("url")

  if (!imageUrl) {
    return NextResponse.json({ success: false, message: "Missing image URL" }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(imageUrl)
  } catch {
    return NextResponse.json({ success: false, message: "Invalid image URL" }, { status: 400 })
  }

  if (parsedUrl.protocol !== "https:" || !ALLOWED_HOSTS.has(parsedUrl.hostname)) {
    return NextResponse.json({ success: false, message: "Image host is not allowed" }, { status: 400 })
  }

  const response = await fetch(parsedUrl.toString(), { cache: "no-store" })
  if (!response.ok) {
    return NextResponse.json({ success: false, message: "Unable to fetch image" }, { status: response.status })
  }

  const contentType = response.headers.get("content-type") || "image/png"
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ success: false, message: "URL is not an image" }, { status: 400 })
  }

  return new NextResponse(Buffer.from(await response.arrayBuffer()), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  })
}
