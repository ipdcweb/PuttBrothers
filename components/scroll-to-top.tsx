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
      className={`fixed bottom-8 right-8 z-50 rounded-full shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-2 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      } ${
        showText ? "px-6 py-3" : "p-3"
      } ${shouldHide ? "md:opacity-100 md:translate-y-0 max-md:!opacity-0 max-md:!pointer-events-none" : ""}`}
      style={{ backgroundColor: "#ffcc00" }}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-6" style={{ color: "#41059a" }} />
      {showText && (
        <span className="font-semibold text-sm whitespace-nowrap" style={{ color: "#41059a" }}>
          Top
        </span>
      )}
    </button>
  )
}
