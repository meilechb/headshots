import { json, withApi } from "@/lib/lr";
import { site } from "@/lib/site";

/** GET /api/lr/ping — used by the plugin's "Test connection" button. */
export const GET = withApi(async () => {
  return json({ ok: true, studio: site.legalName, site: site.url, api: 1 });
});
