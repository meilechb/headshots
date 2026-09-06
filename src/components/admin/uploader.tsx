"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { finalizeGalleryPhoto, finalizePortfolioImage } from "@/app/admin/actions";

type Target =
  | { kind: "gallery"; galleryId: string }
  | { kind: "portfolio"; category: string };

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
    const list = Array.from(files);
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
            `portfolio/incoming/${baseName(file.name)}-${stamp}.${extOf(file)}`,
            file,
            { access: "public", handleUploadUrl: "/api/upload/portfolio", contentType: file.type }
          );
          update({ status: "processing" });
          await finalizePortfolioImage({ url: blob.url, filename: file.name, size: file.size, category: target.category });
        }
        update({ status: "done" });
      } catch (err) {
        update({ status: "error", message: err instanceof Error ? err.message : "Upload failed" });
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
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line px-6 py-10 text-center transition hover:border-ink/40 hover:bg-paper-2/40"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <span className="text-sm font-medium">
          {busy ? "Uploading…" : "Drop JPG / PNG / WebP files here, or click to choose"}
        </span>
        <span className="mt-1 text-xs text-muted">
          {target.kind === "gallery"
            ? "Originals are kept for download; a web-size copy is made for browsing."
            : "Images are resized to 2400px for the site."}
        </span>
        <input
          ref={inputRef}
          id={`uploader-${target.kind}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
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
                    ? "text-green-700"
                    : it.status === "error"
                      ? "text-red-700"
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
