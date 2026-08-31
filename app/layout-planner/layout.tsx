import type React from "react"
import { Inter, JetBrains_Mono } from "next/font/google"
import { PlannerRouteShell } from "@/components/planner/planner-route-shell"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${jetbrainsMono.variable} flex min-h-dvh flex-col bg-background font-sans`}>
      <PlannerRouteShell>{children}</PlannerRouteShell>
    </div>
  )
}
