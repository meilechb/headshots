"use client";

import Image from "next/image";
import { useState } from "react";
import {
  addAdminComment,
  deletePhoto,
  movePhoto,
  toggleCommentResolved,
} from "@/app/admin/actions";
import type { AdminPhoto } from "@/lib/data/admin";
import { ConfirmSubmit } from "./ui";

export function PhotoManager({ photos }: { photos: AdminPhoto[] }) {
  const [open, setOpen] = useState<string | null>(null);

  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted">
        No photos yet. Upload above; they appear here in delivery order.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((p, i) => {
        const openComments = p.comments.filter((c) => !c.resolved).length;
        const expanded = open === p.id;
        return (
          <div
            key={p.id}
            className={`card overflow-hidden ${expanded ? "col-span-2 sm:col-span-3 lg:col-span-4" : ""}`}
          >
            <div className={expanded ? "grid gap-4 p-4 md:grid-cols-[320px_1fr]" : ""}>
              <div className={`relative bg-paper-2 ${expanded ? "aspect-[4/5] rounded-lg overflow-hidden" : "aspect-[4/5]"}`}>
                {p.url ? (
                  <Image
                    src={p.url}
                    alt={p.filename}
                    fill
                    unoptimized
                    sizes={expanded ? "320px" : "(max-width: 640px) 50vw, 25vw"}
                    className="object-cover"
                  />
                ) : null}
                <div className="absolute left-2 top-2 flex gap-1 text-[11px]">
                  {p.selected ? <span className="rounded bg-brass px-1.5 py-0.5 text-ink">♥ Favorite</span> : null}
                  {openComments ? (
                    <span className="rounded bg-ink px-1.5 py-0.5 text-paper">💬 {openComments}</span>
                  ) : null}
                </div>
              </div>

              <div className={expanded ? "" : "p-2"}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs" title={p.filename}>
                    {i + 1}. {p.filename}
                  </p>
                  <div className="flex shrink-0 gap-0.5">
                    <form action={movePhoto.bind(null, p.id, -1)}>
                      <button type="submit" className="btn-ghost px-1.5 py-0.5 text-xs" aria-label="Move earlier" disabled={i === 0}>↑</button>
                    </form>
                    <form action={movePhoto.bind(null, p.id, 1)}>
                      <button type="submit" className="btn-ghost px-1.5 py-0.5 text-xs" aria-label="Move later" disabled={i === photos.length - 1}>↓</button>
                    </form>
                    <button
                      type="button"
                      onClick={() => setOpen(expanded ? null : p.id)}
                      className="btn-ghost px-1.5 py-0.5 text-xs"
                    >
                      {expanded ? "Close" : "Notes"}
                    </button>
                  </div>
                </div>

                {expanded ? (
                  <div className="mt-3 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Notes</p>
                      {p.comments.length === 0 ? (
                        <p className="mt-2 text-sm text-muted">No notes on this photo.</p>
                      ) : (
                        <ul className="mt-2 space-y-2">
                          {p.comments.map((c) => (
                            <li key={c.id} className={`rounded-lg p-3 text-sm ${c.author_role === "admin" ? "bg-ink/5" : "bg-brass/10"}`}>
                              <div className="flex items-center justify-between text-xs text-muted">
                                <span>
                                  {c.author_role === "admin" ? "You" : c.author_name} ·{" "}
                                  {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                                {c.author_role === "client" ? (
                                  <form action={toggleCommentResolved.bind(null, c.id, !c.resolved)}>
                                    <button type="submit" className="underline hover:text-ink">
                                      {c.resolved ? "Reopen" : "Resolve"}
                                    </button>
                                  </form>
                                ) : null}
                              </div>
                              <p className={`mt-1 whitespace-pre-line ${c.resolved ? "text-muted line-through" : ""}`}>{c.body}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <form action={addAdminComment.bind(null, p.id)} className="flex gap-2">
                      <input name="body" required placeholder="Reply to the client…" className="input" />
                      <button type="submit" className="btn-primary px-4 py-2">Send</button>
                    </form>
                    <form action={deletePhoto.bind(null, p.id)}>
                      <ConfirmSubmit className="btn-danger px-3 py-1.5 text-xs" message={`Delete ${p.filename}? The file is removed from storage.`}>
                        Delete photo
                      </ConfirmSubmit>
                    </form>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
