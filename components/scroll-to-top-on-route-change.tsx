"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTopOnRouteChange() {
  const pathname = usePathname()

  useEffect(() => {
    // Instantly scroll to top when route changes (no animation)
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
