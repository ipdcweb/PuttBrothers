"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTopOnRouteChange() {
  const pathname = usePathname()

  useEffect(() => {
    // Keep project CTAs anchored to the form after client-side navigation.
    if (window.location.hash) {
      const frame = requestAnimationFrame(() => {
        let id = window.location.hash.slice(1)
        try { id = decodeURIComponent(id) } catch { /* Use the literal fragment if malformed. */ }
        const target = document.getElementById(id)
        if (target) {
          const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerHeight, behavior: "instant" })
        }
      })
      return () => cancelAnimationFrame(frame)
    }
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
