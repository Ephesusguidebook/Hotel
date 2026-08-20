import { safeQuery } from "@/lib/db";
import { aboutContentSeed, type AboutContent, type ValueBlock } from "@/lib/data";

type AboutRow = {
  hero_title: string;
  hero_description: string;
  story_heading: string;
  story_paragraphs: string;
  team_image: string;
  value_blocks: string;
};

function toList(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fromList(items: string[]): string {
  return items.map((s) => s.trim()).filter(Boolean).join("\n");
}

/** "Title :: Text" per line <-> ValueBlock[] */
export function textToValues(text: string): ValueBlock[] {
  return toList(text).map((line) => {
    const [title, ...rest] = line.split("::");
    return { title: title.trim(), text: rest.join("::").trim() };
  });
}

export function valuesToText(values: ValueBlock[]): string {
  return values
    .filter((v) => v.title.trim() || v.text.trim())
    .map((v) => `${v.title.trim()} :: ${v.text.trim()}`)
    .join("\n");
}

function rowToAbout(row: AboutRow): AboutContent {
  return {
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
    storyHeading: row.story_heading,
    storyParagraphs: toList(row.story_paragraphs),
    teamImage: row.team_image,
    values: textToValues(row.value_blocks),
  };
}

/** About Us page content. Falls back to static seed data if the DB is unreachable/unconfigured. */
export async function getAboutContent(): Promise<AboutContent> {
  const rows = await safeQuery<AboutRow>(
    "SELECT hero_title, hero_description, story_heading, story_paragraphs, team_image, value_blocks FROM about_content WHERE id = 1"
  );
  if (!rows || rows.length === 0) return aboutContentSeed;
  return rowToAbout(rows[0]);
}

/** Update the singleton About Us content row. Returns false if the DB isn't configured. */
export async function updateAboutContent(input: AboutContent): Promise<boolean> {
  const result = await safeQuery(
    `INSERT INTO about_content (id, hero_title, hero_description, story_heading, story_paragraphs, team_image, value_blocks)
     VALUES (1, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       hero_title = VALUES(hero_title), hero_description = VALUES(hero_description),
       story_heading = VALUES(story_heading), story_paragraphs = VALUES(story_paragraphs),
       team_image = VALUES(team_image), value_blocks = VALUES(value_blocks)`,
    [
      input.heroTitle,
      input.heroDescription,
      input.storyHeading,
      fromList(input.storyParagraphs),
      input.teamImage,
      valuesToText(input.values),
    ]
  );
  return result !== null;
}
