'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Pentagon, MousePointer2, Square, ShieldAlert, Type, Hand } from 'lucide-react'

interface HelpPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  videoUrl?: string
  tools?: Array<{
    name: string
    icon: React.ReactNode
    description: string
    borderColor: string
  }>
  tips?: string[]
}

export function HelpPanel({
  isOpen,
  onClose,
  title,
  description,
  tools = [],
  tips = []
}: HelpPanelProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (isOpen && !isReady) {
      const timer = requestAnimationFrame(() => {
        setIsReady(true)
      })
      return () => cancelAnimationFrame(timer)
    }
    if (!isOpen) {
      setIsReady(false)
    }
  }, [isOpen, isReady])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsReady(false)
      setIsClosing(false)
      onClose()
    }, 300)
  }

  if (!isOpen && !isClosing) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        style={{
          opacity: isClosing ? 0 : 1,
          transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: isClosing ? 'none' : 'auto'
        }}
      />

      {/* Sliding Panel */}
      <div
        className="relative ml-0 w-full max-w-4xl bg-card border-r border-border flex flex-col"
        style={{
          scrollbarColor: '#41059a #FFC107',
          scrollbarWidth: 'thin',
          transform: isReady && !isClosing ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform'
        }}
      >
        {/* Fixed Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border"
          style={{ backgroundColor: '#FFC107' }}
        >
          <h1 className="text-2xl font-bold" style={{ color: '#41059a' }}>
            {title}
          </h1>
          <button
            onClick={handleClose}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium hover:opacity-80"
            style={{ color: '#41059a' }}
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Hide
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{
            scrollbarColor: '#41059a #FFC107',
            scrollbarWidth: 'thin'
          }}
        >
          {/* Description */}
          <div className="mb-8">
            <p className="text-muted-foreground">{description}</p>
          </div>

          {/* Tools Description */}
          {tools.length > 0 && (
            <div className="space-y-6">
              {tools.map((tool, index) => (
                <div key={index} className="border-l-4 pl-4" style={{ borderColor: tool.borderColor }}>
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    {tool.icon}
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {tips.length > 0 && (
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 8px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #41059a, #FFC107);
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #41059a, #FFD700);
        }
      `}</style>
    </div>
  )
}
