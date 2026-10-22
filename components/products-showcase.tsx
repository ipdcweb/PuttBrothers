"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"
import Coverflow from "@/components/coverflow"
import { FALLBACK_MACHINES, isValidCatalog, type CatalogMachine } from "@/lib/products-catalog"

type ProductsShowcaseProps = {
  heading?: string
  description?: string
  ctaHref?: string
  ctaLabel?: string
}

const defaultDescription = "Putt Brothers creates dynamic, interactive mini golf courses and unique laser tag arenas that turn ordinary spaces into thriving entertainment destinations. Whether you're adding a new attraction or reinventing an existing venue, we design, build, and deliver unforgettable experiences that keep guests coming back."

export function ProductsShowcase({
  heading = "Our Top-Rated Mini Golf Designs",
  description = defaultDescription,
  ctaHref = "/products",
  ctaLabel = "VIEW ALL PRODUCTS",
}: ProductsShowcaseProps = {}) {
  // Render real designs immediately; refresh the complete catalogue in the background.
  const [products, setProducts] = useState<CatalogMachine[]>(FALLBACK_MACHINES)
  const isMobile = useIsMobile()

  useEffect(() => {
    let isCancelled = false
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const fetchMachines = async () => {
      try {
        const machinesData = await fetch("/api/products/machines", {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        }).then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch machines")
          }

          return response.json()
        })

        if (!isCancelled && isValidCatalog(machinesData)) {
          setProducts(machinesData)
        }
      } catch {
        // The first-view catalogue remains usable on a timeout or network failure.
      } finally {
        clearTimeout(timeoutId)
      }
    }

    fetchMachines()

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: "#41059a" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-2 px-4 text-center md:mb-16 lg:px-8">
          <h2 className="mb-4 mt-2.5 text-2xl font-bold md:mb-6 md:mt-6 md:text-5xl" style={{ color: "#ffcc00" }}>
            {heading}
          </h2>
          <p className="hidden text-lg leading-relaxed text-white/90 text-pretty md:block md:text-xl">
            {description}
          </p>
        </div>

        <div className="min-h-[530px] md:min-h-[630px]">
          <Coverflow
            products={products}
            enableAutoplay={isMobile === false}
            controlsClassName={isMobile ? "mt-2" : "mt-4"}
          />
        </div>

        <p className="mt-8 px-4 text-center text-lg leading-relaxed text-white/90 text-pretty md:hidden">
          {description}
        </p>

        {products.length > 0 && (
          <div className="mt-8 flex justify-center md:mt-10">
            <Link
              href={ctaHref}
              className="rounded-lg px-6 py-3 text-base font-bold transition-all active:scale-95 md:rounded-full md:px-10 md:py-4 md:text-lg md:hover:scale-105 md:hover:shadow-[0_0_30px_rgba(255,204,0,0.6)]"
              style={{ backgroundColor: "#ffcc00", color: "black" }}
            >
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
