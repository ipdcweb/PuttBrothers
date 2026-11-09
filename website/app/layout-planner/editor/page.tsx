"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ProgressStepper } from "@/components/planner/progress-stepper"
import { LayoutCanvas } from "@/components/planner/layout-canvas"
import { MachinesList } from "@/components/planner/machines-list"
import { RotationControl } from "@/components/planner/rotation-control"
import { ZoomControl } from "@/components/planner/zoom-control"
import { ArrangeDropdown } from "@/components/planner/arrange-dropdown"
import { LayoutConfirmationDialog } from "@/components/planner/layout-confirmation-dialog"
import { LabelEditorDialog } from "@/components/planner/label-editor-dialog"
import { HelpPanel } from "@/components/planner/help-panel"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import type { ArrangementMode } from "@/lib/planner/auto-arrange"
import { usePlanner } from "@/lib/planner/planner-context"
import { getMachine, formatMachineDimensions } from "@/lib/planner/machine-catalog"
import { generateId } from "@/lib/planner/planner-store"
import { autoArrange } from "@/lib/planner/auto-arrange"
import { toDisplay, type TextLabel } from "@/lib/planner/planner-types"
import { cn } from "@/lib/utils"
import { AreaInfo } from "@/components/planner/area-info"
import { Button } from "@/components/ui/button"
import {
  Undo2,
  Redo2,
  Copy,
  Trash2,
  ArrowRight,
  AlertCircle,
  ZoomIn,
} from "lucide-react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

function getMobileImageUrl(imageUrl?: string | null) {
  return imageUrl?.replace("/media/desktop.png", "/media/mobile.png") || null
}

