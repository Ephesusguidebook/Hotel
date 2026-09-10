/**
 * Pure helpers for media URLs.
 *
 * Kept apart from media-repo.ts on purpose: that module imports the MySQL
 * pool, and client components need these two functions. Importing them from
 * the repo would drag the database driver into the browser bundle.
 */

export function mediaUrl(id: number): string {
  return `/api/media/${id}`;
}

/** Photos served from the library are already WebP at a sensible size, so
 *  they skip Next.js image optimisation — running them through it again
 *  would cost CPU and save nothing. */
export function isMediaUrl(src: string): boolean {
  return src.startsWith("/api/media/");
}
