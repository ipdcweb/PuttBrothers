"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface AppPreviewCarouselProps {
  images?: string[]
}

export function AppPreviewCarousel({ images }: AppPreviewCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Default images if none provided
  const defaultImages = [
    "/images/PBApp/Picture1.png",
    "/images/PBApp/Picture2.png",
    "/images/PBApp/Picture3.png",
    "/images/PBApp/Picture4.png",
    "/images/PBApp/Picture5.png",
    "/images/PBApp/Picture6.png",
    "/images/PBApp/Picture7.png",
    "/images/PBApp/Picture8.png",
    "/images/PBApp/Picture9.png",
    "/images/PBApp/Picture10.png",
    "/images/PBApp/Picture11.png",
  ]

  const carouselImages = images && images.length > 0 ? images : defaultImages

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1))
  }

  return (
    <div className="relative flex items-center justify-center gap-4 py-8">
      {/* Left Navigation Button */}
      <button
        onClick={goToPrevious}
        className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ffcc00] hover:bg-[#ffcc00]/90 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg z-10"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6 text-[#41059a]" />
      </button>

      {/* Image Container */}
      <div className="relative flex-1 max-w-xs mx-auto">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl shadow-2xl bg-gray-100">
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`App preview ${index + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Subtle reflection shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-b from-black/10 to-transparent blur-xl rounded-full" />
      </div>

      {/* Right Navigation Button */}
      <button
        onClick={goToNext}
        className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ffcc00] hover:bg-[#ffcc00]/90 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg z-10"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6 text-[#41059a]" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-[#ffcc00] w-6" : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
