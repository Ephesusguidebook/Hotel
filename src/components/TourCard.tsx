"use client";

import Image from "next/image";
import type { AddOn } from "@/lib/data";

type Props = {
  item: AddOn;
  added: boolean;
  onToggle: (slug: string) => void;
};

export default function TourCard({ item, added, onToggle }: Props) {
  return (
    <div className="bg-white border border-charcoal-900/10 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        <span className="absolute top-4 left-4 bg-charcoal-950/85 text-gold-400 text-[11px] tracking-widest-plus px-3 py-1.5">
          {item.category.toUpperCase()}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-serif text-lg text-charcoal-900">{item.name}</h3>
        <p className="mt-1 text-xs tracking-wide text-charcoal-700/70">
          {item.duration}
        </p>
        <p className="mt-3 text-sm text-charcoal-700 leading-relaxed flex-1">
          {item.description}
        </p>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <span className="font-serif text-lg text-charcoal-900">
              ${item.price}
            </span>
            <span className="text-xs text-charcoal-700/60"> {item.unit}</span>
          </div>
          <button
            onClick={() => onToggle(item.slug)}
            className={`text-xs tracking-widest-plus px-4 py-2.5 border transition-colors ${
              added
                ? "bg-gold-500 border-gold-500 text-charcoal-950"
                : "border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-ivory-50"
            }`}
          >
            {added ? "ADDED ✓" : "ADD TO TRIP"}
          </button>
        </div>
      </div>
    </div>
  );
}
