"use client"
import { useState, useEffect, useRef } from "react"

const slides = [
  {
    title: "Ultimate Mini Golf Adventure",
    subtitle:
      "Invest in the future of family entertainment with premium mini golf courses. Over 20 years of industry-leading expertise.",
  },
  {
    title: "Turnkey Design to Installation",
    subtitle: "From concept to completion we design, manufacture, and install complete entertainment experiences.",
  },
  {
    title: "Global Reach, Local Expertise",
    subtitle: "With factories in New Zealand and Brazil, we deliver world-class attractions worldwide.",
  },
  {
    title: null,
    subtitle: null,
  },
]

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setIsTransitioning(false)
      }, 500)
    }, 8000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleVideoEnd = () => {
      setCurrentSlide(0)
    }

    video.addEventListener("ended", handleVideoEnd)
    return () => video.removeEventListener("ended", handleVideoEnd)
  }, [])

  return (
    <section id="home" className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: "#41059a" }}>
      <div className="absolute inset-0">
        <video ref={videoRef} autoPlay loop muted playsInline className="w-full h-full object-cover">
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HeroSlide01-m7AcInryOyL89aOUyqgiKXWi6CZ6gl.mp4" type="video/mp4" />
        </video>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            currentSlide === index && !isTransitioning ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Content */}
          {(slide.title || slide.subtitle) && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 lg:px-8">
              <div className="max-w-5xl mx-auto text-center">
                {slide.title && (
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance leading-tight">
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
                    {slide.subtitle}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Decorative Bottom Gradient */}
    </section>
  )
}
