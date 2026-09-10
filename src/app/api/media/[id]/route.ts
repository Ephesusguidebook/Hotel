import { getMediaBlob } from "@/lib/media-repo";

// Photos live in the database (see sql/schema_v4.sql for why), so they're
// served through this route rather than as static files. The bytes for a
// given id never change — re-uploading makes a new row — so the response
// can be cached hard and forever.

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return new Response("Not found", { status: 404 });
  }

  const blob = await getMediaBlob(numericId);
  if (!blob) {
    return new Response("Not found", { status: 404 });
  }

  const body = new Uint8Array(blob.data);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": blob.mimeType,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
