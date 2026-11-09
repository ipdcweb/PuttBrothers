"use client"

import { TextLabel } from "@/lib/planner/planner-types"

interface LabelLegendProps {
  labels: TextLabel[]
}

export function LabelLegend({ labels }: LabelLegendProps) {
  const labeledItems = labels.filter((label) => label.name || label.description)

  if (labeledItems.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Label Legend</h3>
        <div className="space-y-3">
          {labeledItems.map((label) => (
            <div key={label.id} className="flex gap-4 p-3 rounded-lg border border-border bg-card">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded bg-accent font-semibold text-sm">
                {label.text}
              </div>
              <div className="flex-1 min-w-0">
                {label.name && (
                  <h4 className="font-semibold text-foreground text-sm">{label.name}</h4>
                )}
                {label.description && (
                  <p className="text-muted-foreground text-sm mt-1">{label.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
