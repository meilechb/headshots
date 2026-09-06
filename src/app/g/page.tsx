import { redirect } from "next/navigation";

async function openGallery(formData: FormData) {
  "use server";
  const raw = String(formData.get("gallery") ?? "").trim();
  // Accept a full link (https://…/g/slug) or just the slug.
  const match = raw.match(/\/g\/([^/?#\s]+)/);
  const slug = (match ? match[1] : raw).toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!slug) redirect("/g?error=1");
  redirect(`/g/${slug}`);
}

export default async function GalleryLanding({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-16">
      <form action={openGallery} className="card w-full max-w-md p-8">
        <p className="eyebrow">Your photos</p>
        <h1 className="mt-3 font-display text-3xl">Open your gallery</h1>
        <p className="mt-2 text-sm text-muted">
          Paste the gallery link from your email, or type the gallery name that
          appears after <span className="font-mono">/g/</span>.
        </p>
        <label htmlFor="gallery" className="label mt-6">
          Gallery link or name
        </label>
        <input
          id="gallery"
          name="gallery"
          required
          className="input"
          placeholder="https://meilechbiller.com/g/jane-doe-proofs"
        />
        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-400">
            That doesn’t look like a gallery link.
          </p>
        ) : null}
        <button type="submit" className="btn-primary mt-6 w-full">
          Continue
        </button>
      </form>
    </section>
  );
}
