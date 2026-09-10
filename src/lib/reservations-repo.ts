import crypto from "crypto";
import { safeQuery, withTransaction } from "@/lib/db";
import { nightsBetween } from "@/lib/cart-repo";
import type mysql from "mysql2/promise";

const TAX_RATE = 0.12;

export type ReservationItem = {
  id: number;
  itemType: "room" | "addon";
  itemSlug: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  checkIn: string | null;
  checkOut: string | null;
  lineTotal: number;
};

export type Reservation = {
  id: number;
  code: string;
  customerId: number;
  status: string;
  paymentStatus: "unpaid" | "paid" | "refunded";
  subtotal: number;
  taxesAndFees: number;
  total: number;
  checkIn: string | null;
  checkOut: string | null;
  createdAt: string;
  items: ReservationItem[];
};

type ReservationRow = {
  id: number;
  code: string;
  customer_id: number;
  status: string;
  payment_status: "unpaid" | "paid" | "refunded";
  subtotal: number;
  taxes_fees: number;
  total: number;
  check_in: string | null;
  check_out: string | null;
  created_at: string;
};

type ReservationItemRow = {
  id: number;
  reservation_id: number;
  item_type: "room" | "addon";
  item_slug: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  check_in: string | null;
  check_out: string | null;
  line_total: number;
};

function rowToItem(row: ReservationItemRow): ReservationItem {
  return {
    id: row.id,
    itemType: row.item_type,
    itemSlug: row.item_slug,
    itemName: row.item_name,
    unitPrice: row.unit_price,
    quantity: row.quantity,
    checkIn: row.check_in,
    checkOut: row.check_out,
    lineTotal: row.line_total,
  };
}

async function attachItems(rows: ReservationRow[]): Promise<Reservation[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const itemRows =
    (await safeQuery<ReservationItemRow>(
      `SELECT id, reservation_id, item_type, item_slug, item_name, unit_price, quantity, check_in, check_out, line_total
       FROM reservation_items WHERE reservation_id IN (${ids.map(() => "?").join(",")}) ORDER BY id ASC`,
      ids
    )) ?? [];

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    customerId: row.customer_id,
    status: row.status,
    paymentStatus: row.payment_status,
    subtotal: row.subtotal,
    taxesAndFees: row.taxes_fees,
    total: row.total,
    checkIn: row.check_in,
    checkOut: row.check_out,
    createdAt: row.created_at,
    items: itemRows.filter((i) => i.reservation_id === row.id).map(rowToItem),
  }));
}

export async function getReservationsByCustomer(customerId: number): Promise<Reservation[]> {
  const rows = await safeQuery<ReservationRow>(
    "SELECT * FROM reservations WHERE customer_id = ? ORDER BY id DESC",
    [customerId]
  );
  if (!rows) return [];
  return attachItems(rows);
}

/** Looks up a reservation by its code. If `customerId` is given, the
 *  reservation must belong to that customer (used on customer-facing pages);
 *  omit it for admin lookups. */
export async function getReservationByCode(
  code: string,
  customerId?: number
): Promise<Reservation | null> {
  const rows = customerId
    ? await safeQuery<ReservationRow>(
        "SELECT * FROM reservations WHERE code = ? AND customer_id = ?",
        [code, customerId]
      )
    : await safeQuery<ReservationRow>("SELECT * FROM reservations WHERE code = ?", [code]);
  if (!rows || rows.length === 0) return null;
  const [full] = await attachItems(rows);
  return full ?? null;
}

export async function getAllReservations(): Promise<
  (Reservation & { customerEmail: string; customerName: string })[]
> {
  const rows = await safeQuery<ReservationRow & { customer_email: string; customer_name: string }>(
    `SELECT r.*, c.email AS customer_email, c.name AS customer_name
     FROM reservations r JOIN customers c ON c.id = r.customer_id
     ORDER BY r.id DESC`
  );
  if (!rows) return [];
  const withItems = await attachItems(rows);
  return withItems.map((r, i) => ({
    ...r,
    customerEmail: rows[i].customer_email,
    customerName: rows[i].customer_name,
  }));
}

export async function updatePaymentStatus(
  reservationId: number,
  paymentStatus: "unpaid" | "paid" | "refunded"
): Promise<boolean> {
  const result = await safeQuery("UPDATE reservations SET payment_status = ? WHERE id = ?", [
    paymentStatus,
    reservationId,
  ]);
  return result !== null;
}

