"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { registerGalleryPhoto, registerPortfolioImage } from "@/app/admin/actions";

type Target =
  | { kind: "gallery"; galleryId: string }
  | { kind: "portfolio"; category: string };

type Item = { name: string; status: "queued" | "uploading" | "done" | "error"; message?: string };

async function readDimensions(file: File) {
  try {
    const bmp = await createImageBitmap(file);
    const dims = { width: bmp.width, height: bmp.height };
    bmp.close();
    return dims;
  } catch {
    return { width: null, height: null };
  }
}

/**
 * Uploads straight from the browser to Supabase Storage using the admin's
 * session (RLS: admins may write to both buckets), then records each file in
 * the database through a server action.
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

    const supabase = createClient();
    const bucket = target.kind === "gallery" ? "galleries" : "portfolio";
    const prefix = target.kind === "gallery" ? `${target.galleryId}/` : "";

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      const update = (patch: Partial<Item>) =>
        setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
      update({ status: "uploading" });
      try {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${prefix}${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, {
          contentType: file.type,
          upsert: false,
          cacheControl: "31536000",
        });
        if (error) throw error;

        const dims = await readDimensions(file);
        const meta = { path, filename: file.name, size: file.size, ...dims };
        if (target.kind === "gallery") {
          await registerGalleryPhoto(target.galleryId, meta);
        } else {
          await registerPortfolioImage({ ...meta, category: target.category });
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
          Files upload directly to storage. Large exports are fine.
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
