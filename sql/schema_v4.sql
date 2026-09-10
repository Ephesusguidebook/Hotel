-- Aurelia Bay — schema v4: media library
--
-- Run this AFTER schema.sql, schema_v2.sql and schema_v3.sql.
--
-- Why the image bytes live in MySQL instead of on disk:
-- this site is redeployed from GitHub on every push, which replaces the
-- application's filesystem. Anything written to disk at runtime (an uploads
-- folder) would disappear on the next deploy. The database is the only
-- storage that survives, so uploaded photos are stored here and served by
-- the /api/media/<id> route.
--
-- Photos are converted to WebP and resized in the browser before upload
-- (Canvas.toBlob), so no server-side image library is needed — deliberate,
-- because this host has already shown it can't load native binaries built
-- for a different glibc. A typical uploaded photo lands around 150-500 KB,
-- comfortably under the server's 16 MB max_allowed_packet.

-- Import with UTF-8 so accented characters and symbols (m², °C, Turkish
-- letters) survive. Without this a client defaulting to latin1 stores
-- them double-encoded, which shows up as "mÂ²" on the site.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(191) NOT NULL,
  alt_text VARCHAR(255) NOT NULL DEFAULT '',
  mime_type VARCHAR(64) NOT NULL DEFAULT 'image/webp',
  width INT UNSIGNED NOT NULL DEFAULT 0,
  height INT UNSIGNED NOT NULL DEFAULT 0,
  size_bytes INT UNSIGNED NOT NULL DEFAULT 0,
  data LONGBLOB NOT NULL,
  -- Set when a photo came from the original /public/images set, so the
  -- one-off import can tell what it has already brought across and never
  -- imports the same file twice.
  source_path VARCHAR(191) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_media_source (source_path),
  KEY idx_media_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
