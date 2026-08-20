-- Aurelia Bay — additional content tables (Blog, Site Settings, About Us, Legal pages)
-- Run this once in phpMyAdmin (SQL tab) against the u876643594_otel_site database,
-- AFTER schema.sql has already been imported. Safe to re-run (IF NOT EXISTS).
-- Multi-value fields are stored as plain text (one item per line, or blank-line
-- separated blocks for legal sections) — no JSON needed.

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  title VARCHAR(191) NOT NULL,
  image VARCHAR(191) NOT NULL,
  post_date VARCHAR(50) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS site_settings (
  id TINYINT PRIMARY KEY,
  hotel_name VARCHAR(191) NOT NULL,
  tagline VARCHAR(191) NOT NULL,
  city VARCHAR(191) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(191) NOT NULL,
  address VARCHAR(255) NOT NULL,
  check_in VARCHAR(50) NOT NULL,
  check_out VARCHAR(50) NOT NULL,
  front_desk_hours VARCHAR(100) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS about_content (
  id TINYINT PRIMARY KEY,
  hero_title VARCHAR(191) NOT NULL,
  hero_description VARCHAR(255) NOT NULL,
  story_heading VARCHAR(191) NOT NULL,
  story_paragraphs TEXT NOT NULL,
  team_image VARCHAR(191) NOT NULL,
  value_blocks TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS legal_pages (
  slug VARCHAR(20) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  updated_label VARCHAR(50) NOT NULL,
  sections TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data — mirrors the current placeholder content in src/lib/data.ts,
-- so switching these pages over to the database doesn't change what visitors see.

INSERT INTO blog_posts (slug, title, image, post_date, excerpt, content, sort_order) VALUES
('a-guide-to-the-coastline', 'A Quiet Guide to the Coastline', '/images/blog-1.jpg', 'June 3, 2026',
 'Beyond the postcard views, the coastline holds a handful of places our concierge team returns to again and again.',
 'The coastline is generous with its views, but the places worth lingering are usually a few steps off the main path.\nOur concierge team keeps a running list of morning markets, quiet coves, and family-run trattorias that don''t appear in most guides — we''re glad to share it at check-in.\nWhatever the season, an early start is rewarded with empty piazzas and soft light for photographs.',
 1),
('seasonal-tasting-menu', 'Notes on the Seasonal Tasting Menu', '/images/blog-2.jpg', 'May 18, 2026',
 'Our kitchen changes its tasting menu with the harvest. Here''s what''s on the table this season.',
 'Each season brings a new set of ingredients from the hillside farms just above the bay.\nThis spring''s menu leans on citrus, wild herbs, and the morning catch — a reflection of what the region does best.\nGuests can request a wine pairing curated by our sommelier for any evening of their stay.',
 2),
('planning-a-quiet-arrival', 'Planning a Quiet Arrival', '/images/blog-3.jpg', 'April 22, 2026',
 'A few small choices make the first hour of a trip feel unhurried rather than rushed.',
 'The first hour of any trip sets the tone for the days that follow.\nArranging a private transfer, confirming your room preferences ahead of time, and arriving after the midday heat are small choices that add up.\nOur front desk is happy to prepare all of this before you land.',
 3),
('the-spa-ritual', 'Inside the Spa Ritual', '/images/blog-4.jpg', 'March 9, 2026',
 'A look at the thermal suite and the treatment philosophy behind it.',
 'Our spa draws on regional traditions of thermal bathing, paired with a slower, more attentive approach to treatments.\nEach ritual begins with a short consultation, so the experience can be adjusted to how you''re actually feeling that day.\nThe thermal suite is available to any guest staying two nights or more.',
 4);

INSERT INTO site_settings (id, hotel_name, tagline, city, phone, email, address, check_in, check_out, front_desk_hours) VALUES
(1, 'Aurelia Bay', 'A quiet luxury on the water''s edge', 'Amalfi Coast, Italy', '+39 089 000 000', 'reservations@aureliabay.example', 'Via del Faro 12, 84010, Amalfi Coast, Italy', '3:00 PM', '11:00 AM', 'Available 24 hours');

INSERT INTO about_content (id, hero_title, hero_description, story_heading, story_paragraphs, team_image, value_blocks) VALUES
(1, 'A family project, twenty years in', 'From a six-room guesthouse to a small coastal hotel, built one season at a time.', 'How Aurelia Bay began',
 'Aurelia Bay opened in the early 2000s as a six-room guesthouse run by a single family out of a converted harborside villa. What guests kept coming back for wasn''t the size of the rooms — it was the sense that someone had thought carefully about how they''d spend their days.\nOver two decades, the property grew slowly: a few more rooms, a proper kitchen, a small spa built into the old cellar. Each addition was made with the same instinct that started the place — build for the guest who wants to slow down, not the one passing through.\nToday the team is larger, but the approach hasn''t changed. Reservations are still answered by someone who knows the coastline personally, and the tours and transfers we recommend are the ones we''d take ourselves.',
 '/images/about-team.jpg',
 'Small by design :: A limited number of rooms so every stay gets full attention, not a shift-change of staff.\nRooted in place :: Most of what''s on the table, and much of what''s in the rooms, comes from within a short drive of the hotel.\nQuietly run :: No loudspeakers, no upsells at check-in — service that shows up when it''s useful and steps back otherwise.');

INSERT INTO legal_pages (slug, title, updated_label, sections) VALUES
('privacy', 'Privacy Policy', 'August 2026',
 '1. Information We Collect\nWhen you make a reservation, contact us, or browse Aurelia Bay''s website, we may collect information such as your name, email address, phone number, and stay preferences.\nWe also collect limited technical information (such as browser type and pages visited) to help us understand how the site is used and to keep it running smoothly.\n\n2. How We Use Information\nInformation you provide is used to process reservations, respond to enquiries, and personalize your stay — for example, remembering room preferences from a previous visit.\nWe do not sell guest information to third parties.\n\n3. Cookies\nThis site may use cookies to remember basic preferences and to understand aggregate visitor patterns. You can disable cookies in your browser settings at any time.\n\n4. Data Retention\nReservation and guest records are retained for as long as needed to fulfil legal, accounting, and operational requirements, after which they are securely deleted.\n\n5. Your Rights\nYou may request access to, correction of, or deletion of your personal information at any time by contacting us at reservations@aureliabay.example.\n\n6. Contact\nQuestions about this policy can be directed to reservations@aureliabay.example or +39 089 000 000.'),
('terms', 'Terms & Conditions', 'August 2026',
 '1. Reservations\nA valid credit card is required to guarantee a reservation. Rates are quoted per room, per night, and are subject to change until a reservation is confirmed.\n\n2. Check-In & Check-Out\nCheck-in begins at 3:00 PM and check-out is by 11:00 AM. Early check-in and late check-out may be arranged in advance, subject to availability.\n\n3. Cancellations\nReservations may be cancelled free of charge up to 5 days before arrival. Cancellations made after this window, or no-shows, may be charged the equivalent of one night''s stay.\n\n4. Tours & Transfers\nTours and transfers booked as add-ons are subject to availability and weather conditions. Cancellations within 24 hours of a scheduled activity may not be refundable.\n\n5. Guest Conduct\nGuests are expected to treat staff, other guests, and the property with respect. The hotel reserves the right to end a stay without refund in cases of serious misconduct.\n\n6. Liability\nAurelia Bay is not responsible for loss or damage to personal belongings, except where required by law. Guests are encouraged to use in-room safes for valuables.\n\n7. Changes to These Terms\nThese terms may be updated from time to time. The version in effect at the time of your reservation will apply to your stay.');
