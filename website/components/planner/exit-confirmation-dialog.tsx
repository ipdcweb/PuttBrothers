"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle, LogOut } from "lucide-react"
import type { PlannerState } from "@/lib/planner/planner-types"

interface ExitConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExitProject: () => void
  state: PlannerState
}

export function ExitConfirmationDialog({
  open,
  onOpenChange,
  onExitProject,
  state,
}: ExitConfirmationDialogProps) {
  const items = [
    {
      label: "Your project will not be submitted to Putt Brothers",
    },
    {
      label: "All data will be permanently deleted",
    },
    {
      label: "You can contact us for support anytime",
    },
    {
      label: "This action cannot be undone",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave Project</DialogTitle>
          <DialogDescription>
            You are about to exit this project. Please review the information below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                  <Check className="w-6 h-6 text-green-600 font-bold" strokeWidth={3} />
                </div>
                <label className="text-sm text-foreground cursor-pointer flex-1">{item.label}</label>
              </div>
            ))}
          </div>

          {/* Warning message */}
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              If you need assistance or have any questions, please contact our support team. We're here to help!
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Continue Project
          </Button>
          <Button
            onClick={onExitProject}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Exit Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
