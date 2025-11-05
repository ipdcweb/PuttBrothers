"use client"

import { Globe, MapPin, Mail, Phone } from "lucide-react"

export function FindRepresentative() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Find a Representative</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* North America Card */}
          <div className="relative bg-card rounded-2xl p-8 shadow-lg border-l-4 border-[#ffcc00] hover:shadow-xl transition-shadow duration-300 px-2.5">
            <div className="flex items-start gap-6">
              <div className="hidden md:flex w-20 h-20 rounded-full items-center justify-center flex-shrink-0 bg-[#ffcc00]">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4 text-primary">North America</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 flex-shrink-0 text-[#ffcc00]" />
                    <a
                      href="mailto:northamerica@puttbrothers.com"
                      className="text-gray-700 hover:text-primary hover:underline transition-colors duration-200"
                    >
                      northamerica@puttbrothers.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global Contact Card */}
          <div className="relative bg-card rounded-2xl p-8 shadow-lg border-l-4 border-[#ffcc00] hover:shadow-xl transition-shadow duration-300 px-2.5">
            <div className="flex items-start gap-6">
              <div className="hidden md:flex w-20 h-20 rounded-full items-center justify-center flex-shrink-0 bg-[#ffcc00]">
                <Globe className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4 text-primary">International</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 flex-shrink-0 text-[#ffcc00]" />
                    <a
                      href="mailto:sales@puttbrothers.com"
                      className="text-gray-700 hover:text-primary hover:underline transition-colors duration-200"
                    >
                      sales@puttbrothers.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 flex-shrink-0 text-[#ffcc00]" />
                    <a
                      href="https://wa.me/64277773322"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-primary hover:underline transition-colors duration-200"
                    >
                      +64 27 777 3322
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
