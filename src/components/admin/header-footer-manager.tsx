"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
  Layers,
  ArrowUp,
  Search,
  Phone,
  Plus,
  Trash2,
  Building2,
  Mail,
  ShieldCheck,
  Compass,
} from "lucide-react";
import {
  defaultHeaderConfig,
  defaultFooterConfig,
  type HeaderConfig,
  type FooterConfig,
} from "@/lib/settings";

type HeaderFooterManagerProps = {
  initialHeader?: HeaderConfig;
  initialFooter?: FooterConfig;
  onSaveSuccess?: () => void;
};

export function HeaderFooterManager({
  initialHeader,
  initialFooter,
  onSaveSuccess,
}: HeaderFooterManagerProps) {
  const [header, setHeader] = useState<HeaderConfig>(initialHeader || defaultHeaderConfig);
  const [footer, setFooter] = useState<FooterConfig>(initialFooter || defaultFooterConfig);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialHeader) setHeader(initialHeader);
  }, [initialHeader]);

  useEffect(() => {
    if (initialFooter) setFooter(initialFooter);
  }, [initialFooter]);

  const updateHeader = <K extends keyof HeaderConfig>(key: K, value: HeaderConfig[K]) => {
    setHeader((prev) => ({ ...prev, [key]: value }));
  };

  const updateFooter = <K extends keyof FooterConfig>(key: K, value: FooterConfig[K]) => {
    setFooter((prev) => ({ ...prev, [key]: value }));
  };

  const addNavItem = () => {
    setHeader((prev) => ({
      ...prev,
      navItems: [...prev.navItems, { label: "New Link", href: "/buy", badge: "" }],
    }));
  };

  const removeNavItem = (index: number) => {
    setHeader((prev) => ({
      ...prev,
      navItems: prev.navItems.filter((_, i) => i !== index),
    }));
  };

  const updateNavItem = (index: number, field: "label" | "href" | "badge", val: string) => {
    setHeader((prev) => {
      const items = [...prev.navItems];
      items[index] = { ...items[index], [field]: val };
      return { ...prev, navItems: items };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = [
        // Header settings
        { key: "header.brandName", value: header.brandName },
        { key: "header.brandTagline", value: header.brandTagline },
        { key: "header.logoUrl", value: header.logoUrl || "" },
        { key: "header.style", value: header.style },
        { key: "header.sticky", value: String(header.sticky) },
        { key: "header.hideOnScrollDown", value: String(header.hideOnScrollDown) },
        { key: "header.showSearch", value: String(header.showSearch) },
        { key: "header.showThemeToggle", value: String(header.showThemeToggle) },
        { key: "header.showContactButton", value: String(header.showContactButton) },
        { key: "header.contactButtonText", value: header.contactButtonText },
        { key: "header.contactButtonHref", value: header.contactButtonHref },
        { key: "header.showTopBar", value: String(header.showTopBar) },
        { key: "header.topBarText", value: header.topBarText },
        { key: "header.topBarLink", value: header.topBarLink },
        { key: "header.navItems", value: JSON.stringify(header.navItems) },

        // Footer settings
        { key: "footer.brandName", value: footer.brandName },
        { key: "footer.tagline", value: footer.tagline },
        { key: "footer.logoUrl", value: footer.logoUrl || "" },
        { key: "footer.description", value: footer.description },
        { key: "footer.showNewsletter", value: String(footer.showNewsletter) },
        { key: "footer.newsletterHeading", value: footer.newsletterHeading },
        { key: "footer.newsletterSubheading", value: footer.newsletterSubheading },
        { key: "footer.showTrustBadges", value: String(footer.showTrustBadges) },
        { key: "footer.badge1Text", value: footer.badge1Text },
        { key: "footer.badge2Text", value: footer.badge2Text },
        { key: "footer.phone", value: footer.phone },
        { key: "footer.whatsapp", value: footer.whatsapp },
        { key: "footer.email", value: footer.email },
        { key: "footer.address", value: footer.address },
        { key: "footer.showQuickLinks", value: String(footer.showQuickLinks) },
        { key: "footer.showCities", value: String(footer.showCities) },
        { key: "footer.showPropertyTypes", value: String(footer.showPropertyTypes) },
        { key: "footer.showCompanyLinks", value: String(footer.showCompanyLinks) },
        { key: "footer.showSocialLinks", value: String(footer.showSocialLinks) },
        { key: "footer.copyright", value: footer.copyright },
        { key: "footer.reraNumber", value: footer.reraNumber },
        { key: "footer.bottomNote", value: footer.bottomNote },
      ];

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      // Dispatch live custom events
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("header-config-updated", { detail: header })
        );
        window.dispatchEvent(
          new CustomEvent("footer-config-updated", { detail: footer })
        );
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      onSaveSuccess?.();
    } catch (err) {
      console.error(err);
      alert("Failed to save header and footer settings. Please check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" /> Header & Footer Master Controls
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete visual & functional control of navigation bar, smart scroll behavior, announcement strip, and footer columns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" /> Saved & Live
            </span>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Header & Footer
          </Button>
        </div>
      </div>

      {/* ----------------- HEADER CONTROLS ----------------- */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-base font-bold text-foreground">
          <Compass className="h-5 w-5 text-primary" /> Website Header & Navigation
        </div>

        {/* Scroll & Behavior Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-primary" /> Scroll Behavior & Layout
            </CardTitle>
            <CardDescription>
              Configure how the header behaves when visitors scroll up or down on the home page and listing pages.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Auto-Hide When Scrolling Down</Label>
                  <p className="text-xs text-muted-foreground">
                    Hides header when scrolling down; automatically reveals smoothly when user scrolls upward.
                  </p>
                </div>
                <Switch
                  checked={header.hideOnScrollDown}
                  onCheckedChange={(v) => updateHeader("hideOnScrollDown", v)}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Sticky Header on Top</Label>
                  <p className="text-xs text-muted-foreground">
                    Keep header pinned to top of the viewport instead of scrolling away.
                  </p>
                </div>
                <Switch
                  checked={header.sticky}
                  onCheckedChange={(v) => updateHeader("sticky", v)}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Show Quick Search Bar</Label>
                  <p className="text-xs text-muted-foreground">
                    Displays property & project search input with auto-complete dropdown.
                  </p>
                </div>
                <Switch
                  checked={header.showSearch}
                  onCheckedChange={(v) => updateHeader("showSearch", v)}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Show Dark / Bright Mode Toggle</Label>
                  <p className="text-xs text-muted-foreground">
                    Allows website visitors to toggle between dark and bright themes.
                  </p>
                </div>
                <Switch
                  checked={header.showThemeToggle}
                  onCheckedChange={(v) => updateHeader("showThemeToggle", v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Announcement Bar Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Top Announcement Strip
            </CardTitle>
            <CardDescription>
              Optional highlighted bar above header for urgent deals, festival offers, or RERA alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Enable Announcement Bar</Label>
                <p className="text-xs text-muted-foreground">
                  Show banner above the header with primary theme background.
                </p>
              </div>
              <Switch
                checked={header.showTopBar}
                onCheckedChange={(v) => updateHeader("showTopBar", v)}
              />
            </div>

            {header.showTopBar && (
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs">Banner Announcement Text</Label>
                  <Input
                    value={header.topBarText}
                    onChange={(e) => updateHeader("topBarText", e.target.value)}
                    placeholder="e.g. ✨ Exclusive Builder-Direct Deals · RERA Registered"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Optional Target Link URL</Label>
                  <Input
                    value={header.topBarLink}
                    onChange={(e) => updateHeader("topBarLink", e.target.value)}
                    placeholder="/projects or /buy"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Brand & CTA Button */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Header Brand Identity & CTA Button
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs">Header Brand Name</Label>
                <Input
                  value={header.brandName}
                  onChange={(e) => updateHeader("brandName", e.target.value)}
                  placeholder="Faith Venture"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Header Subtitle / Tagline</Label>
                <Input
                  value={header.brandTagline}
                  onChange={(e) => updateHeader("brandTagline", e.target.value)}
                  placeholder="Realty"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Logo Image URL (Optional)</Label>
                <Input
                  value={header.logoUrl || ""}
                  onChange={(e) => updateHeader("logoUrl", e.target.value)}
                  placeholder="/logo.png (leave blank for stylish icon)"
                />
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Header Action Button (CTA)</Label>
                  <p className="text-xs text-muted-foreground">
                    Display quick contact/tour button in the right corner of the header.
                  </p>
                </div>
                <Switch
                  checked={header.showContactButton}
                  onCheckedChange={(v) => updateHeader("showContactButton", v)}
                />
              </div>

              {header.showContactButton && (
                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Button Label</Label>
                    <Input
                      value={header.contactButtonText}
                      onChange={(e) => updateHeader("contactButtonText", e.target.value)}
                      placeholder="Talk to Expert"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Button Destination Link</Label>
                    <Input
                      value={header.contactButtonHref}
                      onChange={(e) => updateHeader("contactButtonHref", e.target.value)}
                      placeholder="/contact or tel:+91..."
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Menu Builder */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" /> Navigation Menu Links
              </CardTitle>
              <CardDescription>
                Customize items displayed in the header navigation pill bar.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={addNavItem} className="gap-1.5 rounded-xl">
              <Plus className="h-3.5 w-3.5" /> Add Link
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {header.navItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border p-2.5 bg-muted/20"
              >
                <div className="w-1/3">
                  <Label className="text-[10px] text-muted-foreground">Label</Label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateNavItem(idx, "label", e.target.value)}
                    className="h-8 text-xs"
                    placeholder="e.g. Villas"
                  />
                </div>
                <div className="w-1/3">
                  <Label className="text-[10px] text-muted-foreground">Target URL</Label>
                  <Input
                    value={item.href}
                    onChange={(e) => updateNavItem(idx, "href", e.target.value)}
                    className="h-8 text-xs"
                    placeholder="/buy?category=VILLA"
                  />
                </div>
                <div className="w-1/4">
                  <Label className="text-[10px] text-muted-foreground">Badge (optional)</Label>
                  <Input
                    value={item.badge || ""}
                    onChange={(e) => updateNavItem(idx, "badge", e.target.value)}
                    className="h-8 text-xs"
                    placeholder="e.g. New"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeNavItem(idx)}
                  className="mt-4 text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ----------------- FOOTER CONTROLS ----------------- */}
      <div className="space-y-6 pt-6 border-t">
        <div className="flex items-center gap-2 text-base font-bold text-foreground">
          <Layers className="h-5 w-5 text-primary" /> Website Footer Controls
        </div>

        {/* Footer Brand & Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Footer Brand & Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs">Footer Brand Title</Label>
                <Input
                  value={footer.brandName}
                  onChange={(e) => updateFooter("brandName", e.target.value)}
                  placeholder="Faith Venture Realty"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Footer Subtitle / Badge</Label>
                <Input
                  value={footer.tagline}
                  onChange={(e) => updateFooter("tagline", e.target.value)}
                  placeholder="Faith Venture Realty"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Footer Brand Logo Image URL</Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={footer.logoUrl || ""}
                  onChange={(e) => updateFooter("logoUrl", e.target.value)}
                  placeholder="Enter logo image URL (or leave blank to inherit Header/Brand logo)"
                />
                {footer.logoUrl && (
                  <div className="h-9 px-2 flex items-center justify-center rounded-lg border bg-muted/50 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={footer.logoUrl} alt="Footer logo preview" className="h-6 w-auto object-contain" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Leave empty to automatically inherit the primary Brand / Header logo.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Agency Description Bio</Label>
              <Textarea
                rows={3}
                value={footer.description}
                onChange={(e) => updateFooter("description", e.target.value)}
                placeholder="Central India's leading RERA-registered real estate consultancy..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Strip */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Market Insights Newsletter Strip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Show Top Newsletter Strip in Footer</Label>
                <p className="text-xs text-muted-foreground">
                  Displays email subscription form and market insights updates.
                </p>
              </div>
              <Switch
                checked={footer.showNewsletter}
                onCheckedChange={(v) => updateFooter("showNewsletter", v)}
              />
            </div>

            {footer.showNewsletter && (
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs">Newsletter Heading</Label>
                  <Input
                    value={footer.newsletterHeading}
                    onChange={(e) => updateFooter("newsletterHeading", e.target.value)}
                    placeholder="Stay ahead with real estate updates"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Newsletter Subheading</Label>
                  <Input
                    value={footer.newsletterSubheading}
                    onChange={(e) => updateFooter("newsletterSubheading", e.target.value)}
                    placeholder="New project launches, price trends, and exclusive builder deals..."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust Badges & Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Trust Badges & Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-semibold">Show Trust Badges</Label>
                <p className="text-xs text-muted-foreground">
                  Badges like RERA Verified & Builder Direct shown under agency bio.
                </p>
              </div>
              <Switch
                checked={footer.showTrustBadges}
                onCheckedChange={(v) => updateFooter("showTrustBadges", v)}
              />
            </div>

            {footer.showTrustBadges && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs">Badge 1 Text</Label>
                  <Input
                    value={footer.badge1Text}
                    onChange={(e) => updateFooter("badge1Text", e.target.value)}
                    placeholder="RERA Verified Partner"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Badge 2 Text</Label>
                  <Input
                    value={footer.badge2Text}
                    onChange={(e) => updateFooter("badge2Text", e.target.value)}
                    placeholder="50+ Builder Direct"
                  />
                </div>
              </div>
            )}

            <div className="border-t pt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-xs">Direct Helpline Phone</Label>
                <Input
                  value={footer.phone}
                  onChange={(e) => updateFooter("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">WhatsApp Support</Label>
                <Input
                  value={footer.whatsapp}
                  onChange={(e) => updateFooter("whatsapp", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Email Inquiries</Label>
                <Input
                  value={footer.email}
                  onChange={(e) => updateFooter("email", e.target.value)}
                  placeholder="sales@faithventure.in"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Head Office Address</Label>
                <Input
                  value={footer.address}
                  onChange={(e) => updateFooter("address", e.target.value)}
                  placeholder="123, Scheme 54, Indore, MP"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Columns & Bottom Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Navigation Columns & Bottom Bar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center justify-between rounded-xl border p-3">
                <Label className="text-xs font-semibold">Explore Column</Label>
                <Switch
                  checked={footer.showQuickLinks}
                  onCheckedChange={(v) => updateFooter("showQuickLinks", v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <Label className="text-xs font-semibold">Property Types</Label>
                <Switch
                  checked={footer.showPropertyTypes}
                  onCheckedChange={(v) => updateFooter("showPropertyTypes", v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <Label className="text-xs font-semibold">Company Links</Label>
                <Switch
                  checked={footer.showCompanyLinks}
                  onCheckedChange={(v) => updateFooter("showCompanyLinks", v)}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border p-3">
                <Label className="text-xs font-semibold">Social Icons</Label>
                <Switch
                  checked={footer.showSocialLinks}
                  onCheckedChange={(v) => updateFooter("showSocialLinks", v)}
                />
              </div>
            </div>

            <div className="border-t pt-4 grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs">Copyright Text</Label>
                <Input
                  value={footer.copyright}
                  onChange={(e) => updateFooter("copyright", e.target.value)}
                  placeholder="© 2026 Faith Venture Realty. All rights reserved."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">RERA Registration Number</Label>
                <Input
                  value={footer.reraNumber}
                  onChange={(e) => updateFooter("reraNumber", e.target.value)}
                  placeholder="MP-RERA-A-2024-00123"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Bottom Credit Note</Label>
                <Input
                  value={footer.bottomNote}
                  onChange={(e) => updateFooter("bottomNote", e.target.value)}
                  placeholder="Made with ❤️ in Central India"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Save Action Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2 rounded-xl px-8">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Header & Footer Settings
        </Button>
      </div>
    </div>
  );
}
