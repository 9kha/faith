import { db } from "@/lib/db";
import { SettingGroup } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import {
  THEME_PRESETS,
  type ThemeTokens,
  type ThemePalette,
  formatRadius,
} from "@/lib/theme-presets";

export type SettingValue = Prisma.InputJsonValue;

export type { ThemeTokens, ThemePalette };

export interface BrandingTokens extends ThemeTokens {
  spacing: string;
}

export const defaultBranding: BrandingTokens = {
  ...THEME_PRESETS.default,
  preset: "default",
  primary: THEME_PRESETS.default.light.primary,
  secondary: THEME_PRESETS.default.light.secondary,
  accent: THEME_PRESETS.default.light.accent,
  background: THEME_PRESETS.default.light.background,
  text: THEME_PRESETS.default.light.foreground,
  spacing: "1rem",
};

/**
 * Settings are persisted as JSON. Historically they were stored both as raw
 * values (`"#2563eb"`) and as envelopes (`{ "value": "#2563eb" }`), so readers
 * must unwrap the envelope or callers end up with `[object Object]`.
 */
function unwrapSettingValue(value: unknown): unknown {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.prototype.hasOwnProperty.call(value, "value")
  ) {
    return (value as { value: unknown }).value;
  }
  return value;
}

export async function getSetting<T = SettingValue>(key: string): Promise<T | null> {
  const setting = await db.setting.findUnique({
    where: { key },
  });
  if (!setting) return null;
  return unwrapSettingValue(setting.value) as T;
}

/** Display/safe string form of a stored setting value. */
export function settingToString(value: unknown): string {
  const unwrapped = unwrapSettingValue(value);
  if (unwrapped === null || unwrapped === undefined) return "";
  if (typeof unwrapped === "string") return unwrapped;
  if (typeof unwrapped === "number" || typeof unwrapped === "boolean") {
    return String(unwrapped);
  }
  return JSON.stringify(unwrapped);
}

export async function setSetting(key: string, value: SettingValue, group = "SYSTEM") {
  return db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value, group: group as unknown as SettingGroup },
  });
}

