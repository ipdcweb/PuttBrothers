import { NextRequest, NextResponse } from "next/server"
import { hasProduct3D } from "@/lib/product-media"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const folderName = searchParams.get("folderName")

  if (!folderName || !/^[A-Za-z0-9_-]+$/.test(folderName)) {
    return NextResponse.json({ exists: false }, { status: 400 })
  }

  return NextResponse.json({ exists: hasProduct3D(folderName) }, {
    headers: { "Cache-Control": "public, max-age=300", "X-Catalog-Source": "cloudflare" },
  })
}
