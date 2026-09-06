import Image from "next/image";
import { listPortfolioAdmin } from "@/lib/data/admin";
import { ActionForm, Field } from "@/components/admin/form";
import { ConfirmSubmit } from "@/components/admin/ui";
import { Uploader } from "@/components/admin/uploader";
import { deletePortfolioImage, updatePortfolioImage } from "../actions";

// Image processing in server actions can exceed the default function timeout.
export const maxDuration = 60;

export default async function PortfolioAdminPage() {
  const images = await listPortfolioAdmin();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Portfolio</h1>
        <p className="mt-2 text-sm text-muted">
          Everything published shows on the portfolio page. Featured photos also appear on the home and about pages.
        </p>
      </div>

      <Uploader target={{ kind: "portfolio" }} />

      {images.length === 0 ? (
        <p className="text-sm text-muted">Nothing uploaded yet. Sample tiles show on the site until you do.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="card overflow-hidden">
              <div className="relative aspect-[4/5] bg-paper-2">
                <Image src={img.url} alt={img.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                {!img.is_published ? (
                  <span className="absolute left-2 top-2 bg-black/60 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-white">Hidden</span>
                ) : null}
                {img.is_featured ? (
                  <span className="absolute right-2 top-2 bg-ink px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-paper">Featured</span>
                ) : null}
              </div>
              <ActionForm
                key={`${img.is_featured}-${img.is_published}-${img.sort_order}-${img.alt}`}
                action={updatePortfolioImage.bind(null, img.id)}
                className="space-y-3 p-4 text-sm"
                buttonClassName="btn-secondary px-3 py-1.5 text-xs"
                extra={
                  <ConfirmSubmit
                    className="btn-danger ml-auto px-3 py-1.5 text-xs"
                    message="Delete this image from the portfolio?"
                    formAction={deletePortfolioImage.bind(null, img.id)}
                  >
                    Delete
                  </ConfirmSubmit>
                }
              >
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <Field label="Description" htmlFor={`alt-${img.id}`}>
                    <input id={`alt-${img.id}`} name="alt" defaultValue={img.alt} className="input py-1.5" />
                  </Field>
                  <Field label="Order" htmlFor={`sort-${img.id}`}>
                    <input id={`sort-${img.id}`} name="sort_order" type="number" defaultValue={img.sort_order} className="input w-20 py-1.5" />
                  </Field>
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_featured" defaultChecked={img.is_featured} className="h-4 w-4" /> Featured
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_published" defaultChecked={img.is_published} className="h-4 w-4" /> Published
                  </label>
                </div>
              </ActionForm>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
