"use client"

import { useState } from "react"
import { RotateCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface RotationControlProps {
  rotation: number
  onRotationChange: (rotation: number) => void
}

export function RotationControl({ rotation, onRotationChange }: RotationControlProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(String(Math.round(rotation)))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleApply = () => {
    let value = parseFloat(inputValue)
    if (isNaN(value)) value = rotation
    // Normalize to 0-360
    value = ((value % 360) + 360) % 360
    onRotationChange(value)
    setInputValue(String(Math.round(value)))
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApply()
    } else if (e.key === "Escape") {
      setInputValue(String(Math.round(rotation)))
      setIsOpen(false)
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Rotate machine"
      >
        <RotateCw className="h-4 w-4" />
        <span className="hidden sm:inline">{Math.round(rotation)}°</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 rounded-lg border border-border bg-card p-3 shadow-lg min-w-[220px]">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Rotation Angle</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="360"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="h-8 flex-1"
                placeholder="0"
                autoFocus
              />
              <span className="text-sm font-medium">°</span>
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