export async function getThemeTokens(): Promise<ThemeTokens> {
  const presetKey = (await getSetting<string>("theme.preset")) || "default";
  const basePreset = THEME_PRESETS[presetKey] || THEME_PRESETS.default;

  // Read fonts and radius
  const headingFont =
    (await getSetting<string>("theme.headingFont")) ||
    (await getSetting<string>("brand.headingFont")) ||
    basePreset.headingFont;

  const bodyFont =
    (await getSetting<string>("theme.bodyFont")) ||
    (await getSetting<string>("brand.bodyFont")) ||
    basePreset.bodyFont;

  const radius =
    (await getSetting<string>("theme.radius")) ||
    (await getSetting<string>("brand.radius")) ||
    basePreset.radius;

  // Read light mode palette with fallback to preset or legacy brand settings
  const lightPrimary =
    (await getSetting<string>("theme.light.primary")) ||
    (await getSetting<string>("brand.accentColor")) ||
    (await getSetting<string>("brand.primaryColor")) ||
    basePreset.light.primary;

  const lightSecondary =
    (await getSetting<string>("theme.light.secondary")) ||
    (await getSetting<string>("brand.secondaryColor")) ||
    basePreset.light.secondary;

  const lightAccent =
    (await getSetting<string>("theme.light.accent")) ||
    (await getSetting<string>("brand.accentColor")) ||
    basePreset.light.accent;

  const lightBackground =
    (await getSetting<string>("theme.light.background")) ||
    (await getSetting<string>("brand.backgroundColor")) ||
    basePreset.light.background;

  const lightCard =
    (await getSetting<string>("theme.light.card")) ||
    basePreset.light.card;

  const lightForeground =
    (await getSetting<string>("theme.light.foreground")) ||
    (await getSetting<string>("brand.textColor")) ||
    basePreset.light.foreground;

  const lightMuted =
    (await getSetting<string>("theme.light.muted")) ||
    basePreset.light.muted;

  const lightBorder =
    (await getSetting<string>("theme.light.border")) ||
    basePreset.light.border;

  // Read dark mode palette with fallback to preset
  const darkPrimary =
    (await getSetting<string>("theme.dark.primary")) ||
    basePreset.dark.primary;

  const darkSecondary =
    (await getSetting<string>("theme.dark.secondary")) ||
    basePreset.dark.secondary;

  const darkAccent =
    (await getSetting<string>("theme.dark.accent")) ||
    basePreset.dark.accent;

  const darkBackground =
    (await getSetting<string>("theme.dark.background")) ||
    basePreset.dark.background;

  const darkCard =
    (await getSetting<string>("theme.dark.card")) ||
    basePreset.dark.card;

  const darkForeground =
    (await getSetting<string>("theme.dark.foreground")) ||
    basePreset.dark.foreground;

  const darkMuted =
    (await getSetting<string>("theme.dark.muted")) ||
    basePreset.dark.muted;

  const darkBorder =
    (await getSetting<string>("theme.dark.border")) ||
    basePreset.dark.border;

  const spacing = (await getSetting<string>("brand.spacing")) || "1rem";
  const compactModeVal =
    (await getSetting<string | boolean>("theme.compactMode")) ??
    (await getSetting<string | boolean>("site.compactMode"));
  const compactMode = compactModeVal === true || compactModeVal === "true";

  return {
    preset: presetKey,
    headingFont: String(headingFont),
    bodyFont: String(bodyFont),
    radius: formatRadius(radius),
    compactMode,
    light: {
      primary: String(lightPrimary),
      secondary: String(lightSecondary),
      accent: String(lightAccent),
      background: String(lightBackground),
      card: String(lightCard),
      foreground: String(lightForeground),
      muted: String(lightMuted),
      border: String(lightBorder),
    },
    dark: {
      primary: String(darkPrimary),
      secondary: String(darkSecondary),
      accent: String(darkAccent),
      background: String(darkBackground),
      card: String(darkCard),
      foreground: String(darkForeground),
      muted: String(darkMuted),
      border: String(darkBorder),
    },
    primary: String(lightPrimary),
    secondary: String(lightSecondary),
    accent: String(lightAccent),
    background: String(lightBackground),
    text: String(lightForeground),
    spacing: String(spacing),
  };
}

export async function getBrandingTokens(): Promise<BrandingTokens> {
  return getThemeTokens();
}

export interface HeaderConfig {
  style: "glass" | "solid" | "minimal";
  sticky: boolean;
  hideOnScrollDown: boolean;
  showSearch: boolean;
  showThemeToggle: boolean;
  showContactButton: boolean;
  contactButtonText: string;
  contactButtonHref: string;
  showTopBar: boolean;
  topBarText: string;
  topBarLink: string;
  brandName: string;
  brandTagline: string;
  logoUrl?: string;
  navItems: { label: string; href: string; badge?: string }[];
}

export const defaultHeaderConfig: HeaderConfig = {
  style: "glass",
  sticky: true,
  hideOnScrollDown: true,
  showSearch: true,
  showThemeToggle: true,
  showContactButton: true,
  contactButtonText: "Talk to Expert",
  contactButtonHref: "/contact",
  showTopBar: false,
  topBarText: "✨ Exclusive Builder-Direct Deals in Central India · RERA Registered",
  topBarLink: "/projects",
  brandName: "Faith Venture",
  brandTagline: "Realty",
  logoUrl: "",
  navItems: [
    { label: "Buy", href: "/buy" },
    { label: "Rent", href: "/rent" },
    { label: "Projects", href: "/projects", badge: "New" },
    { label: "Builders", href: "/builders" },
    { label: "Blog", href: "/blog" },
  ],
};

export interface FooterConfig {
  brandName: string;
  tagline: string;
  logoUrl?: string;
  description: string;
  showNewsletter: boolean;
  newsletterHeading: string;
  newsletterSubheading: string;
  showTrustBadges: boolean;
  badge1Text: string;
  badge2Text: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  showQuickLinks: boolean;
  showCities: boolean;
  showPropertyTypes: boolean;
  showCompanyLinks: boolean;
  showSocialLinks: boolean;
  copyright: string;
  reraNumber: string;
  bottomNote: string;
}

