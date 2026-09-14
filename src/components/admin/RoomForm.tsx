import { saveRoomAction, deleteRoomAction } from "@/app/admin/actions";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import ImageField from "@/components/admin/ImageField";
import type { Room } from "@/lib/data";

const emptyRoom: Room = {
  slug: "",
  name: "",
  image: "",
  images: [],
  size: "",
  occupancy: "",
  bed: "",
  price: 0,
  description: "",
  amenities: [],
  available: true,
  unitsLeft: 3,
};

export default function RoomForm({ room }: { room?: Room }) {
  const initial = room ?? emptyRoom;
  const isNew = !room;
  const boundSave = saveRoomAction.bind(null, initial.slug);
  const boundDelete = deleteRoomAction.bind(null, initial.slug);

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Field label="Price per night ($)">
          <input
            type="number"
            name="price"
            min={0}
            defaultValue={initial.price}
            required
            className="input"
          />
        </Field>
        <Field label="Size">
          <input name="size" defaultValue={initial.size} placeholder="38 m²" className="input" />
        </Field>
        <Field label="Occupancy">
          <input
            name="occupancy"
            defaultValue={initial.occupancy}
            placeholder="2 guests"
            className="input"
          />
        </Field>
      </div>

      <Field label="Bed configuration">
        <input name="bed" defaultValue={initial.bed} placeholder="1 King bed" className="input" />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          defaultValue={initial.description}
          rows={3}
          className="input"
        />
      </Field>

      <Field label="Amenities (one per line)">
        <textarea
          name="amenities"
          defaultValue={initial.amenities.join("\n")}
          rows={5}
          className="input font-mono text-xs"
        />
      </Field>

      <ImageField
        name="images"
        label="Photos"
        defaultValue={initial.images}
        hint="The first photo is the cover shown on the rooms page. Use the arrows to reorder."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="available"
            defaultChecked={initial.available}
            className="w-4 h-4"
          />
          <span className="text-sm text-navy-900">Available for booking</span>
        </label>
        <Field label="Units left">
          <input
            type="number"
            name="unitsLeft"
            min={0}
            defaultValue={initial.unitsLeft}
            className="input"
          />
        </Field>
      </div>

      <div className="pt-4 border-t border-navy-900/10">
        <button
          type="submit"
          className="bg-gold-500 hover:bg-gold-400 text-navy-950 text-sm tracking-widest-plus px-6 py-3.5"
        >
          {isNew ? "CREATE ROOM" : "SAVE CHANGES"}
        </button>
      </div>
    </form>

      {!isNew && (
        <form action={boundDelete} className="mt-4">
          <ConfirmSubmitButton
            confirmMessage={`Delete "${initial.name}"? This can't be undone.`}
            className="text-sm tracking-widest-plus text-red-700 hover:text-red-800"
          >
            DELETE ROOM
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
