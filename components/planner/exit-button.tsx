"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { ExitConfirmationDialog } from "@/components/planner/exit-confirmation-dialog"
import { usePlanner } from "@/lib/planner/planner-context"
import type { PlannerState } from "@/lib/planner/planner-types"

export function ExitButton() {
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const { state } = usePlanner()

  const handleExitProject = () => {
    // Clear planner state
    if (typeof window !== "undefined") {
      localStorage.removeItem("planner-state")
      sessionStorage.clear()
      // If running inside an iframe, tell the parent to close the modal
      if (window.parent !== window) {
        window.parent.postMessage("close-planner", "*")
      } else {
        // Fallback: redirect if accessed directly
        window.location.href = "/layout-planner"
      }
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setConfirmationOpen(true)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            suppressHydrationWarning
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium">Exit</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="border-0" style={{ backgroundColor: "#41059a" }}>
          <p className="font-medium text-white">Exit</p>
          <p className="text-xs text-yellow-300">Exit the planner</p>
        </TooltipContent>
      </Tooltip>

      <ExitConfirmationDialog
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        onExitProject={handleExitProject}
        state={state}
      />
    </>
  )
}
