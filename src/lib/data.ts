// Placeholder content for the Ida Efes hotel site.
// Replace with real property data before launch.

// Long-form body copy is rich text (HTML) so it can be edited in the admin
// panel's editor. The seed content below is still authored as one paragraph
// per line — these helpers turn it into the stored shape.

function escapeSeed(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function paras(lines: string[]): string {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeSeed(line)}</p>`)
    .join("");
}

function sectionsHtml(sections: { heading: string; body: string[] }[]): string {
  return sections
    .map((section) =>
      [`<h2>${escapeSeed(section.heading)}</h2>`, paras(section.body)].join("")
    )
    .join("");
}

// Fallback identity, used only when the database is unreachable. The live
// values come from the site_settings table and are edited at /admin/settings.
//
// The contact details below are deliberately left as obvious placeholders
// rather than plausible-looking invented ones — a wrong phone number on a
// hotel's own website is worse than a blank.
export const hotel = {
  name: "Ida Efes",
  tagline: "A few minutes from Ephesus",
  city: "Selçuk, İzmir",
  phone: "+90 000 000 00 00",
  email: "reservations@idaefes.example",
  address: "Selçuk, İzmir, Türkiye",
  checkIn: "2:00 PM",
  checkOut: "12:00 PM",
};

// Site-wide settings — hotel identity + contact details shown in the Footer,
// Contact page, and page metadata. Editable from /admin/settings.
export type SiteSettings = {
  hotelName: string;
  tagline: string;
  city: string;
  phone: string;
  email: string;
  address: string;
  checkIn: string;
  checkOut: string;
  frontDeskHours: string;
};

export const siteSettingsSeed: SiteSettings = {
  hotelName: hotel.name,
  tagline: hotel.tagline,
  city: hotel.city,
  phone: hotel.phone,
  email: hotel.email,
  address: hotel.address,
  checkIn: hotel.checkIn,
  checkOut: hotel.checkOut,
  frontDeskHours: "Available 24 hours",
};

// About Us page content. Editable from /admin/about.
export type ValueBlock = { title: string; text: string };

export type AboutContent = {
  heroTitle: string;
  heroDescription: string;
  storyHeading: string;
  /** Rich text (HTML). */
  story: string;
  teamImage: string;
  values: ValueBlock[];
};

export const aboutContentSeed: AboutContent = {
  heroTitle: "A family project, twenty years in",
  heroDescription:
    "From a six-room guesthouse to a small coastal hotel, built one season at a time.",
  storyHeading: "How Ida Efes began",
  story: paras([
    "Ida Efes opened in the early 2000s as a six-room guesthouse run by a single family out of a converted harborside villa. What guests kept coming back for wasn't the size of the rooms — it was the sense that someone had thought carefully about how they'd spend their days.",
    "Over two decades, the property grew slowly: a few more rooms, a proper kitchen, a small spa built into the old cellar. Each addition was made with the same instinct that started the place — build for the guest who wants to slow down, not the one passing through.",
    "Today the team is larger, but the approach hasn't changed. Reservations are still answered by someone who knows the coastline personally, and the tours and transfers we recommend are the ones we'd take ourselves.",
  ]),
  teamImage: "/images/about-team.jpg",
  values: [
    {
      title: "Small by design",
      text: "A limited number of rooms so every stay gets full attention, not a shift-change of staff.",
    },
    {
      title: "Rooted in place",
      text: "Most of what's on the table, and much of what's in the rooms, comes from within a short drive of the hotel.",
    },
    {
      title: "Quietly run",
      text: "No loudspeakers, no upsells at check-in — service that shows up when it's useful and steps back otherwise.",
    },
  ],
};

// Privacy Policy / Terms & Conditions. Editable from /admin/legal.
export type LegalPage = {
  slug: "privacy" | "terms";
  title: string;
  updated: string;
  /** Rich text (HTML) — headings and paragraphs. */
  content: string;
};

export const legalPagesSeed: Record<"privacy" | "terms", LegalPage> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    updated: "August 2026",
    content: sectionsHtml([
      {
        heading: "1. Information We Collect",
        body: [
          "When you make a reservation, contact us, or browse Ida Efes's website, we may collect information such as your name, email address, phone number, and stay preferences.",
          "We also collect limited technical information (such as browser type and pages visited) to help us understand how the site is used and to keep it running smoothly.",
        ],
      },
      {
        heading: "2. How We Use Information",
        body: [
          "Information you provide is used to process reservations, respond to enquiries, and personalize your stay — for example, remembering room preferences from a previous visit.",
          "We do not sell guest information to third parties.",
        ],
      },
      {
        heading: "3. Cookies",
        body: [
          "This site may use cookies to remember basic preferences and to understand aggregate visitor patterns. You can disable cookies in your browser settings at any time.",
        ],
      },
      {
        heading: "4. Data Retention",
        body: [
          "Reservation and guest records are retained for as long as needed to fulfil legal, accounting, and operational requirements, after which they are securely deleted.",
        ],
      },
      {
        heading: "5. Your Rights",
        body: [
          "You may request access to, correction of, or deletion of your personal information at any time by contacting us at reservations@idaefes.example.",
        ],
      },
      {
        heading: "6. Contact",
        body: [
          "Questions about this policy can be directed to reservations@idaefes.example or +39 089 000 000.",
        ],
      },
    ]),
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    updated: "August 2026",
    content: sectionsHtml([
      {
        heading: "1. Reservations",
        body: [
          "A valid credit card is required to guarantee a reservation. Rates are quoted per room, per night, and are subject to change until a reservation is confirmed.",
        ],
      },
      {
        heading: "2. Check-In & Check-Out",
        body: [
          "Check-in begins at 3:00 PM and check-out is by 11:00 AM. Early check-in and late check-out may be arranged in advance, subject to availability.",
        ],
      },
      {
        heading: "3. Cancellations",
        body: [
          "Reservations may be cancelled free of charge up to 5 days before arrival. Cancellations made after this window, or no-shows, may be charged the equivalent of one night's stay.",
        ],
      },
      {
        heading: "4. Tours & Transfers",
        body: [
          "Tours and transfers booked as add-ons are subject to availability and weather conditions. Cancellations within 24 hours of a scheduled activity may not be refundable.",
        ],
      },
      {
        heading: "5. Guest Conduct",
        body: [
          "Guests are expected to treat staff, other guests, and the property with respect. The hotel reserves the right to end a stay without refund in cases of serious misconduct.",
        ],
      },
      {
        heading: "6. Liability",
        body: [
          "Ida Efes is not responsible for loss or damage to personal belongings, except where required by law. Guests are encouraged to use in-room safes for valuables.",
        ],
      },
      {
        heading: "7. Changes to These Terms",
        body: [
          "These terms may be updated from time to time. The version in effect at the time of your reservation will apply to your stay.",
        ],
      },
    ]),
  },
};

export type Room = {
  slug: string;
  name: string;
  image: string;
  images: string[];
  size: string;
  occupancy: string;
  bed: string;
  price: number;
  description: string;
  amenities: string[];
  available: boolean;
  unitsLeft: number;
};

export const rooms: Room[] = [
  {
    slug: "deluxe-sea-view",
    name: "Deluxe Sea View",
    image: "/images/room-deluxe.jpg",
    images: [
      "/images/room-deluxe.jpg",
      "/images/room-deluxe-2.jpg",
      "/images/room-deluxe-3.jpg",
      "/images/room-deluxe-4.jpg",
      "/images/room-deluxe-5.jpg",
    ],
    size: "38 m²",
    occupancy: "2 guests",
    bed: "1 King bed",
    price: 420,
    description:
      "An elegant room framed by floor-to-ceiling windows overlooking the bay, with a private balcony and hand-finished walnut furnishings.",
    amenities: ["Sea view balcony", "Rain shower", "Nespresso bar", "Free Wi-Fi", "Air conditioning"],
    available: true,
    unitsLeft: 3,
  },
  {
    slug: "signature-suite",
    name: "Signature Suite",
    image: "/images/room-suite.jpg",
    images: [
      "/images/room-suite.jpg",
      "/images/room-suite-2.jpg",
      "/images/room-suite-3.jpg",
      "/images/room-suite-4.jpg",
      "/images/room-suite-5.jpg",
    ],
    size: "62 m²",
    occupancy: "2–3 guests",
    bed: "1 King bed + daybed",
    price: 680,
    description:
      "A separate living area, soaking tub, and wraparound terrace make this suite the residence-away-from-home for longer stays.",
    amenities: ["Wraparound terrace", "Soaking tub", "Living area", "Butler service", "Mini bar"],
    available: true,
    unitsLeft: 1,
  },
  {
    slug: "executive-panorama",
    name: "Executive Panorama",
    image: "/images/room-executive.jpg",
    images: [
      "/images/room-executive.jpg",
      "/images/room-executive-2.jpg",
      "/images/room-executive-3.jpg",
      "/images/room-executive-4.jpg",
      "/images/room-executive-5.jpg",
    ],
    size: "48 m²",
    occupancy: "2 guests",
    bed: "1 King bed",
    price: 540,
    description:
      "Perched on the top floor, this room pairs uninterrupted coastline views with a curated in-room library and writing desk.",
    amenities: ["Panoramic view", "Reading nook", "Espresso bar", "Turndown service", "Free Wi-Fi"],
    available: true,
    unitsLeft: 2,
  },
  {
    slug: "family-garden-room",
    name: "Family Garden Room",
    image: "/images/room-family.jpg",
    images: [
      "/images/room-family.jpg",
      "/images/room-family-2.jpg",
      "/images/room-family-3.jpg",
      "/images/room-family-4.jpg",
      "/images/room-family-5.jpg",
    ],
    size: "55 m²",
    occupancy: "4 guests",
    bed: "1 King bed + 2 Twin beds",
    price: 490,
    description:
      "Opening onto the hotel's citrus garden, this two-room layout gives families room to spread out without leaving the grounds.",
    amenities: ["Garden access", "Connecting layout", "Kids' welcome kit", "Free Wi-Fi", "Air conditioning"],
    available: true,
    unitsLeft: 3,
  },
];

export type AddOn = {
  slug: string;
  name: string;
  image: string;
  images: string[];
  category: "Tour" | "Transfer";
  duration: string;
  price: number;
  unit: string;
  description: string;
  /** Rich text (HTML). */
  longDescription: string;
  includes: string[];
  meetingPoint: string;
};

export const addOns: AddOn[] = [
  {
    slug: "old-town-walking-tour",
    name: "Old Town Walking Tour",
    image: "/images/tour-city.jpg",
    images: [
      "/images/tour-city.jpg",
      "/images/tour-city-2.jpg",
      "/images/tour-city-3.jpg",
      "/images/tour-city-4.jpg",
    ],
    category: "Tour",
    duration: "3 hours",
    price: 65,
    unit: "per guest",
    description:
      "A guided stroll through the old quarter's cathedrals, ceramics workshops, and hidden piazzas with a local historian.",
    longDescription: paras([
      "This small-group walk starts just after breakfast, when the old quarter is quiet and the light is soft on the stonework.",
      "Your guide is a local historian who has led this route for years — expect stops at the cathedral, a family-run ceramics workshop, and a handful of piazzas most visitors walk straight past.",
      "The pace is unhurried, with plenty of stops for photos and questions. Comfortable shoes are recommended.",
    ]),
    includes: ["Local historian guide", "Small group (max 8 guests)", "Bottled water", "Hotel pickup"],
    meetingPoint: "Hotel lobby, 9:00 AM",
  },
  {
    slug: "sunset-sailing-cruise",
    name: "Sunset Sailing Cruise",
    image: "/images/tour-sunset.jpg",
    images: [
      "/images/tour-sunset.jpg",
      "/images/tour-sunset-2.jpg",
      "/images/tour-sunset-3.jpg",
      "/images/tour-sunset-4.jpg",
    ],
    category: "Tour",
    duration: "2.5 hours",
    price: 110,
    unit: "per guest",
    description:
      "A private sail along the coastline with prosecco and local antipasti as the sun drops behind the cliffs.",
    longDescription: paras([
      "A private sailing boat departs from the hotel's private jetty in the late afternoon, timed so the sun sets while you're on the water.",
      "The route hugs the coastline, passing a handful of coves only reachable by boat, before anchoring for prosecco and a plate of local antipasti.",
      "A small, intimate group — most evenings it's just one or two families or couples aboard.",
    ]),
    includes: ["Private skipper", "Prosecco & antipasti", "Life jackets provided", "Return to hotel jetty"],
    meetingPoint: "Hotel jetty, 5:30 PM (seasonal)",
  },
  {
    slug: "private-spa-day",
    name: "Private Spa Day",
    image: "/images/tour-spa.jpg",
    images: [
      "/images/tour-spa.jpg",
      "/images/tour-spa-2.jpg",
      "/images/tour-spa-3.jpg",
      "/images/tour-spa-4.jpg",
    ],
    category: "Tour",
    duration: "Full day",
    price: 190,
    unit: "per guest",
    description:
      "Full access to the thermal suite plus a 60-minute treatment of your choice at the Ida Efes spa.",
    longDescription: paras([
      "A full day at the spa, starting with the thermal suite — sauna, steam room, and a cold plunge overlooking the garden.",
      "Your 60-minute treatment can be booked for any time during the day; choose from massage, facial, or a regional herbal wrap.",
      "Light spa cuisine and herbal teas are available throughout the day in the relaxation lounge.",
    ]),
    includes: ["Full thermal suite access", "60-minute treatment of choice", "Spa robe & slippers", "Light spa cuisine"],
    meetingPoint: "Spa reception, any time from 9:00 AM",
  },
  {
    slug: "airport-private-transfer",
    name: "Private Airport Transfer",
    image: "/images/tour-transfer.jpg",
    images: [
      "/images/tour-transfer.jpg",
      "/images/tour-transfer-2.jpg",
      "/images/tour-transfer-3.jpg",
      "/images/tour-transfer-4.jpg",
    ],
    category: "Transfer",
    duration: "Door to door",
    price: 95,
    unit: "per vehicle",
    description:
      "A private car with a dedicated driver between Naples International Airport and the hotel, tracked to your flight.",
    longDescription: paras([
      "A private car and driver meet you at arrivals with a name sign, whatever time your flight lands.",
      "Your driver tracks your flight, so delays don't cost you anything — the car will be waiting.",
      "The drive along the coast takes a little over an hour; bottled water and Wi-Fi are available on board.",
    ]),
    includes: ["Flight tracking", "Meet & greet at arrivals", "Bottled water & Wi-Fi", "Up to 4 passengers, 4 bags"],
    meetingPoint: "Arrivals hall, Naples International Airport",
  },
];

export type BlogPost = {
  slug: string;
  title: string;
  image: string;
  date: string;
  excerpt: string;
  /** Rich text (HTML). */
  content: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "a-guide-to-the-coastline",
    title: "A Quiet Guide to the Coastline",
    image: "/images/blog-1.jpg",
    date: "June 3, 2026",
    excerpt:
      "Beyond the postcard views, the coastline holds a handful of places our concierge team returns to again and again.",
    content: paras([
      "The coastline is generous with its views, but the places worth lingering are usually a few steps off the main path.",
      "Our concierge team keeps a running list of morning markets, quiet coves, and family-run trattorias that don't appear in most guides — we're glad to share it at check-in.",
      "Whatever the season, an early start is rewarded with empty piazzas and soft light for photographs.",
    ]),
  },
  {
    slug: "seasonal-tasting-menu",
    title: "Notes on the Seasonal Tasting Menu",
    image: "/images/blog-2.jpg",
    date: "May 18, 2026",
    excerpt:
      "Our kitchen changes its tasting menu with the harvest. Here's what's on the table this season.",
    content: paras([
      "Each season brings a new set of ingredients from the hillside farms just above the bay.",
      "This spring's menu leans on citrus, wild herbs, and the morning catch — a reflection of what the region does best.",
      "Guests can request a wine pairing curated by our sommelier for any evening of their stay.",
    ]),
  },
  {
    slug: "planning-a-quiet-arrival",
    title: "Planning a Quiet Arrival",
    image: "/images/blog-3.jpg",
    date: "April 22, 2026",
    excerpt:
      "A few small choices make the first hour of a trip feel unhurried rather than rushed.",
    content: paras([
      "The first hour of any trip sets the tone for the days that follow.",
      "Arranging a private transfer, confirming your room preferences ahead of time, and arriving after the midday heat are small choices that add up.",
      "Our front desk is happy to prepare all of this before you land.",
    ]),
  },
  {
    slug: "the-spa-ritual",
    title: "Inside the Spa Ritual",
    image: "/images/blog-4.jpg",
    date: "March 9, 2026",
    excerpt:
      "A look at the thermal suite and the treatment philosophy behind it.",
    content: paras([
      "Our spa draws on regional traditions of thermal bathing, paired with a slower, more attentive approach to treatments.",
      "Each ritual begins with a short consultation, so the experience can be adjusted to how you're actually feeling that day.",
      "The thermal suite is available to any guest staying two nights or more.",
    ]),
  },
];

export const testimonials = [
  {
    quote:
      "Every detail felt considered, from the room to the restaurant recommendations. We're already planning our return.",
    author: "E. Marchetti",
  },
  {
    quote:
      "Quiet, warm, and beautifully run. The staff remembered our names by the second morning.",
    author: "L. Novak",
  },
  {
    quote:
      "The kind of place that makes you slow down. The sunset cruise was the highlight of our trip.",
    author: "R. Fontaine",
  },
];

// Nearby places to visit — the sights guests ask about at reception.
// Purely informational: unlike add_ons these aren't booked or priced.
// Editable from /admin/nearby.
export type Attraction = {
  slug: string;
  name: string;
  /** Free text ("Ancient Site", "Museum", "Beach"…). The listing page
   *  builds its filter chips from whatever values are actually in use. */
  category: string;
  distance: string;
  travelTime: string;
  description: string;
  /** Rich text (HTML). */
  longDescription: string;
  highlights: string[];
  openingHours: string;
  entryFee: string;
  bestTime: string;
  mapUrl: string;
  image: string;
  images: string[];
};

export const attractionsSeed: Attraction[] = [
  {
    slug: "ephesus-ancient-city",
    name: "Ephesus Ancient City",
    category: "Ancient Site",
    distance: "3 km",
    travelTime: "5 minutes by car",
    description:
      "One of the best-preserved classical cities in the Mediterranean, and the reason most people come to this valley.",
    longDescription: paras([
      "Ephesus was a port city of a quarter of a million people, and it still reads that way on the ground: you walk down a marble street with the drainage still beneath your feet, past the shopfronts, into a theatre built for 25,000.",
      "The Library of Celsus is the photograph everyone takes, but the stretch of Curetes Street above it — with its fountains, latrines and mosaic pavements — is where the city feels lived in.",
      "The Terrace Houses are a separate ticket and worth it: six Roman apartment blocks under a modern roof, with frescoes and floor mosaics still in place. Allow an extra hour.",
    ]),
    highlights: [
      "Library of Celsus",
      "Great Theatre",
      "Curetes Street and the Trajan Fountain",
      "Terrace Houses (separate ticket)",
      "Marble Road and the Agora",
    ],
    openingHours:
      "Summer roughly 08:00–19:00; shorter in winter. Last tickets about an hour before closing.",
    entryFee:
      "€40 (2026 season). Terrace Houses €15 extra. Covered by the Museum Pass Türkiye.",
    bestTime:
      "Right at opening or after 16:00 — the middle of the day is hot and busy with cruise groups.",
    mapUrl: "https://maps.google.com/?q=Ephesus+Ancient+City+Selcuk",
    image: "/images/hero-addons.jpg",
    images: [
      "/images/hero-addons.jpg",
      "/images/tour-city.jpg",
      "/images/tour-city-2.jpg",
    ],
  },
  {
    slug: "house-of-the-virgin-mary",
    name: "House of the Virgin Mary",
    category: "Religious Site",
    distance: "9 km",
    travelTime: "20 minutes by car",
    description:
      "A small stone chapel on Bülbül Mountain, believed by many to be where Mary spent her last years.",
    longDescription: paras([
      "The house sits in pine woods above Ephesus, at the end of a winding road. It is modest — a single vaulted room, a few candles, a queue that moves quietly.",
      "The site was identified in the nineteenth century from the visions of a German nun who had never travelled here, and the ruins that were found matched her description closely enough that the place has been a pilgrimage site ever since. It has been visited by several popes.",
      "Below the chapel is a wall where visitors tie written wishes, and a spring that many people stop to drink from. Whatever you make of the history, the walk through the trees is worth the drive on its own.",
    ]),
    highlights: [
      "The chapel itself",
      "The wishing wall",
      "Spring water fountains",
      "Views down the valley towards the sea",
    ],
    openingHours:
      "Roughly 08:30–18:00, with the ticket office closing half an hour earlier.",
    entryFee: "About 700 TL (2026 season).",
    bestTime:
      "Early morning, before the tour coaches arrive from the cruise port.",
    mapUrl: "https://maps.google.com/?q=House+of+the+Virgin+Mary+Selcuk",
    image: "/images/tour-spa.jpg",
    images: ["/images/tour-spa.jpg", "/images/tour-spa-2.jpg"],
  },
  {
    slug: "ephesus-archaeological-museum",
    name: "Ephesus Archaeological Museum",
    category: "Museum",
    distance: "900 m",
    travelTime: "10 minutes on foot",
    description:
      "Where everything portable from Ephesus ended up — including the two famous statues of Artemis.",
    longDescription: paras([
      "Visiting the museum after the site rather than before makes the ruins click into place: the friezes, household objects and portrait busts here were all lifted from the buildings you have just walked through.",
      "The two cult statues of Artemis of Ephesus are the reason most people come. They are covered in rows of ovoid forms whose meaning is still argued over — breasts, bull testicles, or gourds, depending on whose paper you read.",
      "It is a compact museum. An hour and a half is enough, and it is air-conditioned, which makes it a sensible stop in the middle of a hot afternoon.",
    ]),
    highlights: [
      "The two Artemis statues",
      "Finds from the Terrace Houses",
      "The gladiator gravestones",
      "Roman portrait sculpture",
    ],
    openingHours: "Roughly 08:30–19:00 in summer, shorter in winter.",
    entryFee: "€10 (2026 season). Covered by the Museum Pass Türkiye.",
    bestTime: "Mid-afternoon, when it is too hot to be out on the site.",
    mapUrl: "https://maps.google.com/?q=Ephesus+Archaeological+Museum+Selcuk",
    image: "/images/about-story.jpg",
    images: ["/images/about-story.jpg"],
  },
  {
    slug: "temple-of-artemis",
    name: "Temple of Artemis",
    category: "Ancient Site",
    distance: "1 km",
    travelTime: "12 minutes on foot",
    description:
      "One of the Seven Wonders of the Ancient World, now a single reassembled column in a field.",
    longDescription: paras([
      "There is almost nothing left, and that is rather the point. The temple was four times the footprint of the Parthenon, built and rebuilt over centuries, burned down on the night Alexander the Great was born — and today one column stands in a marshy field with a stork nesting on top of it.",
      "It takes ten minutes to see. Go anyway, ideally with the museum fresh in your mind, and stand at the fence looking back towards Ayasuluk Hill: you get the mosque, the basilica and the castle stacked up behind the column, which is fifteen hundred years of the same valley in one view.",
    ]),
    highlights: [
      "The surviving column",
      "Storks nesting in summer",
      "The view towards Ayasuluk Hill",
      "Foundation outlines in the field",
    ],
    openingHours: "Open site, roughly 08:30–19:00.",
    entryFee: "Free.",
    bestTime: "Late afternoon, when the light comes across the field.",
    mapUrl: "https://maps.google.com/?q=Temple+of+Artemis+Selcuk",
    image: "/images/tour-sunset.jpg",
    images: ["/images/tour-sunset.jpg", "/images/tour-sunset-2.jpg"],
  },
  {
    slug: "basilica-of-st-john",
    name: "Basilica of St John",
    category: "Religious Site",
    distance: "1 km",
    travelTime: "12 minutes on foot",
    description:
      "The ruins of a great domed basilica built by Justinian over what is held to be the tomb of St John.",
    longDescription: paras([
      "Enough of the basilica survives — columns, the marble floor, the stepped tomb area — to read the shape of what was once one of the largest churches in the world.",
      "It stands on Ayasuluk Hill, so the visit doubles as a viewpoint: the Temple of Artemis column below, the İsa Bey Mosque at the foot of the slope, and on a clear day the sea beyond the plain.",
      "The ticket also covers Ayasuluk Fortress at the top of the hill, so allow time to walk up rather than turning back at the basilica.",
    ]),
    highlights: [
      "The marble tomb of St John",
      "Reconstructed columns of the nave",
      "The baptistery",
      "Views over Selçuk and the plain",
    ],
    openingHours: "Roughly 08:00–19:00 in summer, shorter in winter.",
    entryFee: "€6 (2026 season), which also covers Ayasuluk Fortress.",
    bestTime: "Late afternoon for the light and the view.",
    mapUrl: "https://maps.google.com/?q=Basilica+of+St+John+Selcuk",
    image: "/images/hero-about.jpg",
    images: ["/images/hero-about.jpg"],
  },
  {
    slug: "ayasuluk-fortress",
    name: "Ayasuluk Fortress",
    category: "Ancient Site",
    distance: "1.2 km",
    travelTime: "18 minutes on foot, uphill",
    description:
      "The walled citadel crowning the hill above town, on the same ticket as the basilica.",
    longDescription: paras([
      "The fortress has been rebuilt by nearly everyone who held this valley — Byzantines, the Aydınid emirate, the Ottomans — and the walls show it, with different stonework stacked in layers.",
      "Inside there is a small mosque, cisterns and the outlines of a settlement, but the reason to climb is the circuit of the walls. From the top you can see the whole of Selçuk, the Artemision field, the plain running west to the sea, and the ridge that hides Ephesus.",
      "It is a steady uphill walk from the basilica entrance. Take water; there is almost no shade.",
    ]),
    highlights: [
      "The layered fortification walls",
      "The panorama over the plain",
      "The small fortress mosque",
      "Sunset over the sea from the ramparts",
    ],
    openingHours: "Same hours as the Basilica of St John.",
    entryFee: "Included with the Basilica of St John ticket.",
    bestTime: "An hour before sunset.",
    mapUrl: "https://maps.google.com/?q=Ayasuluk+Fortress+Selcuk",
    image: "/images/hero-rooms.jpg",
    images: ["/images/hero-rooms.jpg"],
  },
  {
    slug: "isa-bey-mosque",
    name: "İsa Bey Mosque",
    category: "Religious Site",
    distance: "1 km",
    travelTime: "12 minutes on foot",
    description:
      "A fourteenth-century Seljuk-era mosque at the foot of Ayasuluk Hill, built partly from Ephesus.",
    longDescription: paras([
      "Built in 1375 for the Aydınid ruler İsa Bey, this is one of the oldest and most unusual mosques in Anatolia — an asymmetric plan, an ornate west façade, and a courtyard whose granite columns were carried up from the ruins of Ephesus and the harbour baths.",
      "It is still a working mosque and still quiet. Dress modestly, take your shoes off at the door, and avoid prayer times.",
      "It sits directly between the Temple of Artemis and the basilica, so it fits naturally into a walk up the hill rather than needing a trip of its own.",
    ]),
    highlights: [
      "The carved marble west portal",
      "Recycled columns from Ephesus",
      "The courtyard and its fountain",
      "Tilework in the prayer hall",
    ],
    openingHours: "Open outside prayer times; closed briefly five times a day.",
    entryFee: "Free.",
    bestTime: "Mid-morning, between prayers.",
    mapUrl: "https://maps.google.com/?q=Isa+Bey+Mosque+Selcuk",
    image: "/images/blog-3.jpg",
    images: ["/images/blog-3.jpg"],
  },
  {
    slug: "sirince-village",
    name: "Şirince Village",
    category: "Village",
    distance: "8 km",
    travelTime: "20 minutes by car",
    description:
      "A hillside village of Greek stone houses, known for its fruit wines and its Sunday crowds.",
    longDescription: paras([
      "Şirince was a Greek village until the population exchange of 1923, and the houses — whitewashed, wood-framed, stacked up two facing slopes — have survived largely intact.",
      "The village makes fruit wine, and nearly every other doorway offers a tasting: apple, peach, blackberry, pomegranate. There is a covered market of olive oil, soap and dried fruit, a couple of old churches, and a lot of cats.",
      "Go on a weekday. On summer Sundays the lanes fill with day-trippers from İzmir and the charm is harder to find. A minibus runs from Selçuk bus station every twenty minutes if you would rather not drive the hill road.",
    ]),
    highlights: [
      "Fruit wine tastings",
      "The old Greek houses",
      "St John the Baptist church",
      "The village market",
      "Hillside restaurants with valley views",
    ],
    openingHours: "Village is always open; shops roughly 09:00–19:00.",
    entryFee: "Free (parking charged on busy days).",
    bestTime: "A weekday morning. Avoid summer Sundays.",
    mapUrl: "https://maps.google.com/?q=Sirince+Selcuk",
    image: "/images/blog-1.jpg",
    images: ["/images/blog-1.jpg", "/images/blog-2.jpg"],
  },
  {
    slug: "pamucak-beach",
    name: "Pamucak Beach",
    category: "Beach",
    distance: "7 km",
    travelTime: "12 minutes by car",
    description:
      "A long, open stretch of sand west of Ephesus — the quietest beach within easy reach.",
    longDescription: paras([
      "Pamucak is where the plain finally meets the Aegean, and because it has never been built up the way the resorts further south have, it stays comparatively empty even in August.",
      "The sand is coarse and dark, the beach is long enough that you can always walk away from other people, and the water shelves gently. There is little natural shade, so take an umbrella or use one of the beach clubs at the northern end.",
      "It faces west, which makes it the obvious place to end a day of ruins: the sun goes down over the water, straight ahead.",
    ]),
    highlights: [
      "Several kilometres of open sand",
      "Sunset over the Aegean",
      "Beach clubs at the north end",
      "Quiet even in high summer",
    ],
    openingHours: "Open all day, year round.",
    entryFee: "Free. Sunbeds and parking charged at the beach clubs.",
    bestTime: "Late afternoon through sunset.",
    mapUrl: "https://maps.google.com/?q=Pamucak+Beach+Selcuk",
    image: "/images/hero-home.jpg",
    images: ["/images/hero-home.jpg", "/images/hero-contact.jpg"],
  },
];
