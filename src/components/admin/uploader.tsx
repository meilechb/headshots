"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { registerGalleryPhoto, registerPortfolioImage } from "@/app/admin/actions";

type Target =
  | { kind: "gallery"; galleryId: string }
  | { kind: "portfolio"; category: string };

type Item = { name: string; status: "queued" | "uploading" | "done" | "error"; message?: string };

const GALLERY_PREVIEW_MAX = 1600; // px, longest edge, for browsing proofs
const PORTFOLIO_MAX = 2400; // px, what the public site actually needs

/** Decodes an image and, if larger than maxEdge, returns a resized JPEG. */
async function resize(file: File, maxEdge: number, quality = 0.86) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode image"))), "image/jpeg", quality)
  );
  return { blob, width, height };
}

function baseName(name: string) {
  return name.replace(/\.[a-z0-9]+$/i, "").replace(/[^\w.\-]+/g, "_").slice(0, 80);
}

/**
 * Browser → Vercel Blob uploads (token exchange at /api/upload/[store]),
 * then a server action records the file. Galleries get the original plus a
 * web-size preview; the portfolio gets one web-size public image.
 */
export function Uploader({ target }: { target: Target }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setItems(list.map((f) => ({ name: f.name, status: "queued" })));
    setBusy(true);

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      const update = (patch: Partial<Item>) =>
        setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
      update({ status: "uploading" });
      try {
        if (target.kind === "gallery") {
          const prefix = `galleries/${target.galleryId}`;
          const preview = await resize(file, GALLERY_PREVIEW_MAX);
          const [original, web] = await Promise.all([
            upload(`${prefix}/${baseName(file.name)}.${(file.name.split(".").pop() || "jpg").toLowerCase()}`, file, {
              access: "private",
              handleUploadUrl: "/api/upload/galleries",
              contentType: file.type,
            }),
            upload(`${prefix}/${baseName(file.name)}-web.jpg`, preview.blob, {
              access: "private",
              handleUploadUrl: "/api/upload/galleries",
              contentType: "image/jpeg",
            }),
          ]);
          await registerGalleryPhoto(target.galleryId, {
            originalUrl: original.url,
            previewUrl: web.url,
            filename: file.name,
            width: preview.width,
            height: preview.height,
            size: file.size,
          });
        } else {
          const web = await resize(file, PORTFOLIO_MAX, 0.88);
          const result = await upload(`portfolio/${baseName(file.name)}.jpg`, web.blob, {
            access: "public",
            handleUploadUrl: "/api/upload/portfolio",
            contentType: "image/jpeg",
          });
          const scale = Math.min(1, PORTFOLIO_MAX / Math.max(web.width, web.height));
          await registerPortfolioImage({
            url: result.url,
            filename: file.name,
            width: Math.round(web.width * scale),
            height: Math.round(web.height * scale),
            category: target.category,
          });
        }
        update({ status: "done" });
      } catch (err) {
        update({
          status: "error",
          message: err instanceof Error ? err.message : "Upload failed",
        });
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
