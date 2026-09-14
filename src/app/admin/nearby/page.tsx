import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/auth";
import { getAttractions } from "@/lib/attractions-repo";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminNearbyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { saved, deleted } = await searchParams;
  const attractions = await getAttractions();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AdminHeader title="Nearby Places to Visit" />

      {saved && (
        <p className="mb-6 rounded border border-green-300 bg-green-50 px-4 py-2.5 text-sm text-green-800">
          Place saved.
        </p>
      )}
      {deleted && (
        <p className="mb-6 rounded border border-green-300 bg-green-50 px-4 py-2.5 text-sm text-green-800">
          Place deleted.
        </p>
      )}

      <div className="mb-6 flex items-center justify-between gap-6">
        <p className="max-w-xl text-base leading-relaxed text-navy-700">
          The sights guests ask about at reception. These appear on{" "}
          <Link
            href="/nearby"
            prefetch={false}
            target="_blank"
            className="text-gold-600 underline underline-offset-4"
          >
            /nearby
          </Link>{" "}
          and are for information only — they aren&apos;t booked or added to a
          cart.
        </p>
        <Link
          prefetch={false}
          href="/admin/nearby/new"
          className="shrink-0 bg-navy-900 px-5 py-3 text-sm tracking-widest-plus text-ivory-50 hover:bg-navy-800"
        >
          + ADD PLACE
        </Link>
      </div>

      <div className="divide-y divide-navy-900/10 border border-navy-900/10">
        {attractions.map((item) => (
          <Link
            key={item.slug}
            prefetch={false}
            href={`/admin/nearby/${item.slug}`}
            className="flex items-center justify-between px-6 py-5 transition-colors hover:bg-ivory-100"
          >
            <div>
              <p className="font-serif text-lg text-navy-900">
                {item.name}
              </p>
              <p className="mt-1 text-sm text-navy-500">
                {item.category} &middot; {item.distance}
                {item.travelTime ? ` · ${item.travelTime}` : ""}
              </p>
            </div>
            <span className="text-sm tracking-widest-plus text-gold-600">
              EDIT &rarr;
            </span>
          </Link>
        ))}
        {attractions.length === 0 && (
          <p className="px-6 py-8 text-base text-navy-700">
            No places yet — add the first one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
