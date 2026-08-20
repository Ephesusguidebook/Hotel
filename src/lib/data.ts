// Placeholder content for the Aurelia Bay hotel site.
// Replace with real property data before launch.

export const hotel = {
  name: "Aurelia Bay",
  tagline: "A quiet luxury on the water's edge",
  city: "Amalfi Coast, Italy",
  phone: "+39 089 000 000",
  email: "reservations@aureliabay.example",
  address: "Via del Faro 12, 84010, Amalfi Coast, Italy",
  checkIn: "3:00 PM",
  checkOut: "11:00 AM",
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
  longDescription: string[];
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
    longDescription: [
      "This small-group walk starts just after breakfast, when the old quarter is quiet and the light is soft on the stonework.",
      "Your guide is a local historian who has led this route for years — expect stops at the cathedral, a family-run ceramics workshop, and a handful of piazzas most visitors walk straight past.",
      "The pace is unhurried, with plenty of stops for photos and questions. Comfortable shoes are recommended.",
    ],
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
    longDescription: [
      "A private sailing boat departs from the hotel's private jetty in the late afternoon, timed so the sun sets while you're on the water.",
      "The route hugs the coastline, passing a handful of coves only reachable by boat, before anchoring for prosecco and a plate of local antipasti.",
      "A small, intimate group — most evenings it's just one or two families or couples aboard.",
    ],
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
      "Full access to the thermal suite plus a 60-minute treatment of your choice at the Aurelia Bay spa.",
    longDescription: [
      "A full day at the spa, starting with the thermal suite — sauna, steam room, and a cold plunge overlooking the garden.",
      "Your 60-minute treatment can be booked for any time during the day; choose from massage, facial, or a regional herbal wrap.",
      "Light spa cuisine and herbal teas are available throughout the day in the relaxation lounge.",
    ],
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
    longDescription: [
      "A private car and driver meet you at arrivals with a name sign, whatever time your flight lands.",
      "Your driver tracks your flight, so delays don't cost you anything — the car will be waiting.",
      "The drive along the coast takes a little over an hour; bottled water and Wi-Fi are available on board.",
    ],
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
  content: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "a-guide-to-the-coastline",
    title: "A Quiet Guide to the Coastline",
    image: "/images/blog-1.jpg",
    date: "June 3, 2026",
    excerpt:
      "Beyond the postcard views, the coastline holds a handful of places our concierge team returns to again and again.",
    content: [
      "The coastline is generous with its views, but the places worth lingering are usually a few steps off the main path.",
      "Our concierge team keeps a running list of morning markets, quiet coves, and family-run trattorias that don't appear in most guides — we're glad to share it at check-in.",
      "Whatever the season, an early start is rewarded with empty piazzas and soft light for photographs.",
    ],
  },
  {
    slug: "seasonal-tasting-menu",
    title: "Notes on the Seasonal Tasting Menu",
    image: "/images/blog-2.jpg",
    date: "May 18, 2026",
    excerpt:
      "Our kitchen changes its tasting menu with the harvest. Here's what's on the table this season.",
    content: [
      "Each season brings a new set of ingredients from the hillside farms just above the bay.",
      "This spring's menu leans on citrus, wild herbs, and the morning catch — a reflection of what the region does best.",
      "Guests can request a wine pairing curated by our sommelier for any evening of their stay.",
    ],
  },
  {
    slug: "planning-a-quiet-arrival",
    title: "Planning a Quiet Arrival",
    image: "/images/blog-3.jpg",
    date: "April 22, 2026",
    excerpt:
      "A few small choices make the first hour of a trip feel unhurried rather than rushed.",
    content: [
      "The first hour of any trip sets the tone for the days that follow.",
      "Arranging a private transfer, confirming your room preferences ahead of time, and arriving after the midday heat are small choices that add up.",
      "Our front desk is happy to prepare all of this before you land.",
    ],
  },
  {
    slug: "the-spa-ritual",
    title: "Inside the Spa Ritual",
    image: "/images/blog-4.jpg",
    date: "March 9, 2026",
    excerpt:
      "A look at the thermal suite and the treatment philosophy behind it.",
    content: [
      "Our spa draws on regional traditions of thermal bathing, paired with a slower, more attentive approach to treatments.",
      "Each ritual begins with a short consultation, so the experience can be adjusted to how you're actually feeling that day.",
      "The thermal suite is available to any guest staying two nights or more.",
    ],
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
