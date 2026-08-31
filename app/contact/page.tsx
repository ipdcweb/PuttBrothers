"use client"

import { Contact } from "@/components/contact"
import { InteractiveWorldMap } from "@/components/interactive-world-map"
import { Globe } from "lucide-react"
import { useEffect, useRef } from "react"

export default function ContactPage() {
  const emailRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    // Email: sales@puttbrothers.com (reversed and encoded)
    const e = "moc.srehtorbtup@selas".split("").reverse().join("")
    if (emailRef.current) {
      emailRef.current.textContent = e
      emailRef.current.href = `mailto:${e}`
    }
  }, [])

  return (
    <main className="min-h-screen">
      {/* Hero Section */}

      <section className="relative py-20 px-4 bg-[#41059a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="md:text-5xl font-bold text-[#ffcc00] text-center flex items-center justify-center gap-4 mb-5 mt-10 text-xl">
            <Globe className="md:w-12 md:h-12 text-[#ffcc00] w-8 h-8" />
            We are all over the world
          </h2>

          

          <InteractiveWorldMap />
        </div>
      </section>

      {/* Contact Form Section */}
      <Contact />
    </main>
  )
}
