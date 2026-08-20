import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthed } from "@/lib/auth";
import { getRooms } from "@/lib/rooms-repo";
import { getAddOns } from "@/lib/addons-repo";
import { getBlogPosts } from "@/lib/blog-repo";
import { getPool } from "@/lib/db";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const dbConfigured = !!getPool();
  const [rooms, addOns, posts] = await Promise.all([
    getRooms(),
    getAddOns(),
    getBlogPosts(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AdminHeader title="Dashboard" />

      <div
        className={`mb-10 text-sm px-4 py-3 rounded border ${
          dbConfigured
            ? "bg-green-50 border-green-300 text-green-800"
            : "bg-amber-50 border-amber-300 text-amber-800"
        }`}
      >
        {dbConfigured
          ? "Connected to the database — changes here go live on the site immediately."
          : "DATABASE_URL is not set. The site is showing built-in placeholder content, and changes made here won't be saved. Set DATABASE_URL in your environment to enable editing."}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          prefetch={false}
          href="/admin/rooms"
          className="block border border-charcoal-900/10 p-6 hover:border-gold-500 transition-colors"
        >
          <p className="text-xs tracking-widest-plus text-gold-600 mb-2">
            ROOMS & SUITES
          </p>
          <p className="font-serif text-3xl text-charcoal-900">{rooms.length}</p>
          <p className="text-sm text-charcoal-700 mt-2">
            Edit price, availability, description, amenities and photos.
          </p>
        </Link>

        <Link
          prefetch={false}
          href="/admin/add-ons"
          className="block border border-charcoal-900/10 p-6 hover:border-gold-500 transition-colors"
        >
          <p className="text-xs tracking-widest-plus text-gold-600 mb-2">
            TOURS & TRANSFERS
          </p>
          <p className="font-serif text-3xl text-charcoal-900">{addOns.length}</p>
          <p className="text-sm text-charcoal-700 mt-2">
            Edit price, description, what&apos;s included and photos.
          </p>
        </Link>

        <Link
          prefetch={false}
          href="/admin/blog"
          className="block border border-charcoal-900/10 p-6 hover:border-gold-500 transition-colors"
        >
          <p className="text-xs tracking-widest-plus text-gold-600 mb-2">
            JOURNAL
          </p>
          <p className="font-serif text-3xl text-charcoal-900">{posts.length}</p>
          <p className="text-sm text-charcoal-700 mt-2">
            Add, edit, or remove blog posts.
          </p>
        </Link>

        <Link
          prefetch={false}
          href="/admin/about"
          className="block border border-charcoal-900/10 p-6 hover:border-gold-500 transition-colors"
        >
          <p className="text-xs tracking-widest-plus text-gold-600 mb-2">
            ABOUT US
          </p>
          <p className="font-serif text-lg text-charcoal-900">Story & values</p>
          <p className="text-sm text-charcoal-700 mt-2">
            Edit the About page&apos;s story, photo, and values.
          </p>
        </Link>

        <Link
          prefetch={false}
          href="/admin/legal"
          className="block border border-charcoal-900/10 p-6 hover:border-gold-500 transition-colors"
        >
          <p className="text-xs tracking-widest-plus text-gold-600 mb-2">
            LEGAL PAGES
          </p>
          <p className="font-serif text-lg text-charcoal-900">Privacy & Terms</p>
          <p className="text-sm text-charcoal-700 mt-2">
            Edit the Privacy Policy and Terms & Conditions.
          </p>
        </Link>

        <Link
          prefetch={false}
          href="/admin/settings"
          className="block border border-charcoal-900/10 p-6 hover:border-gold-500 transition-colors sm:col-span-2"
        >
          <p className="text-xs tracking-widest-plus text-gold-600 mb-2">
            SITE SETTINGS
          </p>
          <p className="font-serif text-lg text-charcoal-900">
            Hotel name, contact details & hours
          </p>
          <p className="text-sm text-charcoal-700 mt-2">
            Powers the footer, the Contact page, and page titles.
          </p>
        </Link>
      </div>
    </div>
  );
}
