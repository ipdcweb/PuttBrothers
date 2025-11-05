import MissionVisionValues from "@/components/mission-vision-values"

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">About US</h1>
          <div className="w-24 h-1 bg-[#ffcc00] mx-auto"></div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              At Putt Brothers, we are passionate about bringing excitement and innovation to life through the design
              and construction of Mini Golf holes and Laser Tag arenas. With over 20 years of industry experience, we
              offer an extensive range of services designed to create engaging and profitable entertainment attractions
              that captivate audiences of all ages. From the initial concept to the final installation, we partner with
              our clients every step of the way, providing a seamless, turnkey solution.
            </p>

            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              In an industry that's constantly evolving with cutting-edge innovations, we understand the unique
              challenges faced by business owners striving to deliver top-quality entertainment while managing costs.
              That's why our mission is to provide cost-effective attractions that offer a substantial return on
              investment for our clients.
            </p>

            <p className="text-gray-700 leading-relaxed text-lg">
              Our team of seasoned designers, engineers, and consultants work collaboratively to transform your vision
              into reality. Based in Auckland, New Zealand, and with factories in both Auckland and Brazil, we are
              equipped to serve clients on a global scale. At Putt Brothers, we believe in building a better future
              together by delivering high-quality, innovative entertainment attractions that inspire joy and drive
              business success.
            </p>
          </div>
        </div>
      </section>

      <MissionVisionValues />
    </main>
  )
}
