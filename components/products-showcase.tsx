"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import Coverflow from "@/components/coverflow"
import { getMachinesWithFlags } from "@/app/actions/machines_with_flags"

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
    <div>
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
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile === undefined) return

    let isCancelled = false
    const controller = new AbortController()

    const fetchMachines = async () => {
      try {
        setIsLoading(true)
        const machinesData = isMobile
          ? await fetch("/api/products/machines", {
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
          : await getMachinesWithFlags()

        if (!isCancelled && machinesData && Array.isArray(machinesData)) {
          setProducts(machinesData)
        } else if (!isCancelled) {
          setProducts([])
        }
      } catch (err) {
        if (controller.signal.aborted) return

        if (!isCancelled) {
          // Silently handle error - mock data will be used as fallback
          console.log("[v0] Error fetching machines, using mock data")
          setProducts([])
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchMachines()

    return () => {
      isCancelled = true
      controller.abort()
    }
  }, [isMobile])

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: "#41059a" }}>
      <div className="max-w-7xl mx-auto">
        {isMobile === undefined ? null : isMobile ? (
          <>
            <div className="text-center mb-2 px-4">
              <h2 className="text-2xl font-bold mb-4 mt-2.5" style={{ color: "#ffcc00" }}>
                Our Top-Rated Mini Golf Designs
              </h2>
            </div>

            <PaginatedProductsCoverflow
              products={products}
              isLoading={isLoading}
              pageSize={MOBILE_PAGE_SIZE}
              imageVariant="mobile"
              enableAutoplay={false}
              enableLoop={false}
              controlsClassName="mt-2"
            />

            <div className="text-center mt-8 px-4">
              <p className="text-lg text-white/90 leading-relaxed text-pretty">
                Putt Brothers creates dynamic, interactive mini golf courses and unique laser tag arenas that turn
                ordinary spaces into thriving entertainment destinations. Whether you're adding a new attraction or
                reinventing an existing venue, we design, build, and deliver unforgettable experiences that keep guests
                coming back.
              </p>
            </div>

            {products.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Link
                  href="/products"
                  className="rounded-lg px-6 py-3 text-base font-bold transition-all active:scale-95"
                  style={{ backgroundColor: "#ffcc00", color: "black" }}
                >
                  VIEW ALL PRODUCTS
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-16 px-4 lg:px-8">
              <h2 className="text-5xl font-bold mb-6 mt-6" style={{ color: "#ffcc00" }}>
                Our Top-Rated Mini Golf Designs
              </h2>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed text-pretty">
                Putt Brothers creates dynamic, interactive mini golf courses and unique laser tag arenas that turn
                ordinary spaces into thriving entertainment destinations. Whether you're adding a new attraction or
                reinventing an existing venue, we design, build, and deliver unforgettable experiences that keep guests
                coming back.
              </p>
            </div>

            <PaginatedProductsCoverflow
              products={products}
              isLoading={isLoading}
              pageSize={DESKTOP_PAGE_SIZE}
              imageVariant="desktop"
              enableAutoplay={true}
              enableLoop={true}
              controlsClassName="mt-4"
            />

            {products.length > 0 && (
              <div className="mt-10 flex justify-center">
                <Link
                  href="/products"
                  className="px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,204,0,0.6)]"
                  style={{ backgroundColor: "#ffcc00", color: "black" }}
                >
                  VIEW ALL PRODUCTS
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
