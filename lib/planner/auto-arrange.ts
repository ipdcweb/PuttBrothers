import type { PlacedMachine, Point, MachineCatalogItem } from "./planner-types"
import { getMachine } from "./machine-catalog"
import { validatePlacement } from "./validate-placement"
import { getPolygonBounds, generateId } from "./planner-store"

export type ArrangementMode = "horizontal" | "vertical" | "compressed-left" | "compressed-right"

function arrangeHorizontal(
  items: { id: string; cat: MachineCatalogItem }[],
  boundary: Point[],
  obstacles: { id: string; points: Point[] }[],
  restricted: { id: string; points: Point[] }[]
): PlacedMachine[] {
  // Compress Top - organize courses at the top
  if (boundary.length < 3) return []
  const bounds = getPolygonBounds(boundary)
  const placed: PlacedMachine[] = []
  const PADDING = 0.25
  let cursorX = bounds.minX + 0.5
  let cursorY = bounds.minY + 0.5
  let rowMaxDepth = 0

  for (const item of items) {
    const cat = item.cat
    const totalW = cat.width + cat.clearance * 2 + PADDING
    const totalD = cat.depth + cat.clearance * 2 + PADDING
    let foundSpot = false

    for (let attempt = 0; attempt < 50 && !foundSpot; attempt++) {
      if (cursorX + cat.width / 2 + cat.clearance > bounds.maxX - 0.5) {
        cursorX = bounds.minX + 0.5
        cursorY += rowMaxDepth + PADDING
        rowMaxDepth = 0
      }

      if (cursorY + cat.depth / 2 + cat.clearance > bounds.maxY - 0.5) {
        break
      }

      const candidate: PlacedMachine = {
        id: generateId(),
        catalogId: item.id,
        x: cursorX + cat.width / 2,
        y: cursorY + cat.depth / 2,
        rotation: 0,
      }

      const validation = validatePlacement(candidate, placed, boundary, obstacles, restricted)
      if (validation.valid) {
        placed.push(candidate)
        cursorX += totalW
        rowMaxDepth = Math.max(rowMaxDepth, totalD)
        foundSpot = true
      } else {
        cursorX += 0.5
      }
    }
  }

  return placed
}

function arrangeVertical(
  items: { id: string; cat: MachineCatalogItem }[],
  boundary: Point[],
  obstacles: { id: string; points: Point[] }[],
  restricted: { id: string; points: Point[] }[]
): PlacedMachine[] {
  // Compress Bottom - organize courses at the bottom
  if (boundary.length < 3) return []
  const bounds = getPolygonBounds(boundary)
  const placed: PlacedMachine[] = []
  const PADDING = 0.25
  let cursorX = bounds.minX + 0.5
  let cursorY = bounds.maxY - 0.5
  let colMaxWidth = 0

  for (const item of items) {
    const cat = item.cat
    const totalW = cat.width + cat.clearance * 2 + PADDING
    const totalD = cat.depth + cat.clearance * 2 + PADDING
    let foundSpot = false

    for (let attempt = 0; attempt < 50 && !foundSpot; attempt++) {
      if (cursorX + cat.width / 2 + cat.clearance > bounds.maxX - 0.5) {
        cursorX = bounds.minX + 0.5
        cursorY -= colMaxWidth + PADDING
        colMaxWidth = 0
      }

      if (cursorY - cat.depth / 2 - cat.clearance < bounds.minY + 0.5) {
        break
      }

      const candidate: PlacedMachine = {
        id: generateId(),
        catalogId: item.id,
        x: cursorX + cat.width / 2,
        y: cursorY - cat.depth / 2,
        rotation: 0,
      }

      const validation = validatePlacement(candidate, placed, boundary, obstacles, restricted)
      if (validation.valid) {
        placed.push(candidate)
        cursorX += totalW
        colMaxWidth = Math.max(colMaxWidth, totalD)
        foundSpot = true
      } else {
        cursorX += 0.5
      }
    }
  }

  return placed
}

function arrangeCompressedLeft(
  items: { id: string; cat: MachineCatalogItem }[],
  boundary: Point[],
  obstacles: { id: string; points: Point[] }[],
  restricted: { id: string; points: Point[] }[]
): PlacedMachine[] {
  if (boundary.length < 3) return []
  const bounds = getPolygonBounds(boundary)
  const placed: PlacedMachine[] = []
  const PADDING = 0.15
  let cursorX = bounds.minX + 0.5
  let cursorY = bounds.minY + 0.5
  let rowMaxDepth = 0

  for (const item of items) {
    const cat = item.cat
    const totalW = cat.width + cat.clearance * 2 + PADDING
    const totalD = cat.depth + cat.clearance * 2 + PADDING
    let foundSpot = false

    for (let attempt = 0; attempt < 50 && !foundSpot; attempt++) {
      if (cursorX + cat.width / 2 + cat.clearance > bounds.maxX - 0.3) {
        cursorX = bounds.minX + 0.5
        cursorY += rowMaxDepth + PADDING
        rowMaxDepth = 0
      }

      if (cursorY + cat.depth / 2 + cat.clearance > bounds.maxY - 0.3) {
        break
      }

      const candidate: PlacedMachine = {
        id: generateId(),
        catalogId: item.id,
        x: cursorX + cat.width / 2,
        y: cursorY + cat.depth / 2,
        rotation: 0,
      }

      const validation = validatePlacement(candidate, placed, boundary, obstacles, restricted)
      if (validation.valid) {
        placed.push(candidate)
        cursorX += totalW
        rowMaxDepth = Math.max(rowMaxDepth, totalD)
        foundSpot = true
      } else {
        cursorX += 0.3
      }
    }
  }

  return placed
}

