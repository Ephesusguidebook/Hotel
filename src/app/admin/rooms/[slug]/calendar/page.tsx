import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/auth";
import { getRoomBySlug } from "@/lib/rooms-repo";
import { getRatePlans, getRoomRates, rateForNight } from "@/lib/rates-repo";
import { getRoomCalendar } from "@/lib/availability-repo";
import {
  addRoomRateAction,
  deleteRoomRateAction,
  setAvailabilityAction,
} from "@/app/admin/actions";
import {
  today,
  startOfMonth,
  endOfMonth,
  addMonths,
  weekdayIndex,
  formatMonth,
  formatDate,
  isValidDate,
} from "@/lib/dates";
import AdminHeader from "@/components/AdminHeader";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default async function RoomCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    month?: string;
    plan?: string;
    saved?: string;
    error?: string;
  }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const { slug } = await params;
  const query = await searchParams;
  const room = await getRoomBySlug(slug);
  if (!room) notFound();

  const plans = await getRatePlans();
  const activePlan =
    plans.find((p) => String(p.id) === query.plan) ?? plans[0] ?? null;

  const monthAnchor =
    query.month && isValidDate(`${query.month}-01`)
      ? `${query.month}-01`
      : startOfMonth(today());
  const monthStart = startOfMonth(monthAnchor);
  const monthEnd = endOfMonth(monthAnchor);
  const monthKey = monthStart.slice(0, 7);

  const [days, rates] = await Promise.all([
    getRoomCalendar(room, monthStart, monthEnd),
    getRoomRates(room.slug),
  ]);

  const leadingBlanks = weekdayIndex(monthStart);
  const planRates = activePlan
    ? rates.filter((r) => r.ratePlanId === activePlan.id)
    : [];

  function monthHref(offset: number) {
    const target = addMonths(monthStart, offset).slice(0, 7);
    const search = new URLSearchParams({ month: target });
    if (activePlan) search.set("plan", String(activePlan.id));
    return `/admin/rooms/${room!.slug}/calendar?${search.toString()}`;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AdminHeader title={`Calendar — ${room.name}`} />

      {query.saved && (
        <p className="mb-6 rounded border border-green-300 bg-green-50 px-4 py-2.5 text-sm text-green-800">
          Saved.
        </p>
      )}
      {query.error && (
        <p className="mb-6 rounded border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {query.error}
        </p>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/admin/rooms/${room.slug}`}
          prefetch={false}
          className="text-sm text-gold-600 underline underline-offset-4"
        >
          &larr; Back to room details
        </Link>
        <p className="text-sm text-charcoal-500">
          Standing stock: {room.unitsLeft}{" "}
          {room.unitsLeft === 1 ? "room" : "rooms"} · change it on the room
          details page
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="border border-amber-300 bg-amber-50 px-4 py-3 text-base text-amber-900">
          There are no rate plans yet, so nothing can be priced or sold.{" "}
          <Link href="/admin/rate-plans" className="underline">
            Create one first
          </Link>
          .
        </p>
      ) : (
        <>
          {/* Plan selector */}
          <nav className="mb-6 flex flex-wrap gap-2" aria-label="Rate plan">
            {plans.map((plan) => {
              const search = new URLSearchParams({
                month: monthKey,
                plan: String(plan.id),
              });
              const isActive = activePlan?.id === plan.id;
              return (
                <Link
                  key={plan.id}
                  href={`/admin/rooms/${room.slug}/calendar?${search.toString()}`}
                  prefetch={false}
                  aria-current={isActive ? "page" : undefined}
                  className={`border px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? "border-charcoal-900 bg-charcoal-900 text-ivory-50"
                      : "border-charcoal-900/25 text-charcoal-700 hover:border-charcoal-900"
                  }`}
                >
                  {plan.name}
                </Link>
              );
            })}
          </nav>

          {/* Month navigation */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              href={monthHref(-1)}
              prefetch={false}
              className="border border-charcoal-900/25 px-3 py-2 text-sm hover:border-charcoal-900"
            >
              &larr; Previous
            </Link>
            <h2 className="font-serif text-xl text-charcoal-900">
              {formatMonth(monthStart)}
            </h2>
            <Link
              href={monthHref(1)}
              prefetch={false}
              className="border border-charcoal-900/25 px-3 py-2 text-sm hover:border-charcoal-900"
            >
              Next &rarr;
            </Link>
          </div>

          {/* Calendar grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-7 gap-px border border-charcoal-900/10 bg-charcoal-900/10">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="bg-ivory-100 px-2 py-2 text-center text-sm font-medium text-charcoal-700"
                  >
                    {day}
                  </div>
                ))}

                {Array.from({ length: leadingBlanks }).map((_, i) => (
                  <div key={`blank-${i}`} className="bg-ivory-50/60" />
                ))}

                {days.map((day) => {
                  const rate = activePlan
                    ? rateForNight(rates, activePlan.id, day.date)
                    : null;
                  const isPast = day.date < today();
                  return (
                    <div
                      key={day.date}
                      className={`min-h-[92px] bg-white px-2 py-2 ${
                        isPast ? "opacity-55" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-medium text-charcoal-800">
                          {Number(day.date.slice(8, 10))}
                        </span>
                        {day.closed ? (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-800">
                            Closed
                          </span>
                        ) : (
                          <span
                            className={`rounded px-1.5 py-0.5 text-xs ${
                              day.free === 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {day.free} left
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-charcoal-900">
                        {rate ? (
                          `$${rate.price}`
                        ) : (
                          <span className="text-charcoal-500">No rate</span>
                        )}
                      </p>

                      {day.booked > 0 && (
                        <p className="mt-0.5 text-xs text-charcoal-500">
                          {day.booked} booked
                        </p>
                      )}
                      {day.overridden && !day.closed && (
                        <p className="mt-0.5 text-xs text-gold-600">
                          set to {day.units}
                        </p>
                      )}
                      {day.note && (
                        <p className="mt-0.5 truncate text-xs text-charcoal-500">
                          {day.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm text-charcoal-500">
            &ldquo;Left&rdquo; is the standing stock for that day (or the number
            you set by hand) minus rooms already booked. It moves on its own as
            reservations come in. A day with no rate can&apos;t be sold on this
            plan.
          </p>

          {/* Two editors side by side */}
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Prices */}
            <section className="border border-charcoal-900/10 bg-white p-5">
              <h3 className="font-serif text-lg text-charcoal-900">
                Set a price for a date range
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal-500">
                A shorter range beats a longer one, so you can lay a holiday
                price straight over a season price without deleting anything.
              </p>

              <form
                action={addRoomRateAction.bind(null, room.slug)}
                className="mt-4 space-y-4"
              >
                <input type="hidden" name="month" value={monthKey} />
                <label className="block">
                  <span className="text-sm font-medium text-charcoal-800">
                    Rate plan
                  </span>
                  <select
                    name="ratePlanId"
                    defaultValue={activePlan?.id}
                    className="input mt-1.5"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-charcoal-800">
                      From
                    </span>
                    <input
                      type="date"
                      name="startDate"
                      required
                      defaultValue={monthStart}
                      className="input mt-1.5"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-charcoal-800">
                      To
                    </span>
                    <input
                      type="date"
                      name="endDate"
                      required
                      defaultValue={monthEnd}
                      className="input mt-1.5"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-charcoal-800">
                      Price per night ($)
                    </span>
                    <input
                      type="number"
                      name="price"
                      min={1}
                      required
                      className="input mt-1.5"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-charcoal-800">
                      Label
                    </span>
                    <input
                      name="label"
                      placeholder="High season"
                      className="input mt-1.5"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-gold-500 px-5 py-2.5 text-sm tracking-widest-plus text-charcoal-950 hover:bg-gold-400"
                >
                  SAVE PRICE
                </button>
              </form>

              {planRates.length > 0 && (
                <div className="mt-6 border-t border-charcoal-900/10 pt-4">
                  <h4 className="mb-3 text-sm font-medium text-charcoal-800">
                    {activePlan?.name} prices
                  </h4>
                  <ul className="space-y-2">
                    {planRates.map((rate) => (
                      <li
                        key={rate.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="min-w-0 text-charcoal-700">
                          <strong className="text-charcoal-900">
                            ${rate.price}
                          </strong>{" "}
                          · {formatDate(rate.startDate)} &ndash;{" "}
                          {formatDate(rate.endDate)}
                          {rate.label ? ` · ${rate.label}` : ""}
                        </span>
                        <form
                          action={deleteRoomRateAction.bind(
                            null,
                            room.slug,
                            rate.id,
                            monthKey
                          )}
                        >
                          <ConfirmSubmitButton
                            confirmMessage={`Remove the $${rate.price} price for ${formatDate(rate.startDate)} – ${formatDate(rate.endDate)}?`}
                            className="shrink-0 text-sm text-red-700 hover:text-red-800"
                          >
                            Remove
                          </ConfirmSubmitButton>
                        </form>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Availability */}
            <section className="border border-charcoal-900/10 bg-white p-5">
              <h3 className="font-serif text-lg text-charcoal-900">
                Close dates or change stock
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-charcoal-500">
                Bookings already come off the calendar by themselves. Use this
                for the rest: maintenance, an owner&apos;s block, or holding
                rooms back for an agency.
              </p>

              <form
                action={setAvailabilityAction.bind(null, room.slug)}
                className="mt-4 space-y-4"
              >
                <input type="hidden" name="month" value={monthKey} />

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-charcoal-800">
                      From
                    </span>
                    <input
                      type="date"
                      name="startDate"
                      required
                      defaultValue={monthStart}
                      className="input mt-1.5"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-charcoal-800">
                      To
                    </span>
                    <input
                      type="date"
                      name="endDate"
                      required
                      defaultValue={monthEnd}
                      className="input mt-1.5"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-charcoal-800">
                    What to do
                  </span>
                  <select name="mode" defaultValue="close" className="input mt-1.5">
                    <option value="close">Close these dates</option>
                    <option value="units">Open, with this many rooms</option>
                    <option value="reset">
                      Reset to the room&apos;s standing stock
                    </option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-charcoal-800">
                      Rooms open
                    </span>
                    <input
                      type="number"
                      name="units"
                      min={0}
                      defaultValue={room.unitsLeft}
                      className="input mt-1.5"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-charcoal-800">
                      Note
                    </span>
                    <input
                      name="note"
                      placeholder="Refurbishment"
                      className="input mt-1.5"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="bg-charcoal-900 px-5 py-2.5 text-sm tracking-widest-plus text-ivory-50 hover:bg-charcoal-800"
                >
                  APPLY
                </button>
              </form>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
