import machines from "./catalog/machines.json"
import threeDFolders from "./catalog/three-d-folders.json"

const folders = new Set(machines.map(machine => machine.FolderName))
const models = new Set<string>(threeDFolders)
const legacyHost = "puttbrothers-images.s3.ap-southeast-2.amazonaws.com"

export function productImagePath(folder: string, variant: "desktop" | "mobile" = "desktop") {
  return `/product-media/${encodeURIComponent(folder)}/media/${variant}.png`
}

export function product3DPath(folder: string) {
  return `/product-media/${encodeURIComponent(folder)}/build/index.html`
}

export function hasProduct3D(folder: string) {
  return folders.has(folder) && models.has(folder)
}

// Old saved planner projects can contain S3 URLs. Translate known images only;
// never fetch an arbitrary URL supplied by a visitor.
export function resolveProductImagePath(value: unknown): string | null {
  if (typeof value !== "string") return null
  let pathname = value
  if (!value.startsWith("/product-media/")) {
    try {
      const url = new URL(value)
      if (url.protocol !== "https:" || url.hostname !== legacyHost || url.port || url.username || url.password || url.search || url.hash) return null
      pathname = `/product-media${url.pathname}`
    } catch { return null }
  }
  const match = pathname.match(/^\/product-media\/([A-Za-z0-9_-]+)\/media\/(desktop|mobile)\.png$/)
  return match && folders.has(match[1]) ? pathname : null
}
