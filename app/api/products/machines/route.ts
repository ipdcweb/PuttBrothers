import { NextResponse } from "next/server"
import { getMachinesWithFlagsResult } from "@/app/actions/machines_with_flags"
import { FALLBACK_MACHINES } from "@/lib/products-catalog"

export async function GET() {
  try {
    const { machines, isFallback } = await getMachinesWithFlagsResult()
    const response = NextResponse.json(machines)
    response.headers.set("Cache-Control", isFallback
      ? "no-store"
      : "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400")
    response.headers.set("X-Catalog-Source", isFallback ? "fallback" : "live")
    return response
  } catch {
    const response = NextResponse.json(FALLBACK_MACHINES)
    response.headers.set("Cache-Control", "no-store")
    response.headers.set("X-Catalog-Source", "fallback")
    return response
  }
}
