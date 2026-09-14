import ImageGallery from "@/components/ImageGallery";
import { addRoomToCartAction } from "@/app/account/actions";
import type { RoomOffer } from "@/lib/availability-repo";

type Props = {
  offer: RoomOffer;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  signedIn: boolean;
};

export default function RoomOfferCard({
  offer,
  checkIn,
  checkOut,
  guests,
  nights,
  signedIn,
}: Props) {
  const { room, unitsFree, offers } = offer;
  const sellable = offers.filter((o) => o.total !== null);
  const soldOut = unitsFree <= 0;

  return (
    <article
      id={room.slug}
      className="scroll-mt-28 border border-navy-900/10 bg-white"
    >
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="md:col-span-2">
          <ImageGallery
            images={room.images}
            alt={room.name}
            aspect="aspect-[4/3] md:aspect-auto md:h-full"
            sizes="(min-width: 768px) 40vw, 100vw"
          />
        </div>

        <div className="p-6 md:col-span-3 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl text-navy-900">
                {room.name}
              </h2>
              <p className="mt-1.5 text-sm text-navy-500">
                {room.size} &middot; {room.occupancy} &middot; {room.bed}
              </p>
            </div>
            {soldOut ? (
              <span className="border border-navy-900/20 px-3 py-1.5 text-sm text-navy-500">
                Not available
              </span>
            ) : (
              <span className="border border-gold-600/40 bg-gold-500/10 px-3 py-1.5 text-sm text-gold-600">
                {unitsFree} {unitsFree === 1 ? "room" : "rooms"} left
              </span>
            )}
          </div>

          <p className="mt-4 text-base leading-relaxed text-navy-700">
            {room.description}
          </p>

          <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">
            {room.amenities.slice(0, 6).map((amenity) => (
              <li
                key={amenity}
                className="flex items-center gap-2 text-sm text-navy-700"
              >
                <span
                  aria-hidden
                  className="h-1 w-1 shrink-0 rounded-full bg-gold-500"
                />
                {amenity}
              </li>
            ))}
          </ul>

          <div className="mt-7 border-t border-navy-900/10 pt-6">
            {soldOut ? (
              <p className="text-base text-navy-700">
                This room is fully booked for those dates. Try shifting them by
                a night, or ask reception what else we can do.
              </p>
            ) : sellable.length === 0 ? (
              <p className="text-base text-navy-700">
                We haven&apos;t published a rate for this room on those dates
                yet. Please contact reception for a quote.
              </p>
            ) : (
              <ul className="space-y-4">
                {sellable.map((planOffer) => (
                  <li
                    key={planOffer.plan.id}
                    className="flex flex-col gap-4 border border-navy-900/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-base font-medium text-navy-900">
                        {planOffer.plan.name}
                      </p>
                      {planOffer.plan.description && (
                        <p className="mt-1 text-sm leading-relaxed text-navy-500">
                          {planOffer.plan.description}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-end gap-5">
                      <div className="text-right">
                        <p className="font-serif text-2xl text-navy-900">
                          ${planOffer.total}
                        </p>
                        <p className="text-sm text-navy-500">
                          ${planOffer.perNight} × {nights}{" "}
                          {nights === 1 ? "night" : "nights"}
                        </p>
                      </div>

                      {signedIn ? (
                        <form action={addRoomToCartAction.bind(null, room.slug)}>
                          <input
                            type="hidden"
                            name="ratePlanId"
                            value={planOffer.plan.id}
                          />
                          <input type="hidden" name="checkIn" value={checkIn} />
                          <input type="hidden" name="checkOut" value={checkOut} />
                          <input type="hidden" name="guests" value={guests} />
                          <input type="hidden" name="quantity" value="1" />
                          <button
                            type="submit"
                            className="bg-gold-500 px-5 py-3 text-sm tracking-widest-plus text-navy-950 transition-colors hover:bg-gold-400"
                          >
                            ADD TO CART
                          </button>
                        </form>
                      ) : (
                        <a
                          href={`/account/login?next=${encodeURIComponent(
                            `/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}#${room.slug}`
                          )}`}
                          className="bg-navy-900 px-5 py-3 text-sm tracking-widest-plus text-ivory-50 transition-colors hover:bg-navy-800"
                        >
                          SIGN IN TO BOOK
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
