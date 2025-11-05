"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"

interface Machine {
  id: number
  name: string
  description: string
  image: string
}

// Default machines data
const defaultMachines: Machine[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Machine ${i + 1}`,
  description: `Premium mini-golf machine with advanced features and stunning design.`,
  image: `/placeholder.svg?height=800&width=450&query=mini-golf-machine-${i + 1}`,
}))

export function Machines3DCarousel({ machines = defaultMachines }: { machines?: Machine[] }) {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [ringRotation, setRingRotation] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const ringRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  const totalSlides = machines.length
  const angleStep = 360 / totalSlides

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    const animate = () => {
      if (!isDragging && Math.abs(velocity) > 0.01) {
        setRingRotation((prev) => prev + velocity)
        setVelocity((prev) => prev * 0.95) // Damping
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    if (!isDragging && Math.abs(velocity) > 0.01) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [velocity, isDragging])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * 0.1
    setRingRotation((prev) => prev + delta)
    setVelocity(delta * 0.5)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setVelocity(0)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const delta = (e.clientX - startX) * 0.5
    setRingRotation((prev) => prev + delta)
    setVelocity(delta)
    setStartX(e.clientX)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handleProgressDrag = (e: React.PointerEvent) => {
    const progressBar = e.currentTarget.parentElement
    if (!progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    const targetRotation = (percentage / 100) * 360

    setRingRotation(targetRotation)
    setVelocity(0)
  }

  const getFrontSlideIndex = () => {
    const normalizedRotation = ((ringRotation % 360) + 360) % 360
    const index = Math.round(normalizedRotation / angleStep) % totalSlides
    return index
  }

  const frontSlideIndex = getFrontSlideIndex()

  const progressPercentage = ((((ringRotation % 360) + 360) % 360) / 360) * 100

  if (prefersReducedMotion) {
    return (
      null
    )
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#513bb2] mb-4">Our Mini-Golf Machines</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Explore our premium collection of interactive mini-golf machines. Drag or scroll to rotate.
          </p>
        </div>

        <div
          className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <div
            ref={ringRef}
            className="carousel-ring"
            style={
              {
                "--ring-rotation": `${ringRotation}deg`,
                "--radius-mobile": "260px",
                "--radius-tablet": "360px",
                "--radius-desktop": "520px",
              } as React.CSSProperties
            }
          >
            {machines.map((machine, index) => {
              const angle = index * angleStep
              const isFront = index === frontSlideIndex

              return (
                <div
                  key={machine.id}
                  className={`carousel-slide ${isFront ? "carousel-slide-front" : ""}`}
                  style={
                    {
                      "--angle": `${angle}deg`,
                      "--index": index,
                    } as React.CSSProperties
                  }
                  onClick={() => setSelectedMachine(machine)}
                >
                  <div className="slide-content">
                    <Image
                      src={machine.image || "/placeholder.svg"}
                      alt={machine.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 200px, (max-width: 1024px) 250px, 300px"
                    />
                    <div className="slide-overlay">
                      <h3 className="text-white font-bold text-lg md:text-xl">{machine.name}</h3>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Instructions */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full pointer-events-none">
            <p className="text-white text-sm font-medium">Drag or scroll to rotate • Click to view details</p>
          </div>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          {/* Golf course track - Increased height from h-6 to h-12 for much easier interaction */}
          <div className="relative h-12 bg-gradient-to-r from-green-900 via-green-700 to-green-900 rounded-full overflow-visible shadow-lg">
            {/* Grass texture pattern */}
            <div className="absolute inset-0 opacity-40">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
                }}
              ></div>
            </div>

            {/* Golf ball that moves along the track - Increased size from w-16 h-16 to w-24 h-24 and made it draggable */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-200 ease-out z-10 cursor-grab active:cursor-grabbing"
              style={{ left: `${progressPercentage}%` }}
              onPointerDown={(e) => {
                e.stopPropagation()
                setIsDragging(true)
              }}
              onPointerMove={(e) => {
                if (isDragging) {
                  e.stopPropagation()
                  handleProgressDrag(e)
                }
              }}
              onPointerUp={(e) => {
                e.stopPropagation()
                setIsDragging(false)
              }}
            >
              <div className="relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-4 w-20 h-4 bg-black/40 rounded-full blur-md"></div>

                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl relative border-4 border-gray-200 hover:scale-110 transition-transform duration-200">
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-gray-300/60"></div>
                    <div className="absolute top-4 right-4 w-3.5 h-3.5 rounded-full bg-gray-300/60"></div>
                    <div className="absolute bottom-4 left-5 w-3.5 h-3.5 rounded-full bg-gray-300/60"></div>
                    <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-gray-300/60"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gray-300/60"></div>
                    <div className="absolute top-7 left-8 w-3 h-3 rounded-full bg-gray-300/60"></div>
                    <div className="absolute bottom-7 right-7 w-3 h-3 rounded-full bg-gray-300/60"></div>
                    <div className="absolute top-10 right-10 w-2.5 h-2.5 rounded-full bg-gray-300/60"></div>
                    <div className="absolute bottom-10 left-10 w-2.5 h-2.5 rounded-full bg-gray-300/60"></div>
                    <div className="absolute top-6 right-14 w-2 h-2 rounded-full bg-gray-300/60"></div>
                    <div className="absolute bottom-6 left-14 w-2 h-2 rounded-full bg-gray-300/60"></div>
                  </div>
                  <div className="absolute top-3 left-4 w-7 h-7 rounded-full bg-white/80 blur-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Current machine indicator */}
          <div className="text-center mt-6">
            <p className="text-gray-300 text-base font-medium">
              Machine {frontSlideIndex + 1} of {totalSlides}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-2.5 mt-8 flex-wrap max-w-4xl mx-auto px-4">
          {machines.map((machine, index) => (
            <button
              key={machine.id}
              onClick={() => {
                const targetRotation = index * angleStep
                setRingRotation(targetRotation)
                setVelocity(0)
              }}
              className={`relative rounded-full transition-all duration-300 border-2 ${
                index === frontSlideIndex
                  ? "w-5 h-5 bg-gradient-to-br from-white via-gray-50 to-gray-100 border-[#ffcc00] shadow-lg shadow-[#ffcc00]/50 scale-110"
                  : "w-4 h-4 bg-gradient-to-br from-gray-300 to-gray-400 border-gray-500 hover:border-[#ffcc00] hover:scale-110"
              }`}
              aria-label={`Go to ${machine.name}`}
            >
              {/* Golf ball dimples for all dots */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white/40"></div>
                <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 rounded-full bg-white/40"></div>
                <div className="absolute bottom-0.5 left-1 w-0.5 h-0.5 rounded-full bg-white/40"></div>
                <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-white/40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40"></div>
                <div className="absolute top-3 left-4 w-1 h-1 rounded-full bg-white/40"></div>
                <div className="absolute bottom-3 right-3 w-1 h-1 rounded-full bg-white/40"></div>
              </div>
              {/* Shine effect for active dot */}
              {index === frontSlideIndex && (
                <div className="absolute top-0.5 left-1 w-1.5 h-1.5 rounded-full bg-white/90 blur-[1px]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Machine Details Modal */}
        {selectedMachine && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMachine(null)}
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedMachine(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <span className="text-2xl text-gray-600">×</span>
              </button>

              <div className="relative w-full h-64 mb-6 rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={selectedMachine.image || "/placeholder.svg"}
                  alt={selectedMachine.name}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-3xl font-bold text-[#513bb2] mb-4">{selectedMachine.name}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">{selectedMachine.description}</p>

              <div className="mt-8 flex gap-4">
                <button className="flex-1 bg-[#513bb2] hover:bg-[#41059a] text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Request Quote
                </button>
                <button className="flex-1 bg-[#ffcc00] hover:bg-[#e6b800] text-[#513bb2] font-semibold py-3 px-6 rounded-lg transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .carousel-ring {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          perspective: 1200px;
          perspective-origin: 50% 50%;
          transform: rotateX(0deg) rotateY(var(--ring-rotation));
          transition: transform 0.1s ease-out;
        }

        .carousel-slide {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 356px;
          transform-origin: center center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          transition: transform 0.3s ease-out;
          cursor: pointer;
        }

        /* Responsive radius adjustments */
        @media (min-width: 640px) {
          .carousel-slide {
            width: 250px;
            height: 445px;
          }
        }

        @media (min-width: 1024px) {
          .carousel-slide {
            width: 300px;
            height: 534px;
          }
        }

        /* Transform chain: rotateY(angle) translateZ(radius) rotateY(-angle) */
        .carousel-slide {
          transform: translate(-50%, -50%)
            rotateY(calc(var(--angle) * 1deg))
            translateZ(var(--radius-mobile))
            rotateY(calc(var(--angle) * -1deg));
        }

        @media (min-width: 768px) {
          .carousel-slide {
            transform: translate(-50%, -50%)
              rotateY(calc(var(--angle) * 1deg))
              translateZ(var(--radius-tablet))
              rotateY(calc(var(--angle) * -1deg));
          }
        }

        @media (min-width: 1280px) {
          .carousel-slide {
            transform: translate(-50%, -50%)
              rotateY(calc(var(--angle) * 1deg))
              translateZ(var(--radius-desktop))
              rotateY(calc(var(--angle) * -1deg));
          }
        }

        /* Hover effect with lift and scale for all cards */
        .carousel-slide:hover {
          transform: translate(-50%, -50%)
            rotateY(calc(var(--angle) * 1deg))
            translateZ(var(--radius-mobile))
            rotateY(calc(var(--angle) * -1deg))
            translateY(-20px)
            scale(1.05);
        }

        @media (min-width: 768px) {
          .carousel-slide:hover {
            transform: translate(-50%, -50%)
              rotateY(calc(var(--angle) * 1deg))
              translateZ(var(--radius-tablet))
              rotateY(calc(var(--angle) * -1deg))
              translateY(-20px)
              scale(1.05);
          }
        }

        @media (min-width: 1280px) {
          .carousel-slide:hover {
            transform: translate(-50%, -50%)
              rotateY(calc(var(--angle) * 1deg))
              translateZ(var(--radius-desktop))
              rotateY(calc(var(--angle) * -1deg))
              translateY(-20px)
              scale(1.05);
          }
        }

        .slide-content {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 204, 0, 0.1);
          background: #000;
          /* Added border and transition for hover effect */
          border: 3px solid transparent;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        /* Added yellow border on hover */
        .carousel-slide:hover .slide-content {
          border-color: #ffcc00;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 60px rgba(255, 204, 0, 0.6);
        }

        .carousel-slide-front .slide-content {
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 60px rgba(255, 204, 0, 0.4);
        }
      `}</style>
    </section>
  )
}
