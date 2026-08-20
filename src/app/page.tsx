import Image from "next/image";
import Link from "next/link";
import QuickSearch from "@/components/QuickSearch";
import SectionHeading from "@/components/SectionHeading";
import RoomCard from "@/components/RoomCard";
import BlogCard from "@/components/BlogCard";
import { hotel, rooms, addOns, blogPosts, testimonials } from "@/lib/data";

const highlights = [
  {
    title: "Private Beach Access",
    text: "A quiet stretch of shoreline reserved for guests, steps from the terrace.",
  },
  {
    title: "Chef's Table Dining",
    text: "Seasonal menus built around the morning catch and hillside harvest.",
  },
  {
    title: "Full-Service Spa",
    text: "A thermal suite and treatment rooms overlooking the water.",
  },
  {
    title: "Curated Excursions",
    text: "Tours and transfers arranged by a concierge who knows the coast.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[86vh] flex items-center">
        <Image
          src="/images/hero-home.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/70 via-charcoal-950/40 to-charcoal-950/85" />

        <div className="relative mx-auto max-w-7xl w-full px-6 lg:px-10 pt-16">
          <p className="text-xs md:text-sm tracking-widest-plus text-gold-400 mb-5">
            {hotel.city.toUpperCase()}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-ivory-50 max-w-3xl leading-[1.1]">
            {hotel.tagline}
          </h1>
          <p className="mt-6 text-ivory-200/85 max-w-lg text-base md:text-lg">
            {hotel.name} is a small collection of rooms and suites set above
            the water, built around slow mornings and quiet service.
          </p>

          <div className="mt-12">
            <QuickSearch />
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="The Experience"
            title="Everything a quiet stay requires"
            align="center"
          />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {highlights.map((h) => (
              <div key={h.title} className="text-center px-2">
                <div className="mx-auto w-12 h-12 border border-gold-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-gold-500 rounded-full" />
                </div>
                <h3 className="mt-6 font-serif text-lg text-charcoal-900">
                  {h.title}
                </h3>
                <p className="mt-3 text-sm text-charcoal-700 leading-relaxed">
                  {h.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured rooms */}
      <section className="bg-charcoal-950 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <SectionHeading
              eyebrow="Stay"
              title="Rooms & Suites"
              description="Four room types, each facing the water, each finished with the same quiet attention to detail."
              light
            />
            <Link
              href="/rooms"
              className="shrink-0 text-xs tracking-widest-plus text-gold-400 hover:text-gold-300 inline-flex items-center gap-2"
            >
              VIEW ALL ROOMS <span aria-hidden>&rarr;</span>
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-charcoal-700/40">
            {rooms.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/3]">
            <Image
              src="/images/about-story.jpg"
              alt="Aurelia Bay"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow="About Us"
              title="A family project, twenty years in"
              description="Aurelia Bay opened as a six-room guesthouse and has grown slowly, one season at a time, without losing the parts that made it worth visiting in the first place."
            />
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 text-xs tracking-widest-plus text-gold-600 hover:text-gold-500"
            >
              READ OUR STORY <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Add-ons teaser */}
      <section className="bg-charcoal-900 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Beyond the Stay"
            title="Tours & Transfers"
            description="Arrange the rest of the trip alongside your room — walking tours, private sailing, spa days, and airport transfers."
            light
          />
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((item) => (
              <div key={item.slug} className="relative aspect-[4/5] group overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/20 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <p className="text-[11px] tracking-widest-plus text-gold-400">
                    {item.category.toUpperCase()}
                  </p>
                  <h3 className="mt-2 font-serif text-lg text-ivory-50">
                    {item.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/add-ons"
              className="inline-flex items-center border border-gold-500 px-6 py-3 text-xs tracking-widest-plus text-gold-400 hover:bg-gold-500 hover:text-charcoal-950 transition-colors"
            >
              EXPLORE ALL EXPERIENCES
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Guest Notes"
            title="What guests remember"
            align="center"
          />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((t, i) => (
              <div key={i} className="text-center px-4">
                <p className="font-serif text-lg text-charcoal-900 leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-5 text-xs tracking-widest-plus text-gold-600">
                  {t.author.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journal teaser */}
      <section className="bg-ivory-50 pb-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <SectionHeading eyebrow="Journal" title="Notes from the coast" />
            <Link
              href="/blog"
              className="shrink-0 text-xs tracking-widest-plus text-gold-600 hover:text-gold-500 inline-flex items-center gap-2"
            >
              VISIT THE JOURNAL <span aria-hidden>&rarr;</span>
            </Link>
          </div>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {blogPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 px-6 lg:px-10">
        <Image
          src="/images/hero-contact.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-charcoal-950/75" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-ivory-50">
            Reserve your dates on the water
          </h2>
          <p className="mt-4 text-ivory-200/80">
            Rooms are limited by design. Check availability and secure your
            stay directly with us.
          </p>
          <Link
            href="/rooms"
            className="mt-8 inline-flex items-center bg-gold-500 hover:bg-gold-400 text-charcoal-950 px-8 py-3.5 text-xs tracking-widest-plus transition-colors"
          >
            BOOK YOUR STAY
          </Link>
        </div>
      </section>
    </>
  );
}
