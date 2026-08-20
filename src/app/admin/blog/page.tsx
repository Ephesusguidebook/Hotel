import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/auth";
import { getBlogPosts } from "@/lib/blog-repo";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { saved, deleted } = await searchParams;
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AdminHeader title="Journal" />

      {saved && (
        <p className="mb-6 text-sm text-green-800 bg-green-50 border border-green-300 rounded px-4 py-2.5">
          Saved.
        </p>
      )}
      {deleted && (
        <p className="mb-6 text-sm text-green-800 bg-green-50 border border-green-300 rounded px-4 py-2.5">
          Deleted.
        </p>
      )}

      <div className="flex justify-end mb-6">
        <Link
          prefetch={false}
          href="/admin/blog/new"
          className="text-xs tracking-widest-plus bg-charcoal-900 hover:bg-charcoal-800 text-ivory-50 px-5 py-3"
        >
          + ADD POST
        </Link>
      </div>

      <div className="border border-charcoal-900/10 divide-y divide-charcoal-900/10">
        {posts.map((post) => (
          <Link
            key={post.slug}
            prefetch={false}
            href={`/admin/blog/${post.slug}`}
            className="flex items-center justify-between px-6 py-5 hover:bg-ivory-100 transition-colors"
          >
            <div>
              <p className="font-serif text-lg text-charcoal-900">{post.title}</p>
              <p className="text-xs text-charcoal-700/70 mt-1">{post.date}</p>
            </div>
            <span className="text-xs tracking-widest-plus text-gold-600">
              EDIT &rarr;
            </span>
          </Link>
        ))}
        {posts.length === 0 && (
          <p className="px-6 py-8 text-sm text-charcoal-700">
            No journal posts yet — add one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
