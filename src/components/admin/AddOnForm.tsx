import { saveAddOnAction, deleteAddOnAction } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageField from "@/components/admin/ImageField";
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
  longDescription: "",
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
          <Field label="URL slug">
            <input
              name="slug"
              defaultValue={initial.slug}
              required
              pattern="[a-z0-9\-]+"
              title="Lowercase letters, numbers, and hyphens only"
              className="input"
            />
          </Field>
          <Field label="Name">
            <input name="name" defaultValue={initial.name} required className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Category">
            <select name="category" defaultValue={initial.category} className="input">
              <option value="Tour">Tour</option>
              <option value="Transfer">Transfer</option>
            </select>
          </Field>
          <Field label="Duration">
            <input
              name="duration"
              defaultValue={initial.duration}
              placeholder="3 hours"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Field label="Price ($)">
            <input
              type="number"
              name="price"
              min={0}
              defaultValue={initial.price}
              required
              className="input"
            />
          </Field>
          <Field label="Unit">
            <input
              name="unit"
              defaultValue={initial.unit}
              placeholder="per guest"
              className="input"
            />
          </Field>
        </div>

        <Field label="Meeting point">
          <input
            name="meetingPoint"
            defaultValue={initial.meetingPoint}
            placeholder="Hotel lobby, 9:00 AM"
            className="input"
          />
        </Field>

        <Field label="Short description (shown on cards)">
          <textarea
            name="description"
            defaultValue={initial.description}
            rows={2}
            className="input"
          />
        </Field>

        <RichTextEditor
          name="longDescription"
          label="Full description"
          defaultValue={initial.longDescription}
          hint="Shown on the tour's own page. Add headings, links and photos as needed."
        />

        <Field label="What’s included (one per line)">
          <textarea
            name="includes"
            defaultValue={initial.includes.join("\n")}
            rows={4}
            className="input font-mono text-xs"
          />
        </Field>

        <ImageField
          name="images"
          label="Photos"
          defaultValue={initial.images}
          hint="The first photo is the cover. Use the arrows to reorder."
        />

        <div className="pt-4 border-t border-navy-900/10">
          <button
            type="submit"
            className="bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm tracking-widest-plus px-6 py-3.5"
          >
            {isNew ? "CREATE EXPERIENCE" : "SAVE CHANGES"}
          </button>
        </div>
      </form>

      {!isNew && (
        <form action={boundDelete} className="mt-4">
          <ConfirmSubmitButton
            confirmMessage={`Delete "${initial.name}"? This can't be undone.`}
            className="text-sm tracking-widest-plus text-red-700 hover:text-red-800"
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
      <span className="text-sm font-medium text-navy-800">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
