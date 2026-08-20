import { redirect, notFound } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getBlogPostBySlug } from "@/lib/blog-repo";
import AdminHeader from "@/components/AdminHeader";
import BlogPostForm from "@/components/admin/BlogPostForm";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <AdminHeader title={`Edit — ${post.title}`} />
      <BlogPostForm post={post} />
    </div>
  );
}
