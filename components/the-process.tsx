import { Lightbulb, Hammer, Wrench, HeadphonesIcon } from "lucide-react"

export function TheProcess() {
  const steps = [
    {
      number: "01",
      title: "Design",
      description:
        "Collaborate with our visionary design team to transform your space into the ultimate mini golf course, laser tag arena, or family entertainment center. Our innovative approach ensures that you'll see your dream venue come to life before a single nail is hammered.",
      icon: Lightbulb,
    },
    {
      number: "02",
      title: "Fabricate",
      description:
        "Once we've perfected the design, our skilled fabricators get to work, meticulously crafting your course or arena with precision and care. Stay in the loop with regular updates, witnessing your project evolve every step of the way.",
      icon: Hammer,
    },
    {
      number: "03",
      title: "Install",
      description:
        "Our designs are engineered for ease and efficiency. To ensure everything is perfectly in place and aligned with factory recommendations, installations must be completed by a certified Putt Brothers installer or one of our expert team members. This guarantees the safety and reliability of your attraction, preventing any potential issues from improper installation. We want to make sure you have the best possible experience with our products.",
      icon: Wrench,
    },
    {
      number: "04",
      title: "Ongoing Support",
      description:
        "Your success is our priority. After your attraction is up and running, we provide continuous operational support and education, ensuring your venue thrives and reaches its full potential.",
      icon: HeadphonesIcon,
    },
  ]

  return (
    <section className="py-20 px-4 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#41059a] mb-6">The Process</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions or need more information? Reach out to us today. We're here to help you plan your next
            mini-golf adventure.
          </p>
        </div>

        {/* Process Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="bg-white hover:bg-[#ffcc00] rounded-lg p-8 shadow-lg hover:shadow-[0_8px_30px_rgba(65,5,154,0.35)] hover:-translate-y-2 transition-all duration-300 group"
              >
                {/* Number and Icon */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#ffcc00] group-hover:bg-[#41059a] flex items-center justify-center transition-colors duration-300">
                    <Icon className="w-8 h-8 text-[#41059a] group-hover:text-[#ffcc00] transition-colors duration-300" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-[#ffcc00] tracking-wider">STEP {step.number}</span>
                    <h3 className="text-2xl font-bold text-[#41059a] mt-1">{step.title}</h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
