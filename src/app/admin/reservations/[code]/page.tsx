import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/auth";
import { getReservationByCode, getAllReservations } from "@/lib/reservations-repo";
import { updateReservationAction } from "@/app/admin/actions";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

type Params = Promise<{ code: string }>;

export default async function AdminReservationDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ saved?: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const { code } = await params;
  const { saved } = await searchParams;
  const reservation = await getReservationByCode(code);
  if (!reservation) notFound();

  const all = await getAllReservations();
  const withContact = all.find((r) => r.code === code);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <AdminHeader title={`Reservation ${reservation.code}`} />

      <Link
        prefetch={false}
        href="/admin/reservations"
        className="text-sm tracking-widest-plus text-gold-600 hover:text-gold-500 inline-flex items-center gap-2"
      >
        <span aria-hidden>&larr;</span> BACK TO RESERVATIONS
      </Link>

      {saved === "1" && (
        <p className="mt-6 text-sm text-green-800 bg-green-50 border border-green-300 rounded px-4 py-3">
          Saved.
        </p>
      )}

      <div className="mt-8 border border-charcoal-900/10 p-6">
        <p className="text-sm tracking-widest-plus text-gold-600 mb-1">GUEST</p>
        <p className="text-sm text-charcoal-900">
          {withContact?.customerName} &middot; {withContact?.customerEmail}
        </p>
        {reservation.checkIn && reservation.checkOut && (
          <p className="mt-3 text-sm text-charcoal-700">
            {reservation.checkIn} → {reservation.checkOut}
          </p>
        )}
        <p className="mt-1 text-xs text-charcoal-700/60">Placed {reservation.createdAt}</p>
      </div>

      <h2 className="mt-10 font-serif text-xl text-charcoal-900 mb-4">Itemized Accounting</h2>
      <div className="border border-charcoal-900/10 divide-y divide-charcoal-900/10">
        {reservation.items.map((item) => (
          <div key={item.id} className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm tracking-widest-plus text-gold-600 mb-1">
                {item.itemType === "room" ? "ROOM" : "TOUR / TRANSFER"}
              </p>
              <p className="text-sm text-charcoal-900">{item.itemName}</p>
              <p className="mt-1 text-xs text-charcoal-500">
                {item.itemType === "room"
                  ? `${item.checkIn} → ${item.checkOut} · $${item.unitPrice}/night × ${item.quantity}`
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

      <form
        action={updateReservationAction.bind(null, reservation.id, reservation.code)}
        className="mt-10 border border-charcoal-900/10 p-6 space-y-5"
      >
        <h2 className="font-serif text-lg text-charcoal-900">Update Status</h2>
        <label className="block">
          <span className="text-sm font-medium text-charcoal-800">
            PAYMENT STATUS
          </span>
          <select
            name="paymentStatus"
            defaultValue={reservation.paymentStatus}
            className="mt-2 w-full border-b border-charcoal-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-charcoal-800">
            RESERVATION STATUS
          </span>
          <select
            name="status"
            defaultValue={reservation.status}
            className="mt-2 w-full border-b border-charcoal-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <button
          type="submit"
          className="bg-charcoal-900 hover:bg-charcoal-800 text-ivory-50 text-sm tracking-widest-plus px-8 py-3.5 transition-colors"
        >
          SAVE
        </button>
      </form>
    </div>
  );
}
