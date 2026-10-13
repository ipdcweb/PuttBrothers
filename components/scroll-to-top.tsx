"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { ChevronUp } from "lucide-react"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const [showText, setShowText] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
        setShowText(window.scrollY > 500)
      } else {
        setIsVisible(false)
        setShowText(false)
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
      className={`fixed bottom-6 right-6 z-50 rounded-full shadow-md transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      } ${
        showText ? "px-3 py-2" : "p-2"
      } ${shouldHide ? "md:opacity-100 md:translate-y-0 max-md:!opacity-0 max-md:!pointer-events-none" : ""}`}
      style={{ backgroundColor: "#ffcc00" }}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-4 w-4" style={{ color: "#41059a" }} />
      {showText && (
        <span className="font-semibold text-xs whitespace-nowrap" style={{ color: "#41059a" }}>
          Top
        </span>
      )}
    </button>
  )
}
