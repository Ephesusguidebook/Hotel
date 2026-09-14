import { redirect } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import { isAdminAuthed } from "@/lib/auth";
import {
  listMedia,
  getMediaStats,
  getImportedSourcePaths,
} from "@/lib/media-repo";
import { getPool } from "@/lib/db";
import AdminHeader from "@/components/AdminHeader";
import MediaLibrary from "@/components/admin/MediaLibrary";
import ImportStaticPhotos from "@/components/admin/ImportStaticPhotos";
import { formatBytes } from "@/lib/client-image";

export const dynamic = "force-dynamic";

/** The photos the site shipped with, as web paths. */
function listStaticImages(): string[] {
  try {
    const dir = path.join(process.cwd(), "public", "images");
    return fs
      .readdirSync(dir)
      .filter((name) => /\.(jpe?g|png|webp|avif)$/i.test(name))
      .sort()
      .map((name) => `/images/${name}`);
  } catch {
    // The folder may not exist in every deployment — not an error.
    return [];
  }
}

export default async function AdminMediaPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const dbReady = !!getPool();
  const items = dbReady ? await listMedia() : [];
  const stats = dbReady ? await getMediaStats() : { count: 0, totalBytes: 0 };
  const imported = dbReady ? await getImportedSourcePaths() : [];
  const pendingImports = dbReady
    ? listStaticImages().filter((p) => !imported.includes(p))
    : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminHeader title="Photos" />

      {!dbReady ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The database isn&apos;t configured yet, so photos can&apos;t be
          uploaded. Set <code className="font-mono">DATABASE_URL</code> in the
          hosting panel first.
        </p>
      ) : (
        <>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-navy-700">
            Every photo on the site lives here. Upload once, then pick it
            wherever you need it — on a room, a tour, a journal post, or inside
            a page&apos;s text.
            {stats.count > 0 && (
              <span className="mt-2 block text-sm text-navy-600">
                {stats.count} photo{stats.count === 1 ? "" : "s"} ·{" "}
                {formatBytes(stats.totalBytes)} stored
              </span>
            )}
          </p>

          <ImportStaticPhotos pending={pendingImports} />

          <MediaLibrary mode="manage" initialItems={items} />
        </>
      )}
    </div>
  );
}
