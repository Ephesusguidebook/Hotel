import { safeQuery } from "@/lib/db";
import { addOns as seedAddOns, type AddOn } from "@/lib/data";

type AddOnRow = {
  slug: string;
  name: string;
  category: "Tour" | "Transfer";
  duration: string;
  price: number;
  unit: string;
  description: string;
  long_description: string;
  includes: string;
  meeting_point: string;
  images: string;
};

function toList(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fromList(items: string[]): string {
  return items.map((s) => s.trim()).filter(Boolean).join("\n");
}

function rowToAddOn(row: AddOnRow): AddOn {
  const images = toList(row.images);
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    duration: row.duration,
    price: row.price,
    unit: row.unit,
    description: row.description,
    longDescription: toList(row.long_description),
    includes: toList(row.includes),
    meetingPoint: row.meeting_point,
    images,
    image: images[0] ?? "/images/tour-city.jpg",
  };
}

/** All add-ons, ordered for display. Falls back to static seed data if the DB is unreachable/unconfigured. */
export async function getAddOns(): Promise<AddOn[]> {
  const rows = await safeQuery<AddOnRow>(
    "SELECT slug, name, category, duration, price, unit, description, long_description, includes, meeting_point, images FROM add_ons ORDER BY sort_order ASC, id ASC"
  );
  if (!rows) return seedAddOns;
  if (rows.length === 0) return seedAddOns;
  return rows.map(rowToAddOn);
}

export async function getAddOnBySlug(slug: string): Promise<AddOn | undefined> {
  const rows = await getAddOns();
  return rows.find((a) => a.slug === slug);
}

export type AddOnInput = {
  slug: string;
  name: string;
  category: "Tour" | "Transfer";
  duration: string;
  price: number;
  unit: string;
  description: string;
  longDescription: string[];
  includes: string[];
  meetingPoint: string;
  images: string[];
};

/** Insert an add-on if its slug doesn't exist yet, otherwise update it. Returns false if the DB isn't configured. */
export async function upsertAddOn(input: AddOnInput): Promise<boolean> {
  const result = await safeQuery(
    `INSERT INTO add_ons (slug, name, category, duration, price, unit, description, long_description, includes, meeting_point, images)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name), category = VALUES(category), duration = VALUES(duration),
       price = VALUES(price), unit = VALUES(unit), description = VALUES(description),
       long_description = VALUES(long_description), includes = VALUES(includes),
       meeting_point = VALUES(meeting_point), images = VALUES(images)`,
    [
      input.slug,
      input.name,
      input.category,
      input.duration,
      input.price,
      input.unit,
      input.description,
      fromList(input.longDescription),
      fromList(input.includes),
      input.meetingPoint,
      fromList(input.images),
    ]
  );
  return result !== null;
}

export async function deleteAddOn(slug: string): Promise<boolean> {
  const result = await safeQuery("DELETE FROM add_ons WHERE slug = ?", [slug]);
  return result !== null;
}
