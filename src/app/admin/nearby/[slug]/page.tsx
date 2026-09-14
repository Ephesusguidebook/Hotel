import { redirect, notFound } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import {
  getAttractions,
  getAttractionBySlug,
  categoriesOf,
} from "@/lib/attractions-repo";
import AdminHeader from "@/components/AdminHeader";
import AttractionForm from "@/components/admin/AttractionForm";

export const dynamic = "force-dynamic";

export default async function EditAttractionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { slug } = await params;
  const item = await getAttractionBySlug(slug);
  if (!item) notFound();

  const categories = categoriesOf(await getAttractions());

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <AdminHeader title={`Edit — ${item.name}`} />
      <AttractionForm item={item} categories={categories} />
    </div>
  );
}
