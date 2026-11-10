"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Palette,
  Phone,
  Mail,
  Globe,
  Settings,
  Search,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Share2,
  LayoutTemplate,
  MapPin,
  Film,
} from "lucide-react";
import { ThemeStudio } from "@/components/admin/theme-studio";
import { HeaderFooterManager } from "@/components/admin/header-footer-manager";
import { CityManager } from "@/components/admin/city-manager";
import { HomeVideosManager } from "@/components/admin/home-videos-manager";
import { HomePageManager } from "@/components/admin/home-page-manager";

type SettingItem = {
  key: string;
  value: unknown;
  group: string;
};

// Config defines display metadata for known settings
const SETTING_META: Record<
  string,
  {
    label: string;
    description?: string;
    type: "text" | "color" | "boolean" | "textarea" | "number";
    placeholder?: string;
  }
> = {
  // Site Identity / Branding
  "brand.siteName": { label: "Site Name", description: "Your agency/portal name shown across the website", type: "text", placeholder: "Faith Venture Realty" },
  "brand.siteTagline": { label: "Site Tagline", description: "Sub-heading or slogan shown in the header and footer", type: "text", placeholder: "Your Trusted Real Estate Partner" },
  "brand.logoUrl": { label: "Logo URL", description: "Absolute URL or path to your company logo image", type: "text", placeholder: "/logo.png" },

  // Contact
  "contact.phone": { label: "Phone", description: "Primary contact phone number", type: "text", placeholder: "+91 98765 43210" },
  "contact.email": { label: "Email", description: "Contact / enquiry email address", type: "text", placeholder: "hello@agency.com" },
  "contact.address": { label: "Address", description: "Office address shown on contact page", type: "textarea" },
  "contact.whatsapp": { label: "WhatsApp Number", description: "WhatsApp number for the chat widget (with country code)", type: "text" },
  "contact.mapsUrl": { label: "Google Maps URL", description: "Embed URL for maps on contact page", type: "text" },

  // Social Media Links Management
  "social.facebook": { label: "Facebook Page URL", description: "Official Facebook page link", type: "text", placeholder: "https://facebook.com/faithventurerealty" },
  "social.instagram": { label: "Instagram Profile URL", description: "Official Instagram profile link", type: "text", placeholder: "https://instagram.com/faithventurerealty" },
  "social.youtube": { label: "YouTube Channel URL", description: "YouTube channel for property video tours, shorts & builder spotlights", type: "text", placeholder: "https://youtube.com/@faithventurerealty" },
  "social.linkedin": { label: "LinkedIn Company Page URL", description: "Company LinkedIn profile link", type: "text", placeholder: "https://linkedin.com/company/faithventurerealty" },
  "social.twitter": { label: "X / Twitter URL", description: "Official X (Twitter) profile URL", type: "text", placeholder: "https://x.com/faithventure" },
  "social.whatsapp": { label: "WhatsApp Channel / Chat URL", description: "WhatsApp direct chat or channel link", type: "text", placeholder: "https://wa.me/919876543210" },
  "social.telegram": { label: "Telegram Channel URL", description: "Official Telegram channel or broadcast link", type: "text", placeholder: "https://t.me/faithventurerealty" },
  "social.pinterest": { label: "Pinterest Board URL", description: "Architectural inspiration & floor plans board", type: "text", placeholder: "https://pinterest.com/faithventure" },
  "social.showInHeader": { label: "Show in Header", description: "Display quick social icons in top navigation", type: "boolean" },
  "social.showInFooter": { label: "Show in Footer", description: "Display branded social media links in website footer", type: "boolean" },

  // SMTP
  "smtp.host": { label: "SMTP Host", description: "Outgoing mail server hostname", type: "text", placeholder: "smtp.gmail.com" },
  "smtp.port": { label: "SMTP Port", description: "Port number (587 for TLS, 465 for SSL)", type: "text", placeholder: "587" },
  "smtp.user": { label: "SMTP Username", description: "Username / email for SMTP authentication", type: "text" },
  "smtp.password": { label: "SMTP Password", description: "Password or app-specific password", type: "text" },
  "smtp.from": { label: "From Address", description: "Sender name and email (e.g. Agency <info@agency.com>)", type: "text" },
  "smtp.secure": { label: "Use SSL/TLS", description: "Enable for port 465 (SSL), disable for 587 (STARTTLS)", type: "boolean" },

  // SEO
  "seo.title": { label: "Default SEO Title", description: "Fallback meta title if page has none", type: "text" },
  "seo.description": { label: "Default Meta Description", description: "Fallback description for search engines", type: "textarea" },
  "seo.keywords": { label: "Default Keywords", description: "Comma-separated keywords", type: "text" },
  "seo.ogImage": { label: "Open Graph Image URL", description: "Default social sharing image URL", type: "text" },
  "seo.twitterHandle": { label: "Twitter Handle", description: "@handle for Twitter card author", type: "text" },
  "seo.googleAnalyticsId": { label: "Google Analytics ID", description: "GA4 Measurement ID (G-XXXXXXXXXX)", type: "text" },
  "seo.googleTagManagerId": { label: "GTM Container ID", description: "Google Tag Manager ID (GTM-XXXXXXX)", type: "text" },

  // System
  "system.maintenanceMode": { label: "Maintenance Mode", description: "Put the public site in maintenance mode", type: "boolean" },
  "system.enableLeadNotifications": { label: "Lead Email Notifications", description: "Send email alerts when new leads arrive", type: "boolean" },
  "system.adminEmail": { label: "Admin Notification Email", description: "Email address to receive admin alerts", type: "text" },
  "system.currency": { label: "Currency Symbol", description: "Currency symbol used in prices (e.g. ₹)", type: "text", placeholder: "₹" },
  "system.timezone": { label: "Timezone", description: "Server/display timezone (e.g. Asia/Kolkata)", type: "text", placeholder: "Asia/Kolkata" },
  "system.itemsPerPage": { label: "Items Per Page", description: "Default pagination page size", type: "number" },

  // Home Page showcase
  "home.masterTownship.enabled": { label: "Show Master Township 3D Section", description: "Toggle the 'Flagship Master Township Experience' 3D / AutoCAD section on the home page", type: "boolean" },
  "home.masterTownship.projectSlugs": { label: "Showcase Projects", description: "Select one or more projects. Visitors can switch between them; the first selected is shown by default.", type: "text" },
  "home.masterTownship.projectSlug": { label: "Legacy Single Project (deprecated)", description: "Old setting kept for backward compatibility only. Use 'Showcase Projects' above.", type: "text" },
  "home.masterTownship.heading": { label: "Section Heading", description: "Optional custom heading (defaults to the selected project name)", type: "text" },
  "home.masterTownship.subheading": { label: "Section Subheading", description: "Optional custom description (defaults to the selected project description)", type: "textarea" },
};

