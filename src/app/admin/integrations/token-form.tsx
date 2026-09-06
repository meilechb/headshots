"use client";

import { useActionState } from "react";
import { createApiToken, type TokenState } from "@/app/admin/actions";
import { CopyButton } from "@/components/admin/ui";

export function TokenForm() {
  const [state, action, pending] = useActionState<TokenState, FormData>(createApiToken, {});

  if (state.token) {
    return (
      <div className="card space-y-3 p-5">
        <p className="eyebrow">New token · {state.name}</p>
        <p className="text-sm">
          Copy this now. It is shown once and stored only as a hash.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 break-all border border-line bg-paper-2 px-3 py-2 text-xs">{state.token}</code>
          <CopyButton value={state.token} />
        </div>
        <p className="text-xs text-muted">
          In Lightroom: Publishing Manager → Meilech Biller Galleries → paste into “API token”.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card flex flex-wrap items-end gap-3 p-5">
      <div className="flex-1 min-w-48">
        <label htmlFor="token-name" className="label">Token name</label>
        <input id="token-name" name="name" defaultValue="Lightroom on my Mac" className="input" />
      </div>
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Creating…" : "Create token"}
      </button>
    </form>
  );
}
