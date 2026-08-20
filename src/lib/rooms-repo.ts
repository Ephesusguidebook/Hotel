import { safeQuery } from "@/lib/db";
import { rooms as seedRooms, type Room } from "@/lib/data";

type RoomRow = {
  slug: string;
  name: string;
  price: number;
  size: string;
  occupancy: string;
  bed: string;
  description: string;
  amenities: string;
  images: string;
  available: number;
  units_left: number;
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

function rowToRoom(row: RoomRow): Room {
  const images = toList(row.images);
  return {
    slug: row.slug,
    name: row.name,
    price: row.price,
    size: row.size,
    occupancy: row.occupancy,
    bed: row.bed,
    description: row.description,
    amenities: toList(row.amenities),
    images,
    image: images[0] ?? "/images/room-deluxe.jpg",
    available: !!row.available,
    unitsLeft: row.units_left,
  };
}

/** All rooms, ordered for display. Falls back to static seed data if the DB is unreachable/unconfigured. */
export async function getRooms(): Promise<Room[]> {
  const rows = await safeQuery<RoomRow>(
    "SELECT slug, name, price, size, occupancy, bed, description, amenities, images, available, units_left FROM rooms ORDER BY sort_order ASC, id ASC"
  );
  if (!rows) return seedRooms;
  if (rows.length === 0) return seedRooms;
  return rows.map(rowToRoom);
}

export async function getRoomBySlug(slug: string): Promise<Room | undefined> {
  const rows = await getRooms();
  return rows.find((r) => r.slug === slug);
}

export type RoomInput = {
  slug: string;
  name: string;
  price: number;
  size: string;
  occupancy: string;
  bed: string;
  description: string;
  amenities: string[];
  images: string[];
  available: boolean;
  unitsLeft: number;
};

/** Insert a room if its slug doesn't exist yet, otherwise update it. Returns false if the DB isn't configured. */
export async function upsertRoom(input: RoomInput): Promise<boolean> {
  const result = await safeQuery(
    `INSERT INTO rooms (slug, name, price, size, occupancy, bed, description, amenities, images, available, units_left)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name), price = VALUES(price), size = VALUES(size),
       occupancy = VALUES(occupancy), bed = VALUES(bed), description = VALUES(description),
       amenities = VALUES(amenities), images = VALUES(images),
       available = VALUES(available), units_left = VALUES(units_left)`,
    [
      input.slug,
      input.name,
      input.price,
      input.size,
      input.occupancy,
      input.bed,
      input.description,
      fromList(input.amenities),
      fromList(input.images),
      input.available ? 1 : 0,
      input.unitsLeft,
    ]
  );
  return result !== null;
}

export async function deleteRoom(slug: string): Promise<boolean> {
  const result = await safeQuery("DELETE FROM rooms WHERE slug = ?", [slug]);
  return result !== null;
}
