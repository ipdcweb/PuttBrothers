"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, ExternalLink, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { iaapaExpo } from "@/lib/scroll-hero"

export function IaapaExpoDetails() {
  return (
    <dl className="pb-expo-details">
      <div><dt>When</dt><dd><time dateTime="2026-11-17">{iaapaExpo.dates}</time></dd></div>
      <div><dt>Where</dt><dd><strong>Booth {iaapaExpo.booth}</strong><span>{iaapaExpo.location} · {iaapaExpo.building}</span></dd></div>
    </dl>
  )
}

export function IaapaExpoMapLink() {
  return (
    <a className="pb-expo-map-link" href={iaapaExpo.mapHref} target="_blank" rel="noopener noreferrer">
      <span>View our booth on the map<small>IAAPA floor plan · opens in a new tab</small></span>
      <ExternalLink size={17} aria-hidden="true" />
    </a>
  )
}

export function IaapaExpoInvite() {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="pb-shell-header__expo" aria-label="Meet us at IAAPA Expo 2026!">
          <span>Meet us at</span><strong>IAAPA Expo 2026!</strong>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={12} collisionPadding={16} className="pb-v2 pb-expo-popover" aria-labelledby="iaapa-expo-title">
        <button type="button" className="pb-expo-popover__close" aria-label="Close IAAPA details" onClick={() => setOpen(false)}><X size={20} aria-hidden="true" /></button>
        <p className="pb-eyebrow">Meet the team</p>
        <h2 id="iaapa-expo-title">{iaapaExpo.name}</h2>
        <p>Visit us to explore the experience and talk with the team about what you want to create.</p>
        <IaapaExpoDetails />
        <div className="pb-expo-actions">
          <Link href={iaapaExpo.href} className="pb-button pb-button--dark" onClick={() => setOpen(false)}>{iaapaExpo.cta}<ArrowUpRight size={18} aria-hidden="true" /></Link>
          <IaapaExpoMapLink />
        </div>
      </PopoverContent>
    </Popover>
  )
}
