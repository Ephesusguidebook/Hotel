import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings-repo";
import { saveSettingsAction } from "@/app/admin/actions";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { saved } = await searchParams;
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <AdminHeader title="Site Settings" />

      {saved && (
        <p className="mb-6 text-sm text-green-800 bg-green-50 border border-green-300 rounded px-4 py-2.5">
          Saved.
        </p>
      )}

      <p className="mb-8 text-sm text-charcoal-700">
        These details power the footer, the Contact page, and the site&apos;s
        page titles.
      </p>

      <form action={saveSettingsAction} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Hotel name">
            <input
              name="hotelName"
              defaultValue={settings.hotelName}
              required
              className="input"
            />
          </Field>
          <Field label="Tagline">
            <input
              name="tagline"
              defaultValue={settings.tagline}
              required
              className="input"
            />
          </Field>
        </div>

        <Field label="City / region">
          <input name="city" defaultValue={settings.city} required className="input" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Phone">
            <input name="phone" defaultValue={settings.phone} required className="input" />
          </Field>
          <Field label="Email">
            <input
              type="email"
              name="email"
              defaultValue={settings.email}
              required
              className="input"
            />
          </Field>
        </div>

        <Field label="Address">
          <input name="address" defaultValue={settings.address} required className="input" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Field label="Check-in">
            <input
              name="checkIn"
              defaultValue={settings.checkIn}
              required
              className="input"
            />
          </Field>
          <Field label="Check-out">
            <input
              name="checkOut"
              defaultValue={settings.checkOut}
              required
              className="input"
            />
          </Field>
          <Field label="Front desk hours">
            <input
              name="frontDeskHours"
              defaultValue={settings.frontDeskHours}
              required
              className="input"
            />
          </Field>
        </div>

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
