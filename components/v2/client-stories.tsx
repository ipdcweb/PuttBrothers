"use client"

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react"
import { BorderGlowPanel } from "@/components/ui/border-glow-panel"
import stories from "@/lib/client-stories.json"
import { mayAdvanceStory, mayPlayStory, storyIndex, storyOffset, storyTime } from "@/lib/client-story-playback"
import "@/styles/client-stories.css"

type Connection = EventTarget & { saveData?: boolean }

export function ClientStories() {
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const dragRef = useRef<{ x: number; y: number; id: number; moved: boolean } | null>(null)
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(false)
  const [visited, setVisited] = useState(false)
  const [visible, setVisible] = useState(true)
  const [preferences, setPreferences] = useState({ ready: false, reducedMotion: false, saveData: false })
  const [userStarted, setUserStarted] = useState(false)
  const [requested, setRequested] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [autoNext, setAutoNext] = useState(true)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'blocked' | 'error' | 'ended'>('idle')
  const [time, setTime] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const story = stories[active]
  const loadMedia = visited && preferences.ready &&
    (userStarted || (!preferences.reducedMotion && !preferences.saveData))
  const mayPlay = mayPlayStory({ inView, visible, requested, loaded: loadMedia, userStarted, ...preferences })
  const progress = Math.min(100, Math.max(0, time / story.duration * 100))
  const attemptingPlayback = requested && mayPlay && status === 'loading'
  const autoAllowed = !preferences.reducedMotion && !preferences.saveData

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: Connection }).connection
    const updatePreferences = () => setPreferences({ ready: true, reducedMotion: motion.matches, saveData: !!connection?.saveData })
    const updateVisibility = () => setVisible(!document.hidden)
    updatePreferences()
    updateVisibility()
    motion.addEventListener('change', updatePreferences)
    connection?.addEventListener('change', updatePreferences)
    document.addEventListener('visibilitychange', updateVisibility)
    const stage = stageRef.current
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting && entry.intersectionRatio >= 0.45)
      if (entry.isIntersecting) setVisited(true)
    }, { threshold: [0, 0.45] })
    if (stage) observer.observe(stage)
    return () => {
      observer.disconnect()
      motion.removeEventListener('change', updatePreferences)
      connection?.removeEventListener('change', updatePreferences)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    let cancelled = false
    video.muted = muted
    if (mayPlay) {
      void video.play().catch((error: unknown) => {
        if (cancelled || (error instanceof DOMException && error.name === 'AbortError')) return
        setPlaying(false)
        setStatus('blocked')
      })
    } else video.pause()
    // Capture the old node so a rapid selection can never leave its audio playing.
    return () => { cancelled = true; video.pause() }
  }, [active, attempt, mayPlay, muted])

  function select(index: number, manual = true) {
    const next = storyIndex(index, stories.length)
    if (next === active) return
    videoRef.current?.pause()
    setActive(next)
    setPlaying(false)
    setTime(0)
    setStatus('idle')
    setAttempt(0)
    if (manual) {
      setUserStarted(true)
      setRequested(true)
      setAnnouncement(`${next + 1} of ${stories.length}. ${stories[next].label}.`)
    }
  }

  function togglePlayback() {
    const video = videoRef.current
    if (playing || attemptingPlayback) { setRequested(false); video?.pause(); return }
    setUserStarted(true)
    setVisited(true)
    setRequested(true)
    if (status === 'error') { setStatus('idle'); setAttempt(value => value + 1); return }
    if (video?.ended) { video.currentTime = 0; setTime(0) }
    // A user gesture also retries blocked playback, even when intent hasn't changed.
    if (video?.getAttribute('src')) {
      void video.play().catch(() => setStatus('blocked'))
    }
  }

  function ended() {
    const focused = document.activeElement
    const keyboardFocus = !!focused && !!rootRef.current?.contains(focused) && focused.matches(':focus-visible')
    if (mayAdvanceStory({ inView, visible, autoNext, keyboardFocus, ...preferences })) select(active + 1, false)
    else { setPlaying(false); setRequested(false); setStatus('ended') }
  }

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest('button,a,input')) return
    dragRef.current = { x: event.clientX, y: event.clientY, id: event.pointerId, moved: false }
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y
    if (!drag.moved && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      drag.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }
  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag || !drag.moved) return
    const dx = event.clientX - drag.x
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (Math.abs(dx) > 45) select(active + (dx < 0 ? 1 : -1))
  }

  const playLabel = playing || attemptingPlayback ? 'Pause video' : status === 'ended' ? 'Replay video' : 'Play video'
  return (
    <section id="real-play" ref={rootRef} className="pb-stories pb-dark" aria-labelledby="real-play-title">
      <div className="pb-container pb-stories__layout">
        <div className="pb-stories__intro">
          <p className="pb-eyebrow">03 / Play in real life</p>
          <h2 id="real-play-title" className="pb-title">Real play.<br />Real <em>reactions.</em></h2>
          <p className="pb-stories__lead">The best part of an attraction?<br />The people enjoying it.</p>
          <p className="pb-stories__context">Step inside real entertainment spaces. See the games, the shared moments and the energy your next project could bring.</p>
          <div className="pb-stories__story" key={story.id}>
            <p className="pb-stories__category"><span>{String(active + 1).padStart(2, '0')} / 06</span>{story.label}</p>
            <h3>{story.title}</h3>
            <p>{story.description}</p>
          </div>
          <Link href="/contact#contact" className="pb-button pb-stories__cta">Bring this energy to your venue <ArrowUpRight aria-hidden="true" /></Link>
        </div>

        <div className="pb-stories__carousel" role="region" aria-roledescription="carousel" aria-label="Real play films" tabIndex={0}
          onKeyDown={event => {
            if ((event.target as HTMLElement).matches('input,select,textarea')) return
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault(); select(active + (event.key === 'ArrowRight' ? 1 : -1))
            }
          }}>
          <div ref={stageRef} className="pb-stories__stage" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={() => { dragRef.current = null }}>
            <div className="pb-stories__halo" aria-hidden="true" />
            {stories.map((item, index) => {
              const offset = storyOffset(index, active, stories.length)
              const selected = offset === 0
              const hidden = Math.abs(offset) > 1
              return <div key={item.id} className="pb-stories__card" data-position={selected ? 'active' : offset < 0 ? 'previous' : 'next'} data-hidden={hidden} inert={hidden} aria-hidden={hidden || undefined}
                style={{ '--story-offset': Math.sign(offset) } as CSSProperties}>
                {selected ? <BorderGlowPanel className="pb-stories__frame" contentClassName="pb-stories__frame-content" onPointerMove={event => {
                  if (event.pointerType !== 'mouse' || preferences.reducedMotion || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
                  const box = event.currentTarget.getBoundingClientRect()
                  event.currentTarget.style.setProperty('--glow-x', `${event.clientX - box.left}px`)
                  event.currentTarget.style.setProperty('--glow-y', `${event.clientY - box.top}px`)
                }}>
                  <div role="group" aria-roledescription="slide" aria-label={`${active + 1} of ${stories.length}: ${item.label}`}>
                    <video key={`${item.id}-${attempt}`} ref={videoRef} className="pb-stories__video" src={loadMedia ? item.video : undefined} poster={item.poster}
                      width={720} height={1280} muted={muted} playsInline preload={loadMedia ? 'auto' : 'none'} disablePictureInPicture
                      aria-label={`${item.alt}. Instrumental music, no dialogue.`}
                      onLoadStart={() => setStatus('loading')} onLoadedData={() => setStatus('ready')} onWaiting={() => setStatus('loading')}
                      onPlaying={() => { setPlaying(true); setStatus('ready') }} onPause={() => setPlaying(false)}
                      onError={() => { setStatus('error'); setPlaying(false) }} onEnded={ended}
                      onTimeUpdate={event => setTime(event.currentTarget.currentTime)} />
                    {(!playing && status !== 'loading') ? <button className="pb-stories__play-overlay" type="button" onClick={togglePlayback} aria-label={playLabel}>
                      {status === 'ended' ? <RotateCcw aria-hidden="true" /> : <Play aria-hidden="true" />}
                    </button> : null}
                    {status === 'loading' ? <span className="pb-stories__loading" role="status">Loading film…</span> : null}
                  </div>
                </BorderGlowPanel> : <button className="pb-stories__preview" type="button" tabIndex={-1} onClick={() => select(index)} aria-label={`Watch ${item.label}`}>
                  {/* Explicit WebP, lazy and fixed-ratio; no image service needed. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.poster} width={540} height={960} loading="lazy" decoding="async" alt="" draggable={false} />
                  <span>{offset < 0 ? 'Previous film' : 'Up next'}<strong>{item.label}</strong></span>
                </button>}
              </div>
            })}
          </div>

          <div className="pb-stories__player-controls">
            <button type="button" onClick={togglePlayback} aria-label={playLabel} aria-pressed={playing}>{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button>
            <label className="pb-stories__seek"><span className="sr-only">Seek current video</span><input type="range" min="0" max="100" step="0.1" value={progress} disabled={!loadMedia || status === 'error'} aria-valuetext={`${storyTime(time)} of ${storyTime(story.duration)}`}
              style={{ '--progress': `${progress}%` } as CSSProperties} onChange={event => {
                const video = videoRef.current
                if (video && video.readyState >= 1) { video.currentTime = Number(event.target.value) / 100 * video.duration; setTime(video.currentTime) }
              }} /></label>
            <span className="pb-stories__time" aria-hidden="true">{storyTime(time)} / {storyTime(story.duration)}</span>
            <button type="button" className="pb-stories__sound" aria-label={muted ? 'Turn sound on' : 'Mute sound'} aria-pressed={!muted} onClick={() => {
              if (videoRef.current) videoRef.current.muted = !muted
              setMuted(value => !value)
            }}>{muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}<span>{muted ? 'Sound off' : 'Sound on'}</span></button>
          </div>
          {status === 'error' ? <p className="pb-stories__message" role="status">This film could not load. <button type="button" onClick={togglePlayback}>Try again</button> or <a href={story.video}>open the video</a>.</p> : null}
          {status === 'blocked' ? <p className="pb-stories__message" role="status">Press play to start this film.</p> : null}
          <div className="pb-stories__navigation">
            <div className="pb-stories__selectors" role="group" aria-label="Choose a film">{stories.map((item, index) => <button type="button" key={item.id} aria-label={`Film ${index + 1}: ${item.label}`} aria-current={active === index ? 'true' : undefined} onClick={() => select(index)}><span />{String(index + 1).padStart(2, '0')}</button>)}</div>
            <div className="pb-stories__arrows"><button type="button" aria-label="Previous film" onClick={() => select(active - 1)}><ArrowLeft aria-hidden="true" /></button><button type="button" aria-label="Next film" onClick={() => select(active + 1)}><ArrowRight aria-hidden="true" /></button></div>
          </div>
          <div className="pb-stories__footnote"><span>Real guests. Real moments.</span><button type="button" disabled={!autoAllowed} aria-pressed={autoAllowed && autoNext} onClick={() => setAutoNext(value => !value)}>{!autoAllowed ? 'Manual playback' : autoNext ? 'Auto next on' : 'Auto next off'}</button></div>
          <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
          <noscript><p>Watch the films: {stories.map(item => <a key={item.id} href={item.video}>{item.label}. </a>)}</p></noscript>
        </div>
      </div>
    </section>
  )
}
