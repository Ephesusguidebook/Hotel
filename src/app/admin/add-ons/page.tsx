import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/auth";
import { getAddOns } from "@/lib/addons-repo";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminAddOnsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { saved, deleted } = await searchParams;
  const addOns = await getAddOns();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AdminHeader title="Tours & Transfers" />

      {saved && (
        <p className="mb-6 text-sm text-green-800 bg-green-50 border border-green-300 rounded px-4 py-2.5">
          Saved.
        </p>
      )}
      {deleted && (
        <p className="mb-6 text-sm text-green-800 bg-green-50 border border-green-300 rounded px-4 py-2.5">
          Deleted.
        </p>
      )}

      <div className="flex justify-end mb-6">
        <Link
          prefetch={false}
          href="/admin/add-ons/new"
          className="text-sm tracking-widest-plus bg-navy-900 hover:bg-navy-800 text-ivory-50 px-5 py-3"
        >
          + ADD EXPERIENCE
        </Link>
      </div>

      <div className="border border-navy-900/10 divide-y divide-navy-900/10">
        {addOns.map((item) => (
          <Link
            key={item.slug}
            prefetch={false}
            href={`/admin/add-ons/${item.slug}`}
            className="flex items-center justify-between px-6 py-5 hover:bg-ivory-100 transition-colors"
          >
            <div>
              <p className="font-serif text-lg text-navy-900">
                {item.name}
              </p>
              <p className="text-xs text-navy-500 mt-1">
                {item.category} &middot; ${item.price} {item.unit} &middot;{" "}
                {item.duration}
              </p>
            </div>
            <span className="text-sm tracking-widest-plus text-gold-600">
              EDIT &rarr;
            </span>
          </Link>
        ))}
        {addOns.length === 0 && (
          <p className="px-6 py-8 text-sm text-navy-700">
            No tours or transfers yet — add one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
