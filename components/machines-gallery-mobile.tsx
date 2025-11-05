"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flag, Table, ChevronLeft, ChevronRight } from "lucide-react"

const courseHoles = [
  { id: 1, name: "Beer Pong", category: "Classic", image: "/placeholder.svg?height=400&width=600" },
  { id: 2, name: "Raptor-Run", category: "Interactive", image: "/placeholder.svg?height=400&width=600" },
  { id: 3, name: "Space Shot", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 4, name: "Windmill Classic", category: "Classic", image: "/placeholder.svg?height=400&width=600" },
  { id: 5, name: "Loop de Loop", category: "Challenge", image: "/placeholder.svg?height=400&width=600" },
  { id: 6, name: "Pirate's Cove", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 7, name: "Volcano Eruption", category: "Interactive", image: "/placeholder.svg?height=400&width=600" },
  { id: 8, name: "Castle Gate", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 9, name: "Roulette Wheel", category: "Interactive", image: "/placeholder.svg?height=400&width=600" },
  { id: 10, name: "Jungle Adventure", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 11, name: "Neon Lights", category: "Modern", image: "/placeholder.svg?height=400&width=600" },
  { id: 12, name: "Underwater World", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 13, name: "Spiral Tower", category: "Challenge", image: "/placeholder.svg?height=400&width=600" },
  { id: 14, name: "Dragon's Lair", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 15, name: "Disco Ball", category: "Modern", image: "/placeholder.svg?height=400&width=600" },
  { id: 16, name: "Aztec Temple", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 17, name: "Rainbow Bridge", category: "Classic", image: "/placeholder.svg?height=400&width=600" },
  { id: 18, name: "Time Warp", category: "Interactive", image: "/placeholder.svg?height=400&width=600" },
  { id: 19, name: "Safari Zone", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 20, name: "Crystal Cave", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 21, name: "Rocket Launch", category: "Interactive", image: "/placeholder.svg?height=400&width=600" },
  { id: 22, name: "Medieval Quest", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 23, name: "Laser Maze", category: "Modern", image: "/placeholder.svg?height=400&width=600" },
  { id: 24, name: "Treasure Island", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 25, name: "Cyber City", category: "Modern", image: "/placeholder.svg?height=400&width=600" },
  { id: 26, name: "Ancient Egypt", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 27, name: "Gravity Defier", category: "Challenge", image: "/placeholder.svg?height=400&width=600" },
  { id: 28, name: "Carnival Lights", category: "Classic", image: "/placeholder.svg?height=400&width=600" },
  { id: 29, name: "Arctic Adventure", category: "Themed", image: "/placeholder.svg?height=400&width=600" },
  { id: 30, name: "Neon Jungle", category: "Modern", image: "/placeholder.svg?height=400&width=600" },
]

const tableGolf = [
  { id: 1, name: "Mini Classic", category: "Compact", image: "/placeholder.svg?height=400&width=600" },
  { id: 2, name: "Desktop Pro", category: "Professional", image: "/placeholder.svg?height=400&width=600" },
  { id: 3, name: "Tabletop Challenge", category: "Challenge", image: "/placeholder.svg?height=400&width=600" },
  { id: 4, name: "Office Putt", category: "Compact", image: "/placeholder.svg?height=400&width=600" },
  { id: 5, name: "Portable Fun", category: "Portable", image: "/placeholder.svg?height=400&width=600" },
  { id: 6, name: "Executive Suite", category: "Professional", image: "/placeholder.svg?height=400&width=600" },
  { id: 7, name: "Quick Shot", category: "Compact", image: "/placeholder.svg?height=400&width=600" },
  { id: 8, name: "Travel Putt", category: "Portable", image: "/placeholder.svg?height=400&width=600" },
  { id: 9, name: "Precision Table", category: "Professional", image: "/placeholder.svg?height=400&width=600" },
  { id: 10, name: "Mini Master", category: "Challenge", image: "/placeholder.svg?height=400&width=600" },
  { id: 11, name: "Desk Champion", category: "Compact", image: "/placeholder.svg?height=400&width=600" },
  { id: 12, name: "Boardroom Putt", category: "Professional", image: "/placeholder.svg?height=400&width=600" },
  { id: 13, name: "Pocket Pro", category: "Portable", image: "/placeholder.svg?height=400&width=600" },
  { id: 14, name: "Table Elite", category: "Professional", image: "/placeholder.svg?height=400&width=600" },
  { id: 15, name: "Compact King", category: "Compact", image: "/placeholder.svg?height=400&width=600" },
]

