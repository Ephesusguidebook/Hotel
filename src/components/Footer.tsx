import Link from "next/link";
import { getSiteSettings } from "@/lib/settings-repo";

const explore = [
  { href: "/rooms", label: "Rooms & Suites" },
  { href: "/add-ons", label: "Tours & Transfers" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Journal" },
];

const guest = [
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export default async function Footer() {
  const hotel = await getSiteSettings();

  return (
    <footer className="bg-charcoal-950 text-ivory-200/80 border-t border-charcoal-700/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="font-serif text-xl tracking-widest-plus text-ivory-50">
              {hotel.hotelName.toUpperCase()}
            </div>
            <div className="gold-divider my-4" />
            <p className="text-sm leading-relaxed max-w-xs">
              {hotel.tagline}. A small collection of rooms and suites on the{" "}
              {hotel.city}.
            </p>
          </div>

          <div>
            <h3 className="text-xs tracking-widest-plus text-gold-400 mb-5">
              EXPLORE
            </h3>
            <ul className="space-y-3 text-sm">
              {explore.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-gold-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-widest-plus text-gold-400 mb-5">
              GUEST INFO
            </h3>
            <ul className="space-y-3 text-sm">
              {guest.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-gold-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-widest-plus text-gold-400 mb-5">
              CONTACT
            </h3>
            <ul className="space-y-3 text-sm">
              <li>{hotel.address}</li>
              <li>{hotel.phone}</li>
              <li>{hotel.email}</li>
            </ul>
          </div>
        </div>

        <div className="hairline mt-14 mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ivory-200/50">
          <p>
            &copy; {new Date().getFullYear()} {hotel.hotelName}. All rights
            reserved.
          </p>
          <p>Placeholder content — for design preview purposes.</p>
        </div>
      </div>
    </footer>
  );
}
