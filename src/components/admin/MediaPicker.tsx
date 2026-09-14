"use client";

import { useEffect } from "react";
import type { MediaItem } from "@/lib/media-repo";
import MediaLibrary from "@/components/admin/MediaLibrary";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (item: MediaItem) => void;
  selectedUrls?: string[];
  title?: string;
  /** Multi-select keeps the dialog open so several photos can be added in a row. */
  multiple?: boolean;
};

export default function MediaPicker({
  open,
  onClose,
  onPick,
  selectedUrls = [],
  title = "Choose a photo",
  multiple = false,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // Stop the page behind the dialog from scrolling with it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy-950/60 p-4 sm:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-5xl rounded-lg bg-ivory-50 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-navy-900/10 px-6 py-4">
          <h2 className="text-lg text-navy-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm text-navy-700 hover:bg-navy-900/5 hover:text-navy-900"
          >
            {multiple ? "Done" : "Close"}
          </button>
        </div>

        <div className="px-6 py-6">
          <MediaLibrary
            mode="pick"
            selectedUrls={selectedUrls}
            onPick={(item) => {
              onPick(item);
              if (!multiple) onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
