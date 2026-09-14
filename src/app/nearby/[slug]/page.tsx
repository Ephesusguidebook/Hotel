import Link from "next/link";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import RichText from "@/components/RichText";
import { getAttractions, getAttractionBySlug } from "@/lib/attractions-repo";
import { getSiteSettings } from "@/lib/settings-repo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getAttractionBySlug(slug);
  if (!item) return {};
  const settings = await getSiteSettings();
  return {
    title: `${item.name} — ${settings.hotelName}`,
    description: item.description,
  };
}

export default async function AttractionDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const item = await getAttractionBySlug(slug);
  if (!item) notFound();

  const all = await getAttractions();
  const more = all.filter((a) => a.slug !== slug).slice(0, 3);

  const facts = [
    { label: "Distance", value: item.distance },
    { label: "Getting there", value: item.travelTime },
    { label: "Opening hours", value: item.openingHours },
    { label: "Entry", value: item.entryFee },
    { label: "Best time to go", value: item.bestTime },
  ].filter((f) => f.value?.trim());

  return (
    <>
      <section className="bg-ivory-50 px-6 pt-14 pb-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/nearby"
            className="inline-flex items-center gap-2 text-sm tracking-widest-plus text-gold-600 hover:text-charcoal-900"
          >
            <span aria-hidden>&larr;</span> BACK TO NEARBY PLACES
          </Link>

          <div className="mt-8 grid grid-cols-1 gap-14 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ImageGallery
                images={item.images}
                alt={item.name}
                aspect="aspect-[4/3]"
                sizes="(min-width: 1024px) 60vw, 100vw"
                priority
              />

              <p className="mt-8 text-sm tracking-widest-plus text-gold-600">
                {item.category.toUpperCase()} &middot;{" "}
                {item.distance.toUpperCase()} FROM THE HOTEL
              </p>
              <h1 className="mt-3 font-serif text-3xl text-charcoal-900 md:text-4xl">
                {item.name}
              </h1>

              <RichText html={item.longDescription} className="mt-6" />

              {item.highlights.length > 0 && (
                <div className="mt-10">
                  <h2 className="eyebrow mb-4 text-gold-600">
                    What to look for
                  </h2>
                  <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    {item.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-2.5 text-base text-charcoal-700"
                      >
                        <span
                          aria-hidden
                          className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-gold-500"
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Practical details */}
            <aside className="lg:col-span-2">
              <div className="border border-charcoal-900/10 bg-white p-7">
                <h2 className="eyebrow mb-6 text-gold-600">Before you go</h2>

                <dl className="space-y-5">
                  {facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-sm font-medium text-charcoal-500">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 text-base leading-relaxed text-charcoal-800">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {item.mapUrl && (
                  <a
                    href={item.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex w-full items-center justify-center bg-charcoal-900 px-6 py-3.5 text-sm tracking-widest-plus text-ivory-50 transition-colors hover:bg-charcoal-800"
                  >
                    OPEN IN MAPS
                  </a>
                )}

                <p className="mt-5 text-sm leading-relaxed text-charcoal-500">
                  Hours and prices change with the season. Reception confirms
                  them each morning and can arrange a taxi or a driver.
                </p>
              </div>
            </aside>
          </div>

          {more.length > 0 && (
            <div className="mt-24">
              <h2 className="font-serif text-2xl text-charcoal-900">
                Also close by
              </h2>
              <div className="gold-divider mt-4 mb-8" />
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {more.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/nearby/${other.slug}`}
                      className="block h-full border border-charcoal-900/10 bg-white p-5 transition-colors hover:border-gold-500"
                    >
                      <p className="text-sm tracking-widest-plus text-gold-600">
                        {other.category.toUpperCase()}
                      </p>
                      <p className="mt-2 font-serif text-lg text-charcoal-900">
                        {other.name}
                      </p>
                      <p className="mt-1.5 text-sm text-charcoal-500">
                        {other.distance} &middot; {other.travelTime}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