export const defaultFooterConfig: FooterConfig = {
  brandName: "Faith Venture Realty",
  tagline: "Your Trusted Real Estate Partner",
  logoUrl: "",
  description:
    "Central India's leading RERA-registered real estate consultancy and advisory firm. Transparent pricing, verified builders, direct pricing, and end-to-end assistance from property tour to registry.",
  showNewsletter: true,
  newsletterHeading: "Stay ahead with real estate updates",
  newsletterSubheading:
    "New project launches, price trends, and exclusive builder deals in Central India.",
  showTrustBadges: true,
  badge1Text: "RERA Verified Partner",
  badge2Text: "50+ Builder Direct",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "sales@faithventure.in",
  address: "123, Scheme 54, Vijay Nagar, Indore, MP 452010",
  showQuickLinks: true,
  showCities: true,
  showPropertyTypes: true,
  showCompanyLinks: true,
  showSocialLinks: true,
  copyright: "© 2026 Faith Venture Realty. All rights reserved.",
  reraNumber: "MP-RERA-A-2024-00123",
  bottomNote: "Made with ❤️ in Central India",
};

export async function getHeaderConfig(): Promise<HeaderConfig> {
  const brandName =
    (await getSetting<string>("header.brandName")) ||
    (await getSetting<string>("brand.siteName")) ||
    defaultHeaderConfig.brandName;

  const brandTagline =
    (await getSetting<string>("header.brandTagline")) ||
    (await getSetting<string>("brand.siteTagline")) ||
    defaultHeaderConfig.brandTagline;

  const logoUrl =
    (await getSetting<string>("header.logoUrl")) ||
    (await getSetting<string>("brand.logoUrl")) ||
    "";

  const style =
    (await getSetting<"glass" | "solid" | "minimal">("header.style")) ||
    defaultHeaderConfig.style;

  const stickyVal = await getSetting<string | boolean>("header.sticky");
  const sticky = stickyVal !== null ? Boolean(stickyVal === true || stickyVal === "true") : defaultHeaderConfig.sticky;

  const hideVal = await getSetting<string | boolean>("header.hideOnScrollDown");
  const hideOnScrollDown = hideVal !== null ? Boolean(hideVal === true || hideVal === "true") : defaultHeaderConfig.hideOnScrollDown;

  const showSearchVal = await getSetting<string | boolean>("header.showSearch");
  const showSearch = showSearchVal !== null ? Boolean(showSearchVal === true || showSearchVal === "true") : defaultHeaderConfig.showSearch;

  const showThemeToggleVal = await getSetting<string | boolean>("header.showThemeToggle");
  const showThemeToggle = showThemeToggleVal !== null ? Boolean(showThemeToggleVal === true || showThemeToggleVal === "true") : defaultHeaderConfig.showThemeToggle;

  const showContactVal = await getSetting<string | boolean>("header.showContactButton");
  const showContactButton = showContactVal !== null ? Boolean(showContactVal === true || showContactVal === "true") : defaultHeaderConfig.showContactButton;

  const contactButtonText =
    (await getSetting<string>("header.contactButtonText")) ||
    defaultHeaderConfig.contactButtonText;

  const contactButtonHref =
    (await getSetting<string>("header.contactButtonHref")) ||
    defaultHeaderConfig.contactButtonHref;

  const showTopBarVal = await getSetting<string | boolean>("header.showTopBar");
  const showTopBar = showTopBarVal !== null ? Boolean(showTopBarVal === true || showTopBarVal === "true") : defaultHeaderConfig.showTopBar;

  const topBarText =
    (await getSetting<string>("header.topBarText")) ||
    defaultHeaderConfig.topBarText;

  const topBarLink =
    (await getSetting<string>("header.topBarLink")) ||
    defaultHeaderConfig.topBarLink;

  let navItems = defaultHeaderConfig.navItems;
  const navRaw = await getSetting<string | { label: string; href: string; badge?: string }[]>("header.navItems");
  if (navRaw) {
    if (Array.isArray(navRaw)) {
      navItems = navRaw;
    } else if (typeof navRaw === "string") {
      try {
        const parsed = JSON.parse(navRaw);
        if (Array.isArray(parsed)) navItems = parsed;
      } catch {
        // use default
      }
    }
  }

  return {
    style,
    sticky,
    hideOnScrollDown,
    showSearch,
    showThemeToggle,
    showContactButton,
    contactButtonText,
    contactButtonHref,
    showTopBar,
    topBarText,
    topBarLink,
    brandName,
    brandTagline,
    logoUrl,
    navItems,
  };
}

