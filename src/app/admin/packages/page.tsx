import { listPackages } from "@/lib/data/admin";
import { ConfirmSubmit } from "@/components/admin/ui";
import { deletePackage, upsertPackage } from "../actions";
import type { Package } from "@/lib/types";

function PackageForm({ pkg }: { pkg?: Package }) {
  return (
    <form action={upsertPackage} className="card space-y-4 p-5">
      {pkg ? <input type="hidden" name="id" value={pkg.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label className="label" htmlFor={`name-${pkg?.id ?? "new"}`}>Name</label>
          <input id={`name-${pkg?.id ?? "new"}`} name="name" defaultValue={pkg?.name ?? ""} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor={`slug-${pkg?.id ?? "new"}`}>Slug</label>
          <input id={`slug-${pkg?.id ?? "new"}`} name="slug" defaultValue={pkg?.slug ?? ""} className="input" placeholder="auto from name" />
        </div>
        <div>
          <label className="label" htmlFor={`price-${pkg?.id ?? "new"}`}>Price (USD)</label>
          <input id={`price-${pkg?.id ?? "new"}`} name="price" defaultValue={pkg ? (pkg.price_cents / 100).toFixed(0) : ""} required className="input w-28" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor={`description-${pkg?.id ?? "new"}`}>Description</label>
        <input id={`description-${pkg?.id ?? "new"}`} name="description" defaultValue={pkg?.description ?? ""} className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="label" htmlFor={`includes-${pkg?.id ?? "new"}`}>Includes <span className="text-muted">(one per line)</span></label>
          <textarea id={`includes-${pkg?.id ?? "new"}`} name="includes" rows={4} defaultValue={pkg?.includes.join("\n") ?? ""} className="input" />
        </div>
        <div className="space-y-3">
          <div>
            <label className="label" htmlFor={`turnaround-${pkg?.id ?? "new"}`}>Turnaround</label>
            <input id={`turnaround-${pkg?.id ?? "new"}`} name="turnaround" defaultValue={pkg?.turnaround ?? ""} className="input" placeholder="3 business days" />
          </div>
          <div>
            <label className="label" htmlFor={`sort-${pkg?.id ?? "new"}`}>Order</label>
            <input id={`sort-${pkg?.id ?? "new"}`} name="sort_order" type="number" defaultValue={pkg?.sort_order ?? 0} className="input w-24" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_featured" defaultChecked={pkg?.is_featured ?? false} className="h-4 w-4" /> Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={pkg?.is_active ?? true} className="h-4 w-4" /> Shown on site
          </label>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button type="submit" className="btn-primary">{pkg ? "Save" : "Add package"}</button>
        {pkg ? (
          <ConfirmSubmit className="btn-danger" message={`Delete the ${pkg.name} package?`} formAction={deletePackage.bind(null, pkg.id)}>
            Delete
          </ConfirmSubmit>
        ) : null}
      </div>
    </form>
  );
}

export default async function PackagesPage() {
  const packages = await listPackages();
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="eyebrow">Offer</p>
        <h1 className="mt-2 font-display text-3xl">Packages</h1>
        <p className="mt-2 text-sm text-muted">These appear on the home and pricing pages.</p>
      </div>
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
