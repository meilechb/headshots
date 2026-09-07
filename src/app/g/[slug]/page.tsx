import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getGalleryBySlug,
  getGalleryPhotos,
  isGalleryExpired,
} from "@/lib/data/galleries";
import { hasGalleryAccess } from "@/lib/gallery-access";
import { site } from "@/lib/site";
import { AccessForm } from "./access-form";
import { GalleryView } from "./gallery-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);
  return {
    title: gallery ? gallery.title : "Gallery",
    robots: { index: false, follow: false },
  };
}

export default async function ClientGalleryPage({ params }: Props) {
  const { slug } = await params;
  const gallery = await getGalleryBySlug(slug);

  if (!gallery || gallery.status === "draft") notFound();

  if (gallery.status === "archived" || isGalleryExpired(gallery)) {
    return (
      <section className="container-x grid min-h-[60vh] place-items-center py-16">
        <div className="card max-w-md p-8 text-center">
          <p className="eyebrow">Gallery closed</p>
          <h1 className="mt-3 font-display text-3xl">{gallery.title}</h1>
          <p className="mt-3 text-sm text-muted">
            This gallery is closed. Email{" "}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
            .
          </p>
        </div>
      </section>
    );
  }

  const unlocked = await hasGalleryAccess(gallery.id);
  if (!unlocked) {
    return (
      <AccessForm
        slug={slug}
        title={gallery.title}
        clientName={gallery.client.name}
      />
    );
  }

  const photos = await getGalleryPhotos(gallery);

  return (
    <GalleryView
      slug={slug}
      title={gallery.title}
      kind={gallery.kind}
      clientName={gallery.client.name}
      welcome={gallery.welcome_message}
      allowDownloads={gallery.allow_downloads}
      expiresAt={gallery.expires_at}
      photos={photos.map((p) => ({
        id: p.id,
        filename: p.filename,
        url: p.url,
        downloadUrl: p.downloadUrl,
        width: p.width,
        height: p.height,
        selected: p.selected,
        comments: p.comments.map((c) => ({
          id: c.id,
          author_name: c.author_name,
          author_role: c.author_role,
          body: c.body,
          created_at: c.created_at,
        })),
      }))}
    />
  );
}
