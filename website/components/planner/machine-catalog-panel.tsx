"use client"

import { useState } from "react"
import { toDisplay, type Unit, type PlacedMachine } from "@/lib/planner/planner-types"
import { Search, GripVertical } from "lucide-react"
import { usePlanner } from "@/lib/planner/planner-context"

interface MachineCatalogPanelProps {
  unit: Unit
  placedMachines: PlacedMachine[]
}

export function MachineCatalogPanel({ unit, placedMachines }: MachineCatalogPanelProps) {
  const { catalog } = usePlanner()
  const [search, setSearch] = useState("")

  const normalizedSearch = search.trim().toLowerCase()
  const filtered = catalog.filter((m) => {
    return m.name.toLowerCase().includes(normalizedSearch) ||
      m.description?.toLowerCase().includes(normalizedSearch)
  })

  return (
    <aside className="flex h-full flex-col border-b border-border bg-card lg:w-72 lg:border-b-0 lg:border-r">
      {/* Header - Fixed */}
      <div className="shrink-0 border-b border-border p-3">
        <h2 className="mb-2 text-sm font-semibold text-foreground">Course Holes</h2>
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
          />
        </div>
      </div>
      
      {/* Scrollable machines list */}
      <div className="flex-1 overflow-y-auto p-3 machines-scroll">
        <div className="space-y-2">
          {filtered.map((machine) => {
            const isUsed = placedMachines.some((m) => m.catalogId === machine.id)
            
            return (
            <div
              key={machine.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", machine.id)
                e.dataTransfer.effectAllowed = "copy"
              }}
              className="group cursor-grab rounded-lg border border-border bg-background hover:border-primary/30 hover:shadow-sm active:cursor-grabbing transition-all relative"
            >
              {/* Machine count indicator */}
              {(() => {
                const count = placedMachines.filter((m) => m.catalogId === machine.id).length
                return count > 0 ? (
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 shadow-md" style={{ color: "#41059a" }}>
                    <span className="text-xs font-bold">{count}</span>
                  </div>
                ) : null
              })()}
              
              <div className="flex gap-2 p-2">
                {/* Image */}
                <div className="shrink-0 w-20 h-20 rounded-lg bg-muted overflow-hidden">
                  <img
                    src={machine.image}
                    alt={machine.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-medium text-foreground truncate">{machine.name}</h3>
                    <div className="mt-0.5 text-xs text-muted-foreground font-mono">
                      {toDisplay(machine.width, unit).toFixed(1)} x {toDisplay(machine.depth, unit).toFixed(1)}{unit} + {toDisplay(machine.clearance, unit).toFixed(1)}{unit}
                    </div>
                  </div>
                </div>
                
                {/* Drag Handle */}
                <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity self-center" />
              </div>
            </div>
            )
          })}
        </div>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No courses found.
          </div>
        )}
      </div>

      {/* Footer - Fixed */}
      <div className="shrink-0 border-t border-border bg-muted p-3 text-center text-xs text-muted-foreground">
        Total Course Holes: {catalog.length}
      </div>
    </aside>
  )
}
