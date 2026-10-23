"use client"

import { useRef, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight, Download, LoaderCircle, X, ZoomIn, ZoomOut } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { A11y, Zoom } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import catalogues from "@/lib/catalogue-pages.json"
import "swiper/css"
import "swiper/css/zoom"
import "./catalogue-viewer.css"

type CatalogueId = keyof typeof catalogues
type CataloguePage = typeof catalogues.minigolf.pages[number]

function PageImage({ page, title, number }: { page: CataloguePage; title: string; number: number }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <>
      {!loaded && !failed && <span className="pb-catalogue__loading" role="status"><LoaderCircle aria-hidden="true" /> Loading page {number}…</span>}
      {failed ? (
        <p className="pb-catalogue__error" role="alert">This page could not load. Please reopen the catalogue or download the PDF below.</p>
      ) : (
        <div className="swiper-zoom-container">
          <picture>
            <source media="(max-width: 767px)" srcSet={page["900"].src} type="image/webp" />
            {/* Static PDF exports already have responsive, versioned WebP variants. */}
            <img
              src={page["1800"].src}
              width={page["1800"].width}
              height={page["1800"].height}
              alt={`${title} catalogue, page ${number}`}
              draggable={false}
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
            />
          </picture>
        </div>
      )}
    </>
  )
}

export function CatalogueViewer({ catalogueId, label }: { catalogueId: CatalogueId; label: string }) {
  const catalogue = catalogues[catalogueId]
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [ready, setReady] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const swiperRef = useRef<SwiperType | null>(null)
  const total = catalogue.pages.length

  function moveTo(index: number) {
    const swiper = swiperRef.current
    if (!swiper || swiper.destroyed) return
    swiper.zoom.out()
    swiper.slideTo(Math.max(0, Math.min(total - 1, index)))
  }

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next)
      if (!next) {
        swiperRef.current = null
        setReady(false)
        setPage(0)
        setZoomed(false)
      }
    }}>
      <DialogTrigger asChild>
        <button type="button" className="pb-collection__download">
          <span>{label}<small>Browse the catalogue</small></span>
          <ArrowRight size={23} aria-hidden="true" />
        </button>
      </DialogTrigger>
      {open && (
        <DialogContent
          className="pb-catalogue pb-v2"
          showCloseButton={false}
          onKeyDown={(event) => {
            if (event.altKey || event.ctrlKey || event.metaKey) return
            if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
              event.preventDefault()
              moveTo(event.key === "Home" ? 0 : event.key === "End" ? total - 1 : page + (event.key === "ArrowRight" ? 1 : -1))
            }
          }}
        >
          <header className="pb-catalogue__header">
            <div>
              <p className="pb-catalogue__eyebrow">Putt Brothers / Made for play</p>
              <DialogTitle>{catalogue.title} catalogue</DialogTitle>
              <DialogDescription>One page at a time. Swipe or use the arrows to explore.</DialogDescription>
            </div>
            <DialogClose asChild><button type="button" className="pb-catalogue__icon" aria-label="Close catalogue"><X size={24} aria-hidden="true" /></button></DialogClose>
          </header>
          <div className="pb-catalogue__stage">
            <Swiper
              className="pb-catalogue__swiper"
              modules={[A11y, Zoom]}
              slidesPerView={1}
              spaceBetween={24}
              speed={250}
              zoom={{ maxRatio: 3, toggle: true }}
              a11y={{ containerMessage: `${catalogue.title} catalogue pages`, slideLabelMessage: "Page {{index}} of {{slidesLength}}" }}
              onSwiper={(swiper) => { swiperRef.current = swiper; setReady(true) }}
              onSlideChange={(swiper) => { setPage(swiper.activeIndex); setZoomed(false) }}
              onZoomChange={(_, scale) => setZoomed(scale > 1)}
            >
              {catalogue.pages.map((item, index) => (
                <SwiperSlide key={item["1800"].src}>
                  {Math.abs(index - page) <= 1 && <PageImage page={item} title={catalogue.title} number={index + 1} />}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <footer className="pb-catalogue__footer">
            <div className="pb-catalogue__navigation" aria-label="Catalogue navigation">
              <button type="button" className="pb-catalogue__icon" aria-label="Previous catalogue page" disabled={!ready || page === 0} onClick={() => moveTo(page - 1)}><ChevronLeft aria-hidden="true" /></button>
              <span className="pb-catalogue__counter" aria-live="polite" aria-atomic="true">{page + 1} / {total}</span>
              <button type="button" className="pb-catalogue__icon" aria-label="Next catalogue page" disabled={!ready || page === total - 1} onClick={() => moveTo(page + 1)}><ChevronRight aria-hidden="true" /></button>
            </div>
            <div className="pb-catalogue__tools">
              <button type="button" className="pb-catalogue__tool" disabled={!ready} aria-pressed={zoomed} onClick={() => zoomed ? swiperRef.current?.zoom.out() : swiperRef.current?.zoom.in(2)}>
                {zoomed ? <ZoomOut size={19} aria-hidden="true" /> : <ZoomIn size={19} aria-hidden="true" />}<span>{zoomed ? "Fit page" : "Zoom in"}</span>
              </button>
              <a className="pb-catalogue__tool pb-catalogue__pdf" href={catalogue.pdf} download><Download size={19} aria-hidden="true" /><span>Download PDF</span></a>
            </div>
          </footer>
        </DialogContent>
      )}
    </Dialog>
  )
}
