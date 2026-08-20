import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import RoomForm from "@/components/admin/RoomForm";

export const dynamic = "force-dynamic";

export default async function NewRoomPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <AdminHeader title="Add Room" />
      <RoomForm />
    </div>
  );
}
