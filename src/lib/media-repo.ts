import { safeQuery, getPool } from "@/lib/db";
import { mediaUrl } from "@/lib/media-url";

export { mediaUrl, isMediaUrl } from "@/lib/media-url";

export type MediaItem = {
  id: number;
  filename: string;
  altText: string;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  createdAt: string;
  /** The URL this photo is served from — what gets stored on rooms, posts, etc. */
  url: string;
};

type MediaRow = {
  id: number;
  filename: string;
  alt_text: string;
  mime_type: string;
  width: number;
  height: number;
  size_bytes: number;
  created_at: string;
};

/** Largest upload we accept, after the browser has converted it to WebP.
 *  Well under MySQL's 16 MB max_allowed_packet, with room for the rest of
 *  the INSERT statement. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function rowToItem(row: MediaRow): MediaItem {
  return {
    id: row.id,
    filename: row.filename,
    altText: row.alt_text,
    mimeType: row.mime_type,
    width: row.width,
    height: row.height,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
    url: mediaUrl(row.id),
  };
}

/** Metadata for every photo, newest first. Deliberately never selects the
 *  `data` column — that would pull every image's bytes into memory. */
export async function listMedia(): Promise<MediaItem[]> {
  const rows = await safeQuery<MediaRow>(
    `SELECT id, filename, alt_text, mime_type, width, height, size_bytes, created_at
     FROM media ORDER BY created_at DESC, id DESC`
  );
  if (!rows) return [];
  return rows.map(rowToItem);
}

export async function getMediaItem(id: number): Promise<MediaItem | null> {
  const rows = await safeQuery<MediaRow>(
    `SELECT id, filename, alt_text, mime_type, width, height, size_bytes, created_at
     FROM media WHERE id = ?`,
    [id]
  );
  if (!rows || rows.length === 0) return null;
  return rowToItem(rows[0]);
}

/** The actual bytes, for the /api/media/<id> route. Returns null when the
 *  photo doesn't exist or the database isn't configured. */
export async function getMediaBlob(
  id: number
): Promise<{ data: Buffer; mimeType: string } | null> {
  const rows = await safeQuery<{ data: Buffer; mime_type: string }>(
    "SELECT data, mime_type FROM media WHERE id = ?",
    [id]
  );
  if (!rows || rows.length === 0) return null;
  return { data: rows[0].data, mimeType: rows[0].mime_type };
}

export type CreateMediaInput = {
  filename: string;
  altText: string;
  mimeType: string;
  width: number;
  height: number;
  data: Buffer;
  /** Set only by the one-off import of the original /public/images set. */
  sourcePath?: string | null;
};

/** Store a photo. Returns the new row's id, or null if the DB isn't
 *  configured or the insert failed. */
