type SceneImageProps = {
  name: "hero" | "minigolf" | "hospitality" | "interactive" | "workshop"
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}

/** Art-directed WebP sources; mobile never downloads the desktop hero by default. */
export function SceneImage({ name, alt, className = "", priority = false, sizes = "100vw" }: SceneImageProps) {
  return (
    <picture className={`pb-scene ${className}`}>
      <source media="(max-width: 639px)" srcSet={`/images/v2/${name}-mobile.webp`} type="image/webp" />
      <source media="(max-width: 1100px)" srcSet={`/images/v2/${name}-tablet.webp`} type="image/webp" />
      {/* Native picture is intentional: pre-encoded responsive assets, no image proxy. */}
      <img
        src={`/images/v2/${name}-desktop.webp`}
        alt={alt}
        width={1600}
        height={900}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  )
}
