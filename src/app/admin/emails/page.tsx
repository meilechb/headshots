import { listEmailLog } from "@/lib/data/admin";
import { getEmailTemplateOverrides } from "@/lib/data/settings";
import { emailConfigured, emailKindLabels, fromAddress, notifyAddress, type EmailKind } from "@/lib/email";
import { emailTemplates, resolveValues } from "@/lib/email-templates";
import { formatDate } from "@/components/admin/badges";
import { EmailTemplateEditor } from "@/components/admin/email-template-editor";
import { ActionForm } from "@/components/admin/form";
import { sendTestEmail } from "../actions";

const statusTone = {
  sent: "border-success/50 text-success",
  failed: "border-danger/50 text-danger",
  skipped: "border-line text-muted",
} as const;

export default async function EmailsPage() {
  const [log, overrides] = await Promise.all([listEmailLog(), getEmailTemplateOverrides()]);
  const connected = emailConfigured();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Emails</h1>
        {connected ? (
          <ActionForm
            action={sendTestEmail}
            className="flex items-center"
            submitLabel="Send test email"
            pendingLabel="Sending…"
            successMessage={`Sent to ${notifyAddress()}`}
            buttonClassName="btn-secondary"
          >
            <span className="sr-only">Sends a test email to {notifyAddress()}</span>
          </ActionForm>
        ) : null}
      </div>

      <div className="card p-4 text-sm">
        {connected ? (
          <p>
            Connected. Sending as <span className="font-medium">{fromAddress()}</span>. New inquiries go to{" "}
            <span className="font-medium">{notifyAddress()}</span>.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="font-medium">Not connected. Clients get mailto links until it is.</p>
            <ol className="list-decimal space-y-1 pl-5 text-ink-2">
              <li>Create a free account at resend.com and add the domain meilechbiller.com. Add the DNS records it shows.</li>
              <li>Create an API key. In Vercel, set RESEND_API_KEY to it.</li>
              <li>Set EMAIL_FROM to Meilech Biller &lt;hello@meilechbiller.com&gt;. Redeploy.</li>
            </ol>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h2 className="font-display text-2xl">Templates</h2>
        <p className="text-sm text-ink-2">
          Every email the site sends. Edit the wording and save; the preview shows the email with sample details.
          Words in double braces are filled in when the email goes out.
        </p>
      </div>

      {emailTemplates.map((t) => {
        const values = resolveValues(t, overrides[t.key]);
        return (
          <EmailTemplateEditor
            key={t.key}
            template={t}
            values={values}
            customized={Boolean(overrides[t.key])}
            connected={connected}
          />
        );
      })}

      <details className="card">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          Sent log <span className="font-normal text-muted">({log.length})</span>
        </summary>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {log.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-muted">Nothing sent yet.</td>
                </tr>
              ) : (
                log.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(e.created_at, true)}</td>
                    <td className="px-4 py-3">{e.to_address}</td>
                    <td className="px-4 py-3">{e.subject}</td>
                    <td className="px-4 py-3 text-muted">{e.kind ? emailKindLabels[e.kind as EmailKind] ?? e.kind : ""}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusTone[e.status]}`} title={e.error ?? undefined}>
                        {e.status === "skipped" ? "Not connected" : e.status === "sent" ? "Sent" : "Failed"}
                      </span>
                      {e.status === "failed" && e.error ? <p className="mt-1 text-xs text-muted">{e.error}</p> : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
