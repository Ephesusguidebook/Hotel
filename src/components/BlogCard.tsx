import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/data";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
        />
      </div>
      <div className="pt-5">
        <p className="text-xs tracking-widest-plus text-gold-600">
          {post.date.toUpperCase()}
        </p>
        <h3 className="mt-2 font-serif text-xl text-charcoal-900 group-hover:text-gold-600 transition-colors">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-charcoal-700 leading-relaxed">
          {post.excerpt}
        </p>
      </div>
    </Link>
  );
}
