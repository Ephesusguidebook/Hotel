import { isAdminAuthed } from "@/lib/auth";
import {
  createMedia,
  listMedia,
  mediaUrl,
  MAX_UPLOAD_BYTES,
} from "@/lib/media-repo";
import { getPool } from "@/lib/db";

// Upload endpoint for the media library. This is a route handler rather than
// a server action on purpose: server actions cap request bodies at 1 MB by
// default, which photos would routinely exceed.
//
// The browser has already resized the photo and converted it to WebP before
// it gets here (see MediaUploader), so this endpoint only validates and
// stores bytes — no server-side image processing.

export const dynamic = "force-dynamic";

/** SVG is deliberately absent: it can carry scripts, and we serve these
 *  files inline from our own origin. */
const ALLOWED_TYPES = new Set([
  "image/webp",
  "image/jpeg",
  "image/png",
  "image/avif",
]);

/** The photo list, for the picker dialog that admin forms open. */
export async function GET() {
  if (!(await isAdminAuthed())) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  const items = await listMedia();
  return Response.json({ items });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthed())) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!getPool()) {
    return Response.json(
      { error: "The database isn't configured, so photos can't be saved yet." },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Could not read the upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file was sent." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: `Unsupported file type: ${file.type || "unknown"}.` },
      { status: 415 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(0);
    return Response.json(
      { error: `That photo is larger than ${mb} MB even after compression.` },
      { status: 413 }
    );
  }

  const width = Number.parseInt(String(form.get("width") ?? "0"), 10) || 0;
  const height = Number.parseInt(String(form.get("height") ?? "0"), 10) || 0;
  const altText = String(form.get("altText") ?? "").trim();
  const filename = String(form.get("filename") ?? file.name ?? "photo.webp").trim();
  // Only the one-off import of the original /public/images set sends this.
  const sourcePath = String(form.get("sourcePath") ?? "").trim() || null;

  const data = Buffer.from(await file.arrayBuffer());
  if (data.length === 0) {
    return Response.json({ error: "That file was empty." }, { status: 400 });
  }

  const id = await createMedia({
    filename,
    altText,
    mimeType: file.type,
    width,
    height,
    data,
    sourcePath,
  });

  if (!id) {
    return Response.json(
      { error: "Could not save the photo. Please try again." },
      { status: 500 }
    );
  }

  return Response.json({
    id,
    url: mediaUrl(id),
    filename,
    altText,
    width,
    height,
    sizeBytes: data.length,
  });
}
