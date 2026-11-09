"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flag, Table, ChevronLeft, ChevronRight } from "lucide-react"

type Machine = {
  id: number
  name: string
  category: string
  image: string
  folderName?: string
}

export function MachinesGalleryMobile() {
  const [activeTab, setActiveTab] = useState("course-holes")
  const [machines, setMachines] = useState<Machine[]>([])
  const [courseHolesData, setCourseHolesData] = useState<Machine[]>([])
  const [tableGolfData, setTableGolfData] = useState<Machine[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    const fetchMachines = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/products/machines", {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch machines")
        }

        const machinesData = await response.json()

        if (!machinesData || machinesData.length === 0) {
          setCourseHolesData([])
          setTableGolfData([])
          setMachines([])
          setIsLoading(false)
          return
        }

        const transformedMachines: Machine[] = machinesData.map((product: any, index: number) => {
          let category = "Interactive"
          if (product.Category) {
            category = product.Category
          }
          const folderName = product.FolderName || product.folderName
          const imagePath = folderName
            ? `/product-media/${encodeURIComponent(folderName)}/media/mobile.png`
            : "/placeholder.svg"

          return {
            id: index + 1,
            name: product.Machine || folderName || `Machine ${index + 1}`,
            category: category,
            image: imagePath,
            folderName,
          }
        })

        const apiCourseHoles = transformedMachines.filter((machine) => machine.folderName?.startsWith("JN"))
        const apiTableGolf = transformedMachines.filter((machine) => !machine.folderName?.startsWith("JN"))

        setCourseHolesData(apiCourseHoles)
        setTableGolfData(apiTableGolf)
        setMachines(apiCourseHoles)
      } catch (error) {
        if (controller.signal.aborted) return
        console.error("Error fetching machines:", error)
        setCourseHolesData([])
        setTableGolfData([])
        setMachines([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMachines()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (activeTab === "course-holes") {
      setMachines(courseHolesData)
    } else {
      setMachines(tableGolfData)
    }
    setCurrentIndex(0)
  }, [activeTab, courseHolesData, tableGolfData])

  const animateCard = (direction: "next" | "prev") => {
    if (isAnimating || !cardRef.current) return
    setIsAnimating(true)

    const card = cardRef.current
    const exitX = direction === "next" ? -100 : 100
    const enterX = direction === "next" ? 100 : -100

    gsap.to(card, {
      x: exitX,
      opacity: 0,
      scale: 0.8,
      rotationY: direction === "next" ? -15 : 15,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        if (direction === "next") {
          setCurrentIndex((prev) => (prev + 1) % machines.length)
        } else {
          setCurrentIndex((prev) => (prev - 1 + machines.length) % machines.length)
        }

        gsap.set(card, {
          x: enterX,
          opacity: 0,
          scale: 0.8,
          rotationY: direction === "next" ? 15 : -15,
        })

        gsap.to(card, {
          x: 0,
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => setIsAnimating(false),
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
        handleNext()
      } else {
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

  if (isLoading) {
    return (
      <section className="relative bg-gradient-to-b from-white to-gray-50 py-8">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[680px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#23084a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#23084a] font-medium">Loading machines...</p>
          </div>
        </div>
      </section>
    )
  }

  if (!currentMachine) {
    return (
      <section className="relative bg-gradient-to-b from-white to-gray-50 py-8">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[680px]">
          <div className="text-center">
            <p className="text-[#23084a] font-medium">No machines found.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12 bg-gray-100 p-1 rounded-full">
            <TabsTrigger
              value="course-holes"
              className="font-bold data-[state=active]:bg-[#23084a] data-[state=active]:text-[#ffcc00] transition-all duration-300 rounded-full text-lg cursor-pointer"
            >
              <Flag className="w-4 h-4 mr-2" />
              Course Holes
            </TabsTrigger>
            <TabsTrigger
              value="table-golf"
              className="font-bold data-[state=active]:bg-[#23084a] data-[state=active]:text-[#ffcc00] transition-all duration-300 rounded-full text-lg cursor-pointer"
            >
              <Table className="w-4 h-4 mr-2" />
              Table Golf
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative min-h-[680px] flex items-center justify-center perspective-1000">
          <div
            ref={cardRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-full max-w-sm mx-auto"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="relative w-full min-h-[580px] rounded-3xl overflow-hidden shadow-2xl bg-[#23084a] border-4 border-[#ffcc00]">
              <div
                className="relative w-full h-[300px] overflow-hidden cursor-pointer"
                onClick={() => setSelectedMachine(currentMachine)}
              >
                <Image
                  src={currentMachine.image || "/placeholder.svg"}
                  alt={currentMachine.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#23084a] via-transparent to-transparent opacity-60" />
              </div>

              <div className="relative p-6 bg-gradient-to-br from-[#23084a] via-[#3a1a6b] to-[#23084a] flex flex-col justify-between min-h-[280px]">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{currentMachine.name}</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    {activeTab === "course-holes" ? "Course Hole" : "Table Golf"} #
                    {currentMachine.id.toString().padStart(2, "0")}
                  </p>

                  <button className="flex items-center gap-2 text-[#ffcc00] font-semibold text-sm hover:gap-3 transition-all duration-300">
                    <span>Learn More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleNext}
                      disabled={isAnimating}
                      className="w-12 h-8 rounded-full bg-[#ffcc00] hover:bg-[#ffd633] text-[#23084a] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="text-center">
                      <p className="text-white font-bold text-base">
                        {activeTab === "course-holes" ? "Course Hole" : "Table Golf"} {currentIndex + 1}
                      </p>
                    </div>

                    <button
                      onClick={handlePrev}
                      disabled={isAnimating}
                      className="w-12 h-8 rounded-full bg-[#ffcc00] hover:bg-[#ffd633] text-[#23084a] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                      aria-label="Next"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

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

        <div className="text-center mt-6"></div>
      </div>

      {selectedMachine && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMachine(null)}
        >
          <div
            className="relative bg-[#41059a] rounded-2xl max-w-4xl w-full p-4 border-4 border-[#ffcc00]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMachine(null)}
              className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#ffcc00] hover:bg-[#ffd633] flex items-center justify-center transition-all hover:scale-110 shadow-lg z-10"
            >
              <span className="text-3xl text-[#41059a] font-bold">×</span>
            </button>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#41059a]">
              <Image
                src={selectedMachine.image || "/placeholder.svg"}
                alt={selectedMachine.name}
                fill
                className="object-contain"
              />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-3xl font-bold text-[#ffcc00] mb-2">{selectedMachine.name}</h3>
              <p className="text-white text-lg">
                {activeTab === "course-holes" ? "Course Hole" : "Table Golf"} #
                {selectedMachine.id.toString().padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
