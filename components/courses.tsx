import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Courses() {
  return (
    <section id="courses" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Where Fun Brings Families Together
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
            {"We design experiences that unite generations through joy and imagination. From the first putt to the final laugh, our spaces celebrate what truly matters: family, friendship, and the simple magic of being together.\nEvery swing, every smile, every moment reminds us that happiness multiplies when shared."}
          </p>
        </div>

        {/* Course Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden group">
            <Image
              src="/images/Family03.jpg"
              alt="PuttBrothers Mini Golf Course Interior"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Vibrant Entertainment Spaces</h3>
                <p className="text-white/90">Modern neon-lit venues with colorful interactive elements</p>
              </div>
            </div>
          </div>

          <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden group">
            <Image
              src="/images/Family04.jpg"
              alt="PuttBrothers Mini Golf Lounge Area"
              fill
              className="object-cover object-bottom group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Comfortable Lounge Areas</h3>
                <p className="text-white/90">Stylish seating and social spaces for all ages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
