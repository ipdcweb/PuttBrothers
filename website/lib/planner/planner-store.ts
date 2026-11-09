import type { PlannerState, Point, Polygon, PlacedMachine, Unit } from "./planner-types"

const STORAGE_KEY = "putt-brothers-planner"

const DEFAULT_STATE: PlannerState = {
  unit: "m",
  boundaries: [],
  obstacles: [],
  restricted: [],
  placedMachines: [],
  textLabels: [],
}

export function loadState(): PlannerState {
  if (typeof window === "undefined") return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as any
    
    // Migration: convert old "boundary" to "boundaries" array
    if (parsed.boundary !== undefined && !parsed.boundaries) {
      const oldBoundary = parsed.boundary as Point[]
      if (Array.isArray(oldBoundary) && oldBoundary.length > 0) {
        parsed.boundaries = [{
          id: "boundary-0",
          points: oldBoundary,
          label: "Boundary"
        }]
      } else {
        parsed.boundaries = []
      }
      delete parsed.boundary
    }
    
    // Ensure boundaries exists
    if (!parsed.boundaries) {
      parsed.boundaries = []
    }
    
    return parsed as PlannerState
  } catch {
    return DEFAULT_STATE
  }
}

export function saveState(state: PlannerState) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function resetState() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

// Geometry helpers
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false
  const n = polygon.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y
    const xj = polygon[j].x, yj = polygon[j].y
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

export function doRectsOverlap(
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number }
): boolean {
  return !(r1.x + r1.w <= r2.x || r2.x + r2.w <= r1.x ||
    r1.y + r1.h <= r2.y || r2.y + r2.h <= r1.y)
}

export function isRectInPolygon(
  rect: { x: number; y: number; w: number; h: number },
  polygon: Point[]
): boolean {
  const corners: Point[] = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.w, y: rect.y },
    { x: rect.x + rect.w, y: rect.y + rect.h },
    { x: rect.x, y: rect.y + rect.h },
  ]
  return corners.every((c) => isPointInPolygon(c, polygon))
}

export function doesRectIntersectPolygon(
  rect: { x: number; y: number; w: number; h: number },
  polygon: Point[]
): boolean {
  // Check 1: If any rect corner is inside the polygon
  const corners: Point[] = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.w, y: rect.y },
    { x: rect.x + rect.w, y: rect.y + rect.h },
    { x: rect.x, y: rect.y + rect.h },
  ]
  
  if (corners.some((c) => isPointInPolygon(c, polygon))) {
    return true
  }

  // Check 2: If any polygon corner is inside the rectangle
  for (const p of polygon) {
    if (p.x >= rect.x && p.x <= rect.x + rect.w && 
        p.y >= rect.y && p.y <= rect.y + rect.h) {
      return true
    }
  }

  // Check 3: If any edge of the rectangle intersects any edge of the polygon
  const rectEdges = [
    { p1: corners[0], p2: corners[1] }, // top
    { p1: corners[1], p2: corners[2] }, // right
    { p1: corners[2], p2: corners[3] }, // bottom
    { p1: corners[3], p2: corners[0] }, // left
  ]

  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i]
    const p2 = polygon[(i + 1) % polygon.length]

    for (const edge of rectEdges) {
      if (lineSegmentsIntersect(edge.p1, edge.p2, p1, p2)) {
        return true
      }
    }
  }

  return false
}

function lineSegmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const ccw = (A: Point, B: Point, C: Point) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x)
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
}

export function getPolygonBounds(polygon: Point[]): {
  minX: number; minY: number; maxX: number; maxY: number
} {
  const xs = polygon.map((p) => p.x)
  const ys = polygon.map((p) => p.y)
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export type UndoableAction = {
  type: "place" | "move" | "delete" | "rotate" | "duplicate"
  before: PlacedMachine[]
  after: PlacedMachine[]
}
