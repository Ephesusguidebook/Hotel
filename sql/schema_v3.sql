-- Ida Efes — customer accounts, cart, and reservations
-- Run this once in phpMyAdmin (SQL tab) against the u876643594_otel_site database,
-- AFTER schema.sql and schema_v2.sql have already been imported. Safe to re-run
-- (IF NOT EXISTS). No seed data — these tables start empty.

-- Import with UTF-8 so accented characters and symbols (m², °C, Turkish
-- letters) survive. Without this a client defaulting to latin1 stores
-- them double-encoded, which shows up as "mÂ²" on the site.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(191) NOT NULL,
  phone VARCHAR(50) NOT NULL DEFAULT '',
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Opaque-token session store. The cookie holds only the token; every request
-- looks the session up here, so a session can be revoked server-side.
CREATE TABLE IF NOT EXISTS customer_sessions (
  token VARCHAR(64) PRIMARY KEY,
  customer_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One-time email verification tokens, sent by link. Expire after 24h.
CREATE TABLE IF NOT EXISTS email_verifications (
  token VARCHAR(64) PRIMARY KEY,
  customer_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_verify_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- A customer's active shopping cart. item_type distinguishes a room stay from
-- an add-on (tour/transfer); check_in/check_out/guests only apply to rooms.
-- A customer can have multiple room lines (e.g. two rooms for one trip).
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  item_type VARCHAR(10) NOT NULL,
  item_slug VARCHAR(191) NOT NULL,
  item_name VARCHAR(191) NOT NULL,
  unit_price INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  check_in DATE NULL,
  check_out DATE NULL,
  guests INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cart_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- A placed reservation (what checkout creates from the cart). payment_status
-- is tracked here manually by the admin — there is no live payment
-- processor; no card data is ever stored.
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid',
  subtotal INT NOT NULL,
  taxes_fees INT NOT NULL,
  total INT NOT NULL,
  check_in DATE NULL,
  check_out DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reservations_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Line items belonging to a reservation — a frozen copy of what was in the
-- cart at checkout time, so later price/content edits don't rewrite history.
CREATE TABLE IF NOT EXISTS reservation_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  item_type VARCHAR(10) NOT NULL,
  item_slug VARCHAR(191) NOT NULL,
  item_name VARCHAR(191) NOT NULL,
  unit_price INT NOT NULL,
  quantity INT NOT NULL,
  check_in DATE NULL,
  check_out DATE NULL,
  line_total INT NOT NULL,
  INDEX idx_res_items_reservation (reservation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
