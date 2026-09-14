"use client";

import { useState } from "react";
import { processImage, toWebpFilename } from "@/lib/client-image";

type Props = {
  /** Files under /public/images that aren't in the library yet. */
  pending: string[];
};

/**
 * One-off import of the photos the site shipped with.
 *
 * It runs in the browser and goes through exactly the same convert-and-upload
 * path as a normal upload, so the originals end up as WebP in the library
 * like everything else. When it finishes it repoints the rooms, tours, posts
 * and page content that referenced the old files, so nothing changes visually
 * — the photos are simply managed from one place now.
 */
export default function ImportStaticPhotos({ pending }: Props) {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  async function run() {
    setRunning(true);
    setDone(0);
    setFailed([]);

    const mapping: { from: string; to: string }[] = [];
    const failures: string[] = [];

    for (const path of pending) {
      try {
        const res = await fetch(path);
        if (!res.ok) throw new Error("could not read the file");
        const blob = await res.blob();
        const original = path.split("/").pop() ?? "photo.jpg";
        const file = new File([blob], original, {
          type: blob.type || "image/jpeg",
        });

        const processed = await processImage(file);
        const filename = toWebpFilename(original, processed.extension);

        const form = new FormData();
        form.append("file", processed.blob, filename);
        form.append("filename", filename);
        form.append("width", String(processed.width));
        form.append("height", String(processed.height));
        form.append("altText", "");
        form.append("sourcePath", path);

        const upload = await fetch("/api/admin/media", {
          method: "POST",
          body: form,
        });
        const data = await upload.json().catch(() => ({}));
        if (!upload.ok) throw new Error(data.error || "upload failed");

        mapping.push({ from: path, to: data.url });
        setDone((n) => n + 1);
      } catch {
        failures.push(path);
        setFailed([...failures]);
      }
    }

    if (mapping.length > 0) {
      await fetch("/api/admin/media/remap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapping }),
      }).catch(() => undefined);
    }

    setRunning(false);
    setFinished(true);
    // Reload so the library grid and the "pending" list are both accurate.
    if (failures.length === 0) window.location.reload();
  }

  if (pending.length === 0) return null;

  return (
    <div className="mb-8 rounded-lg border border-gold-500/40 bg-gold-500/5 px-5 py-4">
      <h2 className="text-base font-medium text-navy-900">
        Bring the site&apos;s original photos into the library
      </h2>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-navy-700">
        {pending.length} photo{pending.length === 1 ? "" : "s"} that came with
        the site {pending.length === 1 ? "is" : "are"} still stored as files.
        Importing converts {pending.length === 1 ? "it" : "them"} to WebP and
        moves {pending.length === 1 ? "it" : "them"} here, then updates every
        room, tour and post that uses {pending.length === 1 ? "it" : "them"}.
        Nothing on the site changes visually.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => void run()}
          disabled={running}
          className="rounded-md bg-navy-900 px-5 py-2.5 text-sm text-ivory-50 hover:bg-navy-800 disabled:opacity-60"
        >
          {running
            ? `Importing… ${done} of ${pending.length}`
            : `Import ${pending.length} photo${pending.length === 1 ? "" : "s"}`}
        </button>

        {finished && failed.length > 0 && (
          <p className="text-sm text-red-800">
            {failed.length} photo{failed.length === 1 ? "" : "s"} could
            not be imported. You can upload {failed.length === 1 ? "it" : "them"}{" "}
            by hand above.
          </p>
        )}
      </div>
    </div>
  );
}
