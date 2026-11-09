"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IaapaExpoInvite } from "@/components/iaapa-expo"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
]

function HeaderNavigation({ pathname }: { pathname: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!mobileMenuOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [mobileMenuOpen])

  useEffect(() => {
    const updateShade = () => {
      headerRef.current?.style.setProperty("--header-shade", String(Math.min(1, Math.max(0, window.scrollY / 100))))
    }
    updateShade()
    window.addEventListener("scroll", updateShade, { passive: true })
    return () => window.removeEventListener("scroll", updateShade)
  }, [])

  return (
    <header ref={headerRef} className="pb-shell-header pb-v2" data-menu-open={mobileMenuOpen}>
      <a href="#main-content" className="pb-shell-header__skip">Skip to content</a>
      <div className="pb-container pb-shell-header__bar">
        <div className="pb-shell-header__brand">
          <Link href="/" aria-label="Putt Brothers home" className="pb-shell-header__logo" onClick={() => setMobileMenuOpen(false)}>
            <Image src="/images/design-mode/Logo-White.webp" alt="Putt Brothers" width={216} height={60} priority />
          </Link>
        </div>
        <nav className="pb-shell-header__desktop" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.name}</Link>
          ))}
        </nav>
        <IaapaExpoInvite />
        <button
          ref={menuButtonRef}
          type="button"
          className="pb-shell-header__toggle"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="pb-mobile-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </div>
      <nav id="pb-mobile-navigation" className="pb-shell-header__mobile" aria-label="Mobile navigation" hidden={!mobileMenuOpen}>
        <div className="pb-container">
          {navItems.map((item, index) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setMobileMenuOpen(false)}>
              <span className="pb-shell-header__index" aria-hidden="true">0{index + 1}</span>{item.name}<ArrowUpRight size={22} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export function Header() {
  const pathname = usePathname() ?? "/"
  // Reset the disclosure on every route change, including browser back/forward.
  return <HeaderNavigation key={pathname} pathname={pathname} />
}
