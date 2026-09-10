import { cookies } from "next/headers";
import crypto from "crypto";
import { safeQuery } from "@/lib/db";

const COOKIE_NAME = "aurelia_customer";
const SESSION_DAYS = 30;
const SCRYPT_KEYLEN = 64;

/** scrypt password hash, stored as "salt:hash" (both hex). No native
 *  bindings — same policy as mysql2 over an ORM elsewhere in this project. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

function newToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export type SessionCustomer = {
  id: number;
  email: string;
  name: string;
  phone: string;
  emailVerified: boolean;
};

type SessionRow = {
  id: number;
  email: string;
  name: string;
  phone: string;
  email_verified: number;
};

/** Create a DB-backed session for a customer and set the session cookie.
 *  Returns false if the DB isn't configured (customer accounts require it). */
export async function createCustomerSession(customerId: number): Promise<boolean> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  const result = await safeQuery(
    "INSERT INTO customer_sessions (token, customer_id, expires_at) VALUES (?, ?, ?)",
    [token, customerId, expiresAt]
  );
  if (result === null) return false;

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return true;
}

/** The signed-in customer, or null if there's no valid session. */
export async function getCurrentCustomer(): Promise<SessionCustomer | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const rows = await safeQuery<SessionRow>(
    `SELECT c.id, c.email, c.name, c.phone, c.email_verified
     FROM customer_sessions s
     JOIN customers c ON c.id = s.customer_id
     WHERE s.token = ? AND s.expires_at > NOW()`,
    [token]
  );
  if (!rows || rows.length === 0) return null;

  const row = rows[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    emailVerified: !!row.email_verified,
  };
}

export async function clearCustomerSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await safeQuery("DELETE FROM customer_sessions WHERE token = ?", [token]);
  }
  store.delete(COOKIE_NAME);
}
