"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ResetSuccessBannerProps {
  onDismiss: () => void
}

export function ResetSuccessBanner({ onDismiss }: ResetSuccessBannerProps) {
  const [countdown, setCountdown] = useState(20)
  const [isAutoClosing, setIsAutoClosing] = useState(false)

  useEffect(() => {
    if (countdown <= 0) {
      setIsAutoClosing(true)
      const timer = setTimeout(onDismiss, 500)
      return () => clearTimeout(timer)
    }

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [countdown, onDismiss])

  const progressPercentage = (countdown / 20) * 100

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4 transition-opacity duration-500 ${isAutoClosing ? "opacity-0" : "opacity-100"}`}>
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center animate-in fade-in zoom-in-95 duration-300">
        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" strokeWidth={3} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-3">Project Reset Successfully!</h2>

        {/* Motivational message */}
        <p className="text-foreground/80 mb-2 text-sm leading-relaxed">
          Your project has been cleared and the canvas is fresh. You're now ready to build your dream golf course management solution.
        </p>

        <p className="text-sm font-semibold text-primary mb-6">
          Every great success starts with a single hole. Let's create something extraordinary together your thriving business is just a few strokes away!
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Call to action */}
        <p className="text-xs text-foreground/60 mb-4">
          You're all set to begin designing your next masterpiece.
        </p>

        {/* Button with animated progress bar */}
        <div className="relative">
          <Button
            onClick={onDismiss}
            size="lg"
            className="w-full relative overflow-hidden"
          >
            {/* Animated progress bar background */}
            <div
              className="absolute inset-0 bg-primary/20 transition-all duration-100"
              style={{ width: `${100 - progressPercentage}%` }}
            />
            {/* Button text with countdown */}
            <span className="relative z-10">
              Start Creating {countdown > 0 ? `(${countdown}s)` : ""}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
