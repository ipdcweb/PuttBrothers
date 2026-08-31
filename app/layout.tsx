import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import ScrollToTop from "@/components/scroll-to-top"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollToTopOnRouteChange } from "@/components/scroll-to-top-on-route-change"

const poppins = localFont({
  src: [
    { path: "./fonts/poppins-300.woff2", weight: "300", style: "normal" },
    { path: "./fonts/poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/poppins-800.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "PuttBrothers - Ultimate Mini Golf Adventure",
  description:
    "Experience the ultimate mini golf adventure with PuttBrothers. Premium mini golf courses designed for family entertainment.",
  generator: "v0.app",
  icons: {
    icon: "/images/design-mode/Logo%20White.webp",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${poppins.variable} font-sans antialiased overflow-x-hidden`}>
        <ScrollToTopOnRouteChange />
        <Header />
        {children}
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  )
}
