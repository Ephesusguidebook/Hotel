import { safeQuery } from "@/lib/db";
import { getRoomBySlug } from "@/lib/rooms-repo";
import { getAddOnBySlug } from "@/lib/addons-repo";
import { getRatePlanById, getRoomRates, nightlyPrices, stayTotal } from "@/lib/rates-repo";
import { unitsFreeForStay } from "@/lib/availability-repo";
import { nightsOf, isValidDate, today } from "@/lib/dates";

export type CartItem = {
  id: number;
  itemType: "room" | "addon";
  itemSlug: string;
  itemName: string;
  /** Rooms: the average nightly rate. Add-ons: the item price. */
  unitPrice: number;
  /** Rooms: the whole stay for one room, frozen when it was added. */
  stayTotal: number | null;
  ratePlanId: number | null;
  ratePlanName: string;
  quantity: number;
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
  lineTotal: number;
};

type CartRow = {
  id: number;
  item_type: "room" | "addon";
  item_slug: string;
  item_name: string;
  unit_price: number;
  stay_total: number | null;
  rate_plan_id: number | null;
  rate_plan_name: string;
  quantity: number;
  check_in: string | null;
  check_out: string | null;
  guests: number | null;
};

export function nightsBetween(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return diff > 0 ? diff : 1;
}

function lineTotal(row: CartRow): number {
  if (row.item_type === "room") {
    // Nights can be priced differently, so the stay total is stored rather
    // than rebuilt from a single nightly figure. Older rows written before
    // rate plans existed have no stay_total; fall back to the old maths so
    // an existing cart still adds up.
    const perStay =
      row.stay_total ?? row.unit_price * nightsBetween(row.check_in, row.check_out);
    return perStay * row.quantity;
  }
  return row.unit_price * row.quantity;
}

function rowToItem(row: CartRow): CartItem {
  return {
    id: row.id,
    itemType: row.item_type,
    itemSlug: row.item_slug,
    itemName: row.item_name,
    unitPrice: row.unit_price,
    stayTotal: row.stay_total,
    ratePlanId: row.rate_plan_id,
    ratePlanName: row.rate_plan_name ?? "",
    quantity: row.quantity,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests,
    lineTotal: lineTotal(row),
  };
}

/** All items in a customer's cart. Returns [] if the DB isn't configured. */
export async function getCartItems(customerId: number): Promise<CartItem[]> {
  const rows = await safeQuery<CartRow>(
    `SELECT id, item_type, item_slug, item_name, unit_price, stay_total,
            rate_plan_id, rate_plan_name, quantity, check_in, check_out, guests
     FROM cart_items WHERE customer_id = ? ORDER BY id ASC`,
    [customerId]
  );
  if (!rows) return [];
  return rows.map(rowToItem);
}

export type CartSummary = {
  items: CartItem[];
  subtotal: number;
  taxesAndFees: number;
  total: number;
};

const TAX_RATE = 0.12; // matches the estimate shown on the public Rooms page

export async function getCartSummary(customerId: number): Promise<CartSummary> {
  const items = await getCartItems(customerId);
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const taxesAndFees = Math.round(subtotal * TAX_RATE);
  return { items, subtotal, taxesAndFees, total: subtotal + taxesAndFees };
}

export type AddRoomInput = {
  customerId: number;
  slug: string;
  ratePlanId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  quantity: number;
};

/**
 * Puts a stay in the cart on a chosen rate plan.
 *
 * The quote is worked out here and frozen: every night is looked up against
 * the room's date-range prices, and if any night has no price the plan isn't
 * on sale then and the whole thing is refused rather than guessed at.
 * Availability is re-checked too, because the guest may have been sitting on
 * the search results while someone else booked the last room.
 *
 * Returns an error string on failure, or null on success.
 */
export async function addRoomToCart(input: AddRoomInput): Promise<string | null> {
  if (!isValidDate(input.checkIn) || !isValidDate(input.checkOut)) {
    return "Please choose check-in and check-out dates.";
  }
  const nights = nightsOf(input.checkIn, input.checkOut);
  if (nights.length === 0) return "Check-out date must be after check-in.";
  if (input.checkIn < today()) return "Check-in can't be in the past.";

  const room = await getRoomBySlug(input.slug);
  if (!room) return "That room could not be found.";

  const plan = await getRatePlanById(input.ratePlanId);
  if (!plan) return "Please choose a rate.";

  const rates = await getRoomRates(room.slug);
  const nightly = nightlyPrices(rates, plan.id, nights);
  const perStay = stayTotal(nightly);
  if (perStay === null) {
    return `${plan.name} isn't available for those dates.`;
  }

  const free = await unitsFreeForStay(room, input.checkIn, input.checkOut);
  if (free <= 0) {
    return `${room.name} is fully booked for those dates.`;
  }

  const quantity = Math.max(1, Math.min(input.quantity, free));
  const averageNightly = Math.round(perStay / nights.length);

  const result = await safeQuery(
    `INSERT INTO cart_items (customer_id, item_type, item_slug, item_name, unit_price,
                             stay_total, rate_plan_id, rate_plan_name, quantity,
                             check_in, check_out, guests)
     VALUES (?, 'room', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.customerId,
      room.slug,
      room.name,
      averageNightly,
      perStay,
      plan.id,
      plan.name,
      quantity,
      input.checkIn,
      input.checkOut,
      input.guests,
    ]
  );
  return result === null
    ? "Could not add the room to your cart. Please try again."
    : null;
}

export type AddAddOnInput = {
  customerId: number;
  slug: string;
  quantity: number;
};

export async function addAddOnToCart(input: AddAddOnInput): Promise<string | null> {
  const addOn = await getAddOnBySlug(input.slug);
  if (!addOn) return "That experience could not be found.";

  const quantity = Math.max(1, input.quantity);
  const result = await safeQuery(
    `INSERT INTO cart_items (customer_id, item_type, item_slug, item_name, unit_price, quantity)
     VALUES (?, 'addon', ?, ?, ?, ?)`,
    [input.customerId, addOn.slug, addOn.name, addOn.price, quantity]
  );
  return result === null ? "Could not add that to your cart. Please try again." : null;
}

export async function removeCartItem(customerId: number, itemId: number): Promise<boolean> {
  const result = await safeQuery("DELETE FROM cart_items WHERE id = ? AND customer_id = ?", [
    itemId,
    customerId,
  ]);
  return result !== null;
}

export async function updateCartItemQuantity(
  customerId: number,
  itemId: number,
  quantity: number
): Promise<boolean> {
  const result = await safeQuery(
    "UPDATE cart_items SET quantity = ? WHERE id = ? AND customer_id = ?",
    [Math.max(1, quantity), itemId, customerId]
  );
  return result !== null;
}

export async function clearCart(customerId: number): Promise<boolean> {
  const result = await safeQuery("DELETE FROM cart_items WHERE customer_id = ?", [customerId]);
  return result !== null;
}