export async function updateReservationStatus(
  reservationId: number,
  status: "pending" | "confirmed" | "cancelled"
): Promise<boolean> {
  const result = await safeQuery("UPDATE reservations SET status = ? WHERE id = ?", [
    status,
    reservationId,
  ]);
  return result !== null;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "AB-";
  for (let i = 0; i < 6; i++) {
    code += chars[crypto.randomInt(chars.length)];
  }
  return code;
}

export type CheckoutResult = { success: true; code: string } | { success: false; error: string };

/**
 * Turns a customer's cart into a confirmed reservation: locks and decrements
 * room stock, freezes the cart into reservation_items, and empties the cart —
 * all inside one transaction, so a failure (e.g. a room sold out between
 * adding to cart and checkout) leaves nothing partially applied.
 */
export async function checkoutCart(customerId: number): Promise<CheckoutResult> {
  let result: string | null;
  try {
    result = await withTransaction(async (conn) => {
    const [cartRows] = await conn.query(
      "SELECT id, item_type, item_slug, item_name, unit_price, quantity, check_in, check_out FROM cart_items WHERE customer_id = ? ORDER BY id ASC",
      [customerId]
    );
    const items = cartRows as Array<{
      id: number;
      item_type: "room" | "addon";
      item_slug: string;
      item_name: string;
      unit_price: number;
      quantity: number;
      check_in: string | null;
      check_out: string | null;
    }>;

    if (items.length === 0) {
      throw new Error("EMPTY_CART");
    }

    // Lock and decrement stock for every room line first, so a sold-out
    // room aborts the whole checkout before anything else is written.
    for (const item of items) {
      if (item.item_type !== "room") continue;
      const [roomRows] = await conn.query("SELECT units_left FROM rooms WHERE slug = ? FOR UPDATE", [
        item.item_slug,
      ]);
      const room = (roomRows as Array<{ units_left: number }>)[0];
      if (!room || room.units_left < item.quantity) {
        throw new Error(`SOLD_OUT:${item.item_name}`);
      }
      await conn.query("UPDATE rooms SET units_left = units_left - ? WHERE slug = ?", [
        item.quantity,
        item.item_slug,
      ]);
    }

    const lineTotals = items.map((item) =>
      item.item_type === "room"
        ? item.unit_price * nightsBetween(item.check_in, item.check_out) * item.quantity
        : item.unit_price * item.quantity
    );
    const subtotal = lineTotals.reduce((sum, t) => sum + t, 0);
    const taxesAndFees = Math.round(subtotal * TAX_RATE);
    const total = subtotal + taxesAndFees;

    const roomItems = items.filter((i) => i.item_type === "room");
    const checkIn = roomItems.length
      ? roomItems.reduce((min, i) => (i.check_in! < min ? i.check_in! : min), roomItems[0].check_in!)
      : null;
    const checkOut = roomItems.length
      ? roomItems.reduce((max, i) => (i.check_out! > max ? i.check_out! : max), roomItems[0].check_out!)
      : null;

    let code = generateCode();
    let insertId: number | null = null;
    for (let attempt = 0; attempt < 5 && insertId === null; attempt++) {
      try {
        const [res] = await conn.query(
          `INSERT INTO reservations (code, customer_id, status, payment_status, subtotal, taxes_fees, total, check_in, check_out)
           VALUES (?, ?, 'confirmed', 'unpaid', ?, ?, ?, ?, ?)`,
          [code, customerId, subtotal, taxesAndFees, total, checkIn, checkOut]
        );
        insertId = (res as mysql.ResultSetHeader).insertId;
      } catch (err) {
        const mysqlErr = err as { code?: string };
        if (mysqlErr.code === "ER_DUP_ENTRY") {
          code = generateCode();
          continue;
        }
        throw err;
      }
    }
    if (insertId === null) throw new Error("CODE_COLLISION");

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await conn.query(
        `INSERT INTO reservation_items (reservation_id, item_type, item_slug, item_name, unit_price, quantity, check_in, check_out, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [insertId, item.item_type, item.item_slug, item.item_name, item.unit_price, item.quantity, item.check_in, item.check_out, lineTotals[i]]
      );
    }

    await conn.query("DELETE FROM cart_items WHERE customer_id = ?", [customerId]);

    return code;
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message === "EMPTY_CART") {
      return { success: false, error: "Your cart is empty." };
    }
    if (message.startsWith("SOLD_OUT:")) {
      return {
        success: false,
        error: `${message.slice("SOLD_OUT:".length)} sold out while checking out. Please remove it from your cart and try another room.`,
      };
    }
    console.error("[reservations] checkout failed:", err);
    return { success: false, error: "Checkout failed. Please try again." };
  }

  if (result === null) {
    return { success: false, error: "The reservation system isn't configured yet. Please try again later." };
  }
  return { success: true, code: result };
}
