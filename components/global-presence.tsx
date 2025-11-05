"use client"

import Image from "next/image"

export function GlobalPresence() {
  const regions = [
    { name: "Europe", hours: 24, position: { top: "30%", left: "20%" }, labelPosition: { top: "25%", left: "12%" } },
    {
      name: "Southeast\nAsia",
      hours: 11,
      position: { top: "52%", left: "42%" },
      labelPosition: { top: "48%", left: "32%" },
    },
    {
      name: "North\nAmerica",
      hours: 12,
      position: { top: "35%", right: "25%" },
      labelPosition: { top: "30%", right: "28%" },
    },
    {
      name: "South\nAmerica",
      hours: 12,
      position: { top: "52%", right: "15%" },
      labelPosition: { top: "48%", right: "8%" },
    },
  ]

  return (
    <section className="relative py-20 md:py-32 overflow-hidden" style={{ backgroundColor: "#41059a" }}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Global Presence</h2>
          <p className="text-white text-base md:text-lg leading-relaxed">
            Our team of seasoned designers, engineers, and consultants work collaboratively to transform your vision
            into reality. Based in Auckland, New Zealand, and with factories in both Auckland and Brazil, we are
            equipped to serve clients on a global scale. At Putt Brothers, we believe in building a better future
            together by delivering high-quality, innovative entertainment attractions that inspire joy and drive
            business success.
          </p>
        </div>

        <div className="relative w-full max-w-6xl mx-auto mb-12">
          <Image
            src="/images/image02.png"
            alt="Global Presence Map"
            width={1200}
            height={675}
            className="w-full h-auto rounded-lg"
            priority
          />
        </div>

        {/* Map Container */}
        <div className="relative max-w-6xl mx-auto">{/* World Map SVG */}</div>
      </div>
    </section>
  )
}
