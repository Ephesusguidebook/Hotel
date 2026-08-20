import PageHero from "@/components/PageHero";
import BlogCard from "@/components/BlogCard";
import { getBlogPosts } from "@/lib/blog-repo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal — Aurelia Bay",
  description: "Notes on the coast, the kitchen, and life around the hotel.",
};

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <>
      <PageHero
        image="/images/hero-blog.jpg"
        eyebrow="Journal"
        title="Notes from the coast"
        description="Short writing on the region, the kitchen, and life around the hotel."
      />

      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
          {blogPosts.length === 0 && (
            <p className="text-sm text-charcoal-700">
              No journal posts yet — check back soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
