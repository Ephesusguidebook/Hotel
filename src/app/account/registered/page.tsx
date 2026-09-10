import Link from "next/link";
import PageHero from "@/components/PageHero";
import { resendVerificationAction } from "@/app/account/actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Check Your Email — Aurelia Bay",
};

export default async function RegisteredPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; link?: string }>;
}) {
  const { email = "", link } = await searchParams;

  return (
    <>
      <PageHero
        image="/images/hero-contact.jpg"
        eyebrow="Almost There"
        title="Confirm Your Email"
        description="One last step before you can sign in."
      />

      <section className="bg-ivory-50 py-24 px-6 lg:px-10">
        <div className="mx-auto max-w-md text-center">
          <p className="text-sm text-charcoal-700 leading-relaxed">
            We&apos;ve sent a confirmation link to <span className="text-charcoal-900">{email}</span>.
            Click the link in that email to activate your account, then sign in.
          </p>

          {link && (
            <div className="mt-8 border border-amber-300 bg-amber-50 text-amber-900 text-sm p-5 rounded text-left">
              <p className="font-medium mb-2">Email delivery isn&apos;t configured on this server yet.</p>
              <p className="mb-3">You can confirm your account with this link instead:</p>
              <Link href={link} className="text-gold-700 underline break-all">
                {link}
              </Link>
            </div>
          )}

          <form action={resendVerificationAction} className="mt-8">
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              className="text-xs tracking-widest-plus text-charcoal-700 hover:text-charcoal-900 border border-charcoal-900/20 px-5 py-3"
            >
              RESEND CONFIRMATION EMAIL
            </button>
          </form>

          <p className="mt-8 text-sm text-charcoal-700">
            Already confirmed?{" "}
            <Link href="/account/login" className="text-gold-600 hover:text-gold-500">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
