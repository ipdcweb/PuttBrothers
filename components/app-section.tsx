"use client"

import { useState } from "react"
import { Facebook, Instagram, Linkedin, ChevronDown } from "lucide-react"
import Image from "next/image"
import { AppPreviewCarousel } from "./app-preview-carousel"

export function AppSection() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"app" | "game" | "automation">("app")

  return (
    <section id="app" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">What's Coming Next</h2>

          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
            {
              "🚀 At Putt Brothers, we’re always innovating to make every visit even more exciting. \nStay tuned for the next wave of fun, technology, and creativity! ⚡🎮⛳"
            }
          </p>

          <div className="mt-8">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#41059a] hover:bg-[#41059a]/90 text-white font-semibold rounded-lg transition-all duration-300 group"
            >
              <span>Explore What's Coming</span>
              <ChevronDown
                className={`h-5 w-5 text-[#ffcc00] transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isExpanded ? "max-h-[3000px] opacity-100 mt-8" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#ffcc00]">
              {/* Tabs Navigation */}
              <div className="flex justify-center gap-4 mb-8 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("app")}
                  className={`py-3 font-semibold transition-all duration-300 relative px-2.5 ${
                    activeTab === "app" ? "text-[#41059a]" : "text-gray-500 hover:text-[#41059a]"
                  }`}
                >
                  App
                  {activeTab === "app" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ffcc00] rounded-t-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("game")}
                  className={`py-3 font-semibold transition-all duration-300 relative px-2.5 ${
                    activeTab === "game" ? "text-[#41059a]" : "text-gray-500 hover:text-[#41059a]"
                  }`}
                >
                  Game
                  {activeTab === "game" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ffcc00] rounded-t-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("automation")}
                  className={`py-3 font-semibold transition-all duration-300 relative px-2.5 ${
                    activeTab === "automation" ? "text-[#41059a]" : "text-gray-500 hover:text-[#41059a]"
                  }`}
                >
                  Automation
                  {activeTab === "automation" && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ffcc00] rounded-t-full" />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="relative min-h-[400px]">
                {activeTab === "app" && (
                  <div className="w-full animate-in fade-in duration-500">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                      {/* Left Column - Text Content */}
                      <div className="text-left space-y-6">
                        <div>
                          <h3 className="text-3xl font-bold text-[#41059a] mb-4">
                            Experience Mini Golf Like Never Before!
                          </h3>
                        </div>

                        <p className="text-base text-gray-700 leading-relaxed">
                          Our upcoming app combines innovation, competition, and fun all in one connected experience.
                          From the moment you log in with Apple or Google, everything is designed to make your journey
                          simple, interactive, and exciting.
                        </p>

                        <p className="text-base text-gray-700 leading-relaxed">
                          Create your player profile with avatars, track your scores, and form your own teams with
                          friends. Choose where to play through a smart interactive map or dropdown filters, discovering
                          stores near you in seconds. Once you're in, select your game machines, enter your scores, and
                          watch your results appear instantly on a live leaderboard filled with stats, rankings, and
                          achievements. 🏆
                        </p>

                        <p className="text-base text-gray-700 leading-relaxed">
                          Every round becomes more thrilling with real-time notifications challenging your friends,
                          celebrate new records, or get an alert when someone beats your score! Share your victories
                          directly to social media, join events, and see where you stand among players across different
                          venues.
                        </p>

                        

                        
                      </div>

                      {/* Right Column - Minimal Carousel */}
                      <div className="lg:sticky lg:top-8">
                        <AppPreviewCarousel />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "game" && (
                  <div className="w-full animate-in fade-in duration-500">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                      {/* Left Column - Text Content */}
                      <div className="text-left space-y-6">
                        <div>
                          <h3 className="text-3xl font-bold text-[#41059a] mb-4">Bringing the Game to Life! 🎮📱✨</h3>
                        </div>

                        <p className="text-base text-gray-700 leading-relaxed">
                          Our upcoming Putt Brothers Web Game brings the thrill of mini golf straight to your browser,
                          no downloads, no limits. Built on WebGL technology, it combines smooth performance with
                          realistic visuals and physics, delivering an interactive and fun experience that feels just
                          like the real thing.
                        </p>

                        <p className="text-base text-gray-700 leading-relaxed">
                          Players can choose their course, adjust shot strength and direction, and compete in exciting
                          matches featuring dynamic obstacles, scoring multipliers, and live leaderboards. Each round is
                          enhanced with immersive visual and sound effects, making every play both challenging and
                          rewarding. 🎯
                        </p>

                        <p className="text-base text-gray-700 leading-relaxed">
                          Designed for accessibility and engagement, the game features modular stages for future
                          updates, dynamic in-game banners that keep content fresh, and full online leaderboard
                          integration so you can track your scores and challenge your friends, all directly through the
                          Putt Brothers website. 🚀🖥️⛳
                        </p>
                      </div>

                      {/* Right Column - Game Image */}
                      <div className="lg:sticky lg:top-8 flex items-center justify-center bg-transparent">
                        <div className="relative w-full max-w-md bg-transparent">
                          <Image
                            src="/images/PBGame/Picture1.png"
                            alt="Putt Brothers Web Game Preview"
                            width={600}
                            height={400}
                            className="w-full h-auto rounded-lg"
                            priority
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "automation" && (
                  <div className="w-full animate-in fade-in duration-500">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                      {/* Left Column - Text Content */}
                      <div className="text-left space-y-6">
                        <div>
                          <h3 className="text-3xl font-bold text-[#41059a] mb-4">
                            Smart Automation
                          </h3>
                        </div>

                        <p className="text-base text-gray-700 leading-relaxed">
                          At Putt Brothers, innovation never stops. We’re combining creativity, engineering, and technology to bring our mini golf machines to life transforming each hole into a dynamic, interactive experience. ⚙️✨
                        </p>

                        <p className="text-base text-gray-700 leading-relaxed">
                          Our new automation systems integrate motors, sensors, lights, and sound effects that react in real time to every move the player makes. From glowing paths that light up with each swing to sound effects that respond to the ball’s impact, every moment becomes more exciting and immersive. ⛳💡🎶
                        </p>

                        <p className="text-base text-gray-700 leading-relaxed">
                          These enhancements are modular add-ons, meaning they can be easily installed on existing Putt Brothers machines or included in new ones. Whether now or later, every client can choose how far to take their automation, ensuring flexibility without waiting for a new version. 🚀
                        </p>
                      </div>

                      {/* Right Column - Automation Video */}
                      <div className="lg:sticky lg:top-8 flex items-center justify-center bg-transparent">
                        <div className="relative w-full max-w-md bg-transparent">
                          <video
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BigShow2-waTewFAVQGx6Tjpwq52gPPDW7nEPVp.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-auto rounded-lg shadow-lg"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-16 pt-12 border-t border-border">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              💥 Don't miss out on what's coming next!
            </h3>

            <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
              Follow us on our social media channels to stay updated with every new feature, design, and innovation
              we&#39;re bringing to life.
            </p>

            <p className="text-lg font-semibold text-foreground mb-6">
              👉 Join the journey, be part of the Putt Brothers community on:
            </p>

            <div className="flex items-center justify-center gap-6 flex-wrap">
              <a
                href="https://www.facebook.com/profile.php?id=61551240330686"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-[#41059a] hover:bg-[#41059a]/90 transition-all duration-300 group"
              >
                <Facebook className="h-6 w-6 text-[#ffcc00] group-hover:scale-110 transition-transform" />
                <span className="text-white font-medium">Facebook</span>
              </a>

              <a
                href="https://www.instagram.com/puttbrothersnz/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-[#41059a] hover:bg-[#41059a]/90 transition-all duration-300 group"
              >
                <Instagram className="h-6 w-6 text-[#ffcc00] group-hover:scale-110 transition-transform" />
                <span className="text-white font-medium">Instagram</span>
              </a>

              <a
                href="https://www.linkedin.com/company/puttbrothers/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 rounded-lg bg-[#41059a] hover:bg-[#41059a]/90 transition-all duration-300 group"
              >
                <Linkedin className="h-6 w-6 text-[#ffcc00] group-hover:scale-110 transition-transform" />
                <span className="text-white font-medium">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
