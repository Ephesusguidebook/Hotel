import { isAdminAuthed } from "@/lib/auth";
import {
  deleteMedia,
  findMediaUsage,
  getMediaItem,
  updateMediaMeta,
} from "@/lib/media-repo";

// Rename / re-label / delete a single photo. Used by the media library UI,
// which updates in place rather than reloading the page.

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const id = Number.parseInt(raw, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id: raw } = await params;
  const id = parseId(raw);
  if (id === null) return Response.json({ error: "Not found." }, { status: 404 });

  let body: { altText?: string; filename?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const ok = await updateMediaMeta(id, {
    altText: typeof body.altText === "string" ? body.altText : undefined,
    filename:
      typeof body.filename === "string" && body.filename.trim()
        ? body.filename.trim()
        : undefined,
  });
  if (!ok) {
    return Response.json({ error: "Could not save." }, { status: 500 });
  }

  const item = await getMediaItem(id);
  return Response.json({ item });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthed())) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id: raw } = await params;
  const id = parseId(raw);
  if (id === null) return Response.json({ error: "Not found." }, { status: 404 });

  const item = await getMediaItem(id);
  if (!item) return Response.json({ error: "Not found." }, { status: 404 });

  // Deleting a photo that a room or post still points at would leave a
  // broken image on the public site, so say where it's used and make the
  // caller confirm rather than silently breaking a page.
  const usage = await findMediaUsage(item.url);
  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "1";

  if (usage.length > 0 && !force) {
    return Response.json({ error: "in_use", usage }, { status: 409 });
  }

  const ok = await deleteMedia(id);
  if (!ok) {
    return Response.json({ error: "Could not delete." }, { status: 500 });
  }
  return Response.json({ deleted: id });
}
