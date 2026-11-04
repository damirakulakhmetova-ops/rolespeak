import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RoleSpeak | You know medicine. Speak it with confidence.",
  description:
    "Rehearse your OET Speaking roleplay with an AI patient and get your predicted grade in 10 minutes.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#078a80",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
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
