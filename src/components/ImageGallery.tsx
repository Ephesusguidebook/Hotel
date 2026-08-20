"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
  aspect?: string; // Tailwind aspect-ratio class, e.g. "aspect-[4/3]"
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export default function ImageGallery({
  images,
  alt,
  aspect = "aspect-[4/3]",
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  priority = false,
  className = "",
}: Props) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  function go(delta: number) {
    setIndex((prev) => (prev + delta + images.length) % images.length);
  }

  return (
    <div className={`relative ${aspect} overflow-hidden group ${className}`}>
      <Image
        key={images[index]}
        src={images[index]}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes={sizes}
      />

      {hasMultiple && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-charcoal-950/60 text-ivory-50 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-charcoal-950/60 text-ivory-50 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="absolute bottom-3 right-3 bg-charcoal-950/70 text-ivory-50 text-[11px] tracking-wide px-2.5 py-1 rounded-full">
            {index + 1} / {images.length}
          </div>

          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === index ? "bg-gold-400" : "bg-ivory-50/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
