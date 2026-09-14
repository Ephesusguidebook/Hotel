import { safeQuery, getPool } from "@/lib/db";
import type { PoolConnection } from "mysql2/promise";
import { nightsOf, datesInRange } from "@/lib/dates";
import { getRooms } from "@/lib/rooms-repo";
import {
  getRatePlans,
  getRatesForRooms,
  nightlyPrices,
  stayTotal,
  type RatePlan,
  type NightlyPrice,
} from "@/lib/rates-repo";
import type { Room } from "@/lib/data";

export type DayAvailability = {
  date: string;
  /** Rooms of this type open for sale that day, before bookings. */
  units: number;
  /** Rooms already taken by live reservations. */
  booked: number;
  /** What a guest can actually book. */
  free: number;
  /** Shut by hand in the admin calendar. */
  closed: boolean;
  note: string;
  /** True when this date carries a manual override row. */
  overridden: boolean;
};

type OverrideRow = {
  date: string;
  units: number;
  closed: number;
  note: string;
};

type BookedRow = {
  quantity: number;
  check_in: string;
  check_out: string;
};

// --- Manual overrides -------------------------------------------------------

async function getOverrides(
  roomSlug: string,
  from: string,
  to: string
): Promise<Map<string, OverrideRow>> {
  const map = new Map<string, OverrideRow>();
  const rows = await safeQuery<OverrideRow>(
    `SELECT date, units, closed, note FROM room_availability
     WHERE room_slug = ? AND date BETWEEN ? AND ?`,
    [roomSlug, from, to]
  );
  if (!rows) return map;
  for (const row of rows) map.set(row.date, row);
  return map;
}

export type AvailabilityOverrideInput = {
  roomSlug: string;
  date: string;
  units: number;
  closed: boolean;
  note: string;
};

export async function setAvailabilityOverride(
  input: AvailabilityOverrideInput
): Promise<boolean> {
  const result = await safeQuery(
    `INSERT INTO room_availability (room_slug, date, units, closed, note)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE units = VALUES(units), closed = VALUES(closed), note = VALUES(note)`,
    [input.roomSlug, input.date, input.units, input.closed ? 1 : 0, input.note]
  );
  return result !== null;
}

/** Drop the override so the date goes back to the room's standing stock. */
export async function clearAvailabilityOverride(
  roomSlug: string,
  date: string
): Promise<boolean> {
  const result = await safeQuery(
    "DELETE FROM room_availability WHERE room_slug = ? AND date = ?",
    [roomSlug, date]
  );
  return result !== null;
}

export async function setRangeOverride(
  roomSlug: string,
  from: string,
  to: string,
  units: number,
  closed: boolean,
  note: string
): Promise<number> {
  const dates = datesInRange(from, to);
  let written = 0;
  for (const date of dates) {
    const ok = await setAvailabilityOverride({
      roomSlug,
      date,
      units,
      closed,
      note,
    });
    if (ok) written++;
  }
  return written;
}

// --- What's already booked --------------------------------------------------

/**
 * Rooms held per date by live reservations. Cancelled bookings release their
 * nights; carts do not hold anything, since an item sitting in a cart is not
 * a commitment and holding stock for it would let one browser block a room
 * indefinitely.
 *
 * Pass `conn` to read inside an open transaction at checkout.
 */
async function getBookedUnits(
  roomSlug: string,
  from: string,
  to: string,
  conn?: PoolConnection
): Promise<Map<string, number>> {
  const booked = new Map<string, number>();
  const sql = `SELECT ri.quantity, ri.check_in, ri.check_out
     FROM reservation_items ri
     JOIN reservations res ON res.id = ri.reservation_id
     WHERE ri.item_type = 'room' AND ri.item_slug = ?
       AND res.status <> 'cancelled'
       AND ri.check_in IS NOT NULL AND ri.check_out IS NOT NULL
       AND ri.check_in <= ? AND ri.check_out > ?`;
  const params = [roomSlug, to, from];

  let rows: BookedRow[] | null;
  if (conn) {
    const [result] = await conn.query(sql, params);
    rows = result as BookedRow[];
  } else {
    rows = await safeQuery<BookedRow>(sql, params);
  }
  if (!rows) return booked;

  for (const row of rows) {
    for (const night of nightsOf(row.check_in, row.check_out)) {
      if (night < from || night > to) continue;
      booked.set(night, (booked.get(night) ?? 0) + row.quantity);
    }
  }
  return booked;
}

