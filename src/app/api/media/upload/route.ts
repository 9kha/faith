import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storeFile } from "@/lib/storage";
import { processImage, isImageFile } from "@/lib/image";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderId = (formData.get("folderId") as string) || null;
    const alt = (formData.get("alt") as string) || undefined;
    const caption = (formData.get("caption") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";

    // Validate file size (max 50MB for CAD/3D and large assets)
    const maxSize = 50 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 50MB." }, { status: 400 });
    }

    let url: string;
    let width: number | undefined;
    let height: number | undefined;
    let size = buffer.length;

    if (isImageFile(mime, file.name)) {
      const processed = await processImage(buffer, file.name);
      url = processed.medium;
      width = processed.width;
      height = processed.height;
      size = processed.size;
    } else {
      const stored = await storeFile(buffer, file.name, mime);
      url = stored.url;
      size = stored.size;
    }

    const media = await db.media.create({
      data: {
        type: isImageFile(mime, file.name)
          ? "IMAGE"
          : mime.startsWith("video/")
          ? "VIDEO"
          : mime === "application/pdf"
          ? "PDF"
          : "DOCUMENT",
        url,
        path: url,
        mime,
        size,
        width,
        height,
        alt: alt || file.name,
        caption,
        folderId,
      },
    });

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
