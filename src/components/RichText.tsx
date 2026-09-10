/**
 * Renders admin-authored rich text.
 *
 * The HTML is sanitised on the way into the database (sanitizeRichText) and
 * again on the way out (toHtml / legalToHtml in the repos), so what reaches
 * here has already been through the allowlist twice.
 */
export default function RichText({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  if (!html) return null;
  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
