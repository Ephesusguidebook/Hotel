"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { isMediaUrl } from "@/lib/media-url";
import { useSwipe } from "@/lib/use-swipe";

type Props = {
  images: string[];
  alt: string;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

export default function Lightbox({
  images,
  alt,
  index,
  onIndexChange,
  onClose,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const hasMultiple = images.length > 1;

  const go = useCallback(
    (delta: number) => {
      if (!hasMultiple) return;
      onIndexChange((index + delta + images.length) % images.length);
    },
    [index, images.length, hasMultiple, onIndexChange]
  );

  const { dragX, dragging, handlers } = useSwipe({
    onNext: () => go(1),
    onPrev: () => go(-1),
    enabled: hasMultiple,
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    document.addEventListener("keydown", onKey);

    // Return focus to whatever opened the lightbox when it closes.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [go, onClose]);

  // The backdrop is fully opaque on purpose: a photo viewer that lets the
  // page show through makes the photo itself harder to read.
  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — photo ${index + 1} of ${images.length}`}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col bg-navy-950 outline-none"
    >
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
        <p className="text-sm text-ivory-50/80">
          {index + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo viewer"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ivory-50 transition-colors hover:bg-ivory-50/10"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Stage */}
      <div
        className="relative min-h-0 flex-1 touch-pan-y select-none overflow-hidden"
        {...handlers}
      >
        <div
          className="flex h-full"
          style={{
            transform: `translateX(calc(-${index * 100}% + ${dragX}px))`,
            transition: dragging ? "none" : "transform 320ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="relative h-full w-full shrink-0">
              <Image
                src={src}
                alt={i === index ? alt : ""}
                fill
                unoptimized={isMediaUrl(src)}
                priority={i === index}
                className="object-contain"
                sizes="100vw"
                draggable={false}
              />
            </div>
          ))}
        </div>

        {hasMultiple && (
          <>
            <ArrowButton
              side="left"
              label="Previous photo"
              onClick={() => go(-1)}
            />
            <ArrowButton side="right" label="Next photo" onClick={() => go(1)} />
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasMultiple && (
        <div className="shrink-0 overflow-x-auto px-4 py-4 sm:px-6">
          <ul className="mx-auto flex w-max gap-2">
            {images.map((src, i) => (
              <li key={`thumb-${src}-${i}`}>
                <button
                  type="button"
                  onClick={() => onIndexChange(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index}
                  className={`relative block h-14 w-20 overflow-hidden rounded transition-opacity ${
                    i === index
                      ? "opacity-100 ring-2 ring-gold-400"
                      : "opacity-50 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    unoptimized={isMediaUrl(src)}
                    className="object-cover"
                    sizes="80px"
                    draggable={false}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ArrowButton({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ivory-50/10 text-ivory-50 backdrop-blur transition-colors hover:bg-ivory-50/20 sm:flex ${
        side === "left" ? "left-4" : "right-4"
      }`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d={side === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
