import { listPackages } from "@/lib/data/admin";
import { ActionForm, Field } from "@/components/admin/form";
import { ConfirmSubmit } from "@/components/admin/ui";
import { deletePackage, upsertPackage } from "../actions";
import type { Package } from "@/lib/types";

function PackageForm({ pkg }: { pkg?: Package }) {
  const k = pkg?.id ?? "new";
  return (
    <ActionForm
      key={pkg ? `${pkg.name}-${pkg.slug}-${pkg.price_cents}-${pkg.sort_order}-${pkg.is_featured}-${pkg.is_active}-${pkg.included_finals}-${pkg.extra_final_cents}` : "new"}
      action={upsertPackage}
      className="card space-y-4 p-5"
      submitLabel={pkg ? "Save" : "Add package"}
      pendingLabel={pkg ? "Saving…" : "Adding…"}
      resetOnSuccess={!pkg}
      extra={
        pkg ? (
          <ConfirmSubmit
            className="btn-danger ml-auto"
            message={`Delete the ${pkg.name} package?`}
            formAction={deletePackage.bind(null, pkg.id)}
          >
            Delete
          </ConfirmSubmit>
        ) : null
      }
    >
      {pkg ? <input type="hidden" name="id" value={pkg.id} /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <Field label="Name" htmlFor={`name-${k}`}>
          <input id={`name-${k}`} name="name" defaultValue={pkg?.name ?? ""} required className="input" />
        </Field>
        <Field label="Web name" htmlFor={`slug-${k}`} hint="auto from name">
          <input id={`slug-${k}`} name="slug" defaultValue={pkg?.slug ?? ""} className="input" />
        </Field>
        <Field label="Price" htmlFor={`price-${k}`} hint="USD">
          <input id={`price-${k}`} name="price" inputMode="decimal" defaultValue={pkg ? (pkg.price_cents / 100).toFixed(0) : ""} required className="input w-28" />
        </Field>
      </div>
      <Field label="Description" htmlFor={`description-${k}`}>
        <input id={`description-${k}`} name="description" defaultValue={pkg?.description ?? ""} className="input" />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
        <Field label="Includes" htmlFor={`includes-${k}`} hint="one per line">
          <textarea id={`includes-${k}`} name="includes" rows={4} defaultValue={pkg?.includes.join("\n") ?? ""} className="input" />
        </Field>
        <div className="space-y-3">
          <Field label="Turnaround" htmlFor={`turnaround-${k}`}>
            <input id={`turnaround-${k}`} name="turnaround" defaultValue={pkg?.turnaround ?? ""} className="input" placeholder="3 business days" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Finals included" htmlFor={`finals-${k}`}>
              <input id={`finals-${k}`} name="included_finals" type="number" min={0} defaultValue={pkg?.included_finals ?? 0} className="input" />
            </Field>
            <Field label="Extra photo" htmlFor={`extra-${k}`}>
              <input id={`extra-${k}`} name="extra_final" inputMode="decimal" defaultValue={pkg ? (pkg.extra_final_cents / 100).toFixed(0) : "0"} className="input" />
            </Field>
          </div>
          <Field label="Order" htmlFor={`sort-${k}`}>
            <input id={`sort-${k}`} name="sort_order" type="number" defaultValue={pkg?.sort_order ?? 0} className="input w-24" />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_featured" defaultChecked={pkg?.is_featured ?? false} className="h-4 w-4" /> Most popular
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={pkg?.is_active ?? true} className="h-4 w-4" /> Shown on site
          </label>
        </div>
      </div>
    </ActionForm>
  );
}

export default async function PackagesPage() {
  const packages = await listPackages();
  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-display text-3xl">Packages</h1>
      {packages.map((p) => (
        <PackageForm key={p.id} pkg={p} />
      ))}
      <div>
        <h2 className="mb-3 font-medium">New package</h2>
        <PackageForm />
      </div>
    </div>
  );
}
