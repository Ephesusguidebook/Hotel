import PageHero from "@/components/PageHero";
import AddOnsGrid from "@/components/AddOnsGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tours & Transfers — Aurelia Bay",
  description:
    "Browse guided tours, sailing excursions, spa days, and private transfers to add to your stay.",
};

export default function AddOnsPage() {
  return (
    <>
      <PageHero
        image="/images/hero-addons.jpg"
        eyebrow="Beyond the Stay"
        title="Tours & Transfers"
        description="Arrange the rest of the trip alongside your room — a concierge-curated set of tours and transfers."
      />

      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <AddOnsGrid />
        </div>
      </section>
    </>
  );
}
