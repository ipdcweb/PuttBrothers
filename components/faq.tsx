"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

const faqs = [
  {
    question: "What are the main benefits of investing in your mini golf machines and laser tag arenas?",
    answer:
      "Investing in Putt Brothers' mini golf machines and laser tag arenas offers numerous benefits, including high-quality, innovative designs that attract and engage customers. Our attractions are built with premium materials and cutting-edge technology, ensuring durability and a unique experience. Additionally, our attractions provide a strong return on investment (ROI) due to their ability to draw in guests and enhance revenue.",
  },
  {
    question: "How does the design and installation process for mini golf courses and laser tag arenas work?",
    answer:
      "The design and installation process begins with collaborating with our experienced design team to create a customized layout that fits your space and vision. Once the design is finalized, our skilled fabricators build the attraction, and we provide regular updates on progress. To ensure a smooth and efficient setup that aligns with our factory guidelines, installations must be handled by our certified installation team. This ensures that your attraction is set up correctly, providing the best possible experience for you and your customers.",
  },
  {
    question: "What is the typical timeline for completing a project from concept to final installation?",
    answer:
      "The timeline for completing a project varies depending on its complexity, but typically, it takes several months from the initial concept to final installation. This includes design, fabrication, and installation phases. We work closely with clients to ensure timely progress and keep you informed throughout each stage of the project.",
  },
  {
    question: "What kind of support and maintenance is available after installation?",
    answer:
      "After installation, Putt Brothers provides ongoing operational support and education to ensure your attraction performs optimally. This includes troubleshooting, maintenance tips, and access to our support team for any questions or issues that may arise. Our goal is to ensure that your investment remains a successful and enjoyable attraction for years to come.",
  },
  {
    question: "How do you ensure the quality and safety of the attractions you manufacture?",
    answer:
      "Quality and safety are top priorities at Putt Brothers. We use high-quality materials and adhere to strict manufacturing standards. Our designs are tested for durability and safety, and we follow rigorous safety protocols throughout the production and installation processes. We also ensure that all attractions comply with relevant safety regulations and industry standards.",
  },
  {
    question: "What is the expected return on investment (ROI) for mini golf and laser tag projects?",
    answer:
      "The return on investment for mini golf and laser tag projects can be significant, as these attractions are designed to attract and engage a wide audience. ROI varies based on factors such as location, size, and management, but many of our clients see a strong return due to the high demand and profitability of these entertainment options. We work with clients to maximize their ROI through tailored solutions and strategic planning.",
  },
  {
    question: "Do you offer customization for projects, and how is it tailored to specific client needs?",
    answer:
      "Yes, we offer extensive customization for our projects to meet the specific needs and preferences of each client. From unique design elements to tailored features, we work closely with clients to understand their vision and create a customized solution that aligns with their goals. Our team provides guidance and expertise to ensure the final product exceeds expectations and fits seamlessly into your venue.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-3 text-[#41059a]">FAQ</h2>
        <p className="text-lg md:text-xl text-center mb-12 text-gray-600">Frequently Asked Questions</p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
              style={{ backgroundColor: "#41059a" }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-all duration-300 hover:bg-white/5 cursor-pointer"
              >
                <span className="text-white font-medium text-base md:text-lg pr-4 leading-relaxed">{faq.question}</span>
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{ backgroundColor: "#ffcc00" }}
                >
                  {openIndex === index ? (
                    <X className="w-5 h-5 text-[#41059a] transition-transform duration-300" />
                  ) : (
                    <Plus className="w-5 h-5 text-[#41059a] transition-transform duration-300" />
                  )}
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 pt-2">
                  <p className="text-base md:text-lg leading-relaxed" style={{ color: "#ffcc00" }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
