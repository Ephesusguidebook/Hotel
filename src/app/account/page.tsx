import Link from "next/link";
import PageHero from "@/components/PageHero";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getReservationsByCustomer } from "@/lib/reservations-repo";
import { logoutAction } from "@/app/account/actions";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings-repo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `My Account — ${settings.hotelName}`,
  };
}

const PAYMENT_LABEL: Record<string, string> = {
  unpaid: "Payment due",
  paid: "Paid",
  refunded: "Refunded",
};

const PAYMENT_STYLE: Record<string, string> = {
  unpaid: "bg-amber-50 text-amber-800 border-amber-300",
  paid: "bg-green-50 text-green-800 border-green-300",
  refunded: "bg-navy-100 text-navy-700 border-navy-300",
};

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer)
    redirect("/account/login?next=" + encodeURIComponent("/account"));

  const reservations = await getReservationsByCustomer(customer.id);

  return (
    <>
      <PageHero
        image="/images/hero-contact.jpg"
        eyebrow="Guest Account"
        title={`Welcome back, ${customer.name.split(" ")[0]}`}
        description="Your reservations, add-ons, and payment status, all in one place."
      />

      <section className="bg-ivory-50 py-20 px-6 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex flex-wrap gap-4">
              <Link
                href="/account/cart"
                className="inline-flex items-center border border-gold-500 px-5 py-2.5 text-sm tracking-widest-plus text-gold-600 hover:bg-gold-500 hover:text-navy-950 transition-colors"
              >
                VIEW CART
              </Link>
              <Link
                href="/rooms"
                className="inline-flex items-center border border-navy-900/20 px-5 py-2.5 text-sm tracking-widest-plus text-navy-700 hover:border-navy-900 transition-colors"
              >
                BROWSE ROOMS
              </Link>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm tracking-widest-plus text-navy-700 hover:text-navy-900 border border-navy-900/20 px-4 py-2.5"
              >
                SIGN OUT
              </button>
            </form>
          </div>

          {!customer.emailVerified && (
            <div className="mb-10 border border-amber-300 bg-amber-50 text-amber-800 text-sm px-4 py-3 rounded">
              Your email address isn&apos;t confirmed yet — check your inbox for
              the confirmation link.
            </div>
          )}

          <h2 className="font-serif text-2xl text-navy-900 mb-6">
            Your Reservations
          </h2>

          {reservations.length === 0 ? (
            <p className="text-sm text-navy-700">
              You don&apos;t have any reservations yet.{" "}
              <Link href="/rooms" className="text-gold-600 hover:text-gold-500">
                Browse rooms
              </Link>{" "}
              to get started.
            </p>
          ) : (
            <div className="space-y-4">
              {reservations.map((r) => (
                <Link
                  key={r.code}
                  href={`/account/reservations/${r.code}`}
                  className="block border border-navy-900/10 p-6 hover:border-gold-500 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-serif text-lg text-navy-900">
                        {r.code}
                      </p>
                      <p className="mt-1 text-sm text-navy-700">
                        {r.checkIn && r.checkOut
                          ? `${r.checkIn} → ${r.checkOut}`
                          : `${r.items.length} item${r.items.length === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block text-xs tracking-widest-plus border px-3 py-1.5 rounded ${
                          PAYMENT_STYLE[r.paymentStatus] ?? PAYMENT_STYLE.unpaid
                        }`}
                      >
                        {(
                          PAYMENT_LABEL[r.paymentStatus] ?? r.paymentStatus
                        ).toUpperCase()}
                      </span>
                      <p className="mt-2 font-serif text-xl text-navy-900">
                        ${r.total}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
