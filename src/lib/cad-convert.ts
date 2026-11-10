import { execFile } from "child_process";
import { readFile, stat, rename, unlink, writeFile } from "fs/promises";
import { join, extname, basename } from "path";
import { randomUUID } from "crypto";

const DWG2DXF_TIMEOUT_MS = 30_000;
const MIN_VALID_DXF_BYTES = 200;
const ENTITY_HINT_RE =
  /\b(LWPOLYLINE|POLYLINE|LINE|CIRCLE|ARC|ELLIPSE|SPLINE|POINT|INSERT|SOLID|3DFACE|TEXT|MTEXT)\b/g;

export type CadPreviewErrorCode =
  | "bad-request"
  | "not-found"
  | "unsupported-format"
  | "conversion-failed"
  | "converter-missing";

export class CadPreviewError extends Error {
  code: CadPreviewErrorCode;
  detail?: string;

  constructor(code: CadPreviewErrorCode, message: string, detail?: string) {
    super(message);
    this.name = "CadPreviewError";
    this.code = code;
    this.detail = detail;
  }
}

export type CadPreviewSuccess = {
  dxf: string;
  source: "dxf-original" | "dwg-converted";
  converter: string | null;
};

const CONVERTER_CANDIDATES = [
  process.env.DWG2DXF_PATH,
  "dwg2dxf",
  "/opt/homebrew/bin/dwg2dxf",
  "/usr/local/bin/dwg2dxf",
].filter((candidate): candidate is string => Boolean(candidate));

// On Vercel the filesystem is read-only except /tmp. Use /tmp for all temp CAD work.
const WORK_DIR = "/tmp";

function sanitizeFileName(raw: string): string | null {
  const safe = raw.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safe || safe.startsWith(".")) return null;
  return safe;
}

function extractUploadsFileName(src: string): string | null {
  const trimmed = src.trim();
  // Accept both full blob URLs and bare filenames.
  const fromUrl = trimmed.includes("://")
    ? trimmed.slice(trimmed.lastIndexOf("/") + 1)
    : trimmed.includes("/uploads/")
      ? trimmed.slice(trimmed.lastIndexOf("/uploads/") + "/uploads/".length)
      : trimmed;
  if (!fromUrl || fromUrl.includes("/")) return null;
  return sanitizeFileName(fromUrl);
}

