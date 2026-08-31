import { NextResponse } from "next/server"

const MACHINES_URL = "https://va0d7iedl5.execute-api.ap-southeast-2.amazonaws.com/listMachines?all=true"

const mockMachines = [
  {
    id: 1,
    Machine: "Golf Series Pro",
    Advertising: "Professional mini golf course with premium features",
    FolderName: "JN3-SKATE_THE_BOWL",
    Category: "Premium",
  },
  {
    id: 2,
    Machine: "Table Golf Soccer",
    Advertising: "Classic table golf experience for all ages",
    FolderName: "SOCCER",
    Category: "Table Golf",
  },
]

export async function GET() {
  try {
    const response = await fetch(MACHINES_URL, {
      next: { revalidate: 300 },
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      return NextResponse.json(mockMachines)
    }

    const data = await response.json()
    return NextResponse.json(Array.isArray(data) && data.length > 0 ? data : mockMachines)
  } catch {
    return NextResponse.json(mockMachines)
  }
}
