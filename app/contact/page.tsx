import type { Metadata } from "next"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { Contact } from "@/components/contact"
import { PreviewNotice } from "@/components/v2/preview-notice"
import { InteractiveWorldMap } from "@/components/interactive-world-map"
import "@/styles/v2-pages.css"

export const metadata: Metadata = {
  title: "Contact Our Team",
  description: "Talk to Putt Brothers about mini golf, Table Golf and your next entertainment project. Connect with our team worldwide or share your venue plans.",
}

export default function ContactPage() {
  return (
    <main id="main-content" className="pb-contact-page">
      <section className="pb-v2 pb-dark pb-contact-intro" aria-labelledby="contact-title">
        <div className="pb-container pb-contact-intro__grid">
          <div>
            <p className="pb-eyebrow">Let’s build something fun</p>
            <h1 id="contact-title" className="pb-title">Great experiences<br />start with a<br /><span>conversation.</span></h1>
            <p className="pb-contact-intro__description">A new venue. A fresh attraction. An idea you can’t stop thinking about. Tell us what you have in mind.</p>
            <a href="#contact" className="pb-button">Tell us about your project <ArrowDown size={18} aria-hidden="true" /></a>
          </div>
          <aside className="pb-contact-direct" aria-label="Contact details">
            <span className="pb-contact-direct__label">The next great idea starts here.</span>
            <div className="pb-contact-direct__item">
              <span>General enquiries</span>
              <a href="mailto:sales@puttbrothers.com">sales@puttbrothers.com <ArrowUpRight size={22} aria-hidden="true" /></a>
            </div>
            <div className="pb-contact-direct__item">
              <span>North America</span>
              <a href="tel:+14699209894">+1 (469) 920-9894 <ArrowUpRight size={22} aria-hidden="true" /></a>
            </div>
            <a href="#worldwide" className="pb-contact-direct__regions">Find your regional team <ArrowDown size={17} aria-hidden="true" /></a>
          </aside>
        </div>
      </section>

      {/* Keep the approved form outside the V2 typography and colour scope. */}
      <PreviewNotice />
      <Contact />

      <section id="worldwide" className="pb-v2 pb-section pb-paper pb-contact-world" aria-labelledby="worldwide-title">
        <div className="pb-container">
          <div className="pb-pages-section-heading">
            <div>
              <p className="pb-eyebrow">Connected around the world</p>
              <h2 id="worldwide-title">Big ideas.<br />No borders.</h2>
            </div>
            <p>Wherever you’re planning your next project, let’s talk. Select your region on the map to connect with the right team.</p>
          </div>
          <div className="pb-contact-world__map">
            <InteractiveWorldMap />
          </div>
        </div>
      </section>
    </main>
  )
}
