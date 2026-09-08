"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { trackEvent, type GaParams } from "@/lib/analytics";

type Props = ComponentProps<typeof Link> & {
  /** GA4 event name sent on click, before navigation. */
  event: string;
  params?: GaParams;
};

/** A next/link that reports a GA4 event when clicked. Use it from server components. */
export function TrackedLink({ event, params, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        trackEvent(event, params);
        onClick?.(e);
      }}
    />
  );
}
