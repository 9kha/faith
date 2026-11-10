"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { builderSchema, type BuilderFormValues } from "@/modules/builder/schema";
import {
  createBuilderAction,
  updateBuilderAction,
} from "@/modules/builder/actions";
import { withDefaults } from "@/lib/form-values";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VideoGalleryField } from "@/components/admin/video-gallery-field";
import type { VideoMediaItem } from "@/lib/video-utils";

export type BuilderInitialData = Partial<BuilderFormValues> & { id?: string };

export function BuilderForm({
  initialData,
}: {
  initialData?: BuilderInitialData | null;
}) {
  const isEdit = Boolean(initialData?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoMediaItem[]>(() => {
    const raw = (initialData as any)?.videos;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return [];
  });

  const initialBanner = (initialData as any)?.bannerConfig || {};
  const [showBanner, setShowBanner] = useState<boolean>(
    initialBanner.showBanner !== undefined ? Boolean(initialBanner.showBanner) : true
  );
  const [bannerHeadline, setBannerHeadline] = useState<string>(initialBanner.headline || "");
  const [bannerTagline, setBannerTagline] = useState<string>(initialBanner.tagline || "");
  const [bannerBadge, setBannerBadge] = useState<string>(initialBanner.badge || "");
  const [bannerImage, setBannerImage] = useState<string>(initialBanner.imageUrl || "");

  const defaultValues: BuilderFormValues = withDefaults(
    {

      name: "",
      slug: "",
      about: "",
      reraNo: "",
      website: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      address: "",
      commissionTerms: "",
      status: "active",
      featured: false,
      seoTitle: "",
      seoDescription: "",
        },
    initialData
  ) as BuilderFormValues;
  const form = useForm({
    resolver: zodResolver(builderSchema),
    defaultValues,
  });

  async function onSubmit(values: Record<string, unknown>) {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append("featured", String(values.featured));
    formData.append("videos", JSON.stringify(videos));

    const bannerConfig = {
      showBanner,
      headline: bannerHeadline.trim() || undefined,
      tagline: bannerTagline.trim() || undefined,
      badge: bannerBadge.trim() || undefined,
      imageUrl: bannerImage.trim() || undefined,
    };
    formData.append("bannerConfig", JSON.stringify(bannerConfig));

    const result = isEdit
      ? await updateBuilderAction(String(initialData?.id), formData)
      : await createBuilderAction(formData);

    setIsLoading(false);

    if (result.error) {
      if (typeof result.error === "object" && !Array.isArray(result.error)) {
        const errorEntries = Object.entries(result.error);
        const detailedMsg = errorEntries
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
          .join(" | ");
        setServerError(detailedMsg || "Please fix the form errors");
      } else {
        setServerError(String(result.error));
      }
      return;
    }

    // eslint-disable-next-line react-hooks/immutability
    window.location.href = "/admin/builders";
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isEdit ? "Edit Builder" : "Add Builder"}</h1>
        <Link href="/admin/builders">
          <Button variant="outline">Back to list</Button>
        </Link>
      </div>

      {serverError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 mb-4">
          {serverError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Builder Details</CardTitle>
          <CardDescription>
            Enter the builder information. The slug is auto-generated from the
            name but can be customized.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Builder Name
                </label>
                <Input
                  placeholder="e.g. Shree Constructions"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  URL Slug
                </label>
                <Input
                  placeholder="e.g. shree-constructions"
                  {...form.register("slug")}
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  RERA Number
                </label>
                <Input
                  placeholder="e.g. RERA-MP-1234"
                  {...form.register("reraNo")}
                />
                {form.formState.errors.reraNo && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.reraNo.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Website
                </label>
                <Input placeholder="https://..." {...form.register("website")} />
                {form.formState.errors.website && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.website.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                About / Description
              </label>
              <textarea
                {...form.register("about")}
                placeholder="Tell about the builder..."
                rows={4}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {form.formState.errors.about && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.about.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <Input
                  placeholder="Contact name"
                  {...form.register("contactName")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Phone
                </label>
                <Input
                  placeholder="+91 98765 43210"
                  {...form.register("contactPhone")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  placeholder="sales@builder.com"
                  {...form.register("contactEmail")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                {...form.register("address")}
                rows={2}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Commission Terms
                </label>
                <Input
                  placeholder="e.g. 5% on booking"
                  {...form.register("commissionTerms")}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...form.register("featured")}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Featured builder</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select
                {...form.register("status")}
                defaultValue="active"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  SEO Title
                </label>
                <Input
                  placeholder="Meta title for search engines"
                  {...form.register("seoTitle")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  SEO Description
                </label>
                <textarea
                  {...form.register("seoDescription")}
                  rows={2}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Builder Hero Banner Management */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Builder Hero Banner Settings</h3>
                  <p className="text-xs text-muted-foreground">
                    Customize the public banner appearance or disable it completely.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-semibold ${showBanner ? "text-emerald-600" : "text-muted-foreground"}`}>
                    {showBanner ? "Banner Visible" : "Banner Hidden"}
                  </span>
                  <Switch checked={showBanner} onCheckedChange={setShowBanner} />
                </div>
              </div>

              {showBanner && (
                <div className="grid gap-4 sm:grid-cols-2 pt-3 border-t border-border">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Custom Banner Headline (defaults to builder name)
                    </label>
                    <Input
                      value={bannerHeadline}
                      onChange={(e) => setBannerHeadline(e.target.value)}
                      placeholder="e.g. Shalimar Group — 35+ Years of Trust"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Banner Subtitle / Tagline
                    </label>
                    <Input
                      value={bannerTagline}
                      onChange={(e) => setBannerTagline(e.target.value)}
                      placeholder="e.g. Central India's Premier Township & High-Rise Developer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Hero Badge Text
                    </label>
                    <Input
                      value={bannerBadge}
                      onChange={(e) => setBannerBadge(e.target.value)}
                      placeholder="e.g. Grade-A Developer · 20+ Years Track Record"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Banner Background Image URL
                    </label>
                    <Input
                      value={bannerImage}
                      onChange={(e) => setBannerImage(e.target.value)}
                      placeholder="https://... or /images/project-1.jpg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Builder Video Shorts & Reels */}
            <VideoGalleryField
              videos={videos}
              onChange={setVideos}
              title="Builder Video Tours, Shorts & Facebook Reels"
              description="Add YouTube videos, builder interviews, construction updates, and Facebook reels."
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEdit ? "Save Changes" : "Create Builder"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
