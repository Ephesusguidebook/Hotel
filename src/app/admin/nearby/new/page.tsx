import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getAttractions, categoriesOf } from "@/lib/attractions-repo";
import AdminHeader from "@/components/AdminHeader";
import AttractionForm from "@/components/admin/AttractionForm";

export const dynamic = "force-dynamic";

export default async function NewAttractionPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const categories = categoriesOf(await getAttractions());

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <AdminHeader title="Add a Nearby Place" />
      <AttractionForm categories={categories} />
    </div>
  );
}
