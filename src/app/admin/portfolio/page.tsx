import Image from "next/image";
import { listPortfolioAdmin } from "@/lib/data/admin";
import { portfolioCategories } from "@/lib/site";
import { ConfirmSubmit } from "@/components/admin/ui";
import { Uploader } from "@/components/admin/uploader";
import { deletePortfolioImage, updatePortfolioImage } from "../actions";

// Image processing in server actions can exceed the default function timeout.
export const maxDuration = 60;

export default async function PortfolioAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [{ category }, images] = await Promise.all([searchParams, listPortfolioAdmin()]);
  const uploadCategory =
    portfolioCategories.find((c) => c.slug === category)?.slug ?? portfolioCategories[0].slug;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Public site</p>
        <h1 className="mt-2 font-display text-3xl">Portfolio</h1>
        <p className="mt-2 text-sm text-muted">
          Featured images appear on the home page and as the hero. Everything published shows on /portfolio.
        </p>
      </div>

      <section className="space-y-3">
        <form className="flex flex-wrap items-center gap-2 text-sm" method="get">
          <label htmlFor="category" className="text-muted">Upload into</label>
          <select id="category" name="category" defaultValue={uploadCategory} className="input w-auto py-1.5">
            {portfolioCategories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">Select</button>
        </form>
        <Uploader target={{ kind: "portfolio", category: uploadCategory }} />
      </section>

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
              <form key={`${img.category}-${img.is_featured}-${img.is_published}-${img.sort_order}-${img.alt}`} action={updatePortfolioImage.bind(null, img.id)} className="space-y-3 p-4 text-sm">
                <div>
                  <label htmlFor={`alt-${img.id}`} className="label">Alt text</label>
                  <input id={`alt-${img.id}`} name="alt" defaultValue={img.alt} className="input py-1.5" />
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-3">
                  <select name="category" defaultValue={img.category} className="input py-1.5" aria-label="Category">
                    {portfolioCategories.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.label}</option>
                    ))}
                  </select>
                  <input name="sort_order" type="number" defaultValue={img.sort_order} className="input w-20 py-1.5" aria-label="Sort order" />
                </div>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_featured" defaultChecked={img.is_featured} className="h-4 w-4" /> Featured
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_published" defaultChecked={img.is_published} className="h-4 w-4" /> Published
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">Save</button>
                  <ConfirmSubmit className="btn-danger px-3 py-1.5 text-xs" message="Delete this image from the portfolio?" formAction={deletePortfolioImage.bind(null, img.id)}>
                    Delete
                  </ConfirmSubmit>
                </div>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
