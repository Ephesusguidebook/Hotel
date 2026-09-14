-- Ida Efes — schema v6: rate plans, date-range pricing, availability calendar
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Carry the chosen plan onto cart lines and reservation lines
-- ---------------------------------------------------------------------------
-- MySQL has no "ADD COLUMN IF NOT EXISTS", and it stops dead on the first
-- error — so a plain ALTER would abort the whole import on a second run and
-- the seed data below would never be inserted. Each column is therefore
-- added through a prepared statement that first checks whether it is already
-- there, which makes this whole file safe to run as many times as you like.
-- (`DO 0` is the do-nothing branch: it returns no result set, so a skipped
-- column doesn't show up as an empty table in phpMyAdmin.)

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cart_items' AND COLUMN_NAME = 'rate_plan_id') > 0,
  'DO 0',
  'ALTER TABLE cart_items ADD COLUMN rate_plan_id INT NULL'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cart_items' AND COLUMN_NAME = 'rate_plan_name') > 0,
  'DO 0',
  'ALTER TABLE cart_items ADD COLUMN rate_plan_name VARCHAR(191) NOT NULL DEFAULT '''''));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cart_items' AND COLUMN_NAME = 'stay_total') > 0,
  'DO 0',
  'ALTER TABLE cart_items ADD COLUMN stay_total INT NULL'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reservation_items' AND COLUMN_NAME = 'rate_plan_id') > 0,
  'DO 0',
  'ALTER TABLE reservation_items ADD COLUMN rate_plan_id INT NULL'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reservation_items' AND COLUMN_NAME = 'rate_plan_name') > 0,
  'DO 0',
  'ALTER TABLE reservation_items ADD COLUMN rate_plan_name VARCHAR(191) NOT NULL DEFAULT '''''));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reservation_items' AND COLUMN_NAME = 'stay_total') > 0,
  'DO 0',
  'ALTER TABLE reservation_items ADD COLUMN stay_total INT NULL'));
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- Seed
-- ---------------------------------------------------------------------------
-- IGNORE rather than ON DUPLICATE KEY UPDATE: if you've renamed a plan or
-- rewritten its description, re-running this file must leave your version
-- alone rather than resetting it.
INSERT IGNORE INTO rate_plans (slug, name, description, sort_order) VALUES
('room-only', 'Room Only', 'Just the room — breakfast can be added at reception.', 10),
('breakfast-included', 'Breakfast Included', 'Full breakfast for every guest, served until 10:30.', 20);

-- Two years of base rates from the start of 2026, so the site is sellable
-- the moment the schema is imported. Breakfast is seeded at +$25 per night;
-- change any of it from the room's calendar in the admin panel.
-- NOT EXISTS keeps a second run from stacking duplicate rows on top.
-- The COLLATE on both sides is deliberate. If these tables were created by an
-- earlier version of this file they may carry a different collation from
-- `rooms`, and comparing the two directly fails with "Illegal mix of
-- collations". Slugs are plain ASCII, so comparing them as bytes is both
-- correct and immune to whatever collation each table ended up with.
INSERT INTO room_rates (room_slug, rate_plan_id, start_date, end_date, price, label)
SELECT r.slug, p.id, '2026-01-01', '2027-12-31',
       r.price + IF(p.slug = 'breakfast-included', 25, 0),
       'Standard rate'
FROM rooms r CROSS JOIN rate_plans p
WHERE NOT EXISTS (
  SELECT 1 FROM room_rates x
  WHERE x.room_slug COLLATE utf8mb4_bin = r.slug COLLATE utf8mb4_bin
    AND x.rate_plan_id = p.id AND x.label = 'Standard rate'
);

-- A worked example of a seasonal override: high summer costs more, and
-- because this range is narrower than the one above it takes priority.
-- Delete it, or change the dates and price, from the room's calendar.
INSERT INTO room_rates (room_slug, rate_plan_id, start_date, end_date, price, label)
SELECT r.slug, p.id, '2027-07-01', '2027-08-31',
       ROUND(r.price * 1.35) + IF(p.slug = 'breakfast-included', 25, 0),
       'High season'
FROM rooms r CROSS JOIN rate_plans p
WHERE NOT EXISTS (
  SELECT 1 FROM room_rates x
  WHERE x.room_slug COLLATE utf8mb4_bin = r.slug COLLATE utf8mb4_bin
    AND x.rate_plan_id = p.id AND x.label = 'High season'
);
