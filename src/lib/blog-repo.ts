import { safeQuery } from "@/lib/db";
import { blogPosts as seedBlogPosts, type BlogPost } from "@/lib/data";

type BlogRow = {
  slug: string;
  title: string;
  image: string;
  post_date: string;
  excerpt: string;
  content: string;
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

function rowToPost(row: BlogRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    image: row.image,
    date: row.post_date,
    excerpt: row.excerpt,
    content: toList(row.content),
  };
}

/** All journal posts, newest first. Falls back to static seed data if the DB is unreachable/unconfigured. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const rows = await safeQuery<BlogRow>(
    "SELECT slug, title, image, post_date, excerpt, content FROM blog_posts ORDER BY sort_order ASC, id DESC"
  );
  if (!rows) return seedBlogPosts;
  if (rows.length === 0) return seedBlogPosts;
  return rows.map(rowToPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug);
}

export type BlogPostInput = {
  slug: string;
  title: string;
  image: string;
  date: string;
  excerpt: string;
  content: string[];
};

/** Insert a post if its slug doesn't exist yet, otherwise update it. Returns false if the DB isn't configured. */
export async function upsertBlogPost(input: BlogPostInput): Promise<boolean> {
  const result = await safeQuery(
    `INSERT INTO blog_posts (slug, title, image, post_date, excerpt, content)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title), image = VALUES(image), post_date = VALUES(post_date),
       excerpt = VALUES(excerpt), content = VALUES(content)`,
    [input.slug, input.title, input.image, input.date, input.excerpt, fromList(input.content)]
  );
  return result !== null;
}

export async function deleteBlogPost(slug: string): Promise<boolean> {
  const result = await safeQuery("DELETE FROM blog_posts WHERE slug = ?", [slug]);
  return result !== null;
}
