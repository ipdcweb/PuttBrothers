"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ResetConfirmationDialog } from "@/components/planner/reset-confirmation-dialog"
import { ResetSuccessBanner } from "@/components/planner/reset-success-banner"
import { usePlanner } from "@/lib/planner/planner-context"

export function ResetButton() {
  const router = useRouter()
  const { state, resetPlannerState } = usePlanner()
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)

  const handleOpenConfirmation = () => {
    setConfirmationOpen(true)
  }

  const handleConfirmReset = () => {
    setConfirmationOpen(false)
    
    // Reset the planner state (clears grid, boundaries, machines, obstacles, etc.)
    resetPlannerState()
    
    // Clear browser storage
    if (typeof window !== "undefined") {
      const plannerMode = sessionStorage.getItem("puttbrothers-planner-mode")
      localStorage.removeItem("putt-brothers-planner")
      sessionStorage.clear()
      if (plannerMode) {
        sessionStorage.setItem("puttbrothers-planner-mode", plannerMode)
      }
    }
    
    // Show success banner AFTER cleanup is complete
    setTimeout(() => {
      setShowSuccessBanner(true)
    }, 500)
  }

  const handleDismissSuccess = () => {
    setShowSuccessBanner(false)
    router.push("/layout-planner/space")
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleOpenConfirmation}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            suppressHydrationWarning
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium">Start Over</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="border-0" style={{ backgroundColor: "#41059a" }}>
          <p className="font-medium text-white">Start Over</p>
          <p className="text-xs text-yellow-300">Reset and begin a new project</p>
        </TooltipContent>
      </Tooltip>

      <ResetConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        onConfirm={handleConfirmReset}
        state={state}
      />

      {showSuccessBanner && <ResetSuccessBanner onDismiss={handleDismissSuccess} />}
    </>
  )
}
