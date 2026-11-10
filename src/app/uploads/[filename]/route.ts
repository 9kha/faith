import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BLOB_PREFIX = "faith_venture_realty/uploads";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
): Promise<NextResponse> {
  try {
    const { filename } = await params;
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");

    const baseUrl = process.env.BLOB_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Blob storage URL is not configured. Set BLOB_PUBLIC_BASE_URL." },
        { status: 410 }
      );
    }

    const blobUrl = `${baseUrl.replace(/\/$/, "")}/${BLOB_PREFIX}/${safeFilename}`;

    return NextResponse.redirect(blobUrl, 302);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
