"use client"

import { useState, useEffect, useRef } from "react"
import { type PlacedMachine, type Unit } from "@/lib/planner/planner-types"
import { formatMachineDimensions } from "@/lib/planner/machine-catalog"
import { toDisplay } from "@/lib/planner/planner-types"
import { GripVertical, Search, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlanner } from "@/lib/planner/planner-context"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

interface MachinesListProps {
  unit: Unit
  placedMachines: PlacedMachine[]
  selectedMachineId?: string | null
  isCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

function getMobileImageUrl(imageUrl?: string) {
  return imageUrl?.replace("/media/desktop.png", "/media/mobile.png")
}

export function MachinesList({ unit, placedMachines, selectedMachineId, isCollapsed = false, onCollapsedChange }: MachinesListProps) {
  const { catalog, isCatalogLoading, catalogError } = usePlanner()
  const [search, setSearch] = useState("")
  const selectedItemRef = useRef<HTMLDivElement>(null)

  const handleToggleCollapse = () => {
    const newState = !isCollapsed
    onCollapsedChange?.(newState)
  }

  const normalizedSearch = search.trim().toLowerCase()
  const filtered = catalog.filter((m) => m.name.toLowerCase().includes(normalizedSearch))

  // Scroll to selected machine when selectedMachineId changes
  useEffect(() => {
    if (selectedMachineId && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [selectedMachineId])

  return (
    <div className={cn("flex h-full flex-col border-b lg:border-b-0 lg:border-r border-border bg-card transition-all duration-300", isCollapsed ? "w-24 lg:w-24" : "w-full lg:w-72")}>
      {/* Header - Fixed */}
      <div className="shrink-0 border-b border-border p-3 flex items-center justify-between gap-2">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-foreground flex-1">
            Course Holes <span suppressHydrationWarning className="text-muted-foreground">{placedMachines.length > 0 ? ` (${placedMachines.length})` : ""}</span>
          </h2>
        )}
        <button
          onClick={handleToggleCollapse}
          className="p-1.5 hover:bg-accent rounded-lg transition-colors flex-shrink-0"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </button>
      </div>
        
      {!isCollapsed && (
        <>
          {/* Search Input */}
          <div className="shrink-0 px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-input bg-background py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </>
      )}

      {/* Scrollable machines list - Fixed height showing ~5 machines */}
      <div className={cn("flex-1 min-h-0 overflow-y-auto machines-scroll bg-card transition-all", isCollapsed ? "p-1" : "p-3")}>
        <div className={cn("space-y-2", isCollapsed && "space-y-1")}>
          {filtered.length > 0 ? (
            filtered.map((machine) => {
              const count = placedMachines.filter((m) => m.catalogId === machine.id).length
              
              return (
                <Tooltip key={machine.id}>
                  <TooltipTrigger asChild>
                    <div
                      ref={selectedMachineId === machine.id ? selectedItemRef : null}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", machine.id)
                        e.dataTransfer.effectAllowed = "copy"
                      }}
                      className={cn(
                        "group cursor-grab rounded-lg border-2 bg-background active:cursor-grabbing transition-all relative flex gap-2 hover:border-yellow-300",
                        isCollapsed ? "flex-col items-center p-1" : "p-2 flex-row",
                        selectedMachineId === machine.id 
                          ? "border-yellow-400 shadow-lg shadow-yellow-400/30" 
                          : "border-border"
                      )}
                      onMouseEnter={(e) => {
                        if (selectedMachineId !== machine.id) {
                          e.currentTarget.style.borderColor = "#FBBF24"
                          e.currentTarget.style.boxShadow = "0 0 0 2px #FBBF24, 0 0 12px rgba(251, 191, 36, 0.3)"
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedMachineId !== machine.id) {
                          e.currentTarget.style.borderColor = ""
                          e.currentTarget.style.boxShadow = ""
                        }
                      }}
                    >
                      {/* Machine count indicator - always render to prevent hydration mismatch */}
                      <div suppressHydrationWarning className={cn("absolute flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 shadow-md font-bold text-xs", isCollapsed ? "-top-2 -right-1" : "-top-2 -right-2")} style={{ color: "#41059a", display: count > 0 ? "flex" : "none" }}>
                        {count}
                      </div>
                      
                      {/* Image */}
                      <div className={cn("shrink-0 rounded-lg bg-muted overflow-hidden", isCollapsed ? "w-16 h-16" : "w-16 h-16")}>
                        <img
                          src={getMobileImageUrl(machine.image)}
                          alt={machine.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Info - Hidden when collapsed */}
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="text-xs font-medium text-foreground truncate">{machine.name}</h3>
                            <div className="mt-0.5 text-xs text-muted-foreground font-mono">
                              {formatMachineDimensions(machine)}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Drag Handle - Hidden when collapsed */}
                      {!isCollapsed && (
                        <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                      )}
                    </div>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" className="border-0" style={{ backgroundColor: "#41059a" }}>
                      <div className="text-center">
                        <p className="font-medium text-white">{machine.name}</p>
                        <p className="text-xs text-yellow-300 mt-1">{formatMachineDimensions(machine)}</p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })
          ) : (
            <div className="py-4 text-center text-xs text-muted-foreground">
              {isCatalogLoading ? "Loading machines..." : "No machines found."}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className={cn("shrink-0 border-t border-border bg-muted transition-all", isCollapsed ? "p-1 text-center text-xs" : "p-2 text-center text-xs text-muted-foreground")}>
        {!isCollapsed && (
          catalogError ? `Using fallback data | Showing: ${filtered.length}` : `Total: ${catalog.length} | Showing: ${filtered.length}`
        )}
      </div>
    </div>
  )
}
