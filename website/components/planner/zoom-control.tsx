"use client"

import { useState, useRef, useEffect } from "react"
import { ZoomIn, ChevronUp, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface ZoomControlProps {
  zoom: number // percentage (100 = 100%)
  onZoomChange: (zoom: number) => void
}

export function ZoomControl({ zoom, onZoomChange }: ZoomControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(String(Math.round(zoom)))
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleApply = () => {
    let value = parseFloat(inputValue)
    if (isNaN(value) || value < 10) value = 10
    if (value > 500) value = 500
    onZoomChange(value)
    setInputValue(String(Math.round(value)))
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApply()
    } else if (e.key === "Escape") {
      setInputValue(String(Math.round(zoom)))
      setIsOpen(false)
    }
  }

  const handleZoomIn = () => {
    const newZoom = Math.min(500, zoom + 5)
    onZoomChange(newZoom)
    setInputValue(String(Math.round(newZoom)))
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(10, zoom - 5)
    onZoomChange(newZoom)
    setInputValue(String(Math.round(newZoom)))
  }

  return (
    <div className="relative inline-flex items-center gap-0.5" ref={containerRef}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Zoom controls"
          >
            <ZoomIn className="h-4 w-4" />
            <span className="hidden sm:inline w-10 text-right">{Math.round(zoom)}%</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="border-0" style={{ backgroundColor: "#41059a" }}>
          <p className="font-medium text-white">Zoom</p>
          <p className="text-xs text-yellow-300">Adjust the canvas zoom level</p>
        </TooltipContent>
      </Tooltip>

      <div className="flex flex-col gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleZoomIn}
              className="flex h-4 w-9 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Zoom in"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="border-0" style={{ backgroundColor: "#41059a" }}>
            <p className="font-medium text-white">Zoom In</p>
            <p className="text-xs text-yellow-300">Increase zoom by 5%</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleZoomOut}
              className="flex h-4 w-9 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Zoom out"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="border-0" style={{ backgroundColor: "#41059a" }}>
            <p className="font-medium text-white">Zoom Out</p>
            <p className="text-xs text-yellow-300">Decrease zoom by 5%</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 rounded-lg border border-border bg-card p-3 shadow-lg min-w-[220px]">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Zoom Level</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="10"
                max="500"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="h-8 flex-1"
                placeholder="100"
                autoFocus
              />
              <span className="text-sm font-medium">%</span>
            </div>
            <Button
              onClick={handleApply}
              size="sm"
              className="w-full h-8 text-sm"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
