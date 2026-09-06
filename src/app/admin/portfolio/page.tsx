import Image from "next/image";
import { listPortfolioAdmin } from "@/lib/data/admin";
import { ActionForm, Field } from "@/components/admin/form";
import { ConfirmSubmit } from "@/components/admin/ui";
import { Uploader } from "@/components/admin/uploader";
import { getHeroImage } from "@/lib/data/settings";
import { clearHeroImage, deletePortfolioImage, updatePortfolioImage, useAsHeroImage } from "../actions";

// Image processing in server actions can exceed the default function timeout.
export const maxDuration = 60;

export default async function PortfolioAdminPage() {
  const [images, hero] = await Promise.all([listPortfolioAdmin(), getHeroImage()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Portfolio</h1>
        <p className="mt-2 text-sm text-muted">
          Everything published shows on the portfolio page. Featured photos also appear on the home and about pages.
        </p>
      </div>

      <section className="card p-5" aria-labelledby="hero-heading">
        <h2 id="hero-heading" className="font-medium">Home page header image</h2>
        <p className="mt-1 text-xs text-muted">
          Shown full-width behind the heading on the home page. Upload a wide photo here, or press “Use as header” on any portfolio photo below.
          {hero ? "" : " Until one is set, the first featured photo is used."}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="relative aspect-[16/7] overflow-hidden bg-paper-3">
            {hero ? (
              <Image src={hero.url} alt={hero.alt || "Home page header image"} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover object-[center_30%]" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-muted">No header image set</div>
            )}
          </div>
          <div className="space-y-3">
            <Uploader target={{ kind: "hero" }} />
            {hero ? (
              <ActionForm action={clearHeroImage} submitLabel="Remove header image" pendingLabel="Removing…" successMessage="Removed" buttonClassName="btn-ghost px-3 py-1.5 text-xs" className="space-y-0">
                <span className="sr-only">Remove the home page header image</span>
              </ActionForm>
            ) : null}
          </div>
        </div>
      </section>

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
                {hero?.url === img.url ? (
                  <span className="absolute bottom-2 left-2 bg-ink px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-paper">Home header</span>
                ) : null}
              </div>
              {hero?.url !== img.url ? (
                <div className="border-b border-line px-4 py-2">
                  <ActionForm action={useAsHeroImage.bind(null, img.id)} submitLabel="Use as header" pendingLabel="Setting…" successMessage="Set" buttonClassName="btn-ghost px-2 py-1 text-xs" className="space-y-0">
                    <span className="sr-only">Use this photo as the home page header</span>
                  </ActionForm>
                </div>
              ) : null}
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
