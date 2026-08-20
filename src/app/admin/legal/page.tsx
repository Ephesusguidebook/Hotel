import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/auth";
import { getLegalPage } from "@/lib/legal-repo";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminLegalPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const [privacy, terms] = await Promise.all([
    getLegalPage("privacy"),
    getLegalPage("terms"),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AdminHeader title="Legal Pages" />

      <div className="border border-charcoal-900/10 divide-y divide-charcoal-900/10">
        {[privacy, terms].map((page) => (
          <Link
            key={page.slug}
            prefetch={false}
            href={`/admin/legal/${page.slug}`}
            className="flex items-center justify-between px-6 py-5 hover:bg-ivory-100 transition-colors"
          >
            <div>
              <p className="font-serif text-lg text-charcoal-900">{page.title}</p>
              <p className="text-xs text-charcoal-700/70 mt-1">
                Last updated: {page.updated} &middot; {page.sections.length} sections
              </p>
            </div>
            <span className="text-xs tracking-widest-plus text-gold-600">
              EDIT &rarr;
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
