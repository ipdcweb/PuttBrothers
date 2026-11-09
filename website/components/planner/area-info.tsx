"use client"

import { useEffect, useState } from "react"
import { type Unit, type PlacedMachine, calculatePolygonsArea, calculatePlacedMachinesArea, formatArea } from "@/lib/planner/planner-types"
import { usePlanner } from "@/lib/planner/planner-context"

interface AreaInfoProps {
  boundaries: any[]
  obstacles: any[]
  restricted: any[]
  placedMachines: PlacedMachine[]
  unit: Unit
}

export function AreaInfo({ boundaries, obstacles, restricted, placedMachines, unit }: AreaInfoProps) {
  const { catalog } = usePlanner()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-5">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Total Space</span>
          <span className="text-xs font-semibold text-foreground sm:text-sm">-</span>
        </div>
      </div>
    )
  }

  const totalArea = calculatePolygonsArea(boundaries || [])
  const obstaclesArea = calculatePolygonsArea(obstacles || [])
  const restrictedArea = calculatePolygonsArea(restricted || [])
  const machinesArea = calculatePlacedMachinesArea(placedMachines, catalog)
  const availableArea = Math.max(0, totalArea - obstaclesArea - restrictedArea - machinesArea)

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-5">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Total Space</span>
        <span className="text-xs font-semibold text-foreground sm:text-sm">
          {formatArea(totalArea, unit)}
        </span>
      </div>

      {obstaclesArea > 0 && (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Obstacles</span>
          <span className="text-xs font-semibold text-foreground sm:text-sm">
            {formatArea(obstaclesArea, unit)}
          </span>
        </div>
      )}

      {restrictedArea > 0 && (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Restricted</span>
          <span className="text-xs font-semibold text-foreground sm:text-sm">
            {formatArea(restrictedArea, unit)}
          </span>
        </div>
      )}

      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Courses</span>
        <span className="text-xs font-semibold text-foreground sm:text-sm">
          {formatArea(machinesArea, unit)}
        </span>
      </div>

      {availableArea > 0 && (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Available</span>
          <span className="text-xs font-semibold text-green-700 sm:text-sm">
            {formatArea(availableArea, unit)}
          </span>
        </div>
      )}
    </div>
  )
}
