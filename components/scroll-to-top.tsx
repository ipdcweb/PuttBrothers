"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChevronUp } from "lucide-react"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => {
      window.removeEventListener("scroll", toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const isProductsPage = pathname === "/products"
  const shouldHide = isProductsPage

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      } ${shouldHide ? "md:opacity-100 md:translate-y-0 max-md:!opacity-0 max-md:!pointer-events-none" : ""}`}
      style={{ backgroundColor: "#ffcc00" }}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-6 w-6" style={{ color: "#41059a" }} />
    </button>
  )
}
