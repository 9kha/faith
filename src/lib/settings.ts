import { db } from "@/lib/db";
import { SettingGroup } from "@prisma/client";
import type { Prisma } from "@prisma/client";

export type SettingValue = Prisma.InputJsonValue;

export interface BrandingTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  headingFont: string;
  bodyFont: string;
  radius: string;
  spacing: string;
}

export const defaultBranding: BrandingTokens = {
  primary: "#0f172a",
  secondary: "#1e293b",
  accent: "#2563eb",
  background: "#ffffff",
  text: "#334155",
  headingFont: "Inter",
  bodyFont: "Inter",
  radius: "0.5rem",
  spacing: "1rem",
};

export async function getSetting<T = SettingValue>(key: string): Promise<T | null> {
  const setting = await db.setting.findUnique({
    where: { key },
  });
  if (!setting) return null;
  return setting.value as unknown as T;
}

export async function setSetting(key: string, value: SettingValue, group = "SYSTEM") {
  return db.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value, group: group as unknown as SettingGroup },
  });
}

export async function getBrandingTokens(): Promise<BrandingTokens> {
  const primary = (await getSetting<string>("brand.primaryColor")) || defaultBranding.primary;
  const secondary = (await getSetting<string>("brand.secondaryColor")) || defaultBranding.secondary;
  const accent = (await getSetting<string>("brand.accentColor")) || defaultBranding.accent;
  const background = (await getSetting<string>("brand.backgroundColor")) || defaultBranding.background;
  const text = (await getSetting<string>("brand.textColor")) || defaultBranding.text;
  const headingFont = (await getSetting<string>("brand.headingFont")) || defaultBranding.headingFont;
  const bodyFont = (await getSetting<string>("brand.bodyFont")) || defaultBranding.bodyFont;
  const radius = (await getSetting<string>("brand.radius")) || defaultBranding.radius;
  const spacing = (await getSetting<string>("brand.spacing")) || defaultBranding.spacing;

  return { primary, secondary, accent, background, text, headingFont, bodyFont, radius, spacing };
}

export async function getAllSettings(group?: string) {
  const where = group ? { group: group as unknown as SettingGroup } : {};
  return db.setting.findMany({ where, orderBy: { key: "asc" } });
}

export async function getSettingsByGroup(group: string) {
  return db.setting.findMany({ where: { group: group as unknown as SettingGroup }, orderBy: { key: "asc" } });
}
