export type VideoPlatform = "youtube" | "facebook" | "direct";
export type VideoFormat = "video" | "short";

export interface VideoMediaItem {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  platform: VideoPlatform;
  format: VideoFormat;
  category?: string;
  thumbnail?: string;
  duration?: string;
  projectName?: string;
  projectSlug?: string;
  builderName?: string;
  builderSlug?: string;
}

/**
 * Extracts YouTube video or short ID from various URL patterns:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://youtube.com/embed/VIDEO_ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Shorts: /shorts/XYZ
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // Standard watch?v=XYZ
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // Short url youtu.be/XYZ
  const shortUrlMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortUrlMatch && shortUrlMatch[1]) return shortUrlMatch[1];

  // Embed /embed/XYZ
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  return null;
}

/**
 * Detects platform, format, generates appropriate iframe embed URL, and default thumbnail.
 */
export function processVideoUrl(
  rawUrl: string,
  userFormat?: VideoFormat,
  userPlatform?: VideoPlatform
): {
  platform: VideoPlatform;
  format: VideoFormat;
  embedUrl: string;
  defaultThumbnail: string;
} {
  const url = (rawUrl || "").trim();
  const isFb =
    url.includes("facebook.com") ||
    url.includes("fb.watch") ||
    userPlatform === "facebook";
  const isYt =
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    userPlatform === "youtube";

  // 1. YouTube handling
  if (isYt || (!isFb && !url.endsWith(".mp4") && !url.endsWith(".webm"))) {
    const ytId = extractYouTubeId(url) || "dQw4w9WgXcQ";
    const isShort =
      userFormat === "short" ||
      url.includes("/shorts/") ||
      userFormat !== "video" && url.includes("short");

    const embedUrl = isShort
      ? `https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&rel=0`
      : `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;

    const defaultThumbnail = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

    return {
      platform: "youtube",
      format: isShort ? "short" : "video",
      embedUrl,
      defaultThumbnail,
    };
  }

  // 2. Facebook Video / Reel handling
  if (isFb) {
    const isReel =
      userFormat === "short" ||
      url.includes("/reel/") ||
      url.includes("/reels/");

    // Official Facebook Video Player Embed Plugin
    const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      url
    )}&show_text=false&autoplay=true`;

    return {
      platform: "facebook",
      format: isReel ? "short" : "video",
      embedUrl,
      defaultThumbnail: "/images/project-1.jpg",
    };
  }

  // 3. Direct HTML5 video handling (e.g. uploaded .mp4 or .webm)
  return {
    platform: "direct",
    format: userFormat || "video",
    embedUrl: url,
    defaultThumbnail: "/images/property-1.jpg",
  };
}
