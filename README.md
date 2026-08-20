# Aurelia Bay — Hotel Website

A luxury boutique hotel website built with Next.js 16 (App Router), TypeScript, and
Tailwind CSS v4. All content, prices, and photography are **placeholders** —
replace them with real data before launch (see "Replacing placeholder content"
below).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser. `npm run build && npm run start`
runs a production build.

## Pages

- `/` — Home (hero + quick search, highlights, featured rooms, tours teaser,
  testimonials, journal teaser)
- `/rooms` — Room & suite listing with a live "check availability" reservation
  panel (mock pricing/availability, no backend yet)
- `/add-ons` — Tours & transfers, filterable, with an "add to trip" running
  total (client-side only)
- `/about` — About Us / hotel story
- `/contact` — Contact details + message form
- `/blog` — Journal listing, with `/blog/[slug]` post pages
- `/privacy` — Privacy Policy
- `/terms` — Terms & Conditions

## Project structure

```
src/
  app/            route segments (one folder per page, App Router)
  components/     shared UI (Navbar, Footer, cards, reservation panel, etc.)
  lib/data.ts     all placeholder content: hotel info, rooms, add-ons, blog posts
scripts/
  generate_images.py   regenerates the placeholder imagery in public/images
public/images/    generated placeholder photography (see below)
```

## Replacing placeholder content

1. **Hotel details, rooms, tours/transfers, blog posts** all live in
   `src/lib/data.ts` — update names, prices, descriptions, and copy there.
2. **Images**: `public/images/*.jpg` are generated abstract gradient
   placeholders (see `scripts/generate_images.py`), used so the site never
   ships broken image links. Swap them for real photography — keep the same
   filenames (e.g. `room-deluxe.jpg`) or update the `image` paths in
   `src/lib/data.ts`.
3. **Fonts**: loaded via Google Fonts `<link>` tags in `src/app/layout.tsx`
   (Playfair Display + Inter). Swap for other Google Fonts, or migrate to
   `next/font/google` / self-hosted files once you have reliable network
   access to fonts.googleapis.com at build time.
4. **Reservation & add-on booking**: `ReservationPanel` and `AddOnsGrid` are
   fully interactive but not wired to a real booking system — pricing and
   "availability" are mocked client-side. Connect them to a real
   booking/PMS API before taking live reservations.
5. **Contact form**: `ContactForm` shows a success state on submit but does
   not send anything yet — wire it to an email/API endpoint.

## Design system

Colors, fonts, and a few utility classes (gold divider, hairline, tracking)
are defined in `src/app/globals.css` using Tailwind v4's `@theme` block —
edit the CSS variables there (charcoal / ivory / gold palette) to adjust the
look sitewide.
