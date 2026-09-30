"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flag, Table, ChevronLeft, ChevronRight } from "lucide-react"
import { getMachinesWithFlags } from "@/app/actions/machines_with_flags"
import "@/components/coverflow.css"

gsap.registerPlugin(ScrollTrigger)

type Machine = {
  id: number
  name: string
  category: string
  image: string
  folderName?: string
  has3D?: boolean
}

export function MachinesGallery() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressBarContainerRef = useRef<HTMLDivElement>(null)
  const [currentMachine, setCurrentMachine] = useState(1)
  const [activeTab, setActiveTab] = useState("course-holes")
  const [machines, setMachines] = useState<Machine[]>([])
  const [courseHolesData, setCourseHolesData] = useState<Machine[]>([])
  const [tableGolfData, setTableGolfData] = useState<Machine[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null)
  const hasMoved = useRef(false)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modal3D, setModal3D] = useState<string | false>(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (iframe) {
      const handleLoad = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDoc) {
            const footer = iframeDoc.getElementById("unity-footer")
            if (footer) {
              footer.style.display = "none"
            }
          }
        } catch (error) {
          console.error("Failed to access iframe content:", error)
        }
      }

      iframe.addEventListener("load", handleLoad)

      return () => {
        iframe.removeEventListener("load", handleLoad)
      }
    }
  }, [modal3D])


  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch machines from API
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        setIsLoading(true)
        const machinesData = await getMachinesWithFlags()

        if (!machinesData || machinesData.length === 0) {
          setCourseHolesData([])
          setTableGolfData([])
          setMachines([])
          setIsLoading(false)
          return
        }

        // Transform API data to match the component structure
        const transformedMachines: Machine[] = machinesData.map((product: any, index: number) => {
          // Determine category based on FolderName or use default
          let category = "Interactive"
          if (product.Category) {
            category = product.Category
          }
          console.log(product.FolderName)
          // Determine image path from S3
          const imagePath = `/product-media/${encodeURIComponent(product.FolderName)}/media/desktop.png`

          return {
            id: index + 1,
            name: product.Machine || product.FolderName || `Machine ${index + 1}`,
            category: category,
            image: imagePath,
            folderName: product.FolderName,
            has3D: product.has3D === true,
          }
        })

        // Separate into courseHoles (FolderName starts with "JN") and tableGolf (everything else)
        const apiCourseHoles = transformedMachines.filter((machine) => machine.folderName?.startsWith("JN"))

        const apiTableGolf = transformedMachines.filter((machine) => !machine.folderName?.startsWith("JN"))

        setCourseHolesData(apiCourseHoles)
        setTableGolfData(apiTableGolf)
        setMachines(apiCourseHoles)
      } catch (error) {
        console.error("Error fetching machines:", error)
        setCourseHolesData([])
        setTableGolfData([])
        setMachines([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchMachines()
  }, [])

  useEffect(() => {
    if (activeTab === "course-holes") {
      setMachines(courseHolesData)
    } else {
      setMachines(tableGolfData)
    }
    setCurrentMachine(1)

    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
  }, [activeTab, courseHolesData, tableGolfData])

  const scrollTweenRef = useRef<gsap.core.Tween | null>(null)

  const navigateToMachine = (progress: number) => {
    if (!scrollTweenRef.current || machines.length === 0) return

    const scrollTriggerInstance = scrollTweenRef.current.scrollTrigger
    if (!scrollTriggerInstance) return

    const targetScroll =
      scrollTriggerInstance.start + (scrollTriggerInstance.end - scrollTriggerInstance.start) * progress

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    })
  }

  const handlePrev = () => {
    const newMachine = Math.max(1, currentMachine - 1)
    setCurrentMachine(newMachine)
    const progress = (newMachine - 1) / machines.length
    navigateToMachine(progress)
  }

  const handleNext = () => {
    const newMachine = Math.min(machines.length, currentMachine + 1)
    setCurrentMachine(newMachine)
    const progress = (newMachine - 1) / machines.length
    navigateToMachine(progress)
  }

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

      scrollTweenRef.current = gsap.to(scrollContainer, {
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
            opacity: 0.5,
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
              containerAnimation: scrollTweenRef.current ?? undefined,
              start: "left 50%",
              end: "center center",
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

  if (isLoading) {
    return (
      <section className="relative bg-white py-5 my-5">
        <div className="container mx-auto px-4 mb-0 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#41059a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#41059a] font-medium">Loading machines...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative bg-white py-5 my-5">
      <div className="container mx-auto px-4 mb-0 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid max-w-md mx-auto grid-cols-2 h-14 bg-gray-100 p-1 w-11/12">
            <TabsTrigger
              value="course-holes"
              className="font-bold data-[state=active]:bg-[#41059a] data-[state=active]:text-[#ffcc00] transition-all duration-300 text-xl cursor-pointer"
            >
              <Flag className="w-4 h-4 mr-2" />
              Course Holes
            </TabsTrigger>
            <TabsTrigger
              value="table-golf"
              className="font-bold data-[state=active]:bg-[#41059a] data-[state=active]:text-[#ffcc00] transition-all duration-300 text-xl cursor-pointer"
            >
              <Table className="w-4 h-4 mr-2" />
              Table Golf
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div ref={containerRef} className="relative top-[-15vh] h-[calc(100vh)] overflow-hidden flex items-center">
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
              onClick={() => setSelectedMachine(machine)}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl bg-[#41059a] border-2 border-transparent hover:border-[#ffcc00] transition-all duration-300">
                <div className="relative w-full h-[70%] overflow-hidden">
                  <Image
                    src={machine.image || "/placeholder.svg"}
                    alt={machine.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="relative h-[30%] p-6 bg-[#41059a]">
                  <h3 className="text-2xl font-bold text-white mb-2">{machine.name}</h3>
                  <p className="text-gray-300 text-sm">
                    {activeTab === "course-holes" ? "Course Hole" : "Table Golf"} #
                    {machine.id.toString().padStart(2, "0")}
                  </p>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 text-[#ffcc00] font-semibold">
                      <span>{"Details"}</span>
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

        {/* New position for arrows */}
        <div className="absolute bottom-[10rem] left-0 right-0 flex justify-between px-4 z-20">
          <button
            onClick={handlePrev}
            className="bg-white/50 hover:bg-white/80 rounded-full p-2 transition-all disabled:opacity-50"
            disabled={currentMachine === 1}
          >
            <ChevronLeft className="w-8 h-8 text-[#41059a]" />
          </button>
          <button
            onClick={handleNext}
            className="bg-white/50 hover:bg-white/80 rounded-full p-2 transition-all disabled:opacity-50"
            disabled={currentMachine === machines.length}
          >
            <ChevronRight className="w-8 h-8 text-[#41059a]" />
          </button>
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

      {selectedMachine && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMachine(null)}
        >
          <div
            style={{
              height: "auto",
              maxHeight: "90vh",
              width: "90vw",
              maxWidth: "90vw",
            }}
            className="relative bg-[#0c022f] rounded-2xl p-4 border-4 border-[#ffcc00]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMachine(null)}
              className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#ffcc00] hover:bg-[#ffd633] flex items-center justify-center transition-all hover:scale-110 shadow-lg z-10"
            >
              <span className="text-3xl text-[#41059a] font-bold">×</span>
            </button>

            <div
              className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0c022f]"
              style={{
                height: "auto",
                maxHeight: "70vh",
              }}
            >
              {modal3D ? (
                <iframe
                  ref={iframeRef}
                  src={modal3D}
                  frameBorder="0"
                  allowFullScreen
                  scrolling="no"
                  className="object-contain"
                  width={"100%"}
                  height={"100%"}
                />
              ) : (
                <Image
                  src={selectedMachine.image || "/placeholder.svg"}
                  alt={selectedMachine.name}
                  fill
                  className="object-contain"
                />
              )}
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-3xl font-bold text-[#ffcc00] mb-2">{selectedMachine.name}</h3>
              <p className="text-white text-lg">
                {activeTab === "course-holes" ? "Course Hole" : "Table Golf"} #
                {selectedMachine.id.toString().padStart(2, "0")}
              </p>
            </div>
            {selectedMachine.has3D && (
              <button
                onClick={() => {
                  const filePath = `https://puttbrothers-images.s3.ap-southeast-2.amazonaws.com/${selectedMachine.folderName}/build/index.html`
                  setModal3D(filePath)
                }}
                className="modal-3d-button"
              >
                <Image src={"/3d-cube.webp"} alt="Open 3D" width={84} height={84} priority />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
