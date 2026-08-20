import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getAboutContent } from "@/lib/about-repo";
import { saveAboutAction } from "@/app/admin/actions";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { saved } = await searchParams;
  const about = await getAboutContent();
  const valuesText = about.values
    .map((v) => `${v.title} :: ${v.text}`)
    .join("\n");

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <AdminHeader title="About Us" />

      {saved && (
        <p className="mb-6 text-sm text-green-800 bg-green-50 border border-green-300 rounded px-4 py-2.5">
          Saved.
        </p>
      )}

      <form action={saveAboutAction} className="space-y-8">
        <Field label="HERO TITLE">
          <input name="heroTitle" defaultValue={about.heroTitle} required className="input" />
        </Field>

        <Field label="HERO DESCRIPTION">
          <textarea
            name="heroDescription"
            defaultValue={about.heroDescription}
            rows={2}
            required
            className="input"
          />
        </Field>

        <Field label="STORY SECTION HEADING">
          <input
            name="storyHeading"
            defaultValue={about.storyHeading}
            required
            className="input"
          />
        </Field>

        <Field label="STORY (one paragraph per line)">
          <textarea
            name="storyParagraphs"
            defaultValue={about.storyParagraphs.join("\n")}
            rows={6}
            required
            className="input font-mono text-xs"
          />
        </Field>

        <Field label="TEAM PHOTO URL">
          <input name="teamImage" defaultValue={about.teamImage} required className="input" />
        </Field>

        <Field label="WHAT WE VALUE (one per line, format: Title :: Description)">
          <textarea
            name="values"
            defaultValue={valuesText}
            rows={5}
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
