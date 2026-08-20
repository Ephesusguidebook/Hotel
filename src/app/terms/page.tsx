import PageHero from "@/components/PageHero";
import LegalContent from "@/components/LegalContent";
import { getLegalPage } from "@/lib/legal-repo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("terms");
  return { title: `${page.title} — Aurelia Bay` };
}

export default async function TermsPage() {
  const page = await getLegalPage("terms");

  return (
    <>
      <PageHero
        image="/images/hero-rooms.jpg"
        eyebrow="Legal"
        title={page.title}
      />
      <section className="bg-ivory-50 py-24 px-6">
        <LegalContent updated={page.updated} sections={page.sections} />
      </section>
    </>
  );
}
