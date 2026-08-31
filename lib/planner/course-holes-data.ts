/**
 * Course Holes Data Source
 * This file contains the machine catalog data (Course Holes) and images.
 * It's designed to be easily replaceable with AWS/database integration.
 * 
 * To integrate with your AWS server:
 * 1. Create an API endpoint in your backend that returns this same data structure
 * 2. Create a hook in hooks/useCourseHoles.ts that fetches from your API
 * 3. Import the hook instead of directly using this file
 */

import type { MachineCatalogItem } from "./planner-types"

export const COURSE_HOLES_DATA: MachineCatalogItem[] = [
  {
    id: "pb-classic-9",
    name: "Classic 9-Hole",
    category: "Standard",
    width: 3.6,
    depth: 1.2,
    clearance: 0.5,
    description: "Our flagship 9-hole miniature golf course module.",
    color: "#6366f1",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mobile-wx8TgWK6S2wcezkyRmnVhFnVwnVhj8.png",
  },
  {
    id: "pb-classic-18",
    name: "Classic 18-Hole",
    category: "Standard",
    width: 6.0,
    depth: 1.5,
    clearance: 0.5,
    description: "Full 18-hole experience in a compact footprint.",
    color: "#4f46e5",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mobile-BjqculCFQgypMrWH89P3qIoq1WxZmD.png",
  },
  {
    id: "pb-mini-6",
    name: "Mini 6-Hole",
    category: "Compact",
    width: 2.4,
    depth: 1.0,
    clearance: 0.5,
    description: "Perfect for smaller spaces and quick play.",
    color: "#8b5cf6",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mobile-wLb0HOTyJobtz4sm5oHQSpTS63zlA9.png",
  },
  {
    id: "pb-pro-9",
    name: "Pro 9-Hole",
    category: "Premium",
    width: 4.2,
    depth: 1.4,
    clearance: 0.5,
    description: "Advanced course with challenging obstacles.",
    color: "#7c3aed",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mobile-1pgEWgPRCU1TTuxsVO9IHTHSM3DHaE.png",
  },
  {
    id: "pb-kidz-6",
    name: "Kidz 6-Hole",
    category: "Family",
    width: 2.0,
    depth: 0.9,
    clearance: 0.5,
    description: "Kid-friendly design with fun themes.",
    color: "#a855f7",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mobile-JsO8wVzstXU6htbHoQzWjDozLCLsuy.png",
  },
  {
    id: "pb-glow-9",
    name: "Glow 9-Hole",
    category: "Premium",
    width: 3.8,
    depth: 1.3,
    clearance: 0.5,
    description: "UV-reactive glow-in-the-dark course.",
    color: "#5b21b6",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mobile-znSmcQTlQ9keHAz4A97fwe0oVmmnRz.png",
  },
  {
    id: "pb-party-12",
    name: "Party 12-Hole",
    category: "Standard",
    width: 4.8,
    depth: 1.4,
    clearance: 0.5,
    description: "Party-ready module with scoring system.",
    color: "#9333ea",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mobile-Zb4sFiSapleMYtPL2JFXn0zhxw3Nka.png",
  },
  {
    id: "pb-arcade-combo",
    name: "Arcade Combo",
    category: "Specialty",
    width: 2.5,
    depth: 1.8,
    clearance: 0.5,
    description: "Combines putting with arcade-style scoring.",
    color: "#6d28d9",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mobile-wx8TgWK6S2wcezkyRmnVhFnVwnVhj8.png",
  },
]

export const COURSE_HOLES_CATEGORIES = Array.from(
  new Set(COURSE_HOLES_DATA.map((m) => m.category))
)
