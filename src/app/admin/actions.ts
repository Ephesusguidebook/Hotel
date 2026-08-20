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
import { upsertBlogPost, deleteBlogPost, type BlogPostInput } from "@/lib/blog-repo";
import { updateSiteSettings } from "@/lib/settings-repo";
import { updateAboutContent, textToValues } from "@/lib/about-repo";
import { updateLegalPage, textToSections } from "@/lib/legal-repo";
import type { SiteSettings, AboutContent } from "@/lib/data";

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

export async function saveBlogPostAction(originalSlug: string, formData: FormData) {
  await requireAuthed();

  const input: BlogPostInput = {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: toList(String(formData.get("content") ?? "")),
  };

  if (originalSlug && originalSlug !== input.slug) {
    await deleteBlogPost(originalSlug);
  }

  await upsertBlogPost(input);
  redirect("/admin/blog?saved=1");
}

export async function deleteBlogPostAction(slug: string) {
  await requireAuthed();
  await deleteBlogPost(slug);
  redirect("/admin/blog?deleted=1");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAuthed();

  const input: SiteSettings = {
    hotelName: String(formData.get("hotelName") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    checkIn: String(formData.get("checkIn") ?? "").trim(),
    checkOut: String(formData.get("checkOut") ?? "").trim(),
    frontDeskHours: String(formData.get("frontDeskHours") ?? "").trim(),
  };

  await updateSiteSettings(input);
  redirect("/admin/settings?saved=1");
}

export async function saveAboutAction(formData: FormData) {
  await requireAuthed();

  const input: AboutContent = {
    heroTitle: String(formData.get("heroTitle") ?? "").trim(),
    heroDescription: String(formData.get("heroDescription") ?? "").trim(),
    storyHeading: String(formData.get("storyHeading") ?? "").trim(),
    storyParagraphs: toList(String(formData.get("storyParagraphs") ?? "")),
    teamImage: String(formData.get("teamImage") ?? "").trim(),
    values: textToValues(String(formData.get("values") ?? "")),
  };

  await updateAboutContent(input);
  redirect("/admin/about?saved=1");
}

export async function saveLegalAction(slug: "privacy" | "terms", formData: FormData) {
  await requireAuthed();

  const title = String(formData.get("title") ?? "").trim();
  const updated = String(formData.get("updated") ?? "").trim();
  const sections = textToSections(String(formData.get("sections") ?? ""));

  await updateLegalPage(slug, { title, updated, sections });
  redirect(`/admin/legal/${slug}?saved=1`);
}
