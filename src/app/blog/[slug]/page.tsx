import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog-repo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Aurelia Bay Journal`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(slug),
    getBlogPosts(),
  ]);
  if (!post) notFound();

  const more = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="relative h-[50vh] min-h-[380px] flex items-end">
        <Image
          src={post.image}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/50 to-charcoal-950/20" />
        <div className="relative mx-auto max-w-3xl w-full px-6 pb-14">
          <p className="text-xs tracking-widest-plus text-gold-400 mb-4">
            {post.date.toUpperCase()}
          </p>
          <h1 className="font-serif text-3xl md:text-5xl text-ivory-50">
            {post.title}
          </h1>
        </div>
      </section>

      <article className="bg-ivory-50 py-20 px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-charcoal-700 leading-relaxed text-[15px]">
          {post.content.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <div className="mx-auto max-w-2xl mt-14">
          <Link
            href="/blog"
            className="text-xs tracking-widest-plus text-gold-600 hover:text-gold-500 inline-flex items-center gap-2"
          >
            <span aria-hidden>&larr;</span> BACK TO JOURNAL
          </Link>
        </div>
      </article>

      {more.length > 0 && (
        <section className="bg-charcoal-950 py-20 px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs tracking-widest-plus text-gold-400 mb-10">
              MORE FROM THE JOURNAL
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {more.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(min-width: 640px) 33vw, 100vw"
                    />
                  </div>
                  <h3 className="mt-4 font-serif text-lg text-ivory-50 group-hover:text-gold-400 transition-colors">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
