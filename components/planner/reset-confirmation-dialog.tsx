"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle } from "lucide-react"
import type { PlannerState } from "@/lib/planner/planner-types"

interface ResetConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  state: PlannerState
}

export function ResetConfirmationDialog({ open, onOpenChange, onConfirm, state }: ResetConfirmationDialogProps) {
  const items = [
    {
      label: "All spaces and boundaries will be deleted",
    },
    {
      label: "All machine placements will be removed",
    },
    {
      label: "All layout configurations will be cleared",
    },
    {
      label: "All project data will be permanently removed",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Over</DialogTitle>
          <DialogDescription>
            You are about to reset your entire project. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                  <Check className="w-6 h-6 text-red-600 font-bold" strokeWidth={3} />
                </div>
                <label className="text-sm text-foreground cursor-pointer flex-1">{item.label}</label>
              </div>
            ))}
          </div>

          {/* Warning message */}
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              This action is permanent and cannot be undone. All your project data will be completely deleted.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="destructive">
            Reset Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
