import type React from "react";
import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import "@/styles/v2.css";
import "@/styles/v2-shell.css";
import { AppShell } from "@/components/app-shell";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Putt Brothers | We build what's next in play",
    template: "%s | Putt Brothers",
  },
  description:
    "From custom mini golf to complete entertainment venues. Putt Brothers brings design, engineering, manufacturing and immersive play together.",
  metadataBase: new URL("https://puttbrothers.com"),
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon-puttbrothers.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-clip" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${montserrat.variable} font-sans antialiased overflow-x-clip`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
