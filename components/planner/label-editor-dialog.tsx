import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TextLabel } from "@/lib/planner/planner-types"

interface LabelEditorDialogProps {
  label: TextLabel | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (label: TextLabel) => void
}

export function LabelEditorDialog({
  label,
  open,
  onOpenChange,
  onSave,
}: LabelEditorDialogProps) {
  const [name, setName] = useState(label?.name || "")
  const [description, setDescription] = useState(label?.description || "")

  const handleSave = () => {
    if (label) {
      onSave({
        ...label,
        name,
        description,
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Label: {label?.text}</DialogTitle>
          <DialogDescription>
            Add a name and description for this label to appear in the legend and tooltip.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Label Name</Label>
            <Input
              id="name"
              placeholder="e.g., Parte Superior da Bar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g., This is the upper bar area where customers can order drinks"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
