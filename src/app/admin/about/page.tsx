import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getAboutContent } from "@/lib/about-repo";
import { saveAboutAction } from "@/app/admin/actions";
import AdminHeader from "@/components/AdminHeader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageField from "@/components/admin/ImageField";

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
        <Field label="Hero title">
          <input name="heroTitle" defaultValue={about.heroTitle} required className="input" />
        </Field>

        <Field label="Hero description">
          <textarea
            name="heroDescription"
            defaultValue={about.heroDescription}
            rows={2}
            required
            className="input"
          />
        </Field>

        <Field label="Story section heading">
          <input
            name="storyHeading"
            defaultValue={about.storyHeading}
            required
            className="input"
          />
        </Field>

        <RichTextEditor
          name="story"
          label="Our story"
          defaultValue={about.story}
          hint="Use headings, links and photos to tell the hotel's story."
        />

        <ImageField
          name="teamImage"
          label="Team photo"
          defaultValue={about.teamImage ? [about.teamImage] : []}
          multiple={false}
        />

        <Field label="What we value (one per line — Title :: Description)">
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
