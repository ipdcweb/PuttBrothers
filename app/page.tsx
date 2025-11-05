import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Courses } from "@/components/courses"
import { ProductsShowcase } from "@/components/products-showcase"
import { WhyInvest } from "@/components/why-invest"
import { Team } from "@/components/team"
import { AppSection } from "@/components/app-section"
import { GlobalPresence } from "@/components/global-presence"
import { FAQ } from "@/components/faq"
import { FindRepresentative } from "@/components/find-representative"
import { Contact } from "@/components/contact"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <Courses />
      <ProductsShowcase />
      <WhyInvest />
      <Team />
      <AppSection />
      <GlobalPresence />
      <FAQ />
      <FindRepresentative />
      <Contact />
    </main>
  )
}
