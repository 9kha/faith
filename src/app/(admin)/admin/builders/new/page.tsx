"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { builderSchema } from "@/modules/builder/schema";
import { createBuilderAction } from "@/modules/builder/actions";
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
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewBuilderPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(builderSchema),
    defaultValues: {
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

    const result = await createBuilderAction(formData);

    setIsLoading(false);

    if (result.error) {
      if (typeof result.error === "object" && !Array.isArray(result.error)) {
        setServerError("Please fix the form errors");
      } else {
        setServerError(String(result.error));
      }
      return;
    }

    // eslint-disable-next-line react-hooks/immutability
    window.location.href = "/admin/admin/builders";
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add Builder</h1>
        <Link href="/admin/admin/builders">
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Builder
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
