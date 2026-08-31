import type { MachineCatalogItem } from "./planner-types"
import { COURSE_HOLES_DATA, COURSE_HOLES_CATEGORIES } from "./course-holes-data"

/**
 * Machine Catalog - Re-exports data from course-holes-data.ts
 * This maintains backward compatibility while allowing easy AWS integration
 */
export const MACHINE_CATALOG: MachineCatalogItem[] = [...COURSE_HOLES_DATA]

export const CATEGORIES = COURSE_HOLES_CATEGORIES

export function setMachineCatalog(catalog: MachineCatalogItem[]) {
  MACHINE_CATALOG.splice(0, MACHINE_CATALOG.length, ...(catalog.length > 0 ? catalog : COURSE_HOLES_DATA))
}

export function getMachine(id: string): MachineCatalogItem | undefined {
  return MACHINE_CATALOG.find((m) => m.id === id)
}

export function formatMachineDimensions(machine: MachineCatalogItem): string {
  const height = machine.height || 1.5
  const width = machine.width
  const depth = machine.depth
  
  return `H${height.toFixed(1)} × W${width.toFixed(1)} × D${depth.toFixed(1)}`
}
