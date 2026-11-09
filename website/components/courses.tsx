"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export function Courses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalogUrl, setCatalogUrl] = useState("");

  const courses = [
    {
      title: "THE PRO SERIES",
      image: "/images/PBGifs/WINDMILL_50.gif",
      description:
        "We analyzed the most popular and competitive mini golf layouts and distilled them into their purest form. By focusing on proven, high-playability designs, we've created a collection that is not only a favorite among players but is also engineered for streamlined production. The result is The Pro Series: a premium, skill-based experience at a price point that delivers an unbeatable return on investment.",
      catalogUrl: "/catalogues/minigolf-latest.pdf",
    },
    {
      title: "TABLE GOLF",
      image: "/images/PBGifs/BRIDGE_50.gif",
      description:
        "Our Table Golf Series revolutionizes traditional entertainment by merging the strategic gameplay of billiards with the imaginative course design of mini golf. This innovative concept blends the format of a pool table with the creativity of mini golf, offering a unique and engaging gameplay experience like no other.",
      catalogUrl: "/catalogues/tablegolf-latest.pdf",
    },
  ];

  const openCatalog = (url: string) => {
    setCatalogUrl(url);
    setIsModalOpen(true);
  };

  return (
    <section id="courses" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance text-[rgba(65,5,154,1)]">
            Where Fun Becomes a Smart Investment
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
            {
              "We create experiences that bring people together and opportunities that bring value to your business.\nAt Putt Brothers, every course, every game, and every smile is carefully designed to turn family fun into a profitable venture.\nOur interactive mini-golf machines and table games combine cutting-edge design, durability, and joy transforming any space into a destination for entertainment and growth.\nJoin the movement where innovation meets fun, and discover how investing in play can bring lasting returns."
            }
          </p>
        </div>

        {/* Course Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {courses.map((course) => (
            <div
              key={course.title}
              className="relative rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#41059a]/20 hover:border-4 hover:border-[#FFD700] bg-[#ffcc00] hover:bg-[#41059a] flex flex-col"
            >
              <div className="relative h-80 lg:h-96 bg-white">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={`PuttBrothers ${course.title} Mini Golf Course`}
                  className="w-full h-full object-contain object-center"
                />
                <h3 className="absolute top-4 left-4 text-2xl font-bold text-[#41059a] group-hover:text-white transition-colors duration-300">
                  {course.title}
                </h3>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[#41059a] group-hover:text-white text-base leading-relaxed transition-colors duration-300 mb-6 flex-1">
                  {course.description}
                </p>
                <Button
                  onClick={() => openCatalog(course.catalogUrl)}
                  className="w-full bg-[#41059a] hover:bg-[#ffcc00] text-white hover:text-[#41059a] group-hover:bg-[#ffcc00] group-hover:text-[#41059a] font-bold text-lg py-6 rounded-lg transition-all duration-300 hover:shadow-lg cursor-pointer"
                >
                  View Online Catalogue
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="!max-w-[90vw] max-h-[90vh] w-[100vw] h-[90vh] p-0 gap-0 !translate-x-[-50%] !translate-y-[-50%] overflow-hidden">
          <DialogTitle className="sr-only">Online Catalog</DialogTitle>
          <iframe
            src={catalogUrl}
            className="w-full h-full rounded-lg"
            title="Online Catalog"
            allow="fullscreen"
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
