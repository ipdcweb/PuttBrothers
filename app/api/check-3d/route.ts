import { NextRequest, NextResponse } from "next/server"

const S3_BASE = "https://puttbrothers-images.s3.ap-southeast-2.amazonaws.com"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const folderName = searchParams.get("folderName")

  if (!folderName) {
    return NextResponse.json({ exists: false }, { status: 400 })
  }

  const s3Url = `${S3_BASE}/${folderName}/build/index.html`

  try {
    const response = await fetch(s3Url, { method: "HEAD" })
    return NextResponse.json({ exists: response.ok })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
