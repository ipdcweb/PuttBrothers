import Image from "next/image"

const teamMembers = [
  {
    name: "LUIZ TONSIC",
    title: "Chief Executive Officer",
    image: "/images/directors/Eduardo.png",
    bio: [
      "Luiz Tonsic is a designer, builder, and entrepreneur driven by the challenge of turning creative ideas into real-world experiences. With a background in interior design and 3D modeling, Luiz has led projects across sectors from residential and retail to large-scale entertainment and public spaces.",
      "As CEO of Putt Brothers, Luiz combines creativity with practical execution—transforming imagination into innovative, functional, and profitable attractions. A serial entrepreneur and active member of several business networks, he's passionate about pushing boundaries, developing new ventures, and creating design solutions that inspire both clients and guests alike.",
    ],
  },
  {
    name: "DOUGLAS TONSIC",
    title: "Chief Operating Officer",
    image: "/images/directors/Douglas.png",
    bio: [
      "Douglas Tonsic brings extensive experience in operations, logistics, and project management across the design and construction industries. With a diverse background in home construction, interior design, and large-scale fit-outs, Douglas has successfully delivered complex projects for residential developments, and entertainment venues across New Zealand and Brazil.",
      "As COO of Putt Brothers, Douglas oversees production, quality assurance, and global logistics, ensuring each project is executed on time, within budget, and to the highest standards. His ability to blend technical expertise with a strategic approach to planning and sustainability—driving operational excellence and long-term value.",
    ],
  },
  {
    name: "JOAO NASCIMENTO",
    title: "Chief Strategy Officer",
    image: "/images/directors/John.png",
    bio: [
      "João Nascimento brings a strategic and analytical approach to every aspect of Putt Brothers' operations. With a background in business administration and over a decade of experience in construction and project management, Joao excels at transforming complex operational challenges into clear, scalable systems.",
      "As CSO of Putt Brothers, João focuses on business development, long-term planning, and process optimization across all aspects of the company. His strategic vision aligns design, production, operations, and logistics under a unified growth strategy. His ability to balance data-driven insight with practical leadership has helped guide large-scale builds from concept to completion, while driving efficiency, profitability, and consistent quality.",
    ],
  },
]

export function Team() {
  return (
    <section className="py-24 px-4 md:px-8" style={{ backgroundColor: "#41059a" }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 tracking-tight">MEET OUR TEAM</h2>

        <div className="space-y-16">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-yellow-400 tracking-wide">{member.name}</h3>
                </div>

                <p className="text-lg text-white font-semibold mb-4">{member.title}</p>

                <div className="space-y-4">
                  {member.bio.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-white/90 leading-relaxed text-base">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
