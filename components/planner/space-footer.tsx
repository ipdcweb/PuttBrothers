"use client"

import { usePlanner } from "@/lib/planner/planner-context"
import { calculatePolygonsArea, formatArea } from "@/lib/planner/planner-types"

export function SpaceFooter() {
  const { state } = usePlanner()

  // Calculate total areas
  const boundariesArea = calculatePolygonsArea(state.boundaries || [])
  const obstaclesArea = calculatePolygonsArea(state.obstacles || [])
  const restrictedArea = calculatePolygonsArea(state.restricted || [])
  const availableArea = boundariesArea - obstaclesArea - restrictedArea

  return (
    <div className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between gap-8">
        {/* Left column: Area information */}
        <div className="flex gap-8 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-600">Total Space</span>
            <span className="font-semibold text-gray-900">
              {formatArea(boundariesArea, state.unit)}
            </span>
          </div>

          {obstaclesArea > 0 && (
            <div className="flex flex-col">
              <span className="text-gray-600">Obstacles</span>
              <span className="font-semibold text-gray-900">
                {formatArea(obstaclesArea, state.unit)}
              </span>
            </div>
          )}

          {restrictedArea > 0 && (
            <div className="flex flex-col">
              <span className="text-gray-600">Restricted</span>
              <span className="font-semibold text-gray-900">
                {formatArea(restrictedArea, state.unit)}
              </span>
            </div>
          )}

          <div className="flex flex-col border-l border-gray-200 pl-8">
            <span className="text-gray-600">Available</span>
            <span className="font-semibold text-green-700">
              {formatArea(availableArea, state.unit)}
            </span>
          </div>
        </div>

        {/* Center and Right: Reserved for messages and button (via page layout) */}
      </div>
    </div>
  )
}