async function downloadToTemp(src: string, fileName: string): Promise<string> {
  const dest = join(WORK_DIR, fileName);
  const res = await fetch(src);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${src}: ${res.status}`);
  }
  const ab = await res.arrayBuffer();
  await writeFile(dest, Buffer.from(ab));
  return dest;
}

function runConverter(
  command: string,
  args: string[],
  cwd: string
): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    execFile(
      command,
      args,
      {
        cwd,
        timeout: DWG2DXF_TIMEOUT_MS,
        env: { ...process.env, LC_ALL: process.env.LC_ALL || "C.UTF-8" },
        maxBuffer: 16 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error) {
          (error as NodeJS.ErrnoException).message =
            ((stderr as string) || (stdout as string) || "").trim() ||
            error.message;
          rejectPromise(error);
          return;
        }
        resolvePromise(String(stdout || stderr || "ok"));
      }
    );
  });
}

async function locateConverter(): Promise<string> {
  for (const candidate of CONVERTER_CANDIDATES) {
    try {
      await runConverter(candidate, ["--version"], WORK_DIR);
      return candidate;
    } catch (error) {
      const errno = (error as NodeJS.ErrnoException).code;
      if (errno !== "ENOENT") {
        return candidate;
      }
    }
  }
  throw new CadPreviewError(
    "converter-missing",
    "No DWG converter (dwg2dxf) is installed on the server. Install LibreDWG to enable DWG previews (brew install libredwg, or apt-get install libredwg-tools)."
  );
}

function dxfLooksValid(dxf: string): boolean {
  if (!dxf || dxf.length < MIN_VALID_DXF_BYTES) return false;
  if (!dxf.includes("ENTITIES")) return false;
  const entityMatches = dxf.match(ENTITY_HINT_RE);
  return Boolean(entityMatches && entityMatches.length > 0);
}

async function needsFreshConversion(
  dxfCachePath: string,
  dwgPath: string
): Promise<boolean> {
  try {
    const [cacheStat, dwgStat] = await Promise.all([
      stat(dxfCachePath),
      stat(dwgPath),
    ]);
    return cacheStat.mtimeMs < dwgStat.mtimeMs;
  } catch {
    return true;
  }
}

/**
 * Loads a DXF preview for a stored upload. `.dxf` uploads are read directly;
 * `.dwg` uploads are converted with LibreDWG's dwg2dxf and cached next to the
 * original file (`<stored-name>.dxf`), so repeated previews don't re-convert.
 *
 * On Vercel the source file is fetched from a public Blob URL into /tmp because
 * the serverless filesystem is read-only.
 */
export async function loadCadPreviewDxf(
  src: string
): Promise<CadPreviewSuccess> {
  const fileName = extractUploadsFileName(src);
  if (!fileName) {
    throw new CadPreviewError(
      "bad-request",
      "Invalid CAD file reference. Expected a stored file inside /uploads/ or a public Blob URL."
    );
  }

  const ext = extname(fileName).toLowerCase();
  if (ext !== ".dwg" && ext !== ".dxf") {
    throw new CadPreviewError(
      "unsupported-format",
      "Unsupported CAD format for preview. Supported 2D formats are .dwg and .dxf."
    );
  }

  const sourcePath = join(WORK_DIR, fileName);
  const isRemote = src.startsWith("http://") || src.startsWith("https://");

  try {
    if (isRemote) {
      await downloadToTemp(src, fileName);
    } else {
      await stat(sourcePath);
    }
  } catch {
    throw new CadPreviewError(
      "not-found",
      `Stored CAD file not found: ${fileName}. It may have been removed from storage.`
    );
  }

  if (ext === ".dxf") {
    const dxf = await readFile(sourcePath, "utf8");
    if (!dxfLooksValid(dxf)) {
      throw new CadPreviewError(
        "conversion-failed",
        "The uploaded DXF file could not be read: no drawing entities found. The file may not be a valid DXF drawing."
      );
    }
    return { dxf, source: "dxf-original", converter: null };
  }

  const cachePath = sourcePath + ".dxf";
  const needsConversion = await needsFreshConversion(cachePath, sourcePath);

  if (!needsConversion) {
    try {
      const cached = await readFile(cachePath, "utf8");
      if (dxfLooksValid(cached)) {
        return { dxf: cached, source: "dwg-converted", converter: null };
      }
    } catch {
      // Cache missing or corrupt -> re-convert below.
    }
  }

  try {
    const sourceStat = await stat(sourcePath);
    if (sourceStat.size > 50 * 1024 * 1024) {
      throw new CadPreviewError(
        "unsupported-format",
        "DWG file is larger than 50MB and cannot be converted for preview."
      );
    }
  } catch (error) {
    if (error instanceof CadPreviewError) throw error;
  }

  const command = await locateConverter();
  const tmpName = `.dxf-preview-${randomUUID().slice(0, 8)}-${basename(cachePath)}`;
  const tmpPath = join(WORK_DIR, tmpName);

  try {
    await runConverter(command, ["-y", "-o", tmpPath, sourcePath], WORK_DIR);
    const converted = await readFile(tmpPath, "utf8");
    if (!dxfLooksValid(converted)) {
      throw new CadPreviewError(
        "conversion-failed",
        "Converted DWG contained no readable drawing entities. The file may be corrupted or not a real DWG drawing."
      );
    }
    await rename(tmpPath, cachePath);
    return { dxf: converted, source: "dwg-converted", converter: command };
  } catch (error) {
    if (error instanceof CadPreviewError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new CadPreviewError(
      "conversion-failed",
      "Failed to convert DWG to DXF for preview. The drawing may be corrupted, password protected, or use an unsupported DWG version.",
      message.slice(0, 400)
    );
  } finally {
    await unlink(tmpPath).catch(() => undefined);
  }
}
