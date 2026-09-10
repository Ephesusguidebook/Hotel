import { addRoomToCartAction } from "@/app/account/actions";

type Props = {
  slug: string;
  unitsLeft: number;
  available: boolean;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: string;
};

/** Server-rendered "add to cart" form for a room, shown on the public Rooms
 *  page. Submitting when signed out redirects to sign-in first (handled in
 *  addRoomToCartAction via requireCustomer). */
export default function AddRoomToCartForm({
  slug,
  unitsLeft,
  available,
  defaultCheckIn = "",
  defaultCheckOut = "",
  defaultGuests = "2",
}: Props) {
  if (!available || unitsLeft <= 0) {
    return (
      <p className="mt-8 text-sm text-charcoal-700/60 border-t border-charcoal-900/10 pt-6">
        This room isn&apos;t available to book right now.
      </p>
    );
  }

  return (
    <form
      action={addRoomToCartAction.bind(null, slug)}
      className="mt-8 border-t border-charcoal-900/10 pt-6"
    >
      <p className="text-[11px] tracking-widest-plus text-gold-600 mb-4">ADD TO YOUR TRIP</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
        <label className="block">
          <span className="text-[11px] tracking-widest-plus text-charcoal-700/60">CHECK-IN</span>
          <input
            type="date"
            name="checkIn"
            required
            defaultValue={defaultCheckIn}
            className="mt-2 w-full border-b border-charcoal-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
          />
        </label>
        <label className="block">
          <span className="text-[11px] tracking-widest-plus text-charcoal-700/60">CHECK-OUT</span>
          <input
            type="date"
            name="checkOut"
            required
            defaultValue={defaultCheckOut}
            className="mt-2 w-full border-b border-charcoal-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
          />
        </label>
        <label className="block">
          <span className="text-[11px] tracking-widest-plus text-charcoal-700/60">GUESTS</span>
          <select
            name="guests"
            defaultValue={defaultGuests}
            className="mt-2 w-full border-b border-charcoal-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[11px] tracking-widest-plus text-charcoal-700/60">ROOMS</span>
          <select
            name="quantity"
            defaultValue="1"
            className="mt-2 w-full border-b border-charcoal-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
          >
            {Array.from({ length: Math.min(unitsLeft, 5) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        className="mt-5 w-full sm:w-auto bg-charcoal-900 hover:bg-charcoal-800 text-ivory-50 text-xs tracking-widest-plus px-8 py-3.5 transition-colors"
      >
        ADD TO CART
      </button>
    </form>
  );
}
