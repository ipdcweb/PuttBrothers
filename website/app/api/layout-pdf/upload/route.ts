import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Cloudflare's Worker handles this route with native R2 bindings before Vinext.
// A generic Next runtime must fail closed instead of uploading anywhere else.
export async function POST() {
  return NextResponse.json({ success: false, message: "PDF storage is unavailable in this runtime" }, {
    status: 503, headers: { "Cache-Control": "no-store" },
  })
}
