import Link from "next/link"
import { ArrowUpRight, Flag, GlassWater, Target, PencilRuler, Cog, Hammer, Network, HeartHandshake, Users, Clock3, TrendingUp, Heart } from "lucide-react"
import { SceneImage } from "@/components/v2/scene-image"
import { ScrollHero } from "@/components/v2/scroll-hero"
import { ClientStories } from "@/components/v2/client-stories"
import { BorderGlowPanel } from "@/components/ui/border-glow-panel"
import { Contact } from "@/components/contact"
import { PreviewNotice } from "@/components/v2/preview-notice"

const experiences = [
  { name: "minigolf" as const, icon: Flag, title: "Custom mini golf", text: "Immersive courses. Unexpected challenges. A little friendly competition that brings everyone together.", href: "/products", link: "Explore the collection" },
  { name: "hospitality" as const, icon: GlassWater, title: "Interiors & fit-outs", text: "Bars, lounges and social spaces that make the whole venue part of the experience.", href: "/contact", link: "Talk about your space" },
  { name: "interactive" as const, icon: Target, title: "Interactive experiences", text: "Physical play meets digital possibility. Simulators and integrated technology that keep people engaged.", href: "/contact", link: "Explore the possibilities" },
]
const journey = [
  { icon: PencilRuler, title: "Imagine & design", text: "Your vision, your audience, your space. We shape a concept around what makes them unique." },
  { icon: Cog, title: "Engineer", text: "Layouts, materials and technical detail turn an ambitious idea into a practical plan." },
  { icon: Hammer, title: "Build", text: "Our manufacturing team brings the design to life, with care in every detail." },
  { icon: Network, title: "Install & integrate", text: "Attractions, lighting and technology come together as one complete experience." },
  { icon: Flag, title: "Open the doors", text: "From the finishing touches to the first putt, we help you get ready for your guests." },
  { icon: HeartHandshake, title: "Grow together", text: "Ongoing support and a long-term relationship. Opening day is only the beginning." },
]
const benefits = [
  { icon: Users, title: "Bring people in", text: "Give guests something worth making plans for." },
  { icon: Clock3, title: "Make the stay matter", text: "Connect play, food and social moments in one place." },
  { icon: TrendingUp, title: "Create opportunity", text: "Build an experience around the goals of your business." },
  { icon: Heart, title: "Give them a reason to return", text: "Make memories that last beyond the final game." },
]
const questions = [
  { q: "What are the main benefits of investing in your mini golf machines and laser tag arenas?", a: "Investing in Putt Brothers' mini golf machines and laser tag arenas offers numerous benefits, including high-quality, innovative designs that attract and engage customers. Our attractions are built with premium materials and cutting-edge technology, ensuring durability and a unique experience. Additionally, our attractions provide a strong return on investment (ROI) due to their ability to draw in guests and enhance revenue." },
  { q: "How does the design and installation process for mini golf courses and laser tag arenas work?", a: "The design and installation process begins with collaborating with our experienced design team to create a customized layout that fits your space and vision. Once the design is finalized, our skilled fabricators build the attraction, and we provide regular updates on progress. To ensure a smooth and efficient setup that aligns with our factory guidelines, installations must be handled by our certified installation team. This ensures that your attraction is set up correctly, providing the best possible experience for you and your customers." },
  { q: "What is the typical timeline for completing a project from concept to final installation?", a: "The timeline for completing a project varies depending on its complexity, but typically, it takes several months from the initial concept to final installation. This includes design, fabrication, and installation phases. We work closely with clients to ensure timely progress and keep you informed throughout each stage of the project." },
  { q: "What kind of support and maintenance is available after installation?", a: "After installation, Putt Brothers provides ongoing operational support and education to ensure your attraction performs optimally. This includes troubleshooting, maintenance tips, and access to our support team for any questions or issues that may arise. Our goal is to ensure that your investment remains a successful and enjoyable attraction for years to come." },
  { q: "How do you ensure the quality and safety of the attractions you manufacture?", a: "Quality and safety are top priorities at Putt Brothers. We use high-quality materials and adhere to strict manufacturing standards. Our designs are tested for durability and safety, and we follow rigorous safety protocols throughout the production and installation processes. We also ensure that all attractions comply with relevant safety regulations and industry standards." },
  { q: "What is the expected return on investment (ROI) for mini golf and laser tag projects?", a: "The return on investment for mini golf and laser tag projects can be significant, as these attractions are designed to attract and engage a wide audience. ROI varies based on factors such as location, size, and management, but many of our clients see a strong return due to the high demand and profitability of these entertainment options. We work with clients to maximize their ROI through tailored solutions and strategic planning." },
  { q: "Do you offer customization for projects, and how is it tailored to specific client needs?", a: "Yes, we offer extensive customization for our projects to meet the specific needs and preferences of each client. From unique design elements to tailored features, we work closely with clients to understand their vision and create a customized solution that aligns with their goals. Our team provides guidance and expertise to ensure the final product exceeds expectations and fits seamlessly into your venue." },
]

