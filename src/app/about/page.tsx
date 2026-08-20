import Image from "next/image";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { getSiteSettings } from "@/lib/settings-repo";
import { getAboutContent } from "@/lib/about-repo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "About Us — " + settings.hotelName,
    description: `The story behind ${settings.hotelName} and the team who run it.`,
  };
}

export default async function AboutPage() {
  const about = await getAboutContent();

  return (
    <>
      <PageHero
        image="/images/hero-about.jpg"
        eyebrow="About Us"
        title={about.heroTitle}
        description={about.heroDescription}
      />

      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading eyebrow="Our Story" title={about.storyHeading} />
            <div className="mt-6 space-y-5 text-charcoal-700 leading-relaxed text-sm">
              {about.storyParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/5]">
            <Image
              src={about.teamImage}
              alt="Team"
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
            {about.values.map((v) => (
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
