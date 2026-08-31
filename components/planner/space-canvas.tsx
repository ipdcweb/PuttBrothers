"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { usePlanner } from "@/lib/planner/planner-context"
import { toDisplay, toMeters, type Point, type Polygon, type TextLabel } from "@/lib/planner/planner-types"
import { generateId } from "@/lib/planner/planner-store"

type Tool = "pan" | "select" | "boundary" | "obstacle" | "restricted" | "text"

const GRID_SIZE_M = 0.5 // half-meter grid
const SNAP = 0.25

function snapToGrid(val: number): number {
  return Math.round(val / SNAP) * SNAP
}

interface SpaceCanvasProps {
  activeTool: Tool
  onSelectionChange: (info: { type: string; id?: string; points?: Point[] } | null) => void
  onDrawingPointsChange?: (points: Point[]) => void
  onLabelEdit?: (label: TextLabel) => void
  zoom?: number
  onZoomChange?: (zoom: number) => void
}

export function SpaceCanvas({ activeTool, onSelectionChange, onDrawingPointsChange, onLabelEdit, zoom = 100, onZoomChange }: SpaceCanvasProps) {
  const { state, addBoundary, removeBoundary, addObstacle, addRestricted, removeObstacle, removeRestricted, addTextLabel, updateTextLabel, removeTextLabel } = usePlanner()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 })
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([])
  const [panOffset, setPanOffset] = useState({ x: 40, y: 40 })
  const baseScale = 40 // pixels per meter at 100% zoom
  const scale = (baseScale * zoom) / 100
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<{ type: string; id?: string } | null>(null)
  const [mousePos, setMousePos] = useState<Point | null>(null)
  const [mouseScreenPos, setMouseScreenPos] = useState({ x: 0, y: 0 })
  const [editingLabel, setEditingLabel] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(new Set())

  // Resize observer
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

  // Convert screen coords to world coords
  const screenToWorld = useCallback((sx: number, sy: number): Point => ({
    x: (sx - panOffset.x) / scale,
    y: (sy - panOffset.y) / scale,
  }), [panOffset, scale])

  // Convert world to screen
  const worldToScreen = useCallback((wx: number, wy: number) => ({
    x: wx * scale + panOffset.x,
    y: wy * scale + panOffset.y,
  }), [panOffset, scale])

  // Notify parent of drawing points changes
  useEffect(() => {
    onDrawingPointsChange?.(drawingPoints)
  }, [drawingPoints, onDrawingPointsChange])

  // Draw the canvas
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
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasSize.h)
      ctx.stroke()
    }
    for (let y = startY; y < canvasSize.h; y += gridPx) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasSize.w, y)
      ctx.stroke()
    }

    // Major grid (every 1m)
    ctx.strokeStyle = "#d0d8d4"
    ctx.lineWidth = 1
    const majorPx = scale
    const mStartX = panOffset.x % majorPx
    const mStartY = panOffset.y % majorPx
    for (let x = mStartX; x < canvasSize.w; x += majorPx) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvasSize.h)
      ctx.stroke()
    }
    for (let y = mStartY; y < canvasSize.h; y += majorPx) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasSize.w, y)
      ctx.stroke()
    }

    // Draw boundary
    // Draw boundaries
    if (state.boundaries && state.boundaries.length > 0) {
      state.boundaries.forEach((boundary) => {
        if (boundary && boundary.points && boundary.points.length > 0) {
          ctx.beginPath()
          const b0 = worldToScreen(boundary.points[0].x, boundary.points[0].y)
          ctx.moveTo(b0.x, b0.y)
          for (let i = 1; i < boundary.points.length; i++) {
            const p = worldToScreen(boundary.points[i].x, boundary.points[i].y)
            ctx.lineTo(p.x, p.y)
          }
          ctx.closePath()
          ctx.fillStyle = "rgba(45, 122, 79, 0.08)"
          ctx.fill()
          ctx.strokeStyle = selectedItem?.type === "boundary" && selectedItem?.id === boundary.id ? "#1a5c38" : "#2d7a4f"
          ctx.lineWidth = selectedItem?.type === "boundary" && selectedItem?.id === boundary.id ? 3 : 2
          ctx.stroke()

          // Draw boundary points
          boundary.points.forEach((p) => {
            const sp = worldToScreen(p.x, p.y)
            ctx.beginPath()
            ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2)
            ctx.fillStyle = "#2d7a4f"
            ctx.fill()
          })
        }
      })
    }

    // Draw obstacles
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
        ctx.fillStyle = "rgba(120, 113, 108, 0.25)"
        ctx.fill()
        const isSelected = selectedItem?.id === obs.id
        ctx.strokeStyle = isSelected ? "#44403c" : "#78716c"
        ctx.lineWidth = isSelected ? 3 : 2
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    // Draw restricted areas
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
      ctx.fillStyle = "rgba(220, 38, 38, 0.10)"
      ctx.fill()
      const isSelected = selectedItem?.id === r.id
      ctx.strokeStyle = isSelected ? "#b91c1c" : "#dc2626"
      ctx.lineWidth = isSelected ? 3 : 2
      ctx.setLineDash([6, 3])
      ctx.stroke()
      ctx.setLineDash([])
    })

    // Drawing in progress
    if (drawingPoints.length > 0) {
      ctx.beginPath()
      const d0 = worldToScreen(drawingPoints[0].x, drawingPoints[0].y)
      ctx.moveTo(d0.x, d0.y)
      for (let i = 1; i < drawingPoints.length; i++) {
        const dp = worldToScreen(drawingPoints[i].x, drawingPoints[i].y)
        ctx.lineTo(dp.x, dp.y)
      }
      ctx.strokeStyle =
        activeTool === "boundary" ? "#2d7a4f" :
        activeTool === "obstacle" ? "#78716c" : "#dc2626"
      ctx.lineWidth = 2
      ctx.setLineDash([3, 3])
      ctx.stroke()
      ctx.setLineDash([])

      drawingPoints.forEach((p) => {
        const sp = worldToScreen(p.x, p.y)
        ctx.beginPath()
        ctx.arc(sp.x, sp.y, 5, 0, Math.PI * 2)
        ctx.fillStyle =
          activeTool === "boundary" ? "#2d7a4f" :
          activeTool === "obstacle" ? "#78716c" : "#dc2626"
        ctx.fill()
        ctx.strokeStyle = "#fff"
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    // Helper function to collect and draw dimensions with white background
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
    
    const dimensions: DimensionData[] = []

    // Helper function to collect dimension data
    const collectDimension = (p1: Point, p2: Point, color: string) => {
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const length = Math.sqrt(dx * dx + dy * dy)
      
      // Skip if line length is too small (approximately zero)
      if (length < 0.01) {
        return
      }
      
      const distance = toDisplay(length, state.unit)
      
      // Midpoint - position directly on the line
      const mx = (p1.x + p2.x) / 2
      const my = (p1.y + p2.y) / 2
      const screenMid = worldToScreen(mx, my)
      
      // Line angle
      const angle = Math.atan2(dy, dx)
      
      // Check if line is more vertical or horizontal
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
      // Calculate angle at vertex p1 between edges p0->p1 and p1->p2
      const v1x = p0.x - p1.x
      const v1y = p0.y - p1.y
      const v2x = p2.x - p1.x
      const v2y = p2.y - p1.y
      
      // Calculate angle using atan2
      const angle1 = Math.atan2(v1y, v1x)
      const angle2 = Math.atan2(v2y, v2x)
      let angleDiff = angle2 - angle1
      
      // Normalize to 0-360 range
      while (angleDiff < 0) angleDiff += Math.PI * 2
      while (angleDiff > Math.PI * 2) angleDiff -= Math.PI * 2
      
      // Convert to degrees
      const angleDegrees = (angleDiff * 180) / Math.PI
      
      // Skip if angle is 0 degrees (collinear points) with small tolerance
      if (Math.abs(angleDegrees) < 1 || Math.abs(angleDegrees - 360) < 1) {
        return
      }
      
      // Only show if angle is NOT 90 degrees (with 2 degree tolerance)
      if (Math.abs(angleDegrees - 90) < 2 || Math.abs(angleDegrees - 270) < 2) {
        return
      }
      
      // Position the angle label near the vertex, offset outward
      const midAngle = (angle1 + angle2) / 2
      const distance = 0.5 // 0.5 meters out from vertex
      const labelX = p1.x + Math.cos(midAngle) * distance
      const labelY = p1.y + Math.sin(midAngle) * distance
      const screenLabel = worldToScreen(labelX, labelY)
      
      // Use the smaller angle if over 180 degrees
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
        arcRadius: 0.3, // 0.3 meters for the arc radius
      })
    }
    
    // Collect all dimensions
    if (state.boundaries && state.boundaries.length > 0) {
      state.boundaries.forEach((boundary) => {
        if (boundary && boundary.points && boundary.points.length > 1) {
          for (let i = 0; i < boundary.points.length; i++) {
            const p1 = boundary.points[i]
            const p2 = boundary.points[(i + 1) % boundary.points.length]
            collectDimension(p1, p2, "#2d7a4f")
            
            // Collect angle dimensions for vertices
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
            
            // Collect angle dimensions for vertices
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
            
            // Collect angle dimensions for vertices
            const p0 = r.points[(i - 1 + r.points.length) % r.points.length]
            collectAngleDimension(p0, p1, p2, "#dc2626")
          }
        }
      })
    }

    // Collect dimensions for drawing in progress
    if (drawingPoints.length > 1) {
      for (let i = 0; i < drawingPoints.length; i++) {
        const p1 = drawingPoints[i]
        const p2 = drawingPoints[(i + 1) % drawingPoints.length]
        const color =
          activeTool === "boundary" ? "#2d7a4f" :
          activeTool === "obstacle" ? "#78716c" : "#dc2626"
        collectDimension(p1, p2, color)
        
        // Collect angle dimensions for drawing in progress
        const p0 = drawingPoints[(i - 1 + drawingPoints.length) % drawingPoints.length]
        collectAngleDimension(p0, p1, p2, color)
      }
    }

    // Draw preview line from last point to current mouse position
    if (drawingPoints.length > 0 && mousePos && (activeTool === "boundary" || activeTool === "obstacle" || activeTool === "restricted")) {
      const lastPoint = drawingPoints[drawingPoints.length - 1]
      const lastScreenPos = worldToScreen(lastPoint.x, lastPoint.y)
      const currentScreenPos = worldToScreen(mousePos.x, mousePos.y)
      
      // Draw preview line
      ctx.strokeStyle = activeTool === "boundary" ? "#2d7a4f" : activeTool === "obstacle" ? "#78716c" : "#dc2626"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(lastScreenPos.x, lastScreenPos.y)
      ctx.lineTo(currentScreenPos.x, currentScreenPos.y)
      ctx.stroke()
      ctx.setLineDash([])
      
      // Draw preview dimension
      const dx = mousePos.x - lastPoint.x
      const dy = mousePos.y - lastPoint.y
      const length = Math.sqrt(dx * dx + dy * dy)
      
      if (length >= 0.01) {
        const distance = toDisplay(length, state.unit)
        const midX = (lastPoint.x + mousePos.x) / 2
        const midY = (lastPoint.y + mousePos.y) / 2
        const midScreenPos = worldToScreen(midX, midY)
        
        const angle = Math.atan2(dy, dx)
        const isVertical = Math.abs(Math.cos(angle)) < Math.abs(Math.sin(angle))
        const label = `${distance.toFixed(2)}`
        
        ctx.save()
        ctx.translate(midScreenPos.x, midScreenPos.y)
        
        if (isVertical) {
          ctx.rotate(Math.PI / 2)
        }
        
        ctx.font = "10px system-ui"
        const textMetrics = ctx.measureText(label)
        const textWidth = textMetrics.width
        const textHeight = 12
        const padding = 4
        
        ctx.fillStyle = "white"
        ctx.fillRect(-textWidth / 2 - padding, -textHeight / 2, textWidth + padding * 2, textHeight)
        
        ctx.fillStyle = activeTool === "boundary" ? "#2d7a4f" : activeTool === "obstacle" ? "#78716c" : "#dc2626"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(label, 0, 0)
        
        ctx.restore()
      }
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

    // Draw text labels
    if (state.textLabels && state.textLabels.length > 0) {
      state.textLabels.forEach((label) => {
        const screenPos = worldToScreen(label.x, label.y)
        const isSingleSelected = selectedItem?.type === "text" && selectedItem?.id === label.id
        const isMultiSelected = selectedLabels.has(label.id)
        const isSelected = isSingleSelected || isMultiSelected
        
        ctx.save()
        ctx.translate(screenPos.x, screenPos.y)
        
        ctx.font = `${label.fontSize}px system-ui`
        const textMetrics = ctx.measureText(label.text)
        const textWidth = textMetrics.width
        const textHeight = label.fontSize + 4
        const padding = 6
        
        // Draw background box with different colors for single vs multi-select
        if (isMultiSelected && !isSingleSelected) {
          // Multi-selected: blue background
          ctx.fillStyle = "rgba(59, 130, 246, 0.3)"
          ctx.strokeStyle = "#3B82F6"
          ctx.lineWidth = 3
        } else if (isSingleSelected) {
          // Single selected: gold background
          ctx.fillStyle = "rgba(255, 223, 0, 0.3)"
          ctx.strokeStyle = "#FFD700"
          ctx.lineWidth = 3
        } else {
          // Not selected: white background
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
          ctx.strokeStyle = "#333"
          ctx.lineWidth = 1
        }
        ctx.fillRect(-textWidth / 2 - padding, -textHeight / 2, textWidth + padding * 2, textHeight)
        ctx.strokeRect(-textWidth / 2 - padding, -textHeight / 2, textWidth + padding * 2, textHeight)
        
        // Draw text
        ctx.fillStyle = "#000"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(label.text, 0, 0)
        
        ctx.restore()
      })
    }

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
  }, [canvasSize, panOffset, scale, state, drawingPoints, activeTool, worldToScreen, selectedItem, selectedLabels, mousePos])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const world = screenToWorld(sx, sy)
    const snapped: Point = { x: snapToGrid(world.x), y: snapToGrid(world.y) }

    if (activeTool === "text") {
      // Generate next label: A, B, C, ... Z, AA, AB, etc.
      const getNextLabel = () => {
        const existingLabels = state.textLabels.map(l => l.text)
        let nextLabel = "A"
        let index = 0
        
        // Find the first unused letter
        while (existingLabels.includes(nextLabel)) {
          index++
          if (index < 26) {
            nextLabel = String.fromCharCode(65 + index) // A=65, B=66, etc.
          } else {
            // If we've used all single letters, use AA, AB, AC, etc.
            const firstLetter = String.fromCharCode(65 + Math.floor((index - 26) / 26))
            const secondLetter = String.fromCharCode(65 + ((index - 26) % 26))
            nextLabel = firstLetter + secondLetter
          }
        }
        return nextLabel
      }
      
      // Add new text label with auto-incrementing value
      addTextLabel({
        id: generateId(),
        text: getNextLabel(),
        x: world.x,
        y: world.y,
        fontSize: 16,
      })
      return
    }

    if (activeTool === "select") {
      // Check if clicking on text label
      for (const label of state.textLabels) {
        const screenPos = worldToScreen(label.x, label.y)
        if (Math.abs(screenPos.x - sx) < 30 && Math.abs(screenPos.y - sy) < 20) {
          // Shift+Click for multi-select
          if (e.shiftKey) {
            const newSelected = new Set(selectedLabels)
            if (newSelected.has(label.id)) {
              newSelected.delete(label.id)
            } else {
              newSelected.add(label.id)
            }
            setSelectedLabels(newSelected)
            setSelectedItem(null)
          } else {
            // Regular click: single select for editing
            setSelectedItem({ type: "text", id: label.id })
            setEditingLabel(label.id)
            setEditingText(label.text)
            setSelectedLabels(new Set()) // Clear multi-selection
            onSelectionChange({ type: "text", id: label.id })
          }
          return
        }
      }
      
      // If clicking on empty space, clear selections
      if (!e.shiftKey) {
        setSelectedLabels(new Set())
      }
      // Check if clicking on boundary
      for (const boundary of state.boundaries) {
        const bp = boundary.points.some((p) => {
          const sp = worldToScreen(p.x, p.y)
          return Math.abs(sp.x - sx) < 10 && Math.abs(sp.y - sy) < 10
        })
        if (bp) {
          setSelectedItem({ type: "boundary", id: boundary.id })
          onSelectionChange({ type: "boundary", id: boundary.id, points: boundary.points })
          return
        }
      }
      // Check obstacles
      for (const obs of state.obstacles) {
        const hit = obs.points.some((p) => {
          const sp = worldToScreen(p.x, p.y)
          return Math.abs(sp.x - sx) < 10 && Math.abs(sp.y - sy) < 10
        })
        if (hit) {
          setSelectedItem({ type: "obstacle", id: obs.id })
          onSelectionChange({ type: "obstacle", id: obs.id, points: obs.points })
          return
        }
      }
      // Check restricted
      for (const r of state.restricted) {
        const hit = r.points.some((p) => {
          const sp = worldToScreen(p.x, p.y)
          return Math.abs(sp.x - sx) < 10 && Math.abs(sp.y - sy) < 10
        })
        if (hit) {
          setSelectedItem({ type: "restricted", id: r.id })
          onSelectionChange({ type: "restricted", id: r.id, points: r.points })
          return
        }
      }
      setSelectedItem(null)
      setEditingLabel(null)
      onSelectionChange(null)
      return
    }

    // Drawing tools
    if (activeTool === "boundary" || activeTool === "obstacle" || activeTool === "restricted") {
      setDrawingPoints((prev) => [...prev, snapped])
    }
  }, [activeTool, isPanning, screenToWorld, worldToScreen, state, onSelectionChange, addTextLabel])

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "select" && editingLabel === null) {
      // Check if double-clicking on text label to edit
      const rect = canvasRef.current!.getBoundingClientRect()
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      
      for (const label of state.textLabels) {
        const screenPos = worldToScreen(label.x, label.y)
        if (Math.abs(screenPos.x - sx) < 30 && Math.abs(screenPos.y - sy) < 20) {
          // Trigger label edit callback
          onLabelEdit?.(label)
          return
        }
      }
    }
    
    if (drawingPoints.length < 3) return

    if (activeTool === "boundary") {
      addBoundary({ id: generateId(), points: drawingPoints, label: "Boundary" })
    } else if (activeTool === "obstacle") {
      addObstacle({ id: generateId(), points: drawingPoints, label: "Obstacle" })
    } else if (activeTool === "restricted") {
      addRestricted({ id: generateId(), points: drawingPoints, label: "Restricted" })
    }
    setDrawingPoints([])
  }, [drawingPoints, activeTool, addBoundary, addObstacle, addRestricted, state.textLabels, worldToScreen, editingLabel, onLabelEdit])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || activeTool === "pan" || (e.button === 0 && activeTool === "select" && e.shiftKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }, [activeTool, panOffset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
    }
    
    // Capture mouse position for preview line
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      const world = screenToWorld(sx, sy)
      setMousePos(world)
      setMouseScreenPos({ x: sx, y: sy })
    }
  }, [isPanning, panStart, screenToWorld])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Handle touch events for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0]
      setTouchStart({ x: t.clientX, y: t.clientY })
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStart) {
      const t = e.touches[0]
      const dx = t.clientX - touchStart.x
      const dy = t.clientY - touchStart.y
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
        setTouchStart({ x: t.clientX, y: t.clientY })
      }
    }
  }, [touchStart])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart && e.changedTouches.length === 1) {
      const t = e.changedTouches[0]
      const dx = Math.abs(t.clientX - touchStart.x)
      const dy = Math.abs(t.clientY - touchStart.y)
      if (dx < 5 && dy < 5) {
        // It's a tap - simulate click
        const rect = canvasRef.current!.getBoundingClientRect()
        const sx = t.clientX - rect.left
        const sy = t.clientY - rect.top
        const world = screenToWorld(sx, sy)
        const snapped: Point = { x: snapToGrid(world.x), y: snapToGrid(world.y) }
        if (activeTool !== "select") {
          setDrawingPoints((prev) => [...prev, snapped])
        }
      }
    }
    setTouchStart(null)
  }, [touchStart, screenToWorld, activeTool])

  const deleteSelected = useCallback(() => {
    // Delete multi-selected text labels first
    if (selectedLabels.size > 0) {
      selectedLabels.forEach((labelId) => {
        removeTextLabel(labelId)
      })
      setSelectedLabels(new Set())
      setSelectedItem(null)
      return
    }

    // Delete single selected item
    if (!selectedItem) return
    if (selectedItem.type === "boundary" && selectedItem.id) {
      removeBoundary(selectedItem.id)
    } else if (selectedItem.type === "obstacle" && selectedItem.id) {
      removeObstacle(selectedItem.id)
    } else if (selectedItem.type === "restricted" && selectedItem.id) {
      removeRestricted(selectedItem.id)
    } else if (selectedItem.type === "text" && selectedItem.id) {
      removeTextLabel(selectedItem.id)
    }
    setSelectedItem(null)
    setEditingLabel(null)
    onSelectionChange(null)
  }, [selectedItem, selectedLabels, removeBoundary, removeObstacle, removeRestricted, removeTextLabel, onSelectionChange])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't handle delete/backspace if editing a text label
      if (editingLabel) return
      
      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected()
      }
      if (e.key === "Escape") {
        setDrawingPoints([])
        setSelectedItem(null)
        onSelectionChange(null)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [deleteSelected, onSelectionChange, editingLabel])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-card"
    >
      <canvas
        ref={canvasRef}
        style={{ width: canvasSize.w, height: canvasSize.h, cursor: activeTool === "pan" ? "grab" : activeTool === "select" ? "default" : "crosshair" }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      {/* Escape to cancel tooltip */}
      {drawingPoints.length > 0 && (
        <div
          className="absolute text-xs bg-gray-900 text-white rounded px-2 py-1 pointer-events-none whitespace-nowrap font-medium"
          style={{
            left: `${mouseScreenPos.x + 12}px`,
            top: `${mouseScreenPos.y + 12}px`,
            opacity: 0.9,
          }}
        >
          Press ESC to cancel
        </div>
      )}
      {/* Text label editing input */}
      {editingLabel && (() => {
        const label = state.textLabels.find(l => l.id === editingLabel)
        if (!label) return null
        const screenPos = worldToScreen(label.x, label.y)
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return null
        
        return (
          <input
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onBlur={() => {
              // If text is empty, delete the label; otherwise save it
              if (!editingText.trim()) {
                removeTextLabel(editingLabel)
              } else {
                updateTextLabel(editingLabel, { text: editingText })
              }
              setEditingLabel(null)
              setEditingText("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Save and close on Enter
                if (!editingText.trim()) {
                  removeTextLabel(editingLabel)
                } else {
                  updateTextLabel(editingLabel, { text: editingText })
                }
                setEditingLabel(null)
                setEditingText("")
              } else if (e.key === "Escape") {
                // Discard and close on Escape
                setEditingLabel(null)
                setEditingText("")
              }
            }}
            autoFocus
            maxLength={20}
            className="fixed z-50 rounded border-2 border-blue-500 bg-white px-2 py-1 text-sm font-semibold min-w-[60px]"
            style={{
              left: `${rect.left + screenPos.x - 30}px`,
              top: `${rect.top + screenPos.y - 12}px`,
              width: "auto",
              minWidth: "80px"
            }}
          />
        )
      })()}
      {selectedItem && (
        <button
          onClick={deleteSelected}
          className="absolute right-4 top-4 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors min-h-[44px]"
        >
          Delete Selected
        </button>
      )}
    </div>
  )
}
