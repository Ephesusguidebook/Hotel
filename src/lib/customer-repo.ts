import crypto from "crypto";
import { safeQuery } from "@/lib/db";
import { hashPassword } from "@/lib/customer-auth";

const VERIFICATION_HOURS = 24;

export type Customer = {
  id: number;
  email: string;
  name: string;
  phone: string;
  emailVerified: boolean;
};

type CustomerRow = {
  id: number;
  email: string;
  name: string;
  phone: string;
  email_verified: number;
};

function rowToCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    emailVerified: !!row.email_verified,
  };
}

export async function getCustomerByEmail(email: string): Promise<
  (Customer & { passwordHash: string }) | null
> {
  const rows = await safeQuery<CustomerRow & { password_hash: string }>(
    "SELECT id, email, name, phone, email_verified, password_hash FROM customers WHERE email = ?",
    [email.toLowerCase().trim()]
  );
  if (!rows || rows.length === 0) return null;
  return { ...rowToCustomer(rows[0]), passwordHash: rows[0].password_hash };
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const rows = await safeQuery<CustomerRow>(
    "SELECT id, email, name, phone, email_verified FROM customers WHERE id = ?",
    [id]
  );
  if (!rows || rows.length === 0) return null;
  return rowToCustomer(rows[0]);
}

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
};

/** Registers a new customer (unverified) and returns their id, or null if
 *  the DB isn't configured, the email is already registered, or the write
 *  fails for some other reason. */
export async function createCustomer(input: RegisterInput): Promise<number | null> {
  const email = input.email.toLowerCase().trim();
  const existing = await getCustomerByEmail(email);
  if (existing) return null;

  const passwordHash = hashPassword(input.password);
  const result = await safeQuery<{ insertId: number }>(
    "INSERT INTO customers (email, password_hash, name, phone, email_verified) VALUES (?, ?, ?, ?, 0)",
    [email, passwordHash, input.name.trim(), input.phone.trim()]
  );
  if (result === null) return null;
  // mysql2 returns an OkPacket for INSERT, not a row array — read insertId off it.
  const insertId = (result as unknown as { insertId: number }).insertId;
  return insertId ?? null;
}

export type VerificationToken = {
  token: string;
  customerId: number;
  expiresAt: Date;
};

/** Creates a fresh one-time verification token for a customer (24h expiry). */
export async function createEmailVerification(customerId: number): Promise<string | null> {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + VERIFICATION_HOURS * 3600000);
  const result = await safeQuery(
    "INSERT INTO email_verifications (token, customer_id, expires_at) VALUES (?, ?, ?)",
    [token, customerId, expiresAt]
  );
  return result === null ? null : token;
}

/** Consumes a verification token: marks the customer verified and deletes
 *  the token. Returns the customer id on success, or null if the token is
 *  missing, expired, or already used. */
export async function verifyEmailToken(token: string): Promise<number | null> {
  const rows = await safeQuery<{ customer_id: number }>(
    "SELECT customer_id FROM email_verifications WHERE token = ? AND expires_at > NOW()",
    [token]
  );
  if (!rows || rows.length === 0) return null;

  const customerId = rows[0].customer_id;
  await safeQuery("UPDATE customers SET email_verified = 1 WHERE id = ?", [customerId]);
  await safeQuery("DELETE FROM email_verifications WHERE token = ?", [token]);
  return customerId;
}
