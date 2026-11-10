import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

const BLOB_PREFIX = "faith_venture_realty/uploads";
const UPLOAD_DIR = join(process.cwd(), "uploads");
const PUBLIC_UPLOAD_DIR = join(process.cwd(), "public", "uploads");

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
  dwg: "application/octet-stream",
  dxf: "text/plain",
  gltf: "model/gltf+json",
  glb: "model/gltf-binary",
  obj: "text/plain",
  stl: "model/stl",
  zip: "application/zip",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
): Promise<NextResponse> {
  try {
    const { filename } = await params;
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");

    // 1. Try reading from public/uploads or uploads/ locally
    const candidatePaths = [
      join(PUBLIC_UPLOAD_DIR, safeFilename),
      join(UPLOAD_DIR, safeFilename),
    ];

    for (const filePath of candidatePaths) {
      try {
        await stat(filePath);
        const buffer = await readFile(filePath);
        const ext = safeFilename.split(".").pop()?.toLowerCase() || "";
        const mime = MIME_MAP[ext] || "application/octet-stream";

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": mime,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {
        // file doesn't exist at this local path, continue
      }
    }

    // 2. Fall back to Vercel Blob redirect if configured
    const baseUrl = process.env.BLOB_PUBLIC_BASE_URL;
    if (baseUrl) {
      const blobUrl = `${baseUrl.replace(/\/$/, "")}/${BLOB_PREFIX}/${safeFilename}`;
      return NextResponse.redirect(blobUrl, 302);
    }

    return NextResponse.json({ error: "File not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
