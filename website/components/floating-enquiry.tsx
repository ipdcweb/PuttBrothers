"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageSquareText } from "lucide-react"

const sectionInvites = [
  { selector: ".pb-scroll-hero", label: "Create your vision" },
  { selector: ".pb-editorial-grid", label: "Let’s create together" },
  { selector: "#experiences", label: "Create your venue" },
  { selector: "#real-play", label: "Bring play to life" },
  { selector: ".pb-turnkey-grid", label: "Let’s build together" },
  { selector: ".pb-journey", label: "Plan your project" },
  { selector: ".pb-opportunity", label: "Let’s grow together" },
  { selector: ".pb-faq-grid", label: "Ask us anything" },
  { selector: ".pb-products-intro", label: "Create your venue" },
  { selector: "#collections", label: "Find your favourites" },
  { selector: "#product-designs", label: "Let’s talk designs" },
  { selector: "#planner-guide", label: "Plan your space" },
  { selector: ".pb-about-hero", label: "Let’s create together" },
  { selector: "#our-story", label: "Start a conversation" },
  { selector: ".pb-about-team", label: "Talk with our team" },
  { selector: ".pb-about-partners", label: "Let’s work together" },
  { selector: ".pb-about-purpose", label: "Create with purpose" },
  { selector: ".pb-about-values", label: "Let’s build together" },
  { selector: ".pb-contact-intro", label: "Tell us your idea" },
  { selector: "#contact", label: "We’d love to hear" },
  { selector: "#worldwide", label: "Contact your team" },
  { selector: ".pb-shell-footer__cta", label: "Start your project" },
] as const

export function FloatingEnquiry({ pathname }: { pathname: string }) {
  const [label, setLabel] = useState<string>("Let’s talk")

  useEffect(() => {
    const sections = sectionInvites.flatMap(({ selector, label }) => {
      const element = document.querySelector<HTMLElement>(selector)
      return element ? [{ element, label }] : []
    })
    let frame = 0
    function update() {
      frame = 0
      const middle = window.innerHeight / 2
      let next: string = "Let’s talk"
      for (const { element, label } of sections) {
        const bounds = element.getBoundingClientRect()
        if (bounds.top <= middle && bounds.bottom > middle) {
          next = label
          break
        }
      }
      setLabel(current => current === next ? current : next)
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const resize = new ResizeObserver(schedule)
    const main = document.querySelector("main")
    if (main) resize.observe(main)
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [pathname])

  return (
    <Link href={pathname === "/contact" ? "#contact" : "/contact#contact"} className="pb-enquiry-tab" aria-label={`${label}. Open the enquiry form`}>
      <span>{label}</span><MessageSquareText size={17} aria-hidden="true" />
    </Link>
  )
}
