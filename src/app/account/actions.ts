"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  createCustomerSession,
  clearCustomerSession,
  getCurrentCustomer,
  verifyPassword,
} from "@/lib/customer-auth";
import {
  createCustomer,
  createEmailVerification,
  getCustomerByEmail,
  type RegisterInput,
} from "@/lib/customer-repo";
import { sendVerificationEmail } from "@/lib/mailer";
import {
  addRoomToCart,
  addAddOnToCart,
  removeCartItem,
  updateCartItemQuantity,
  clearCart,
} from "@/lib/cart-repo";
import { checkoutCart } from "@/lib/reservations-repo";
import { getPool } from "@/lib/db";

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function requireCustomer() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login");
  return customer;
}

export async function registerAction(formData: FormData) {
  if (!getPool()) {
    redirect("/account/register?error=" + encodeURIComponent("Accounts aren't available yet — the database isn't configured."));
  }

  const input: RegisterInput = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
  };

  if (!input.email || !input.password || !input.name) {
    redirect("/account/register?error=" + encodeURIComponent("Please fill in your name, email, and password."));
  }
  if (input.password.length < 8) {
    redirect("/account/register?error=" + encodeURIComponent("Password must be at least 8 characters."));
  }

  const existing = await getCustomerByEmail(input.email);
  if (existing) {
    redirect("/account/register?error=" + encodeURIComponent("An account with that email already exists."));
  }

  const customerId = await createCustomer(input);
  if (!customerId) {
    redirect("/account/register?error=" + encodeURIComponent("Could not create your account. Please try again."));
  }

  const token = await createEmailVerification(customerId);
  let verifyUrl = "";
  let emailSent = false;
  if (token) {
    const origin = await siteOrigin();
    verifyUrl = `${origin}/account/verify?token=${token}`;
    const result = await sendVerificationEmail(input.email, input.name, verifyUrl);
    emailSent = result.sent;
  }

  const params = new URLSearchParams({ email: input.email });
  if (!emailSent && verifyUrl) params.set("link", verifyUrl);
  redirect(`/account/registered?${params.toString()}`);
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account");

  const customer = await getCustomerByEmail(email);
  if (!customer || !verifyPassword(password, customer.passwordHash)) {
    redirect(`/account/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const ok = await createCustomerSession(customer.id);
  if (!ok) {
    redirect(`/account/login?error=1&next=${encodeURIComponent(next)}`);
  }
  redirect(next && next.startsWith("/") ? next : "/account");
}

export async function logoutAction() {
  await clearCustomerSession();
  redirect("/account/login");
}

export async function resendVerificationAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const customer = await getCustomerByEmail(email);
  if (!customer || customer.emailVerified) {
    redirect("/account/registered?email=" + encodeURIComponent(email));
  }

  const token = await createEmailVerification(customer.id);
  let verifyUrl = "";
  let emailSent = false;
  if (token) {
    const origin = await siteOrigin();
    verifyUrl = `${origin}/account/verify?token=${token}`;
    const result = await sendVerificationEmail(customer.email, customer.name, verifyUrl);
    emailSent = result.sent;
  }
  const params = new URLSearchParams({ email });
  if (!emailSent && verifyUrl) params.set("link", verifyUrl);
  redirect(`/account/registered?${params.toString()}`);
}

// --- Cart ---

export async function addRoomToCartAction(slug: string, formData: FormData) {
  const customer = await requireCustomer();

  const checkIn = String(formData.get("checkIn") ?? "");
  const checkOut = String(formData.get("checkOut") ?? "");
  const guests = Number(formData.get("guests") ?? 2);
  const quantity = Number(formData.get("quantity") ?? 1);

  const error = await addRoomToCart({ customerId: customer.id, slug, checkIn, checkOut, guests, quantity });
  if (error) {
    redirect(`/rooms?cartError=${encodeURIComponent(error)}#${slug}`);
  }
  redirect("/account/cart?added=1");
}

export async function addAddOnToCartAction(slug: string, formData: FormData) {
  const customer = await requireCustomer();
  const quantity = Number(formData.get("quantity") ?? 1);

  const error = await addAddOnToCart({ customerId: customer.id, slug, quantity });
  if (error) {
    redirect(`/add-ons?cartError=${encodeURIComponent(error)}#${slug}`);
  }
  redirect("/account/cart?added=1");
}

export async function removeCartItemAction(itemId: number) {
  const customer = await requireCustomer();
  await removeCartItem(customer.id, itemId);
  redirect("/account/cart");
}

export async function updateCartItemAction(itemId: number, formData: FormData) {
  const customer = await requireCustomer();
  const quantity = Number(formData.get("quantity") ?? 1);
  await updateCartItemQuantity(customer.id, itemId, quantity);
  redirect("/account/cart");
}

export async function clearCartAction() {
  const customer = await requireCustomer();
  await clearCart(customer.id);
  redirect("/account/cart");
}

export async function checkoutAction() {
  const customer = await requireCustomer();
  const result = await checkoutCart(customer.id);
  if (!result.success) {
    redirect(`/account/cart?checkoutError=${encodeURIComponent(result.error)}`);
  }
  redirect(`/account/reservations/${result.code}?placed=1`);
}