export default function LayoutPage() {
  const router = useRouter()
  const {
    state,
    placeMachine,
    updateMachine,
    removeMachine,
    setPlacedMachines,
    undo,
    redo,
    canUndo,
    canRedo,
    updateTextLabel,
    catalog,
  } = usePlanner()

  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [helpOpen, setHelpOpen] = useState(false)
  const [arrangementMode, setArrangementMode] = useState<ArrangementMode>("horizontal")
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState<TextLabel | null>(null)
  const [labelEditorOpen, setLabelEditorOpen] = useState(false)
  const [isCollapsedMachinesList, setIsCollapsedMachinesList] = useState(false)
  const [isProductPreviewOpen, setIsProductPreviewOpen] = useState(false)

  // Get catalogId from selectedMachineId
  const selectedMachineCatalogId = selectedMachineId 
    ? state.placedMachines.find(m => m.id === selectedMachineId)?.catalogId 
    : null

  // Get machine image from catalog
  const selectedMachineImage = selectedMachineCatalogId 
    ? catalog.find(m => m.id === selectedMachineCatalogId)?.image
    : null
  const selectedMachineMobileImage = getMobileImageUrl(selectedMachineImage)

  const selectedMachineName = selectedMachineCatalogId
    ? catalog.find(m => m.id === selectedMachineCatalogId)?.name
    : null

  const selectedMachineDimensions = selectedMachineCatalogId
    ? catalog.find(m => m.id === selectedMachineCatalogId)
    : null

  const handleContinueToSummary = () => {
    setConfirmationOpen(true)
  }

  const handleConfirmAndContinue = () => {
    setConfirmationOpen(false)
    router.push("/layout-planner/summary")
  }

  const handleSelectTextLabel = useCallback((labelId: string) => {
    const label = state.textLabels?.find(l => l.id === labelId)
    if (label) {
      setEditingLabel(label)
      setLabelEditorOpen(true)
    }
  }, [state.textLabels])

  const handleLabelSave = (updatedLabel: TextLabel) => {
    updateTextLabel(updatedLabel.id, updatedLabel)
    setLabelEditorOpen(false)
    setEditingLabel(null)
  }

  const handleDropCatalogItem = useCallback(
    (catalogId: string, x: number, y: number) => {
      placeMachine({
        id: generateId(),
        catalogId,
        x,
        y,
        rotation: 0,
      })
    },
    [placeMachine]
  )

  const handleRotate = useCallback(
    (degrees: number) => {
      if (!selectedMachineId) return
      updateMachine(selectedMachineId, { rotation: degrees })
    },
    [selectedMachineId, updateMachine]
  )

  const handleDuplicate = useCallback(() => {
    if (!selectedMachineId) return
    const machine = state.placedMachines.find((m) => m.id === selectedMachineId)
    if (!machine) return
    const newMachine = {
      ...machine,
      id: generateId(),
      x: machine.x + 0.5,
      y: machine.y + 0.5,
    }
    placeMachine(newMachine)
    setSelectedMachineId(newMachine.id)
  }, [selectedMachineId, state.placedMachines, placeMachine])

  const handleDelete = useCallback(() => {
    if (!selectedMachineId) return
    removeMachine(selectedMachineId)
    setSelectedMachineId(null)
  }, [selectedMachineId, removeMachine])

  const handleAutoArrange = useCallback(
    (mode: ArrangementMode) => {
      if (state.boundaries.length === 0 || state.boundaries.every(b => b.points.length < 3)) return
      setArrangementMode(mode)
      // Use existing catalog ids from placed machines, or default set
      const catalogIds = state.placedMachines.length > 0
        ? state.placedMachines.map((m) => m.catalogId)
        : catalog.slice(0, 5).map((machine) => machine.id)
      if (catalogIds.length === 0) return
      // Use the first boundary as the main boundary for arrangement
      const mainBoundary = state.boundaries.find(b => b.points.length >= 3)
      if (!mainBoundary) return
      const arranged = autoArrange(catalogIds, mainBoundary.points, state.obstacles, state.restricted, mode)
      if (arranged.length > 0) {
        setPlacedMachines(arranged)
      }
    },
    [state, setPlacedMachines, catalog]
  )

  const selectedMachine = selectedMachineId
    ? state.placedMachines.find((m) => m.id === selectedMachineId)
    : null
  const selectedCatalog = selectedMachine ? getMachine(selectedMachine.catalogId) : null

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <ProgressStepper currentStep={1} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Machines sidebar - with internal scroll only */}
        <div className={cn("w-full lg:border-r border-border overflow-hidden transition-all duration-300", isCollapsedMachinesList ? "lg:w-24" : "w-full lg:w-72")}>
          <MachinesList 
            unit={state.unit} 
            placedMachines={state.placedMachines} 
            selectedMachineId={selectedMachineCatalogId}
            isCollapsed={isCollapsedMachinesList}
            onCollapsedChange={setIsCollapsedMachinesList}
          />
        </div>

        {/* Main area - no page scroll, only internal content scrolls */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Action bar */}
          <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-2">
            <div className="flex items-center gap-1">
              {/* Help button - First button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setHelpOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors text-white hover:opacity-80 font-bold text-lg"
                    style={{ backgroundColor: "#FF8C42" }}
                    aria-label="Help"
                  >
                    ?
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="border-0 max-w-xs" style={{ backgroundColor: "#FF8C42" }}>
                  <p className="font-medium text-white">Help</p>
                  <p className="text-xs text-white mt-1">Learn how to use the Layout editor tools</p>
                </TooltipContent>
              </Tooltip>

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
                <TooltipContent side="bottom" className="border-0" style={{ backgroundColor: "#41059a" }}>
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
                <TooltipContent side="bottom" className="border-0" style={{ backgroundColor: "#41059a" }}>
                  <p className="font-medium text-white">Redo</p>
                  <p className="text-xs text-yellow-300">Redo your last undone action</p>
                </TooltipContent>
              </Tooltip>

              <ZoomControl zoom={zoom} onZoomChange={setZoom} />

              <div className="h-5 w-px bg-border" />

              {selectedMachineId && (
                <div className="flex items-center gap-1">
                  <RotationControl
                    rotation={selectedMachine?.rotation ?? 0}
                    onRotationChange={handleRotate}
                  />
                  <button
                    onClick={handleDuplicate}
                    className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Duplicate</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <ArrangeDropdown onArrange={handleAutoArrange} />
            </div>
          </div>

          {/* Canvas area */}
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Canvas */}
            <div className="relative min-h-0 flex-1 overflow-hidden">
            <LayoutCanvas
              selectedMachineId={selectedMachineId}
              onSelectMachine={setSelectedMachineId}
              onSelectTextLabel={handleSelectTextLabel}
              onDropCatalogItem={handleDropCatalogItem}
              zoom={zoom}
              onZoomChange={setZoom}
            />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="sticky bottom-0 z-20 flex shrink-0 flex-col gap-2 border-t border-border bg-card px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] sm:px-4">
            {/* Area information section - aligned left with buttons on right */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Space counters - left side using client component */}
              <AreaInfo
                boundaries={state.boundaries || []}
                obstacles={state.obstacles || []}
                restricted={state.restricted || []}
                placedMachines={state.placedMachines}
                unit={state.unit}
              />

              {/* Navigation buttons - right side */}
              <Button
                onClick={handleContinueToSummary}
                suppressHydrationWarning
                disabled={state.placedMachines.length === 0}
                className="min-h-10 w-full sm:w-auto"
              >
                Continue to Summary
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>

        {/* Machines sidebar closing */}
      </div>

      {/* Layout Confirmation Dialog */}
      <LayoutConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        onConfirm={handleConfirmAndContinue}
        state={state}
      />

      {/* Text Label Editor Dialog */}
      {editingLabel && (
        <LabelEditorDialog
          open={labelEditorOpen}
          onOpenChange={setLabelEditorOpen}
          label={editingLabel}
          onSave={handleLabelSave}
        />
      )}

      {/* Help Panel */}
      <HelpPanel
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Layout Editor Help"
        description="Place your machines in the space and organize them efficiently. Define the layout that works best for your facility."
        videoUrl="https://www.youtube.com/watch?v=89MtB1ZOAxQ"
        tools={[
          {
            name: 'Undo',
            icon: <Undo2 className="w-5 h-5" />,
            description: 'Revert your last action. Use this if you make a mistake placing or moving a machine.',
            borderColor: '#7c3aed'
          },
          {
            name: 'Redo',
            icon: <Redo2 className="w-5 h-5" />,
            description: 'Redo your last undone action. Restore the action you just reverted.',
            borderColor: '#3b82f6'
          },
          {
            name: 'Zoom',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="9" r="6" strokeWidth="2"/><path d="M21 21l-4.35-4.35" strokeWidth="2"/></svg>,
            description: 'Adjust the zoom level for better precision. Use zoom in/out controls to focus on specific areas.',
            borderColor: '#f59e0b'
          },
          {
            name: 'Rotation',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 14a2 2 0 1 1 2-2" strokeWidth="2"/><path d="M17 14a2 2 0 1 0-2-2" strokeWidth="2"/><path d="M12 2v10" strokeWidth="2"/></svg>,
            description: 'Rotate selected machines to adjust their orientation. Select a machine first to use this.',
            borderColor: '#ef4444'
          },
          {
            name: 'Duplicate',
            icon: <Copy className="w-5 h-5" />,
            description: 'Create a copy of the selected machine. Useful when placing similar machines in different locations.',
            borderColor: '#a855f7'
          },
          {
            name: 'Delete',
            icon: <Trash2 className="w-5 h-5" />,
            description: 'Remove the selected machine from the layout. You can always undo this action.',
            borderColor: '#06b6d4'
          },
          {
            name: 'Arrange',
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v18H3z" strokeWidth="2"/><path d="M3 9h18M9 3v18M15 3v18" strokeWidth="2"/></svg>,
            description: 'Automatically organize machines in the layout. Options include: Compress Top (organize courses at the top), Compress Bottom (organize courses at the bottom), Compress Left (pack courses from left edge), and Compress Right (pack courses from right edge).',
            borderColor: '#8b5cf6'
          }
        ]}
        tips={[
          'Click on any machine in the canvas to select it, then use the tools above',
          'Use drag and drop to move machines around the layout',
          'Use the Arrange dropdown to automatically organize machines',
          'Zoom in for precise placement and rotation',
          'Use Undo frequently to experiment without losing work'
        ]}
      />

      {/* Selected Machine Preview Card - Floating */}
      {selectedMachineImage && selectedMachineName && (
        <div className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-xl border border-border p-4 max-w-xs animate-in fade-in slide-in-from-bottom-4">
          <div className="relative">
            <button
              onClick={() => setSelectedMachineId(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600"
              aria-label="Close product preview"
            >
              ✕
            </button>
            <div className="bg-muted rounded-lg overflow-hidden mb-3 h-40 flex items-center justify-center">
              <img
                src={selectedMachineMobileImage || selectedMachineImage}
                alt={selectedMachineName}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="relative pr-10">
              <h3 className="font-semibold text-foreground text-sm text-center">{selectedMachineName}</h3>
              {selectedMachineDimensions && (
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {formatMachineDimensions(selectedMachineDimensions)}
                </p>
              )}
              <button
                onClick={() => setIsProductPreviewOpen(true)}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#41059a] text-white shadow-md transition hover:scale-105 hover:bg-[#ffcc00] hover:text-[#41059a]"
                aria-label="Expand product preview"
                title="Expand preview"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Product Preview Modal */}
      {isProductPreviewOpen && selectedMachineImage && selectedMachineName && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <button
            className="absolute inset-0 cursor-default"
            aria-label="Close expanded product preview"
            onClick={() => setIsProductPreviewOpen(false)}
          />
          <div className="relative w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setIsProductPreviewOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition hover:bg-red-500 hover:text-white"
              aria-label="Close expanded product preview"
            >
              ✕
            </button>
            <div className="grid max-h-[88dvh] grid-cols-1 overflow-y-auto md:grid-cols-[1.5fr_1fr]">
              <div className="flex min-h-[320px] items-center justify-center bg-muted p-6 md:min-h-[560px]">
                <img
                  src={selectedMachineImage}
                  alt={selectedMachineName}
                  className="max-h-[72dvh] w-full object-contain"
                />
              </div>
              <div className="flex flex-col justify-center p-6 md:p-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#41059a]">Course Hole</p>
                <h2 className="text-2xl font-bold text-foreground">{selectedMachineName}</h2>
                {selectedMachineDimensions && (
                  <p className="mt-3 font-mono text-sm text-muted-foreground">
                    {formatMachineDimensions(selectedMachineDimensions)}
                  </p>
                )}
                {selectedCatalog?.description && (
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    {selectedCatalog.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
