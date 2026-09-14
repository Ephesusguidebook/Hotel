import Link from "next/link";
import PageHero from "@/components/PageHero";
import { registerAction } from "@/app/account/actions";
import { getPool } from "@/lib/db";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings-repo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Create an Account — ${settings.hotelName}`,
    description: `Create an ${settings.hotelName} account to manage reservations, add-ons, and payment status.`,
  };
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = !!getPool();

  return (
    <>
      <PageHero
        image="/images/hero-contact.jpg"
        eyebrow="Guest Account"
        title="Create Your Account"
        description="Manage your reservations, add tours and transfers, and track payment status in one place."
      />

      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-sm">
          {!configured ? (
            <div className="border border-amber-300 bg-amber-50 text-amber-800 text-sm p-4 rounded">
              Accounts aren&apos;t available yet — the database isn&apos;t
              configured.
            </div>
          ) : (
            <form action={registerAction} className="space-y-5">
              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-300 rounded px-3 py-2">
                  {error}
                </p>
              )}
              <label className="block">
                <span className="text-xs tracking-widest-plus text-navy-500">
                  FULL NAME
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  className="mt-2 w-full border-b border-navy-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
                />
              </label>
              <label className="block">
                <span className="text-xs tracking-widest-plus text-navy-500">
                  EMAIL
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-2 w-full border-b border-navy-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
                />
              </label>
              <label className="block">
                <span className="text-xs tracking-widest-plus text-navy-500">
                  PHONE (OPTIONAL)
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="mt-2 w-full border-b border-navy-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
                />
              </label>
              <label className="block">
                <span className="text-xs tracking-widest-plus text-navy-500">
                  PASSWORD
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  className="mt-2 w-full border-b border-navy-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
                />
                <span className="mt-1 block text-xs text-navy-700/50">
                  At least 8 characters.
                </span>
              </label>
              <button
                type="submit"
                className="w-full bg-navy-900 hover:bg-navy-800 text-ivory-50 text-sm tracking-widest-plus py-3.5 transition-colors"
              >
                CREATE ACCOUNT
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-navy-700 text-center">
            Already have an account?{" "}
            <Link
              href="/account/login"
              className="text-gold-600 hover:text-gold-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
