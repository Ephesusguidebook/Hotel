import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import { hotel } from "@/lib/data";
import "./globals.css";

// Fonts are loaded via a standard <link> tag below (see head) rather than
// next/font/google, so the production build doesn't need to reach
// fonts.googleapis.com at build time. Replace with next/font or self-hosted
// files if you'd rather bundle them.

export const metadata: Metadata = {
  title: `${hotel.name} — ${hotel.tagline}`,
  description: `${hotel.name} is a boutique hotel on the ${hotel.city}. Explore rooms, suites, tours, and transfers, and book your stay.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* App Router root layout, not pages/_document.js — this rule targets the Pages Router */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
