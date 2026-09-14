import type { Metadata, Viewport } from "next";
import SiteChrome from "@/components/SiteChrome";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/settings-repo";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getCartItems } from "@/lib/cart-repo";
import "./globals.css";

// Fonts are loaded via a standard <link> tag below (see head) rather than
// next/font/google, so the production build doesn't need to reach
// fonts.googleapis.com at build time. Replace with next/font or self-hosted
// files if you'd rather bundle them.

// The address bar / task switcher colour, and the splash background when the
// site is added to a phone's home screen. This is the logo's blue.
export const viewport: Viewport = {
  themeColor: "#10354B",
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.hotelName} — ${settings.tagline}`,
    description: `${settings.hotelName} is a boutique hotel in ${settings.city}. Explore rooms, suites, tours, and transfers, and book your stay.`,
    // The icon set that came with the logo. The SVG is what modern browsers
    // pick up; the .ico is the fallback for older ones and for the bookmark
    // bar, and apple-touch-icon is what iOS uses on the home screen.
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon.ico", sizes: "48x48" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/site.webmanifest",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const customer = await getCurrentCustomer();
  const cartCount = customer ? (await getCartItems(customer.id)).length : 0;

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
        <SiteChrome
          navbar={
            <Navbar
              hotelName={settings.hotelName}
              customerName={customer?.name ?? null}
              cartCount={cartCount}
            />
          }
          footer={<Footer />}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
