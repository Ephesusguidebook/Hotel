import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export default function AdminHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-charcoal-900/10 mb-10">
      <div className="flex items-center justify-between py-6">
        <div>
          <p className="text-xs tracking-widest-plus text-gold-600 mb-1">
            AURELIA BAY ADMIN
          </p>
          <h1 className="font-serif text-2xl text-charcoal-900">{title}</h1>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs tracking-widest-plus text-charcoal-700 hover:text-charcoal-900 border border-charcoal-900/20 px-4 py-2.5"
          >
            SIGN OUT
          </button>
        </form>
      </div>
      <nav className="flex flex-wrap gap-6 pb-4 text-sm">
        <Link href="/admin" prefetch={false} className="text-charcoal-700 hover:text-gold-600">
          Dashboard
        </Link>
        <Link href="/admin/rooms" prefetch={false} className="text-charcoal-700 hover:text-gold-600">
          Rooms
        </Link>
        <Link href="/admin/add-ons" prefetch={false} className="text-charcoal-700 hover:text-gold-600">
          Tours & Transfers
        </Link>
        <Link href="/admin/blog" prefetch={false} className="text-charcoal-700 hover:text-gold-600">
          Journal
        </Link>
        <Link href="/admin/about" prefetch={false} className="text-charcoal-700 hover:text-gold-600">
          About Us
        </Link>
        <Link href="/admin/legal" prefetch={false} className="text-charcoal-700 hover:text-gold-600">
          Legal
        </Link>
        <Link href="/admin/settings" prefetch={false} className="text-charcoal-700 hover:text-gold-600">
          Settings
        </Link>
        <Link href="/" prefetch={false} className="text-charcoal-700 hover:text-gold-600" target="_blank">
          View site &rarr;
        </Link>
      </nav>
    </div>
  );
}
