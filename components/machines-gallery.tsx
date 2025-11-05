"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flag, Table } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

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

export function MachinesGallery() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressBarContainerRef = useRef<HTMLDivElement>(null)
  const [currentMachine, setCurrentMachine] = useState(1)
  const [activeTab, setActiveTab] = useState("course-holes")
  const [machines, setMachines] = useState(courseHoles)
  const [isDragging, setIsDragging] = useState(false)
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null)
  const hasMoved = useRef(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (activeTab === "course-holes") {
      setMachines(courseHoles)
    } else {
      setMachines(tableGolf)
    }
    setCurrentMachine(1)

    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
  }, [activeTab])

  useEffect(() => {
    if (!isMounted) return

    const container = containerRef.current
    const scrollContainer = scrollContainerRef.current
    const cards = cardsRef.current
    const progressBar = progressBarRef.current
    const progressBarContainer = progressBarContainerRef.current

    if (!container || !scrollContainer || cards.length === 0 || !progressBar || !progressBarContainer) return

    const setupAnimations = () => {
      gsap.set(cards[0], { opacity: 1, y: 0, scale: 1 })

      const scrollWidth = scrollContainer.scrollWidth - window.innerWidth

      const scrollTween = gsap.to(scrollContainer, {
        x: -scrollWidth,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress
            const machineIndex = Math.floor(progress * machines.length)
            setCurrentMachine(Math.min(machineIndex + 1, machines.length))

            gsap.to(progressBar, {
              scaleX: progress,
              duration: 0.1,
              ease: "none",
            })
          },
        },
      })

      const navigateToMachine = (progress: number) => {
        const scrollTriggerInstance = scrollTween.scrollTrigger
        if (!scrollTriggerInstance) return

        const targetScroll =
          scrollTriggerInstance.start + (scrollTriggerInstance.end - scrollTriggerInstance.start) * progress

        window.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        })
      }

      const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault()
        mouseDownPos.current = { x: e.clientX, y: e.clientY }
        hasMoved.current = false
        setIsDragging(false)
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!mouseDownPos.current) return

        const deltaX = Math.abs(e.clientX - mouseDownPos.current.x)
        const deltaY = Math.abs(e.clientY - mouseDownPos.current.y)

        if (deltaX > 5 || deltaY > 5) {
          hasMoved.current = true
          setIsDragging(true)
        }

        if (hasMoved.current) {
          const rect = progressBarContainer.getBoundingClientRect()
          const dragX = e.clientX - rect.left
          const progress = Math.max(0, Math.min(1, dragX / rect.width))
          navigateToMachine(progress)
        }
      }

      const handleMouseUp = (e: MouseEvent) => {
        if (!hasMoved.current && mouseDownPos.current) {
          const rect = progressBarContainer.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const progress = Math.max(0, Math.min(1, clickX / rect.width))
          navigateToMachine(progress)
        }

        mouseDownPos.current = null
        hasMoved.current = false
        setIsDragging(false)
      }

      progressBarContainer.addEventListener("mousedown", handleMouseDown)
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)

      cards.forEach((card, index) => {
        if (index === 0) return

        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 100,
            scale: 0.8,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: "left 80%",
              end: "left 20%",
              toggleActions: "play none none reverse",
            },
          },
        )

        card.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -20,
            scale: 1.05,
            duration: 0.4,
            ease: "power2.out",
          })
        })

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: "power2.out",
          })
        })
      })

      ScrollTrigger.refresh()

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
        progressBarContainer.removeEventListener("mousedown", handleMouseDown)
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }

    const rafId = requestAnimationFrame(() => {
      const cleanup = setupAnimations()
      return cleanup
    })

    return () => {
      cancelAnimationFrame(rafId)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [machines, isMounted])

  return (
    <section className="relative bg-white py-5 my-5">
      <div className="container mx-auto px-4 mb-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-14 bg-gray-100 p-1">
            <TabsTrigger
              value="course-holes"
              className="font-bold data-[state=active]:bg-[#23084a] data-[state=active]:text-[#ffcc00] transition-all duration-300 text-lg"
            >
              <Flag className="w-4 h-4 mr-2" />
              Course Holes
            </TabsTrigger>
            <TabsTrigger
              value="table-golf"
              className="font-bold data-[state=active]:bg-[#23084a] data-[state=active]:text-[#ffcc00] transition-all duration-300 text-lg"
            >
              <Table className="w-4 h-4 mr-2" />
              Table Golf
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div ref={containerRef} className="relative h-screen overflow-hidden flex items-center">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-8 px-8 h-full"
          style={{ paddingLeft: "10vw", paddingRight: "50vw" }}
        >
          {machines.map((machine, index) => (
            <div
              key={`${activeTab}-${machine.id}`}
              ref={(el) => {
                if (el) cardsRef.current[index] = el
              }}
              className="relative flex-shrink-0 w-[400px] h-[500px] group cursor-pointer"
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl bg-[#23084a] border-2 border-transparent hover:border-[#ffcc00] transition-all duration-300">
                <div className="relative w-full h-[70%] overflow-hidden">
                  <Image
                    src={machine.image || "/placeholder.svg"}
                    alt={machine.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="relative h-[30%] p-6 bg-gradient-to-br from-[#23084a] to-[#3a1a6b]">
                  <h3 className="text-2xl font-bold text-white mb-2">{machine.name}</h3>
                  <p className="text-gray-300 text-sm">
                    {activeTab === "course-holes" ? "Course Hole" : "Table Golf"} #
                    {machine.id.toString().padStart(2, "0")}
                  </p>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 text-[#ffcc00] font-semibold">
                      <span>Learn More</span>
                      <svg
                        className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-4xl">
          <div className="bg-[#23084a]/90 backdrop-blur-md rounded-full p-4 shadow-2xl border border-[#ffcc00]/20 py-2 px-5">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ffcc00] animate-pulse" />
                <span className="text-white font-bold text-lg">
                  {activeTab === "course-holes" ? "Course Hole" : "Table Golf"} {currentMachine} of {machines.length}
                </span>
              </div>
              <span className="text-white/60 font-medium text-sm">
                {Math.round((currentMachine / machines.length) * 100)}%
              </span>
            </div>

            <div
              ref={progressBarContainerRef}
              className="relative h-3 bg-[#3a1a6b] rounded-full overflow-hidden cursor-pointer hover:h-4 transition-all duration-200"
            >
              <div
                ref={progressBarRef}
                className="absolute inset-0 bg-gradient-to-r from-[#ffcc00] via-[#ffd633] to-[#ffcc00] rounded-full origin-left"
                style={{ transform: "scaleX(0)" }}
              />

              <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
                {machines.map((_, index) => (
                  <div
                    key={index}
                    className={`w-0.5 h-2 rounded-full transition-all duration-300 ${
                      index < currentMachine ? "bg-white" : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </section>
  )
}
