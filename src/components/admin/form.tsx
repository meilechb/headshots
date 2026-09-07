"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/action-state";

type StatefulAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * A form bound to a server action that returns ActionState. Shows a pending
 * label while saving, an inline error when it fails, and a short "Saved"
 * note when it succeeds. Redirecting actions never resolve here.
 */
export function ActionForm({
  action,
  children,
  className = "space-y-4",
  submitLabel = "Save",
  pendingLabel = "Saving…",
  successMessage = "Saved",
  buttonClassName = "btn-primary",
  extra,
  resetOnSuccess = false,
}: {
  action: StatefulAction;
  children: ReactNode;
  className?: string;
  submitLabel?: string;
  pendingLabel?: string;
  successMessage?: string;
  buttonClassName?: string;
  /** Rendered next to the submit button (for example a Delete button). */
  extra?: ReactNode;
  /** Clear the fields after a successful save (for "add" forms). */
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, {});
  const formKey = resetOnSuccess ? state.at ?? 0 : 0;

  return (
    <form key={formKey} action={formAction} className={className}>
      {children}
      <div className="col-span-full flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClassName}>
          {pending ? pendingLabel : submitLabel}
        </button>
        {extra}
        <FormNote state={state} pending={pending} successMessage={successMessage} />
      </div>
    </form>
  );
}

function FormNote({
  state,
  pending,
  successMessage,
}: {
  state: ActionState;
  pending: boolean;
  successMessage: string;
}) {
  if (pending) return null;
  if (state.error) {
    return (
      <p role="alert" className="text-sm text-danger">
        {state.error}
      </p>
    );
  }
  if (state.ok && state.at) {
    // Keyed on the save time so every save shows the note again.
    return <SavedNote key={state.at} message={successMessage} />;
  }
  return null;
}

function SavedNote({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <p role="status" className="text-sm text-success">
      {message}
    </p>
  );
}

/** Submit button for plain `<form action={serverAction}>` forms: disables and relabels while pending. */
export function SubmitButton({
  children,
  pendingLabel = "Working…",
  className = "btn-primary",
  disabled,
  title,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={disabled || pending} className={className} title={title}>
      {pending ? pendingLabel : children}
    </button>
  );
}

/** A button that reveals a panel below the row it sits in (for "Add client", "Settings"). */
export function Disclosure({
  label,
  openLabel = "Cancel",
  className = "btn-primary",
  openClassName = "btn-ghost",
  children,
}: {
  label: ReactNode;
  openLabel?: ReactNode;
  className?: string;
  openClassName?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen((v) => !v)} className={open ? openClassName : className} aria-expanded={open}>
        {open ? openLabel : label}
      </button>
      {open ? <div className="order-last basis-full">{children}</div> : null}
    </>
  );
}

/** Label + control wrapper so every form lays out the same way. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
        {hint ? <span className="ml-1 font-normal normal-case tracking-normal text-muted">({hint})</span> : null}
      </label>
      {children}
    </div>
  );
}
