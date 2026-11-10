import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { ensureUploadDir, storeFile } from "./storage";

const BLOB_PREFIX = "faith_venture_realty/uploads";
const UPLOAD_DIR = join(process.cwd(), "uploads");
const PUBLIC_UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export interface ImageSizes {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
}

export interface ProcessedImage {
  original: string;
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  width: number;
  height: number;
  mime: string;
  size: number;
}

const SIZES = {
  thumbnail: { width: 300, height: 300, fit: "cover" as const },
  small: { width: 600, height: 400, fit: "inside" as const },
  medium: { width: 1000, height: 750, fit: "inside" as const },
  large: { width: 1600, height: 1200, fit: "inside" as const },
};

function shouldUseBlob(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN &&
    process.env.STORAGE_DRIVER !== "local"
  );
}

async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  mime: string
): Promise<string> {
  const ext = filename.split(".").pop() || "bin";
  const safeFilename = filename;
  const pathname = `${BLOB_PREFIX}/${safeFilename}`;

  if (shouldUseBlob()) {
    try {
      const { put } = await import("@vercel/blob");
      const { url } = await put(pathname, buffer, {
        access: "public",
        contentType: mime,
        addRandomSuffix: false,
      });
      return url;
    } catch (blobErr) {
      console.warn("Vercel Blob image upload failed, falling back to local disk storage:", blobErr);
    }
  }

  // Local filesystem fallback
  await ensureUploadDir();
  const filePath = join(UPLOAD_DIR, safeFilename);
  const publicFilePath = join(PUBLIC_UPLOAD_DIR, safeFilename);

  await writeFile(filePath, buffer);
  try {
    await writeFile(publicFilePath, buffer);
  } catch {
    // ignore
  }

  return `/uploads/${safeFilename}`;
}

export async function processImage(
  buffer: Buffer,
  filename: string
): Promise<ProcessedImage> {
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const isImage = ["jpg", "jpeg", "png", "webp", "avif", "tiff", "gif", "svg"].includes(ext);

  if (!isImage) {
    throw new Error("Unsupported image format");
  }

  const id = crypto.randomUUID();
  const baseFilename = `${id}`;

  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error("Could not read image dimensions");
    }

    const originalFilename = `${baseFilename}-original.${ext}`;
    const originalBuffer = await sharp(buffer).toBuffer();
    const originalMime = `image/${ext === "jpg" ? "jpeg" : ext}`;
    const originalUrl = await uploadBuffer(
      originalBuffer,
      originalFilename,
      originalMime
    );

    const sizes: Record<string, string> = {};

    for (const [name, config] of Object.entries(SIZES)) {
      const outFilename = `${baseFilename}-${name}.webp`;
      const outBuffer = await sharp(buffer)
        .resize(config.width, config.height, {
          fit: config.fit,
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
      sizes[name] = await uploadBuffer(outBuffer, outFilename, "image/webp");
    }

    return {
      original: originalUrl,
      thumbnail: sizes.thumbnail,
      small: sizes.small,
      medium: sizes.medium,
      large: sizes.large,
      width: metadata.width,
      height: metadata.height,
      mime: originalMime,
      size: buffer.length,
    };
  } catch (sharpError) {
    console.warn("Sharp image processing failed or skipped, storing original raw file:", sharpError);
    // Fall back to storing original file directly
    const stored = await storeFile(buffer, filename, `image/${ext === "jpg" ? "jpeg" : ext}`);
    return {
      original: stored.url,
      thumbnail: stored.url,
      small: stored.url,
      medium: stored.url,
      large: stored.url,
      width: 800,
      height: 600,
      mime: stored.mime,
      size: stored.size,
    };
  }
}

export async function generateBlurPlaceholder(buffer: Buffer): Promise<string> {
  const { data } = await sharp(buffer)
    .resize(20, 20, { fit: "cover" })
    .blur(10)
    .toFormat("webp")
    .toBuffer({ resolveWithObject: true });

  return `data:image/webp;base64,${data.toString("base64")}`;
}

export function isImageFile(mime: string, filename?: string): boolean {
  if (filename) {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (["dwg", "dxf", "gltf", "glb", "obj", "stl", "ifc", "zip", "pdf"].includes(ext)) {
      return false;
    }
  }
  if (
    mime === "image/vnd.dwg" ||
    mime === "image/x-dwg" ||
    mime === "image/vnd.dxf" ||
    mime === "image/x-dxf"
  ) {
    return false;
  }
  return (
    ["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff", "image/gif"].includes(mime) ||
    (mime.startsWith("image/") && !mime.includes("dwg") && !mime.includes("dxf"))
  );
}

export function isVideoFile(mime: string): boolean {
  return mime.startsWith("video/");
}

export function isPdfFile(mime: string): boolean {
  return mime === "application/pdf";
}
