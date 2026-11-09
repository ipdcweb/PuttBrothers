"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { jsPDF } from "jspdf"
import { ProgressStepper } from "@/components/planner/progress-stepper"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePlanner } from "@/lib/planner/planner-context"
import { formatMachineDimensions } from "@/lib/planner/machine-catalog"
import {
  calculatePolygonsArea,
  calculatePlacedMachinesArea,
  formatArea,
  toDisplay,
} from "@/lib/planner/planner-types"
import { FileText, Loader2, X } from "lucide-react"

type PlannerResult = {
  pdfUrl: string
  s3Url: string
  filename: string
}

type PdfImage = {
  dataUrl: string
  format: "JPEG"
}

function getMobileImageUrl(imageUrl?: string) {
  return imageUrl?.replace("/media/desktop.png", "/media/mobile.png")
}

async function imageToCompressedPdfImage(imageUrl?: string): Promise<PdfImage | null> {
  if (!imageUrl) return null

  try {
    const response = await fetch(`/api/planner/image?url=${encodeURIComponent(getMobileImageUrl(imageUrl) || imageUrl)}`)
    if (!response.ok) return null

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = objectUrl
      })

      const maxSize = 240
      const ratio = Math.min(maxSize / image.naturalWidth, maxSize / image.naturalHeight, 1)
      const width = Math.max(1, Math.round(image.naturalWidth * ratio))
      const height = Math.max(1, Math.round(image.naturalHeight * ratio))
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) return null

      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(image, 0, 0, width, height)

      return {
        dataUrl: canvas.toDataURL("image/jpeg", 0.72),
        format: "JPEG",
      }
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  } catch {
    return null
  }
}

function canvasToCompressedJpeg(canvas: HTMLCanvasElement) {
  const maxWidth = 1200
  const ratio = Math.min(maxWidth / canvas.width, 1)
  const width = Math.round(canvas.width * ratio)
  const height = Math.round(canvas.height * ratio)
  const output = document.createElement("canvas")
  output.width = width
  output.height = height
  const ctx = output.getContext("2d")
  if (!ctx) return canvas.toDataURL("image/jpeg", 0.76)

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(canvas, 0, 0, width, height)
  return output.toDataURL("image/jpeg", 0.76)
}

async function loadPdfImages(
  uniqueMachines: Array<{ catalogId: string; count: number }>,
  findMachine: (id: string) => { image?: string } | undefined,
) {
  const entries = await Promise.all(
    uniqueMachines.map(async ({ catalogId }) => {
      const machine = findMachine(catalogId)
      const image = await imageToCompressedPdfImage(machine?.image)
      return [catalogId, image] as const
    })
  )

  return new Map(entries)
}

