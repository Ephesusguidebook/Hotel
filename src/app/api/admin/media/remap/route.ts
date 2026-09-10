import { isAdminAuthed } from "@/lib/auth";
import { remapStaticImagePaths } from "@/lib/media-repo";

// Final step of the one-off import: repoint rooms, tours, posts and page
// content from the old /images/... files to their new library URLs.

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminAuthed())) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: { mapping?: { from: string; to: string }[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const mapping = (body.mapping ?? []).filter(
    (entry) =>
      typeof entry?.from === "string" &&
      typeof entry?.to === "string" &&
      entry.from.startsWith("/images/") &&
      entry.to.startsWith("/api/media/")
  );

  if (mapping.length === 0) {
    return Response.json({ updated: 0 });
  }

  const updated = await remapStaticImagePaths(mapping);
  return Response.json({ updated });
}
