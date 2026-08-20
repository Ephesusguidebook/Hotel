"use client";

import { useMemo, useState } from "react";
import TourCard from "@/components/TourCard";
import { addOns } from "@/lib/data";

export default function AddOnsGrid() {
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState<"All" | "Tour" | "Transfer">("All");

  function toggle(slug: string) {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  const filtered = useMemo(
    () =>
      filter === "All" ? addOns : addOns.filter((a) => a.category === filter),
    [filter]
  );

  const selectedItems = addOns.filter((a) => selected.includes(a.slug));
  const total = selectedItems.reduce((sum, a) => sum + a.price, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="flex gap-3">
          {(["All", "Tour", "Transfer"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs tracking-widest-plus px-4 py-2.5 border transition-colors ${
                filter === f
                  ? "bg-charcoal-900 border-charcoal-900 text-ivory-50"
                  : "border-charcoal-900/30 text-charcoal-700 hover:border-charcoal-900"
              }`}
            >
              {f.toUpperCase()}
              {f !== "All" ? "S" : ""}
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="text-sm text-charcoal-700">
            <span className="font-serif text-lg text-charcoal-900">
              {selected.length}
            </span>{" "}
            added &middot;{" "}
            <span className="font-serif text-lg text-charcoal-900">
              ${total}
            </span>{" "}
            estimated
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item) => (
          <TourCard
            key={item.slug}
            item={item}
            added={selected.includes(item.slug)}
            onToggle={toggle}
          />
        ))}
      </div>

      {selected.length > 0 && (
        <div className="mt-16 bg-charcoal-950 text-ivory-50 p-8 lg:p-10">
          <p className="text-xs tracking-widest-plus text-gold-400 mb-6">
            YOUR TRIP ADD-ONS
          </p>
          <div className="space-y-3">
            {selectedItems.map((item) => (
              <div
                key={item.slug}
                className="flex items-center justify-between text-sm border-b border-ivory-200/10 pb-3"
              >
                <span>
                  {item.name}{" "}
                  <span className="text-ivory-200/50">({item.unit})</span>
                </span>
                <div className="flex items-center gap-4">
                  <span>${item.price}</span>
                  <button
                    onClick={() => toggle(item.slug)}
                    className="text-ivory-200/50 hover:text-gold-400 text-xs"
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between font-serif text-xl">
            <span>Estimated Total</span>
            <span>${total}</span>
          </div>
          <p className="mt-4 text-[11px] text-ivory-200/40 leading-relaxed">
            Add-ons can be attached to your room reservation at checkout — a
            member of our concierge team will confirm exact timing.
          </p>
        </div>
      )}
    </div>
  );
}
