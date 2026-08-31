"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

export function GolfSeries() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [catalogUrl, setCatalogUrl] = useState("")

  const series = [
    {
      title: "THE PRO SERIES",
      image: "/images/CourseHoles/THE_HOM_RUN.png",
      description:
        "We analyzed the most popular and competitive mini golf layouts and distilled them into their purest form. By focusing on proven, high-playability designs, we've created a collection that is not only a favorite among players but is also engineered for streamlined production. The result is The Pro Series: a premium, skill-based experience at a price point that delivers an unbeatable return on investment.",
      catalogUrl: "/catalogues/minigolf-latest.pdf",
    },
    {
      title: "TABLE GOLF",
      image: "/images/TableGolf/SOCCER.png",
      description:
        "Our Table Golf Series revolutionizes traditional entertainment by merging the strategic gameplay of billiards with the imaginative course design of mini golf. This innovative concept blends the format of a pool table with the creativity of mini golf, offering a unique and engaging gameplay experience like no other.",
      catalogUrl: "/catalogues/tablegolf-latest.pdf",
    },
  ]

  const openCatalog = (url: string) => {
    setCatalogUrl(url)
    setIsModalOpen(true)
  }

  return (
    <section className="py-20 px-4 lg:px-8 bg-[#41059a]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Golf Series</h2>
          <div className="w-24 h-1 bg-[#ffcc00] mx-auto"></div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {series.map((item) => (
            <div
              key={item.title}
              className="group bg-white hover:bg-[#ffcc00] border-4 border-[#ffcc00] hover:border-[#41059a] rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(65,5,154,0.35)] hover:-translate-y-2 transition-all duration-300 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-64 md:h-80 overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl md:text-3xl font-bold text-[#41059a] group-hover:text-white mb-4 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-700 group-hover:text-[#41059a] leading-relaxed transition-colors duration-300 mb-6 flex-1">
                  {item.description}
                </p>

                <Button
                  onClick={() => openCatalog(item.catalogUrl)}
                  className="w-full bg-[#ffcc00] hover:bg-[#41059a] text-[#41059a] hover:text-[#ffcc00] font-bold text-lg py-6 rounded-lg transition-all duration-300 hover:shadow-lg cursor-pointer"
                >
                  View Online Catalogue
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!max-w-[90vw] max-h-[90vh] w-[100vw] h-[90vh] p-0 gap-0 !translate-x-[-50%] !translate-y-[-50%] overflow-hidden bg-[#41059a]">
          <DialogTitle className="sr-only">Online Catalog</DialogTitle>
          <iframe src={catalogUrl} className="w-full h-full rounded-lg mt-12" title="Online Catalog" allow="fullscreen" />
        </DialogContent>
      </Dialog>
    </section>
  )
}
