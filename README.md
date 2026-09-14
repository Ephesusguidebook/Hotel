# Ida Efes — Hotel Website

A hotel website and booking engine for **Ida Efes** in Selçuk, İzmir, built with
Next.js 16 (App Router), TypeScript, Tailwind CSS v4 and MySQL.

Content is edited from the admin panel at `/admin` and stored in MySQL. The
values in `src/lib/data.ts` are only a fallback: if the database is unreachable
the site still renders from them instead of returning a 500, but they are not
what visitors normally see.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run build && npm run start` runs a production
build.

### Environment variables

Put these in `.env.local` locally, and in the deployment's "Environment
variables" panel on Hostinger:

| Variable | Required | What it's for |
| --- | --- | --- |
| `DATABASE_URL` | yes | `mysql://user:password@host:3306/dbname` |
| `ADMIN_PASSWORD` | yes | The single password for `/admin/login` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | no | Sends account-verification and reservation emails. Without them registration still works — the verification link is shown on screen instead. |

### Database

Import the SQL files **in order**, once, through phpMyAdmin:

```
sql/schema.sql      rooms, tours & transfers
sql/schema_v2.sql   site settings, about page, blog, legal pages
sql/schema_v3.sql   customers, carts, reservations
sql/schema_v4.sql   media library
sql/schema_v5.sql   nearby places to visit
sql/schema_v6.sql   rate plans, date-range pricing, availability calendar
```

All six are safe to run again — seeds use `INSERT IGNORE` and column changes are
guarded — so re-importing never duplicates rows or overwrites edits made in the
admin panel.

## Pages

Public:

- `/` — home
- `/rooms` — availability search: pick dates, see every room and rate plan that
  is actually sellable for that stay, with the real total for those nights
- `/add-ons` — tours & transfers
- `/nearby`, `/nearby/[slug]` — places to visit around Selçuk (Ephesus, the
  House of the Virgin Mary, Şirince and so on)
- `/about`, `/contact`, `/blog`, `/blog/[slug]`, `/privacy`, `/terms`
- `/account/*` — registration with email verification, cart, checkout,
  reservation lookup

Admin (`/admin`, password-protected):

- `rooms` — rooms, and per-room **availability calendar** with date-range prices
- `rate-plans` — Room Only, Breakfast Included, and any others you add
- `media` — upload photos; they are converted to WebP in the browser and stored
  in MySQL, then picked from a library anywhere an image is used
- `nearby`, `blog`, `about`, `legal`, `add-ons` — page content, rich text
- `reservations` — incoming bookings
- `settings` — **hotel name, address, phone, email, check-in/out times**

## How pricing and availability work

There is no stock counter that ticks down. Free rooms on a date are worked out
each time as:

```
(per-date override, if any, else the room's standing stock)
  minus rooms already booked that date by live reservations
```

so the calendar moves on its own as bookings arrive, and you can still close a
date by hand from the room's calendar.

Prices are per room, per rate plan, per date range. Ranges may overlap on
purpose: lay a season price down wide, then a short holiday price over the top —
**the narrower range wins**. A night with no price at all is not sellable on
that plan, rather than quietly falling back to some other number.

## Project structure

```
src/
  app/            route segments (one folder per page, App Router)
    admin/        the admin panel
    api/media/    serves uploaded photos out of MySQL
  components/     shared UI, plus components/admin for the panel
  lib/            one repo module per table (rooms, rates, availability, media…)
    data.ts       fallback content, used only when the database is unreachable
sql/              schema files, imported in order
public/images/    the original placeholder photography
scripts/
  generate_images.py   regenerates that placeholder imagery
```

## Photos

Uploaded photos are stored **in MySQL**, not on disk. Hostinger redeploys from
GitHub on every push, which replaces the filesystem — anything written to an
uploads folder would vanish on the next deploy.

Conversion to WebP and resizing happen in the browser before upload
(`Canvas.toBlob`), so the server needs no native image library. A typical photo
lands around 150–500 KB.

The images in `public/images` are generated gradient placeholders. "Import
photos" on `/admin/media` brings them into the library so they can be replaced
one at a time with real photography.

## Design system

Colors, fonts and a few utility classes are defined in `src/app/globals.css`
using Tailwind v4's `@theme` block — edit the CSS variables there to adjust the
look sitewide.
