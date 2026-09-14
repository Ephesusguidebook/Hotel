import Link from "next/link";
import PageHero from "@/components/PageHero";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getCartSummary, nightsBetween } from "@/lib/cart-repo";
import {
  removeCartItemAction,
  updateCartItemAction,
  clearCartAction,
  checkoutAction,
} from "@/app/account/actions";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings-repo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Your Cart — ${settings.hotelName}`,
  };
}

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; checkoutError?: string }>;
}) {
  const customer = await getCurrentCustomer();
  if (!customer)
    redirect("/account/login?next=" + encodeURIComponent("/account/cart"));

  const { added, checkoutError } = await searchParams;
  const { items, subtotal, taxesAndFees, total } = await getCartSummary(
    customer.id,
  );

  return (
    <>
      <PageHero
        image="/images/hero-rooms.jpg"
        eyebrow="Your Trip"
        title="Cart"
      />

      <section className="bg-ivory-50 py-20 px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          {added === "1" && (
            <p className="mb-8 text-sm text-green-800 bg-green-50 border border-green-300 rounded px-4 py-3">
              Added to your cart.
            </p>
          )}
          {checkoutError && (
            <p className="mb-8 text-sm text-red-700 bg-red-50 border border-red-300 rounded px-4 py-3">
              {checkoutError}
            </p>
          )}

          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-navy-700">Your cart is empty.</p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href="/rooms"
                  className="inline-flex items-center border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-ivory-50 px-5 py-2.5 text-sm tracking-widest-plus transition-colors"
                >
                  BROWSE ROOMS
                </Link>
                <Link
                  href="/add-ons"
                  className="inline-flex items-center border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-ivory-50 px-5 py-2.5 text-sm tracking-widest-plus transition-colors"
                >
                  BROWSE TOURS & TRANSFERS
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-navy-900/10 p-6 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs tracking-widest-plus text-gold-600 mb-1">
                        {item.itemType === "room" ? "ROOM" : "TOUR / TRANSFER"}
                      </p>
                      <p className="font-serif text-lg text-navy-900">
                        {item.itemName}
                      </p>
                      {item.itemType === "room" ? (
                        <>
                          {item.ratePlanName && (
                            <p className="mt-1 text-sm font-medium text-gold-600">
                              {item.ratePlanName}
                            </p>
                          )}
                          <p className="mt-1 text-sm text-navy-700">
                            {item.checkIn} → {item.checkOut} &middot;{" "}
                            {nightsBetween(item.checkIn, item.checkOut)} night
                            {nightsBetween(item.checkIn, item.checkOut) === 1
                              ? ""
                              : "s"}
                            {item.guests ? ` · ${item.guests} guests` : ""}
                          </p>
                          <p className="mt-1 text-sm text-navy-500">
                            ${item.unitPrice} avg / night &middot; $
                            {item.stayTotal ?? item.unitPrice} per room for the
                            stay
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-sm text-navy-700">
                          ${item.unitPrice} each
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-5">
                      <form
                        action={updateCartItemAction.bind(null, item.id)}
                        className="flex items-center gap-2"
                      >
                        <label className="text-xs tracking-widest-plus text-navy-500">
                          {item.itemType === "room" ? "ROOMS" : "QTY"}
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          min={1}
                          defaultValue={item.quantity}
                          className="w-16 border-b border-navy-900/20 py-1 text-sm bg-transparent focus:outline-none focus:border-gold-500"
                        />
                        <button
                          type="submit"
                          className="text-xs tracking-widest-plus text-navy-700 hover:text-navy-900 border border-navy-900/20 px-3 py-2"
                        >
                          UPDATE
                        </button>
                      </form>

                      <p className="font-serif text-lg text-navy-900 w-20 text-right">
                        ${item.lineTotal}
                      </p>

                      <form action={removeCartItemAction.bind(null, item.id)}>
                        <button
                          type="submit"
                          className="text-sm text-navy-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 bg-navy-950 text-ivory-50 p-8">
                <div className="space-y-2 text-sm text-ivory-200/80">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & fees (est.)</span>
                    <span>${taxesAndFees}</span>
                  </div>
                  <div className="flex justify-between font-serif text-xl text-ivory-50 pt-3 border-t border-ivory-200/15">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <form action={checkoutAction} className="flex-1">
                    <button
                      type="submit"
                      className="w-full bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm tracking-widest-plus py-4 transition-colors"
                    >
                      CONFIRM RESERVATION
                    </button>
                  </form>
                  <form action={clearCartAction}>
                    <ConfirmSubmitButton
                      confirmMessage="Empty your cart?"
                      className="text-sm tracking-widest-plus text-ivory-200/60 hover:text-ivory-50 border border-ivory-200/20 px-5 py-4"
                    >
                      CLEAR CART
                    </ConfirmSubmitButton>
                  </form>
                </div>
                <p className="mt-4 text-xs text-ivory-200/75 leading-relaxed">
                  Confirming creates your reservation and reserves your room(s)
                  — payment is collected and tracked separately by our front
                  desk, not through this site.
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
