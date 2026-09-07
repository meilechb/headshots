"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "./icons";

export const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/galleries", label: "Galleries" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/integrations", label: "Lightroom" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav
      className="-mx-3 flex gap-0.5 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-col md:overflow-visible md:px-0"
      aria-label="Admin"
    >
      {adminNav.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
              active ? "bg-ink text-paper" : "text-ink-2 hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function CopyButton({
  value,
  label = "Copy",
  className = "btn-ghost",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard unavailable (insecure context); user can select the text.
        }
      }}
      className={`${className} shrink-0`}
    >
      <Icon name={copied ? "check" : "copy"} />
      {copied ? "Copied" : label}
    </button>
  );
}

/**
 * Submit button that asks for confirmation first. Pass `formAction` to run a
 * different server action than the surrounding form's default.
 */
export function ConfirmSubmit({
  children,
  message = "Are you sure? This cannot be undone.",
  className = "btn-danger",
  formAction,
}: {
  children: React.ReactNode;
  message?: string;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <button
      type="submit"
      formAction={formAction}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
