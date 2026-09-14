-- Aurelia Bay — schema v5: nearby places to visit
--
-- Run this AFTER schema.sql, schema_v2.sql, schema_v3.sql and schema_v4.sql.
--
-- "Attractions" are the sights around the hotel that guests ask about at
-- reception: ruins, museums, villages, beaches. They are purely
-- informational — unlike add_ons they aren't booked or added to a cart.
--
-- Opening hours and entry fees are plain text rather than structured
-- columns on purpose: every site words them differently ("closes an hour
-- before sunset", "free on public holidays"), they change every season, and
-- the hotel edits them by hand in the admin panel anyway.

-- Import with UTF-8 so accented characters and symbols (m², °C, Turkish
-- letters) survive. Without this a client defaulting to latin1 stores
-- them double-encoded, which shows up as "mÂ²" on the site.
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS attractions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191) NOT NULL,
  -- Free text, not an enum: the public page builds its filter chips from
  -- whatever categories actually exist, so this works for a hotel anywhere.
  category VARCHAR(60) NOT NULL,
  distance VARCHAR(60) NOT NULL,
  travel_time VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  highlights TEXT NOT NULL,
  opening_hours VARCHAR(191) NOT NULL DEFAULT '',
  entry_fee VARCHAR(191) NOT NULL DEFAULT '',
  best_time VARCHAR(191) NOT NULL DEFAULT '',
  map_url VARCHAR(500) NOT NULL DEFAULT '',
  images TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed content for a hotel in Selçuk (Ephesus region, Türkiye).
-- Fees and hours were checked against published 2026 sources; they move
-- every season, so the admin panel is the place to keep them current and
-- the pages tell guests to confirm at reception.
INSERT INTO attractions (slug, name, category, distance, travel_time, description, long_description, highlights, opening_hours, entry_fee, best_time, map_url, images, sort_order) VALUES
('ephesus-ancient-city', 'Ephesus Ancient City', 'Ancient Site', '3 km', '5 minutes by car',
 'One of the best-preserved classical cities in the Mediterranean, and the reason most people come to this valley.',
 'Ephesus was a port city of a quarter of a million people, and it still reads that way on the ground: you walk down a marble street with the drainage still beneath your feet, past the shopfronts, into a theatre built for 25,000.\nThe Library of Celsus is the photograph everyone takes, but the stretch of Curetes Street above it — with its fountains, latrines and mosaic pavements — is where the city feels lived in.\nThe Terrace Houses are a separate ticket and worth it: six Roman apartment blocks under a modern roof, with frescoes and floor mosaics still in place. Allow an extra hour.',
 'Library of Celsus\nGreat Theatre\nCuretes Street and the Trajan Fountain\nTerrace Houses (separate ticket)\nMarble Road and the Agora',
 'Summer roughly 08:00–19:00; shorter in winter. Last tickets about an hour before closing.',
 '€40 (2026 season). Terrace Houses €15 extra. Covered by the Museum Pass Türkiye.',
 'Right at opening or after 16:00 — the middle of the day is hot and busy with cruise groups.',
 'https://maps.google.com/?q=Ephesus+Ancient+City+Selcuk',
 '/images/hero-addons.jpg\n/images/tour-city.jpg\n/images/tour-city-2.jpg', 10),

('house-of-the-virgin-mary', 'House of the Virgin Mary', 'Religious Site', '9 km', '20 minutes by car',
 'A small stone chapel on Bülbül Mountain, believed by many to be where Mary spent her last years.',
 'The house sits in pine woods above Ephesus, at the end of a winding road. It is modest — a single vaulted room, a few candles, a queue that moves quietly.\nThe site was identified in the nineteenth century from the visions of a German nun who had never travelled here, and the ruins that were found matched her description closely enough that the place has been a pilgrimage site ever since. It has been visited by several popes.\nBelow the chapel is a wall where visitors tie written wishes, and a spring that many people stop to drink from. Whatever you make of the history, the walk through the trees is worth the drive on its own.',
 'The chapel itself\nThe wishing wall\nSpring water fountains\nViews down the valley towards the sea',
 'Roughly 08:30–18:00, with the ticket office closing half an hour earlier.',
 'About 700 TL (2026 season).',
 'Early morning, before the tour coaches arrive from the cruise port.',
 'https://maps.google.com/?q=House+of+the+Virgin+Mary+Selcuk',
 '/images/tour-spa.jpg\n/images/tour-spa-2.jpg', 20),

