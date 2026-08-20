import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import ContactForm from "@/components/ContactForm";
import { getSiteSettings } from "@/lib/settings-repo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Contact — " + settings.hotelName,
    description: `Get in touch with ${settings.hotelName}.`,
  };
}

export default async function ContactPage() {
  const hotel = await getSiteSettings();

  return (
    <>
      <PageHero
        image="/images/hero-contact.jpg"
        eyebrow="Contact"
        title="We're glad to help"
        description="Reach the front desk directly, or send a note and we'll reply within one business day."
      />

      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-16">
          <div className="lg:col-span-2">
            <SectionHeading eyebrow="Get in Touch" title="Contact Details" />
            <div className="mt-8 space-y-6 text-sm text-charcoal-700">
              <div>
                <p className="text-[11px] tracking-widest-plus text-gold-600 mb-1">
                  ADDRESS
                </p>
                <p>{hotel.address}</p>
              </div>
              <div>
                <p className="text-[11px] tracking-widest-plus text-gold-600 mb-1">
                  PHONE
                </p>
                <p>{hotel.phone}</p>
              </div>
              <div>
                <p className="text-[11px] tracking-widest-plus text-gold-600 mb-1">
                  EMAIL
                </p>
                <p>{hotel.email}</p>
              </div>
              <div>
                <p className="text-[11px] tracking-widest-plus text-gold-600 mb-1">
                  FRONT DESK HOURS
                </p>
                <p>{hotel.frontDeskHours}</p>
              </div>
            </div>

            <div className="mt-10 aspect-[4/3] bg-charcoal-900 flex items-center justify-center">
              <p className="text-ivory-200/40 text-xs tracking-widest-plus">
                MAP PLACEHOLDER
              </p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <SectionHeading eyebrow="Send a Message" title="Write to Us" />
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