export default function SummaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, resetPlannerState, catalog } = usePlanner()

  const [acknowledged, setAcknowledged] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [standaloneResult, setStandaloneResult] = useState<PlannerResult | null>(null)
  const [plannerEmail, setPlannerEmail] = useState("")

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const findMachine = useCallback(
    (id: string) => catalog.find((machine) => machine.id === id),
    [catalog]
  )

  useEffect(() => {
    setMounted(true)
    const email = searchParams.get("email") || window.sessionStorage.getItem("puttbrothers-planner-email") || ""
    setPlannerEmail(email)
  }, [])

  // ── Area calculations ─────────────────────────────────────────────────────
  const totalArea = useMemo(
    () => calculatePolygonsArea(state.boundaries),
    [state.boundaries]
  )
  const obstaclesArea = useMemo(
    () => calculatePolygonsArea(state.obstacles),
    [state.obstacles]
  )
  const restrictedArea = useMemo(
    () => calculatePolygonsArea(state.restricted),
    [state.restricted]
  )
  const machinesArea = useMemo(
    () => calculatePlacedMachinesArea(state.placedMachines, catalog),
    [state.placedMachines, catalog]
  )
  const availableArea = Math.max(0, totalArea - obstaclesArea - restrictedArea - machinesArea)

  // ── Unique machines with count ────────────────────────────────────────────
  const uniqueMachines = useMemo(() => {
    return state.placedMachines.reduce(
      (acc, m) => {
        const existing = acc.find((item) => item.catalogId === m.catalogId)
        if (existing) existing.count++
        else acc.push({ catalogId: m.catalogId, count: 1 })
        return acc
      },
      [] as Array<{ catalogId: string; count: number }>
    )
  }, [state.placedMachines])

  // ── Draw read-only canvas ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const PAD = 64

    ctx.fillStyle = "#f8fafc"
    ctx.fillRect(0, 0, W, H)

    if (!state.boundaries || state.boundaries.length === 0) return
    const boundary = state.boundaries[0]
    if (!boundary || boundary.points.length < 3) return

    const pts = boundary.points
    const minX = Math.min(...pts.map((p) => p.x))
    const maxX = Math.max(...pts.map((p) => p.x))
    const minY = Math.min(...pts.map((p) => p.y))
    const maxY = Math.max(...pts.map((p) => p.y))
    const wW = maxX - minX
    const wH = maxY - minY
    const scale = Math.min((W - PAD * 2) / wW, (H - PAD * 2) / wH)

    const offsetX = PAD + ((W - PAD * 2) - wW * scale) / 2
    const offsetY = PAD + ((H - PAD * 2) - wH * scale) / 2

    const toScreen = (x: number, y: number) => ({
      x: (x - minX) * scale + offsetX,
      y: (y - minY) * scale + offsetY,
    })

    // Background boundary fill
    ctx.beginPath()
    const fp = toScreen(pts[0].x, pts[0].y)
    ctx.moveTo(fp.x, fp.y)
    for (let i = 1; i < pts.length; i++) {
      const sp = toScreen(pts[i].x, pts[i].y)
      ctx.lineTo(sp.x, sp.y)
    }
    ctx.closePath()
    ctx.fillStyle = "#e8f5e9"
    ctx.fill()
    ctx.strokeStyle = "#22863a"
    ctx.lineWidth = 3
    ctx.stroke()

    // ────────────────────────────────────────────────────────────────────────
    // COLLECT AND DRAW ALL DIMENSIONS (exactly like space-canvas)
    // ────────────────────────────────────────────────────────────────────────
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

    // Helper to collect linear dimension
    const collectDimension = (p1: { x: number; y: number }, p2: { x: number; y: number }, color: string) => {
      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const length = Math.sqrt(dx * dx + dy * dy)

      if (length < 0.01) return

      const distance = toDisplay(length, state.unit)
      const mx = (p1.x + p2.x) / 2
      const my = (p1.y + p2.y) / 2
      const screenMid = toScreen(mx, my)
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

    // Helper to collect angle dimension
    const collectAngleDimension = (p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, color: string) => {
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

      // Skip 90-degree angles and collinear
      if (Math.abs(angleDegrees) < 1 || Math.abs(angleDegrees - 360) < 1) return
      if (Math.abs(angleDegrees - 90) < 2 || Math.abs(angleDegrees - 270) < 2) return

      const midAngle = (angle1 + angle2) / 2
      const distance = 0.5
      const labelX = p1.x + Math.cos(midAngle) * distance
      const labelY = p1.y + Math.sin(midAngle) * distance
      const screenLabel = toScreen(labelX, labelY)

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

    // Collect dimensions for boundaries (green)
    if (state.boundaries && state.boundaries.length > 0) {
      state.boundaries.forEach((boundary) => {
        if (boundary && boundary.points && boundary.points.length > 1) {
          for (let i = 0; i < boundary.points.length; i++) {
            const p1 = boundary.points[i]
            const p2 = boundary.points[(i + 1) % boundary.points.length]
            collectDimension(p1, p2, "#22863a")

            const p0 = boundary.points[(i - 1 + boundary.points.length) % boundary.points.length]
            collectAngleDimension(p0, p1, p2, "#22863a")
          }
        }
      })
    }

    // Collect dimensions for obstacles (gray)
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

    // Collect dimensions for restricted (red)
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

    // Draw all collected dimensions with white background
    dimensions.forEach((dim) => {
      ctx.save()

      // For angle dimensions, draw arc
      if (dim.isAngle && dim.arcRadius) {
        ctx.strokeStyle = dim.color
        ctx.lineWidth = 1
        const arcRadiusScreen = dim.arcRadius * scale
        ctx.beginPath()
        ctx.arc(dim.screenX, dim.screenY, arcRadiusScreen, dim.angle - 0.3, dim.angle + 0.3, false)
        ctx.stroke()
      }

      // Translate and rotate for proper text orientation
      ctx.translate(dim.screenX, dim.screenY)

      if (dim.isVertical && !dim.isAngle) {
        ctx.rotate(Math.PI / 2)
      }

      // Measure and draw background
      ctx.font = "11px system-ui"
      const textMetrics = ctx.measureText(dim.label)
      const textWidth = textMetrics.width
      const textHeight = 12
      const padding = 5

      // White background (opaque and larger to cover dashed lines completely)
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.fillRect(-textWidth / 2 - padding, -textHeight / 2 - 1, textWidth + padding * 2, textHeight + 2)

      // Text
      ctx.fillStyle = dim.color
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(dim.label, 0, 0)

      ctx.restore()
    })

    // Draw obstacles
    if (state.obstacles && state.obstacles.length > 0) {
      state.obstacles.forEach((obs) => {
        if (!obs || obs.points.length < 2) return
        ctx.beginPath()
        const o0 = toScreen(obs.points[0].x, obs.points[0].y)
        ctx.moveTo(o0.x, o0.y)
        let minObsX = obs.points[0].x, maxObsX = obs.points[0].x
        let minObsY = obs.points[0].y, maxObsY = obs.points[0].y
        
        for (let i = 1; i < obs.points.length; i++) {
          const p = toScreen(obs.points[i].x, obs.points[i].y)
          ctx.lineTo(p.x, p.y)
          minObsX = Math.min(minObsX, obs.points[i].x)
          maxObsX = Math.max(maxObsX, obs.points[i].x)
          minObsY = Math.min(minObsY, obs.points[i].y)
          maxObsY = Math.max(maxObsY, obs.points[i].y)
        }
        ctx.closePath()
        ctx.fillStyle = "rgba(120, 113, 108, 0.15)"
        ctx.fill()
        ctx.strokeStyle = "#78716c"
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    // Draw restricted
    if (state.restricted && state.restricted.length > 0) {
      state.restricted.forEach((r) => {
        if (r.points.length < 2) return
        ctx.beginPath()
        const r0 = toScreen(r.points[0].x, r.points[0].y)
        ctx.moveTo(r0.x, r0.y)
        let minRestX = r.points[0].x, maxRestX = r.points[0].x
        let minRestY = r.points[0].y, maxRestY = r.points[0].y
        
        for (let i = 1; i < r.points.length; i++) {
          const p = toScreen(r.points[i].x, r.points[i].y)
          ctx.lineTo(p.x, p.y)
          minRestX = Math.min(minRestX, r.points[i].x)
          maxRestX = Math.max(maxRestX, r.points[i].x)
          minRestY = Math.min(minRestY, r.points[i].y)
          maxRestY = Math.max(maxRestY, r.points[i].y)
        }
        ctx.closePath()
        ctx.fillStyle = "rgba(220, 38, 38, 0.1)"
        ctx.fill()
        ctx.strokeStyle = "#dc2626"
        ctx.lineWidth = 2
        ctx.setLineDash([6, 3])
        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    ctx.setLineDash([])
    ctx.restore()

    // Scale bar (bottom-right)
    // Machines
    state.placedMachines.forEach((machine) => {
      const catalogMachine = findMachine(machine.catalogId)
      if (!catalogMachine) return

      // Get the machine center in screen coordinates
      const ms = toScreen(machine.x, machine.y)
      const rotRad = (machine.rotation * Math.PI) / 180
      
      // Use actual catalog dimensions (don't swap based on rotation - that's handled by canvas rotation)
      const machineWidth = catalogMachine.width * scale
      const machineDepth = catalogMachine.depth * scale

      ctx.save()
      ctx.translate(ms.x, ms.y)
      ctx.rotate(rotRad)
      
      // Draw rectangle centered at origin
      ctx.fillStyle = catalogMachine.color || "#6366f1"
      ctx.globalAlpha = 0.85
      ctx.beginPath()
      ctx.roundRect(-machineWidth / 2, -machineDepth / 2, machineWidth, machineDepth, 4)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.strokeStyle = "#4f46e5"
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Label (centered at origin, same as Layout)
      const fontSize = Math.max(10, Math.min(14, machineWidth * 0.12))
      ctx.fillStyle = "white"
      ctx.font = `bold ${fontSize}px system-ui`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(catalogMachine.name, 0, -7)
      
      // Dimensions on second line
      const dimensionLabel = formatMachineDimensions(catalogMachine)
      const smallFontSize = Math.max(8, Math.min(10, machineWidth * 0.08))
      ctx.font = `${smallFontSize}px system-ui`
      ctx.fillText(dimensionLabel, 0, 9)
      
      ctx.restore()
    })
  }, [mounted, state, totalArea, findMachine])

  // ── PDF generation ────────────────────────────────────────────────────────
  const handleGeneratePDF = useCallback(async () => {
    setIsGenerating(true)
    setUploadError("")

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")
    const ampm = now.getHours() >= 12 ? "pm" : "am"
    const hours12 = String(now.getHours() % 12 || 12).padStart(2, "0")
    const timestamp = `${year}-${month}-${day}_${hours12}-${minutes}-${seconds}${ampm}`
    const safeEmail = plannerEmail.trim().toLowerCase().replace(/[^a-z0-9._@-]/g, "_")
    const filename = safeEmail ? `${safeEmail}-${timestamp}.pdf` : `PB-Layout_${timestamp}.pdf`

    const formattedDate = now.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    const formattedTime = now.toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
    })

    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4", compress: true })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 48
      const pdfImages = await loadPdfImages(uniqueMachines, findMachine)

      pdf.setFillColor(65, 5, 154)
      pdf.roundedRect(margin, margin, pageWidth - margin * 2, 72, 10, 10, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(24)
      pdf.text("Putt Brothers", pageWidth / 2, margin + 44, { align: "center" })

      pdf.setTextColor(17, 17, 17)
      pdf.setFontSize(22)
      pdf.text("Project Proposal - Not a Final Design", pageWidth / 2, 170, { align: "center" })

      pdf.setDrawColor(249, 115, 22)
      pdf.setFillColor(255, 247, 237)
      pdf.roundedRect(margin, 205, pageWidth - margin * 2, 92, 8, 8, "FD")
      pdf.setTextColor(154, 52, 18)
      pdf.setFontSize(13)
      pdf.setFont("helvetica", "bold")
      pdf.text("Important Notice", pageWidth / 2, 235, { align: "center" })
      pdf.setFont("helvetica", "normal")
      pdf.text(
        [
          "This document is not recognized as a formal or final design by Putt Brothers.",
          "This is a preliminary projection for discussion and planning purposes only.",
        ],
        pageWidth / 2,
        260,
        { align: "center" },
      )

      pdf.setTextColor(51, 51, 51)
      pdf.setFontSize(11)
      pdf.text(
        [
          "Disclaimer: This layout proposal is based on the information provided and the Course Holes selected.",
          "The final design may change based on site surveying, actual measurements, ground conditions,",
          "local regulations, permits, client requirements, engineering and safety considerations.",
          "",
          "Next Steps: Please contact Putt Brothers to schedule a consultation and receive a formal",
          "design proposal with detailed specifications, pricing, and timeline.",
        ],
        margin,
        340,
        { maxWidth: pageWidth - margin * 2 },
      )

      pdf.addPage("a4", "landscape")
      pdf.setTextColor(65, 5, 154)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(13)
      pdf.text("Putt Brothers - Course Holes Selection", margin, 42)
      pdf.setTextColor(119, 119, 119)
      pdf.setFont("helvetica", "normal")
      pdf.text(`${formattedDate}, ${formattedTime}`, pageWidth - margin, 42, { align: "right" })

      let x = margin
      let y = 78
      for (const { catalogId, count } of uniqueMachines) {
        const machine = findMachine(catalogId)
        if (!machine) continue

        const cardWidth = 170
        const cardHeight = 92
        const pdfImage = pdfImages.get(catalogId)

        pdf.setDrawColor(221, 221, 221)
        pdf.roundedRect(x, y, cardWidth, cardHeight, 6, 6, "S")
        if (pdfImage) {
          pdf.addImage(pdfImage.dataUrl, pdfImage.format, x + 10, y + 12, 48, 48, undefined, "FAST")
        }

        const textX = pdfImage ? x + 66 : x + 12
        const textWidth = pdfImage ? 92 : 146
        pdf.setTextColor(17, 17, 17)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(11)
        pdf.text(machine.name, textX, y + 22, { maxWidth: textWidth })
        pdf.setTextColor(119, 119, 119)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(9)
        pdf.text(formatMachineDimensions(machine), textX, y + 52, { maxWidth: textWidth })
        if (count > 1) {
          pdf.text(`Qty: ${count}`, textX, y + 70)
        }

        x += 184
        if (x + cardWidth > pageWidth - margin) {
          x = margin
          y += 106
        }
        if (y + cardHeight > pageHeight - margin) {
          pdf.addPage("a4", "landscape")
          x = margin
          y = 60
        }
      }

      pdf.addPage("a4", "landscape")
      pdf.setTextColor(65, 5, 154)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(13)
      pdf.text("Putt Brothers - Layout Summary", margin, 42)
      pdf.setTextColor(119, 119, 119)
      pdf.setFont("helvetica", "normal")
      pdf.text(`${formattedDate}, ${formattedTime}`, pageWidth - margin, 42, { align: "right" })

      const canvas = canvasRef.current
      if (canvas) {
        const dataUrl = canvasToCompressedJpeg(canvas)
        pdf.addImage(dataUrl, "JPEG", margin, 65, pageWidth - margin * 2, 320, undefined, "FAST")
      }

      const stats = [
        `Total Space: ${formatArea(totalArea, state.unit)}`,
        obstaclesArea > 0 ? `Obstacles: ${formatArea(obstaclesArea, state.unit)}` : "",
        restrictedArea > 0 ? `Restricted: ${formatArea(restrictedArea, state.unit)}` : "",
        `Courses: ${formatArea(machinesArea, state.unit)}`,
        availableArea > 0 ? `Available: ${formatArea(availableArea, state.unit)}` : "",
      ].filter(Boolean)

      pdf.setTextColor(17, 17, 17)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(11)
      pdf.text(stats, margin, 420)

      const blob = pdf.output("blob")
      const formData = new FormData()
      formData.append("file", blob, filename)

      const response = await fetch("/api/layout-pdf/upload", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()

      if (!response.ok || !result?.url) {
        throw new Error(result?.message || "Failed to upload layout PDF")
      }

      const plannerResult: PlannerResult = {
        pdfUrl: result.url,
        s3Url: result.url,
        filename: result.filename || filename,
      }

      const isEmbedded = window.sessionStorage.getItem("puttbrothers-planner-mode") === "embedded"
      resetPlannerState()

      if (isEmbedded) {
        window.parent.postMessage(
          {
            type: "puttbrothers-planner-complete",
            payload: plannerResult,
          },
          window.location.origin,
        )
        return
      }

      setStandaloneResult(plannerResult)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to generate layout PDF")
    } finally {
      setIsGenerating(false)
    }
  }, [uniqueMachines, state, totalArea, obstaclesArea, restrictedArea, machinesArea, availableArea, resetPlannerState, router, findMachine, plannerEmail])

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = useCallback(() => {
    resetPlannerState()
    router.push("/layout-planner")
  }, [resetPlannerState, router])

  // ── Render ────────────────────────────────────────────────────────────────
  if (standaloneResult) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-xl rounded-xl border border-border bg-white p-8 text-center shadow-lg">
          <FileText className="mx-auto mb-4 size-10 text-primary" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">Layout PDF Created</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Your layout summary was uploaded successfully.
          </p>
          <div className="mb-6 rounded-lg border border-border bg-muted/30 p-4 text-left">
            <p className="text-sm font-semibold text-foreground">{standaloneResult.filename}</p>
            <a
              href={standaloneResult.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block break-all text-sm text-primary underline"
            >
              {standaloneResult.pdfUrl}
            </a>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="flex-1">
              <a href={standaloneResult.pdfUrl} target="_blank" rel="noreferrer">
                Open PDF
              </a>
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.push("/layout-planner")}>
              Create Another
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <ProgressStepper currentStep={2} />

      {isGenerating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-white p-8 text-center shadow-2xl">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#41059a]" />
            <h2 className="text-lg font-bold text-foreground">Generating layout PDF</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we create your PDF and upload it securely.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground font-sans">Layout Summary</h1>
            {mounted && (
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-AU")} {new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>

          {/* Canvas preview */}
          <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-2 border-b border-border bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Layout Preview</p>
            </div>
            <div className="p-4">
              <canvas
                ref={canvasRef}
                width={900}
                height={500}
                className="w-full rounded border border-border"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3">
            <div className="border border-border rounded-lg px-4 py-3 bg-white">
              <span className="text-sm text-muted-foreground">Total Space: </span>
              <span className="text-sm font-semibold text-foreground">{mounted ? formatArea(totalArea, state.unit) : "—"}</span>
            </div>
            <div className="border border-border rounded-lg px-4 py-3 bg-white">
              <span className="text-sm text-muted-foreground">Obstacles: </span>
              <span className="text-sm font-semibold text-foreground">{mounted ? formatArea(obstaclesArea, state.unit) : "—"}</span>
            </div>
            <div className="border border-border rounded-lg px-4 py-3 bg-white">
              <span className="text-sm text-muted-foreground">Restricted: </span>
              <span className="text-sm font-semibold text-foreground">{mounted ? formatArea(restrictedArea, state.unit) : "—"}</span>
            </div>
            <div className="border border-border rounded-lg px-4 py-3 bg-white">
              <span className="text-sm text-muted-foreground">Courses: </span>
              <span className="text-sm font-semibold text-foreground">{mounted ? formatArea(machinesArea, state.unit) : "—"}</span>
            </div>
            <div className="border border-border rounded-lg px-4 py-3 bg-white">
              <span className="text-sm text-muted-foreground">Available: </span>
              <span className="text-sm font-semibold text-green-600">{mounted ? formatArea(availableArea, state.unit) : "—"}</span>
            </div>
          </div>

          {/* Courses selected */}
          {uniqueMachines.length > 0 && (
            <div className="border border-border rounded-xl bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-2 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Course Holes Selected</p>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {uniqueMachines.map(({ catalogId, count }) => {
                  const m = findMachine(catalogId)
                  if (!m) return null
                  return (
                    <div key={catalogId} className="border-2 border-purple-300 rounded-lg p-3 text-center bg-purple-50 hover:bg-purple-100 transition-colors">
                      {/* Badge */}
                      <div className="flex justify-start mb-2">
                        <Badge className="bg-purple-700 text-white px-2 py-1 text-xs font-bold">
                          +{count}
                        </Badge>
                      </div>
                      
                      {/* Machine Image */}
                      {m.image && (
                        <div className="w-full aspect-square rounded-lg mb-2 bg-white flex items-center justify-center overflow-hidden border border-purple-200">
                          <img 
                            src={m.image} 
                            alt={m.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Machine Name */}
                      <p className="text-xs font-semibold text-foreground leading-tight mb-1">{m.name}</p>
                      
                      {/* Machine Dimensions */}
                      <p className="text-xs text-muted-foreground">{m.width.toFixed(1)} × {m.depth.toFixed(1)} m</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Important Notice Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Project Proposal - Not a Final Design</h3>
            
            <div className="border-2 border-orange-400 rounded-xl p-6 bg-orange-50">
              <h4 className="flex items-center gap-2 text-orange-700 font-semibold mb-3">
                <span className="text-xl">⚠️</span>
                Important Notice
              </h4>
              <p className="text-sm text-orange-900 mb-2">
                This document is not recognized as a formal or final design by Putt Brothers.
              </p>
              <p className="text-sm text-orange-900">
                This is a preliminary projection showing how the selected Course Holes could be allocated within your available space. It serves as a visual reference for discussion and planning purposes only.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                <span className="text-foreground">Disclaimer:</span> This layout proposal is based on the information provided and the Course Holes selected. The final design may be subject to changes based on:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-foreground">
                <li>Site surveying and actual measurements</li>
                <li>Ground conditions and terrain assessment</li>
                <li>Local regulations and permits</li>
                <li>Client preferences and requirements</li>
                <li>Engineering and safety considerations</li>
              </ul>
            </div>

            <p className="text-sm text-foreground">
              <span className="font-semibold">Next Steps:</span> Please contact Putt Brothers to schedule a consultation and receive a formal design proposal with detailed specifications, pricing, and timeline.
            </p>
          </div>

          {/* Acknowledgment checkbox */}
          <div className={`border border-blue-200 bg-blue-50 rounded-xl p-4 flex items-start gap-3 shadow-lg ${!acknowledged ? 'checkbox-glow' : ''}`}>
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
            />
            <label htmlFor="acknowledge" className="text-sm text-foreground cursor-pointer leading-relaxed">
              I understand this is a project proposal and not a final design. I acknowledge that the final design may change based on site conditions, regulations, and additional requirements.
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 pb-8">
            {uploadError && (
              <div className="w-full rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {uploadError}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
              disabled={isGenerating}
              className="flex-1 min-w-[140px] h-12 text-base"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel & Exit
            </Button>
            <Button
              onClick={handleGeneratePDF}
              disabled={!acknowledged || isGenerating}
              className={`flex-1 min-w-[180px] h-12 text-base transition-all ${acknowledged ? 'pdf-button-glow' : ''} hover:bg-yellow-400 hover:text-purple-700`}
            >
              <FileText className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating PDF..." : "Add to Form & Close"}
            </Button>
          </div>
        </div>
      </main>

      {/* Cancel confirmation dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground mb-2">Cancel Project?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              All project data will be permanently deleted and cannot be recovered. This action is irreversible. Are you sure you want to proceed?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelDialog(false)}
              >
                Keep Project
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancel}
              >
                Delete &amp; Exit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
