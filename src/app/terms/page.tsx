import PageHero from "@/components/PageHero";
import LegalContent from "@/components/LegalContent";
import { hotel } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — Aurelia Bay",
};

const sections = [
  {
    heading: "1. Reservations",
    body: [
      "A valid credit card is required to guarantee a reservation. Rates are quoted per room, per night, and are subject to change until a reservation is confirmed.",
    ],
  },
  {
    heading: "2. Check-In & Check-Out",
    body: [
      `Check-in begins at ${hotel.checkIn} and check-out is by ${hotel.checkOut}. Early check-in and late check-out may be arranged in advance, subject to availability.`,
    ],
  },
  {
    heading: "3. Cancellations",
    body: [
      "Reservations may be cancelled free of charge up to 5 days before arrival. Cancellations made after this window, or no-shows, may be charged the equivalent of one night's stay.",
    ],
  },
  {
    heading: "4. Tours & Transfers",
    body: [
      "Tours and transfers booked as add-ons are subject to availability and weather conditions. Cancellations within 24 hours of a scheduled activity may not be refundable.",
    ],
  },
  {
    heading: "5. Guest Conduct",
    body: [
      "Guests are expected to treat staff, other guests, and the property with respect. The hotel reserves the right to end a stay without refund in cases of serious misconduct.",
    ],
  },
  {
    heading: "6. Liability",
    body: [
      `${hotel.name} is not responsible for loss or damage to personal belongings, except where required by law. Guests are encouraged to use in-room safes for valuables.`,
    ],
  },
  {
    heading: "7. Changes to These Terms",
    body: [
      "These terms may be updated from time to time. The version in effect at the time of your reservation will apply to your stay.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        image="/images/hero-rooms.jpg"
        eyebrow="Legal"
        title="Terms & Conditions"
      />
      <section className="bg-ivory-50 py-24 px-6">
        <LegalContent updated="August 2026" sections={sections} />
      </section>
    </>
  );
}