('ephesus-archaeological-museum', 'Ephesus Archaeological Museum', 'Museum', '900 m', '10 minutes on foot',
 'Where everything portable from Ephesus ended up — including the two famous statues of Artemis.',
 'Visiting the museum after the site rather than before makes the ruins click into place: the friezes, household objects and portrait busts here were all lifted from the buildings you have just walked through.\nThe two cult statues of Artemis of Ephesus are the reason most people come. They are covered in rows of ovoid forms whose meaning is still argued over — breasts, bull testicles, or gourds, depending on whose paper you read.\nIt is a compact museum. An hour and a half is enough, and it is air-conditioned, which makes it a sensible stop in the middle of a hot afternoon.',
 'The two Artemis statues\nFinds from the Terrace Houses\nThe gladiator gravestones\nRoman portrait sculpture',
 'Roughly 08:30–19:00 in summer, shorter in winter.',
 '€10 (2026 season). Covered by the Museum Pass Türkiye.',
 'Mid-afternoon, when it is too hot to be out on the site.',
 'https://maps.google.com/?q=Ephesus+Archaeological+Museum+Selcuk',
 '/images/about-story.jpg', 30),

('temple-of-artemis', 'Temple of Artemis', 'Ancient Site', '1 km', '12 minutes on foot',
 'One of the Seven Wonders of the Ancient World, now a single reassembled column in a field.',
 'There is almost nothing left, and that is rather the point. The temple was four times the footprint of the Parthenon, built and rebuilt over centuries, burned down on the night Alexander the Great was born — and today one column stands in a marshy field with a stork nesting on top of it.\nIt takes ten minutes to see. Go anyway, ideally with the museum fresh in your mind, and stand at the fence looking back towards Ayasuluk Hill: you get the mosque, the basilica and the castle stacked up behind the column, which is fifteen hundred years of the same valley in one view.',
 'The surviving column\nStorks nesting in summer\nThe view towards Ayasuluk Hill\nFoundation outlines in the field',
 'Open site, roughly 08:30–19:00.',
 'Free.',
 'Late afternoon, when the light comes across the field.',
 'https://maps.google.com/?q=Temple+of+Artemis+Selcuk',
 '/images/tour-sunset.jpg\n/images/tour-sunset-2.jpg', 40),

('basilica-of-st-john', 'Basilica of St John', 'Religious Site', '1 km', '12 minutes on foot',
 'The ruins of a great domed basilica built by Justinian over what is held to be the tomb of St John.',
 'Enough of the basilica survives — columns, the marble floor, the stepped tomb area — to read the shape of what was once one of the largest churches in the world.\nIt stands on Ayasuluk Hill, so the visit doubles as a viewpoint: the Temple of Artemis column below, the İsa Bey Mosque at the foot of the slope, and on a clear day the sea beyond the plain.\nThe ticket also covers Ayasuluk Fortress at the top of the hill, so allow time to walk up rather than turning back at the basilica.',
 'The marble tomb of St John\nReconstructed columns of the nave\nThe baptistery\nViews over Selçuk and the plain',
 'Roughly 08:00–19:00 in summer, shorter in winter.',
 '€6 (2026 season), which also covers Ayasuluk Fortress.',
 'Late afternoon for the light and the view.',
 'https://maps.google.com/?q=Basilica+of+St+John+Selcuk',
 '/images/hero-about.jpg', 50),

