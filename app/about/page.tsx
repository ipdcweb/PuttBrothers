import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { SceneImage } from "@/components/v2/scene-image"

export const metadata: Metadata = {
  title: "About Our Team",
  description: "Meet the designers, engineers and makers behind Putt Brothers. Over 20 years of industry experience, creating entertainment experiences together.",
}

const team = [
  { name: "Douglas Tonsic", role: "Chief Operating Officer", image: "/images/v2/team/douglas-tonsic-studio-v3.webp" },
  { name: "Imre Szenttornyay", role: "Partner & Chief Development Officer", image: "/images/v2/team/imre-szenttornyay-studio-v3.webp" },
  { name: "João Nascimento", role: "Chief Strategy Officer", image: "/images/v2/team/joao-nascimento-studio-v3.webp" },
  { name: "Luiz Tonsic", role: "Chief Executive Officer", image: "/images/v2/team/luiz-tonsic-studio-v3.webp" },
]
const values = [
  { title: "Quality", description: "Care in every detail, from design and fabrication to installation and ongoing support." },
  { title: "Innovation", description: "New ideas and technologies that make every attraction a more engaging experience." },
  { title: "Customer satisfaction", description: "Understanding your goals and working with you to create the right solution." },
  { title: "Collaboration", description: "Designers, engineers, consultants and clients working together with open communication." },
  { title: "Integrity", description: "Honesty, transparency and respect at every stage of the relationship." },
  { title: "Sustainability", description: "Creating joy responsibly, with consideration for our planet and its resources." },
]
const partners = [
  { name: "Cielo Vision", description: "Technology expertise to help develop connected environments and explore new ways for guests to interact with the space." },
  { name: "EHP Interiors", description: "Interior design and fit-outs that shape the atmosphere and functionality of bars, lounges and the spaces around the attractions." },
  { name: "One Grid", description: "Racing simulator experiences that bring the thrill of motorsport into the venue, giving guests another way to compete and play." },
]

