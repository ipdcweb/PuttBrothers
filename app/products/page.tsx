"use client";

import { TheProcess } from "@/components/the-process";
// import { Machines3DCarousel } from "@/components/machines-3d-carousel";
import { MachinesGallery } from "@/components/machines-gallery";
import { MachinesGalleryMobile } from "@/components/machines-gallery-mobile";
import { GolfSeries } from "@/components/golf-series";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ProductsPage() {
  const isMobile = useIsMobile();

  return (
    <main className="min-h-screen">
      {/* Hero Section - matching About and Contact pages */}
      <section className="relative pt-32 pb-20 px-4 bg-[#41059a]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Our Products
          </h1>
          <div className="w-24 h-1 bg-[#ffcc00] mx-auto"></div>
        </div>
      </section>

      {/* <Machines3DCarousel /> */}

      {/* The Process Section */}
      <TheProcess />

      <GolfSeries />

      {isMobile === undefined ? null : isMobile ? <MachinesGalleryMobile /> : <MachinesGallery />}
    </main>
  );
}
