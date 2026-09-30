"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Swiper, SwiperSlide } from "swiper/react"
import type { Swiper as SwiperType } from "swiper"
import { EffectCoverflow, Navigation, Pagination, Autoplay } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"
import "swiper/css/effect-coverflow"
import "./coverflow.css"

type CoverflowProps = {
  products: any[]
  isLoading?: boolean
  imageVariant?: "desktop" | "mobile" | "responsive"
  enableAutoplay?: boolean
  enableLoop?: boolean
  initialSlide?: number
  onReachBeginning?: () => void
  onReachEnd?: () => void
}

const Coverflow = ({
  products,
  isLoading = false,
  imageVariant = "desktop",
  enableAutoplay = true,
  enableLoop = true,
  initialSlide = 0,
  onReachBeginning,
  onReachEnd,
}: CoverflowProps) => {
  const [modal3D, setModal3D] = useState<string | false>(false)
  const [modalVideo, setModalVideo] = useState<string | false>(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const swiperRef = useRef<SwiperType | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const ignoredInitialSlideChangeRef = useRef(false)

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    handleResize() // Set initial window size
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const S3_BASE = "https://puttbrothers-images.s3.ap-southeast-2.amazonaws.com"

  const getResponsiveImageSize = () => {
    if (imageVariant !== "responsive") return imageVariant
    if (windowSize.width < 768) return "mobile"
    return "desktop" // S3 only has desktop and mobile
  }

  useEffect(() => {
    ignoredInitialSlideChangeRef.current = false
  }, [initialSlide, products])

  useEffect(() => {
    const iframe = iframeRef.current
    if (iframe) {
      const handleLoad = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDoc) {
            const footer = iframeDoc.getElementById("unity-footer")
            if (footer) {
              footer.style.display = "none"
            }
          }
        } catch (error) {
          console.error("Failed to access iframe content:", error)
        }
      }

      iframe.addEventListener("load", handleLoad)

      return () => {
        iframe.removeEventListener("load", handleLoad)
      }
    }
  }, [modal3D])


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
            onMouseLeave={() => enableAutoplay && swiperRef.current?.autoplay?.start()}
          >
            <Swiper
              className="swiper-container"
              modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
              centeredSlides={true}
              loop={enableLoop && products.length > 3}
              initialSlide={initialSlide}
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
              autoplay={
                enableAutoplay
                  ? {
                      delay: 3000,
                      disableOnInteraction: false,
                    }
                  : false
              }
              slidesPerView="auto"
              navigation={{
                nextEl: ".swiper-button-next-coverflow",
                prevEl: ".swiper-button-prev-coverflow",
              }}
              pagination={true}
              onSwiper={(swiper) => {
                swiperRef.current = swiper
              }}
              onSlideChange={(swiper) => {
                if (products.length < 2) return

                if (
                  initialSlide > 0 &&
                  !ignoredInitialSlideChangeRef.current &&
                  swiper.activeIndex === initialSlide
                ) {
                  ignoredInitialSlideChangeRef.current = true
                  return
                }

                if (swiper.activeIndex === products.length - 1 && swiper.previousIndex < swiper.activeIndex) {
                  onReachEnd?.()
                }

                if (swiper.activeIndex === 0 && swiper.previousIndex > swiper.activeIndex) {
                  onReachBeginning?.()
                }
              }}
            >
              {products &&
                products.map((product, index) => (
                  <SwiperSlide
                    key={`${product.FolderName || product.Machine || "product"}-${index}`}
                    className="swiper-slide"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Image
                      src={
                        product.FolderName
                          ? `/product-media/${encodeURIComponent(product.FolderName)}/media/${getResponsiveImageSize()}.png`
                          : "/placeholder.svg"
                      }
                      alt={product.Machine}
                      width={1110 / 1.8}
                      height={650 / 1.8}
                      priority={index < 2}
                    />
                    <div className="coverflow_description">
                      <h6>{product.Machine}</h6>
                      <p>{product.Advertising}</p>
                    </div>
                    {product.has3D && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setModal3D(`${S3_BASE}/${product.FolderName}/build/index.html`)
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
            <div className="max-w-[820px] w-full mx-auto relative">
              <div className="swiper-button-prev swiper-button-prev-coverflow">
                <button
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg z-10"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-6 w-6 text-[#41059a]" />
                </button>
              </div>
              <div className="swiper-button-next swiper-button-next-coverflow">
                <button
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg z-10"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-6 w-6 text-[#41059a]" />
                </button>
              </div>
            </div>
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
                  ref={iframeRef}
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
                  src={`/product-media/${encodeURIComponent(selectedProduct.FolderName)}/media/${getResponsiveImageSize()}.png`}
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
                  setModal3D(`${S3_BASE}/${selectedProduct.FolderName}/build/index.html`)
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
