import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageHero from "@/components/PageHero";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getReservationByCode } from "@/lib/reservations-repo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reservation — Aurelia Bay",
};

const PAYMENT_LABEL: Record<string, string> = {
  unpaid: "Payment due",
  paid: "Paid",
  refunded: "Refunded",
};

const PAYMENT_STYLE: Record<string, string> = {
  unpaid: "bg-amber-50 text-amber-800 border-amber-300",
  paid: "bg-green-50 text-green-800 border-green-300",
  refunded: "bg-charcoal-100 text-charcoal-700 border-charcoal-300",
};

type Params = Promise<{ code: string }>;

export default async function ReservationDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { code } = await params;
  const { placed } = await searchParams;
  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/account/login?next=${encodeURIComponent(`/account/reservations/${code}`)}`);

  const reservation = await getReservationByCode(code, customer.id);
  if (!reservation) notFound();

  return (
    <>
      <PageHero image="/images/hero-rooms.jpg" eyebrow="Reservation" title={reservation.code} />

      <section className="bg-ivory-50 py-20 px-6 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/account"
            className="text-sm tracking-widest-plus text-gold-600 hover:text-gold-500 inline-flex items-center gap-2"
          >
            <span aria-hidden>&larr;</span> BACK TO ACCOUNT
          </Link>

          {placed === "1" && (
            <p className="mt-8 text-sm text-green-800 bg-green-50 border border-green-300 rounded px-4 py-3">
              Your reservation is confirmed — thank you.
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-widest-plus text-charcoal-500 mb-1">
                {reservation.checkIn && reservation.checkOut
                  ? `${reservation.checkIn} → ${reservation.checkOut}`
                  : "RESERVATION DATE"}
              </p>
              <p className="text-sm text-charcoal-700">Placed {reservation.createdAt}</p>
            </div>
            <span
              className={`inline-block text-xs tracking-widest-plus border px-3 py-1.5 rounded ${
                PAYMENT_STYLE[reservation.paymentStatus] ?? PAYMENT_STYLE.unpaid
              }`}
            >
              {(PAYMENT_LABEL[reservation.paymentStatus] ?? reservation.paymentStatus).toUpperCase()}
            </span>
          </div>

          <h2 className="mt-10 font-serif text-xl text-charcoal-900 mb-4">Itemized Accounting</h2>
          <div className="border border-charcoal-900/10 divide-y divide-charcoal-900/10">
            {reservation.items.map((item) => (
              <div key={item.id} className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs tracking-widest-plus text-gold-600 mb-1">
                    {item.itemType === "room" ? "ROOM" : "TOUR / TRANSFER"}
                  </p>
                  <p className="text-sm text-charcoal-900">{item.itemName}</p>
                  <p className="mt-1 text-sm text-charcoal-500">
                    {item.itemType === "room"
                      ? `${item.checkIn} → ${item.checkOut} · $${item.unitPrice}/night × ${item.quantity} room${item.quantity === 1 ? "" : "s"}`
                      : `$${item.unitPrice} × ${item.quantity}`}
                  </p>
                </div>
                <p className="font-serif text-charcoal-900">${item.lineTotal}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 ml-auto max-w-xs space-y-2 text-sm text-charcoal-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${reservation.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & fees</span>
              <span>${reservation.taxesAndFees}</span>
            </div>
            <div className="flex justify-between font-serif text-lg text-charcoal-900 pt-2 border-t border-charcoal-900/15">
              <span>Total</span>
              <span>${reservation.total}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
