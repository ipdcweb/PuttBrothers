"use client"

import type React from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"

type BorderGlowPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  contentClassName?: string
  children: React.ReactNode
}

export function BorderGlowPanel({ className, contentClassName, children, ...props }: BorderGlowPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return

    const bounds = event.currentTarget.getBoundingClientRect()
    panelRef.current?.style.setProperty("--glow-x", `${event.clientX - bounds.left}px`)
    panelRef.current?.style.setProperty("--glow-y", `${event.clientY - bounds.top}px`)
  }

  return (
    <div
      ref={panelRef}
      onPointerMove={handlePointerMove}
      className={cn("contact-glow-panel", className)}
      {...props}
    >
      <div className={cn("contact-glow-panel__content", contentClassName)}>{children}</div>
    </div>
  )
}
