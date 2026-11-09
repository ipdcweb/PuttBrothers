"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle } from "lucide-react"
import type { PlannerState } from "@/lib/planner/planner-types"

interface LayoutConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  state: PlannerState
}

export function LayoutConfirmationDialog({ open, onOpenChange, onConfirm, state }: LayoutConfirmationDialogProps) {
  const items = [
    {
      label: "All machines are correctly placed?",
    },
    {
      label: "All machine positions are verified?",
    },
    {
      label: "All clearance zones are correct?",
    },
    {
      label: "Layout is ready for summary?",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Layout Design</DialogTitle>
          <DialogDescription>
            Please verify all items before proceeding to the summary.
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
              Once you proceed to the summary, you will not be able to return to edit the machine layout. If you need to make changes, you will need to start the entire process over.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back to Edit
          </Button>
          <Button onClick={onConfirm}>
            Continue to Summary
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
