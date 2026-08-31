"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { usePlanner } from "@/lib/planner/planner-context"
import { getMachine } from "@/lib/planner/machine-catalog"
import type { PlacedMachine, Point } from "@/lib/planner/planner-types"
import { toDisplay } from "@/lib/planner/planner-types"
import { getMachineRect, getClearanceRect, getClearancePolygon, validatePlacement } from "@/lib/planner/validate-placement"
import { formatMachineDimensions } from "@/lib/planner/machine-catalog"

interface DimensionData {
  label: string
  screenX: number
  screenY: number
  angle: number
  color: string
  isVertical: boolean
  isAngle?: boolean
  arcRadius?: number
}

interface LayoutCanvasProps {
  selectedMachineId: string | null
  onSelectMachine: (id: string | null) => void
  onSelectTextLabel?: (id: string) => void
  onDropCatalogItem: (catalogId: string, x: number, y: number) => void
  zoom?: number
  onZoomChange?: (zoom: number) => void
}

const GRID_SIZE_M = 0.5
const SNAP = 0.25

function snapToGrid(val: number): number {
  return Math.round(val / SNAP) * SNAP
}

export function LayoutCanvas({ 
  selectedMachineId, 
  onSelectMachine, 
  onSelectTextLabel,
  onDropCatalogItem,
  zoom = 100,
  onZoomChange 
}: LayoutCanvasProps) {
  const { state, catalog, updateMachine, updateTextLabel } = usePlanner()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 })
  const [panOffset, setPanOffset] = useState({ x: 40, y: 40 })
  const baseScale = 40
  const scale = baseScale * (zoom / 100)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map())
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null)
  const [draggingLabelId, setDraggingLabelId] = useState<string | null>(null)
  const [labelDragOffset, setLabelDragOffset] = useState({ x: 0, y: 0 })
  const lastClickTimeRef = useRef<{ labelId: string | null; time: number }>({ labelId: null, time: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setCanvasSize({ w: width, h: height })
    })
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  const worldToScreen = useCallback((wx: number, wy: number) => ({
    x: wx * scale + panOffset.x,
    y: wy * scale + panOffset.y,
  }), [panOffset, scale])

  const screenToWorld = useCallback((sx: number, sy: number): Point => ({
    x: (sx - panOffset.x) / scale,
    y: (sy - panOffset.y) / scale,
  }), [panOffset, scale])

  // Validate all machines
  useEffect(() => {
    const errors = new Map<string, string>()
    state.placedMachines.forEach((m) => {
      // Validate against all boundaries
      let isValid = false
      let reason = "Course must be inside a boundary"
      
      if (state.boundaries && state.boundaries.length > 0) {
        for (const boundary of state.boundaries) {
          if (!boundary || !boundary.points || boundary.points.length < 3) continue
          const result = validatePlacement(m, state.placedMachines, boundary.points, state.obstacles || [], state.restricted || [])
          if (result.valid) {
            isValid = true
            break
          }
          reason = result.reason || reason
        }
      } else {
        // If no boundaries, validate without boundary check
        const result = validatePlacement(m, state.placedMachines, [], state.obstacles || [], state.restricted || [])
        isValid = result.valid
        reason = result.reason || reason
      }
      
      if (!isValid) {
        errors.set(m.id, reason)
      }
    })
    setValidationErrors(errors)
  }, [state.placedMachines, state.boundaries, state.obstacles, state.restricted, catalog])

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasSize.w * dpr
    canvas.height = canvasSize.h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Clear
    ctx.fillStyle = "#f8faf9"
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h)

    // Grid
    ctx.strokeStyle = "#e2e8e5"
    ctx.lineWidth = 0.5
    const gridPx = GRID_SIZE_M * scale
    const startX = panOffset.x % gridPx
    const startY = panOffset.y % gridPx
    for (let x = startX; x < canvasSize.w; x += gridPx) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasSize.h); ctx.stroke()
    }
    for (let y = startY; y < canvasSize.h; y += gridPx) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasSize.w, y); ctx.stroke()
    }

    // Major grid
    ctx.strokeStyle = "#d0d8d4"
    ctx.lineWidth = 1
    const majorPx = scale
    const mStartX = panOffset.x % majorPx
    const mStartY = panOffset.y % majorPx
    for (let x = mStartX; x < canvasSize.w; x += majorPx) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasSize.h); ctx.stroke()
    }
    for (let y = mStartY; y < canvasSize.h; y += majorPx) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasSize.w, y); ctx.stroke()
    }

    // Boundary
    // Draw boundaries
    if (state.boundaries && state.boundaries.length > 0) {
      state.boundaries.forEach((boundary) => {
        if (!boundary || !boundary.points || boundary.points.length < 2) return
        ctx.beginPath()
        const b0 = worldToScreen(boundary.points[0].x, boundary.points[0].y)
        ctx.moveTo(b0.x, b0.y)
        for (let i = 1; i < boundary.points.length; i++) {
          const p = worldToScreen(boundary.points[i].x, boundary.points[i].y)
          ctx.lineTo(p.x, p.y)
        }
        ctx.closePath()
        ctx.fillStyle = "rgba(45, 122, 79, 0.06)"
        ctx.fill()
        ctx.strokeStyle = "#2d7a4f"
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    // Obstacles
    if (state.obstacles && state.obstacles.length > 0) {
      state.obstacles.forEach((obs) => {
        if (!obs || !obs.points || obs.points.length < 2) return
        ctx.beginPath()
        const o0 = worldToScreen(obs.points[0].x, obs.points[0].y)
        ctx.moveTo(o0.x, o0.y)
        for (let i = 1; i < obs.points.length; i++) {
          const p = worldToScreen(obs.points[i].x, obs.points[i].y)
          ctx.lineTo(p.x, p.y)
        }
        ctx.closePath()
        ctx.fillStyle = "rgba(120, 113, 108, 0.2)"
        ctx.fill()
        ctx.strokeStyle = "#78716c"
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    // Restricted
    if (state.restricted && state.restricted.length > 0) {
      state.restricted.forEach((r) => {
        if (r.points.length < 2) return
        ctx.beginPath()
        const r0 = worldToScreen(r.points[0].x, r.points[0].y)
        ctx.moveTo(r0.x, r0.y)
        for (let i = 1; i < r.points.length; i++) {
          const p = worldToScreen(r.points[i].x, r.points[i].y)
          ctx.lineTo(p.x, p.y)
        }
        ctx.closePath()
        ctx.fillStyle = "rgba(220, 38, 38, 0.08)"
        ctx.fill()
        ctx.strokeStyle = "#dc2626"
        ctx.lineWidth = 2
        ctx.setLineDash([6, 3])
        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    // Machines
    state.placedMachines.forEach((m) => {
      const cat = getMachine(m.catalogId)
      if (!cat) return
      const rect = getMachineRect(m)
      const clearRect = getClearanceRect(m)
      const isSelected = m.id === selectedMachineId
      const hasError = validationErrors.has(m.id)

      // Clearance zone (rotated polygon)
      const clearPoly = getClearancePolygon(m)
      if (clearPoly.length > 0) {
        const clearPolyScreen = clearPoly.map((p) => worldToScreen(p.x, p.y))
        ctx.fillStyle = hasError ? "rgba(220, 38, 38, 0.06)" : "rgba(250, 204, 21, 0.08)"
        ctx.strokeStyle = hasError ? "rgba(220, 38, 38, 0.3)" : "rgba(250, 204, 21, 0.25)"
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(clearPolyScreen[0].x, clearPolyScreen[0].y)
        for (let i = 1; i < clearPolyScreen.length; i++) {
          ctx.lineTo(clearPolyScreen[i].x, clearPolyScreen[i].y)
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Machine body (with rotation)
      const ms = worldToScreen(m.x, m.y)
      const rotRad = (m.rotation * Math.PI) / 180
      
      ctx.save()
      ctx.translate(ms.x, ms.y)
      ctx.rotate(rotRad)
      
      const machineWidth = cat.width * scale
      const machineDepth = cat.depth * scale
      
      ctx.fillStyle = hasError ? "rgba(220, 38, 38, 0.5)" : cat.color + "cc"
      ctx.strokeStyle = isSelected ? "#facc15" : hasError ? "#dc2626" : cat.color
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.beginPath()
      ctx.roundRect(-machineWidth / 2, -machineDepth / 2, machineWidth, machineDepth, 4)
      ctx.fill()
      ctx.stroke()

      // Machine label with dimensions
      const fontSize = Math.max(10, Math.min(14, machineWidth * 0.12))
      ctx.fillStyle = "#fff"
      ctx.font = `${fontSize}px system-ui`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(cat.name, 0, -7)
      
      // Machine dimensions on second line
      const dimensionLabel = formatMachineDimensions(cat)
      const smallFontSize = Math.max(8, Math.min(10, machineWidth * 0.08))
      ctx.font = `${smallFontSize}px system-ui`
      ctx.fillText(dimensionLabel, 0, 9)
      
      // Rotation indicator (small arrow pointing forward)
      if (isSelected || m.rotation !== 0) {
        ctx.strokeStyle = isSelected ? "#facc15" : "#fff"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, -machineDepth / 2 - 8)
        ctx.lineTo(0, -machineDepth / 2 - 4)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(-2, -machineDepth / 2 - 6)
        ctx.lineTo(0, -machineDepth / 2 - 4)
        ctx.lineTo(2, -machineDepth / 2 - 6)
        ctx.stroke()
      }
      
      ctx.restore()

      // Dimensions
      if (isSelected) {
        ctx.fillStyle = "#555"
        ctx.font = "11px system-ui"
        const dimW = toDisplay(cat.width, state.unit).toFixed(1)
        const dimH = toDisplay(cat.depth, state.unit).toFixed(1)
        ctx.fillText(
          `${dimW} x ${dimH} ${state.unit}`,
          ms.x,
          ms.y + machineDepth / 2 + 14
        )
      }
    })

    // Dimension annotations (cotas)
    const dimensions: DimensionData[] = []

    // Helper function to collect dimension data
    const collectDimension = (p1: Point, p2: Point, color: string) => {
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const length = Math.sqrt(dx * dx + dy * dy)
      
      // Skip if line length is too small
      if (length < 0.01) return
      
      const distance = toDisplay(length, state.unit)
      const mx = (p1.x + p2.x) / 2
      const my = (p1.y + p2.y) / 2
      const screenMid = worldToScreen(mx, my)
      const angle = Math.atan2(dy, dx)
      const isVertical = Math.abs(Math.cos(angle)) < Math.abs(Math.sin(angle))
      const label = `${distance.toFixed(2)}`
      
      dimensions.push({
        label,
        screenX: screenMid.x,
        screenY: screenMid.y,
        angle,
        color,
        isVertical,
      })
    }

    const collectAngleDimension = (p0: Point, p1: Point, p2: Point, color: string) => {
      const v1x = p0.x - p1.x
      const v1y = p0.y - p1.y
      const v2x = p2.x - p1.x
      const v2y = p2.y - p1.y
      
      const angle1 = Math.atan2(v1y, v1x)
      const angle2 = Math.atan2(v2y, v2x)
      let angleDiff = angle2 - angle1
      
      while (angleDiff < 0) angleDiff += Math.PI * 2
      while (angleDiff > Math.PI * 2) angleDiff -= Math.PI * 2
      
      const angleDegrees = (angleDiff * 180) / Math.PI
      
      // Skip if angle is 0 degrees or 90 degrees
      if (Math.abs(angleDegrees) < 1 || Math.abs(angleDegrees - 360) < 1) return
      if (Math.abs(angleDegrees - 90) < 2 || Math.abs(angleDegrees - 270) < 2) return
      
      const midAngle = (angle1 + angle2) / 2
      const distance = 0.5
      const labelX = p1.x + Math.cos(midAngle) * distance
      const labelY = p1.y + Math.sin(midAngle) * distance
      const screenLabel = worldToScreen(labelX, labelY)
      
      const displayAngle = angleDegrees > 180 ? 360 - angleDegrees : angleDegrees
      const label = `${displayAngle.toFixed(1)}°`
      
      dimensions.push({
        label,
        screenX: screenLabel.x,
        screenY: screenLabel.y,
        angle: midAngle,
        color,
        isVertical: false,
        isAngle: true,
        arcRadius: 0.3,
      })
    }
    
    // Collect dimensions from boundaries
    if (state.boundaries && state.boundaries.length > 0) {
      state.boundaries.forEach((boundary) => {
        if (boundary && boundary.points && boundary.points.length > 1) {
          for (let i = 0; i < boundary.points.length; i++) {
            const p1 = boundary.points[i]
            const p2 = boundary.points[(i + 1) % boundary.points.length]
            collectDimension(p1, p2, "#2d7a4f")
            
            const p0 = boundary.points[(i - 1 + boundary.points.length) % boundary.points.length]
            collectAngleDimension(p0, p1, p2, "#2d7a4f")
          }
        }
      })
    }

    if (state.obstacles && state.obstacles.length > 0) {
      state.obstacles.forEach((obs) => {
        if (obs && obs.points && obs.points.length > 1) {
          for (let i = 0; i < obs.points.length; i++) {
            const p1 = obs.points[i]
            const p2 = obs.points[(i + 1) % obs.points.length]
            collectDimension(p1, p2, "#78716c")
            
            const p0 = obs.points[(i - 1 + obs.points.length) % obs.points.length]
            collectAngleDimension(p0, p1, p2, "#78716c")
          }
        }
      })
    }

    if (state.restricted && state.restricted.length > 0) {
      state.restricted.forEach((r) => {
        if (r && r.points && r.points.length > 1) {
          for (let i = 0; i < r.points.length; i++) {
            const p1 = r.points[i]
            const p2 = r.points[(i + 1) % r.points.length]
            collectDimension(p1, p2, "#dc2626")
            
            const p0 = r.points[(i - 1 + r.points.length) % r.points.length]
            collectAngleDimension(p0, p1, p2, "#dc2626")
          }
        }
      })
    }

    // Draw all dimensions with white background
    dimensions.forEach((dim) => {
      ctx.save()
      
      // For angle dimensions, draw an arc first
      if (dim.isAngle && dim.arcRadius) {
        ctx.strokeStyle = dim.color
        ctx.lineWidth = 1
        const arcRadiusScreen = dim.arcRadius * scale
        ctx.beginPath()
        ctx.arc(dim.screenX, dim.screenY, arcRadiusScreen, dim.angle - 0.3, dim.angle + 0.3, false)
        ctx.stroke()
      }
      
      // Translate to dimension position
      ctx.translate(dim.screenX, dim.screenY)
      
      if (dim.isVertical && !dim.isAngle) {
        ctx.rotate(Math.PI / 2)
      }
      
      // Measure text to create background rectangle
      ctx.font = "10px system-ui"
      const textMetrics = ctx.measureText(dim.label)
      const textWidth = textMetrics.width
      const textHeight = 12
      const padding = 4
      
      // Draw white background rectangle
      ctx.fillStyle = "white"
      ctx.fillRect(-textWidth / 2 - padding, -textHeight / 2, textWidth + padding * 2, textHeight)
      
      // Draw text
      ctx.fillStyle = dim.color
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(dim.label, 0, 0)
      
      ctx.restore()
    })

    // Scale indicator
    const scaleBarM = scale >= 30 ? 1 : scale >= 15 ? 2 : 5
    const scaleBarPx = scaleBarM * scale
    ctx.fillStyle = "#555"
    ctx.font = "12px system-ui"
    ctx.fillText(
      `${toDisplay(scaleBarM, state.unit).toFixed(1)} ${state.unit}`,
      canvasSize.w - scaleBarPx - 20,
      canvasSize.h - 20
    )
    ctx.fillStyle = "#2d7a4f"
    ctx.fillRect(canvasSize.w - scaleBarPx - 20, canvasSize.h - 15, scaleBarPx, 3)

    // Draw text labels
    if (state.textLabels && state.textLabels.length > 0) {
      state.textLabels.forEach((label) => {
        const screenPos = worldToScreen(label.x, label.y)
        
        ctx.save()
        ctx.translate(screenPos.x, screenPos.y)
        
        // Draw selection highlight if selected
        if (selectedLabelId === label.id) {
          const fontSize = label.fontSize || 16
          ctx.font = `${fontSize}px system-ui`
          const textMetrics = ctx.measureText(label.text)
          const textWidth = textMetrics.width
          const padding = 8
          
          ctx.fillStyle = "rgba(250, 204, 21, 0.2)"
          ctx.strokeStyle = "rgba(250, 204, 21, 0.8)"
          ctx.lineWidth = 2
          ctx.roundRect(-textWidth / 2 - padding, -fontSize / 2 - padding, textWidth + padding * 2, fontSize + padding * 2, 4)
          ctx.fill()
          ctx.stroke()
        }
        
        ctx.font = `${label.fontSize}px system-ui`
        ctx.fillStyle = label.color || "#000000"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(label.text, 0, 0)
        
        ctx.restore()
      })
    }
  }, [canvasSize, panOffset, scale, state, worldToScreen, selectedMachineId, selectedLabelId, validationErrors, catalog])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const world = screenToWorld(sx, sy)

    // Check if clicking on a text label
    if (state.textLabels && state.textLabels.length > 0) {
      for (let i = state.textLabels.length - 1; i >= 0; i--) {
        const label = state.textLabels[i]
        const screenPos = worldToScreen(label.x, label.y)
        
        // Simple hitbox detection for text (approximate based on text size)
        const hitboxRadius = (label.fontSize || 16) * 2
        const dx = sx - screenPos.x
        const dy = sy - screenPos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < hitboxRadius) {
          // Check for double click
          const now = Date.now()
          const isDoubleClick = 
            lastClickTimeRef.current.labelId === label.id && 
            now - lastClickTimeRef.current.time < 300
          
          lastClickTimeRef.current = { labelId: label.id, time: now }
          
          if (isDoubleClick) {
            // Double click - open edit mode for text label
            if (onSelectTextLabel) {
              onSelectTextLabel(label.id)
            }
            return
          }
          
          // Single click - select and prepare for drag
          setSelectedLabelId(label.id)
          setDraggingLabelId(label.id)
          setLabelDragOffset({ x: world.x - label.x, y: world.y - label.y })
          return
        }
      }
    }

    // Check if clicking on a machine
    for (let i = state.placedMachines.length - 1; i >= 0; i--) {
      const m = state.placedMachines[i]
      const mr = getMachineRect(m)
      if (world.x >= mr.x && world.x <= mr.x + mr.w && world.y >= mr.y && world.y <= mr.y + mr.h) {
        onSelectMachine(m.id)
        setDraggingId(m.id)
        setDragOffset({ x: world.x - m.x, y: world.y - m.y })
        return
      }
    }

    // Otherwise deselect and start panning
    onSelectMachine(null)
    setSelectedLabelId(null)
    setIsPanning(true)
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
  }, [screenToWorld, worldToScreen, state.placedMachines, state.textLabels, onSelectMachine, onSelectTextLabel, panOffset])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const world = screenToWorld(sx, sy)

    // Check if double-clicking on a machine to highlight it in the machines list
    for (let i = state.placedMachines.length - 1; i >= 0; i--) {
      const m = state.placedMachines[i]
      const mr = getMachineRect(m)
      if (world.x >= mr.x && world.x <= mr.x + mr.w && world.y >= mr.y && world.y <= mr.y + mr.h) {
        // Pass the placed machine ID (not catalogId)
        onSelectMachine(m.id)
        return
      }
    }
  }, [screenToWorld, state.placedMachines, onSelectMachine])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
      return
    }

    // Handle text label dragging
    if (draggingLabelId) {
      const rect = canvasRef.current!.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const world = screenToWorld(sx, sy)
      const snappedX = snapToGrid(world.x - labelDragOffset.x)
      const snappedY = snapToGrid(world.y - labelDragOffset.y)
      updateTextLabel(draggingLabelId, { x: snappedX, y: snappedY })
      return
    }

    if (draggingId) {
      const rect = canvasRef.current!.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const world = screenToWorld(sx, sy)
      const snappedX = snapToGrid(world.x - dragOffset.x)
      const snappedY = snapToGrid(world.y - dragOffset.y)
      updateMachine(draggingId, { x: snappedX, y: snappedY })
    }
  }, [isPanning, panStart, draggingId, dragOffset, draggingLabelId, labelDragOffset, screenToWorld, updateMachine, updateTextLabel])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    setDraggingId(null)
    setDraggingLabelId(null)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    // Wheel events are disabled - use zoom control buttons instead
  }, [])

  // Handle drag and drop from catalog
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const catalogId = e.dataTransfer.getData("text/plain")
    if (!catalogId) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const world = screenToWorld(sx, sy)
    onDropCatalogItem(catalogId, snapToGrid(world.x), snapToGrid(world.y))
  }, [screenToWorld, onDropCatalogItem])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-card"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: canvasSize.w,
          height: canvasSize.h,
          cursor: draggingId ? "grabbing" : "default",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      />
      {/* Validation error tooltip */}
      {selectedMachineId && validationErrors.has(selectedMachineId) && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive shadow-lg">
          {validationErrors.get(selectedMachineId)}
        </div>
      )}
    </div>
  )
}
