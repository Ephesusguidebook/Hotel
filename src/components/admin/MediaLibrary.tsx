"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaItem } from "@/lib/media-repo";
import { processImage, toWebpFilename, formatBytes } from "@/lib/client-image";

type UploadJob = {
  key: string;
  name: string;
  status: "converting" | "uploading" | "done" | "error";
  message?: string;
};

type Props = {
  /** "manage" is the full library page; "pick" is the chooser dialog. */
  mode: "manage" | "pick";
  initialItems?: MediaItem[];
  /** Highlighted as already chosen, in pick mode. */
  selectedUrls?: string[];
  onPick?: (item: MediaItem) => void;
};

export default function MediaLibrary({
  mode,
  initialItems = [],
  selectedUrls = [],
  onPick,
}: Props) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(mode === "pick" && initialItems.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // The picker mounts fresh each time it opens, so this is "load when the
  // dialog opens" rather than a page-load fetch. The manage page is rendered
  // on the server and passes its list in, so it skips this entirely.
  useEffect(() => {
    if (mode !== "pick" || initialItems.length > 0) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/media", { cache: "no-store" });
        if (!res.ok) throw new Error("request failed");
        const data = (await res.json()) as { items: MediaItem[] };
        if (cancelled) return;
        setItems(data.items);
        setError(null);
      } catch {
        if (cancelled) return;
        setError("Could not load the photo library.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, initialItems.length]);

  const uploadFiles = useCallback(async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;

    const newJobs: UploadJob[] = images.map((file, i) => ({
      key: `${Date.now()}-${i}-${file.name}`,
      name: file.name,
      status: "converting",
    }));
    setJobs((prev) => [...prev, ...newJobs]);

    function update(key: string, patch: Partial<UploadJob>) {
      setJobs((prev) =>
        prev.map((j) => (j.key === key ? { ...j, ...patch } : j))
      );
    }

    // Sequential rather than parallel: converting a large photo pins a core,
    // and a batch of 20 at once would lock up the tab.
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const job = newJobs[i];
      try {
        if (file.type === "image/svg+xml") {
          throw new Error("SVG files aren't supported.");
        }
        const processed = await processImage(file);
        const filename = toWebpFilename(file.name, processed.extension);

        update(job.key, { status: "uploading" });

        const form = new FormData();
        form.append("file", processed.blob, filename);
        form.append("filename", filename);
        form.append("width", String(processed.width));
        form.append("height", String(processed.height));
        form.append("altText", "");

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: form,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Upload failed.");
        }

        update(job.key, { status: "done" });
        setItems((prev) => [data as MediaItem, ...prev]);
      } catch (err) {
        update(job.key, {
          status: "error",
          message: err instanceof Error ? err.message : "Upload failed.",
        });
      }
    }

    // Clear the finished rows after a moment so the list doesn't grow forever.
    setTimeout(() => {
      setJobs((prev) => prev.filter((j) => j.status === "error"));
    }, 2500);
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    void uploadFiles(Array.from(e.dataTransfer.files));
  }

  async function saveAlt(id: number, altText: string) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, altText } : it))
    );
    await fetch(`/api/admin/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altText }),
    });
  }

  async function remove(item: MediaItem, force = false) {
    const res = await fetch(
      `/api/admin/media/${item.id}${force ? "?force=1" : ""}`,
      { method: "DELETE" }
    );
    if (res.status === 409) {
      const data = (await res.json()) as { usage: string[] };
      const list = data.usage.slice(0, 8).join("\n");
      const more =
        data.usage.length > 8 ? `\n…and ${data.usage.length - 8} more` : "";
      const ok = window.confirm(
        `This photo is still used by:\n\n${list}${more}\n\nDeleting it will leave a broken image there. Delete anyway?`
      );
      if (ok) await remove(item, true);
      return;
    }
    if (!res.ok) {
      setError("Could not delete that photo.");
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== item.id));
    setActiveId(null);
  }

  const filtered = query.trim()
    ? items.filter((it) =>
        `${it.filename} ${it.altText}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())
      )
    : items;

  const active = items.find((it) => it.id === activeId) ?? null;

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging
            ? "border-gold-500 bg-gold-500/5"
            : "border-navy-900/15 bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void uploadFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <p className="text-base text-navy-800">
          Drag photos here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-gold-600 underline underline-offset-4 hover:text-gold-500"
          >
            browse your computer
          </button>
        </p>
        <p className="mt-2 text-sm text-navy-600">
          Every photo is resized and converted to WebP in your browser before
          it&apos;s saved, so uploads stay small and fast.
        </p>
      </div>

      {/* Upload progress */}
      {jobs.length > 0 && (
        <ul className="space-y-2">
          {jobs.map((job) => (
            <li
              key={job.key}
              className={`flex items-center justify-between gap-4 rounded-md border px-4 py-2.5 text-sm ${
                job.status === "error"
                  ? "border-red-300 bg-red-50 text-red-800"
                  : "border-navy-900/10 bg-white text-navy-700"
              }`}
            >
              <span className="truncate">{job.name}</span>
              <span className="shrink-0 text-sm">
                {job.status === "converting" && "Converting…"}
                {job.status === "uploading" && "Saving…"}
                {job.status === "done" && "Saved"}
                {job.status === "error" && job.message}
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      {/* Search */}
      {items.length > 8 && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search photos by name…"
          className="input"
        />
      )}

      {/* Grid */}
      {loading ? (
        <p className="py-8 text-center text-sm text-navy-600">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-navy-600">
          {items.length === 0
            ? "No photos yet — upload your first one above."
            : "No photos match that search."}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => {
            const chosen = selectedUrls.includes(item.url);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() =>
                    mode === "pick"
                      ? onPick?.(item)
                      : setActiveId(activeId === item.id ? null : item.id)
                  }
                  className={`group relative block w-full overflow-hidden rounded-md border bg-white text-left transition-shadow hover:shadow-md ${
                    chosen || activeId === item.id
                      ? "border-gold-500 ring-2 ring-gold-500/40"
                      : "border-navy-900/10"
                  }`}
                >
                  <span className="block aspect-[4/3] overflow-hidden bg-ivory-100">
                    {/* Plain <img>: these are already WebP at a sensible size,
                        and the admin grid doesn't need the image optimiser. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.altText || item.filename}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="block truncate px-2.5 py-2 text-xs text-navy-700">
                    {item.filename}
                  </span>
                  {chosen && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-navy-950">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Detail panel (manage mode only) */}
      {mode === "manage" && active && (
        <div className="rounded-lg border border-navy-900/10 bg-white p-5">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="w-full shrink-0 sm:w-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.url}
                alt={active.altText || active.filename}
                className="w-full rounded-md border border-navy-900/10"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <h3 className="text-lg text-navy-900">{active.filename}</h3>
                <p className="mt-1 text-sm text-navy-600">
                  {active.width} × {active.height} ·{" "}
                  {formatBytes(active.sizeBytes)} · {active.mimeType}
                </p>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-navy-800">
                  Description for screen readers
                </span>
                <input
                  defaultValue={active.altText}
                  onBlur={(e) => void saveAlt(active.id, e.target.value)}
                  placeholder="e.g. Sea-view balcony at sunset"
                  className="input mt-1.5"
                />
                <span className="mt-1.5 block text-sm text-navy-600">
                  Saved automatically when you click away.
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(active.url);
                  }}
                  className="text-sm text-gold-600 underline underline-offset-4 hover:text-gold-500"
                >
                  Copy link
                </button>
                <button
                  type="button"
                  onClick={() => void remove(active)}
                  className="text-sm text-red-700 underline underline-offset-4 hover:text-red-800"
                >
                  Delete photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
