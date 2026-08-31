"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import ScrollToTop from "@/components/scroll-to-top"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollToTopOnRouteChange } from "@/components/scroll-to-top-on-route-change"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPlannerRoute = pathname?.startsWith("/layout-planner")

  if (isPlannerRoute) {
    return <>{children}</>
  }

  return (
    <>
      <ScrollToTopOnRouteChange />
      <Header />
      {children}
      <Footer />
      <ScrollToTop />
    </>
  )
}
