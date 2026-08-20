import { redirect, notFound } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getLegalPage, sectionsToText } from "@/lib/legal-repo";
import { saveLegalAction } from "@/app/admin/actions";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

function isLegalSlug(slug: string): slug is "privacy" | "terms" {
  return slug === "privacy" || slug === "terms";
}

export default async function EditLegalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { slug } = await params;
  const { saved } = await searchParams;
  if (!isLegalSlug(slug)) notFound();

  const page = await getLegalPage(slug);
  const boundSave = saveLegalAction.bind(null, slug);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <AdminHeader title={`Edit — ${page.title}`} />

      {saved && (
        <p className="mb-6 text-sm text-green-800 bg-green-50 border border-green-300 rounded px-4 py-2.5">
          Saved.
        </p>
      )}

      <form action={boundSave} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="PAGE TITLE">
            <input name="title" defaultValue={page.title} required className="input" />
          </Field>
          <Field label="LAST UPDATED LABEL (e.g. August 2026)">
            <input name="updated" defaultValue={page.updated} required className="input" />
          </Field>
        </div>

        <Field label="SECTIONS — a heading line, then its paragraphs, one section per blank-line-separated block">
          <textarea
            name="sections"
            defaultValue={sectionsToText(page.sections)}
            rows={22}
            required
            className="input font-mono text-xs"
          />
        </Field>

        <div className="pt-4 border-t border-charcoal-900/10">
          <button
            type="submit"
            className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-xs tracking-widest-plus px-6 py-3.5"
          >
            SAVE CHANGES
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-widest-plus text-charcoal-700/70">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
