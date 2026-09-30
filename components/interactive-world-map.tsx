"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Phone, Mail } from "lucide-react"

interface Region {
  name: string
  phone?: string // Made phone optional since not all regions have it
  email?: string
  position: { top: string; left: string }
}

const regions: Region[] = [
  {
    name: "Europe",
    email: "europe@puttbrothers.com",
    position: { top: "30%", left: "25%" },
  },
  {
    name: "Asia",
    email: "sales@puttbrothers.com",
    position: { top: "38%", left: "50%" },
  },
  {
    name: "Africa",
    email: "sales@puttbrothers.com",
    position: { top: "52%", left: "23%" },
  },
  {
    name: "North America",
    phone: "+1 (469) 920-9894",
    email: "northamerica@puttbrothers.com",
    position: { top: "35%", left: "72%" },
  },
  {
    name: "South America",
    email: "sales@puttbrothers.com",
    position: { top: "62%", left: "78%" },
  },
  {
    name: "Oceania",
    email: "sales@puttbrothers.com",
    position: { top: "68%", left: "58%" },
  },
]

export function InteractiveWorldMap() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [clickedRegion, setClickedRegion] = useState<string | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleRegionClick = (regionName: string) => {
    setClickedRegion(clickedRegion === regionName ? null : regionName)
  }

  const getRegionData = (regionName: string) => {
    return regions.find((r) => r.name === regionName)
  }

  const getMobileName = (name: string) => {
    if (name === "North America") return "North"
    if (name === "South America") return "South"
    return name
  }

  const handleMouseEnterRegion = (regionName: string) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    setHoveredRegion(regionName)
  }

  const handleMouseLeaveRegion = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
    }
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredRegion(null)
    }, 2000)
  }

  const handleMouseEnterTooltip = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }

  return (
    <div className="relative">
      <div className="relative w-full max-w-5xl mx-auto">
        <Image
          src="/images/Worldwide01.png"
          alt="We are all over the world"
          width={1200}
          height={600}
          className="w-full h-auto"
          priority
        />

        {/* Interactive Region Labels */}
        {regions.map((region) => {
          const showDesktopTooltip = hoveredRegion === region.name

          return (
            <div
              key={region.name}
              className="absolute"
              style={{
                top: region.position.top,
                left: region.position.left,
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Region Label Button */}
              <button
                className="relative flex items-center gap-2 text-white font-bold text-sm md:text-2xl cursor-pointer hover:text-[#ffcc00] transition-all duration-300 hover:scale-110 active:scale-95 touch-manipulation"
                onMouseEnter={() => handleMouseEnterRegion(region.name)}
                onMouseLeave={handleMouseLeaveRegion}
                onClick={() => handleRegionClick(region.name)}
                aria-label={`Contact ${region.name}`}
              >
                <Phone className="w-3 h-3 md:w-5 md:h-5" />
                <span className="hidden md:block">{region.name}</span>
                <span className="block md:hidden text-sm">{getMobileName(region.name)}</span>
              </button>

              {/* Desktop Tooltip - positioned near the region */}
              {showDesktopTooltip && (
                <div
                  className="hidden md:block absolute z-[9999] top-full left-1/2 transform -translate-x-1/2 mt-2 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseEnter={handleMouseEnterTooltip}
                  onMouseLeave={handleMouseLeaveRegion}
                >
                  <div className="bg-[#ffcc00] text-[#41059a] px-4 py-3 rounded-lg shadow-lg whitespace-nowrap font-bold text-base">
                    {region.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{region.phone}</span>
                      </div>
                    )}
                    {region.email && (
                      <div className={`flex items-center gap-2 ${region.phone ? "mt-2" : ""}`}>
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${region.email}`}
                          className="hover:underline hover:text-[#6b21a8] transition-colors cursor-pointer"
                        >
                          {region.email}
                        </a>
                      </div>
                    )}
                  </div>
                  {/* Arrow */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-[#ffcc00]" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Tooltip - centered below map */}
      {clickedRegion && (
        <div className="md:hidden w-full flex flex-col items-center mt-4 gap-2 px-0">
          <div className="text-white font-bold text-lg">{clickedRegion}</div>
          <div className="bg-[#ffcc00] text-[#41059a] py-3 rounded-lg shadow-lg font-bold text-sm w-full max-w-md animate-in fade-in slide-in-from-top-2 duration-200 px-4">
            {getRegionData(clickedRegion)?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{getRegionData(clickedRegion)?.phone}</span>
              </div>
            )}
            {getRegionData(clickedRegion)?.email && (
              <div className={`flex items-center gap-2 ${getRegionData(clickedRegion)?.phone ? "mt-2" : ""}`}>
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a
                  href={`mailto:${getRegionData(clickedRegion)?.email}`}
                  className="hover:underline hover:text-[#6b21a8] transition-colors cursor-pointer break-all"
                >
                  {getRegionData(clickedRegion)?.email}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
