import sharp from "sharp";

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

export async function processImage(
  buffer: Buffer,
  filename: string
): Promise<ProcessedImage> {
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const isImage = ["jpg", "jpeg", "png", "webp", "avif", "tiff"].includes(ext);

  if (!isImage) {
    throw new Error("Unsupported image format");
  }

  const id = crypto.randomUUID();
  const baseDir = process.env.LOCAL_UPLOAD_DIR || "./uploads";

  const sharpInstance = sharp(buffer);
  const metadata = await sharpInstance.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions");
  }

  const originalFilename = `${id}-original.${ext}`;
  const originalPath = `${baseDir}/${originalFilename}`;
  const originalUrl = `/uploads/${originalFilename}`;

  await sharpInstance.toFile(originalPath);

  const sizes: Record<string, string> = {};

  for (const [name, config] of Object.entries(SIZES)) {
    const outFilename = `${id}-${name}.webp`;
    const outPath = `${baseDir}/${outFilename}`;
    const outUrl = `/uploads/${outFilename}`;

    await sharp(buffer)
      .resize(config.width, config.height, { fit: config.fit, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outPath);

    sizes[name] = outUrl;
  }

  return {
    original: originalUrl,
    thumbnail: sizes.thumbnail,
    small: sizes.small,
    medium: sizes.medium,
    large: sizes.large,
    width: metadata.width,
    height: metadata.height,
    mime: `image/${ext === "jpg" ? "jpeg" : ext}`,
    size: buffer.length,
  };
}

export async function generateBlurPlaceholder(buffer: Buffer): Promise<string> {
  const { data } = await sharp(buffer)
    .resize(20, 20, { fit: "cover" })
    .blur(10)
    .toFormat("webp")
    .toBuffer({ resolveWithObject: true });

  return `data:image/webp;base64,${data.toString("base64")}`;
}

export function isImageFile(mime: string): boolean {
  return mime.startsWith("image/");
}

export function isVideoFile(mime: string): boolean {
  return mime.startsWith("video/");
}

export function isPdfFile(mime: string): boolean {
  return mime === "application/pdf";
}
