"use client";

import Link from "next/link";
import type { AddOn } from "@/lib/data";
import ImageGallery from "@/components/ImageGallery";
import { addAddOnToCartAction } from "@/app/account/actions";

type Props = {
  item: AddOn;
  added: boolean;
  onToggle: (slug: string) => void;
};

export default function TourCard({ item, added, onToggle }: Props) {
  return (
    <div className="bg-white border border-navy-900/10 flex flex-col">
      <div className="relative">
        <ImageGallery
          images={item.images}
          alt={item.name}
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        <span className="absolute top-4 left-4 bg-navy-950/85 text-gold-400 text-xs tracking-widest-plus px-3 py-1.5 pointer-events-none">
          {item.category.toUpperCase()}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <Link href={`/add-ons/${item.slug}`}>
          <h3 className="font-serif text-lg text-navy-900 hover:text-gold-600 transition-colors">
            {item.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm tracking-wide text-navy-500">
          {item.duration}
        </p>
        <p className="mt-3 text-base text-navy-700 leading-relaxed flex-1">
          {item.description}
        </p>
        <Link
          href={`/add-ons/${item.slug}`}
          className="mt-4 inline-flex w-fit items-center gap-2 text-sm tracking-widest-plus text-gold-600 hover:text-gold-500"
        >
          VIEW DETAILS <span aria-hidden>&rarr;</span>
        </Link>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <span className="font-serif text-lg text-navy-900">
              ${item.price}
            </span>
            <span className="text-sm text-navy-500"> {item.unit}</span>
          </div>
          <button
            onClick={() => onToggle(item.slug)}
            className={`text-sm tracking-widest-plus px-4 py-2.5 border transition-colors ${
              added
                ? "bg-gold-500 border-gold-500 text-navy-950"
                : "border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-ivory-50"
            }`}
          >
            {added ? "ADDED ✓" : "ADD TO TRIP"}
          </button>
        </div>
        <form action={addAddOnToCartAction.bind(null, item.slug)} className="mt-3">
          <input type="hidden" name="quantity" value="1" />
          <button
            type="submit"
            className="w-full text-sm tracking-widest-plus px-4 py-2.5 border border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-navy-950 transition-colors"
          >
            ADD TO CART
          </button>
        </form>
      </div>
    </div>
  );
}
