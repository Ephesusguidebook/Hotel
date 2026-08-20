-- Aurelia Bay — database schema + seed data
-- Run this once in phpMyAdmin (SQL tab) against the u876643594_otel_site database.
-- Multi-value fields (images, amenities, includes, long_description) are stored
-- one item per line — the app splits/joins on newlines, no JSON needed.

CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191) NOT NULL,
  price INT NOT NULL,
  size VARCHAR(50) NOT NULL,
  occupancy VARCHAR(50) NOT NULL,
  bed VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  amenities TEXT NOT NULL,
  images TEXT NOT NULL,
  available TINYINT(1) NOT NULL DEFAULT 1,
  units_left INT NOT NULL DEFAULT 3,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS add_ons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191) NOT NULL,
  category VARCHAR(20) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  price INT NOT NULL,
  unit VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  includes TEXT NOT NULL,
  meeting_point VARCHAR(191) NOT NULL,
  images TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data — mirrors the current placeholder content in src/lib/data.ts,
-- so switching the site over to the database doesn't change what visitors see.

INSERT INTO rooms (slug, name, price, size, occupancy, bed, description, amenities, images, available, units_left, sort_order) VALUES
('deluxe-sea-view', 'Deluxe Sea View', 420, '38 m²', '2 guests', '1 King bed',
 'An elegant room framed by floor-to-ceiling windows overlooking the bay, with a private balcony and hand-finished walnut furnishings.',
 'Sea view balcony\nRain shower\nNespresso bar\nFree Wi-Fi\nAir conditioning',
 '/images/room-deluxe.jpg\n/images/room-deluxe-2.jpg\n/images/room-deluxe-3.jpg\n/images/room-deluxe-4.jpg\n/images/room-deluxe-5.jpg',
 1, 3, 1),
('signature-suite', 'Signature Suite', 680, '62 m²', '2–3 guests', '1 King bed + daybed',
 'A separate living area, soaking tub, and wraparound terrace make this suite the residence-away-from-home for longer stays.',
 'Wraparound terrace\nSoaking tub\nLiving area\nButler service\nMini bar',
 '/images/room-suite.jpg\n/images/room-suite-2.jpg\n/images/room-suite-3.jpg\n/images/room-suite-4.jpg\n/images/room-suite-5.jpg',
 1, 1, 2),
('executive-panorama', 'Executive Panorama', 540, '48 m²', '2 guests', '1 King bed',
 'Perched on the top floor, this room pairs uninterrupted coastline views with a curated in-room library and writing desk.',
 'Panoramic view\nReading nook\nEspresso bar\nTurndown service\nFree Wi-Fi',
 '/images/room-executive.jpg\n/images/room-executive-2.jpg\n/images/room-executive-3.jpg\n/images/room-executive-4.jpg\n/images/room-executive-5.jpg',
 1, 2, 3),
('family-garden-room', 'Family Garden Room', 490, '55 m²', '4 guests', '1 King bed + 2 Twin beds',
 'Opening onto the hotel''s citrus garden, this two-room layout gives families room to spread out without leaving the grounds.',
 'Garden access\nConnecting layout\nKids'' welcome kit\nFree Wi-Fi\nAir conditioning',
 '/images/room-family.jpg\n/images/room-family-2.jpg\n/images/room-family-3.jpg\n/images/room-family-4.jpg\n/images/room-family-5.jpg',
 1, 3, 4);

INSERT INTO add_ons (slug, name, category, duration, price, unit, description, long_description, includes, meeting_point, images, sort_order) VALUES
('old-town-walking-tour', 'Old Town Walking Tour', 'Tour', '3 hours', 65, 'per guest',
 'A guided stroll through the old quarter''s cathedrals, ceramics workshops, and hidden piazzas with a local historian.',
 'This small-group walk starts just after breakfast, when the old quarter is quiet and the light is soft on the stonework.\nYour guide is a local historian who has led this route for years — expect stops at the cathedral, a family-run ceramics workshop, and a handful of piazzas most visitors walk straight past.\nThe pace is unhurried, with plenty of stops for photos and questions. Comfortable shoes are recommended.',
 'Local historian guide\nSmall group (max 8 guests)\nBottled water\nHotel pickup',
 'Hotel lobby, 9:00 AM',
 '/images/tour-city.jpg\n/images/tour-city-2.jpg\n/images/tour-city-3.jpg\n/images/tour-city-4.jpg',
 1),
('sunset-sailing-cruise', 'Sunset Sailing Cruise', 'Tour', '2.5 hours', 110, 'per guest',
 'A private sail along the coastline with prosecco and local antipasti as the sun drops behind the cliffs.',
 'A private sailing boat departs from the hotel''s private jetty in the late afternoon, timed so the sun sets while you''re on the water.\nThe route hugs the coastline, passing a handful of coves only reachable by boat, before anchoring for prosecco and a plate of local antipasti.\nA small, intimate group — most evenings it''s just one or two families or couples aboard.',
 'Private skipper\nProsecco & antipasti\nLife jackets provided\nReturn to hotel jetty',
 'Hotel jetty, 5:30 PM (seasonal)',
 '/images/tour-sunset.jpg\n/images/tour-sunset-2.jpg\n/images/tour-sunset-3.jpg\n/images/tour-sunset-4.jpg',
 2),
('private-spa-day', 'Private Spa Day', 'Tour', 'Full day', 190, 'per guest',
 'Full access to the thermal suite plus a 60-minute treatment of your choice at the Aurelia Bay spa.',
 'A full day at the spa, starting with the thermal suite — sauna, steam room, and a cold plunge overlooking the garden.\nYour 60-minute treatment can be booked for any time during the day; choose from massage, facial, or a regional herbal wrap.\nLight spa cuisine and herbal teas are available throughout the day in the relaxation lounge.',
 'Full thermal suite access\n60-minute treatment of choice\nSpa robe & slippers\nLight spa cuisine',
 'Spa reception, any time from 9:00 AM',
 '/images/tour-spa.jpg\n/images/tour-spa-2.jpg\n/images/tour-spa-3.jpg\n/images/tour-spa-4.jpg',
 3),
('airport-private-transfer', 'Private Airport Transfer', 'Transfer', 'Door to door', 95, 'per vehicle',
 'A private car with a dedicated driver between Naples International Airport and the hotel, tracked to your flight.',
 'A private car and driver meet you at arrivals with a name sign, whatever time your flight lands.\nYour driver tracks your flight, so delays don''t cost you anything — the car will be waiting.\nThe drive along the coast takes a little over an hour; bottled water and Wi-Fi are available on board.',
 'Flight tracking\nMeet & greet at arrivals\nBottled water & Wi-Fi\nUp to 4 passengers, 4 bags',
 'Arrivals hall, Naples International Airport',
 '/images/tour-transfer.jpg\n/images/tour-transfer-2.jpg\n/images/tour-transfer-3.jpg\n/images/tour-transfer-4.jpg',
 4);
