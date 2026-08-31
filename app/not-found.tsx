"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

function HomeButton() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold transition-all duration-200"
      style={{
        backgroundColor: "#41059a",
        color: "white",
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLAnchorElement
        target.style.backgroundColor = "#ffcc00"
        target.style.color = "#41059a"
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLAnchorElement
        target.style.backgroundColor = "#41059a"
        target.style.color = "white"
      }}
    >
      Back to Home
      <ArrowRight className="w-5 h-5" />
    </Link>
  )
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0a0a14" }}>
      {/* Header Navigation */}
      <header className="border-b" style={{ borderColor: "#1a1a2e" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold" style={{ color: "#ffcc00" }}>
              ⛳
            </div>
            <span className="font-bold text-white">Putt Brothers</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/" className="text-gray-400 hover:text-white transition">
              Home
            </Link>
            <Link href="/#products" className="text-gray-400 hover:text-white transition">
              Products
            </Link>
            <Link href="/#about" className="text-gray-400 hover:text-white transition">
              About Us
            </Link>
            <Link href="/#contact" className="text-gray-400 hover:text-white transition">
              Contact Us
            </Link>
          </nav>
        </div>
      </header>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-2xl">
          {/* Error Code */}
          <div className="mb-8">
            <h1 className="text-9xl md:text-[120px] font-bold" style={{ color: "#41059a" }}>
              404
            </h1>
            <p className="text-xl md:text-2xl mt-4 font-semibold" style={{ color: "#ffcc00" }}>
              Oops! Wrong Hole!
            </p>
          </div>

          {/* Animated Golfer */}
          <div className="my-12">
            <img
              src="/images/golfer-404.gif"
              alt="Golfer animation"
              className="w-48 h-48 md:w-64 md:h-64 mx-auto"
            />
          </div>

          {/* Fun Message */}
          <p className="text-lg md:text-xl text-gray-300 mb-4">
            Even the best golfers miss the fairway sometimes! It looks like you've hit the ball a bit too far off course.
          </p>
          <p className="text-gray-400 mb-8">
            The page you're looking for doesn't exist, but don't worry – let's get you back in the game!
          </p>

          {/* Back to Home Button */}
          <HomeButton />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center" style={{ borderColor: "#1a1a2e" }}>
        <p className="text-gray-500 text-sm">
          © 2026 Putt Brothers. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
