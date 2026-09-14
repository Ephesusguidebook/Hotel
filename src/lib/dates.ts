/**
 * Date helpers for the booking calendar.
 *
 * Everything here speaks "YYYY-MM-DD" strings, never Date objects, and does
 * its arithmetic in UTC. That is deliberate: a stay is a run of calendar
 * days, not a span of hours, and doing the maths in local time makes a night
 * appear or vanish whenever a range crosses a daylight-saving boundary. The
 * MySQL pool is configured with `dateStrings: true`, so DATE columns arrive
 * in exactly this shape too.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDate(value: string | null | undefined): value is string {
  if (!value || !ISO_DATE.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(time)) return false;
  // Rejects impossible dates that still parse, e.g. 2026-02-31.
  return toISODate(new Date(time)) === value;
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function today(): string {
  return toISODate(new Date());
}

export function addDays(date: string, days: number): string {
  const time = Date.parse(`${date}T00:00:00Z`);
  return toISODate(new Date(time + days * 86400000));
}

/** Whole days from `from` to `to`. Negative if `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86400000);
}

/**
 * The nights a stay occupies: check-in included, check-out excluded. A guest
 * arriving on the 3rd and leaving on the 5th sleeps on the 3rd and the 4th,
 * and the room is free again on the 5th.
 */
export function nightsOf(checkIn: string, checkOut: string): string[] {
  const count = daysBetween(checkIn, checkOut);
  if (count <= 0) return [];
  const nights: string[] = [];
  for (let i = 0; i < count; i++) nights.push(addDays(checkIn, i));
  return nights;
}

/** Every date from `from` to `to` inclusive — used to paint a calendar month. */
export function datesInRange(from: string, to: string): string[] {
  const count = daysBetween(from, to);
  if (count < 0) return [];
  const dates: string[] = [];
  for (let i = 0; i <= count; i++) dates.push(addDays(from, i));
  return dates;
}

export function startOfMonth(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

export function endOfMonth(date: string): string {
  const [year, month] = date.split("-").map(Number);
  // Day 0 of the next month is the last day of this one.
  return toISODate(new Date(Date.UTC(year, month, 0)));
}

export function addMonths(date: string, months: number): string {
  const [year, month] = date.split("-").map(Number);
  return toISODate(new Date(Date.UTC(year, month - 1 + months, 1)));
}

/** Monday-first weekday index, so calendar grids line up with how weeks are
 *  written here. */
export function weekdayIndex(date: string): number {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return (day + 6) % 7;
}

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatMonth(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
