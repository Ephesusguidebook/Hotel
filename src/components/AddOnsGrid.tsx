"use client";

import { useMemo, useState } from "react";
import TourCard from "@/components/TourCard";
import type { AddOn } from "@/lib/data";

export default function AddOnsGrid({ addOns }: { addOns: AddOn[] }) {
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
    [filter, addOns]
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
              className={`text-sm tracking-widest-plus px-4 py-2.5 border transition-colors ${
                filter === f
                  ? "bg-navy-900 border-navy-900 text-ivory-50"
                  : "border-navy-900/30 text-navy-700 hover:border-navy-900"
              }`}
            >
              {f.toUpperCase()}
              {f !== "All" ? "S" : ""}
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="text-sm text-navy-700">
            <span className="font-serif text-lg text-navy-900">
              {selected.length}
            </span>{" "}
            added &middot;{" "}
            <span className="font-serif text-lg text-navy-900">
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
        <div className="mt-16 bg-navy-950 text-ivory-50 p-8 lg:p-10">
          <p className="text-sm tracking-widest-plus text-gold-400 mb-6">
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
                  <span className="text-ivory-200/75">({item.unit})</span>
                </span>
                <div className="flex items-center gap-4">
                  <span>${item.price}</span>
                  <button
                    onClick={() => toggle(item.slug)}
                    className="text-ivory-200/75 hover:text-gold-400 text-sm"
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
          <p className="mt-4 text-xs text-ivory-200/75 leading-relaxed">
            Add-ons can be attached to your room reservation at checkout — a
            member of our concierge team will confirm exact timing.
          </p>
        </div>
      )}
    </div>
  );
}
