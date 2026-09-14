import { today, addDays } from "@/lib/dates";

type Props = {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  compact?: boolean;
};

/**
 * The one availability search on the site.
 *
 * A plain GET form on purpose: it puts the dates in the URL, so a search can
 * be bookmarked, shared, and reached with the back button, and the rooms
 * page stays a server component with no client-side state to drift out of
 * sync with what's rendered.
 */
export default function AvailabilitySearch({
  checkIn = "",
  checkOut = "",
  guests = "2",
  compact = false,
}: Props) {
  const minDate = today();
  // Nudge check-out past check-in so the browser's own picker guides them.
  const minCheckOut = checkIn ? addDays(checkIn, 1) : addDays(minDate, 1);

  return (
    <form
      method="get"
      action="/rooms"
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end ${
        compact ? "" : "border border-charcoal-900/10 bg-white p-6"
      }`}
    >
      <Field label="Check-in">
        <input
          type="date"
          name="checkIn"
          defaultValue={checkIn}
          min={minDate}
          required
          className="input"
        />
      </Field>

      <Field label="Check-out">
        <input
          type="date"
          name="checkOut"
          defaultValue={checkOut}
          min={minCheckOut}
          required
          className="input"
        />
      </Field>

      <Field label="Guests">
        <select name="guests" defaultValue={guests} className="input">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </Field>

      <button
        type="submit"
        className="bg-charcoal-900 px-6 py-3 text-sm tracking-widest-plus text-ivory-50 transition-colors hover:bg-charcoal-800"
      >
        CHECK AVAILABILITY
      </button>
    </form>
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
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