export async function createMedia(
  input: CreateMediaInput
): Promise<number | null> {
  const pool = getPool();
  if (!pool) return null;
  try {
    const [result] = await pool.query(
      `INSERT INTO media (filename, alt_text, mime_type, width, height, size_bytes, data, source_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.filename.slice(0, 191),
        input.altText.slice(0, 255),
        input.mimeType.slice(0, 64),
        input.width,
        input.height,
        input.data.length,
        input.data,
        input.sourcePath ? input.sourcePath.slice(0, 191) : null,
      ]
    );
    return (result as { insertId: number }).insertId ?? null;
  } catch (err) {
    console.error("[media] insert failed:", err);
    return null;
  }
}

export async function updateMediaMeta(
  id: number,
  fields: { filename?: string; altText?: string }
): Promise<boolean> {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (fields.filename !== undefined) {
    sets.push("filename = ?");
    params.push(fields.filename.slice(0, 191));
  }
  if (fields.altText !== undefined) {
    sets.push("alt_text = ?");
    params.push(fields.altText.slice(0, 255));
  }
  if (sets.length === 0) return true;
  params.push(id);
  const result = await safeQuery(
    `UPDATE media SET ${sets.join(", ")} WHERE id = ?`,
    params
  );
  return result !== null;
}

export async function deleteMedia(id: number): Promise<boolean> {
  const result = await safeQuery("DELETE FROM media WHERE id = ?", [id]);
  return result !== null;
}

/** Where a photo is currently used, so the admin panel can warn before a
 *  delete leaves a broken image behind. Each query is a LIKE against the
 *  columns that store image URLs. */
export async function findMediaUsage(url: string): Promise<string[]> {
  const needle = `%${url}%`;
  const checks: { label: string; sql: string }[] = [
    { label: "Rooms", sql: "SELECT name AS label FROM rooms WHERE images LIKE ?" },
    {
      label: "Tours & transfers",
      sql: "SELECT name AS label FROM add_ons WHERE images LIKE ? OR long_description LIKE ?",
    },
    {
      label: "Blog posts",
      sql: "SELECT title AS label FROM blog_posts WHERE image LIKE ? OR content LIKE ?",
    },
    {
      label: "About page",
      sql: "SELECT 'About page' AS label FROM about_content WHERE team_image LIKE ? OR story_paragraphs LIKE ?",
    },
    {
      label: "Legal pages",
      sql: "SELECT title AS label FROM legal_pages WHERE sections LIKE ?",
    },
  ];

  const used: string[] = [];
  for (const check of checks) {
    const paramCount = (check.sql.match(/\?/g) ?? []).length;
    const rows = await safeQuery<{ label: string }>(
      check.sql,
      Array(paramCount).fill(needle)
    );
    if (rows && rows.length > 0) {
      for (const row of rows) {
        used.push(`${check.label}: ${row.label}`);
      }
    }
  }
  return used;
}

/** Rough total the library is taking up in the database, for the admin page. */
export async function getMediaStats(): Promise<{ count: number; totalBytes: number }> {
  const rows = await safeQuery<{ count: number; total: number | null }>(
    "SELECT COUNT(*) AS count, SUM(size_bytes) AS total FROM media"
  );
  if (!rows || rows.length === 0) return { count: 0, totalBytes: 0 };
  return { count: Number(rows[0].count) || 0, totalBytes: Number(rows[0].total) || 0 };
}

/** Which of the original /public/images files have already been brought
 *  into the library, so the importer can skip them. */
export async function getImportedSourcePaths(): Promise<string[]> {
  const rows = await safeQuery<{ source_path: string }>(
    "SELECT source_path FROM media WHERE source_path IS NOT NULL"
  );
  if (!rows) return [];
  return rows.map((r) => r.source_path);
}

/**
 * Point every stored reference to an old static file at its new library
 * URL. Runs once, at the end of the import, so rooms and posts keep showing
 * the same photos — now served from the library like everything else.
 *
 * REPLACE() is safe against partial matches here because the old paths carry
 * their full filename and extension ("/images/room-deluxe.jpg" is not a
 * substring of "/images/room-deluxe-2.jpg").
 */
export async function remapStaticImagePaths(
  mapping: { from: string; to: string }[]
): Promise<number> {
  const statements: { sql: string; slots: number }[] = [
    { sql: "UPDATE rooms SET images = REPLACE(images, ?, ?)", slots: 1 },
    {
      sql: "UPDATE add_ons SET images = REPLACE(images, ?, ?), long_description = REPLACE(long_description, ?, ?)",
      slots: 2,
    },
    {
      sql: "UPDATE blog_posts SET image = REPLACE(image, ?, ?), content = REPLACE(content, ?, ?)",
      slots: 2,
    },
    {
      sql: "UPDATE about_content SET team_image = REPLACE(team_image, ?, ?), story_paragraphs = REPLACE(story_paragraphs, ?, ?)",
      slots: 2,
    },
    { sql: "UPDATE legal_pages SET sections = REPLACE(sections, ?, ?)", slots: 1 },
  ];

  let applied = 0;
  for (const { from, to } of mapping) {
    for (const statement of statements) {
      const params: string[] = [];
      for (let i = 0; i < statement.slots; i++) params.push(from, to);
      const result = await safeQuery(statement.sql, params);
      if (result !== null) applied++;
    }
  }
  return applied;
}
