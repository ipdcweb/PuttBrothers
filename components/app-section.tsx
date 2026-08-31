"use client"

import { useState } from "react"
import { Facebook, Instagram, Linkedin } from "lucide-react"

export default function AppSection() {
  const [activeTab, setActiveTab] = useState<"app" | "game" | "automation">("app")
  const [isExpanded, setIsExpanded] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  return (
    <section id="app" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance text-[rgba(65,5,154,1)]">
            What's Coming Next
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
            {
              "🚀 At Putt Brothers, we’re always innovating to make every visit even more exciting. \nStay tuned for the next wave of fun, technology, and creativity! ⚡🎮⛳"
            }
          </p>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? "max-h-[3000px] opacity-100 mt-8" : "max-h-0 opacity-0"
            }`}
          ></div>

          <div className="mt-8">
            <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
              Follow us on our social media channels to stay updated with every new feature, design, and innovation
              we&#39;re bringing to life.
            </p>

            <p className="text-lg font-semibold text-foreground mb-6">
              👉 Join the journey, be part of the Putt Brothers community on:
            </p>

            <div className="flex items-center justify-center gap-6 flex-wrap">
              <a
                href="https://www.facebook.com/profile.php?id=61551240330686"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-[#41059a] hover:bg-[#41059a]/90 transition-all duration-300 group"
              >
                <Facebook className="h-6 w-6 text-[#ffcc00] group-hover:scale-110 transition-transform" />
                <span className="text-white font-medium">Facebook</span>
              </a>

              <a
                href="https://www.instagram.com/puttbrothersnz/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-[#41059a] hover:bg-[#41059a]/90 transition-all duration-300 group"
              >
                <Instagram className="h-6 w-6 text-[#ffcc00] group-hover:scale-110 transition-transform" />
                <span className="text-white font-medium">Instagram</span>
              </a>

              <a
                href="https://www.linkedin.com/company/puttbrothers/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-[#41059a] hover:bg-[#41059a]/90 transition-all duration-300 group"
              >
                <Linkedin className="h-6 w-6 text-[#ffcc00] group-hover:scale-110 transition-transform" />
                <span className="text-white font-medium">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { AppSection }