export async function getFooterConfig(): Promise<FooterConfig> {
  const brandName =
    (await getSetting<string>("footer.brandName")) ||
    (await getSetting<string>("brand.siteName")) ||
    defaultFooterConfig.brandName;

  const tagline =
    (await getSetting<string>("footer.tagline")) ||
    (await getSetting<string>("brand.siteTagline")) ||
    defaultFooterConfig.tagline;

  const logoUrl =
    (await getSetting<string>("footer.logoUrl")) ||
    (await getSetting<string>("brand.logoUrl")) ||
    (await getSetting<string>("header.logoUrl")) ||
    "";

  const description =
    (await getSetting<string>("footer.description")) ||
    (await getSetting<string>("seo.description")) ||
    defaultFooterConfig.description;

  const showNewsVal = await getSetting<string | boolean>("footer.showNewsletter");
  const showNewsletter = showNewsVal !== null ? Boolean(showNewsVal === true || showNewsVal === "true") : defaultFooterConfig.showNewsletter;

  const newsletterHeading =
    (await getSetting<string>("footer.newsletterHeading")) ||
    defaultFooterConfig.newsletterHeading;

  const newsletterSubheading =
    (await getSetting<string>("footer.newsletterSubheading")) ||
    defaultFooterConfig.newsletterSubheading;

  const showTrustVal = await getSetting<string | boolean>("footer.showTrustBadges");
  const showTrustBadges = showTrustVal !== null ? Boolean(showTrustVal === true || showTrustVal === "true") : defaultFooterConfig.showTrustBadges;

  const badge1Text = (await getSetting<string>("footer.badge1Text")) || defaultFooterConfig.badge1Text;
  const badge2Text = (await getSetting<string>("footer.badge2Text")) || defaultFooterConfig.badge2Text;

  const phone =
    (await getSetting<string>("footer.phone")) ||
    (await getSetting<string>("contact.phone")) ||
    defaultFooterConfig.phone;

  const whatsapp =
    (await getSetting<string>("footer.whatsapp")) ||
    (await getSetting<string>("contact.whatsapp")) ||
    defaultFooterConfig.whatsapp;

  const email =
    (await getSetting<string>("footer.email")) ||
    (await getSetting<string>("contact.email")) ||
    defaultFooterConfig.email;

  const address =
    (await getSetting<string>("footer.address")) ||
    (await getSetting<string>("contact.address")) ||
    defaultFooterConfig.address;

  const showQuickLinksVal = await getSetting<string | boolean>("footer.showQuickLinks");
  const showQuickLinks = showQuickLinksVal !== null ? Boolean(showQuickLinksVal === true || showQuickLinksVal === "true") : defaultFooterConfig.showQuickLinks;

  const showCitiesVal = await getSetting<string | boolean>("footer.showCities");
  const showCities = showCitiesVal !== null ? Boolean(showCitiesVal === true || showCitiesVal === "true") : defaultFooterConfig.showCities;

  const showPropertyTypesVal = await getSetting<string | boolean>("footer.showPropertyTypes");
  const showPropertyTypes = showPropertyTypesVal !== null ? Boolean(showPropertyTypesVal === true || showPropertyTypesVal === "true") : defaultFooterConfig.showPropertyTypes;

  const showCompanyLinksVal = await getSetting<string | boolean>("footer.showCompanyLinks");
  const showCompanyLinks = showCompanyLinksVal !== null ? Boolean(showCompanyLinksVal === true || showCompanyLinksVal === "true") : defaultFooterConfig.showCompanyLinks;

  const showSocialVal = await getSetting<string | boolean>("footer.showSocialLinks");
  const showSocialLinks = showSocialVal !== null ? Boolean(showSocialVal === true || showSocialVal === "true") : defaultFooterConfig.showSocialLinks;

  const copyright = (await getSetting<string>("footer.copyright")) || defaultFooterConfig.copyright;
  const reraNumber = (await getSetting<string>("footer.reraNumber")) || defaultFooterConfig.reraNumber;
  const bottomNote = (await getSetting<string>("footer.bottomNote")) || defaultFooterConfig.bottomNote;

  return {
    brandName,
    tagline,
    logoUrl,
    description,
    showNewsletter,
    newsletterHeading,
    newsletterSubheading,
    showTrustBadges,
    badge1Text,
    badge2Text,
    phone,
    whatsapp,
    email,
    address,
    showQuickLinks,
    showCities,
    showPropertyTypes,
    showCompanyLinks,
    showSocialLinks,
    copyright,
    reraNumber,
    bottomNote,
  };
}

