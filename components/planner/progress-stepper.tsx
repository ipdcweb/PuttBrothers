"use client"

import { Check, PenTool, LayoutGrid, FileText } from "lucide-react"
import { ResetButton } from "@/components/planner/reset-button"
import { ExitButton } from "@/components/planner/exit-button"
import { cn } from "@/lib/utils"

const STEPS = [
  { label: "Space", icon: PenTool },
  { label: "Layout", icon: LayoutGrid },
  { label: "Summary", icon: FileText },
]

interface ProgressStepperProps {
  currentStep: number
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  return (
    <header className="flex items-center justify-between gap-4 bg-primary px-4 py-3 md:px-8">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <img
          src="/putt-brothers-logo.png"
          alt="Putt Brothers"
          className="h-7 w-auto"
        />
      </div>

      {/* Center: Progress steps - flex-1 to take available space and center */}
      <nav className="flex flex-1 items-center justify-center gap-1 sm:gap-2" aria-label="Progress">
        {STEPS.map((step, i) => {
          const isComplete = i < currentStep
          const isCurrent = i === currentStep
          const Icon = step.icon

          return (
            <div key={step.label} className="flex items-center gap-1 sm:gap-2">
              {i > 0 && (
                <div
                  className={cn(
                    "h-px w-4 sm:w-8",
                    isComplete ? "bg-secondary" : "bg-primary-foreground/20"
                  )}
                />
              )}
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                  isCurrent && "bg-secondary text-secondary-foreground",
                  isComplete && "bg-secondary/80 text-secondary-foreground",
                  !isCurrent && !isComplete && "text-primary-foreground/70"
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            </div>
          )
        })}
      </nav>

      {/* Right: Action buttons - Start Over and Exit (hidden on Summary page) */}
      {currentStep !== 2 && (
        <div className="flex items-center gap-2 shrink-0">
          <ResetButton />
          <ExitButton />
        </div>
      )}
    </header>
  )
}