export default function Home() {
  return (
    <main id="main-content">
      <div className="pb-v2">
        <ScrollHero />
        <div id="after-hero" className="pb-brand-strip" aria-label="Our approach"><span>Imagine.</span><span>Design.</span><span>Build.</span><span>Play.</span><ArrowUpRight aria-hidden="true" /></div>

        <section className="pb-section pb-paper">
          <div className="pb-container pb-editorial-grid"><div><p className="pb-eyebrow">01 / A bigger game</p><h2 className="pb-title">We don&apos;t just<br />build attractions.<br /><em>We create<br />experiences.</em></h2></div><div className="pb-editorial-copy"><p className="pb-lead">A great venue is more than the sum of its games.</p><p>It&apos;s the anticipation at the door. The first friendly challenge. The conversations that carry on long after the last putt.</p><p>We bring mini golf, hospitality and interactive play together to turn your space into a destination, with one team beside you, from the first idea to opening day and beyond.</p><Link className="pb-text-link" href="/about">Meet Putt Brothers <ArrowUpRight aria-hidden="true" /></Link></div></div>
        </section>

        <section id="experiences" className="pb-section pb-dark">
          <div className="pb-container"><div className="pb-section-heading"><div><p className="pb-eyebrow">02 / What we create</p><h2 className="pb-title">One vision.<br /><em>So many ways to play.</em></h2></div><p>Distinctive attractions. Complete environments.<br />Designed to work beautifully together.</p></div>
            <div className="pb-experience-grid">{experiences.map(({ name, icon: Icon, title, text, href, link }, index) => <article className="pb-experience" key={name}><div className="pb-experience__visual"><SceneImage name={name} alt={`Concept imagery: ${title.toLowerCase()}`} sizes="(min-width: 900px) 33vw, 100vw" /><span className="pb-experience__number">0{index + 1}</span><span className="pb-experience__icon"><Icon aria-hidden="true" /></span></div><div className="pb-experience__copy"><h3>{title}</h3><p>{text}</p><Link href={href} className="pb-text-link">{link}<ArrowUpRight aria-hidden="true" /></Link></div></article>)}</div>
          </div>
        </section>

        <ClientStories />

        <section className="pb-section pb-paper"><div className="pb-container pb-turnkey-grid"><div className="pb-turnkey__visual"><SceneImage name="workshop" alt="Concept of the craft and collaboration behind an entertainment attraction" /><span className="pb-turnkey__label">From the first sketch<br /><strong>to the first smile.</strong></span></div><div className="pb-turnkey__copy"><p className="pb-eyebrow">04 / All together</p><h2 className="pb-title">You bring<br />the space.<br /><em>We bring it<br />to life.</em></h2><p>One connected journey. Designers, engineers and makers working towards the same goal: an extraordinary experience for your guests.</p><ul className="pb-capability-list"><li>Concept & experience design</li><li>Engineering & manufacturing</li><li>Attractions & themed environments</li><li>Lighting & technology integration</li><li>Installation & ongoing support</li></ul><Link href="/contact" className="pb-button pb-button--dark">Tell us about your project <ArrowUpRight aria-hidden="true" /></Link></div></div></section>

        <section className="pb-section pb-journey"><div className="pb-container"><div className="pb-section-heading"><div><p className="pb-eyebrow">05 / From first hello to opening day</p><h2 className="pb-title">Your vision.<br />One shared journey.</h2></div><p>Clear steps. Connected people.<br />A partner for what comes next.</p></div><ol className="pb-journey-grid">{journey.map(({ icon: Icon, title, text }, index) => <li key={title}><div className="pb-journey__top"><Icon aria-hidden="true" /><span>0{index + 1}</span></div><h3>{title}</h3><p>{text}</p></li>)}</ol><Link href="/layout-planner" className="pb-text-link">Already have a space? Explore the layout planner <ArrowUpRight aria-hidden="true" /></Link></div></section>

        <section className="pb-section pb-dark pb-opportunity"><div className="pb-container"><p className="pb-eyebrow">06 / Good for people. Great for business.</p><h2 className="pb-title">People play.<br /><em>Places thrive.</em></h2><p className="pb-opportunity__intro">Create somewhere people choose to spend their time and somewhere your business can grow.</p><div className="pb-benefit-grid">{benefits.map(({ icon: Icon, title, text }) => <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

        <section className="pb-section pb-paper"><div className="pb-container pb-faq-grid"><div><p className="pb-eyebrow">07 / Let&apos;s talk possibilities</p><h2 className="pb-title">Big ideas.<br /><em>Good questions.</em></h2><p>Here&apos;s a little more about working together.</p><Link href="/contact" className="pb-text-link">Ask us anything <ArrowUpRight aria-hidden="true" /></Link></div><BorderGlowPanel className="pb-faq-board" contentClassName="pb-faq-board__content">{questions.map(({ q, a }) => <details key={q} className="pb-question"><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</BorderGlowPanel></div></section>
      </div>
      {/* The unchanged V1 form sits outside the V2 typography scope. */}
      <PreviewNotice />
      <Contact />
    </main>
  )
}
