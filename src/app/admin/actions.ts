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
import {
  upsertAttraction,
  deleteAttraction,
  type AttractionInput,
} from "@/lib/attractions-repo";
import { upsertBlogPost, deleteBlogPost, type BlogPostInput } from "@/lib/blog-repo";
import { updateSiteSettings } from "@/lib/settings-repo";
import { updateAboutContent, textToValues } from "@/lib/about-repo";
import { updateLegalPage } from "@/lib/legal-repo";
import { sanitizeRichText } from "@/lib/rich-text";
import {
  upsertRatePlan,
  deleteRatePlan,
  addRoomRate,
  deleteRoomRate,
  type RatePlanInput,
} from "@/lib/rates-repo";
import {
  setRangeOverride,
  clearAvailabilityOverride,
} from "@/lib/availability-repo";
import { isValidDate } from "@/lib/dates";
import { updatePaymentStatus, updateReservationStatus } from "@/lib/reservations-repo";
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
    longDescription: sanitizeRichText(String(formData.get("longDescription") ?? "")),
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

export async function saveAttractionAction(
  originalSlug: string,
  formData: FormData
) {
  await requireAuthed();

  const input: AttractionInput = {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    distance: String(formData.get("distance") ?? "").trim(),
    travelTime: String(formData.get("travelTime") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    longDescription: sanitizeRichText(
      String(formData.get("longDescription") ?? "")
    ),
    highlights: toList(String(formData.get("highlights") ?? "")),
    openingHours: String(formData.get("openingHours") ?? "").trim(),
    entryFee: String(formData.get("entryFee") ?? "").trim(),
    bestTime: String(formData.get("bestTime") ?? "").trim(),
    mapUrl: String(formData.get("mapUrl") ?? "").trim(),
    images: toList(String(formData.get("images") ?? "")),
  };

  // Renaming the slug moves the page, so the old row has to go with it.
  if (originalSlug && originalSlug !== input.slug) {
    await deleteAttraction(originalSlug);
  }

  await upsertAttraction(input);
  redirect("/admin/nearby?saved=1");
}

export async function deleteAttractionAction(slug: string) {
  await requireAuthed();
  await deleteAttraction(slug);
  redirect("/admin/nearby?deleted=1");
}

export async function saveBlogPostAction(originalSlug: string, formData: FormData) {
  await requireAuthed();

  const input: BlogPostInput = {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    content: sanitizeRichText(String(formData.get("content") ?? "")),
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
    story: sanitizeRichText(String(formData.get("story") ?? "")),
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
  const content = sanitizeRichText(String(formData.get("content") ?? ""));

  await updateLegalPage(slug, { title, updated, content });
  redirect(`/admin/legal/${slug}?saved=1`);
}


// --- Rate plans -------------------------------------------------------------

export async function saveRatePlanAction(id: number, formData: FormData) {
  await requireAuthed();

  const input: RatePlanInput = {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
  };

  const ok = await upsertRatePlan(input, id > 0 ? id : undefined);
  if (!ok) {
    // The write didn't land — almost always because sql/schema_v6.sql hasn't
    // been imported yet. Saying "saved" here would be a lie.
    redirect(
      "/admin/rate-plans?error=" +
        encodeURIComponent(
          "Could not save. The rate plan tables are missing — import sql/schema_v6.sql into the database first."
        )
    );
  }
  redirect("/admin/rate-plans?saved=1");
}

export async function deleteRatePlanAction(id: number) {
  await requireAuthed();
  const ok = await deleteRatePlan(id);
  if (!ok) {
    redirect(
      "/admin/rate-plans?error=" +
        encodeURIComponent("Could not delete that plan. Please try again.")
    );
  }
  redirect("/admin/rate-plans?deleted=1");
}

// --- Date-range prices ------------------------------------------------------

export async function addRoomRateAction(roomSlug: string, formData: FormData) {
  await requireAuthed();

  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const price = Number(formData.get("price") ?? 0);
  const ratePlanId = Number(formData.get("ratePlanId") ?? 0);
  const month = String(formData.get("month") ?? "");

  const back = (error?: string) => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (error) params.set("error", error);
    else params.set("saved", "1");
    redirect(`/admin/rooms/${roomSlug}/calendar?${params.toString()}`);
  };

  if (!isValidDate(startDate) || !isValidDate(endDate) || endDate < startDate) {
    back("Please give a start date and an end date, in that order.");
  }
  if (!ratePlanId) back("Please choose a rate plan.");
  if (!Number.isFinite(price) || price <= 0) back("Please give a nightly price.");

  const ok = await addRoomRate({
    roomSlug,
    ratePlanId,
    startDate,
    endDate,
    price: Math.round(price),
    label: String(formData.get("label") ?? "").trim(),
  });
  if (!ok) {
    back(
      "Could not save the price. The pricing tables are missing — import sql/schema_v6.sql first."
    );
  }
  back();
}

export async function deleteRoomRateAction(
  roomSlug: string,
  rateId: number,
  month: string
) {
  await requireAuthed();
  await deleteRoomRate(rateId);
  const params = new URLSearchParams({ saved: "1" });
  if (month) params.set("month", month);
  redirect(`/admin/rooms/${roomSlug}/calendar?${params.toString()}`);
}

// --- Availability calendar --------------------------------------------------

export async function setAvailabilityAction(
  roomSlug: string,
  formData: FormData
) {
  await requireAuthed();

  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  const mode = String(formData.get("mode") ?? "close");
  const units = Number(formData.get("units") ?? 0);
  const note = String(formData.get("note") ?? "").trim();
  const month = String(formData.get("month") ?? "");

  const back = (error?: string) => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (error) params.set("error", error);
    else params.set("saved", "1");
    redirect(`/admin/rooms/${roomSlug}/calendar?${params.toString()}`);
  };

  if (!isValidDate(startDate) || !isValidDate(endDate) || endDate < startDate) {
    back("Please give a start date and an end date, in that order.");
  }

  if (mode === "reset") {
    // Hand the dates back to the room's standing stock.
    const { datesInRange } = await import("@/lib/dates");
    for (const date of datesInRange(startDate, endDate)) {
      await clearAvailabilityOverride(roomSlug, date);
    }
    back();
  }

  const written = await setRangeOverride(
    roomSlug,
    startDate,
    endDate,
    mode === "close" ? 0 : Math.max(0, Math.round(units)),
    mode === "close",
    note
  );
  if (written === 0) {
    back(
      "Could not update the calendar. The availability table is missing — import sql/schema_v6.sql first."
    );
  }
  back();
}

export async function updateReservationAction(
  reservationId: number,
  code: string,
  formData: FormData
) {
  await requireAuthed();

  const paymentStatus = String(formData.get("paymentStatus") ?? "unpaid");
  const status = String(formData.get("status") ?? "confirmed");

  await updatePaymentStatus(
    reservationId,
    paymentStatus === "paid" || paymentStatus === "refunded" ? paymentStatus : "unpaid"
  );
  await updateReservationStatus(
    reservationId,
    status === "pending" || status === "cancelled" ? status : "confirmed"
  );
  redirect(`/admin/reservations/${code}?saved=1`);
}
