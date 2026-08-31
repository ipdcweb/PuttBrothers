"use client"

import { useEffect } from "react"

type MobilePlannerWarningDialogProps = {
  open: boolean
  onClose: () => void
}

export function MobilePlannerWarningDialog({ open, onClose }: MobilePlannerWarningDialogProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Desktop required message"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 mx-4 flex w-full max-w-md flex-col space-y-6 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="space-y-2 text-center">
          <div className="mb-4 text-4xl">🖥️</div>
          <h2 className="text-2xl font-bold text-[#41059a]">Desktop Power Required!</h2>
        </div>

        <div className="space-y-4 text-center text-gray-700">
          <p className="text-lg font-medium">
            We love the enthusiasm, but this mini golf layout creator is built for the big screen experience!
          </p>
          <p className="text-sm leading-relaxed">
            Our layout planner is packed with drag-and-drop features, precise positioning, and interactive elements that
            need a desktop or laptop to shine. Think of it as the difference between playing mini golf on a full course
            versus on a tabletop—better on a bigger space!
          </p>
          <p className="pt-2 text-sm text-gray-600">
            📱 <span className="font-semibold">Mobile & Tablets:</span> Bring this link back when you're at a computer
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-lg px-4 py-3 font-semibold transition-all duration-300"
          style={{
            backgroundColor: "#41059a",
            color: "white",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = "#ffcc00"
            event.currentTarget.style.color = "#41059a"
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = "#41059a"
            event.currentTarget.style.color = "white"
          }}
        >
          Got it, I'll use my computer!
        </button>
      </div>
    </div>
  )
}
