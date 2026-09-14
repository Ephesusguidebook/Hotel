import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getRoomBySlug } from "@/lib/rooms-repo";
import AdminHeader from "@/components/AdminHeader";
import RoomForm from "@/components/admin/RoomForm";

export const dynamic = "force-dynamic";

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  if (!room) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <AdminHeader title={`Edit — ${room.name}`} />

      <Link
        href={`/admin/rooms/${room.slug}/calendar`}
        prefetch={false}
        className="mb-8 inline-block border border-charcoal-900/25 px-5 py-3 text-sm tracking-widest-plus text-charcoal-800 hover:border-gold-500"
      >
        PRICES &amp; AVAILABILITY CALENDAR &rarr;
      </Link>
      <RoomForm room={room} />
    </div>
  );
}
