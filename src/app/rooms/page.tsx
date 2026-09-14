import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import ImageGallery from "@/components/ImageGallery";
import AvailabilitySearch from "@/components/AvailabilitySearch";
import RoomOfferCard from "@/components/RoomOfferCard";
import { getRooms } from "@/lib/rooms-repo";
import { getRatesForRooms, lowestNightlyPrice } from "@/lib/rates-repo";
import { searchAvailability } from "@/lib/availability-repo";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { isValidDate, today, formatDate } from "@/lib/dates";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rooms & Suites — Aurelia Bay",
  description:
    "Check availability, compare rates, and book a room for your dates.",
};

type SearchParams = Promise<{
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  cartError?: string;
}>;

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const customer = await getCurrentCustomer();

  // A search only counts when both dates are real and in the right order and
  // the stay hasn't already been and gone.
  const checkIn = params.checkIn ?? "";
  const checkOut = params.checkOut ?? "";
  const guests = Number(params.guests ?? 2) || 2;
  const hasSearch =
    isValidDate(checkIn) &&
    isValidDate(checkOut) &&
    checkOut > checkIn &&
    checkOut >= today();

  return (
    <>
      <PageHero
        image="/images/hero-rooms.jpg"
        eyebrow="Stay"
        title="Rooms & Suites"
        description="Four room types, each facing the water and finished with the same quiet attention to detail."
      />

      <section className="bg-ivory-50 px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <AvailabilitySearch
            checkIn={checkIn}
            checkOut={checkOut}
            guests={String(guests)}
          />

          {params.cartError && (
            <p className="mt-6 rounded border border-red-300 bg-red-50 px-4 py-3 text-base text-red-700">
              {params.cartError}
            </p>
          )}

          <div className="mt-12">
            {hasSearch ? (
              <SearchResults
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                signedIn={!!customer}
              />
            ) : (
              <RoomBrowse invalid={!!(checkIn || checkOut)} />
            )}
          </div>
        </div>
      </section>

      <section className="bg-charcoal-900 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Good to Know"
            title="Stay Policies"
            light
            align="center"
          />
          <div className="mt-12 grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
            <Policy label="Check-in" value="From 3:00 PM" />
            <Policy label="Check-out" value="Until 11:00 AM" />
            <Policy
              label="Cancellation"
              value="Free up to 5 days before arrival"
            />
          </div>
        </div>
      </section>
    </>
  );
}

async function SearchResults({
  checkIn,
  checkOut,
  guests,
  signedIn,
}: {
  checkIn: string;
  checkOut: string;
  guests: number;
  signedIn: boolean;
}) {
  const result = await searchAvailability(checkIn, checkOut, guests);
  const nights = result.nights.length;
  const availableCount = result.rooms.filter(
    (r) => r.unitsFree > 0 && r.offers.some((o) => o.total !== null)
  ).length;

  // Rooms that can actually be booked come first; the rest stay on the page
  // so a guest can see what exists and try other dates.
  const ordered = [...result.rooms].sort((a, b) => {
    const aOk = a.unitsFree > 0 && a.cheapestTotal !== null ? 0 : 1;
    const bOk = b.unitsFree > 0 && b.cheapestTotal !== null ? 0 : 1;
    if (aOk !== bOk) return aOk - bOk;
    return (a.cheapestTotal ?? Infinity) - (b.cheapestTotal ?? Infinity);
  });

  return (
    <>
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-serif text-2xl text-charcoal-900">
          {formatDate(checkIn)} &ndash; {formatDate(checkOut)}
        </h2>
        <p className="text-base text-charcoal-700">
          {nights} {nights === 1 ? "night" : "nights"} &middot; {guests}{" "}
          {guests === 1 ? "guest" : "guests"} &middot;{" "}
          {availableCount === 0
            ? "no rooms available"
            : `${availableCount} ${
                availableCount === 1 ? "room type" : "room types"
              } available`}
        </p>
      </div>

      {availableCount === 0 && (
        <p className="mb-8 border border-charcoal-900/15 bg-white px-5 py-4 text-base leading-relaxed text-charcoal-700">
          Nothing is free across those exact dates. Shifting your arrival or
          departure by a night often opens something up — or call reception and
          we&apos;ll see what we can arrange.
        </p>
      )}

      <div className="space-y-8">
        {ordered.map((offer) => (
          <RoomOfferCard
            key={offer.room.slug}
            offer={offer}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            nights={nights}
            signedIn={signedIn}
          />
        ))}
      </div>
    </>
  );
}

/** Shown before anyone has picked dates: the rooms, with a "from" price. */
async function RoomBrowse({ invalid }: { invalid: boolean }) {
  const rooms = await getRooms();
  const ratesByRoom = await getRatesForRooms(rooms.map((r) => r.slug));

  return (
    <>
      <p className="mb-10 max-w-2xl text-base leading-relaxed text-charcoal-700">
        {invalid
          ? "Those dates didn't look right — please pick a check-in and a check-out above."
          : "Choose your dates above to see what's free and what it costs. Rates change through the season, so the figures below are the lowest we publish."}
      </p>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {rooms.map((room) => {
          const from = lowestNightlyPrice(ratesByRoom.get(room.slug) ?? []);
          return (
            <div key={room.slug} id={room.slug} className="scroll-mt-28">
              <ImageGallery
                images={room.images}
                alt={room.name}
                sizes="(min-width: 768px) 50vw, 100vw"
              />
              <p className="mt-5 text-sm tracking-widest-plus text-gold-600">
                {from !== null ? `FROM $${from} / NIGHT` : "RATES ON REQUEST"}
              </p>
              <h2 className="mt-2 font-serif text-2xl text-charcoal-900">
                {room.name}
              </h2>
              <p className="mt-1.5 text-sm text-charcoal-500">
                {room.size} &middot; {room.occupancy} &middot; {room.bed}
              </p>
              <p className="mt-4 text-base leading-relaxed text-charcoal-700">
                {room.description}
              </p>
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">
                {room.amenities.slice(0, 6).map((amenity) => (
                  <li
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-charcoal-700"
                  >
                    <span
                      aria-hidden
                      className="h-1 w-1 shrink-0 rounded-full bg-gold-500"
                    />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Policy({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow mb-2 text-gold-400">{label}</p>
      <p className="text-base text-ivory-200/85">{value}</p>
    </div>
  );
}
