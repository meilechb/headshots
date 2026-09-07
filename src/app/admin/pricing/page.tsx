import { listPackages } from "@/lib/data/admin";
import { ActionForm, Disclosure, Field } from "@/components/admin/form";
import { Icon } from "@/components/admin/icons";
import { ConfirmSubmit } from "@/components/admin/ui";
import { deletePackage, upsertPackage } from "../actions";
import type { Package } from "@/lib/types";

/**
 * One row per package. Every package can be picked when you set up a session;
 * only the ones with "Show on pricing page" ticked appear on the public site.
 */
function PackageForm({ pkg }: { pkg?: Package }) {
  const k = pkg?.id ?? "new";
  return (
    <ActionForm
      key={
        pkg
          ? `${pkg.name}-${pkg.price_cents}-${pkg.description}-${pkg.sort_order}-${pkg.is_active}-${pkg.included_finals}-${pkg.extra_final_cents}`
          : "new"
      }
      action={upsertPackage}
      className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_0.5fr]"
      submitLabel={pkg ? "Save" : "Add package"}
      pendingLabel={pkg ? "Saving…" : "Adding…"}
      buttonClassName={pkg ? "btn-secondary" : "btn-primary"}
      resetOnSuccess={!pkg}
      extra={
        <>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={pkg?.is_active ?? true} className="h-4 w-4" />
            Show on pricing page
          </label>
          {pkg ? (
            <ConfirmSubmit
              className="btn-danger ml-auto"
              message={`Delete the ${pkg.name} package?`}
              formAction={deletePackage.bind(null, pkg.id)}
            >
              <Icon name="trash" />
              Delete
            </ConfirmSubmit>
          ) : null}
        </>
      }
    >
      {pkg ? (
        <>
          <input type="hidden" name="id" value={pkg.id} />
          <input type="hidden" name="slug" value={pkg.slug} />
          <input type="hidden" name="includes" value={pkg.includes.join("\n")} />
          <input type="hidden" name="turnaround" value={pkg.turnaround ?? ""} />
        </>
      ) : null}
      <div className="col-span-2 sm:col-span-4 lg:col-span-1">
        <Field label="Name" htmlFor={`name-${k}`}>
          <input id={`name-${k}`} name="name" defaultValue={pkg?.name ?? ""} required className="input" />
        </Field>
      </div>
      <Field label="Price" htmlFor={`price-${k}`}>
        <input id={`price-${k}`} name="price" inputMode="decimal" defaultValue={pkg ? (pkg.price_cents / 100).toFixed(0) : ""} required className="input" placeholder="0 = quote" />
      </Field>
      <Field label="Finals included" htmlFor={`finals-${k}`}>
        <input id={`finals-${k}`} name="included_finals" type="number" min={0} defaultValue={pkg?.included_finals ?? 0} className="input" />
      </Field>
      <Field label="Extra photo" htmlFor={`extra-${k}`}>
        <input id={`extra-${k}`} name="extra_final" inputMode="decimal" defaultValue={pkg ? (pkg.extra_final_cents / 100).toFixed(0) : "0"} className="input" />
      </Field>
      <Field label="Order" htmlFor={`sort-${k}`}>
        <input id={`sort-${k}`} name="sort_order" type="number" defaultValue={pkg?.sort_order ?? 0} className="input" />
      </Field>
      <div className="col-span-2 sm:col-span-4 lg:col-span-5">
        <Field label="Description" htmlFor={`description-${k}`}>
          <input id={`description-${k}`} name="description" defaultValue={pkg?.description ?? ""} className="input" />
        </Field>
      </div>
    </ActionForm>
  );
}

export default async function PricingPage() {
  const packages = await listPackages();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Pricing</h1>
        <Disclosure label={<><Icon name="plus" />New package</>}>
          <div className="mt-2">
            <PackageForm />
          </div>
        </Disclosure>
      </div>
      {packages.length === 0 ? <p className="text-sm text-muted">No packages yet.</p> : null}
      {packages.map((p) => (
        <PackageForm key={p.id} pkg={p} />
      ))}
    </div>
  );
}
