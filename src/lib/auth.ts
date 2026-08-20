import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "aurelia_admin";
const PEPPER = "aurelia-bay-admin-panel"; // fixed, non-secret — just mixes with the real secret (ADMIN_PASSWORD)

function expectedToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return crypto.createHmac("sha256", password).update(PEPPER).digest("hex");
}

export async function isAdminAuthed(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false; // ADMIN_PASSWORD not configured — admin panel stays locked
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value) return false;
  // constant-time compare
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function checkPassword(password: string): Promise<boolean> {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(real);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function setAdminSession() {
  const token = expectedToken();
  if (!token) return;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export function adminPanelConfigured(): boolean {
  return !!process.env.ADMIN_PASSWORD;
}
