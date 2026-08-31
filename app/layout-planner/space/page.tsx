"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProgressStepper } from "@/components/planner/progress-stepper"
import { SpaceCanvas } from "@/components/planner/space-canvas"
import { ZoomControl } from "@/components/planner/zoom-control"
import { LabelEditorDialog } from "@/components/planner/label-editor-dialog"
import { SpaceConfirmationDialog } from "@/components/planner/space-confirmation-dialog"
import { usePlanner } from "@/lib/planner/planner-context"
import { toDisplay, type Point, type TextLabel, calculatePolygonsArea, formatArea } from "@/lib/planner/planner-types"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  MousePointer2,
  Pentagon,
  Square,
  ShieldAlert,
  ArrowRight,
  Undo2,
  Redo2,
  Hand,
  Type,
} from "lucide-react"
import { HelpPanel } from "@/components/planner/help-panel"
import { cn } from "@/lib/utils"

type Tool = "pan" | "select" | "boundary" | "obstacle" | "restricted" | "text"

const TOOLS: { id: Tool; label: string; icon: typeof MousePointer2; hint: string }[] = [
  { id: "select", label: "Select", icon: MousePointer2, hint: "Click to select shapes. Shift+drag to pan." },
  { id: "boundary", label: "Boundary", icon: Pentagon, hint: "Click to place points. Double-click to close the boundary polygon." },
  { id: "obstacle", label: "Obstacle", icon: Square, hint: "Draw obstacles like walls, pillars, or counters." },
  { id: "restricted", label: "Restricted", icon: ShieldAlert, hint: "Mark areas where machines cannot be placed." },
  { id: "text", label: "Text", icon: Type, hint: "Click to add text labels. Double-click to edit." },
]

