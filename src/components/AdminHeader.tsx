import Link from "next/link";
import Logo from "@/components/Logo";
import { logoutAction } from "@/app/admin/actions";
import { getSiteSettings } from "@/lib/settings-repo";

export default async function AdminHeader({ title }: { title: string }) {
  // The hotel's name comes from site settings, so renaming the hotel at
  // /admin/settings renames the panel's own header too.
  const { hotelName } = await getSiteSettings();

  return (
    <div className="border-b border-navy-900/10 mb-10">
      <div className="flex items-center justify-between py-6">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <Logo variant="dark" alt={hotelName} className="h-8 w-auto" />
            <span className="text-sm tracking-widest-plus text-gold-600">
              ADMIN
            </span>
          </div>
          <h1 className="font-serif text-2xl text-navy-900">{title}</h1>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm tracking-widest-plus text-navy-700 hover:text-navy-900 border border-navy-900/20 px-4 py-2.5"
          >
            SIGN OUT
          </button>
        </form>
      </div>
      <nav className="flex flex-wrap gap-6 pb-4 text-sm">
        <Link href="/admin" prefetch={false} className="text-navy-700 hover:text-gold-600">
          Dashboard
        </Link>
        <Link href="/admin/rooms" prefetch={false} className="text-navy-700 hover:text-gold-600">
          Rooms
        </Link>
        <Link href="/admin/rate-plans" prefetch={false} className="text-navy-700 hover:text-gold-600">
          Rate Plans
        </Link>
        <Link href="/admin/add-ons" prefetch={false} className="text-navy-700 hover:text-gold-600">
          Tours & Transfers
        </Link>
        <Link href="/admin/reservations" prefetch={false} className="text-navy-700 hover:text-gold-600">
          Reservations
        </Link>
        <Link href="/admin/media" prefetch={false} className="text-navy-700 hover:text-gold-600">
          Photos
        </Link>
        <Link href="/admin/nearby" prefetch={false} className="text-navy-700 hover:text-gold-600">
          Nearby Places
        </Link>
        <Link href="/admin/blog" prefetch={false} className="text-navy-700 hover:text-gold-600">
          Journal
        </Link>
        <Link href="/admin/about" prefetch={false} className="text-navy-700 hover:text-gold-600">
          About Us
        </Link>
        <Link href="/admin/legal" prefetch={false} className="text-navy-700 hover:text-gold-600">
          Legal
        </Link>
        <Link href="/admin/settings" prefetch={false} className="text-navy-700 hover:text-gold-600">
          Settings
        </Link>
        <Link href="/" prefetch={false} className="text-navy-700 hover:text-gold-600" target="_blank">
          View site &rarr;
        </Link>
      </nav>
    </div>
  );
}
