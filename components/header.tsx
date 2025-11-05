"use client"

import { useState, useEffect } from "react"
import { Menu, X, Home, Package, Info, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Package },
    { name: "About Us", href: "/about", icon: Info },
    { name: "Contact Us", href: "/contact", icon: Mail },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-primary/50 backdrop-blur-md leading-[1.00rem] font-normal tracking-wide text-lg transition-all duration-300 ${
        isScrolled ? "py-2" : "py-0"
      }`}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? "h-16" : "h-20"}`}
        >
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/design-mode/Logo%20White.webp"
              alt="PuttBrothers Logo"
              width={180}
              height={50}
              className={`w-auto transition-all duration-300 ${isScrolled ? "h-10" : "h-12"}`}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-base">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 text-white hover:text-[#ffcc00] transition-colors font-medium pb-1 border-b-2 ${
                    isActive(item.href) ? "border-[#ffcc00]" : "border-transparent"
                  }`}
                >
                  <Icon className="h-5 w-5 text-[#ffcc00]" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 text-white hover:text-[#ffcc00] transition-colors font-medium py-2 ${
                      isActive(item.href) ? "text-[#ffcc00] border-l-4 border-[#ffcc00] pl-4" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 text-[#ffcc00]" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