export function MachinesGalleryMobile() {
  const [activeTab, setActiveTab] = useState("course-holes")
  const [machines, setMachines] = useState(courseHoles)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    if (activeTab === "course-holes") {
      setMachines(courseHoles)
    } else {
      setMachines(tableGolf)
    }
    setCurrentIndex(0)
  }, [activeTab])

  const animateCard = (direction: "next" | "prev") => {
    if (isAnimating || !cardRef.current) return
    setIsAnimating(true)

    const card = cardRef.current
    const exitX = direction === "next" ? -100 : 100
    const enterX = direction === "next" ? 100 : -100

    // Exit animation
    gsap.to(card, {
      x: exitX,
      opacity: 0,
      scale: 0.8,
      rotationY: direction === "next" ? -15 : 15,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        // Update index
        if (direction === "next") {
          setCurrentIndex((prev) => (prev + 1) % machines.length)
        } else {
          setCurrentIndex((prev) => (prev - 1 + machines.length) % machines.length)
        }

        // Reset position for enter animation
        gsap.set(card, {
          x: enterX,
          opacity: 0,
          scale: 0.8,
          rotationY: direction === "next" ? 15 : -15,
        })

        // Enter animation
        gsap.to(card, {
          x: 0,
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            setIsAnimating(false)
          },
        })
      },
    })
  }

  const handleNext = () => {
    animateCard("next")
  }

  const handlePrev = () => {
    animateCard("prev")
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (isAnimating) return

    const swipeDistance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped left - next card
        handleNext()
      } else {
        // Swiped right - previous card
        handlePrev()
      }
    }
  }

  const handleDotClick = (index: number) => {
    if (isAnimating || index === currentIndex) return

    const direction = index > currentIndex ? "next" : "prev"
    setIsAnimating(true)

    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.8, rotationY: direction === "next" ? 15 : -15 },
        {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => setIsAnimating(false),
        },
      )
    }
    setCurrentIndex(index)
  }

  const currentMachine = machines[currentIndex]

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12 bg-gray-100 p-1 rounded-full">
            <TabsTrigger
              value="course-holes"
              className="font-bold data-[state=active]:bg-[#23084a] data-[state=active]:text-[#ffcc00] transition-all duration-300 rounded-full"
            >
              <Flag className="w-4 h-4 mr-2" />
              Course Holes
            </TabsTrigger>
            <TabsTrigger
              value="table-golf"
              className="font-bold data-[state=active]:bg-[#23084a] data-[state=active]:text-[#ffcc00] transition-all duration-300 rounded-full"
            >
              <Table className="w-4 h-4 mr-2" />
              Table Golf
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Card Container */}
        <div className="relative min-h-[680px] flex items-center justify-center perspective-1000">
          {/* Card */}
          <div
            ref={cardRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-full max-w-sm mx-auto"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="relative w-full min-h-[580px] rounded-3xl overflow-hidden shadow-2xl bg-[#23084a] border-4 border-[#ffcc00]">
              {/* Image Section */}
              <div className="relative w-full h-[300px] overflow-hidden">
                <Image
                  src={currentMachine.image || "/placeholder.svg"}
                  alt={currentMachine.name}
                  fill
                  className="object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#23084a] via-transparent to-transparent opacity-60" />
              </div>

              {/* Content Section */}
              <div className="relative p-6 bg-gradient-to-br from-[#23084a] via-[#3a1a6b] to-[#23084a] flex flex-col justify-between min-h-[280px]">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{currentMachine.name}</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    {activeTab === "course-holes" ? "Course Hole" : "Table Golf"} #
                    {currentMachine.id.toString().padStart(2, "0")}
                  </p>

                  {/* Learn More Button */}
                  <button className="flex items-center gap-2 text-[#ffcc00] font-semibold text-sm hover:gap-3 transition-all duration-300">
                    <span>Learn More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Navigation and Progress Section */}
                <div className="space-y-3">
                  {/* Navigation with Counter */}
                  <div className="flex items-center justify-between">
                    {/* Previous Button */}
                    <button
                      onClick={handlePrev}
                      disabled={isAnimating}
                      className="w-12 h-8 rounded-full bg-[#ffcc00] hover:bg-[#ffd633] text-[#23084a] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Counter and Percentage */}
                    <div className="text-center">
                      <p className="text-white font-bold text-base">
                        {activeTab === "course-holes" ? "Course Hole" : "Table Golf"} {currentIndex + 1}
                      </p>
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={handleNext}
                      disabled={isAnimating}
                      className="w-12 h-8 rounded-full bg-[#ffcc00] hover:bg-[#ffd633] text-[#23084a] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                      aria-label="Next"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Progress Dots */}
                  <div className="flex items-center justify-center gap-2 py-1">
                    {machines.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        disabled={isAnimating}
                        className={`transition-all duration-300 rounded-full disabled:cursor-not-allowed ${
                          index === currentIndex
                            ? "w-10 h-2.5 bg-[#ffcc00] shadow-lg shadow-[#ffcc00]/50"
                            : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
                        }`}
                        aria-label={`Go to ${activeTab === "course-holes" ? "Course Hole" : "Table Golf"} ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Swipe Hint */}
        <div className="text-center mt-6">
          
        </div>
      </div>
    </section>
  )
}
