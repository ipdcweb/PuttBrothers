export type Unit = "m" | "ft"

export interface Point {
  x: number
  y: number
}

export interface TextLabel {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color?: string
  name?: string // Label name/title for legend
  description?: string // Description for tooltip and legend
}

export interface Polygon {
  id: string
  points: Point[]
  label?: string
}

export interface MachineCatalogItem {
  id: string
  name: string
  category: string
  width: number // meters
  depth: number // meters
  height?: number // meters (default 1.5)
  clearance: number // meters
  description?: string
  color: string
  image?: string // URL or path to machine image
}

export interface PlacedMachine {
  id: string
  catalogId: string
  x: number // meters (center)
  y: number // meters (center)
  rotation: number // degrees 0-360
}

export interface PlannerState {
  unit: Unit
  boundaries: Polygon[]
  obstacles: Polygon[]
  restricted: Polygon[]
  placedMachines: PlacedMachine[]
  textLabels: TextLabel[]
}

// Conversion helpers
export const M_TO_FT = 3.28084
export const FT_TO_M = 1 / M_TO_FT

export function toDisplay(meters: number, unit: Unit): number {
  return unit === "ft" ? meters * M_TO_FT : meters
}

export function toMeters(value: number, unit: Unit): number {
  return unit === "ft" ? value * FT_TO_M : value
}

export function formatDim(meters: number, unit: Unit): string {
  const val = toDisplay(meters, unit)
  return `${val.toFixed(2)} ${unit}`
}

// Calculate polygon area using Shoelace formula (in square meters)
export function calculatePolygonArea(points: Point[]): number {
  if (points.length < 3) return 0
  
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i]
    const p2 = points[(i + 1) % points.length]
    area += p1.x * p2.y - p2.x * p1.y
  }
  return Math.abs(area) / 2
}

// Calculate total area in square meters
export function calculatePolygonsArea(polygons: Polygon[]): number {
  return polygons.reduce((sum, poly) => sum + calculatePolygonArea(poly.points), 0)
}

// Format area with appropriate unit (m² or ft²)
export function formatArea(squareMeters: number, unit: Unit): string {
  if (unit === "ft") {
    const squareFeet = squareMeters * M_TO_FT * M_TO_FT
    return `${squareFeet.toFixed(2)} ft²`
  }
  return `${squareMeters.toFixed(2)} m²`
}

// Calculate total area of placed machines (in square meters)
export function calculatePlacedMachinesArea(
  placedMachines: PlacedMachine[],
  catalog: MachineCatalogItem[]
): number {
  return placedMachines.reduce((total, machine) => {
    const catalogItem = catalog.find((item) => item.id === machine.catalogId)
    if (catalogItem) {
      return total + catalogItem.width * catalogItem.depth
    }
    return total
  }, 0)
}
