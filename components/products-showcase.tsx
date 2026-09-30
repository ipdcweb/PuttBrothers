"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import Coverflow from "@/components/coverflow"
import { FALLBACK_MACHINES, isValidCatalog, type CatalogMachine } from "@/lib/products-catalog"

const MOBILE_PAGE_SIZE = 8
const DESKTOP_PAGE_SIZE = 12

function PaginatedProductsCoverflow({
  products,
  isLoading,
  pageSize,
  imageVariant,
  enableAutoplay,
  enableLoop,
  controlsClassName = "mt-3",
}: {
  products: any[]
  isLoading: boolean
  pageSize: number
  imageVariant: "desktop" | "mobile"
  enableAutoplay: boolean
  enableLoop: boolean
  controlsClassName?: string
}) {
  const [pageIndex, setPageIndex] = useState(0)
  const [initialSlide, setInitialSlide] = useState(0)
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize))
  const start = pageIndex * pageSize
  const visibleProducts = products.slice(start, start + pageSize)

  useEffect(() => {
    setPageIndex(0)
    setInitialSlide(0)
  }, [pageSize, products.length])

  const goToPreviousPage = () => {
    if (pageIndex <= 0) return

    const nextPage = pageIndex - 1
    const previousPageSize = products.slice(nextPage * pageSize, nextPage * pageSize + pageSize).length

    setInitialSlide(Math.max(0, previousPageSize - 1))
    setPageIndex(nextPage)
  }

  const goToNextPage = () => {
    if (pageIndex >= totalPages - 1) return

    setInitialSlide(0)
    setPageIndex(pageIndex + 1)
  }

  return (
    <div className="min-h-[530px] md:min-h-[630px]" aria-busy={isLoading}>
      <Coverflow
        key={`${imageVariant}-coverflow-${pageIndex}`}
        products={visibleProducts}
        isLoading={isLoading}
        imageVariant={imageVariant}
        enableAutoplay={enableAutoplay}
        enableLoop={enableLoop}
        initialSlide={initialSlide}
        onReachBeginning={pageIndex > 0 ? goToPreviousPage : undefined}
        onReachEnd={pageIndex < totalPages - 1 ? goToNextPage : undefined}
      />

      {!isLoading && products.length > pageSize && (
        <div className={`${controlsClassName} flex items-center justify-center gap-4`}>
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={pageIndex === 0}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffcc00] text-[#41059a] shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous product group"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <span className="min-w-24 text-center text-sm font-semibold text-white">
            {start + 1}-{Math.min(start + pageSize, products.length)} / {products.length}
          </span>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={pageIndex >= totalPages - 1}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffcc00] text-[#41059a] shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next product group"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  )
}

export function ProductsShowcase() {
  // Render real designs immediately; refresh the complete catalogue in the background.
  const [products, setProducts] = useState<CatalogMachine[]>(FALLBACK_MACHINES)
  const isMobile = useIsMobile() === true

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
            Our Top-Rated Mini Golf Designs
          </h2>
          <p className="hidden text-lg leading-relaxed text-white/90 text-pretty md:block md:text-xl">
            Putt Brothers creates dynamic, interactive mini golf courses and unique laser tag arenas that turn ordinary
            spaces into thriving entertainment destinations. Whether you're adding a new attraction or reinventing an
            existing venue, we design, build, and deliver unforgettable experiences that keep guests coming back.
          </p>
        </div>

        <PaginatedProductsCoverflow
          products={products}
          isLoading={false}
          pageSize={isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE}
          imageVariant={isMobile ? "mobile" : "desktop"}
          enableAutoplay={!isMobile}
          enableLoop={!isMobile}
          controlsClassName={isMobile ? "mt-2" : "mt-4"}
        />

        <p className="mt-8 px-4 text-center text-lg leading-relaxed text-white/90 text-pretty md:hidden">
          Putt Brothers creates dynamic, interactive mini golf courses and unique laser tag arenas that turn ordinary
          spaces into thriving entertainment destinations. Whether you're adding a new attraction or reinventing an
          existing venue, we design, build, and deliver unforgettable experiences that keep guests coming back.
        </p>

        {products.length > 0 && (
          <div className="mt-8 flex justify-center md:mt-10">
            <Link
              href="/products"
              className="rounded-lg px-6 py-3 text-base font-bold transition-all active:scale-95 md:rounded-full md:px-10 md:py-4 md:text-lg md:hover:scale-105 md:hover:shadow-[0_0_30px_rgba(255,204,0,0.6)]"
              style={{ backgroundColor: "#ffcc00", color: "black" }}
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