export interface CityExplorerItem {
  id: string;
  name: string;
  slug: string;
  count: string;
  avgPrice: string;
  tagline?: string;
  description?: string;
  imageUrl?: string;
  enabled: boolean;
}

export const defaultCities: CityExplorerItem[] = [
  {
    id: "indore",
    name: "Indore",
    slug: "indore",
    count: "320+",
    avgPrice: "₹4,200/sq ft",
    tagline: "Commercial & IT Capital of MP",
    description: "Indore's fastest-growing residential and commercial corridors with high capital appreciation.",
    enabled: true,
  },
  {
    id: "bhopal",
    name: "Bhopal",
    slug: "bhopal",
    count: "180+",
    avgPrice: "₹3,800/sq ft",
    tagline: "City of Lakes & Governance",
    description: "Lush green master townships, premium lake-view apartments, and prime institutional hubs.",
    enabled: true,
  },
  {
    id: "ujjain",
    name: "Ujjain",
    slug: "ujjain",
    count: "90+",
    avgPrice: "₹2,900/sq ft",
    tagline: "Spiritual & Heritage Corridor",
    description: "Rapidly expanding smart city with high tourism-driven rental yields and plot developments.",
    enabled: true,
  },
  {
    id: "jabalpur",
    name: "Jabalpur",
    slug: "jabalpur",
    count: "75+",
    avgPrice: "₹3,100/sq ft",
    tagline: "Sanskardhani Cultural Capital",
    description: "Scenic residential projects and affordable family housing across developing suburbs.",
    enabled: true,
  },
];

export async function getCityExplorerList(): Promise<CityExplorerItem[]> {
  const raw = await getSetting<string | CityExplorerItem[]>("home.cities");
  if (!raw) return defaultCities;
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fallback
  }
  return defaultCities;
}

export async function getAllSettings(group?: string) {
  const where = group ? { group: group as unknown as SettingGroup } : {};
  return db.setting.findMany({ where, orderBy: { key: "asc" } });
}

export async function getSettingsByGroup(group: string) {
  return db.setting.findMany({ where: { group: group as unknown as SettingGroup }, orderBy: { key: "asc" } });
}

export interface LiveEditItem {
  id?: string;
  selector: string;
  tag: string;
  originalText: string;
  newHtml: string;
  newText: string;
}

export async function getLiveContentForPath(
  pathname: string
): Promise<Record<string, LiveEditItem>> {
  try {
    let clean = pathname.trim().split("?")[0].split("#")[0];
    if (!clean.startsWith("/")) clean = "/" + clean;
    if (clean.length > 1 && clean.endsWith("/")) clean = clean.slice(0, -1);

    const setting = await db.setting.findUnique({
      where: { key: `live_content:${clean}` },
    });
    if (!setting) return {};
    const parsed =
      typeof setting.value === "string" ? JSON.parse(setting.value) : setting.value;
    return parsed?.edits || {};
  } catch {
    return {};
  }
}

export async function getAllLiveContent(): Promise<
  Record<string, Record<string, LiveEditItem>>
