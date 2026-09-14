import Link from "next/link";
import ImageGallery from "@/components/ImageGallery";
import type { Attraction } from "@/lib/data";

export default function AttractionCard({ item }: { item: Attraction }) {
  return (
    <article className="flex flex-col bg-white border border-navy-900/10 overflow-hidden">
      <div className="relative">
        <ImageGallery
          images={item.images}
          alt={item.name}
          aspect="aspect-[4/3]"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        <span className="pointer-events-none absolute top-4 left-4 bg-navy-950/85 text-gold-400 text-sm tracking-widest-plus px-3 py-1.5">
          {item.category.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-serif text-xl text-navy-900">{item.name}</h3>

        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-navy-500">
          <span>{item.distance} from the hotel</span>
          {item.travelTime && (
            <>
              <span aria-hidden>&middot;</span>
              <span>{item.travelTime}</span>
            </>
          )}
        </p>

        <p className="mt-3 flex-1 text-base text-navy-700 leading-relaxed">
          {item.description}
        </p>

        <Link
          href={`/nearby/${item.slug}`}
          className="mt-5 inline-flex items-center gap-2 self-start text-sm tracking-widest-plus text-gold-600 hover:text-navy-900"
        >
          MORE ABOUT THIS PLACE <span aria-hidden>&rarr;</span>
        </Link>
      </div>
    </article>
  );
}
