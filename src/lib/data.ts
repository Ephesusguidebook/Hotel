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
  size: string;
  occupancy: string;
  bed: string;
  price: number;
  description: string;
  amenities: string[];
};

export const rooms: Room[] = [
  {
    slug: "deluxe-sea-view",
    name: "Deluxe Sea View",
    image: "/images/room-deluxe.jpg",
    size: "38 m²",
    occupancy: "2 guests",
    bed: "1 King bed",
    price: 420,
    description:
      "An elegant room framed by floor-to-ceiling windows overlooking the bay, with a private balcony and hand-finished walnut furnishings.",
    amenities: ["Sea view balcony", "Rain shower", "Nespresso bar", "Free Wi-Fi", "Air conditioning"],
  },
  {
    slug: "signature-suite",
    name: "Signature Suite",
    image: "/images/room-suite.jpg",
    size: "62 m²",
    occupancy: "2–3 guests",
    bed: "1 King bed + daybed",
    price: 680,
    description:
      "A separate living area, soaking tub, and wraparound terrace make this suite the residence-away-from-home for longer stays.",
    amenities: ["Wraparound terrace", "Soaking tub", "Living area", "Butler service", "Mini bar"],
  },
  {
    slug: "executive-panorama",
    name: "Executive Panorama",
    image: "/images/room-executive.jpg",
    size: "48 m²",
    occupancy: "2 guests",
    bed: "1 King bed",
    price: 540,
    description:
      "Perched on the top floor, this room pairs uninterrupted coastline views with a curated in-room library and writing desk.",
    amenities: ["Panoramic view", "Reading nook", "Espresso bar", "Turndown service", "Free Wi-Fi"],
  },
  {
    slug: "family-garden-room",
    name: "Family Garden Room",
    image: "/images/room-family.jpg",
    size: "55 m²",
    occupancy: "4 guests",
    bed: "1 King bed + 2 Twin beds",
    price: 490,
    description:
      "Opening onto the hotel's citrus garden, this two-room layout gives families room to spread out without leaving the grounds.",
    amenities: ["Garden access", "Connecting layout", "Kids' welcome kit", "Free Wi-Fi", "Air conditioning"],
  },
];

export type AddOn = {
  slug: string;
  name: string;
  image: string;
  category: "Tour" | "Transfer";
  duration: string;
  price: number;
  unit: string;
  description: string;
};

export const addOns: AddOn[] = [
  {
    slug: "old-town-walking-tour",
    name: "Old Town Walking Tour",
    image: "/images/tour-city.jpg",
    category: "Tour",
    duration: "3 hours",
    price: 65,
    unit: "per guest",
    description:
      "A guided stroll through the old quarter's cathedrals, ceramics workshops, and hidden piazzas with a local historian.",
  },
  {
    slug: "sunset-sailing-cruise",
    name: "Sunset Sailing Cruise",
    image: "/images/tour-sunset.jpg",
    category: "Tour",
    duration: "2.5 hours",
    price: 110,
    unit: "per guest",
    description:
      "A private sail along the coastline with prosecco and local antipasti as the sun drops behind the cliffs.",
  },
  {
    slug: "private-spa-day",
    name: "Private Spa Day",
    image: "/images/tour-spa.jpg",
    category: "Tour",
    duration: "Full day",
    price: 190,
    unit: "per guest",
    description:
      "Full access to the thermal suite plus a 60-minute treatment of your choice at the Aurelia Bay spa.",
  },
  {
    slug: "airport-private-transfer",
    name: "Private Airport Transfer",
    image: "/images/tour-transfer.jpg",
    category: "Transfer",
    duration: "Door to door",
    price: 95,
    unit: "per vehicle",
    description:
      "A private car with a dedicated driver between Naples International Airport and the hotel, tracked to your flight.",
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
