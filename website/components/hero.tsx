"use client";
import { useState, useEffect, useRef } from "react";

const slides = [
  {
    title: "Ultimate Mini Golf Adventure",
    subtitle:
      "Invest in the future of family entertainment with premium mini golf courses. Over 20 years of industry-leading expertise.",
  },
  {
    title: "Turnkey Design to Installation",
    subtitle:
      "From concept to completion we design, manufacture, and install complete entertainment experiences.",
  },
  {
    title: "Global Reach, Local Expertise",
    subtitle:
      "With factories in New Zealand and Brazil, we deliver world-class attractions worldwide.",
  },
  {
    title: null,
    subtitle: null,
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowSize({ width, height: window.innerHeight });

      if (width < 768) {
        setVideoSrc("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_WGQRPfpfvZbMt2fyH6hYTiR5f2uR/Yry8kVs6Oj8D51n8xC87cI/public/videos/mobile.mp4");
      } else if (width >= 768 && width <= 1024) {
        setVideoSrc("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_WGQRPfpfvZbMt2fyH6hYTiR5f2uR/RDuv2HGFCaqvVDdJ0W3EIr/public/videos/tablet.mp4");
      } else {
        setVideoSrc("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/git-blob/prj_WGQRPfpfvZbMt2fyH6hYTiR5f2uR/uq0lhiyjRi314HaXVDZAH-/public/videos/desktop.mp4");
      }
    };

    handleResize(); // Set initial video source and window size

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVideoEnd = () => {
      setCurrentSlide(0);
    };

    video.addEventListener("ended", handleVideoEnd);
    return () => video.removeEventListener("ended", handleVideoEnd);
  }, []);

  return (
    <section
      id="home"
      className={`relative w-full ${
        windowSize.width < 1025 ? "h-[100vw]" : "h-screen"
      }`}
      style={{ backgroundColor: "#000000" }}
    >
      <div className="absolute inset-0">
        {videoSrc && (
          <video
            ref={videoRef}
            preload="auto"
            loop
            autoPlay
            muted
            playsInline
            className={`${
              windowSize.width < 1025
                ? "w-[100vw] h-[calc(100%-20px)]"
                : "w-full h-[calc(100vh-80px)]"
            } ${
              windowSize.width >= 768 && windowSize.width <= 1024
                ? "object-contain"
                : "object-cover"
            } relative top-20`}
            key={videoSrc}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
        {/* <div className="absolute inset-0 bg-black/50" /> */}
      </div>
    </section>
  );
}
