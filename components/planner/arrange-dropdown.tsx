"use client"

import { useState, useRef, useEffect } from "react"
import { Wand2, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ArrangementMode } from "@/lib/planner/auto-arrange"

interface ArrangeDropdownProps {
  onArrange: (mode: ArrangementMode) => void
}

const MODES: { value: ArrangementMode; label: string; description: string }[] = [
  { value: "horizontal", label: "Compress Top", description: "Organize courses at the top" },
  { value: "vertical", label: "Compress Bottom", description: "Organize courses at the bottom" },
  { value: "compressed-left", label: "Compress Left", description: "Pack courses from left edge" },
  { value: "compressed-right", label: "Compress Right", description: "Pack courses from right edge" },
]

export function ArrangeDropdown({ onArrange }: ArrangeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
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

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Auto arrange options"
      >
        <Wand2 className="h-4 w-4" />
        <span className="hidden sm:inline">Arrange</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 z-50 rounded-lg border border-border bg-card shadow-lg min-w-[260px]">
          <div className="p-1">
            {MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => {
                  onArrange(mode.value)
                  setIsOpen(false)
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent transition-colors text-sm"
              >
                <div className="font-medium text-foreground">{mode.label}</div>
                <div className="text-xs text-muted-foreground">{mode.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