> {
  try {
    const settings = await db.setting.findMany({
      where: { key: { startsWith: "live_content:" } },
    });
    const result: Record<string, Record<string, LiveEditItem>> = {};
    for (const s of settings) {
      const p = s.key.replace("live_content:", "");
      const parsed =
        typeof s.value === "string" ? JSON.parse(s.value) : s.value;
      if (parsed?.edits) {
        result[p] = parsed.edits;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export interface HomeVideoItem {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  platform: "youtube" | "facebook" | "direct";
  format: "video" | "short";
  category?: string;
  thumbnail?: string;
  duration?: string;
  projectName?: string;
  projectSlug?: string;
  builderName?: string;
  builderSlug?: string;
}

export const defaultHomeVideos: HomeVideoItem[] = [
  {
    id: "short-1",
    title: "Luxury 3 BHK Sample Flat Walkthrough",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&loop=1",
    platform: "youtube",
    format: "short",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    duration: "0:52",
    projectName: "Evara 27-Acre Luxury Township",
    projectSlug: "evara-27-acre-luxury-township",
    builderName: "Shree Group",
    category: "SAMPLE_FLAT",
  },
  {
    id: "short-2",
    title: "Drone Elevation & Skyline View at Dusk",
    url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&loop=1",
    platform: "youtube",
    format: "short",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    duration: "0:45",
    projectName: "Sunshine Enclave",
    projectSlug: "evara-27-acre-luxury-township",
    builderName: "Sunshine Realty",
    category: "DRONE",
  },
  {
    id: "short-3",
    title: "Grand Clubhouse & Olympic Pool Amenities",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    platform: "youtube",
    format: "video",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    duration: "1:10",
    projectName: "Royal Palms Township",
    projectSlug: "evara-27-acre-luxury-township",
    builderName: "Royal Developers",
    category: "WALKTHROUGH",
  },
  {
    id: "short-4",
    title: "Fast-Track Construction Milestone Update",
    url: "https://www.facebook.com/reel/123456789",
    embedUrl: "https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F123456789&show_text=false",
    platform: "facebook",
    format: "short",
    thumbnail: "/images/property-2.jpg",
    duration: "0:38",
    projectName: "Evara 27-Acre Luxury Township",
    projectSlug: "evara-27-acre-luxury-township",
    builderName: "Shree Group",
    category: "PROMO",
  },
];

export async function getHomeVideosList(): Promise<HomeVideoItem[]> {
  const raw = await getSetting<string | HomeVideoItem[]>("home.videos");
  if (!raw) return defaultHomeVideos;
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fallback
  }
  return defaultHomeVideos;
}

export interface MarketPulseItem {
  id: string;
  text: string;
  highlight?: boolean;
}

export const defaultMarketPulse: MarketPulseItem[] = [
  { id: "pulse-1", text: "Indore Super Corridor: +16.8% YoY Property Appreciation", highlight: false },
  { id: "pulse-2", text: "Odd-Even Cantilevered Sky Balcony Towers T1–T4 Verified by RERA", highlight: false },
  { id: "pulse-3", text: "Direct Builder Desk on All Partner Launches", highlight: true },
  { id: "pulse-4", text: "NRI Real Estate Wealth Desk: Dual-Currency Repatriation Support", highlight: false },
];

export async function getMarketPulseItems(): Promise<MarketPulseItem[]> {
  const raw = await getSetting<string | MarketPulseItem[]>("home.marketPulse");
  if (!raw) return defaultMarketPulse;
  if (Array.isArray(raw) && raw.length > 0) return raw;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fallback
  }
  return defaultMarketPulse;
}

export interface HomeStatCard {
  id: string;
  number: string;
  label: string;
  icon?: string;
}

export const defaultHomeStats: HomeStatCard[] = [
  { id: "stat-1", number: "1200+", label: "Happy Families", icon: "Users" },
  { id: "stat-2", number: "50+", label: "Premium Projects", icon: "Building2" },
  { id: "stat-3", number: "15+", label: "Cities Covered", icon: "MapPin" },
  { id: "stat-4", number: "10+", label: "Years Experience", icon: "TrendingUp" },
];

export async function getHomeStats(): Promise<HomeStatCard[]> {
  const raw = await getSetting<string | HomeStatCard[]>("home.stats");
  if (!raw) return defaultHomeStats;
  if (Array.isArray(raw) && raw.length > 0) return raw;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fallback
  }
  return defaultHomeStats;
}
