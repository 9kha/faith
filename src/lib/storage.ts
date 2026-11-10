import { put, del, list } from "@vercel/blob";

const BLOB_PREFIX = "faith_venture_realty/uploads";

export interface UploadResult {
  url: string;
  path: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
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
}

export async function deleteFile(pathname: string): Promise<void> {
  try {
    await del(pathname);
  } catch {
    // File may not exist
  }
}

export async function listUploadDir(): Promise<string[]> {
  const { blobs } = await list({ prefix: `${BLOB_PREFIX}/` });
  return blobs.map((b) => b.pathname);
}

export function getFileUrl(pathname: string): string {
  return `/uploads/${pathname.split("/").pop() ?? pathname}`;
}