export default function SpacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, setUnit, undo, redo, canUndo, canRedo, updateTextLabel, resetPlannerState } = usePlanner()
  const [activeTool, setActiveTool] = useState<Tool>("boundary")
  const [selection, setSelection] = useState<{ type: string; id?: string; points?: Point[] } | null>(null)
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([])
  const [zoom, setZoom] = useState(100)
  const [editingLabel, setEditingLabel] = useState<TextLabel | null>(null)
  const [labelEditorOpen, setLabelEditorOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [showHelpTooltip, setShowHelpTooltip] = useState(true)

  // Auto-dismiss the help tooltip after 8 seconds
  useEffect(() => {
    if (searchParams.get("embedded") === "1") {
      window.sessionStorage.setItem("puttbrothers-planner-mode", "embedded")
    }
    const plannerEmail = searchParams.get("email")
    if (plannerEmail) {
      window.sessionStorage.setItem("puttbrothers-planner-email", plannerEmail)
    }
    if (searchParams.get("new") === "1") {
      resetPlannerState()
    }

    const timer = setTimeout(() => {
      setShowHelpTooltip(false)
    }, 8000)
    return () => clearTimeout(timer)
  }, [searchParams, resetPlannerState])

  const canContinue = (state.boundaries?.length ?? 0) > 0 && (state.boundaries ?? []).every(b => (b.points?.length ?? 0) >= 3)

  const handleLabelSave = (updatedLabel: TextLabel) => {
    updateTextLabel(updatedLabel.id, updatedLabel)
  }

  const handleContinueToLayout = () => {
    setConfirmationOpen(true)
  }

  const handleConfirmAndContinue = () => {
    setConfirmationOpen(false)
    router.push("/layout-planner/editor")
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-dvh flex-col overflow-hidden">
        <ProgressStepper currentStep={0} />

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/* Main canvas area */}
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Action bar */}
            <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
              <div className="flex items-center gap-1">
                {/* Help button - First button */}
                <Popover open={showHelpTooltip} onOpenChange={setShowHelpTooltip}>
                  <PopoverTrigger asChild>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setHelpOpen(true)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors text-white hover:opacity-80 font-bold text-lg ${
                            showHelpTooltip ? "onboarding-pulse" : ""
                          }`}
                          style={{ backgroundColor: "#FF8C42" }}
                          aria-label="Help"
                        >
                          ?
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={0} className="border-0 max-w-xs" style={{ backgroundColor: "#FF8C42" }}>
                        <p className="font-medium text-white">Help</p>
                        <p className="text-xs text-white mt-1">Learn how to use each tool and function in the Space editor</p>
                      </TooltipContent>
                    </Tooltip>
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="start" className="w-72 bg-white border-2 border-[#FF8C42] shadow-xl rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF8C42] flex items-center justify-center text-white font-bold text-sm">?</div>
                        <div>
                          <p className="font-bold text-foreground text-sm">Welcome to the Space Editor!</p>
                          <p className="text-xs text-muted-foreground mt-1">Click the Help button (?) above to learn how to use all the tools and features. We have everything explained step-by-step to help you create your perfect layout.</p>
              </div>

              {/* Onboarding message balloon */}
              {showHelpTooltip && (
                <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative bg-white border-2 border-[#FF8C42] rounded-lg shadow-lg p-3 w-64">
                    {/* Arrow pointing up to Help button */}
                    <div className="absolute -top-2 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-[#FF8C42]" />
                    <div className="absolute -top-1.5 left-4.5 w-0 h-0 border-l-3.5 border-r-3.5 border-b-3.5 border-l-transparent border-r-transparent border-b-white" />
                    
                    <div className="space-y-2">
                      <p className="font-bold text-sm text-foreground">Help & Guidance</p>
                      <p className="text-xs text-muted-foreground">Click the Help button (?) to access complete guides and tutorials on how to use all the tools in the Space Editor.</p>
                      <button
                        onClick={() => setShowHelpTooltip(false)}
                        className="text-xs font-medium text-[#FF8C42] hover:text-[#41059a] transition-colors"
                      >
                        Got it →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
                      <button
                        onClick={() => {
                          setHelpOpen(true)
                          setShowHelpTooltip(false)
                        }}
                        className="w-full px-3 py-2 bg-[#FF8C42] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Open Help Guide
                      </button>
                      <button
                        onClick={() => setShowHelpTooltip(false)}
                        className="w-full px-3 py-2 bg-gray-100 text-foreground rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Got it, continue
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="h-5 w-px bg-border" />

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={undo}
                      disabled={!canUndo}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
                      aria-label="Undo"
                    >
                      <Undo2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={0} className="border-0" style={{ backgroundColor: "#41059a" }}>
                    <p className="font-medium text-white">Undo</p>
                    <p className="text-xs text-yellow-300">Revert your last action</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={redo}
                      disabled={!canRedo}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
                      aria-label="Redo"
                    >
                      <Redo2 className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={0} className="border-0" style={{ backgroundColor: "#41059a" }}>
                    <p className="font-medium text-white">Redo</p>
                    <p className="text-xs text-yellow-300">Redo your last undone action</p>
                  </TooltipContent>
                </Tooltip>

                <ZoomControl zoom={zoom} onZoomChange={setZoom} />

                <div className="h-5 w-px bg-border" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setActiveTool("pan")}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                        activeTool === "pan"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                      aria-label="Pan"
                    >
                      <Hand className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={0} className="border-0" style={{ backgroundColor: "#41059a" }}>
                      <p className="font-medium text-white">Pan</p>
                      <p className="text-xs text-yellow-300">Move around the layout by dragging</p>
                    </TooltipContent>
                </Tooltip>

                {/* Tool buttons with notification badges */}
                {TOOLS.map((tool) => (
                  <Tooltip key={tool.id}>
                    <TooltipTrigger asChild>
                        <button
                          onClick={() => setActiveTool(tool.id)}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors relative",
                            activeTool === tool.id
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                          aria-label={tool.label}
                        >
                          <tool.icon className="h-4 w-4" />
                          {/* Notification badges - Always render all to prevent hydration mismatch */}
                          {tool.id === "boundary" && <div suppressHydrationWarning className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: (state.boundaries?.length ?? 0) > 0 ? "#FBBF24" : "transparent", color: (state.boundaries?.length ?? 0) > 0 ? "#41059a" : "transparent" }}>{(state.boundaries?.length ?? 0) > 0 ? state.boundaries?.length : ""}</div>}
                          {tool.id === "obstacle" && <div suppressHydrationWarning className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: (state.obstacles?.length ?? 0) > 0 ? "#FBBF24" : "transparent", color: (state.obstacles?.length ?? 0) > 0 ? "#41059a" : "transparent" }}>{(state.obstacles?.length ?? 0) > 0 ? state.obstacles?.length : ""}</div>}
                          {tool.id === "restricted" && <div suppressHydrationWarning className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: (state.restricted?.length ?? 0) > 0 ? "#FBBF24" : "transparent", color: (state.restricted?.length ?? 0) > 0 ? "#41059a" : "transparent" }}>{(state.restricted?.length ?? 0) > 0 ? state.restricted?.length : ""}</div>}
                        </button>
                      </TooltipTrigger>
                    <TooltipContent side="bottom" className="border-0" style={{ backgroundColor: "#41059a" }}>
                      <p className="font-medium text-white">{tool.label}</p>
                      <p className="text-xs text-yellow-300">{tool.hint}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}

                <div className="h-5 w-px bg-border" />

                {/* Unit toggle buttons */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                      <button
                        onClick={() => setUnit("m")}
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-medium transition-colors min-h-[32px]",
                          state.unit === "m" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card"
                        )}
                      >
                        m
                      </button>
                      <button
                        onClick={() => setUnit("ft")}
                        className={cn(
                          "rounded-md px-2 py-1 text-xs font-medium transition-colors min-h-[32px]",
                          state.unit === "ft" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card"
                        )}
                      >
                        ft
                      </button>
                    </div>
                  </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={0} className="border-0" style={{ backgroundColor: "#41059a" }}>
                      <p className="font-medium text-white">Boundary</p>
                      <p className="text-xs text-yellow-300">Draw the boundary of your layout area</p>
                    </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <SpaceCanvas
              activeTool={activeTool}
              onSelectionChange={setSelection}
              onDrawingPointsChange={setDrawingPoints}
              onLabelEdit={(label) => {
                setEditingLabel(label)
                setLabelEditorOpen(true)
              }}
              zoom={zoom}
              onZoomChange={setZoom}
            />
            </div>

            {/* Bottom bar - 3 column layout */}
            <div className="sticky bottom-0 z-20 shrink-0 border-t border-border bg-card px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] sm:px-4">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto] md:items-center">
                {/* Left column - Area information */}
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs sm:text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Total Space</span>
                    <span suppressHydrationWarning className="font-semibold text-foreground">
                      {formatArea(calculatePolygonsArea(state.boundaries || []), state.unit)}
                    </span>
                  </div>

                  <div suppressHydrationWarning className="flex flex-col" style={{ display: calculatePolygonsArea(state.obstacles || []) > 0 ? "flex" : "none" }}>
                    <span className="text-muted-foreground">Obstacles</span>
                    <span suppressHydrationWarning className="font-semibold text-foreground">
                      {formatArea(calculatePolygonsArea(state.obstacles || []), state.unit)}
                    </span>
                  </div>

                  <div suppressHydrationWarning className="flex flex-col" style={{ display: calculatePolygonsArea(state.restricted || []) > 0 ? "flex" : "none" }}>
                    <span className="text-muted-foreground">Restricted</span>
                    <span suppressHydrationWarning className="font-semibold text-foreground">
                      {formatArea(calculatePolygonsArea(state.restricted || []), state.unit)}
                    </span>
                  </div>

                  <div suppressHydrationWarning className="flex flex-col" style={{ display: (calculatePolygonsArea(state.boundaries || []) - calculatePolygonsArea(state.obstacles || []) - calculatePolygonsArea(state.restricted || [])) !== calculatePolygonsArea(state.boundaries || []) ? "flex" : "none" }}>
                    <span className="text-muted-foreground">Available</span>
                    <span suppressHydrationWarning className="font-semibold text-green-700">
                      {formatArea(
                        Math.max(0, calculatePolygonsArea(state.boundaries || []) - calculatePolygonsArea(state.obstacles || []) - calculatePolygonsArea(state.restricted || [])),
                        state.unit
                      )}
                    </span>
                  </div>
                </div>

                {/* Center column - status messages */}
                <div className="flex justify-center md:justify-end">
                  {drawingPoints.length > 0 && (
                    <div className="flex min-h-10 items-center overflow-hidden rounded-lg border border-yellow-300 bg-yellow-100 px-3 py-2 text-center text-xs font-medium text-foreground sm:text-sm">
                      {drawingPoints.length} points placed. Double-click to close shape (min 3 points).
                    </div>
                  )}
                  {activeTool === "select" && drawingPoints.length === 0 && (
                    <div className="flex min-h-10 items-center overflow-hidden rounded-lg border border-yellow-300 bg-yellow-100 px-3 py-2 text-center text-xs font-medium text-foreground sm:text-sm">
                      Click to select an object to edit or delete
                    </div>
                  )}
                </div>

                {/* Right column - continue button */}
                <div className="flex justify-end">
                <Button
                  onClick={handleContinueToLayout}
                  disabled={!canContinue}
                  suppressHydrationWarning
                  className="min-h-10 w-full md:w-auto"
                >
                  Continue to Layout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                </div>
              </div>
            </div>

          </main>

          {/* Inspector panel */}
          {selection && selection.points && (
            <aside className="border-t border-border bg-card p-4 lg:border-l lg:border-t-0 lg:w-64">
              <h3 className="text-sm font-semibold text-foreground mb-3 capitalize">
                {selection.type} Inspector
              </h3>
              <div className="space-y-2">
                {selection.points.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-muted text-xs font-mono text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="font-mono text-foreground">
                      {toDisplay(p.x, state.unit).toFixed(2)}, {toDisplay(p.y, state.unit).toFixed(2)} {state.unit}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>

        {/* Label Editor Dialog */}
        <LabelEditorDialog
          label={editingLabel}
          open={labelEditorOpen}
          onOpenChange={setLabelEditorOpen}
          onSave={handleLabelSave}
        />

        {/* Space Confirmation Dialog */}
        <SpaceConfirmationDialog
          open={confirmationOpen}
          onOpenChange={setConfirmationOpen}
          onConfirm={handleConfirmAndContinue}
          state={state}
        />

        {/* Help Panel */}
        <HelpPanel
          isOpen={helpOpen}
          onClose={() => setHelpOpen(false)}
          title="Space Editor Help"
          description="Define your space boundaries, obstacles, and restricted areas. This is where you set up the foundation for your course layout."
          videoUrl="https://youtu.be/ydCZnFjFwrw"
          tools={[
            {
              name: 'Boundary',
              icon: <Pentagon className="w-5 h-5" />,
              description: 'Define the outer perimeter of your space. Click to place points and double-click to close the polygon. This creates the main boundary of your facility.',
              borderColor: '#7c3aed'
            },
            {
              name: 'Select',
              icon: <MousePointer2 className="w-5 h-5" />,
              description: 'Select and modify existing shapes. Click on the corner (vertex) of a shape to select it. Once selected, drag to move or adjust its position. To delete a selected shape, click the red delete button or press the Delete key.',
              borderColor: '#3b82f6'
            },
            {
              name: 'Obstacle',
              icon: <Square className="w-5 h-5" />,
              description: 'Mark obstacles like walls, pillars, counters, or any permanent structures. Click points to define the obstacle shape.',
              borderColor: '#f59e0b'
            },
            {
              name: 'Restricted',
              icon: <ShieldAlert className="w-5 h-5" />,
              description: 'Define areas where course machines cannot be placed. Use this for walkways, exits, or other restricted zones.',
              borderColor: '#ef4444'
            },
            {
              name: 'Text',
              icon: <Type className="w-5 h-5" />,
              description: 'Add text labels to identify areas or add notes. Click to place a label, then use the Select tool and click on the text to edit its content.',
              borderColor: '#a855f7'
            },
            {
              name: 'Pan',
              icon: <Hand className="w-5 h-5" />,
              description: 'Move around the canvas. Click and drag to navigate. Useful when zoomed in for detailed work.',
              borderColor: '#06b6d4'
            }
          ]}
          tips={[
            'Always start by defining your boundary - this is required to continue',
            'Use obstacles and restricted areas to accurately represent your space layout',
            'Add text labels to clearly identify different areas (e.g., "Entrance", "Checkout")',
            'Use Undo if you make a mistake'
          ]}
        />
      </div>
    </TooltipProvider>
  )
}
