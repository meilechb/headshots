"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { finalizeGalleryPhoto, finalizeHeroImage, finalizePortfolioImage } from "@/app/admin/actions";

type Target =
  | { kind: "gallery"; galleryId: string }
  | { kind: "portfolio" }
  | { kind: "hero" };

type Item = { name: string; status: "queued" | "uploading" | "processing" | "done" | "error"; message?: string };

function baseName(name: string) {
  return name.replace(/\.[a-z0-9]+$/i, "").replace(/[^\w.\-]+/g, "_").slice(0, 80) || "photo";
}

function extOf(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

/**
 * The upload library hides the server's reason when the token request fails.
 * Repeat that request and report what the server actually said.
 */
async function explainTokenFailure(handleUploadUrl: string, file: File) {
  try {
    const res = await fetch(handleUploadUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "blob.generate-client-token",
        payload: { pathname: `probe/${baseName(file.name)}.${extOf(file)}`, clientPayload: null, multipart: false },
      }),
    });
    const text = await res.text();
    let detail = text.slice(0, 300);
    try {
      const parsed = JSON.parse(text) as { error?: string; clientToken?: string };
      if (parsed.error) detail = parsed.error;
      else if (parsed.clientToken) detail = "the server issued a token on retry; try the upload again";
    } catch {
      /* not JSON: keep raw text */
    }
    if (/Not authenticated/i.test(detail)) return "Your admin session has expired. Sign in again and retry.";
    return `Upload token request failed (HTTP ${res.status}): ${detail}`;
  } catch (e) {
    return `Upload token request failed: ${e instanceof Error ? e.message : String(e)}`;
  }
}

/**
 * Browser → Vercel Blob upload of the original file (token exchange at
 * /api/upload/[store]), then the server makes the web-size version and
 * records it. No image decoding happens in the browser, so any size works.
 */
export function Uploader({ target }: { target: Target }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    // The header image is a single picture; take the first file only.
    const list = target.kind === "hero" ? Array.from(files).slice(0, 1) : Array.from(files);
    setItems(list.map((f) => ({ name: f.name, status: "queued" })));
    setBusy(true);

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      const update = (patch: Partial<Item>) =>
        setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        update({ status: "error", message: "Only JPEG, PNG or WebP files can be uploaded." });
        continue;
      }

      update({ status: "uploading" });
      try {
        const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        if (target.kind === "gallery") {
          const blob = await upload(
            `galleries/${target.galleryId}/${baseName(file.name)}-${stamp}.${extOf(file)}`,
            file,
            { access: "private", handleUploadUrl: "/api/upload/galleries", contentType: file.type }
          );
          update({ status: "processing" });
          await finalizeGalleryPhoto(target.galleryId, { url: blob.url, filename: file.name, size: file.size });
        } else {
          const blob = await upload(
            `portfolio/incoming/${target.kind === "hero" ? "hero-" : ""}${baseName(file.name)}-${stamp}.${extOf(file)}`,
            file,
            { access: "public", handleUploadUrl: "/api/upload/portfolio", contentType: file.type }
          );
          update({ status: "processing" });
          if (target.kind === "hero") {
            await finalizeHeroImage({ url: blob.url, filename: file.name, size: file.size });
          } else {
            await finalizePortfolioImage({ url: blob.url, filename: file.name, size: file.size });
          }
        }
        update({ status: "done" });
      } catch (err) {
        let message = err instanceof Error ? err.message : "Upload failed";
        if (/retrieve the client token/i.test(message)) {
          message = await explainTokenFailure(
            target.kind === "gallery" ? "/api/upload/galleries" : "/api/upload/portfolio",
            file
          );
        }
        update({ status: "error", message });
      }
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="card p-5">
      <label
        htmlFor={`uploader-${target.kind}`}
        className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-line bg-paper-3/40 px-6 py-10 text-center transition hover:border-ink/40 hover:bg-paper-2/40"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <span className="text-sm font-medium">
          {busy ? "Uploading…" : target.kind === "hero" ? "Drop one photo here or click to choose" : "Drop photos here or click to choose"}
        </span>
        <input
          ref={inputRef}
          id={`uploader-${target.kind}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={target.kind !== "hero"}
          disabled={busy}
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />
      </label>

      {items.length ? (
        <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto text-xs">
          {items.map((it, i) => (
            <li key={`${it.name}-${i}`} className="flex items-center justify-between gap-3">
              <span className="truncate">{it.name}</span>
              <span
                className={
                  it.status === "done"
                    ? "text-success"
                    : it.status === "error"
                      ? "text-danger"
                      : "text-muted"
                }
              >
                {it.status === "error" ? it.message : it.status}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
