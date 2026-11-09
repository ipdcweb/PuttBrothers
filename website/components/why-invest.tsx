import { Award, Zap, Globe, TrendingUp, Package, Shield } from "lucide-react"

const benefits = [
  {
    icon: Award,
    title: "Industry-Leading Expertise",
    description:
      "With over 20 years of experience, Putt Brothers has become a global leader in designing and constructing immersive mini golf courses and laser tag arenas. Our team of designers, engineers, and fabricators blend creative design with technical precision, delivering one-of-a-kind attractions built to last and designed to impress.",
  },
  {
    icon: Zap,
    title: "Cutting-Edge Technology",
    description:
      "Every project we build is alive with motion. From rotating windmills, lifting platforms, and motorized roulette tables to dynamic lighting and sound systems in our laser tag arenas, Putt Brothers specializes in engineering interactive experiences that players actually feel. Our mechanical systems are built with durable, commercial-grade components that maximize reliability, minimize maintenance, and keep guests coming back for more.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Headquartered in Auckland, New Zealand, with manufacturing facilities in both New Zealand and Brazil, Putt Brothers delivers world-class attractions to clients around the world. Whether it's a single laser tag arena or a full-scale mini golf course, our team provides end-to-end service from design and build to shipping and installation ensuring every project runs smoothly and stands out anywhere in the world.",
  },
  {
    icon: TrendingUp,
    title: "Proven Return on Investment",
    description:
      "Our attractions are engineered to perform financially and operationally. Both our mini golf courses and laser tag arenas are designed to deliver strong, consistent ROI by driving repeat play, high guest satisfaction, and minimal maintenance downtime. Each build is crafted for long-term durability, giving operators an investment that looks good and runs smoothly year after year.",
  },
  {
    icon: Package,
    title: "Turnkey Solutions",
    description:
      "From the first sketch to the final installation, we handle it all. Putt Brothers provides full-service project delivery like design, engineering, fabrication, shipping, and installation so you can launch your entertainment venue with complete confidence. Every project is backed by ongoing support and clear communication from our team.",
  },
  {
    icon: Shield,
    title: "Safety and Quality",
    description:
      "We don't just meet industry standards. We build beyond them. Every attraction is engineered with premium materials, tested technology, and safety-focused design. Whether it's a high-traffic laser tag arena or a themed mini golf hole packed with motion and lighting, our builds are built to last and built to perform.",
  },
]

export function WhyInvest() {
  return (
    <section id="why-invest" className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#41059a] mb-4">Why Invest in Putt Brothers?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Invest in family entertainment, support your community, and enjoy a strong financial return with Putt
            Brothers' world-class attractions.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="bg-white hover:bg-[#ffcc00] rounded-2xl p-8 shadow-[0_4px_20px_rgba(35,8,74,0.15)] hover:shadow-[0_8px_30px_rgba(35,8,74,0.35)] hover:-translate-y-2 transition-all duration-300 group"
              >
                {/* Icon Circle */}
                <div className="w-20 h-20 rounded-full bg-[#ffcc00] group-hover:bg-[#41059a] flex items-center justify-center mb-6 transition-colors duration-300">
                  <Icon
                    className="w-10 h-10 text-[#41059a] group-hover:text-[#ffcc00] transition-colors duration-300"
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#41059a] mb-4">{benefit.title}</h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
