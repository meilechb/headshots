import { db, one, rows } from "@/lib/db";
import { ApiError, json, readJson, withApi } from "@/lib/lr";
import type { Client } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** GET /api/lr/clients, for the client picker in the collection settings dialog. */
export const GET = withApi(async () => {
  const clients = rows<Client>(await db()`select id, name, email, company from clients order by name asc`);
  return json({ clients: clients.map((c) => ({ id: c.id, name: c.name, email: c.email, company: c.company })) });
});

/** POST /api/lr/clients { name, email, phone?, company? } */
export const POST = withApi(async (request) => {
  const body = await readJson<{ name?: string; email?: string; phone?: string; company?: string }>(request);
  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 200);
  if (!name) throw new ApiError("name is required");
  if (!EMAIL_RE.test(email)) throw new ApiError("email is invalid");

  const existing = one<Client>(await db()`select * from clients where lower(email) = lower(${email}) limit 1`);
  if (existing) return json({ client: existing, created: false });

  const client = one<Client>(
    await db()`
      insert into clients (name, email, phone, company)
      values (${name}, ${email}, ${String(body.phone ?? "").trim() || null}, ${String(body.company ?? "").trim() || null})
      returning *`
  );
  return json({ client, created: true }, 201);
});
