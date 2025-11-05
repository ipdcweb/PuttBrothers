import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import ScrollToTop from "@/components/scroll-to-top"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollToTopOnRouteChange } from "@/components/scroll-to-top-on-route-change"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "PuttBrothers - Ultimate Mini Golf Adventure",
  description:
    "Experience the ultimate mini golf adventure with PuttBrothers. Premium mini golf courses designed for family entertainment.",
  generator: "v0.app",
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
        <Analytics />
      </body>
    </html>
  )
}
