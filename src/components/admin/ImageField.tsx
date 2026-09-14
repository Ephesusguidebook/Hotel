"use client";

import { useState } from "react";
import type { MediaItem } from "@/lib/media-repo";
import MediaPicker from "@/components/admin/MediaPicker";

type Props = {
  /** Form field name. The value posted is one URL per line. */
  name: string;
  label: string;
  defaultValue?: string[];
  multiple?: boolean;
  hint?: string;
};

export default function ImageField({
  name,
  label,
  defaultValue = [],
  multiple = true,
  hint,
}: Props) {
  const [urls, setUrls] = useState<string[]>(defaultValue.filter(Boolean));
  const [pickerOpen, setPickerOpen] = useState(false);

  function add(item: MediaItem) {
    setUrls((prev) => {
      if (!multiple) return [item.url];
      if (prev.includes(item.url)) return prev.filter((u) => u !== item.url);
      return [...prev, item.url];
    });
  }

  function removeAt(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    setUrls((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="block">
      <span className="text-sm font-medium text-navy-800">{label}</span>
      {hint && (
        <span className="mt-1 block text-sm text-navy-600">{hint}</span>
      )}

      <input type="hidden" name={name} value={urls.join("\n")} />

      {urls.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {urls.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="overflow-hidden rounded-md border border-navy-900/10 bg-white"
            >
              <div className="relative aspect-[4/3] bg-ivory-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {multiple && i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-gold-500 px-2.5 py-0.5 text-xs font-medium text-navy-950">
                    Cover
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                {multiple ? (
                  <span className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move earlier"
                      className="rounded px-1.5 py-1 text-navy-600 hover:bg-navy-900/5 hover:text-navy-900 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === urls.length - 1}
                      aria-label="Move later"
                      className="rounded px-1.5 py-1 text-navy-600 hover:bg-navy-900/5 hover:text-navy-900 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      →
                    </button>
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="rounded px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="mt-3 rounded-md border border-navy-900/20 bg-white px-4 py-2.5 text-sm text-navy-800 hover:border-gold-500 hover:text-navy-950"
      >
        {urls.length === 0
          ? "Choose photo…"
          : multiple
            ? "Add another photo…"
            : "Replace photo…"}
      </button>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={add}
        selectedUrls={urls}
        multiple={multiple}
        title={multiple ? "Choose photos" : "Choose a photo"}
      />
    </div>
  );
}
