"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, type PropertyFormValues } from "@/modules/property/schema";
import {
  createPropertyAction,
  updatePropertyAction,
} from "@/modules/property/actions";
import { withDefaults } from "@/lib/form-values";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export type PropertyInitialData = Partial<PropertyFormValues> & { id?: string };

export function PropertyForm({
  initialData,
}: {
  initialData?: PropertyInitialData | null;
}) {
  const isEdit = Boolean(initialData?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues: PropertyFormValues = withDefaults(
    {

      title: "",
      slug: "",
      projectId: "",
      builderId: "",
      listingType: "SALE",
      category: "FLAT",
      price: undefined,
      rent: undefined,
      deposit: undefined,
      maintenance: undefined,
      bhk: "",
      baths: undefined,
      area: undefined,
      areaUnit: "sq_ft",
      floor: undefined,
      totalFloors: undefined,
      facing: "",
      furnishing: "",
      ageYears: undefined,
      possession: "",
      city: "",
      locality: "",
      lat: undefined,
      lng: undefined,
      description: "",
      ownerName: "",
      ownerPhone: "",
      status: "AVAILABLE",
      featured: false,
      verified: false,
      seoTitle: "",
      seoDescription: "",
        },
    initialData
  ) as PropertyFormValues;

  const form = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues,
  });
  const listingType = form.watch("listingType");

  async function onSubmit(values: PropertyFormValues) {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append("featured", String(values.featured ?? false));
    formData.append("verified", String(values.verified ?? false));

    const result = isEdit
      ? await updatePropertyAction(String(initialData?.id), formData)
      : await createPropertyAction(formData);

    setIsLoading(false);

    if (result.error) {
      if (typeof result.error === "object" && !Array.isArray(result.error)) {
        setServerError("Please fix the form errors");
      } else {
        setServerError(String(result.error));
      }
      return;
    }

    // eslint-disable-next-line react-hooks/immutability, @next/next/no-location-assign-relative-destination
    window.location.href = "/admin/properties";
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isEdit ? "Edit Property" : "Add Property"}</h1>
        <Link href="/admin/properties">
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
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update the details of this listing."
              : "Add a property for sale or rent. Can be linked to a project/builder or listed independently."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Property Title</Label>
                <Input
                  placeholder="e.g. 3 BHK Flat in Vijay Nagar"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input
                  placeholder="e.g. 3-bhk-flat-vijay-nagar"
                  {...form.register("slug")}
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Listing Type</Label>
                  <Select {...form.register("listingType")} defaultValue="SALE">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALE">Sale</SelectItem>
                    <SelectItem value="RENT">Rent</SelectItem>
                    <SelectItem value="LEASE">Lease</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                  <Select {...form.register("category")} defaultValue="FLAT">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FLAT">Flat / Apartment</SelectItem>
                    <SelectItem value="VILLA">Villa</SelectItem>
                    <SelectItem value="PLOT">Plot</SelectItem>
                    <SelectItem value="SHOP">Shop</SelectItem>
                    <SelectItem value="OFFICE">Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                  <Select {...form.register("status")} defaultValue="AVAILABLE">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="SOLD">Sold</SelectItem>
                    <SelectItem value="RENTED">Rented</SelectItem>
                    <SelectItem value="UNDER_OFFER">Under Offer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="e.g. Indore" {...form.register("city")} />
                </div>
                <div className="space-y-2">
                  <Label>Locality</Label>
                  <Input placeholder="e.g. Vijay Nagar" {...form.register("locality")} />
                </div>
              </div>

            {listingType === "SALE" ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" placeholder="e.g. 85000000" {...form.register("price")} />
                </div>
                <div className="space-y-2">
                  <Label>BHK</Label>
                  <Input placeholder="e.g. 3 BHK" {...form.register("bhk")} />
                </div>
                <div className="space-y-2">
                  <Label>Area (sq ft)</Label>
                  <Input type="number" placeholder="e.g. 1250" {...form.register("area")} />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Monthly Rent (₹)</Label>
                  <Input type="number" placeholder="e.g. 25000" {...form.register("rent")} />
                </div>
                <div className="space-y-2">
                  <Label>Deposit (₹)</Label>
                  <Input type="number" placeholder="e.g. 100000" {...form.register("deposit")} />
                </div>
                <div className="space-y-2">
                  <Label>Maintenance (₹/mo)</Label>
                  <Input type="number" placeholder="e.g. 3000" {...form.register("maintenance")} />
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Baths</Label>
                <Input type="number" placeholder="e.g. 2" {...form.register("baths")} />
              </div>
              <div className="space-y-2">
                <Label>Floor</Label>
                <Input type="number" placeholder="e.g. 3" {...form.register("floor")} />
              </div>
              <div className="space-y-2">
                <Label>Facing</Label>
                <Input placeholder="e.g. East" {...form.register("facing")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                {...form.register("description")}
                rows={3}
                placeholder="Describe the property..."
                className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...form.register("featured")}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Featured Property</span>
                </label>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...form.register("verified")}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Verified Badge</span>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEdit ? "Save Changes" : "Create Property"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <span className="text-xs text-muted-foreground">
            Fields marked with * are required
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