function arrangeCompressedRight(
  items: { id: string; cat: MachineCatalogItem }[],
  boundary: Point[],
  obstacles: { id: string; points: Point[] }[],
  restricted: { id: string; points: Point[] }[]
): PlacedMachine[] {
  if (boundary.length < 3) return []
  const bounds = getPolygonBounds(boundary)
  const placed: PlacedMachine[] = []
  const PADDING = 0.15
  let cursorX = bounds.maxX - 0.5
  let cursorY = bounds.minY + 0.5
  let rowMaxDepth = 0

  for (const item of items) {
    const cat = item.cat
    const totalW = cat.width + cat.clearance * 2 + PADDING
    const totalD = cat.depth + cat.clearance * 2 + PADDING
    let foundSpot = false

    for (let attempt = 0; attempt < 50 && !foundSpot; attempt++) {
      if (cursorX - cat.width / 2 - cat.clearance < bounds.minX + 0.3) {
        cursorX = bounds.maxX - 0.5
        cursorY += rowMaxDepth + PADDING
        rowMaxDepth = 0
      }

      if (cursorY + cat.depth / 2 + cat.clearance > bounds.maxY - 0.3) {
        break
      }

      const candidate: PlacedMachine = {
        id: generateId(),
        catalogId: item.id,
        x: cursorX - cat.width / 2,
        y: cursorY + cat.depth / 2,
        rotation: 0,
      }

      const validation = validatePlacement(candidate, placed, boundary, obstacles, restricted)
      if (validation.valid) {
        placed.push(candidate)
        cursorX -= totalW
        rowMaxDepth = Math.max(rowMaxDepth, totalD)
        foundSpot = true
      } else {
        cursorX -= 0.3
      }
    }
  }

  return placed
}

function arrangeCompressedCenter(
  items: { id: string; cat: MachineCatalogItem }[],
  boundary: Point[],
  obstacles: { id: string; points: Point[] }[],
  restricted: { id: string; points: Point[] }[]
): PlacedMachine[] {
  if (boundary.length < 3) return []
  const bounds = getPolygonBounds(boundary)
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2
  const placed: PlacedMachine[] = []
  const PADDING = 0.15

  let currentRadius = 0.5
  let placed_count = 0

  for (const item of items) {
    const cat = item.cat
    let foundSpot = false

    for (let attempt = 0; attempt < 100 && !foundSpot; attempt++) {
      const angle = (placed_count % 8) * (Math.PI * 2 / 8)
      const distance = currentRadius + (Math.floor(placed_count / 8) * 1.5)
      
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance

      const candidate: PlacedMachine = {
        id: generateId(),
        catalogId: item.id,
        x,
        y,
        rotation: 0,
      }

      const validation = validatePlacement(candidate, placed, boundary, obstacles, restricted)
      if (validation.valid) {
        placed.push(candidate)
        placed_count++
        foundSpot = true
      } else {
        currentRadius += 0.2
      }
    }
  }

  return placed
}

export function autoArrange(
  catalogIds: string[],
  boundary: Point[],
  obstacles: { id: string; points: Point[] }[],
  restricted: { id: string; points: Point[] }[],
  mode: ArrangementMode = "horizontal"
): PlacedMachine[] {
  if (boundary.length < 3) return []

  // Sort machines by size (largest first for better packing)
  const items = catalogIds
    .map((id) => ({ id, cat: getMachine(id) }))
    .filter((x): x is { id: string; cat: MachineCatalogItem } => !!x.cat)
    .sort((a, b) => (b.cat.width * b.cat.depth) - (a.cat.width * a.cat.depth))

  switch (mode) {
    case "vertical":
      return arrangeVertical(items, boundary, obstacles, restricted)
    case "compressed-left":
      return arrangeCompressedLeft(items, boundary, obstacles, restricted)
    case "compressed-right":
      return arrangeCompressedRight(items, boundary, obstacles, restricted)
    case "horizontal":
    default:
      return arrangeHorizontal(items, boundary, obstacles, restricted)
  }
}