export default function AboutPage() {
  return (
    <main id="main-content" className="pb-v2 pb-about">
      <section className="pb-about-hero pb-dark" aria-labelledby="pb-about-title">
        <div className="pb-container">
          <div className="pb-about-hero__topline"><p className="pb-eyebrow">About Putt Brothers</p><span>People. Experiences. Places.</span></div>
          <h1 id="pb-about-title" className="pb-about-hero__title">Built on ideas.<br /><span>Made for play.</span></h1>
          <div className="pb-about-hero__bottomline">
            <p>We bring creativity, engineering and hands-on experience together to turn big ideas into places people love.</p>
            <a href="#our-story" className="pb-about-hero__discover">Discover our story <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </section>
      <section id="our-story" className="pb-section pb-paper pb-about-story" aria-labelledby="pb-about-story-title">
        <div className="pb-container pb-about-story__grid">
          <div className="pb-about-story__experience">
            <span className="pb-about-story__number">20<span>+</span></span>
            <p>Years of industry<br />experience</p><span className="pb-about-story__rule" aria-hidden="true" />
            <p className="pb-about-story__locations">Based in Auckland.<br />Built in New Zealand & Brazil.<br />Made for the world.</p>
          </div>
          <div className="pb-about-story__copy">
            <p className="pb-eyebrow">From concept to connection</p>
            <h2 id="pb-about-story-title" className="pb-title">More than games.<br />We design <span>happiness.</span></h2>
            <p>At Putt Brothers, we design and build entertainment spaces, with mini golf at the heart of what we create.</p>
            <p>With over 20 years of industry experience, our designers, engineers and consultants partner with you from the first concept through to the final installation. We understand the balance between a memorable guest experience and the practical needs of your business.</p>
            <p>Based in Auckland, New Zealand, with factories in Auckland and Brazil, we combine creative thinking with hands-on delivery for clients around the world.</p>
            <Link href="/products" className="pb-about-text-link">Explore what we create <ArrowUpRight size={20} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
      <figure className="pb-about-workshop">
        <SceneImage name="workshop" alt="Concept illustration of an entertainment design workshop, from ideas and materials to playful structures." sizes="100vw" className="pb-about-workshop__image" />
        <figcaption className="pb-container"><span>Think it. Design it. Build it.</span><span className="pb-about-workshop__caption"><small>Design concept illustration</small></span></figcaption>
      </figure>
      <section className="pb-section pb-about-team" aria-labelledby="pb-about-team-title">
        <div className="pb-container">
          <div className="pb-about-section-heading pb-about-section-heading--split"><div><p className="pb-eyebrow">Meet the people</p><h2 id="pb-about-team-title" className="pb-title">The minds<br /><span>behind the play.</span></h2></div><p>A shared passion for design, construction and better entertainment experiences. Meet the people helping shape what comes next.</p></div>
          <div className="pb-about-team__grid">
            {team.map((person) => (<article key={person.name} className="pb-about-team__person"><div className="pb-about-team__portrait"><Image src={person.image} alt={person.name} width={440} height={440} sizes="(max-width: 599px) 80vw, (max-width: 1023px) 42vw, 22vw" /></div><h3>{person.name}</h3><p>{person.role}</p></article>))}
          </div>
        </div>
      </section>
      <section className="pb-section pb-paper pb-about-partners" aria-labelledby="pb-about-partners-title">
        <div className="pb-container">
          <div className="pb-about-section-heading pb-about-section-heading--split">
            <div><p className="pb-eyebrow">Working together</p><h2 id="pb-about-partners-title" className="pb-title">Our <span>partners.</span></h2></div>
            <p>We bring together expertise in technology, interiors and racing simulation to create solutions around each project.</p>
          </div>
          <div className="pb-about-partners__grid">
            {partners.map((partner, index) => <article key={partner.name}><span className="pb-about-partners__number" aria-hidden="true">0{index + 1}</span><h3>{partner.name}</h3><p>{partner.description}</p></article>)}
          </div>
        </div>
      </section>
      <section className="pb-section pb-about-purpose pb-dark" aria-labelledby="pb-about-purpose-title">
        <div className="pb-container">
          <div className="pb-about-section-heading"><p className="pb-eyebrow">What drives us</p><h2 id="pb-about-purpose-title" className="pb-title">Purpose behind<br />every <span>experience.</span></h2></div>
          <div className="pb-about-purpose__grid">
            <article><span className="pb-about-purpose__label">01 / Our mission</span><h3>Create joy.<br />Build opportunity.</h3><p>To deliver innovative, high-quality and cost-effective entertainment attractions that captivate guests and support the growth of the businesses behind them.</p></article>
            <article><span className="pb-about-purpose__label">02 / Our vision</span><h3>Keep moving<br />play forward.</h3><p>To become a global leader in entertainment design, combining creativity, engineering and a customer-first approach to create immersive environments for all ages.</p></article>
          </div>
          <div className="pb-about-faith"><span className="pb-about-faith__mark" aria-hidden="true">+</span><div><h3>Faith & purpose</h3><p>We honor God above all. In every idea, design and creation, we seek to glorify Him, recognizing that true inspiration, joy and wisdom come from His hands.</p></div></div>
        </div>
      </section>
      <section className="pb-section pb-paper pb-about-values" aria-labelledby="pb-about-values-title">
        <div className="pb-container">
          <div className="pb-about-section-heading pb-about-section-heading--split"><div><p className="pb-eyebrow">The way we work</p><h2 id="pb-about-values-title" className="pb-title">Good ideas.<br /><span>Strong values.</span></h2></div><p>The principles that guide our decisions, our relationships and every experience we create.</p></div>
          <div className="pb-about-values__grid">
            {values.map((value, index) => (<article key={value.title}><span className="pb-about-values__number" aria-hidden="true">0{index + 1}</span><h3>{value.title}</h3><p>{value.description}</p></article>))}
          </div>
        </div>
      </section>
    </main>
  )
}
