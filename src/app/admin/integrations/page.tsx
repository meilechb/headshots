import Link from "next/link";
import { db, rows } from "@/lib/db";
import { site } from "@/lib/site";
import type { ApiToken } from "@/lib/types";
import { ConfirmSubmit } from "@/components/admin/ui";
import { revokeApiToken } from "../actions";
import { TokenForm } from "./token-form";

export default async function IntegrationsPage() {
  const tokens = rows<ApiToken>(
    await db()`select id, name, token_prefix, last_used_at, created_at from api_tokens order by created_at desc`
  );

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="eyebrow">Integrations</p>
        <h1 className="mt-2 font-display text-3xl">Lightroom Classic</h1>
        <p className="mt-2 text-sm text-muted">
          Publish proofs and finals straight from Lightroom. Client notes and favorites flow back into
          Lightroom’s Comments panel, and favorites are tagged with a keyword so you can filter to them.
        </p>
      </div>

      <section className="card p-5">
        <h2 className="font-medium">1. Install the plugin</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
          <li>
            <a href="/downloads/meilechbiller-lightroom.zip" className="underline">Download the plugin</a> and unzip it.
            Keep the <code>meilechbiller.lrplugin</code> folder somewhere permanent (e.g. Documents/Lightroom Plugins).
          </li>
          <li>In Lightroom Classic: <strong>File → Plug-in Manager → Add</strong>, choose that folder.</li>
          <li>
            Then <strong>File → Publishing Manager… → Add</strong>, pick <strong>Meilech Biller Galleries</strong>, enter
            <code className="mx-1">{site.url}</code> and a token from below, click <strong>Test connection</strong>, then <strong>Save</strong>.
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="font-medium">2. API tokens</h2>
        <TokenForm />
        {tokens.length ? (
          <ul className="card divide-y divide-line">
            {tokens.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted">
                    <code>{t.token_prefix}…</code> · created{" "}
                    {new Date(t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {t.last_used_at
                      ? ` · last used ${new Date(t.last_used_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
                      : " · never used"}
                  </p>
                </div>
                <form action={revokeApiToken.bind(null, t.id)}>
                  <ConfirmSubmit className="btn-danger px-3 py-1.5 text-xs" message={`Revoke “${t.name}”? Lightroom will stop being able to publish until you enter a new token.`}>
                    Revoke
                  </ConfirmSubmit>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">No tokens yet.</p>
        )}
      </section>

      <section className="card p-5 text-sm">
        <h2 className="font-medium">3. How it works in Lightroom</h2>
        <ul className="mt-3 space-y-2 text-ink-2">
          <li><strong>One published collection = one gallery.</strong> Right-click the service → Create Published Collection, pick the client (or type a new one), choose Proofs or Finals.</li>
          <li><strong>Publish</strong> uploads full-size JPEGs; the site makes web previews. The gallery is created as a draft with its link and access code; publish it from <Link className="underline" href="/admin/galleries">Galleries</Link> or it goes live automatically when the collection setting “Make the gallery visible to the client as soon as photos are published” is on.</li>
          <li><strong>Edited photos</strong> show as “Modified Photos to Re-Publish”; re-publishing replaces the file and keeps the client’s notes.</li>
          <li><strong>Notes and favorites</strong> appear in the Library’s Comments panel for the selected photo. Favorites get the keyword “Client Favorite” so you can filter and retouch them.</li>
          <li><strong>Removing a photo</strong> from the collection deletes it from the gallery. Deleting the collection archives the gallery.</li>
        </ul>
      </section>
    </div>
  );
}
