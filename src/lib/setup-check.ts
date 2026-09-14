import { missingTables } from "@/lib/db";

/**
 * Which schema file brings which tables.
 *
 * Kept here so the admin panel can tell an operator exactly what still needs
 * importing. Without it a missing table just looks like a feature that
 * silently refuses to work — a save appears to succeed and nothing shows up.
 */
const SCHEMA_FILES: { file: string; tables: string[]; adds: string }[] = [
  { file: "sql/schema.sql", tables: ["rooms", "add_ons"], adds: "rooms and tours" },
  {
    file: "sql/schema_v2.sql",
    tables: ["blog_posts", "site_settings", "about_content", "legal_pages"],
    adds: "journal, about, legal pages and site settings",
  },
  {
    file: "sql/schema_v3.sql",
    tables: ["customers", "cart_items", "reservations", "reservation_items"],
    adds: "guest accounts, the cart and reservations",
  },
  { file: "sql/schema_v4.sql", tables: ["media"], adds: "the photo library" },
  {
    file: "sql/schema_v5.sql",
    tables: ["attractions"],
    adds: "nearby places to visit",
  },
  {
    file: "sql/schema_v6.sql",
    tables: ["rate_plans", "room_rates", "room_availability"],
    adds: "rate plans, date-range pricing and the availability calendar",
  },
];

export type PendingSchema = { file: string; adds: string; tables: string[] };

/** Schema files whose tables aren't in the database yet. Null means the
 *  database itself couldn't be reached. */
export async function pendingSchemas(): Promise<PendingSchema[] | null> {
  const all = SCHEMA_FILES.flatMap((s) => s.tables);
  const missing = await missingTables(all);
  if (missing === null) return null;

  const missingSet = new Set(missing);
  return SCHEMA_FILES.filter((s) => s.tables.some((t) => missingSet.has(t))).map(
    (s) => ({
      file: s.file,
      adds: s.adds,
      tables: s.tables.filter((t) => missingSet.has(t)),
    })
  );
}

/** True when every table this feature needs is present. */
export async function schemaReady(tables: string[]): Promise<boolean> {
  const missing = await missingTables(tables);
  return missing !== null && missing.length === 0;
}
