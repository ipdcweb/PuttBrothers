"use client"

import { useState, useEffect } from "react"
import { FileText, Grid3x3 } from "lucide-react"
import { MobilePlannerWarningDialog } from "@/components/planner/mobile-planner-warning-dialog"
import { useIsPlannerMobileDevice } from "@/hooks/use-planner-device-warning"

export default function Home() {
  const [open, setOpen] = useState(false)
  const [showPdfExample, setShowPdfExample] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showMobileWarning, setShowMobileWarning] = useState(false)
  const isPlannerMobileDevice = useIsPlannerMobileDevice()

  // Lock body scroll when modal is open
  useEffect(() => {
    window.sessionStorage.removeItem("puttbrothers-planner-mode")

    if (open || showPdfExample) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open, showPdfExample])

  // Listen for "close-planner" message posted from the iframe (Exit Project button)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data === "close-planner") {
        setOpen(false)
        setIsLoading(false)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  // Auto-dismiss loading screen after 3 seconds
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  return (
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#41059a] to-[#1a0a3a]">
      
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,204,0,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-dvh">
        
        {/* Header - Brand Logo */}
        <div className="pt-8 pb-4 text-center">
          <img
            src="/putt-brothers-logo.png"
            alt="Putt Brothers"
            className="h-12 mx-auto select-none"
          />
        </div>

        {/* Main Title */}
        <div className="text-center px-4 mb-8">
          <h1 className="font-sans text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Plan your venue layout
          </h1>
        </div>

        {/* Two Column Layout */}
        <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-8 px-4 sm:px-6 lg:px-12 pb-12">
          
          {/* Left Column - Description */}
          <div className="flex-1 max-w-md space-y-4 text-white/90 pt-2">
            <p className="font-sans text-lg leading-relaxed">
              Plan your space and design your mini golf layout in minutes. Enter the dimensions of your venue and drag and drop the Putt Brothers Course Holes to visualize how your course could fit inside your available area.
            </p>
            <p className="font-sans text-lg leading-relaxed">
              Once you finish the layout, the system will generate a Layout Summary PDF that will automatically be attached to your request so our team can prepare a quote for your project.
            </p>
          </div>

          {/* Right Column - Course Holes Card */}
          <div className="flex-1 max-w-lg">
            <img
              src="/layout-drag-drop.png"
              alt="Layout Drag and Drop - Course Holes visualization"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 pb-8">
          <button
            onClick={() => {
              if (isPlannerMobileDevice) {
                setShowMobileWarning(true)
                return
              }

              window.localStorage.removeItem("putt-brothers-planner")
              window.location.href = "/layout-planner/space?new=1"
            }}
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 font-sans font-semibold transition-all duration-300 ease-out"
            style={{
              backgroundColor: "#41059a",
              color: "white",
              boxShadow: "0 0 20px rgba(65, 5, 154, 0.4)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ffcc00"
              e.currentTarget.style.color = "#41059a"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#41059a"
              e.currentTarget.style.color = "white"
            }}
          >
            <Grid3x3 className="w-5 h-5" />
            Create your Layout
          </button>

          <button
            onClick={() => setShowPdfExample(true)}
            className="inline-flex items-center gap-2 rounded-full border-2 px-8 py-3 font-sans font-semibold transition-all duration-300 ease-out"
            style={{
              borderColor: "#ffcc00",
              backgroundColor: "transparent",
              color: "white",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ffcc00"
              e.currentTarget.style.color = "#41059a"
              e.currentTarget.style.borderColor = "#ffcc00"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
              e.currentTarget.style.color = "white"
              e.currentTarget.style.borderColor = "#ffcc00"
            }}
          >
            <FileText className="w-5 h-5" />
            View Example Layout PDF
          </button>
        </div>

        {/* Footer Benefits */}
        <div className="text-center pb-8">
          <p className="font-sans text-sm text-[#ffcc00] font-medium select-none">
            🎯 No login • No password • Easy access • Start now! ✨
          </p>
        </div>
      </div>

      {/* ── Full-screen Planner Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Putt Brothers Layout Planner"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal panel */}
          <div className="relative z-10 flex flex-col w-full h-full max-w-[100vw] max-h-[100dvh] bg-background rounded-none shadow-2xl sm:rounded-xl sm:w-[calc(100vw-2rem)] sm:h-[calc(100dvh-2rem)]">

            {/* Planner iframe — overflow hidden prevents inner scroll from showing */}
            <iframe
              src="/layout-planner/space?embedded=1"
              title="Putt Brothers Layout Planner"
              className="flex-1 w-full h-full border-none rounded-none sm:rounded-xl overflow-hidden"
              style={{ display: "block" }}
              scrolling="no"
              allow="clipboard-write"
            />
          </div>
        </div>
      )}

      {/* Loading Screen Modal */}
      {isLoading && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Loading planner"
        >
          <div className="flex flex-col items-center gap-8">
            {/* Image Frame */}
            <div className="bg-white rounded-xl p-8 shadow-2xl border-4 border-gray-200">
              <img
                src="/golf-cart.gif"
                alt="Loading..."
                className="w-56 h-auto"
              />
            </div>
            
            {/* Text Content */}
            <div className="text-center space-y-2">
              <p className="text-white font-semibold text-lg">Preparing your layout planner...</p>
              <p className="text-white/70 text-sm">This will only take a moment</p>
            </div>
          </div>
        </div>
      )}

      <MobilePlannerWarningDialog open={showMobileWarning} onClose={() => setShowMobileWarning(false)} />

      {/* ── PDF Example Modal ── */}
      {showPdfExample && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Example Layout PDF"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPdfExample(false)}
          />

          {/* Modal panel */}
          <div className="relative z-10 flex flex-col w-full h-full max-w-[100vw] max-h-[100dvh] bg-background rounded-none shadow-2xl sm:rounded-xl sm:w-[calc(100vw-2rem)] sm:h-[calc(100dvh-2rem)]">
            
            {/* Close button */}
            <div className="absolute top-4 right-4 z-20 sm:hidden">
              <button
                onClick={() => setShowPdfExample(false)}
                className="p-2 hover:bg-accent rounded-lg"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* PDF iframe - showing example PDF */}
            <iframe
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ViewLayout-GwEmo.pdf"
              title="Example Layout PDF"
              className="flex-1 w-full h-full border-none rounded-none sm:rounded-xl"
              style={{ display: "block" }}
            />
          </div>
        </div>
      )}
    </main>
  )
}
