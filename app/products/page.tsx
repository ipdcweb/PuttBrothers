import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowRight, ArrowUpRight, Download } from "lucide-react"
import { ProductsShowcase } from "@/components/products-showcase"
import { SceneImage } from "@/components/v2/scene-image"
import { PlannerIllustration } from "@/components/v2/planner-illustration"
import { CatalogueViewer } from "@/components/v2/catalogue-viewer"
import "@/styles/v2-pages.css"

export const metadata: Metadata = {
  title: "Mini Golf, Table Golf & Interactive Experiences",
  description: "Explore The Links Course, The Pro Series, Table Golf and interactive experiences. Find the right attraction and plan how it fits your venue.",
}

const collections = [
  {
    number: "01",
    title: "The Links Course",
    category: "Classic golf. A new setting.",
    description: "The feel of a golf course, brought into your venue. Contoured greens and flowing layouts create a custom mini golf experience shaped around the space you have.",
    image: "/images/v2/minigolf-desktop.webp",
    alt: "Concept inspiration for a custom mini golf environment",
    fullBleed: true,
    href: "/contact#contact",
    catalogue: false,
    actionLabel: "Plan your Links course",
  },
  {
    number: "02",
    title: "The Pro Series",
    category: "Mini golf, reimagined",
    description: "Creative challenges. Familiar games. A whole new way to play. Build a course with a mix of memorable holes, each with its own personality.",
    image: "/images/v2/products/the-home-run.webp",
    alt: "The Home Run mini golf hole from the Putt Brothers Pro Series",
    fullBleed: false,
    href: "/catalogues/minigolf-latest.pdf",
    catalogue: true,
    actionLabel: "View Mini Golf catalogue",
  },
  {
    number: "03",
    title: "Table Golf",
    category: "A fresh angle on play",
    description: "The strategy of billiards meets the imagination of mini golf. Discover distinctive table games that bring a different kind of competition to your space.",
    image: "/images/v2/products/soccer-table-golf.webp",
    alt: "Soccer Table Golf game by Putt Brothers",
    fullBleed: false,
    href: "/catalogues/tablegolf-latest.pdf",
    catalogue: true,
    actionLabel: "View Table Golf catalogue",
  },
  {
    number: "04",
    title: "Interactive Experiences",
    category: "Get into the game",
    description: "Bring the thrill of the track into your venue with One Grid racing simulators, and explore new possibilities for interactive games. We consider the layout, setting and technology together to create more ways to compete and play.",
    image: "/images/v2/client-story-racing-v3.webp",
    alt: "Racing simulator experience from the Putt Brothers films",
    fullBleed: true,
    href: "/contact#contact",
    catalogue: false,
    actionLabel: "Explore the possibilities",
  },
]

