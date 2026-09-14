-- Aurelia Bay — schema v6: rate plans, date-range pricing, availability calendar
--
-- Run this AFTER schema.sql … schema_v5.sql.
--
-- This replaces the old flat model, where a room had one price and one
-- `units_left` counter that checkout decremented. That counter could not
-- answer "is this room free in July?", and it fell to zero permanently as
-- bookings came in. Three tables fix that:
--
--   rate_plans        what you're selling (Room Only, Breakfast Included…)
--   room_rates        a price for one room, on one plan, over a date range
--   room_availability per-date overrides: close a day, or set that day's stock
--
-- `rooms.units_left` keeps its column but changes meaning: it is now the
-- standing number of rooms of that type, not a countdown. How many are free
-- on a given date is worked out as:
--
--   (room_availability override for that date, else rooms.units_left)
--   minus rooms already booked on that date by live reservations
--
-- so the calendar moves on its own as reservations arrive, and checkout no
-- longer writes to rooms.

-- Import with UTF-8 so accented characters and symbols (m², °C, Turkish
-- letters) survive. Without this a client defaulting to latin1 stores
-- them double-encoded, which shows up as "mÂ²" on the site.
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- Rate plans
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rate_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Date-range prices
-- ---------------------------------------------------------------------------
-- One row = "this room, on this plan, costs this much per night between
-- these dates". Ranges are inclusive of start_date and end_date.
--
-- Ranges may overlap, and that is the point: put a wide season price down
-- first, then lay a short holiday price over the top of it. When more than
-- one row covers a night, **the narrower range wins** — a 3-day New Year
-- rate beats a 6-month winter rate — and if two are equally narrow the more
-- recently added one wins.
--
-- A night with no row at all is NOT sellable on that plan. That is a
-- deliberate choice: an unpriced date shows as unavailable rather than
-- quietly falling back to some other number and selling a room too cheap.
CREATE TABLE IF NOT EXISTS room_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_slug VARCHAR(191) NOT NULL,
  rate_plan_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price INT NOT NULL,
  label VARCHAR(191) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_room_rates_lookup (room_slug, rate_plan_id, start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Per-date availability overrides
-- ---------------------------------------------------------------------------
-- Only dates that differ from the room's standing stock need a row. No row
-- means "the usual number of rooms is open". `closed = 1` shuts the date
-- regardless of `units` (maintenance, an owner's block, a full-property
-- buyout).
CREATE TABLE IF NOT EXISTS room_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_slug VARCHAR(191) NOT NULL,
  date DATE NOT NULL,
  units INT NOT NULL DEFAULT 0,
  closed TINYINT(1) NOT NULL DEFAULT 0,
  note VARCHAR(191) NOT NULL DEFAULT '',
  UNIQUE KEY uniq_room_date (room_slug, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Carry the chosen plan onto cart lines and reservation lines
-- ---------------------------------------------------------------------------
-- Added defensively so re-running this file is harmless; MySQL has no
-- "ADD COLUMN IF NOT EXISTS", so a second run reports a duplicate-column
-- error on these four statements only. That is safe to ignore.
-- `stay_total` is the price of ONE room for the WHOLE stay, worked out from
-- that stay's nightly rates and frozen at the moment it goes in the cart —
-- nights can be priced differently, so a single per-night figure cannot be
-- multiplied back up. `unit_price` stays alongside it as the average per
-- night, which is what a guest reads on the line. Add-ons leave it NULL.
ALTER TABLE cart_items ADD COLUMN rate_plan_id INT NULL;
ALTER TABLE cart_items ADD COLUMN rate_plan_name VARCHAR(191) NOT NULL DEFAULT '';
ALTER TABLE cart_items ADD COLUMN stay_total INT NULL;
ALTER TABLE reservation_items ADD COLUMN rate_plan_id INT NULL;
ALTER TABLE reservation_items ADD COLUMN rate_plan_name VARCHAR(191) NOT NULL DEFAULT '';
ALTER TABLE reservation_items ADD COLUMN stay_total INT NULL;

-- ---------------------------------------------------------------------------
-- Seed
-- ---------------------------------------------------------------------------
INSERT INTO rate_plans (slug, name, description, sort_order) VALUES
('room-only', 'Room Only', 'Just the room — breakfast can be added at reception.', 10),
('breakfast-included', 'Breakfast Included', 'Full breakfast for every guest, served until 10:30.', 20)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- Two years of base rates from the start of 2026, so the site is sellable
-- the moment the schema is imported. Breakfast is seeded at +$25 per night;
-- change any of it from the room's calendar in the admin panel.
INSERT INTO room_rates (room_slug, rate_plan_id, start_date, end_date, price, label)
SELECT r.slug, p.id, '2026-01-01', '2027-12-31',
       r.price + IF(p.slug = 'breakfast-included', 25, 0),
       'Standard rate'
FROM rooms r CROSS JOIN rate_plans p;

-- A worked example of a seasonal override: high summer costs more, and
-- because this range is narrower than the one above it takes priority.
-- Delete it, or change the dates and price, from the room's calendar.
INSERT INTO room_rates (room_slug, rate_plan_id, start_date, end_date, price, label)
SELECT r.slug, p.id, '2027-07-01', '2027-08-31',
       ROUND(r.price * 1.35) + IF(p.slug = 'breakfast-included', 25, 0),
       'High season'
FROM rooms r CROSS JOIN rate_plans p;
