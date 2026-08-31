import { NextResponse } from "next/server"
import type { MachineCatalogItem } from "@/lib/planner/planner-types"
import { COURSE_HOLES_DATA } from "@/lib/planner/course-holes-data"

const MACHINES_URL =
  "https://va0d7iedl5.execute-api.ap-southeast-2.amazonaws.com/listMachines?all=true"
const S3_BASE = "https://puttbrothers-images.s3.ap-southeast-2.amazonaws.com"

function toOptionalNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function toNumber(value: unknown, fallback: number) {
  return toOptionalNumber(value) ?? fallback
}

function millimetersToMeters(value: unknown) {
  const millimeters = toOptionalNumber(value)
  return millimeters ? millimeters / 1000 : null
}

function toCatalogItem(raw: any): MachineCatalogItem | null {
  const folderName = raw.FolderName || raw.folderName || ""

  if (!folderName.startsWith("JN")) {
    return null
  }

  const id = String(raw.MachineID ?? raw.id ?? folderName)
  const name = raw.Machine || raw.name || folderName
  const width = millimetersToMeters(raw.Width ?? raw.width)
  const depth = millimetersToMeters(raw.Depth ?? raw.Deep ?? raw.depth ?? raw.deep)
  const height = millimetersToMeters(raw.Height ?? raw.height)

  if (!width || !depth || !height) {
    return null
  }

  return {
    id,
    name,
    category: raw.Category || raw.category || "Course Hole",
    width,
    depth,
    height,
    clearance: toNumber(raw.Clearance ?? raw.clearance, 0.5),
    description: raw.Advertising || raw.description || raw.SubTitle || "",
    color: raw.Color || raw.color || "#41059a",
    image: raw.Image || raw.image || `${S3_BASE}/${folderName}/media/desktop.png`,
  }
}

export async function GET() {
  try {
    const response = await fetch(MACHINES_URL, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json(COURSE_HOLES_DATA)
    }

    const data = await response.json()
    const machines = Array.isArray(data)
      ? data.map(toCatalogItem).filter((item): item is MachineCatalogItem => Boolean(item))
      : []

    return NextResponse.json(machines.length > 0 ? machines : COURSE_HOLES_DATA)
  } catch {
    return NextResponse.json(COURSE_HOLES_DATA)
  }
}