export default function ProductsPage() {
  return (
    <main id="main-content" className="pb-v2 pb-products-page">
      <section className="pb-products-intro pb-dark" aria-labelledby="products-title">
        <div className="pb-container pb-products-intro__grid">
          <div className="pb-products-intro__copy">
            <p className="pb-eyebrow">Our products / Made for play</p>
            <h1 id="products-title" className="pb-title">What could<br /><span>your space<br />become?</span></h1>
            <p className="pb-products-intro__description">Mini golf brings the challenge. Interiors set the atmosphere. Interactive attractions open up more ways to play. Explore each part and how they can work together.</p>
            <div className="pb-pages-actions">
              <a href="#product-designs" className="pb-button">Explore the designs <ArrowDown size={18} aria-hidden="true" /></a>
              <a href="#collections" className="pb-pages-text-link">View the catalogues <ArrowUpRight size={18} aria-hidden="true" /></a>
            </div>
          </div>
          <div className="pb-products-intro__visual">
            <SceneImage name="minigolf" alt="Concept inspiration for an immersive mini golf environment" priority sizes="(max-width: 767px) 100vw, 52vw" />
            <span className="pb-products-intro__caption">Concept inspiration · Designed around play.</span>
          </div>
        </div>
      </section>

      <section id="collections" className="pb-section pb-paper pb-collections" aria-labelledby="collections-title">
        <div className="pb-container">
          <div className="pb-pages-section-heading">
            <div>
              <p className="pb-eyebrow">Find your kind of fun</p>
              <h2 id="collections-title" className="sr-only">Explore our collections</h2>
            </div>
            <p>Get a closer look at the collections. Browse the catalogues, find your favourites and let’s talk about what works in your space.</p>
          </div>
          <div className="pb-collections__grid">
            {collections.map((collection) => (
              <article key={collection.title} className={`pb-collection${collection.fullBleed ? " pb-collection--scene" : ""}`}>
                <div className="pb-collection__visual">
                  <span className="pb-collection__number" aria-hidden="true">{collection.number}</span>
                  <Image src={collection.image} alt={collection.alt} fill sizes="(max-width: 767px) 100vw, 50vw" className="pb-collection__image" />
                  {collection.title === "The Links Course" && <span className="pb-collection__caption">Concept inspiration</span>}
                </div>
                <div className="pb-collection__body">
                  <p className="pb-eyebrow">{collection.category}</p>
                  <h3>{collection.title}</h3>
                  <p>{collection.description}</p>
                </div>
                {collection.catalogue ? (
                  <CatalogueViewer catalogueId={collection.title === "Table Golf" ? "tablegolf" : "minigolf"} label={collection.actionLabel} />
                ) : (
                  <Link className="pb-collection__download" href={collection.href}>
                    <span>{collection.actionLabel}</span><ArrowUpRight size={22} aria-hidden="true" />
                  </Link>
                )}
              </article>
            ))}
          </div>
          <a className="pb-full-catalogue" href="/catalogues/puttbrothers-2026.pdf" download>
            <span><span className="pb-full-catalogue__eyebrow">Explore the latest collection</span><strong>The complete 2026 collection</strong><small>Explore the full Putt Brothers product catalogue · PDF, 18 MB</small></span>
            <span className="pb-full-catalogue__action">Download catalogue <Download size={22} aria-hidden="true" /></span>
          </a>
        </div>
      </section>

      <div id="product-designs" className="pb-products-carousel">
        <ProductsShowcase
          heading="Find your next crowd-pleaser."
          description="Explore the designs, discover each challenge and open the available 3D views. Bring your favourites together to create a course that feels right for your venue."
          ctaHref="/contact#contact"
          ctaLabel="LET’S TALK ABOUT YOUR PROJECT"
        />
      </div>

      <section id="planner-guide" className="pb-products-planner" aria-labelledby="planner-title">
        <div className="pb-container">
          <div className="pb-products-planner__intro">
            <div>
              <p className="pb-eyebrow">Your space. Your possibilities.</p>
              <h2 id="planner-title">See how it fits.</h2>
            </div>
            <p>Explore how your favourite designs could work in your venue. Our enquiry form includes a layout planner, so you can try different ideas before sharing them with our team.</p>
          </div>
          <div className="pb-products-planner__preview">
              <PlannerIllustration />
              <div>
                <p className="pb-products-planner__instruction">Make room for your ideas in three simple steps.</p>
                <ol className="pb-products-planner__steps">
                  <li><span>01</span><div><h3>Start in the enquiry form</h3><p>Add your details, open <strong>Plan your venue layout</strong> and select <strong>Create your Layout</strong>.</p></div></li>
                  <li><span>02</span><div><h3>Map your space in m²</h3><p>Draw your venue’s shape and enter its dimensions to see your available area in square metres.</p></div></li>
                  <li><span>03</span><div><h3>Choose, place and try again</h3><p>Pick your designs, drag them into position and explore different arrangements. Your finished layout summary PDF is added to your enquiry.</p></div></li>
                </ol>
                <Link href="/contact#contact" className="pb-button pb-products-planner__button">Open the enquiry form <ArrowRight size={20} aria-hidden="true" /></Link>
                <p className="pb-products-planner__device-note">For the full drag-and-drop experience, use a desktop or laptop.</p>
              </div>
          </div>
        </div>
      </section>
    </main>
  )
}
