import { safeQuery } from "@/lib/db";
import { legalPagesSeed, type LegalPage } from "@/lib/data";
import { legalToHtml } from "@/lib/rich-text";

type LegalRow = {
  slug: "privacy" | "terms";
  title: string;
  updated_label: string;
  sections: string;
};

function rowToLegalPage(row: LegalRow): LegalPage {
  return {
    slug: row.slug,
    title: row.title,
    updated: row.updated_label,
    content: legalToHtml(row.sections),
  };
}

/** A single legal page ('privacy' or 'terms'). Falls back to static seed data if the DB is unreachable/unconfigured. */
export async function getLegalPage(slug: "privacy" | "terms"): Promise<LegalPage> {
  const rows = await safeQuery<LegalRow>(
    "SELECT slug, title, updated_label, sections FROM legal_pages WHERE slug = ?",
    [slug]
  );
  if (!rows || rows.length === 0) return legalPagesSeed[slug];
  return rowToLegalPage(rows[0]);
}

export type LegalPageInput = {
  title: string;
  updated: string;
  /** Rich text (HTML), already sanitised by the caller. */
  content: string;
};

/** Update a legal page. Returns false if the DB isn't configured. */
export async function updateLegalPage(
  slug: "privacy" | "terms",
  input: LegalPageInput
): Promise<boolean> {
  const result = await safeQuery(
    `INSERT INTO legal_pages (slug, title, updated_label, sections)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title), updated_label = VALUES(updated_label), sections = VALUES(sections)`,
    [slug, input.title, input.updated, input.content]
  );
  return result !== null;
}
