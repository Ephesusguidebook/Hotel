"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/add-ons", label: "Tours & Transfers" },
  { href: "/nearby", label: "Nearby" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

type Props = {
  /** The hotel's name, from site settings — so renaming the hotel in the
   *  admin panel renames it here too. */
  hotelName: string;
  customerName?: string | null;
  cartCount?: number;
};

export default function Navbar({
  hotelName,
  customerName = null,
  cartCount = 0,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-navy-950/90 backdrop-blur-sm border-b border-navy-700/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
            <Logo alt={hotelName} className="h-9 w-auto md:h-11" />
          </Link>

          <nav className="hidden lg:flex items-center gap-9">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-wide text-ivory-200/80 hover:text-gold-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-5">
            <Link
              href="/account/cart"
              className="relative text-sm tracking-wide text-ivory-200/80 hover:text-gold-400 transition-colors"
            >
              Cart
              {cartCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center text-xs bg-gold-500 text-navy-950 rounded-full w-4 h-4 align-middle">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href={customerName ? "/account" : "/account/login"}
              className="text-sm tracking-wide text-ivory-200/80 hover:text-gold-400 transition-colors"
            >
              {customerName ? customerName.split(" ")[0] : "Sign In"}
            </Link>
          </div>

          <button
            className="lg:hidden text-ivory-50"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              {open ? (
                <path
                  d="M6 6L18 18M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7H20M4 12H20M4 17H20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-navy-700/60 bg-navy-950">
          <nav className="flex flex-col px-6 py-6 gap-5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-wide text-ivory-200/90"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/account/cart"
              className="text-sm tracking-wide text-ivory-200/90"
              onClick={() => setOpen(false)}
            >
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
            <Link
              href={customerName ? "/account" : "/account/login"}
              className="text-sm tracking-wide text-ivory-200/90"
              onClick={() => setOpen(false)}
            >
              {customerName ? `My Account (${customerName.split(" ")[0]})` : "Sign In"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
