import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/auth";
import { getRatePlans } from "@/lib/rates-repo";
import { schemaReady } from "@/lib/setup-check";
import { saveRatePlanAction, deleteRatePlanAction } from "@/app/admin/actions";
import AdminHeader from "@/components/AdminHeader";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminRatePlansPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { saved, deleted, error } = await searchParams;
  const plans = await getRatePlans();
  const ready = await schemaReady([
    "rate_plans",
    "room_rates",
    "room_availability",
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <AdminHeader title="Rate Plans" />

      {!ready && (
        <div className="mb-6 border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="text-base font-medium text-amber-900">
            The pricing tables aren&apos;t in the database yet
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-amber-900">
            Rate plans, prices and the availability calendar all live in tables
            that <code className="font-mono">sql/schema_v6.sql</code> creates.
            Until you import that file in phpMyAdmin, anything you save here is
            thrown away. Import it, then reload this page.
          </p>
        </div>
      )}

      {error && (
        <p className="mb-6 rounded border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-800">
          {error}
        </p>
      )}

      {(saved || deleted) && (
        <p className="mb-6 rounded border border-green-300 bg-green-50 px-4 py-2.5 text-sm text-green-800">
          {saved ? "Rate plan saved." : "Rate plan deleted."}
        </p>
      )}

      <p className="mb-10 max-w-2xl text-base leading-relaxed text-navy-700">
        A rate plan is what you&apos;re selling — the room on its own, the room
        with breakfast, a non-refundable deal. Guests pick one when they book.
        Prices live on each room&apos;s calendar, so the same plan can cost
        different amounts in different rooms and seasons.
      </p>

      <ul className="mb-12 space-y-4">
        {plans.map((plan) => (
          <li
            key={plan.id}
            className="border border-navy-900/10 bg-white p-5"
          >
            <form action={saveRatePlanAction.bind(null, plan.id)}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-navy-800">
                    Name
                  </span>
                  <input
                    name="name"
                    defaultValue={plan.name}
                    required
                    className="input mt-1.5"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-navy-800">
                    URL slug
                  </span>
                  <input
                    name="slug"
                    defaultValue={plan.slug}
                    required
                    pattern="[a-z0-9\-]+"
                    className="input mt-1.5"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-medium text-navy-800">
                  Description (shown to guests under the plan name)
                </span>
                <input
                  name="description"
                  defaultValue={plan.description}
                  className="input mt-1.5"
                />
              </label>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <label className="block w-32">
                  <span className="text-sm font-medium text-navy-800">
                    Order
                  </span>
                  <input
                    type="number"
                    name="sortOrder"
                    defaultValue={plan.sortOrder}
                    className="input mt-1.5"
                  />
                </label>
                <button
                  type="submit"
                  className="bg-gold-500 px-5 py-2.5 text-sm tracking-widest-plus text-navy-950 hover:bg-gold-400"
                >
                  SAVE
                </button>
              </div>
            </form>

            <form
              action={deleteRatePlanAction.bind(null, plan.id)}
              className="mt-3 border-t border-navy-900/10 pt-3"
            >
              <ConfirmSubmitButton
                confirmMessage={`Delete "${plan.name}"? Every price you've set on this plan goes with it.`}
                className="text-sm text-red-700 hover:text-red-800"
              >
                Delete this plan
              </ConfirmSubmitButton>
            </form>
          </li>
        ))}

        {plans.length === 0 && (
          <li className="border border-navy-900/10 bg-white px-5 py-8 text-base text-navy-700">
            No rate plans yet. Add one below — until there is at least one plan
            with prices, no room can be booked.
          </li>
        )}
      </ul>

      <div className="border border-navy-900/10 bg-white p-5">
        <h2 className="mb-4 font-serif text-xl text-navy-900">
          Add a rate plan
        </h2>
        <form action={saveRatePlanAction.bind(null, 0)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-navy-800">
                Name
              </span>
              <input
                name="name"
                required
                placeholder="Half Board"
                className="input mt-1.5"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-navy-800">
                URL slug
              </span>
              <input
                name="slug"
                required
                pattern="[a-z0-9\-]+"
                placeholder="half-board"
                className="input mt-1.5"
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-navy-800">
              Description
            </span>
            <input
              name="description"
              placeholder="Breakfast and dinner included."
              className="input mt-1.5"
            />
          </label>
          <input
            type="hidden"
            name="sortOrder"
            value={(plans.length + 1) * 10}
          />
          <button
            type="submit"
            className="mt-5 bg-navy-900 px-5 py-3 text-sm tracking-widest-plus text-ivory-50 hover:bg-navy-800"
          >
            ADD PLAN
          </button>
        </form>
      </div>
    </div>
  );
}
