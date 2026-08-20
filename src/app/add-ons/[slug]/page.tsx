import Link from "next/link";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import { addOns } from "@/lib/data";
import type { Metadata } from "next";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return addOns.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = addOns.find((a) => a.slug === slug);
  if (!item) return {};
  return {
    title: `${item.name} — Aurelia Bay`,
    description: item.description,
  };
}

export default async function AddOnDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = addOns.find((a) => a.slug === slug);
  if (!item) notFound();

  const more = addOns.filter((a) => a.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="bg-ivory-50 pt-14 pb-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/add-ons"
            className="text-xs tracking-widest-plus text-gold-600 hover:text-gold-500 inline-flex items-center gap-2"
          >
            <span aria-hidden>&larr;</span> BACK TO TOURS & TRANSFERS
          </Link>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-14">
            <div className="lg:col-span-3">
              <ImageGallery
                images={item.images}
                alt={item.name}
                aspect="aspect-[4/3]"
                sizes="(min-width: 1024px) 60vw, 100vw"
                priority
              />

              <p className="mt-8 text-xs tracking-widest-plus text-gold-600">
                {item.category.toUpperCase()} &middot; {item.duration.toUpperCase()}
              </p>
              <h1 className="mt-3 font-serif text-3xl md:text-4xl text-charcoal-900">
                {item.name}
              </h1>

              <div className="mt-6 space-y-4">
                {item.longDescription.map((para, i) => (
                  <p key={i} className="text-sm text-charcoal-700 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              <div className="mt-10">
                <h2 className="text-xs tracking-widest-plus text-gold-600 mb-4">
                  WHAT&apos;S INCLUDED
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {item.includes.map((inc) => (
                    <li
                      key={inc}
                      className="text-sm text-charcoal-700 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-gold-500 shrink-0" />
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-28 bg-charcoal-950 text-ivory-50 p-8">
                <p className="text-xs tracking-widest-plus text-gold-400 mb-2">
                  {item.category.toUpperCase()}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl">${item.price}</span>
                  <span className="text-sm text-ivory-200/60">{item.unit}</span>
                </div>

                <div className="mt-6 space-y-4 text-sm border-t border-ivory-200/15 pt-6">
                  <div className="flex justify-between">
                    <span className="text-ivory-200/60">Duration</span>
                    <span>{item.duration}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-ivory-200/60 shrink-0">Meeting point</span>
                    <span className="text-right">{item.meetingPoint}</span>
                  </div>
                </div>

                <Link
                  href="/add-ons"
                  className="mt-8 block text-center bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-xs tracking-widest-plus py-4 transition-colors"
                >
                  ADD TO TRIP
                </Link>
                <p className="mt-4 text-[11px] text-ivory-200/40 leading-relaxed">
                  This is a design preview — booking is not yet connected to a
                  live reservation system. Add this experience from the Tours
                  & Transfers page to build your trip total.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section className="bg-charcoal-900 py-20 px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs tracking-widest-plus text-gold-400 mb-10">
              MORE EXPERIENCES
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {more.map((a) => (
                <Link
                  key={a.slug}
                  href={`/add-ons/${a.slug}`}
                  className="group block"
                >
                  <ImageGallery
                    images={[a.image]}
                    alt={a.name}
                    sizes="(min-width: 640px) 33vw, 100vw"
                  />
                  <h3 className="mt-4 font-serif text-lg text-ivory-50 group-hover:text-gold-400 transition-colors">
                    {a.name}
                  </h3>
                  <p className="mt-1 text-xs tracking-wide text-ivory-200/50">
                    ${a.price} {a.unit}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
