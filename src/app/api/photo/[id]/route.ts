import { type NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPhotoForDelivery, isGalleryExpired } from "@/lib/data/galleries";
import { hasGalleryAccess } from "@/lib/gallery-access";
import { UUID_RE } from "@/lib/db";
import { getPrivateBlob } from "@/lib/storage";

/**
 * Streams a private gallery photo after checking access.
 *   ?v=web   (default) web-size preview for browsing
 *   ?v=full  original file; requires downloads enabled on the gallery
 *   &download=1  sets Content-Disposition: attachment
 * Auth is checked here, right next to the blob fetch, as Vercel recommends;
 * the proxy is not involved.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return new NextResponse("Not found", { status: 404 });

  const photo = await getPhotoForDelivery(id);
  if (!photo) return new NextResponse("Not found", { status: 404 });

  const admin = await getCurrentUser();
  const clientAllowed =
    photo.gallery.status === "published" &&
    !isGalleryExpired(photo.gallery) &&
    (await hasGalleryAccess(photo.gallery.id));

  if (!admin && !clientAllowed) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const variant = request.nextUrl.searchParams.get("v") === "full" ? "full" : "web";
  if (variant === "full" && !admin && !photo.gallery.allow_downloads) {
    return new NextResponse("Downloads are not enabled for this gallery", { status: 403 });
  }

  const result = await getPrivateBlob(
    variant === "full" ? photo.original_url : photo.preview_url,
    request.headers.get("if-none-match") ?? undefined
  );
  if (!result) return new NextResponse("Not found", { status: 404 });

  const headers = new Headers({
    ETag: result.blob.etag,
    "Cache-Control": "private, no-cache",
    "X-Content-Type-Options": "nosniff",
  });

  if (result.statusCode === 304) {
    return new NextResponse(null, { status: 304, headers });
  }

  headers.set("Content-Type", result.blob.contentType);
  if (request.nextUrl.searchParams.get("download") === "1") {
    const safe = photo.filename.replace(/[^\w.\-]+/g, "_");
    headers.set("Content-Disposition", `attachment; filename="${safe}"`);
  }
  return new NextResponse(result.stream, { headers });
}
