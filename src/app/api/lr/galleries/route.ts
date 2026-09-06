import { db, one, UUID_RE } from "@/lib/db";
import { generateAccessCode } from "@/lib/gallery-access";
import { ApiError, json, loadGallery, readJson, serializeGallery, withApi } from "@/lib/lr";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48);
}

/** POST /api/lr/galleries { client_id, title, kind: 'proof'|'final', welcome_message? } */
export const POST = withApi(async (request) => {
  const body = await readJson<{ client_id?: string; title?: string; kind?: string; welcome_message?: string }>(request);
  const clientId = String(body.client_id ?? "");
  const title = String(body.title ?? "").trim().slice(0, 160);
  const kind = body.kind === "final" ? "final" : "proof";
  if (!UUID_RE.test(clientId)) throw new ApiError("client_id is required");
  if (!title) throw new ApiError("title is required");

  const client = one<{ name: string }>(await db()`select name from clients where id = ${clientId} limit 1`);
  if (!client) throw new ApiError("Client not found", 404);

  const slug = `${slugify(client.name)}-${kind === "proof" ? "proofs" : "finals"}-${generateAccessCode(4).toLowerCase()}`;
  const created = one<{ id: string }>(
    await db()`
      insert into galleries (client_id, title, kind, slug, access_code, allow_downloads, status, welcome_message, source)
      values (${clientId}, ${title}, ${kind}, ${slug}, ${generateAccessCode(6)}, ${kind === "final"}, 'draft',
              ${String(body.welcome_message ?? "").trim() || null}, 'lightroom')
      returning id`
  );
  return json({ gallery: serializeGallery(await loadGallery(created!.id), 0) }, 201);
});
