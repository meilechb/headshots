"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { GA_MEASUREMENT_ID, isTrackedPath } from "@/lib/analytics";

/**
 * Loads the Google tag (gtag.js) for GA4 on public pages. Rendered once in the
 * root layout; returns nothing when NEXT_PUBLIC_GA_MEASUREMENT_ID is unset or on
 * /admin and /login. Because client-side navigation keeps an already loaded tag
 * alive, the documented `ga-disable-<id>` flag also mutes it on those routes.
 * Page views on route changes come from GA4 enhanced measurement (history changes).
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const tracked = isTrackedPath(pathname);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = !tracked;
  }, [tracked]);

  if (!GA_MEASUREMENT_ID || !tracked) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
