import { safeQuery } from "@/lib/db";
import { legalPagesSeed, type LegalPage, type LegalSection } from "@/lib/data";

type LegalRow = {
  slug: "privacy" | "terms";
  title: string;
  updated_label: string;
  sections: string;
};

/** Sections are stored as blocks separated by a blank line: first line of
 *  each block is the heading, the rest are body paragraphs. Keeps the field
 *  editable in a plain textarea, no JSON needed. */
export function textToSections(text: string): LegalSection[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const [heading, ...body] = lines;
      return { heading: heading ?? "", body };
    })
    .filter((s) => s.heading);
}

export function sectionsToText(sections: LegalSection[]): string {
  return sections
    .filter((s) => s.heading.trim())
    .map((s) => [s.heading.trim(), ...s.body.map((p) => p.trim()).filter(Boolean)].join("\n"))
    .join("\n\n");
}

function rowToLegalPage(row: LegalRow): LegalPage {
  return {
    slug: row.slug,
    title: row.title,
    updated: row.updated_label,
    sections: textToSections(row.sections),
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
  sections: LegalSection[];
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
    [slug, input.title, input.updated, sectionsToText(input.sections)]
  );
  return result !== null;
}
