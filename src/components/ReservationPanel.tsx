"use client";

import { useMemo, useState } from "react";
import type { Room } from "@/lib/data";

type Props = {
  rooms: Room[];
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: string;
  defaultRoom?: string;
};

function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  const start = new Date(a);
  const end = new Date(b);
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

// Availability is grounded in what's set in the admin panel (available /
// unitsLeft on the room). The date is hashed only to add a little
// day-to-day variety within that admin-set ceiling — a room the admin has
// marked unavailable, or with 0 units left, always shows as unavailable.
function checkAvailability(room: Room, checkIn: string) {
  if (!room.available || room.unitsLeft <= 0) {
    return { available: false, unitsLeft: 0 };
  }
  let hash = 0;
  const key = room.slug + checkIn;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) % 1000;
  }
  const available = hash % 5 !== 0; // ~80% of dates show as available
  const unitsLeft = available ? 1 + (hash % room.unitsLeft) : 0;
  return { available, unitsLeft };
}

export default function ReservationPanel({
  rooms,
  defaultCheckIn = "",
  defaultCheckOut = "",
  defaultGuests = "2",
  defaultRoom,
}: Props) {
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(defaultGuests);
  const [roomSlug, setRoomSlug] = useState(defaultRoom ?? rooms[0]?.slug ?? "");
  const [submitted, setSubmitted] = useState(false);

  const room = rooms.find((r) => r.slug === roomSlug) ?? rooms[0];
  const nights = nightsBetween(checkIn, checkOut);
  const availability = useMemo(
    () => (submitted && room ? checkAvailability(room, checkIn) : null),
    [submitted, room, checkIn]
  );

  const subtotal = nights > 0 && room ? nights * room.price : 0;
  const taxesAndFees = Math.round(subtotal * 0.12);
  const total = subtotal + taxesAndFees;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (!room) {
    return (
      <div id="reserve" className="bg-charcoal-950 text-ivory-50 p-8 lg:p-10">
        <p className="text-sm text-ivory-200/70">
          No rooms are configured yet. Add one from the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div id="reserve" className="bg-charcoal-950 text-ivory-50 p-8 lg:p-10">
      <p className="text-xs tracking-widest-plus text-gold-400 mb-2">
        RESERVATION
      </p>
      <h3 className="font-serif text-2xl mb-8">Check Availability</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[11px] tracking-widest-plus text-ivory-200/60 mb-2">
            ROOM TYPE
          </label>
          <select
            value={roomSlug}
            onChange={(e) => {
              setRoomSlug(e.target.value);
              setSubmitted(false);
            }}
            className="w-full bg-transparent border-b border-ivory-200/30 py-2 text-sm focus:outline-none focus:border-gold-400 [color-scheme:dark]"
          >
            {rooms.map((r) => (
              <option key={r.slug} value={r.slug} className="text-charcoal-900">
                {r.name} — ${r.price}/night
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] tracking-widest-plus text-ivory-200/60 mb-2">
              CHECK-IN
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setSubmitted(false);
              }}
              className="w-full bg-transparent border-b border-ivory-200/30 py-2 text-sm focus:outline-none focus:border-gold-400 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-widest-plus text-ivory-200/60 mb-2">
              CHECK-OUT
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => {
                setCheckOut(e.target.value);
                setSubmitted(false);
              }}
              className="w-full bg-transparent border-b border-ivory-200/30 py-2 text-sm focus:outline-none focus:border-gold-400 [color-scheme:dark]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] tracking-widest-plus text-ivory-200/60 mb-2">
            GUESTS
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full bg-transparent border-b border-ivory-200/30 py-2 text-sm focus:outline-none focus:border-gold-400 [color-scheme:dark]"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n} className="text-charcoal-900">
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!checkIn || !checkOut || nights <= 0}
          className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-charcoal-950 text-xs tracking-widest-plus py-4 transition-colors"
        >
          CHECK AVAILABILITY
        </button>

        {checkIn && checkOut && nights <= 0 && (
          <p className="text-xs text-gold-400">
            Check-out date must be after check-in.
          </p>
        )}
      </form>

      {submitted && nights > 0 && availability && (
        <div className="mt-8 border-t border-ivory-200/15 pt-6">
          {availability.available ? (
            <>
              <p className="text-sm text-gold-400 mb-4">
                {room.name} is available — {availability.unitsLeft} left for
                these dates.
              </p>
              <div className="space-y-2 text-sm text-ivory-200/80">
                <div className="flex justify-between">
                  <span>
                    ${room.price} &times; {nights}{" "}
                    {nights === 1 ? "night" : "nights"}
                  </span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & fees (est.)</span>
                  <span>${taxesAndFees}</span>
                </div>
                <div className="flex justify-between font-serif text-lg text-ivory-50 pt-3 border-t border-ivory-200/15">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
              <button
                type="button"
                className="mt-6 w-full border border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-charcoal-950 text-xs tracking-widest-plus py-3.5 transition-colors"
              >
                CONTINUE TO BOOK
              </button>
              <p className="mt-3 text-[11px] text-ivory-200/40 leading-relaxed">
                This is a design preview — booking is not yet connected to a
                live reservation system.
              </p>
            </>
          ) : (
            <p className="text-sm text-ivory-200/70">
              {room.name} is fully booked for these dates. Try adjusting your
              dates or exploring another room type above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
