import { saveAddOnAction, deleteAddOnAction } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import type { AddOn } from "@/lib/data";

const emptyAddOn: AddOn = {
  slug: "",
  name: "",
  image: "",
  images: [],
  category: "Tour",
  duration: "",
  price: 0,
  unit: "per guest",
  description: "",
  longDescription: [],
  includes: [],
  meetingPoint: "",
};

export default function AddOnForm({ item }: { item?: AddOn }) {
  const initial = item ?? emptyAddOn;
  const isNew = !item;
  const boundSave = saveAddOnAction.bind(null, initial.slug);
  const boundDelete = deleteAddOnAction.bind(null, initial.slug);

  return (
    <>
      <form action={boundSave} className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="SLUG (URL-friendly id)">
            <input
              name="slug"
              defaultValue={initial.slug}
              required
              pattern="[a-z0-9\-]+"
              title="Lowercase letters, numbers, and hyphens only"
              className="input"
            />
          </Field>
          <Field label="NAME">
            <input name="name" defaultValue={initial.name} required className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="CATEGORY">
            <select name="category" defaultValue={initial.category} className="input">
              <option value="Tour">Tour</option>
              <option value="Transfer">Transfer</option>
            </select>
          </Field>
          <Field label="DURATION">
            <input
              name="duration"
              defaultValue={initial.duration}
              placeholder="3 hours"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="PRICE ($)">
            <input
              type="number"
              name="price"
              min={0}
              defaultValue={initial.price}
              required
              className="input"
            />
          </Field>
          <Field label="UNIT">
            <input
              name="unit"
              defaultValue={initial.unit}
              placeholder="per guest"
              className="input"
            />
          </Field>
        </div>

        <Field label="MEETING POINT">
          <input
            name="meetingPoint"
            defaultValue={initial.meetingPoint}
            placeholder="Hotel lobby, 9:00 AM"
            className="input"
          />
        </Field>

        <Field label="SHORT DESCRIPTION (shown on cards)">
          <textarea
            name="description"
            defaultValue={initial.description}
            rows={2}
            className="input"
          />
        </Field>

        <Field label="FULL DESCRIPTION (one paragraph per line)">
          <textarea
            name="longDescription"
            defaultValue={initial.longDescription.join("\n")}
            rows={5}
            className="input font-mono text-xs"
          />
        </Field>

        <Field label="WHAT'S INCLUDED (one per line)">
          <textarea
            name="includes"
            defaultValue={initial.includes.join("\n")}
            rows={4}
            className="input font-mono text-xs"
          />
        </Field>

        <Field label="IMAGES (one URL per line — first is the cover photo)">
          <textarea
            name="images"
            defaultValue={initial.images.join("\n")}
            rows={5}
            className="input font-mono text-xs"
          />
        </Field>

        <div className="pt-4 border-t border-charcoal-900/10">
          <button
            type="submit"
            className="bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-xs tracking-widest-plus px-6 py-3.5"
          >
            {isNew ? "CREATE EXPERIENCE" : "SAVE CHANGES"}
          </button>
        </div>
      </form>

      {!isNew && (
        <form action={boundDelete} className="mt-4">
          <ConfirmSubmitButton
            confirmMessage={`Delete "${initial.name}"? This can't be undone.`}
            className="text-xs tracking-widest-plus text-red-700 hover:text-red-800"
          >
            DELETE
          </ConfirmSubmitButton>
        </form>
      )}
    </>
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
