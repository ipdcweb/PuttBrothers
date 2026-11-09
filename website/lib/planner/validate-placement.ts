import type { PlacedMachine, Point } from "./planner-types"
import { getMachine } from "./machine-catalog"
import {
  isRectInPolygon,
  doesRectIntersectPolygon,
  doRectsOverlap,
  isPointInPolygon,
} from "./planner-store"

export function getMachineRect(m: PlacedMachine) {
  const cat = getMachine(m.catalogId)
  if (!cat) return { x: 0, y: 0, w: 0, h: 0 }
  
  // For any rotation angle, calculate rotated bounds
  const rotRad = (m.rotation * Math.PI) / 180
  const cos = Math.cos(rotRad)
  const sin = Math.sin(rotRad)
  
  // Original corners relative to center
  const halfW = cat.width / 2
  const halfH = cat.depth / 2
  const corners = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: halfW, y: halfH },
    { x: -halfW, y: halfH },
  ]
  
  // Rotate corners and find bounds
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  
  for (const c of corners) {
    const rotX = c.x * cos - c.y * sin
    const rotY = c.x * sin + c.y * cos
    minX = Math.min(minX, rotX)
    maxX = Math.max(maxX, rotX)
    minY = Math.min(minY, rotY)
    maxY = Math.max(maxY, rotY)
  }
  
  const w = maxX - minX
  const h = maxY - minY
  return { x: m.x - w / 2, y: m.y - h / 2, w, h }
}

export function getClearanceRect(m: PlacedMachine) {
  const cat = getMachine(m.catalogId)
  if (!cat) return { x: 0, y: 0, w: 0, h: 0 }
  
  // Get machine bounds with rotation
  const machineRect = getMachineRect(m)
  
  // Add clearance
  const w = machineRect.w + cat.clearance * 2
  const h = machineRect.h + cat.clearance * 2
  return { x: m.x - w / 2, y: m.y - h / 2, w, h }
}

// Get rotated clearance polygon - the clearance zone rotated to match the machine
export function getClearancePolygon(m: PlacedMachine): Point[] {
  const cat = getMachine(m.catalogId)
  if (!cat) return []

  const rotRad = (m.rotation * Math.PI) / 180
  const cos = Math.cos(rotRad)
  const sin = Math.sin(rotRad)

  // Machine dimensions with clearance
  const halfW = (cat.width + cat.clearance * 2) / 2
  const halfH = (cat.depth + cat.clearance * 2) / 2

  // Corners of clearance zone relative to center
  const corners = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: halfW, y: halfH },
    { x: -halfW, y: halfH },
  ]

  // Rotate corners and translate to machine position
  return corners.map((c) => ({
    x: m.x + c.x * cos - c.y * sin,
    y: m.y + c.x * sin + c.y * cos,
  }))
}

export function validatePlacement(
  machine: PlacedMachine,
  allMachines: PlacedMachine[],
  boundary: Point[],
  obstacles: { id: string; points: Point[] }[],
  restricted: { id: string; points: Point[] }[]
): { valid: boolean; reason?: string } {
  const rect = getMachineRect(machine)

  // Must be inside boundary
  if (boundary.length >= 3) {
    if (!isRectInPolygon(rect, boundary)) {
      return { valid: false, reason: "Course must be fully inside the boundary" }
    }
  }

  // Must not intersect obstacles - check against clearance-expanded rectangle
  const clearanceRect = getClearanceRect(machine)
  for (const obs of obstacles) {
    if (doesRectIntersectPolygon(clearanceRect, obs.points)) {
      return { valid: false, reason: "Course clearance overlaps with an obstacle" }
    }
  }

  // Must not be in restricted areas - check against clearance-expanded rectangle
  for (const r of restricted) {
    if (doesRectIntersectPolygon(clearanceRect, r.points)) {
      return { valid: false, reason: "Course clearance is in a restricted area" }
    }
  }

  // Clearance zones must not overlap other clearance zones (using rotated polygon)
  const clearancePoly = getClearancePolygon(machine)
  for (const other of allMachines) {
    if (other.id === machine.id) continue
    const otherClearancePoly = getClearancePolygon(other)
    
    // Check if any corner of one polygon is inside the other
    const anyCornerInside =
      clearancePoly.some((c) => isPointInPolygon(c, otherClearancePoly)) ||
      otherClearancePoly.some((c) => isPointInPolygon(c, clearancePoly))
    
    if (anyCornerInside) {
      return { valid: false, reason: "Clearance zone overlaps with another course" }
    }
  }

  return { valid: true }
}
