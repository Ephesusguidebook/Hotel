import { loginAction } from "@/app/admin/actions";
import { adminPanelConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const configured = adminPanelConfigured();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs tracking-widest-plus text-gold-600 mb-2 text-center">
          AURELIA BAY
        </p>
        <h1 className="font-serif text-2xl text-charcoal-900 text-center mb-8">
          Admin Sign In
        </h1>

        {!configured ? (
          <div className="border border-red-300 bg-red-50 text-red-800 text-sm p-4 rounded">
            <p className="font-medium">Admin panel not configured</p>
            <p className="mt-1">
              Set an <code className="font-mono">ADMIN_PASSWORD</code>{" "}
              environment variable on the server, then reload this page.
            </p>
          </div>
        ) : (
          <form action={loginAction} className="space-y-5">
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-300 rounded px-3 py-2">
                Incorrect password.
              </p>
            )}
            <label className="block">
              <span className="text-[11px] tracking-widest-plus text-charcoal-700/70">
                PASSWORD
              </span>
              <input
                type="password"
                name="password"
                required
                autoFocus
                className="mt-2 w-full border-b border-charcoal-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
              />
            </label>
            <button
              type="submit"
              className="w-full bg-charcoal-900 hover:bg-charcoal-800 text-ivory-50 text-xs tracking-widest-plus py-3.5 transition-colors"
            >
              SIGN IN
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
