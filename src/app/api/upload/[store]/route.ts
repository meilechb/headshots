import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { blobToken, type Store } from "@/lib/storage";

/**
 * Token exchange for browser uploads (Vercel Blob client uploads). Files go
 * straight from the admin's browser to the store; this route only authorizes
 * and constrains them. Registration in the database happens from the client
 * after upload() resolves (see components/admin/uploader.tsx).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ store: string }> }
) {
  const { store } = await params;
  if (store !== "galleries" && store !== "portfolio") {
    return NextResponse.json({ error: "Unknown store" }, { status: 404 });
  }
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      token: blobToken(store as Store),
      body,
      request,
      onBeforeGenerateToken: async () => {
        const user = await getCurrentUser();
        if (!user) throw new Error("Not authenticated");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 200 * 1024 * 1024,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
          tokenPayload: JSON.stringify({ store, by: user.email }),
        };
      },
      onUploadCompleted: async () => {
        // Intentionally empty: the browser registers the file via a server
        // action once upload() resolves, which also works in local development.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
