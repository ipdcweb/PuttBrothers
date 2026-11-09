"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

type Partner = {
  name: string
  href: string
  description: string
  logo: { src: string; width: number; height: number }
}

type Hint = { index: number; x: number; y: number; source: "pointer" | "keyboard" }

function WebsiteTooltip({ id, name, x, y }: { id: string; name: string; x: number; y: number }) {
  const tooltip = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const node = tooltip.current
    if (!node) return
    const box = node.getBoundingClientRect()
    const center = Math.max(box.width / 2 + 12, Math.min(x, window.innerWidth - box.width / 2 - 12))
    node.style.left = `${center}px`
    node.style.top = `${Math.max(box.height + 12, y - 16)}px`
  }, [x, y])

  return createPortal(
    <span ref={tooltip} id={id} role="tooltip" className="pb-partner-tooltip" style={{ left: x, top: y - 16 }}>
      Visit {name} website
      <ArrowUpRight size={14} aria-hidden="true" />
    </span>,
    document.body,
  )
}

export function PartnerCards({ partners }: { partners: Partner[] }) {
  const [hint, setHint] = useState<Hint | null>(null)
  const tooltipId = useId()
  const visible = hint !== null

  useEffect(() => {
    if (!visible) return
    const close = () => setHint(null)
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close() }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
    }
  }, [visible])

  function showPointer(event: PointerEvent<HTMLAnchorElement>, index: number) {
    if (event.pointerType !== "mouse") return
    setHint({ index, x: event.clientX, y: event.clientY, source: "pointer" })
  }

  return (
    <div className="pb-about-partners__grid">
      {partners.map((partner, index) => (
        <article key={partner.name}>
          <a
            className="pb-about-partners__link"
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${partner.name}, visit website (opens in a new tab)`}
            aria-describedby={hint?.index === index ? tooltipId : undefined}
            onPointerEnter={(event) => showPointer(event, index)}
            onPointerMove={(event) => { if (hint?.source === "pointer") showPointer(event, index) }}
            onPointerLeave={() => setHint(null)}
            onPointerDown={() => setHint(null)}
            onFocus={(event) => {
              if (!event.currentTarget.matches(":focus-visible")) return
              const box = event.currentTarget.getBoundingClientRect()
              setHint({ index, x: box.left + box.width / 2, y: box.top, source: "keyboard" })
            }}
            onBlur={() => setHint(null)}
          >
            <span className="pb-about-partners__number" aria-hidden="true">0{index + 1}<ArrowUpRight size={20} /></span>
            <h3>{partner.name}</h3>
            <p>{partner.description}</p>
            <span className="pb-about-partners__logo" aria-hidden="true">
              <span className="pb-about-partners__logo-surface">
                <Image src={partner.logo.src} alt="" width={partner.logo.width} height={partner.logo.height} sizes="(max-width: 599px) 230px, 20vw" />
              </span>
            </span>
          </a>
        </article>
      ))}
      {hint && <WebsiteTooltip id={tooltipId} name={partners[hint.index].name} x={hint.x} y={hint.y} />}
    </div>
  )
}
