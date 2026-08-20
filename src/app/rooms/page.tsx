import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import ReservationPanel from "@/components/ReservationPanel";
import ImageGallery from "@/components/ImageGallery";
import { rooms } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rooms & Suites — Aurelia Bay",
  description: "Explore our rooms and suites and check availability for your stay.",
};

type SearchParams = Promise<{
  checkin?: string;
  checkout?: string;
  guests?: string;
  room?: string;
}>;

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  return (
    <>
      <PageHero
        image="/images/hero-rooms.jpg"
        eyebrow="Stay"
        title="Rooms & Suites"
        description="Four room types, each facing the water and finished with the same quiet attention to detail."
      />

      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-24">
            {rooms.map((room, i) => (
              <div
                key={room.slug}
                id={room.slug}
                className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center scroll-mt-28"
              >
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <ImageGallery
                    images={room.images}
                    alt={room.name}
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <div>
                  <p className="text-xs tracking-widest-plus text-gold-600 mb-3">
                    FROM ${room.price} / NIGHT
                  </p>
                  <h2 className="font-serif text-2xl md:text-3xl text-charcoal-900">
                    {room.name}
                  </h2>
                  <p className="mt-2 text-xs tracking-wide text-charcoal-700/70">
                    {room.size} &middot; {room.occupancy} &middot; {room.bed}
                  </p>
                  <p className="mt-5 text-sm text-charcoal-700 leading-relaxed">
                    {room.description}
                  </p>
                  <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
                    {room.amenities.map((a) => (
                      <li
                        key={a}
                        className="text-sm text-charcoal-700 flex items-center gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-gold-500" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <ReservationPanel
                defaultCheckIn={params.checkin ?? ""}
                defaultCheckOut={params.checkout ?? ""}
                defaultGuests={params.guests ?? "2"}
                defaultRoom={params.room ?? rooms[0].slug}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-charcoal-900 py-20 px-6 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Good to Know"
            title="Stay Policies"
            light
            align="center"
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-xs tracking-widest-plus text-gold-400 mb-2">
                CHECK-IN
              </p>
              <p className="text-ivory-200/80 text-sm">From 3:00 PM</p>
            </div>
            <div>
              <p className="text-xs tracking-widest-plus text-gold-400 mb-2">
                CHECK-OUT
              </p>
              <p className="text-ivory-200/80 text-sm">Until 11:00 AM</p>
            </div>
            <div>
              <p className="text-xs tracking-widest-plus text-gold-400 mb-2">
                CANCELLATION
              </p>
              <p className="text-ivory-200/80 text-sm">
                Free up to 5 days before arrival
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
