import Link from "next/link";
import PageHero from "@/components/PageHero";
import { verifyEmailToken } from "@/lib/customer-repo";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/settings-repo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `Confirm Email — ${settings.hotelName}`,
  };
}

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const customerId = token ? await verifyEmailToken(token) : null;

  return (
    <>
      <PageHero
        image="/images/hero-contact.jpg"
        eyebrow="Guest Account"
        title="Email Confirmation"
        description=""
      />

      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-md text-center">
          {customerId ? (
            <>
              <p className="text-base text-navy-700 leading-relaxed">
                Your email is confirmed. You can now sign in to your account.
              </p>
              <Link
                href="/account/login"
                className="mt-8 inline-flex bg-navy-900 hover:bg-navy-800 text-ivory-50 text-sm tracking-widest-plus px-8 py-3.5 transition-colors"
              >
                SIGN IN
              </Link>
            </>
          ) : (
            <>
              <p className="text-base text-navy-700 leading-relaxed">
                This confirmation link is invalid or has expired. Request a new
                one from the registration confirmation page, or contact us if
                you need help.
              </p>
              <Link
                href="/account/register"
                className="mt-8 inline-flex border border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-ivory-50 text-sm tracking-widest-plus px-8 py-3.5 transition-colors"
              >
                BACK TO REGISTRATION
              </Link>
            </>
          )}
        </div>
      </section>
    </>
  );
}
