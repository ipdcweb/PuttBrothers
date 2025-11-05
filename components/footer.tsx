"use client"

import Image from "next/image"
import { Facebook, Instagram, Linkedin, Home, Package, Info, Mail } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const emailRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Email: sales@puttbrothers.com (reversed and encoded)
    const e = "moc.srehtorbtup@selas".split("").reverse().join("")
    // Phone: +64 27 777 3322 (encoded)
    const p = String.fromCharCode(43, 54, 52, 32, 50, 55, 32, 55, 55, 55, 32, 51, 51, 50, 50)

    if (emailRef.current) {
      emailRef.current.textContent = e
    }
    if (phoneRef.current) {
      phoneRef.current.textContent = p
    }
  }, [])

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Package },
    { name: "About Us", href: "/about", icon: Info },
    { name: "Contact Us", href: "/contact", icon: Mail },
  ]

  return (
    <footer className="bg-foreground text-background py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8 mb-12">
          {/* Brand - Left */}
          <div className="lg:w-1/3">
            <Image
              src="/images/design-mode/Logo%20White.webp"
              alt="PuttBrothers Logo"
              width={180}
              height={50}
              className="h-12 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-background/80 leading-relaxed">
              Building better entertainment experiences together for over 20 years.
            </p>
          </div>

          {/* Quick Links - Center */}
          <div className="lg:w-1/3 lg:text-center">
            <h3 className="font-bold text-lg mb-4 text-[#ffcc00]">Quick Links</h3>
            <ul className="space-y-3 lg:inline-block lg:text-left">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 text-background/80 hover:text-[#ffcc00] transition-colors group"
                    >
                      <Icon className="h-4 w-4 text-[#ffcc00] group-hover:scale-110 transition-transform" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Social - Right */}
          <div className="lg:w-1/3 lg:text-right">
            <h3 className="font-bold text-lg mb-4 text-[#ffcc00]">Social Medias</h3>
            <div className="flex gap-4 lg:justify-end mb-6">
              <a
                href="https://www.facebook.com/profile.php?id=61551240330686"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors group"
              >
                <Facebook className="h-5 w-5 group-hover:text-[#ffcc00] transition-colors" />
              </a>
              <a
                href="https://www.instagram.com/puttbrothersnz/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors group"
              >
                <Instagram className="h-5 w-5 group-hover:text-[#ffcc00] transition-colors" />
              </a>
              <a
                href="https://www.linkedin.com/company/puttbrothers/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors group"
              >
                <Linkedin className="h-5 w-5 group-hover:text-[#ffcc00] transition-colors" />
              </a>
            </div>

            <div className="space-y-2 text-sm text-background/70 select-none lg:text-right">
              <div
                ref={emailRef}
                className="cursor-default"
                style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none" }}
              />
              <div
                ref={phoneRef}
                className="cursor-default"
                style={{ userSelect: "none", WebkitUserSelect: "none", MozUserSelect: "none" }}
              />
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="pt-8 border-t border-background/20 text-center">
          <p className="text-[#ffcc00] text-lg md:text-xl font-semibold italic">
            "More than games, we design happiness."
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-6 text-center">
          <p className="text-background/70">© {currentYear} PuttBrothers. All rights reserved.</p>
        </div>

        {/* Developer Credit */}
        <div className="text-center pt-0">
          <p className="text-background/60 my-0">
            Developed by{" "}
            <a
              href="https://www.ipdc.co.nz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background/60 hover:text-[#ffcc00] transition-colors underline"
            >
              ipdc.co.nz
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
