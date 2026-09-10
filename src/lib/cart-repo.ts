import { safeQuery } from "@/lib/db";
import { getRoomBySlug } from "@/lib/rooms-repo";
import { getAddOnBySlug } from "@/lib/addons-repo";

export type CartItem = {
  id: number;
  itemType: "room" | "addon";
  itemSlug: string;
  itemName: string;
  unitPrice: number;
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
    return row.unit_price * nightsBetween(row.check_in, row.check_out) * row.quantity;
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
    "SELECT id, item_type, item_slug, item_name, unit_price, quantity, check_in, check_out, guests FROM cart_items WHERE customer_id = ? ORDER BY id ASC",
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
  checkIn: string;
  checkOut: string;
  guests: number;
  quantity: number;
};

/** Adds a room to the cart, snapshotting its current name/price. Returns an
 *  error string on failure, or null on success. */
export async function addRoomToCart(input: AddRoomInput): Promise<string | null> {
  if (!input.checkIn || !input.checkOut) return "Please choose check-in and check-out dates.";
  if (new Date(input.checkOut) <= new Date(input.checkIn)) {
    return "Check-out date must be after check-in.";
  }
  const room = await getRoomBySlug(input.slug);
  if (!room) return "That room could not be found.";
  if (!room.available) return "That room is not currently available.";

  const quantity = Math.max(1, Math.min(input.quantity, room.unitsLeft || 1));
  const result = await safeQuery(
    `INSERT INTO cart_items (customer_id, item_type, item_slug, item_name, unit_price, quantity, check_in, check_out, guests)
     VALUES (?, 'room', ?, ?, ?, ?, ?, ?, ?)`,
    [input.customerId, room.slug, room.name, room.price, quantity, input.checkIn, input.checkOut, input.guests]
  );
  return result === null ? "Could not add the room to your cart. Please try again." : null;
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
