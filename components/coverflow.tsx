"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { product3DPath, productImagePath } from "@/lib/product-media"
import type { CatalogMachine } from "@/lib/products-catalog"

import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from "swiper"
import { A11y, EffectCoverflow, Pagination, Autoplay } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/effect-coverflow"
import "./coverflow.css"

type CoverflowProps = {
  products: CatalogMachine[]
  isLoading?: boolean
  enableAutoplay?: boolean
  controlsClassName?: string
}

const carouselImagePath = (folder: string, variant: "mobile-300" | "desktop-720") =>
  `/images/products/carousel-v1/${encodeURIComponent(folder)}/${variant}.webp`

const Coverflow = ({
  products,
  isLoading = false,
  enableAutoplay = true,
  controlsClassName = "mt-4",
}: CoverflowProps) => {
  const [modal3D, setModal3D] = useState<string | false>(false)
  const [selectedProduct, setSelectedProduct] = useState<CatalogMachine | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    const swiper = swiperRef.current
    if (!swiper || swiper.destroyed || !swiper.autoplay) return
    if (enableAutoplay && !selectedProduct) {
      if (!swiper.autoplay.running) swiper.autoplay.start()
    } else {
      swiper.autoplay.stop()
    }
  }, [enableAutoplay, isReady, selectedProduct])

  const navigate = (direction: "previous" | "next") => {
    const swiper = swiperRef.current
    if (!swiper || swiper.destroyed) return
    swiper.autoplay?.stop()
    if (direction === "previous") swiper.slidePrev()
    else swiper.slideNext()
  }

  return (
    <>
      {isLoading ? (
        <div className="coverflow-loading" role="status" aria-label="Loading products">
          <Image src="/loader.svg" alt="" width={96} height={96} priority className="loader" />
        </div>
      ) : !products || products.length === 0 ? (
        <p className="text-center text-white font-medium">No products found.</p>
      ) : (
        <>
          <div
            className="section_coverflow_swiper"
            onMouseEnter={() => enableAutoplay && swiperRef.current?.autoplay?.stop()}
            onMouseLeave={() => enableAutoplay && !selectedProduct && swiperRef.current?.autoplay?.start()}
          >
            <Swiper
              className="swiper-container"
              modules={[A11y, EffectCoverflow, Pagination, Autoplay]}
              centeredSlides={true}
              loop={false}
              rewind={true}
              effect="coverflow"
              speed={500}
              slideToClickedSlide={true}
              spaceBetween={0}
              coverflowEffect={{
                rotate: 10,
                slideShadows: true,
                scale: 1,
                stretch: 280,
                depth: 280,
                modifier: 1,
              }}
              autoplay={{ enabled: enableAutoplay, delay: 3000, disableOnInteraction: false }}
              slidesPerView="auto"
              pagination={{ clickable: true, dynamicBullets: true, dynamicMainBullets: 3 }}
              lazyPreloadPrevNext={1}
              onSwiper={(swiper) => {
                swiperRef.current = swiper
                setActiveIndex(swiper.realIndex)
                setIsReady(true)
              }}
              onRealIndexChange={(swiper) => {
                setActiveIndex(swiper.realIndex)
              }}
            >
              {products &&
                products.map((product, index) => (
                  <SwiperSlide
                    key={`${product.FolderName || product.Machine || "product"}-${index}`}
                    className="swiper-slide"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <picture>
                      <source
                        media="(max-width: 767px)"
                        type="image/webp"
                        srcSet={carouselImagePath(product.FolderName, "mobile-300")}
                      />
                      <Image
                        src={carouselImagePath(product.FolderName, "desktop-720")}
                        alt={product.Machine}
                        width={720}
                        height={422}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    </picture>
                    <div className="coverflow_description">
                      <h6>{product.Machine}</h6>
                      <p>{product.Advertising}</p>
                    </div>
                    {product.has3D && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setModal3D(product3DPath(product.FolderName))
                          setSelectedProduct(product)
                        }}
                        className="modal-3d-button"
                      >
                        <Image src={"/3d-cube.webp"} alt="Open 3D" width={64} height={64} priority />
                      </button>
                    )}
                  </SwiperSlide>
                ))}
            </Swiper>
            {products.length > 1 && (
              <div className={`${controlsClassName} flex items-center justify-center gap-4`}>
                <button
                  type="button"
                  onClick={() => navigate("previous")}
                  disabled={!isReady}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffcc00] text-[#41059a] shadow-lg transition-all active:scale-95 disabled:opacity-40"
                  aria-label="Previous product"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span className="min-w-24 text-center text-sm font-semibold text-white" aria-live={enableAutoplay ? "off" : "polite"} aria-atomic="true">
                  {Math.min(activeIndex + 1, products.length)} / {products.length}
                </span>
                <button
                  type="button"
                  onClick={() => navigate("next")}
                  disabled={!isReady}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ffcc00] text-[#41059a] shadow-lg transition-all active:scale-95 disabled:opacity-40"
                  aria-label="Next product"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedProduct(null)
            setModal3D(false)
          }}
        >
          <div
            style={{
              height: "auto",
              maxHeight: "90vh",
              width: "90vw",
              maxWidth: "90vw",
            }}
            className="relative bg-[#0c022f] rounded-2xl p-4 border-4 border-[#ffcc00]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setSelectedProduct(null)
                setModal3D(false)
              }}
              className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#ffcc00] hover:bg-[#ffd633] flex items-center justify-center transition-all hover:scale-110 shadow-lg z-10"
            >
              <span className="text-3xl text-[#41059a] font-bold">×</span>
            </button>

            <div
              className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0c022f]"
              style={{
                height: "auto",
                maxHeight: "70vh",
              }}
            >
              {modal3D ? (
                <iframe
                  title={`${selectedProduct.Machine} interactive 3D viewer`}
                  src={modal3D}
                  frameBorder="0"
                  allowFullScreen
                  scrolling="no"
                  className="object-contain"
                  width={"100%"}
                  height={"100%"}
                />
              ) : (
                <Image
                  src={productImagePath(selectedProduct.FolderName)}
                  alt={selectedProduct.Machine}
                  fill
                  className="object-contain"
                />
              )}
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-3xl font-bold text-[#ffcc00] mb-2">{selectedProduct.Machine}</h3>
              <p className="text-white text-lg max-w-[90%] mx-auto block">{selectedProduct.Advertising}</p>
            </div>
            {selectedProduct.has3D && (
              <button
                onClick={() =>
                  setModal3D(product3DPath(selectedProduct.FolderName))
                }
                className="modal-3d-button"
              >
                <Image src={"/3d-cube.webp"} alt="Open 3D" width={84} height={84} priority />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Coverflow