const TABS = [
  { id: "home", label: "Home Page Studio", icon: LayoutTemplate, prefix: "home.", description: "Manage Market Pulse announcements, bottom 4 metric cards (1200+ Happy Families, etc.), and township 3D showcase" },
  { id: "theme", label: "Theme & Fonts", icon: Palette, prefix: "theme.", description: "Custom theme builder, light/dark mode palettes, and typography studio" },
  { id: "header-footer", label: "Header & Footer", icon: LayoutTemplate, prefix: "header.", description: "Complete control of header navigation, smart scroll behavior, announcement strip, and footer columns" },
  { id: "cities", label: "Cities", icon: MapPin, prefix: "city.", description: "Manage featured cities shown on the Home Page and their dedicated landing pages" },
  { id: "home-videos", label: "Home Videos & Shorts", icon: Film, prefix: "home.videos", description: "Manage YouTube videos, YouTube shorts, Facebook reels and video tours on the Home Page" },
  { id: "branding", label: "Site Identity", icon: Globe, prefix: "brand.", description: "Agency name, logo, and core public identity" },
  { id: "contact", label: "Contact", icon: Phone, prefix: "contact.", description: "Public contact details shown on the website" },
  { id: "social", label: "Social Media", icon: Share2, prefix: "social.", description: "Social media links, channels, handles & visibility" },
  { id: "smtp", label: "SMTP", icon: Mail, prefix: "smtp.", description: "Email delivery configuration" },
  { id: "seo", label: "SEO", icon: Search, prefix: "seo.", description: "Search engine optimisation defaults" },
  { id: "system", label: "System", icon: Settings, prefix: "system.", description: "Platform behaviour and admin preferences" },
];

function settingValueToString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object" && "value" in (v as Record<string, unknown>)) {
    return String((v as Record<string, unknown>).value);
  }
  return String(v);
}

