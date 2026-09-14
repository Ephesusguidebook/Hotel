import { safeQuery, getPool } from "@/lib/db";
import { daysBetween } from "@/lib/dates";

export type RatePlan = {
  id: number;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type RoomRate = {
  id: number;
  roomSlug: string;
  ratePlanId: number;
  startDate: string;
  endDate: string;
  price: number;
  label: string;
};

type RatePlanRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
};

type RoomRateRow = {
  id: number;
  room_slug: string;
  rate_plan_id: number;
  start_date: string;
  end_date: string;
  price: number;
  label: string;
};

function rowToPlan(row: RatePlanRow): RatePlan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    sortOrder: row.sort_order,
  };
}

function rowToRate(row: RoomRateRow): RoomRate {
  return {
    id: row.id,
    roomSlug: row.room_slug,
    ratePlanId: row.rate_plan_id,
    startDate: row.start_date,
    endDate: row.end_date,
    price: row.price,
    label: row.label,
  };
}

// --- Rate plans -------------------------------------------------------------

export async function getRatePlans(): Promise<RatePlan[]> {
  const rows = await safeQuery<RatePlanRow>(
    "SELECT id, slug, name, description, sort_order FROM rate_plans ORDER BY sort_order ASC, id ASC"
  );
  if (!rows) return [];
  return rows.map(rowToPlan);
}

export async function getRatePlanById(id: number): Promise<RatePlan | null> {
  const plans = await getRatePlans();
  return plans.find((p) => p.id === id) ?? null;
}

export type RatePlanInput = {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

export async function upsertRatePlan(
  input: RatePlanInput,
  id?: number
): Promise<boolean> {
  if (id) {
    const result = await safeQuery(
      "UPDATE rate_plans SET slug = ?, name = ?, description = ?, sort_order = ? WHERE id = ?",
      [input.slug, input.name, input.description, input.sortOrder, id]
    );
    return result !== null;
  }
  const result = await safeQuery(
    `INSERT INTO rate_plans (slug, name, description, sort_order)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name), description = VALUES(description), sort_order = VALUES(sort_order)`,
    [input.slug, input.name, input.description, input.sortOrder]
  );
  return result !== null;
}

/** Removing a plan takes its prices with it — otherwise they'd linger as
 *  rows nothing can ever sell. */
export async function deleteRatePlan(id: number): Promise<boolean> {
  await safeQuery("DELETE FROM room_rates WHERE rate_plan_id = ?", [id]);
  const result = await safeQuery("DELETE FROM rate_plans WHERE id = ?", [id]);
  return result !== null;
}

// --- Date-range prices ------------------------------------------------------

export async function getRoomRates(roomSlug: string): Promise<RoomRate[]> {
  const rows = await safeQuery<RoomRateRow>(
    `SELECT id, room_slug, rate_plan_id, start_date, end_date, price, label
     FROM room_rates WHERE room_slug = ?
     ORDER BY start_date ASC, id ASC`,
    [roomSlug]
  );
  if (!rows) return [];
  return rows.map(rowToRate);
}

export type RoomRateInput = {
  roomSlug: string;
  ratePlanId: number;
  startDate: string;
  endDate: string;
  price: number;
  label: string;
};

export async function addRoomRate(input: RoomRateInput): Promise<boolean> {
  const result = await safeQuery(
    `INSERT INTO room_rates (room_slug, rate_plan_id, start_date, end_date, price, label)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      input.roomSlug,
      input.ratePlanId,
      input.startDate,
      input.endDate,
      input.price,
      input.label,
    ]
  );
  return result !== null;
}

export async function deleteRoomRate(id: number): Promise<boolean> {
  const result = await safeQuery("DELETE FROM room_rates WHERE id = ?", [id]);
  return result !== null;
}

// --- Price resolution -------------------------------------------------------

/**
 * Which rate applies to a given night.
 *
 * Ranges are allowed to overlap, and **the narrower one wins**: lay a
 * six-month season price down, then drop a three-day holiday price over the
 * top of it and the holiday price is what sells. Equally narrow ranges are
 * settled by whichever was added most recently.
 *
 * Returns null when no range covers the night, which means the room simply
 * isn't sellable on that plan then — see sql/schema_v6.sql for why that's
 * preferred over falling back to some other number.
 */
export function rateForNight(
  rates: RoomRate[],
  ratePlanId: number,
  night: string
): RoomRate | null {
  let best: RoomRate | null = null;
  let bestWidth = Number.POSITIVE_INFINITY;

  for (const rate of rates) {
    if (rate.ratePlanId !== ratePlanId) continue;
    if (night < rate.startDate || night > rate.endDate) continue;

    const width = daysBetween(rate.startDate, rate.endDate);
    if (width < bestWidth || (width === bestWidth && best && rate.id > best.id)) {
      best = rate;
      bestWidth = width;
    }
  }
  return best;
}

export type NightlyPrice = { night: string; price: number | null; label: string };

/** The price of each night of a stay on one plan. */
export function nightlyPrices(
  rates: RoomRate[],
  ratePlanId: number,
  nights: string[]
): NightlyPrice[] {
  return nights.map((night) => {
    const rate = rateForNight(rates, ratePlanId, night);
    return {
      night,
      price: rate ? rate.price : null,
      label: rate?.label ?? "",
    };
  });
}

/** Total for a stay, or null if any night is unpriced (and so unsellable). */
export function stayTotal(prices: NightlyPrice[]): number | null {
  if (prices.length === 0) return null;
  let total = 0;
  for (const entry of prices) {
    if (entry.price === null) return null;
    total += entry.price;
  }
  return total;
}

/** Cheapest priced night across all plans — the "from $X" figure on a card. */
export function lowestNightlyPrice(rates: RoomRate[]): number | null {
  if (rates.length === 0) return null;
  return rates.reduce<number | null>(
    (low, rate) => (low === null || rate.price < low ? rate.price : low),
    null
  );
}

/** Rates for several rooms at once, so a listing page makes one query
 *  rather than one per room. */
export async function getRatesForRooms(
  roomSlugs: string[]
): Promise<Map<string, RoomRate[]>> {
  const byRoom = new Map<string, RoomRate[]>();
  for (const slug of roomSlugs) byRoom.set(slug, []);
  if (roomSlugs.length === 0 || !getPool()) return byRoom;

  const placeholders = roomSlugs.map(() => "?").join(", ");
  const rows = await safeQuery<RoomRateRow>(
    `SELECT id, room_slug, rate_plan_id, start_date, end_date, price, label
     FROM room_rates WHERE room_slug IN (${placeholders})
     ORDER BY start_date ASC, id ASC`,
    roomSlugs
  );
  if (!rows) return byRoom;

  for (const row of rows) {
    byRoom.get(row.room_slug)?.push(rowToRate(row));
  }
  return byRoom;
}
