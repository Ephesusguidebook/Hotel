import Image from "next/image";
import Link from "next/link";
import type { Room } from "@/lib/data";

export default function RoomCard({ room }: { room: Room }) {
  return (
    <div className="group bg-charcoal-950">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={room.image}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute top-4 right-4 bg-charcoal-950/80 border border-gold-500/60 px-3 py-1.5 text-xs tracking-wide text-gold-400">
          from ${room.price}/night
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl text-ivory-50">{room.name}</h3>
        <p className="mt-2 text-xs tracking-wide text-ivory-200/60">
          {room.size} &middot; {room.occupancy} &middot; {room.bed}
        </p>
        <p className="mt-4 text-sm text-ivory-200/80 leading-relaxed">
          {room.description}
        </p>
        <Link
          href={`/rooms#${room.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-xs tracking-widest-plus text-gold-400 hover:text-gold-300"
        >
          VIEW DETAILS <span aria-hidden>&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
