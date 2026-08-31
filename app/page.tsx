"use client"
import { Features } from "@/components/features"
import { Courses } from "@/components/courses"
import { ProductsShowcase } from "@/components/products-showcase"
import { WhyInvest } from "@/components/why-invest"
import { Team } from "@/components/team"
import { AppSection } from "@/components/app-section"
import { FAQ } from "@/components/faq"
import { Contact } from "@/components/contact"

export default function Home() {
  return (
    <main className="min-h-screen">
      <ProductsShowcase />
      <Features />
      <Courses />
      <WhyInvest />
      <Team />
      <AppSection />
      <FAQ />
      <Contact />
    </main>
  )
}