function parseSlugListValue(raw: string): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (v): v is string => typeof v === "string" && v.trim() !== ""
      );
    }
  } catch {
    // comma-separated fallback
  }
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function isTruthy(v: unknown): boolean {
  const s = settingValueToString(v);
  return s === "true" || s === "1" || s === "yes";
}

export default function SettingsPage() {
  const [allSettings, setAllSettings] = useState<SettingItem[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [projectOptions, setProjectOptions] = useState<{ slug: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState("theme");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const t = p.get("tab");
      if (t && TABS.some((tab) => tab.id === t)) {
        setActiveTab(t);
      }
    }
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, projectsRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/projects?limit=100"),
      ]);
      const data = (await res.json()) as { settings: SettingItem[] };
      const settings: SettingItem[] = data.settings || [];
      setAllSettings(settings);

      try {
        const projectsData = (await projectsRes.json()) as {
          projects?: { slug: string; name: string }[];
        };
        setProjectOptions(
          (projectsData.projects || []).map((p) => ({ slug: p.slug, name: p.name }))
        );
      } catch {
        // project selector is optional; ignore failures
      }

      const vals: Record<string, string> = {};
      for (const s of settings) {
        vals[s.key] = settingValueToString(s.value);
      }

      // Sync site.title/tagline with brand.siteName if present
      if (!vals["brand.siteName"] && vals["site.title"]) {
        vals["brand.siteName"] = vals["site.title"];
      }
      if (!vals["brand.siteTagline"] && vals["site.tagline"]) {
        vals["brand.siteTagline"] = vals["site.tagline"];
      }

      // Seed the multi-select from the legacy single-project setting.
      if (!vals["home.masterTownship.projectSlugs"]) {
        const legacy = parseSlugListValue(
          vals["home.masterTownship.projectSlug"] || ""
        );
        if (legacy.length > 0) {
          vals["home.masterTownship.projectSlugs"] = JSON.stringify(legacy);
        }
      }
      setFormValues(vals);
    } catch {
      showToast("error", "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleBatchChange = (updates: Record<string, string>) => {
    setFormValues((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.entries(formValues).map(([key, value]) => ({ key, value }));
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");

      // Broadcast theme update so the active page responds immediately
      if (typeof window !== "undefined") {
        const headingFont =
          formValues["theme.headingFont"] ||
          formValues["brand.headingFont"] ||
          "Plus Jakarta Sans";
        const bodyFont =
          formValues["theme.bodyFont"] ||
          formValues["brand.bodyFont"] ||
          "Inter";
        const radius =
          formValues["theme.radius"] ||
          formValues["brand.radius"] ||
          "0.5rem";

        window.dispatchEvent(
          new CustomEvent("theme-tokens-updated", {
            detail: {
              preset: formValues["theme.preset"] || "default",
              headingFont,
              bodyFont,
              radius,
              compactMode:
                String(formValues["theme.compactMode"]) === "true" ||
                String(formValues["site.compactMode"]) === "true",
              light: {
                primary: formValues["theme.light.primary"] || "#2563eb",
                secondary: formValues["theme.light.secondary"] || "#f1f5f9",
                accent: formValues["theme.light.accent"] || "#3b82f6",
                background: formValues["theme.light.background"] || "#ffffff",
                card: formValues["theme.light.card"] || "#ffffff",
                foreground: formValues["theme.light.foreground"] || "#0f172a",
                muted: formValues["theme.light.muted"] || "#f8fafc",
                border: formValues["theme.light.border"] || "#e2e8f0",
              },
              dark: {
                primary: formValues["theme.dark.primary"] || "#3b82f6",
                secondary: formValues["theme.dark.secondary"] || "#1e293b",
                accent: formValues["theme.dark.accent"] || "#60a5fa",
                background: formValues["theme.dark.background"] || "#090d16",
                card: formValues["theme.dark.card"] || "#111827",
                foreground: formValues["theme.dark.foreground"] || "#f8fafc",
                muted: formValues["theme.dark.muted"] || "#1f2937",
                border: formValues["theme.dark.border"] || "#1e293b",
              },
              primary: formValues["theme.light.primary"] || "#2563eb",
              secondary: formValues["theme.light.secondary"] || "#f1f5f9",
              accent: formValues["theme.light.accent"] || "#3b82f6",
              background: formValues["theme.light.background"] || "#ffffff",
              text: formValues["theme.light.foreground"] || "#0f172a",
              spacing: "1rem",
            },
          })
        );
      }

      showToast("success", "Theme and system settings saved successfully");
    } catch {
      showToast("error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setSmtpTesting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      showToast("success", "SMTP test email sent — check your inbox");
    } catch {
      showToast("error", "SMTP test failed");
    } finally {
      setSmtpTesting(false);
    }
  };

  const DEPRECATED_SETTING_KEYS = new Set([
    "home.masterTownship.projectSlug",
    // Filter legacy raw brand color fields from the Site Identity tab as they are in Theme Studio
    "brand.primaryColor",
    "brand.secondaryColor",
    "brand.accentColor",
    "brand.backgroundColor",
    "brand.textColor",
    "brand.headingFont",
    "brand.bodyFont",
    "brand.radius",
    "brand.spacing",
  ]);

  const getTabSettings = (prefix: string) => {
    const knownKeys = Object.keys(SETTING_META).filter((k) => k.startsWith(prefix));
    const dbKeys = allSettings.map((s) => s.key).filter((k) => k.startsWith(prefix));
    const union = Array.from(new Set([...knownKeys, ...dbKeys]));
    return union.filter((k) => !DEPRECATED_SETTING_KEYS.has(k));
  };

  const renderField = (key: string) => {
    const meta = SETTING_META[key];
    const type = meta?.type ?? "text";
    const label = meta?.label ?? key;
    const description = meta?.description;
    const placeholder = meta?.placeholder ?? "";
    const value = formValues[key] ?? "";

    return (
      <div key={key} className="space-y-1.5">
        <Label htmlFor={key} className="text-sm font-medium">
          {label}
        </Label>

        {type === "color" ? (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value || "#000000"}
              onChange={(e) => handleChange(key, e.target.value)}
              className="h-9 w-12 cursor-pointer rounded-md border border-input p-1"
            />
            <Input
              id={key}
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={placeholder || "#000000"}
              className="font-mono"
            />
          </div>
        ) : type === "boolean" ? (
          <div className="flex items-center gap-2">
            <Switch
              id={key}
              checked={isTruthy(value)}
              onCheckedChange={(checked) => handleChange(key, checked ? "true" : "false")}
            />
            <span className="text-sm text-muted-foreground">
              {isTruthy(value) ? "Enabled" : "Disabled"}
            </span>
          </div>
        ) : key === "home.masterTownship.projectSlugs" ? (
          (() => {
            const selected = parseSlugListValue(value);
            const toggle = (slug: string) => {
              const next = selected.includes(slug)
                ? selected.filter((slugItem) => slugItem !== slug)
                : [...selected, slug];
              handleChange(key, JSON.stringify(next));
            };
            return (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selected.length} selected
                  </Badge>
                  {selected.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleChange(key, "[]")}
                      className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-input bg-background p-2">
                  {projectOptions.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-muted-foreground">
                      No projects found.
                    </p>
                  ) : (
                    projectOptions.map((project) => {
                      const isChecked = selected.includes(project.slug);
                      return (
                        <label
                          key={project.slug}
                          className={`flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors ${
                            isChecked ? "bg-primary/10" : "hover:bg-muted/60"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggle(project.slug)}
                            className="h-4 w-4 rounded border-input accent-primary"
                          />
                          <span className="flex-1 font-medium">{project.name}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {project.slug}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                {selected.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Nothing selected — the home page will auto-pick the first project
                    with an uploaded 3D model.
                  </p>
                )}
              </div>
            );
          })()
        ) : type === "textarea" ? (
          <Textarea
            id={key}
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        ) : (
          <Input
            id={key}
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            type={type === "number" ? "number" : "text"}
          />
        )}

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure custom themes, typography, branding, email delivery and platform preferences
          </p>
        </div>
        <Button onClick={() => void handleSave()} disabled={saving} className="shrink-0 gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex flex-wrap gap-1 h-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* 1. Dedicated Theme & Fonts Studio Tab */}
        <TabsContent value="theme" className="space-y-6">
          <ThemeStudio
            formValues={formValues}
            onBatchChange={handleBatchChange}
            onFieldChange={handleChange}
          />
        </TabsContent>

        {/* 2. Dedicated Header & Footer Tab */}
        <TabsContent value="header-footer" className="space-y-6">
          <HeaderFooterManager
            initialHeader={{
              style: (formValues["header.style"] as any) || "glass",
              sticky: formValues["header.sticky"] !== "false",
              hideOnScrollDown: formValues["header.hideOnScrollDown"] !== "false",
              showSearch: formValues["header.showSearch"] !== "false",
              showThemeToggle: formValues["header.showThemeToggle"] !== "false",
              showContactButton: formValues["header.showContactButton"] !== "false",
              contactButtonText: formValues["header.contactButtonText"] || "Talk to Expert",
              contactButtonHref: formValues["header.contactButtonHref"] || "/contact",
              showTopBar: formValues["header.showTopBar"] === "true",
              topBarText: formValues["header.topBarText"] || "",
              topBarLink: formValues["header.topBarLink"] || "/projects",
              brandName: formValues["header.brandName"] || formValues["brand.siteName"] || "Faith Venture Realty",
              brandTagline: formValues["header.brandTagline"] || formValues["brand.siteTagline"] || "Realty",
              logoUrl: formValues["header.logoUrl"] || formValues["brand.logoUrl"] || "",
              navItems: (() => {
                const raw = formValues["header.navItems"];
                if (Array.isArray(raw)) return raw;
                if (typeof raw === "string") {
                  try {
                    return JSON.parse(raw);
                  } catch {
                    // ignore
                  }
                }
                return [
                  { label: "Buy", href: "/buy" },
                  { label: "Rent", href: "/rent" },
                  { label: "Projects", href: "/projects", badge: "New" },
                  { label: "Builders", href: "/builders" },
                  { label: "Blog", href: "/blog" },
                ];
              })(),
            }}
            initialFooter={{
              brandName: formValues["footer.brandName"] || formValues["brand.siteName"] || "Faith Venture Realty",
              tagline: formValues["footer.tagline"] || formValues["brand.siteTagline"] || "Your Trusted Real Estate Partner",
              logoUrl: formValues["footer.logoUrl"] || formValues["brand.logoUrl"] || formValues["header.logoUrl"] || "",
              description: formValues["footer.description"] || "Central India's leading RERA-registered real estate consultancy and advisory firm.",
              showNewsletter: formValues["footer.showNewsletter"] !== "false",
              newsletterHeading: formValues["footer.newsletterHeading"] || "Stay ahead with real estate updates",
              newsletterSubheading: formValues["footer.newsletterSubheading"] || "New project launches, price trends, and exclusive builder deals in Central India.",
              showTrustBadges: formValues["footer.showTrustBadges"] !== "false",
              badge1Text: formValues["footer.badge1Text"] || "RERA Verified Partner",
              badge2Text: formValues["footer.badge2Text"] || "50+ Builder Direct",
              phone: formValues["footer.phone"] || formValues["contact.phone"] || "+91 98765 43210",
              whatsapp: formValues["footer.whatsapp"] || formValues["contact.whatsapp"] || "+91 98765 43210",
              email: formValues["footer.email"] || formValues["contact.email"] || "sales@faithventure.in",
              address: formValues["footer.address"] || formValues["contact.address"] || "123, Scheme 54, Vijay Nagar, Indore, MP",
              showQuickLinks: formValues["footer.showQuickLinks"] !== "false",
              showCities: formValues["footer.showCities"] !== "false",
              showPropertyTypes: formValues["footer.showPropertyTypes"] !== "false",
              showCompanyLinks: formValues["footer.showCompanyLinks"] !== "false",
              showSocialLinks: formValues["footer.showSocialLinks"] !== "false",
              copyright: formValues["footer.copyright"] || "© 2026 Faith Venture Realty. All rights reserved.",
              reraNumber: formValues["footer.reraNumber"] || "MP-RERA-A-2024-00123",
              bottomNote: formValues["footer.bottomNote"] || "Made with ❤️ in Central India",
            }}
            onSaveSuccess={() => {
              showToast("success", "Header & Footer settings saved successfully");
              void load();
            }}
          />
        </TabsContent>

        {/* 3. Dedicated Cities Tab */}
        <TabsContent value="cities" className="space-y-6">
          <CityManager
            onSaveSuccess={() => {
              showToast("success", "City configuration saved successfully");
              void load();
            }}
          />
        </TabsContent>

        {/* 4. Dedicated Home Page Videos & Shorts Tab */}
        <TabsContent value="home-videos" className="space-y-6">
          <HomeVideosManager
            initialVideos={(() => {
              const raw = formValues["home.videos"];
              if (!raw) return undefined;
              if (Array.isArray(raw)) return raw;
              try {
                return JSON.parse(raw as string);
              } catch {
                return undefined;
              }
            })()}
            onFieldChange={handleChange}
            onSaveSuccess={() => {
              showToast("success", "Home Page videos & shorts saved successfully");
              void load();
            }}
          />
        </TabsContent>

        {/* 5. Dedicated Home Page Studio Tab (Market Pulse + 4 Stats Cards + 3D Township Showcase) */}
        <TabsContent value="home" className="space-y-6">
          <HomePageManager
            initialMarketPulse={(() => {
              const raw = formValues["home.marketPulse"];
              if (!raw) return undefined;
              if (Array.isArray(raw)) return raw;
              try {
                return JSON.parse(raw as string);
              } catch {
                return undefined;
              }
            })()}
            initialStats={(() => {
              const raw = formValues["home.stats"];
              if (!raw) return undefined;
              if (Array.isArray(raw)) return raw;
              try {
                return JSON.parse(raw as string);
              } catch {
                return undefined;
              }
            })()}
            initialTownship={{
              enabled: formValues["home.masterTownship.enabled"] !== "false",
              projectSlugs: parseSlugListValue(formValues["home.masterTownship.projectSlugs"] || "evara-27-acre-luxury-township"),
              heading: formValues["home.masterTownship.heading"] || "",
              subheading: formValues["home.masterTownship.subheading"] || "",
            }}
            projectOptions={projectOptions}
            onFieldChange={handleChange}
            onBatchChange={handleBatchChange}
            onSaveSuccess={() => {
              showToast("success", "Home Page content & metric cards updated successfully!");
              void load();
            }}
          />
        </TabsContent>

        {/* Other Tabs */}
        {TABS.filter((t) => t.id !== "theme" && t.id !== "header-footer" && t.id !== "cities" && t.id !== "home-videos" && t.id !== "home").map((tab) => {
          const keys = getTabSettings(tab.prefix);
          const Icon = tab.icon;
          return (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary" />
                    {tab.label} Settings
                  </CardTitle>
                  <CardDescription>{tab.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {keys.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No settings configured yet for this section.
                    </p>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {keys.map((key) => renderField(key))}
                    </div>
                  )}

                  {/* SMTP test button */}
                  {tab.id === "smtp" && (
                    <div className="mt-6 border-t pt-6">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => void handleTestSmtp()}
                          disabled={smtpTesting}
                        >
                          {smtpTesting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="mr-2 h-4 w-4" />
                          )}
                          {smtpTesting ? "Sending test…" : "Send Test Email"}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          Sends a test email to the admin address to verify SMTP configuration.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Social media live preview banner */}
                  {tab.id === "social" && (
                    <div className="mt-6 border-t border-border pt-6">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Active Public Social Channels Preview:
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        <a
                          href={formValues["social.facebook"] || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/30 px-3.5 py-2 text-xs font-semibold hover:bg-[#1877F2]/20 transition-colors"
                        >
                          Facebook
                        </a>
                        <a
                          href={formValues["social.instagram"] || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#E4405F]/10 text-[#E4405F] border border-[#E4405F]/30 px-3.5 py-2 text-xs font-semibold hover:bg-[#E4405F]/20 transition-colors"
                        >
                          Instagram
                        </a>
                        <a
                          href={formValues["social.youtube"] || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/30 px-3.5 py-2 text-xs font-semibold hover:bg-[#FF0000]/20 transition-colors"
                        >
                          YouTube Videos
                        </a>
                        <a
                          href={formValues["social.linkedin"] || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/30 px-3.5 py-2 text-xs font-semibold hover:bg-[#0A66C2]/20 transition-colors"
                        >
                          LinkedIn
                        </a>
                        <a
                          href={formValues["social.twitter"] || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/10 dark:bg-slate-100/10 text-foreground border border-border px-3.5 py-2 text-xs font-semibold hover:bg-muted transition-colors"
                        >
                          X (Twitter)
                        </a>
                        <a
                          href={formValues["social.whatsapp"] || "https://wa.me/919876543210"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 px-3.5 py-2 text-xs font-semibold hover:bg-[#25D366]/20 transition-colors"
                        >
                          WhatsApp Direct
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
