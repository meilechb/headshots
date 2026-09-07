"use client";

import { useActionState } from "react";
import { emailGalleryLink, type GalleryEmailState } from "@/app/admin/actions";

export function EmailGalleryButton({ galleryId }: { galleryId: string }) {
  const [state, action, pending] = useActionState<GalleryEmailState, FormData>(
    () => emailGalleryLink(galleryId),
    {}
  );
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <button type="submit" disabled={pending} className="btn-secondary">
        {pending ? "Sending…" : "Email client"}
      </button>
      {state.ok ? <span className="text-xs text-success">Sent</span> : null}
      {state.error ? <span className="text-xs text-danger">{state.error}</span> : null}
    </form>
  );
}
