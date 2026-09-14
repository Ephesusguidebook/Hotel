import Link from "next/link";
import PageHero from "@/components/PageHero";
import { loginAction } from "@/app/account/actions";
import { getPool } from "@/lib/db";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings-repo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Sign In — ${settings.hotelName}`,
  };
}

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next = "/account" } = await searchParams;
  const settings = await getSiteSettings();
  const configured = !!getPool();

  return (
    <>
      <PageHero
        image="/images/hero-contact.jpg"
        eyebrow="Guest Account"
        title="Sign In"
      />

      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-sm">
          {!configured ? (
            <div className="border border-amber-300 bg-amber-50 text-amber-800 text-sm p-4 rounded">
              Accounts aren&apos;t available yet — the database isn&apos;t
              configured.
            </div>
          ) : (
            <form action={loginAction} className="space-y-5">
              <input type="hidden" name="next" value={next} />
              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-300 rounded px-3 py-2">
                  Incorrect email or password.
                </p>
              )}
              <label className="block">
                <span className="text-xs tracking-widest-plus text-navy-500">
                  EMAIL
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  autoFocus
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
                  className="mt-2 w-full border-b border-navy-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
                />
              </label>
              <button
                type="submit"
                className="w-full bg-navy-900 hover:bg-navy-800 text-ivory-50 text-sm tracking-widest-plus py-3.5 transition-colors"
              >
                SIGN IN
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-navy-700 text-center">
            New to {settings.hotelName}?{" "}
            <Link
              href="/account/register"
              className="text-gold-600 hover:text-gold-500"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
