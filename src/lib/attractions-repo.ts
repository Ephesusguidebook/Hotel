import { safeQuery } from "@/lib/db";
import { attractionsSeed, type Attraction } from "@/lib/data";
import { toHtml } from "@/lib/rich-text";

type AttractionRow = {
  slug: string;
  name: string;
  category: string;
  distance: string;
  travel_time: string;
  description: string;
  long_description: string;
  highlights: string;
  opening_hours: string;
  entry_fee: string;
  best_time: string;
  map_url: string;
  images: string;
};

const COLUMNS =
  "slug, name, category, distance, travel_time, description, long_description, highlights, opening_hours, entry_fee, best_time, map_url, images";

function toList(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fromList(items: string[]): string {
  return items.map((s) => s.trim()).filter(Boolean).join("\n");
}

function rowToAttraction(row: AttractionRow): Attraction {
  const images = toList(row.images);
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    distance: row.distance,
    travelTime: row.travel_time,
    description: row.description,
    longDescription: toHtml(row.long_description),
    highlights: toList(row.highlights),
    openingHours: row.opening_hours,
    entryFee: row.entry_fee,
    bestTime: row.best_time,
    mapUrl: row.map_url,
    images,
    image: images[0] ?? "/images/hero-addons.jpg",
  };
}

/** Every nearby place, ordered for display. Falls back to static seed data
 *  if the DB is unreachable or not configured. */
export async function getAttractions(): Promise<Attraction[]> {
  const rows = await safeQuery<AttractionRow>(
    `SELECT ${COLUMNS} FROM attractions ORDER BY sort_order ASC, id ASC`
  );
  if (!rows) return attractionsSeed;
  if (rows.length === 0) return attractionsSeed;
  return rows.map(rowToAttraction);
}

export async function getAttractionBySlug(
  slug: string
): Promise<Attraction | undefined> {
  const all = await getAttractions();
  return all.find((a) => a.slug === slug);
}

/** The categories actually in use, in the order they first appear. Drives
 *  the filter chips on the listing page, so adding a new kind of place
 *  needs no code change. */
export function categoriesOf(attractions: Attraction[]): string[] {
  const seen: string[] = [];
  for (const item of attractions) {
    const category = item.category.trim();
    if (category && !seen.includes(category)) seen.push(category);
  }
  return seen;
}

export type AttractionInput = {
  slug: string;
  name: string;
  category: string;
  distance: string;
  travelTime: string;
  description: string;
  /** Rich text (HTML), already sanitised by the caller. */
  longDescription: string;
  highlights: string[];
  openingHours: string;
  entryFee: string;
  bestTime: string;
  mapUrl: string;
  images: string[];
};

/** Insert a place if its slug is new, otherwise update it. Returns false if
 *  the DB isn't configured. */
export async function upsertAttraction(
  input: AttractionInput
): Promise<boolean> {
  const result = await safeQuery(
    `INSERT INTO attractions (${COLUMNS})
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name), category = VALUES(category), distance = VALUES(distance),
       travel_time = VALUES(travel_time), description = VALUES(description),
       long_description = VALUES(long_description), highlights = VALUES(highlights),
       opening_hours = VALUES(opening_hours), entry_fee = VALUES(entry_fee),
       best_time = VALUES(best_time), map_url = VALUES(map_url), images = VALUES(images)`,
    [
      input.slug,
      input.name,
      input.category,
      input.distance,
      input.travelTime,
      input.description,
      input.longDescription,
      fromList(input.highlights),
      input.openingHours,
      input.entryFee,
      input.bestTime,
      input.mapUrl,
      fromList(input.images),
    ]
  );
  return result !== null;
}

export async function deleteAttraction(slug: string): Promise<boolean> {
  const result = await safeQuery("DELETE FROM attractions WHERE slug = ?", [
    slug,
  ]);
  return result !== null;
}
