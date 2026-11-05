import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RoleSpeak | OET Speaking practice for nurses with an AI patient",
  description:
    "Practise the real OET Speaking role-play with an AI patient. Get a score on all 9 official criteria, a predicted grade and 3 fixes in 5 minutes. Free first role-play.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#078a80",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        {/*
          Analytics placeholders. Paste the official snippets here when ready:
          - Meta Pixel: defines window.fbq
          - Google Analytics (gtag.js): defines window.gtag
          src/lib/analytics.ts forwards every event to both when present.
        */}
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
