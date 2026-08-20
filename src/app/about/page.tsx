import Image from "next/image";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { hotel } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Aurelia Bay",
  description: `The story behind ${hotel.name} and the team who run it.`,
};

const values = [
  {
    title: "Small by design",
    text: "A limited number of rooms so every stay gets full attention, not a shift-change of staff.",
  },
  {
    title: "Rooted in place",
    text: "Most of what's on the table, and much of what's in the rooms, comes from within a short drive of the hotel.",
  },
  {
    title: "Quietly run",
    text: "No loudspeakers, no upsells at check-in — service that shows up when it's useful and steps back otherwise.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        image="/images/hero-about.jpg"
        eyebrow="About Us"
        title="A family project, twenty years in"
        description="From a six-room guesthouse to a small coastal hotel, built one season at a time."
      />

      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading eyebrow="Our Story" title="How Aurelia Bay began" />
            <div className="mt-6 space-y-5 text-charcoal-700 leading-relaxed text-sm">
              <p>
                {hotel.name} opened in the early 2000s as a six-room
                guesthouse run by a single family out of a converted
                harborside villa. What guests kept coming back for wasn&apos;t
                the size of the rooms — it was the sense that someone had
                thought carefully about how they&apos;d spend their days.
              </p>
              <p>
                Over two decades, the property grew slowly: a few more
                rooms, a proper kitchen, a small spa built into the old
                cellar. Each addition was made with the same instinct that
                started the place — build for the guest who wants to slow
                down, not the one passing through.
              </p>
              <p>
                Today the team is larger, but the approach hasn&apos;t
                changed. Reservations are still answered by someone who
                knows the coastline personally, and the tours and transfers
                we recommend are the ones we&apos;d take ourselves.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5]">
            <Image
              src="/images/about-team.jpg"
              alt="Aurelia Bay team"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-charcoal-950 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="What We Value"
            title="The principles behind the property"
            align="center"
            light
          />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
            {values.map((v) => (
              <div key={v.title} className="border-t border-gold-500/40 pt-6">
                <h3 className="font-serif text-xl text-ivory-50">{v.title}</h3>
                <p className="mt-3 text-sm text-ivory-200/75 leading-relaxed">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
