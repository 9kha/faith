import { writeFile, mkdir, stat, unlink, readdir, readFile } from "fs/promises";
import { join } from "path";

const BLOB_PREFIX = "faith_venture_realty/uploads";
const UPLOAD_DIR = join(process.cwd(), "uploads");
const PUBLIC_UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export async function ensureUploadDir(): Promise<void> {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch {
    // directory may already exist
  }
  try {
    await mkdir(PUBLIC_UPLOAD_DIR, { recursive: true });
  } catch {
    // directory may already exist
  }
}

export interface UploadResult {
  url: string;
  path: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
}

function shouldUseBlob(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN &&
    process.env.STORAGE_DRIVER !== "local"
  );
}

export async function storeFile(
  buffer: Buffer,
  filename: string,
  mime: string
): Promise<UploadResult> {
  const id = crypto.randomUUID();
  const ext = filename.split(".").pop() || "bin";
  const safeFilename = `${id}.${ext}`;
  const pathname = `${BLOB_PREFIX}/${safeFilename}`;

  // 1. Try Vercel Blob if configured and enabled
  if (shouldUseBlob()) {
    try {
      const { put } = await import("@vercel/blob");
      const { url } = await put(pathname, buffer, {
        access: "public",
        contentType: mime,
        addRandomSuffix: false,
      });

      return {
        url,
        path: pathname,
        mime,
        size: buffer.length,
      };
    } catch (blobErr) {
      console.warn("Vercel Blob put failed, falling back to local disk storage:", blobErr);
    }
  }

  // 2. Local filesystem storage (bulletproof fallback)
  await ensureUploadDir();
  const filePath = join(UPLOAD_DIR, safeFilename);
  const publicFilePath = join(PUBLIC_UPLOAD_DIR, safeFilename);

  await writeFile(filePath, buffer);
  try {
    await writeFile(publicFilePath, buffer);
  } catch {
    // If public directory write fails, filePath in UPLOAD_DIR is still intact
  }

  const url = `/uploads/${safeFilename}`;

  return {
    url,
    path: filePath,
    mime,
    size: buffer.length,
  };
}

export async function deleteFile(pathnameOrUrl: string): Promise<void> {
  const filename = pathnameOrUrl.split("/").pop() || "";
  if (!filename) return;

  if (shouldUseBlob()) {
    try {
      const { del } = await import("@vercel/blob");
      await del(pathnameOrUrl);
    } catch {
      // ignore
    }
  }

  try {
    await unlink(join(UPLOAD_DIR, filename));
  } catch {
    // ignore
  }
  try {
    await unlink(join(PUBLIC_UPLOAD_DIR, filename));
  } catch {
    // ignore
  }
}

export async function listUploadDir(): Promise<string[]> {
  if (shouldUseBlob()) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: `${BLOB_PREFIX}/` });
      return blobs.map((b) => b.pathname);
    } catch {
      // fallback to local
    }
  }

  await ensureUploadDir();
  try {
    return await readdir(UPLOAD_DIR);
  } catch {
    return [];
  }
}

export function getFileUrl(pathname: string): string {
  const clean = pathname.split("/").pop() ?? pathname;
  return `/uploads/${clean}`;
}
