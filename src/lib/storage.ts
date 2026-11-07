import { writeFile, mkdir, stat, unlink, readdir } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR || "./uploads";

export async function ensureUploadDir() {
  try {
    await stat(UPLOAD_DIR);
  } catch {
    await mkdir(UPLOAD_DIR, { recursive: true });
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

export async function storeFile(
  buffer: Buffer,
  filename: string,
  mime: string
): Promise<UploadResult> {
  await ensureUploadDir();
  const id = crypto.randomUUID();
  const ext = filename.split(".").pop() || "bin";
  const safeFilename = `${id}.${ext}`;
  const filePath = join(UPLOAD_DIR, safeFilename);
  const url = `/uploads/${safeFilename}`;

  await writeFile(filePath, buffer);
  const stats = await stat(filePath);

  return {
    url,
    path: filePath,
    mime,
    size: stats.size,
  };
}

export async function deleteFile(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch {
    // File may not exist
  }
}

export async function listUploadDir(): Promise<string[]> {
  await ensureUploadDir();
  return readdir(UPLOAD_DIR);
}

export function getFileUrl(filename: string): string {
  return `/uploads/${filename}`;
}
