"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuickSearch() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/rooms?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-charcoal-950/85 backdrop-blur-sm border border-gold-500/30 px-6 py-6 md:px-8 md:py-7 grid grid-cols-2 md:grid-cols-5 gap-5 md:gap-4 items-end w-full"
    >
      <label className="flex flex-col gap-2 col-span-1">
        <span className="text-[11px] tracking-widest-plus text-gold-400">
          CHECK-IN
        </span>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="bg-transparent border-b border-ivory-200/30 text-ivory-50 text-sm py-1.5 focus:outline-none focus:border-gold-400 [color-scheme:dark]"
        />
      </label>

      <label className="flex flex-col gap-2 col-span-1">
        <span className="text-[11px] tracking-widest-plus text-gold-400">
          CHECK-OUT
        </span>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="bg-transparent border-b border-ivory-200/30 text-ivory-50 text-sm py-1.5 focus:outline-none focus:border-gold-400 [color-scheme:dark]"
        />
      </label>

      <label className="flex flex-col gap-2 col-span-1">
        <span className="text-[11px] tracking-widest-plus text-gold-400">
          GUESTS
        </span>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="bg-transparent border-b border-ivory-200/30 text-ivory-50 text-sm py-1.5 focus:outline-none focus:border-gold-400 [color-scheme:dark]"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n} className="text-charcoal-900">
              {n} {n === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="col-span-2 md:col-span-2 bg-gold-500 hover:bg-gold-400 text-charcoal-950 text-xs tracking-widest-plus py-3.5 px-6 transition-colors"
      >
        CHECK AVAILABILITY
      </button>
    </form>
  );
}
