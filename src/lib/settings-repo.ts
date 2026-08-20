import { safeQuery } from "@/lib/db";
import { siteSettingsSeed, type SiteSettings } from "@/lib/data";

type SettingsRow = {
  hotel_name: string;
  tagline: string;
  city: string;
  phone: string;
  email: string;
  address: string;
  check_in: string;
  check_out: string;
  front_desk_hours: string;
};

function rowToSettings(row: SettingsRow): SiteSettings {
  return {
    hotelName: row.hotel_name,
    tagline: row.tagline,
    city: row.city,
    phone: row.phone,
    email: row.email,
    address: row.address,
    checkIn: row.check_in,
    checkOut: row.check_out,
    frontDeskHours: row.front_desk_hours,
  };
}

/** Site-wide identity + contact settings. Falls back to static seed data if the DB is unreachable/unconfigured. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await safeQuery<SettingsRow>(
    "SELECT hotel_name, tagline, city, phone, email, address, check_in, check_out, front_desk_hours FROM site_settings WHERE id = 1"
  );
  if (!rows || rows.length === 0) return siteSettingsSeed;
  return rowToSettings(rows[0]);
}

/** Update the singleton site settings row. Returns false if the DB isn't configured. */
export async function updateSiteSettings(input: SiteSettings): Promise<boolean> {
  const result = await safeQuery(
    `INSERT INTO site_settings (id, hotel_name, tagline, city, phone, email, address, check_in, check_out, front_desk_hours)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       hotel_name = VALUES(hotel_name), tagline = VALUES(tagline), city = VALUES(city),
       phone = VALUES(phone), email = VALUES(email), address = VALUES(address),
       check_in = VALUES(check_in), check_out = VALUES(check_out), front_desk_hours = VALUES(front_desk_hours)`,
    [
      input.hotelName,
      input.tagline,
      input.city,
      input.phone,
      input.email,
      input.address,
      input.checkIn,
      input.checkOut,
      input.frontDeskHours,
    ]
  );
  return result !== null;
}
