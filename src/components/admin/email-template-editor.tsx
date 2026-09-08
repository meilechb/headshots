"use client";

import { useActionState, useMemo, useState } from "react";
import { resetEmailTemplate, saveEmailTemplate, sendTemplatePreview } from "@/app/admin/actions";
import type { ActionState } from "@/lib/action-state";
import { emailLayout } from "@/lib/email-layout";
import {
  globalVariables,
  renderValues,
  type EmailTemplateDef,
  type TemplateValues,
} from "@/lib/email-templates";
import { Field, FormNote, SubmitButton } from "./form";
import { Icon } from "./icons";

/**
 * One email template: the wording on the left, the email as it will look on
 * the right. The preview follows every keystroke; Save stores the wording.
 */
export function EmailTemplateEditor({
  template,
  values,
  customized,
  connected,
}: {
  template: EmailTemplateDef;
  /** Current wording: the studio's edits, or the defaults. */
  values: TemplateValues;
  customized: boolean;
  connected: boolean;
}) {
  const [subject, setSubject] = useState(values.subject);
  const [body, setBody] = useState(values.body);
  const [ctaLabel, setCtaLabel] = useState(values.cta_label ?? "");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveEmailTemplate.bind(null, template.key),
    {}
  );

  // After a save or reset the server sends the stored wording; adopt it so the
  // fields match what will actually be sent.
  const [seen, setSeen] = useState(values);
  if (seen.subject !== values.subject || seen.body !== values.body || seen.cta_label !== values.cta_label) {
    setSeen(values);
    setSubject(values.subject);
    setBody(values.body);
    setCtaLabel(values.cta_label ?? "");
  }

  const preview = useMemo(() => {
    const rendered = renderValues(
      template,
      { subject, body, cta_label: ctaLabel },
      template.sample,
      template.sampleCtaUrl
    );
    return { subject: rendered.subject, html: emailLayout(rendered.text, rendered.cta) };
  }, [template, subject, body, ctaLabel]);

  const id = (field: string) => `tpl-${template.key}-${field}`;
  const variables = [...template.variables, ...globalVariables];

  return (
    <section className="card p-5 sm:p-6" aria-labelledby={id("title")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={id("title")} className="flex items-center gap-2 text-lg font-medium">
            {template.name}
            {customized ? <span className="badge border-brass-2/60 text-brass-2">Edited</span> : null}
          </h2>
          <p className="mt-1 text-sm text-ink-2">
            {template.when} Goes to {template.to}.
          </p>
        </div>
        <SendPreviewButton templateKey={template.key} connected={connected} />
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <form action={formAction} className="space-y-4">
          <Field label="Subject" htmlFor={id("subject")}>
            <input
              id={id("subject")}
              name="subject"
              required
              maxLength={200}
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Field>
          <Field label="Text" htmlFor={id("body")} hint="blank line = new paragraph">
            <textarea
              id={id("body")}
              name="body"
              required
              rows={template.key === "agreement" ? 12 : 9}
              className="input min-h-40 font-mono text-[13px] leading-relaxed"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </Field>
          {template.hasCta ? (
            <Field label="Button label" htmlFor={id("cta")}>
              <input
                id={id("cta")}
                name="cta_label"
                maxLength={60}
                className="input"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
              />
            </Field>
          ) : null}

          <div>
            <p className="label">Fill-ins you can use</p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <li key={v.name}>
                  <code
                    className="badge border-line font-mono text-[11px] text-ink-2"
                    title={v.description}
                  >{`{{${v.name}}}`}</code>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
            {customized ? (
              <button
                type="submit"
                formAction={() => resetEmailTemplate(template.key)}
                className="btn-ghost"
                onClick={(e) => {
                  if (!window.confirm("Go back to the original wording? Your edits will be removed.")) e.preventDefault();
                }}
              >
                <Icon name="undo" />
                Reset to original
              </button>
            ) : null}
            <FormNote state={state} pending={pending} successMessage="Saved" />
          </div>
        </form>

        <div className="min-w-0">
          <p className="label">Preview</p>
          <p className="mt-1 truncate text-sm">
            <span className="text-muted">Subject: </span>
            {preview.subject}
          </p>
          <iframe
            title={`${template.name} preview`}
            sandbox=""
            srcDoc={preview.html}
            className="mt-2 h-[520px] w-full rounded-xl border border-line bg-[#f5f5f4]"
          />
        </div>
      </div>
    </section>
  );
}

function SendPreviewButton({ templateKey, connected }: { templateKey: EmailTemplateDef["key"]; connected: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(() => sendTemplatePreview(templateKey), {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <button
        type="submit"
        disabled={pending || !connected}
        className="btn-secondary"
        title={connected ? "Emails you this template with sample details" : "Connect email first"}
      >
        <Icon name="mail" />
        {pending ? "Sending…" : "Send me a test"}
      </button>
      {state.ok ? <span className="text-xs text-success">Sent</span> : null}
      {state.error ? <span className="text-xs text-danger">{state.error}</span> : null}
    </form>
  );
}
