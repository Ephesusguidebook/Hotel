"use server";

import { redirect } from "next/navigation";
import {
  checkPassword,
  setAdminSession,
  clearAdminSession,
  isAdminAuthed,
} from "@/lib/auth";
import { upsertRoom, deleteRoom, type RoomInput } from "@/lib/rooms-repo";
import { upsertAddOn, deleteAddOn, type AddOnInput } from "@/lib/addons-repo";

function toList(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ok = await checkPassword(password);
  if (!ok) {
    redirect("/admin/login?error=1");
  }
  await setAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

async function requireAuthed() {
  if (!(await isAdminAuthed())) {
    redirect("/admin/login");
  }
}

export async function saveRoomAction(originalSlug: string, formData: FormData) {
  await requireAuthed();

  const input: RoomInput = {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    size: String(formData.get("size") ?? "").trim(),
    occupancy: String(formData.get("occupancy") ?? "").trim(),
    bed: String(formData.get("bed") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    amenities: toList(String(formData.get("amenities") ?? "")),
    images: toList(String(formData.get("images") ?? "")),
    available: formData.get("available") === "on",
    unitsLeft: Number(formData.get("unitsLeft") ?? 0),
  };

  // Slug changed: remove the old row so we don't leave a duplicate behind.
  if (originalSlug && originalSlug !== input.slug) {
    await deleteRoom(originalSlug);
  }

  await upsertRoom(input);
  redirect("/admin/rooms?saved=1");
}

export async function deleteRoomAction(slug: string) {
  await requireAuthed();
  await deleteRoom(slug);
  redirect("/admin/rooms?deleted=1");
}

export async function saveAddOnAction(originalSlug: string, formData: FormData) {
  await requireAuthed();

  const category = String(formData.get("category") ?? "Tour");

  const input: AddOnInput = {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    category: category === "Transfer" ? "Transfer" : "Tour",
    duration: String(formData.get("duration") ?? "").trim(),
    price: Number(formData.get("price") ?? 0),
    unit: String(formData.get("unit") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    longDescription: toList(String(formData.get("longDescription") ?? "")),
    includes: toList(String(formData.get("includes") ?? "")),
    meetingPoint: String(formData.get("meetingPoint") ?? "").trim(),
    images: toList(String(formData.get("images") ?? "")),
  };

  if (originalSlug && originalSlug !== input.slug) {
    await deleteAddOn(originalSlug);
  }

  await upsertAddOn(input);
  redirect("/admin/add-ons?saved=1");
}

export async function deleteAddOnAction(slug: string) {
  await requireAuthed();
  await deleteAddOn(slug);
  redirect("/admin/add-ons?deleted=1");
}
