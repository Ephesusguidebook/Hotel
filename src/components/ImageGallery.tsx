"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "@/components/Lightbox";
import { isMediaUrl } from "@/lib/media-url";
import { useSwipe } from "@/lib/use-swipe";

type Props = {
  images: string[];
  alt: string;
  /** Tailwind aspect-ratio class, e.g. "aspect-[4/3]". */
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Tapping a photo opens the full-screen viewer. */
  enableLightbox?: boolean;
};

export default function ImageGallery({
  images,
  alt,
  aspect = "aspect-[4/3]",
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  priority = false,
  className = "",
  enableLightbox = true,
}: Props) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasMultiple = images.length > 1;

  function go(delta: number) {
    setIndex((prev) => (prev + delta + images.length) % images.length);
  }

  const { dragX, dragging, handlers } = useSwipe({
    onNext: () => go(1),
    onPrev: () => go(-1),
    enabled: hasMultiple,
  });

  if (images.length === 0) return null;

  return (
    <>
      <div
        className={`group relative ${aspect} touch-pan-y select-none overflow-hidden ${className}`}
        {...handlers}
      >
        {/* Track — all slides side by side so a drag moves the photos with
            the finger rather than snapping at the end of the gesture. */}
        <div
          className="flex h-full w-full"
          style={{
            transform: `translateX(calc(-${index * 100}% + ${dragX}px))`,
            transition: dragging
              ? "none"
              : "transform 350ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className="relative h-full w-full shrink-0">
              <Image
                src={src}
                alt={i === 0 ? alt : ""}
                fill
                priority={priority && i === 0}
                loading={priority && i === 0 ? undefined : "lazy"}
                unoptimized={isMediaUrl(src)}
                className="object-cover"
                sizes={sizes}
                draggable={false}
              />
            </div>
          ))}
        </div>

        {/* Tap target for the full-screen viewer. Sits under the controls. */}
        {enableLightbox && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`View ${alt} photos full screen`}
            className="absolute inset-0 z-0 cursor-zoom-in"
          />
        )}

        {hasMultiple && (
          <>
            {/* Arrows. The old gallery revealed these on hover only, which
                meant they never appeared on a phone. Now they're always
                visible on touch and fade in on pointer devices. */}
            <NavButton
              side="left"
              label="Previous photo"
              onClick={() => go(-1)}
            />
            <NavButton side="right" label="Next photo" onClick={() => go(1)} />

            <div className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-navy-950/70 px-2.5 py-1 text-xs text-ivory-50">
              {index + 1} / {images.length}
            </div>

            {/* Dots: the visible dot stays small, but each button carries
                enough padding to be a comfortable tap target. */}
            <div className="absolute bottom-1 left-1 z-10 flex">
              {images.map((img, i) => (
                <button
                  key={`dot-${img}-${i}`}
                  type="button"
                  aria-label={`Go to photo ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => setIndex(i)}
                  className="flex h-8 w-6 items-center justify-center"
                >
                  <span
                    className={`block h-2 w-2 rounded-full transition-colors ${
                      i === index ? "bg-gold-400" : "bg-ivory-50/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={images}
          alt={alt}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

function NavButton({
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
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy-950/55 text-ivory-50 backdrop-blur-sm transition-all hover:bg-navy-950/80 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 ${
        side === "left" ? "left-2" : "right-2"
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d={side === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
