import { redirect, notFound } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getAddOnBySlug } from "@/lib/addons-repo";
import AdminHeader from "@/components/AdminHeader";
import AddOnForm from "@/components/admin/AddOnForm";

export const dynamic = "force-dynamic";

export default async function EditAddOnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { slug } = await params;
  const item = await getAddOnBySlug(slug);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <AdminHeader title={`Edit — ${item.name}`} />
      <AddOnForm item={item} />
    </div>
  );
}
