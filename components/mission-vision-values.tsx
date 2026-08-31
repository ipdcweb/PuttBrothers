"use client"

import { useEffect, useRef } from "react"
import { Target, Eye, Heart, Lightbulb, Users, Handshake, Shield } from "lucide-react"

export default function MissionVisionValues() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const missionRef = useRef<HTMLDivElement>(null)
  const visionRef = useRef<HTMLDivElement>(null)
  const valuesRef = useRef<HTMLDivElement>(null)
  const featuredCardRef = useRef<HTMLDivElement>(null)
  const valueCardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    // Dynamic import of GSAP to avoid SSR issues
    const loadGSAP = async () => {
      const { gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")

      gsap.registerPlugin(ScrollTrigger)

      // Mission animation
      if (missionRef.current) {
        gsap.fromTo(
          missionRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: missionRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }

      // Vision animation
      if (visionRef.current) {
        gsap.fromTo(
          visionRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: visionRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }

      // Values header animation
      if (valuesRef.current) {
        gsap.fromTo(
          valuesRef.current,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            scrollTrigger: {
              trigger: valuesRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }

      if (featuredCardRef.current) {
        gsap.fromTo(
          featuredCardRef.current,
          { opacity: 0, scale: 0.9, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: featuredCardRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }

      // Values cards stagger animation
      if (valueCardsRef.current.length > 0) {
        gsap.fromTo(
          valueCardsRef.current,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: valueCardsRef.current[0],
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        )
      }
    }

    loadGSAP()
  }, [])

  const values = [
    {
      icon: Heart,
      title: "Quality",
      description:
        "We prioritize the highest standards in all aspects of our work, from design and fabrication to installation and support, ensuring our products are built to last and exceed expectations.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We embrace new ideas and cutting-edge technologies to stay ahead in a constantly evolving industry, delivering unique and captivating experiences.",
    },
    {
      icon: Users,
      title: "Customer Satisfaction",
      description:
        "Our clients' success is our success. We are committed to understanding their needs and providing personalized, reliable service throughout every project.",
    },
    {
      icon: Handshake,
      title: "Collaboration",
      description:
        "We believe in the power of teamwork, both within our company and with our clients, fostering an environment of open communication and mutual respect.",
    },
    {
      icon: Shield,
      title: "Integrity",
      description:
        "We conduct our business with honesty and transparency, building trust with our clients and partners.",
    },
    {
      emoji: "🌿",
      title: "Sustainability",
      description:
        "We are committed to creating joy responsibly designing experiences that respect the planet and its resources. Through mindful innovation, we ensure that fun today never costs the happiness of tomorrow.",
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Mission */}
        <div
          ref={missionRef}
          className="mb-20 bg-white rounded-2xl p-8 md:p-12 shadow-lg border-l-8 border-[#ffcc00] px-2.5 py-5"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#ffcc00] flex items-center justify-center">
              <Target className="w-8 h-8 text-[#41059a]" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#41059a] mb-4 text-primary">Our Mission</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Our mission is to deliver innovative, cost-effective, and high-quality entertainment attractions that
                inspire and captivate audiences worldwide. We are dedicated to providing exceptional mini golf and laser
                tag experiences that drive strong returns on investment for our clients, ensuring that they can offer
                memorable and engaging activities for their customers.
              </p>
            </div>
          </div>
        </div>

        {/* Vision */}
        <div
          ref={visionRef}
          className="mb-20 bg-white rounded-2xl p-8 md:p-12 shadow-lg border-r-8 border-[#41059a] py-5 px-2.5"
        >
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#41059a] flex items-center justify-center">
              <Eye className="w-8 h-8 text-[#ffcc00]" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#41059a] mb-4 text-primary">Our Vision</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Our vision is to be the global leader in the family entertainment industry, recognized for our
                creativity, engineering excellence, and customer-centric approach. We aim to continually push the
                boundaries of what's possible in entertainment design and technology, creating immersive environments
                that delight and excite people of all ages.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <div ref={valuesRef} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#41059a] mb-4 text-primary">Our Values</h2>
            <div className="w-24 h-1 bg-[#ffcc00] mx-auto"></div>
          </div>

          <div ref={featuredCardRef} className="max-w-3xl mx-auto mb-12">
            <div className="bg-gradient-to-br from-[#41059a] to-[#5a1a8b] rounded-2xl p-8 md:p-10 shadow-2xl border-4 border-[#ffcc00] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffcc00] opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#ffcc00] opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="text-6xl">✨</div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-[#ffcc00] mb-4 text-center">Faith & Purpose</h3>
                <p className="text-white text-lg leading-relaxed text-center">
                  We honor God above all. In every idea, design, and creation, we seek to glorify Him recognizing that
                  true inspiration, joy, and wisdom come from His hands.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div
                  key={value.title}
                  ref={(el) => {
                    if (el) valueCardsRef.current[index] = el
                  }}
                  className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[#ffcc00]"
                >
                  <div className="w-14 h-14 rounded-full bg-[#41059a] group-hover:bg-[#ffcc00] flex items-center justify-center mb-4 transition-colors duration-300">
                    {value.emoji ? (
                      <span className="text-3xl">{value.emoji}</span>
                    ) : (
                      Icon && (
                        <Icon className="w-7 h-7 text-[#ffcc00] group-hover:text-[#41059a] transition-colors duration-300" />
                      )
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#41059a] mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
