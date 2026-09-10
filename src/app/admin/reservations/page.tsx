import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/auth";
import { getAllReservations } from "@/lib/reservations-repo";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

const PAYMENT_STYLE: Record<string, string> = {
  unpaid: "bg-amber-50 text-amber-800 border-amber-300",
  paid: "bg-green-50 text-green-800 border-green-300",
  refunded: "bg-charcoal-100 text-charcoal-700 border-charcoal-300",
};

export default async function AdminReservationsPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const reservations = await getAllReservations();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AdminHeader title="Reservations" />

      {reservations.length === 0 ? (
        <p className="text-sm text-charcoal-700">No reservations yet.</p>
      ) : (
        <div className="border border-charcoal-900/10 divide-y divide-charcoal-900/10">
          {reservations.map((r) => (
            <Link
              key={r.code}
              prefetch={false}
              href={`/admin/reservations/${r.code}`}
              className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-ivory-50 transition-colors"
            >
              <div>
                <p className="font-serif text-lg text-charcoal-900">{r.code}</p>
                <p className="mt-1 text-sm text-charcoal-700">
                  {r.customerName} &middot; {r.customerEmail}
                </p>
                {r.checkIn && r.checkOut && (
                  <p className="mt-1 text-xs text-charcoal-700/60">
                    {r.checkIn} → {r.checkOut}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span
                  className={`inline-block text-[11px] tracking-widest-plus border px-3 py-1.5 rounded ${
                    PAYMENT_STYLE[r.paymentStatus] ?? PAYMENT_STYLE.unpaid
                  }`}
                >
                  {r.paymentStatus.toUpperCase()}
                </span>
                <p className="mt-2 font-serif text-xl text-charcoal-900">${r.total}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
