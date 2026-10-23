"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { SceneImage } from "@/components/v2/scene-image"
import { IaapaExpoDetails } from "@/components/iaapa-expo"
import { chapterPresentation, clamp, heroChapters, mediaTimeForProgress, smooth } from "@/lib/scroll-hero"
import "@/styles/scroll-hero.css"

export function ScrollHero() {
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const posterRef = useRef<HTMLDivElement>(null)
  const openingRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLSpanElement>(null)
  const chapterRefs = useRef<(HTMLElement | null)[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const root = rootRef.current, stage = stageRef.current, video = videoRef.current
    if (!root || !stage || !video) return
    let raf = 0, frameCallback = 0, cancelled = false, ready = false
    let top = 0, distance = 1, progress = 0, requested = 0, presented = 0
    let activeChapter = -1
    // The scroll experience is always enabled; old browser opt-out values are ignored.

    function render() {
      if (!root || !video) return
      const p = ready ? progress : 0
      const openingOpacity = 1 - smooth(0.01, 0.1, p)
      if (openingRef.current) {
        openingRef.current.style.opacity = String(openingOpacity)
        openingRef.current.style.transform = `translate3d(0,${-smooth(0.01, 0.1, p) * 36}px,0)`
        openingRef.current.inert = openingOpacity < 0.25
        openingRef.current.setAttribute('aria-hidden', String(openingOpacity < 0.25))
      }
      if (posterRef.current) posterRef.current.style.opacity = String(1 - smooth(0.008, 0.055, p))
      video.style.opacity = ready ? '1' : '0'
      let chapterIndex = -1
      heroChapters.forEach((chapter, index) => {
        const element = chapterRefs.current[index]
        if (!element) return
        const { opacity, offset } = chapterPresentation(ready ? presented : 0, index)
        element.style.opacity = String(opacity)
        element.style.transform = chapter.direction === 'up' ? `translate3d(0,${offset}px,0)` : `translate3d(${chapter.direction === 'left' ? -offset : offset}px,0,0)`
        element.inert = opacity < 0.5
        element.setAttribute('aria-hidden', String(opacity < 0.5))
        if (opacity >= 0.5) chapterIndex = index
      })
      if (chapterIndex !== activeChapter) {
        activeChapter = chapterIndex
        root.dataset.chapter = chapterIndex < 0 ? 'opening' : heroChapters[chapterIndex].id
      }
      root.dataset.presentedTime = presented.toFixed(3)
      root.dataset.requestedTime = requested.toFixed(3)
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`
    }
    function seek() {
      if (!video || !ready || video.seeking || video.readyState < 2) return
      if (Math.abs(video.currentTime - requested) > 1 / 48) video.currentTime = requested
    }
    function update() {
      raf = 0
      progress = clamp((window.scrollY - top) / distance)
      requested = mediaTimeForProgress(progress, Number.isFinite(video!.duration) ? video!.duration : 0)
      render()
      seek()
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(update) }
    function measure() {
      top = root!.getBoundingClientRect().top + window.scrollY
      distance = Math.max(1, root!.offsetHeight - stage!.offsetHeight)
      schedule()
    }
    function loaded() {
      if (cancelled || !video || video.readyState < 2) return
      if (!ready) { ready = true; setStatus('ready') }
      video.pause()
      presented = video.currentTime
      measure()
    }
    function seeked() {
      if (!video) return
      loaded()
      presented = video.currentTime // seeked confirms the target has been decoded.
      render()
      seek()
    }
    function failed() {
      ready = false
      setStatus('error')
      render()
    }
    function loading() { setStatus('loading') }
    function watchFrame() {
      if (!video || cancelled || !video.requestVideoFrameCallback) return
      frameCallback = video.requestVideoFrameCallback((_now, metadata) => {
        presented = metadata.mediaTime
        render()
        watchFrame()
      })
    }
    video.addEventListener('loadstart', loading)
    video.addEventListener('loadedmetadata', measure)
    video.addEventListener('loadeddata', loaded)
    video.addEventListener('canplay', loaded)
    video.addEventListener('seeked', seeked)
    video.addEventListener('error', failed)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    observer.observe(stage)
    const variant = matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop'
    video.src = `/videos/putt-brothers-scroll-v1-${variant}.mp4`
    video.load()
    watchFrame()
    measure()
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      if (frameCallback) video.cancelVideoFrameCallback(frameCallback)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      video.removeEventListener('loadstart', loading)
      video.removeEventListener('loadedmetadata', measure)
      video.removeEventListener('loadeddata', loaded)
      video.removeEventListener('canplay', loaded)
      video.removeEventListener('seeked', seeked)
      video.removeEventListener('error', failed)
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [attempt])

  return (
    <section ref={rootRef} className="pb-scroll-hero pb-dark" data-active={status !== 'error'} data-chapter="opening" aria-labelledby="home-title">
      <div ref={stageRef} className="pb-scroll-hero__stage">
        <video ref={videoRef} className="pb-scroll-hero__video" muted playsInline preload="auto" aria-hidden="true" disablePictureInPicture />
        <div ref={posterRef} className="pb-scroll-hero__poster"><SceneImage name="hero" alt="Concept of an entertainment venue combining mini golf, social spaces and hospitality" priority /></div>
        <div className="pb-scroll-hero__shade" aria-hidden="true" />
        <div ref={openingRef} className="pb-container pb-scroll-hero__opening">
          <p className="pb-eyebrow">Turning ideas into experiences</p>
          <h1 id="home-title">We build<br />what&apos;s next<br /><em>in play.</em></h1>
          <p className="pb-home-hero__intro">Extraordinary places. Unforgettable moments.<br className="pb-desktop-break" /> Designed, engineered and built together.</p>
          <div className="pb-actions"><Link href="/contact" className="pb-button">Let&apos;s build your vision <ArrowUpRight aria-hidden="true" /></Link><a href="#experiences" className="pb-text-link">Discover the possibilities <ArrowDown aria-hidden="true" /></a></div>
        </div>
        {heroChapters.map((chapter, index) => <article key={chapter.id} ref={element => { chapterRefs.current[index] = element }} className={`pb-scroll-copy pb-scroll-copy--${chapter.position}`} aria-hidden="true" inert>
          <p className="pb-eyebrow">{chapter.label}</p>
          <h2>{chapter.title}<br /><em>{chapter.accent}</em></h2>
          <p className="pb-scroll-copy__body">{chapter.body}</p>
          {'expo' in chapter && <IaapaExpoDetails />}
          {'cta' in chapter && <Link href={chapter.href} className="pb-button">{chapter.cta}<ArrowUpRight aria-hidden="true" /></Link>}
        </article>)}
        <div className="pb-scroll-hero__controls">
          <span className="pb-scroll-hero__status" role="status">{status === 'loading' ? 'Preparing your experience…' : status === 'error' ? 'The film could not load.' : 'Scroll to explore'}</span>
          <div>
            {status === 'error' ? <button type="button" onClick={() => setAttempt(value => value + 1)}>Try again</button> : null}
            <a href="#after-hero">Skip intro <ArrowDown size={13} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="pb-scroll-hero__progress" aria-hidden="true"><span ref={progressRef} /></div>
      </div>
      {status === 'error' && <div className="pb-container pb-scroll-hero__static">{heroChapters.map(chapter => <article key={chapter.id}><p className="pb-eyebrow">{chapter.label}</p><h2>{chapter.title} <em>{chapter.accent}</em></h2><p>{chapter.body}</p>{'expo' in chapter && <IaapaExpoDetails />}{'cta' in chapter && <Link href={chapter.href} className="pb-button">{chapter.cta}<ArrowUpRight aria-hidden="true" /></Link>}</article>)}</div>}
    </section>
  )
}
