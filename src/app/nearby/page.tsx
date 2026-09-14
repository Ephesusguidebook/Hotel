import Link from "next/link";
import PageHero from "@/components/PageHero";
import AttractionCard from "@/components/AttractionCard";
import { getAttractions, categoriesOf } from "@/lib/attractions-repo";
import { getSiteSettings } from "@/lib/settings-repo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Nearby Places to Visit — ${settings.hotelName}`,
    description: `Ancient sites, museums, villages and beaches within easy reach of ${settings.hotelName}, with distances, opening hours and the best time to go.`,
  };
}

export default async function NearbyPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const attractions = await getAttractions();
  const categories = categoriesOf(attractions);

  // Filtering happens through the URL rather than client state, so a
  // filtered view can be linked to and shared, and the page stays a server
  // component.
  const active =
    category && categories.includes(category) ? category : null;
  const visible = active
    ? attractions.filter((a) => a.category === active)
    : attractions;

  return (
    <>
      <PageHero
        image="/images/hero-addons.jpg"
        eyebrow="Around the Hotel"
        title="Nearby Places to Visit"
        description="What's worth your time within a short drive — with distances, opening hours and the hour of day we'd go."
      />

      <section className="bg-ivory-50 py-20 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {categories.length > 1 && (
            <nav
              aria-label="Filter places by type"
              className="mb-12 flex flex-wrap gap-3"
            >
              <FilterChip href="/nearby" active={!active}>
                All
              </FilterChip>
              {categories.map((name) => (
                <FilterChip
                  key={name}
                  href={`/nearby?category=${encodeURIComponent(name)}`}
                  active={active === name}
                >
                  {name}
                </FilterChip>
              ))}
            </nav>
          )}

          {visible.length === 0 ? (
            <p className="py-12 text-base text-charcoal-700">
              Nothing listed here yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
                <AttractionCard key={item.slug} item={item} />
              ))}
            </div>
          )}

          <p className="mt-14 max-w-3xl text-sm leading-relaxed text-charcoal-500">
            Opening hours and entry fees change with the season and are worth
            confirming before you set out — reception checks them each morning
            and can arrange a taxi or a driver for anywhere on this page.
          </p>
        </div>
      </section>
    </>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={`border px-4 py-2.5 text-sm tracking-widest-plus transition-colors ${
        active
          ? "border-charcoal-900 bg-charcoal-900 text-ivory-50"
          : "border-charcoal-900/30 text-charcoal-700 hover:border-charcoal-900"
      }`}
    >
      {children.toUpperCase()}
    </Link>
  );
}
