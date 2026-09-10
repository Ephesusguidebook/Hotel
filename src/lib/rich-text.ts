import sanitizeHtmlLib from "sanitize-html";

/**
 * Rich text for page content (journal posts, tour descriptions, the About
 * story, legal pages).
 *
 * Two things happen here:
 *
 *  1. Sanitising. The editor is admin-only, but HTML that reaches the page
 *     through dangerouslySetInnerHTML gets an allowlist pass regardless —
 *     an admin account is not a reason to trust arbitrary markup.
 *
 *  2. Reading old content. These fields used to hold plain text with one
 *     paragraph per line. Rather than migrate the database, `toHtml` detects
 *     the old shape and wraps it in paragraphs on read, so existing content
 *     keeps rendering and quietly becomes HTML the first time someone saves
 *     it in the editor.
 */

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "figure",
  "figcaption",
  "hr",
  "code",
  "pre",
];

const SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // No protocol-relative //evil.com URLs.
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const external = /^https?:\/\//i.test(href);
      return {
        tagName,
        attribs: {
          ...attribs,
          ...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {}),
        },
      };
    },
  },
};

/** Clean HTML coming out of the editor, before it goes into the database. */
export function sanitizeRichText(html: string): string {
  const cleaned = sanitizeHtmlLib(html ?? "", SANITIZE_OPTIONS).trim();
  // An "empty" editor still submits a blank paragraph or two.
  if (/^(<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>)*$/i.test(cleaned)) return "";
  return cleaned;
}

/** Does this stored value already hold HTML, or is it legacy plain text? */
function looksLikeHtml(text: string): boolean {
  return /<(p|h2|h3|h4|ul|ol|li|blockquote|img|figure|hr|strong|em|a)\b/i.test(
    text
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Stored value -> HTML ready to render. Already-HTML content is sanitised;
 * legacy plain text becomes one paragraph per non-empty line.
 */
export function toHtml(stored: string | null | undefined): string {
  const text = (stored ?? "").trim();
  if (!text) return "";
  if (looksLikeHtml(text)) return sanitizeHtmlLib(text, SANITIZE_OPTIONS);
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

/**
 * Legal pages used a different legacy shape: blocks separated by a blank
 * line, where each block's first line is its heading. Convert that to
 * headings plus paragraphs.
 */
export function legalToHtml(stored: string | null | undefined): string {
  const text = (stored ?? "").trim();
  if (!text) return "";
  if (looksLikeHtml(text)) return sanitizeHtmlLib(text, SANITIZE_OPTIONS);

  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) return "";
      const [heading, ...body] = lines;
      return [
        `<h2>${escapeHtml(heading)}</h2>`,
        ...body.map((line) => `<p>${escapeHtml(line)}</p>`),
      ].join("");
    })
    .filter(Boolean)
    .join("");
}

/** Strip tags for meta descriptions, card excerpts and search. */
export function htmlToPlainText(html: string): string {
  return sanitizeHtmlLib(html ?? "", { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

/** First N characters of the text, ending on a word boundary. */
export function excerptFromHtml(html: string, maxLength = 180): string {
  const text = htmlToPlainText(html);
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 40 ? lastSpace : maxLength).trimEnd()}…`;
}
