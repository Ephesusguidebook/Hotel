import { redirect, notFound } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getLegalPage } from "@/lib/legal-repo";
import { saveLegalAction } from "@/app/admin/actions";
import AdminHeader from "@/components/AdminHeader";
import RichTextEditor from "@/components/admin/RichTextEditor";

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
          <Field label="Page title">
            <input name="title" defaultValue={page.title} required className="input" />
          </Field>
          <Field label="“Last updated” label (e.g. August 2026)">
            <input name="updated" defaultValue={page.updated} required className="input" />
          </Field>
        </div>

        <RichTextEditor
          name="content"
          label="Page content"
          defaultValue={page.content}
          hint="Use the heading buttons for each numbered section."
          minHeight="30rem"
        />

        <div className="pt-4 border-t border-charcoal-900/10">
          <button
            type="submit"
            className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-sm tracking-widest-plus px-6 py-3.5"
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
      <span className="text-sm font-medium text-charcoal-800">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
