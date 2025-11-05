import { Contact } from "@/components/contact"
import { FindRepresentative } from "@/components/find-representative"

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Contact Us</h1>
          <div className="w-24 h-1 bg-[#ffcc00] mx-auto"></div>
        </div>
      </section>

      <FindRepresentative />

      {/* Contact Form Section */}
      <Contact />
    </main>
  )
}
