import { BookOpen } from "lucide-react"
import { CatalogueViewer } from "@/components/v2/catalogue-viewer"
import "./catalogue-banner.css"

export function CatalogueBanner() {
  return (
    <CatalogueViewer
      catalogueId="complete2026"
      label="View catalogue"
      trigger={
        <button type="button" className="pb-full-catalogue" aria-label="View the complete 2026 catalogue">
          <span>
            <span className="pb-full-catalogue__eyebrow">Explore the latest collection</span>
            <strong>The complete 2026 collection</strong>
            <small>Explore the full Putt Brothers product catalogue · PDF, 23 MB</small>
          </span>
          <span className="pb-full-catalogue__action">View catalogue<BookOpen size={22} aria-hidden="true" /></span>
        </button>
      }
    />
  )
}
