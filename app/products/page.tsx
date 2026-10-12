import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowDown, ArrowRight, ArrowUpRight, Download } from "lucide-react"
import { ProductsShowcase } from "@/components/products-showcase"
import { SceneImage } from "@/components/v2/scene-image"
import "@/styles/v2-pages.css"

export const metadata: Metadata = {
  title: "Mini Golf & Table Golf Products",
  description: "Explore Putt Brothers mini golf designs, Table Golf and product catalogues. Find the right attraction and plan how it fits your venue.",
}

const collections = [
  {
    number: "01",
    title: "The Pro Series",
    category: "Mini golf, reimagined",
    description: "Creative challenges. Familiar games. A whole new way to play. Build a course with a mix of memorable holes, each with its own personality.",
    image: "/images/v2/products/the-home-run.webp",
    alt: "The Home Run mini golf hole from the Putt Brothers Pro Series",
    catalogue: "/catalogues/minigolf-latest.pdf",
    downloadLabel: "Download mini golf catalogue",
  },
  {
    number: "02",
    title: "Table Golf",
    category: "A fresh angle on play",
    description: "The strategy of billiards meets the imagination of mini golf. Discover distinctive table games that bring a different kind of competition to your space.",
    image: "/images/v2/products/soccer-table-golf.webp",
    alt: "Soccer Table Golf game by Putt Brothers",
    catalogue: "/catalogues/tablegolf-latest.pdf",
    downloadLabel: "Download Table Golf catalogue",
  },
]

export default function ProductsPage() {
  return (
    <main id="main-content" className="pb-v2 pb-products-page">
      <section className="pb-products-intro pb-dark" aria-labelledby="products-title">
        <div className="pb-container pb-products-intro__grid">
          <div className="pb-products-intro__copy">
            <p className="pb-eyebrow">Our products / Made for play</p>
            <h1 id="products-title" className="pb-title">Small putts.<br /><span>Big experiences.</span></h1>
            <p className="pb-products-intro__description">Give your guests something to play, talk about and come back for. Explore mini golf and Table Golf designed with imagination at every turn.</p>
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

      <div id="product-designs" className="pb-products-carousel">
        <ProductsShowcase
          heading="Find your next crowd-pleaser."
          description="Explore the designs, discover each challenge and open the available 3D views. Bring your favourites together to create a course that feels right for your venue."
          ctaHref="/contact#contact"
          ctaLabel="LET’S TALK ABOUT YOUR PROJECT"
        />
      </div>

      <section id="collections" className="pb-section pb-paper pb-collections" aria-labelledby="collections-title">
        <div className="pb-container">
          <div className="pb-pages-section-heading">
            <div>
              <p className="pb-eyebrow">Find your kind of fun</p>
              <h2 id="collections-title">Two ways.<br />Endless possibilities.</h2>
            </div>
            <p>Get a closer look at the collections. Browse the catalogues, find your favourites and let’s talk about what works in your space.</p>
          </div>
          <div className="pb-collections__grid">
            {collections.map((collection) => (
              <article key={collection.title} className="pb-collection">
                <div className="pb-collection__visual">
                  <span className="pb-collection__number" aria-hidden="true">{collection.number}</span>
                  <Image src={collection.image} alt={collection.alt} fill sizes="(max-width: 767px) 100vw, 50vw" className="pb-collection__image" />
                </div>
                <div className="pb-collection__body">
                  <p className="pb-eyebrow">{collection.category}</p>
                  <h3>{collection.title}</h3>
                  <p>{collection.description}</p>
                  <a className="pb-collection__download" href={collection.catalogue} download>
                    <span>{collection.downloadLabel}<small>PDF catalogue</small></span>
                    <Download size={22} aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <a className="pb-full-catalogue" href="/catalogues/puttbrothers-2026.pdf" download>
            <span><strong>The complete 2026 collection</strong><small>Explore the full Putt Brothers product catalogue · PDF, 18 MB</small></span>
            <span>Download catalogue <Download size={19} aria-hidden="true" /></span>
          </a>
        </div>
      </section>

      <section className="pb-products-planner" aria-labelledby="planner-title">
        <div className="pb-container pb-products-planner__grid">
          <div>
            <p className="pb-eyebrow">Your space. Your possibilities.</p>
            <h2 id="planner-title">See how it fits.</h2>
            <p>Sketch your venue, arrange your favourite designs and bring your idea one step closer to reality with our layout planner.</p>
            <Link href="/layout-planner" className="pb-button pb-products-planner__button">Plan your space <ArrowUpRight size={20} aria-hidden="true" /></Link>
          </div>
          <ol className="pb-products-planner__steps">
            <li><span>01</span><div><h3>Map your space</h3><p>Start with your venue’s shape and dimensions.</p></div></li>
            <li><span>02</span><div><h3>Make it your own</h3><p>Explore the placement of your chosen course designs.</p></div></li>
            <li><span>03</span><div><h3>Start the conversation</h3><p>Share your layout with our team through the contact form.</p></div><ArrowRight size={24} aria-hidden="true" /></li>
          </ol>
        </div>
      </section>
    </main>
  )
}
