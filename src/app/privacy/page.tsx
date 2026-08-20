import PageHero from "@/components/PageHero";
import LegalContent from "@/components/LegalContent";
import { hotel } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Aurelia Bay",
};

const sections = [
  {
    heading: "1. Information We Collect",
    body: [
      `When you make a reservation, contact us, or browse ${hotel.name}'s website, we may collect information such as your name, email address, phone number, and stay preferences.`,
      "We also collect limited technical information (such as browser type and pages visited) to help us understand how the site is used and to keep it running smoothly.",
    ],
  },
  {
    heading: "2. How We Use Information",
    body: [
      "Information you provide is used to process reservations, respond to enquiries, and personalize your stay — for example, remembering room preferences from a previous visit.",
      "We do not sell guest information to third parties.",
    ],
  },
  {
    heading: "3. Cookies",
    body: [
      "This site may use cookies to remember basic preferences and to understand aggregate visitor patterns. You can disable cookies in your browser settings at any time.",
    ],
  },
  {
    heading: "4. Data Retention",
    body: [
      "Reservation and guest records are retained for as long as needed to fulfil legal, accounting, and operational requirements, after which they are securely deleted.",
    ],
  },
  {
    heading: "5. Your Rights",
    body: [
      `You may request access to, correction of, or deletion of your personal information at any time by contacting us at ${hotel.email}.`,
    ],
  },
  {
    heading: "6. Contact",
    body: [
      `Questions about this policy can be directed to ${hotel.email} or ${hotel.phone}.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        image="/images/hero-contact.jpg"
        eyebrow="Legal"
        title="Privacy Policy"
      />
      <section className="bg-ivory-50 py-24 px-6">
        <LegalContent updated="August 2026" sections={sections} />
      </section>
    </>
  );
}
