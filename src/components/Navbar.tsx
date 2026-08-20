"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/add-ons", label: "Tours & Transfers" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-charcoal-950/90 backdrop-blur-sm border-b border-charcoal-700/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl md:text-2xl tracking-widest-plus text-ivory-50"
            onClick={() => setOpen(false)}
          >
            AURELIA&nbsp;BAY
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

          <div className="hidden lg:block">
            <Link
              href="/rooms"
              className="inline-flex items-center border border-gold-500 px-5 py-2.5 text-xs tracking-widest-plus text-gold-400 hover:bg-gold-500 hover:text-charcoal-950 transition-colors"
            >
              BOOK NOW
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
        <div className="lg:hidden border-t border-charcoal-700/60 bg-charcoal-950">
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
              href="/rooms"
              className="mt-2 inline-flex w-fit items-center border border-gold-500 px-5 py-2.5 text-xs tracking-widest-plus text-gold-400"
              onClick={() => setOpen(false)}
            >
              BOOK NOW
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
