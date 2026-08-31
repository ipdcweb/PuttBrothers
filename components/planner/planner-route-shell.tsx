"use client"

import type React from "react"
import { Suspense } from "react"
import { PlannerProvider } from "@/lib/planner/planner-context"

export function PlannerRouteShell({ children }: { children: React.ReactNode }) {
  return (
    <PlannerProvider>
      <Suspense fallback={<div className="flex h-dvh flex-col overflow-hidden bg-background" />}>
        {children}
      </Suspense>
    </PlannerProvider>
  )
}
