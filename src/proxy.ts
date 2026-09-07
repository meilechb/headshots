import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "mb_session";

const PRODUCTION_HOSTS = new Set(["meilechbiller.com", "www.meilechbiller.com"]);

function isProductionHost(request: NextRequest) {
  const host = (request.headers.get("host") || "").toLowerCase().split(":")[0];
  return PRODUCTION_HOSTS.has(host);
}

function withPreviewRobots(request: NextRequest, response: NextResponse) {
  if (!isProductionHost(request)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

/**
 * Edge proxy: noindex preview/non-production hosts, and optimistic auth for /admin
 * (Next.js authentication guide). Every page and server action still re-verifies
 * through lib/auth.ts.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const secret = process.env.SESSION_SECRET;
    let ok = false;
    if (token && secret) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
          algorithms: ["HS256"],
        });
        ok = payload.role === "admin";
      } catch {
        ok = false;
      }
    }

    if (!ok) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return withPreviewRobots(request, NextResponse.redirect(url));
    }
    return withPreviewRobots(request, NextResponse.next());
  }

  return withPreviewRobots(request, NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Run on all paths except Next internals and common static assets so
     * preview deployments always send X-Robots-Tag: noindex, nofollow.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