('ayasuluk-fortress', 'Ayasuluk Fortress', 'Ancient Site', '1.2 km', '18 minutes on foot, uphill',
 'The walled citadel crowning the hill above town, on the same ticket as the basilica.',
 'The fortress has been rebuilt by nearly everyone who held this valley — Byzantines, the Aydınid emirate, the Ottomans — and the walls show it, with different stonework stacked in layers.\nInside there is a small mosque, cisterns and the outlines of a settlement, but the reason to climb is the circuit of the walls. From the top you can see the whole of Selçuk, the Artemision field, the plain running west to the sea, and the ridge that hides Ephesus.\nIt is a steady uphill walk from the basilica entrance. Take water; there is almost no shade.',
 'The layered fortification walls\nThe panorama over the plain\nThe small fortress mosque\nSunset over the sea from the ramparts',
 'Same hours as the Basilica of St John.',
 'Included with the Basilica of St John ticket.',
 'An hour before sunset.',
 'https://maps.google.com/?q=Ayasuluk+Fortress+Selcuk',
 '/images/hero-rooms.jpg', 60),

('isa-bey-mosque', 'İsa Bey Mosque', 'Religious Site', '1 km', '12 minutes on foot',
 'A fourteenth-century Seljuk-era mosque at the foot of Ayasuluk Hill, built partly from Ephesus.',
 'Built in 1375 for the Aydınid ruler İsa Bey, this is one of the oldest and most unusual mosques in Anatolia — an asymmetric plan, an ornate west façade, and a courtyard whose granite columns were carried up from the ruins of Ephesus and the harbour baths.\nIt is still a working mosque and still quiet. Dress modestly, take your shoes off at the door, and avoid prayer times.\nIt sits directly between the Temple of Artemis and the basilica, so it fits naturally into a walk up the hill rather than needing a trip of its own.',
 'The carved marble west portal\nRecycled columns from Ephesus\nThe courtyard and its fountain\nTilework in the prayer hall',
 'Open outside prayer times; closed briefly five times a day.',
 'Free.',
 'Mid-morning, between prayers.',
 'https://maps.google.com/?q=Isa+Bey+Mosque+Selcuk',
 '/images/blog-3.jpg', 70),

('sirince-village', 'Şirince Village', 'Village', '8 km', '20 minutes by car',
 'A hillside village of Greek stone houses, known for its fruit wines and its Sunday crowds.',
 'Şirince was a Greek village until the population exchange of 1923, and the houses — whitewashed, wood-framed, stacked up two facing slopes — have survived largely intact.\nThe village makes fruit wine, and nearly every other doorway offers a tasting: apple, peach, blackberry, pomegranate. There is a covered market of olive oil, soap and dried fruit, a couple of old churches, and a lot of cats.\nGo on a weekday. On summer Sundays the lanes fill with day-trippers from İzmir and the charm is harder to find. A minibus runs from Selçuk bus station every twenty minutes if you would rather not drive the hill road.',
 'Fruit wine tastings\nThe old Greek houses\nSt John the Baptist church\nThe village market\nHillside restaurants with valley views',
 'Village is always open; shops roughly 09:00–19:00.',
 'Free (parking charged on busy days).',
 'A weekday morning. Avoid summer Sundays.',
 'https://maps.google.com/?q=Sirince+Selcuk',
 '/images/blog-1.jpg\n/images/blog-2.jpg', 80),

('pamucak-beach', 'Pamucak Beach', 'Beach', '7 km', '12 minutes by car',
 'A long, open stretch of sand west of Ephesus — the quietest beach within easy reach.',
 'Pamucak is where the plain finally meets the Aegean, and because it has never been built up the way the resorts further south have, it stays comparatively empty even in August.\nThe sand is coarse and dark, the beach is long enough that you can always walk away from other people, and the water shelves gently. There is little natural shade, so take an umbrella or use one of the beach clubs at the northern end.\nIt faces west, which makes it the obvious place to end a day of ruins: the sun goes down over the water, straight ahead.',
 'Several kilometres of open sand\nSunset over the Aegean\nBeach clubs at the north end\nQuiet even in high summer',
 'Open all day, year round.',
 'Free. Sunbeds and parking charged at the beach clubs.',
 'Late afternoon through sunset.',
 'https://maps.google.com/?q=Pamucak+Beach+Selcuk',
 '/images/hero-home.jpg\n/images/hero-contact.jpg', 90);
