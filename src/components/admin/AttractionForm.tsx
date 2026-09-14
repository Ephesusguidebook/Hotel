import {
  saveAttractionAction,
  deleteAttractionAction,
} from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageField from "@/components/admin/ImageField";
import type { Attraction } from "@/lib/data";

const emptyAttraction: Attraction = {
  slug: "",
  name: "",
  category: "",
  distance: "",
  travelTime: "",
  description: "",
  longDescription: "",
  highlights: [],
  openingHours: "",
  entryFee: "",
  bestTime: "",
  mapUrl: "",
  image: "",
  images: [],
};

export default function AttractionForm({
  item,
  categories = [],
}: {
  item?: Attraction;
  /** Categories already in use, offered as autocomplete suggestions. */
  categories?: string[];
}) {
  const initial = item ?? emptyAttraction;
  const isNew = !item;
  const boundSave = saveAttractionAction.bind(null, initial.slug);
  const boundDelete = deleteAttractionAction.bind(null, initial.slug);

  return (
    <>
      <form action={boundSave} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="URL slug">
            <input
              name="slug"
              defaultValue={initial.slug}
              required
              pattern="[a-z0-9\-]+"
              title="Lowercase letters, numbers, and hyphens only"
              placeholder="ephesus-ancient-city"
              className="input"
            />
          </Field>
          <Field label="Name">
            <input
              name="name"
              defaultValue={initial.name}
              required
              placeholder="Ephesus Ancient City"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Field label="Type of place">
            <input
              name="category"
              defaultValue={initial.category}
              required
              list="attraction-categories"
              placeholder="Ancient Site"
              className="input"
            />
            {/* Free text with suggestions: the public page builds its filter
                chips from whatever types are actually in use. */}
            <datalist id="attraction-categories">
              {categories.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </Field>
          <Field label="Distance from hotel">
            <input
              name="distance"
              defaultValue={initial.distance}
              required
              placeholder="3 km"
              className="input"
            />
          </Field>
          <Field label="Getting there">
            <input
              name="travelTime"
              defaultValue={initial.travelTime}
              placeholder="5 minutes by car"
              className="input"
            />
          </Field>
        </div>

        <Field label="Short description (shown on cards)">
          <textarea
            name="description"
            defaultValue={initial.description}
            rows={2}
            required
            className="input"
          />
        </Field>

        <RichTextEditor
          name="longDescription"
          label="Full description"
          defaultValue={initial.longDescription}
          hint="Shown on the place's own page. Add headings, links and photos as needed."
        />

        <Field label="What to look for (one per line)">
          <textarea
            name="highlights"
            defaultValue={initial.highlights.join("\n")}
            rows={5}
            className="input font-mono text-sm"
          />
        </Field>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Opening hours">
            <input
              name="openingHours"
              defaultValue={initial.openingHours}
              placeholder="Summer roughly 08:00–19:00"
              className="input"
            />
          </Field>
          <Field label="Entry fee">
            <input
              name="entryFee"
              defaultValue={initial.entryFee}
              placeholder="€40 (2026 season)"
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Best time to go">
            <input
              name="bestTime"
              defaultValue={initial.bestTime}
              placeholder="Early morning, before the coaches"
              className="input"
            />
          </Field>
          <Field label="Map link">
            <input
              type="url"
              name="mapUrl"
              defaultValue={initial.mapUrl}
              placeholder="https://maps.google.com/?q=..."
              className="input"
            />
          </Field>
        </div>

        <ImageField
          name="images"
          label="Photos"
          defaultValue={initial.images}
          hint="The first photo is the cover shown on the listing page. Use the arrows to reorder."
        />

        <div className="border-t border-charcoal-900/10 pt-4">
          <button
            type="submit"
            className="bg-gold-500 px-6 py-3.5 text-sm tracking-widest-plus text-charcoal-950 hover:bg-gold-400"
          >
            {isNew ? "ADD PLACE" : "SAVE CHANGES"}
          </button>
        </div>
      </form>

      {!isNew && (
        <form action={boundDelete} className="mt-4">
          <ConfirmSubmitButton
            confirmMessage={`Delete "${initial.name}"? This can't be undone.`}
            className="text-sm tracking-widest-plus text-red-700 hover:text-red-800"
          >
            DELETE PLACE
          </ConfirmSubmitButton>
        </form>
      )}
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-charcoal-800">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