// --- The calendar ------------------------------------------------------------

/** Day-by-day availability for one room, for the admin calendar. */
export async function getRoomCalendar(
  room: Room,
  from: string,
  to: string
): Promise<DayAvailability[]> {
  const [overrides, booked] = await Promise.all([
    getOverrides(room.slug, from, to),
    getBookedUnits(room.slug, from, to),
  ]);

  return datesInRange(from, to).map((date) => {
    const override = overrides.get(date);
    const closed = override ? override.closed === 1 : !room.available;
    const units = override ? override.units : room.unitsLeft;
    const taken = booked.get(date) ?? 0;
    return {
      date,
      units,
      booked: taken,
      free: closed ? 0 : Math.max(0, units - taken),
      closed,
      note: override?.note ?? "",
      overridden: !!override,
    };
  });
}

/** Smallest number of rooms free on any night of a stay — what a guest can
 *  actually book for the whole range. */
export async function unitsFreeForStay(
  room: Room,
  checkIn: string,
  checkOut: string,
  conn?: PoolConnection
): Promise<number> {
  const nights = nightsOf(checkIn, checkOut);
  if (nights.length === 0) return 0;

  const lastNight = nights[nights.length - 1];
  const [overrides, booked] = await Promise.all([
    getOverrides(room.slug, checkIn, lastNight),
    getBookedUnits(room.slug, checkIn, lastNight, conn),
  ]);

  let smallest = Number.POSITIVE_INFINITY;
  for (const night of nights) {
    const override = overrides.get(night);
    const closed = override ? override.closed === 1 : !room.available;
    if (closed) return 0;
    const units = override ? override.units : room.unitsLeft;
    const free = Math.max(0, units - (booked.get(night) ?? 0));
    if (free < smallest) smallest = free;
    if (smallest === 0) return 0;
  }
  return smallest === Number.POSITIVE_INFINITY ? 0 : smallest;
}

// --- Search ------------------------------------------------------------------

export type PlanOffer = {
  plan: RatePlan;
  nightly: NightlyPrice[];
  /** null when a night on this plan has no price — not sellable. */
  total: number | null;
  perNight: number | null;
};

export type RoomOffer = {
  room: Room;
  unitsFree: number;
  offers: PlanOffer[];
  /** Cheapest sellable plan total, for sorting and the headline figure. */
  cheapestTotal: number | null;
};

export type SearchResult = {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: string[];
  plans: RatePlan[];
  rooms: RoomOffer[];
};

/**
 * Everything the rooms page needs for a set of dates: which rooms are free,
 * and what each rate plan costs for the whole stay.
 *
 * A room with no free night, or whose every plan is unpriced, still comes
 * back — the page shows it as unavailable rather than hiding it, so guests
 * can see the room exists and try other dates.
 */
export async function searchAvailability(
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<SearchResult> {
  const nights = nightsOf(checkIn, checkOut);
  const [rooms, plans] = await Promise.all([getRooms(), getRatePlans()]);
  const ratesByRoom = await getRatesForRooms(rooms.map((r) => r.slug));

  const offers: RoomOffer[] = [];
  for (const room of rooms) {
    const unitsFree = getPool()
      ? await unitsFreeForStay(room, checkIn, checkOut)
      : 0;
    const rates = ratesByRoom.get(room.slug) ?? [];

    const planOffers: PlanOffer[] = plans.map((plan) => {
      const nightly = nightlyPrices(rates, plan.id, nights);
      const total = stayTotal(nightly);
      return {
        plan,
        nightly,
        total,
        perNight: total === null ? null : Math.round(total / nights.length),
      };
    });

    const sellable = planOffers
      .map((o) => o.total)
      .filter((t): t is number => t !== null);

    offers.push({
      room,
      unitsFree,
      offers: planOffers,
      cheapestTotal: sellable.length > 0 ? Math.min(...sellable) : null,
    });
  }

  return { checkIn, checkOut, guests, nights, plans, rooms: offers };
}
