"use client"

import { useRef, useEffect } from "react"
import { TheProcess } from "@/components/the-process"
import { Machines3DCarousel } from "@/components/machines-3d-carousel"
import { MachinesGallery } from "@/components/machines-gallery"
import { MachinesGalleryMobile } from "@/components/machines-gallery-mobile"

export default function ProductsPage() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Ensure video plays on mount
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("[v0] Video autoplay failed:", error)
      })
    }
  }, [])

  return (
    <main className="min-h-screen">
      {/* Hero Section - matching About and Contact pages */}
      <section className="relative pt-32 pb-20 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Our Products</h1>
          <div className="w-24 h-1 bg-[#ffcc00] mx-auto"></div>
        </div>
      </section>

      <Machines3DCarousel />

      {/* The Process Section */}
      <TheProcess />

      <div className="hidden md:block">
        <MachinesGallery />
      </div>

      <div className="block md:hidden">
        <MachinesGalleryMobile />
      </div>
    </main>
  )
}
