"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

const products = [
  {
    id: 1,
    title: "Beer Pong",
    description:
      "It's an oddly familiar feeling lining up your shot — you've been here before but your memory of past experiences seems a little foggy. You decide to rely on muscle memory to get you through, and the perfectly weighted shot sees the ball in the cup in one.",
    image: "/placeholder.svg?height=400&width=700",
  },
  {
    id: 2,
    title: "Falling Cube",
    description:
      "Challenge your coordination with this colorful, fast-paced game that combines nostalgia and competition in every swing.",
    image: "/placeholder.svg?height=400&width=700",
  },
  {
    id: 3,
    title: "Space Shot",
    description: "Aim for the stars in this intergalactic course that tests precision, balance, and fun.",
    image: "/placeholder.svg?height=400&width=700",
  },
]

export function ProductsShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length)
  }

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: "#41059a" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 px-4 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Top-Rated Mini Golf Designs</h2>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed text-pretty">
            Putt Brothers creates dynamic, interactive mini golf courses and unique laser tag arenas that turn ordinary
            spaces into thriving entertainment destinations. Whether you're adding a new attraction or reinventing an
            existing venue, we design, build, and deliver unforgettable experiences that keep guests coming back.
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative mb-12">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {products.map((product, index) => (
                <div key={product.id} className="w-full flex-shrink-0 px-4">
                  <div
                    className={`rounded-2xl overflow-hidden transition-all duration-500 ${
                      index === currentSlide
                        ? "scale-100 shadow-[0_0_40px_rgba(168,85,247,0.6)]"
                        : "scale-95 opacity-50"
                    }`}
                    style={{
                      border: index === currentSlide ? "2px solid rgba(168,85,247,0.8)" : "2px solid transparent",
                    }}
                  >
                    <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 bg-gradient-to-br from-purple-900/40 to-purple-950/40 backdrop-blur-sm">
                      {/* Left Side - Text Content */}
                      <div className="flex flex-col justify-center space-y-6">
                        <h3 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: "#e0e0e0" }}>
                          {product.title}
                        </h3>
                        <p className="text-lg md:text-xl leading-relaxed" style={{ color: "#cccccc" }}>
                          {product.description}
                        </p>
                      </div>

                      {/* Right Side - Product Image */}
                      <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(255,204,0,0.6)]"
            style={{ backgroundColor: "#ffcc00" }}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8 text-black" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(255,204,0,0.6)]"
            style={{ backgroundColor: "#ffcc00" }}
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8 text-black" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-3 mb-8">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-12 bg-yellow-400" : "w-2 bg-white/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* View All Products Button */}
        <div className="flex justify-center">
          <button
            className="px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,204,0,0.6)]"
            style={{ backgroundColor: "#ffcc00", color: "black" }}
          >
            VIEW ALL PRODUCTS
          </button>
        </div>
      </div>
    </section>
  )
}
