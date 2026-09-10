import PageHero from "@/components/PageHero";
import AddOnsGrid from "@/components/AddOnsGrid";
import { getAddOns } from "@/lib/addons-repo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tours & Transfers — Aurelia Bay",
  description:
    "Browse guided tours, sailing excursions, spa days, and private transfers to add to your stay.",
};

export default async function AddOnsPage({
  searchParams,
}: {
  searchParams: Promise<{ cartError?: string }>;
}) {
  const addOns = await getAddOns();
  const { cartError } = await searchParams;

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
          {cartError && (
            <p className="mb-10 text-sm text-red-700 bg-red-50 border border-red-300 rounded px-4 py-3">
              {cartError}
            </p>
          )}
          <AddOnsGrid addOns={addOns} />
        </div>
      </section>
    </>
  );
}
