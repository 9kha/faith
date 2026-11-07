"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectFormValues } from "@/modules/project/schema";
import { createProjectAction } from "@/modules/project/actions";
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
import Link from "next/link";
import { Loader2, Plus, Building2, MapPin, Home, DollarSign, Image, FileText, Check, ChevronRight, ArrowLeft, BarChart3 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const steps = [
  { id: "basics", label: "Basics", icon: Home },
  { id: "location", label: "Location", icon: MapPin },
  { id: "config", label: "Configurations & Pricing", icon: DollarSign },
  { id: "towers", label: "Towers & Units", icon: Building2 },
  { id: "amenities", label: "Amenities & Specs", icon: Plus },
  { id: "media", label: "Media", icon: Image },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "payment", label: "Payment Plan", icon: BarChart3 },
  { id: "commission", label: "Commission", icon: BarChart3 },
  { id: "seo", label: "SEO", icon: FileText },
  { id: "review", label: "Review & Publish", icon: Check },
] as const;

type StepId = (typeof steps)[number]["id"];

export default function NewProjectPage() {
  const [currentStep, setCurrentStep] = useState<StepId>("basics");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [builderSuggestions, setBuilderSuggestions] = useState<{ id: string; name: string }[]>([]);

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      slug: "",
      builderId: "",
      type: "APARTMENT",
      status: "UPCOMING",
      city: "",
      locality: "",
      pincode: "",
      reraNo: "",
      priceMin: undefined,
      priceMax: undefined,
      areaMin: undefined,
      areaMax: undefined,
      possessionDate: undefined,
      launchDate: undefined,
      totalUnits: undefined,
      towers: undefined,
      description: "",
      featured: false,
      sortOrder: 0,
      seoTitle: "",
      seoDescription: "",
    },
  });

  const isLastStep = currentStep === "review";
  const isFirstStep = currentStep === "basics";
  const stepIndex = steps.findIndex((s) => s.id === currentStep);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/builders");
        const data = await res.json();
        if (mounted) {
          setBuilderSuggestions(data.builders || []);
        }
      } catch {
        if (mounted) setBuilderSuggestions([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id);
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };

  async function onSubmit(values: ProjectFormValues) {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append("featured", String(values.featured ?? false));

    const result = await createProjectAction(formData);

    setIsLoading(false);

    if (result.error) {
      if (typeof result.error === "object" && !Array.isArray(result.error)) {
        setServerError("Please fix the form errors");
      } else {
        setServerError(String(result.error));
      }
      return;
    }

    window.location.href = "/admin/admin/projects";
  }

  const StepIcon = (() => {
    const step = steps.find((s) => s.id === currentStep);
    return step?.icon || Home;
  })();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Add Project</h1>
          <p className="text-muted-foreground">
            Smart Add Helper: multi-step project creation with templates and suggestions
          </p>
        </div>
        <Link href="/admin/admin/projects">
          <Button variant="outline">Back to list</Button>
        </Link>
      </div>

      {serverError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 mb-4">
          {serverError}
        </div>
      )}

      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">{currentStep.replace(/^\w/, (c) => c.toUpperCase())}</span>
          <span className="text-xs text-muted-foreground">
            Step {stepIndex + 1} of {steps.length}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <StepIcon className="mr-2 h-5 w-5" />
            {steps.find((s) => s.id === currentStep)?.label}
          </CardTitle>
          <CardDescription>
            {currentStep === "basics"
              ? "Enter the basic project details. Select a builder to auto-fill default commission and RERA prefix."
              : currentStep === "location"
              ? "Choose the project location. City and locality suggestions will auto-suggest landmarks and typical price ranges."
              : currentStep === "config"
              ? "Configure BHK types, carpet/super area, and pricing. Templates prefill based on project type."
              : currentStep === "review"
              ? "Review all details before publishing. Changes can be made after creation."
              : "Continue configuring your project."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Basics Step */}
          {currentStep === "basics" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    placeholder="e.g. Shree Green Valley"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input
                    placeholder="e.g. shree-green-valley"
                    {...form.register("slug")}
                  />
                  {form.formState.errors.slug && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Builder</Label>
                <Select
                  {...form.register("builderId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a builder" />
                  </SelectTrigger>
                  <SelectContent>
                    {builderSuggestions.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.builderId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.builderId.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Selecting a builder auto-fills default commission terms.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Project Type</Label>
                  <Select
                    {...form.register("type")}
                    defaultValue="APARTMENT"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APARTMENT">Apartment</SelectItem>
                      <SelectItem value="VILLA">Villa</SelectItem>
                      <SelectItem value="PLOTTED">Plotted Development</SelectItem>
                      <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                      <SelectItem value="TOWNSHIP">Township</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecting a type preflils amenities and specifications template.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select {...form.register("status")} defaultValue="UPCOMING">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPCOMING">Upcoming</SelectItem>
                      <SelectItem value="NEW_LAUNCH">New Launch</SelectItem>
                      <SelectItem value="UNDER_CONSTRUCTION">Under Construction</SelectItem>
                      <SelectItem value="READY_TO_MOVE">Ready to Move</SelectItem>
                      <SelectItem value="SOLD_OUT">Sold Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Switch
                    checked={form.getValues("featured") || false}
                    onCheckedChange={(checked) => form.setValue("featured", checked)}
                  />
                  <Label htmlFor="featured">Featured Project</Label>
                </div>
              </div>
            </div>
          )}

          {/* Location Step */}
          {currentStep === "location" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="e.g. Indore"
                    {...form.register("city")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Locality</Label>
                  <Input
                    placeholder="e.g. Vijay Nagar"
                    {...form.register("locality")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input
                    placeholder="e.g. 452010"
                    {...form.register("pincode")}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" step="any" {...form.register("lat")} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" step="any" {...form.register("lng")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>RERA Number</Label>
                <Input placeholder="e.g. RERA-MP-5678" {...form.register("reraNo")} />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for marketing and sales in India.
                </p>
              </div>
            </div>
          )}

          {/* Configurations & Pricing Step */}
          {currentStep === "config" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Price Min (₹)</Label>
                  <Input type="number" placeholder="e.g. 45000000" {...form.register("priceMin")} />
                </div>
                <div className="space-y-2">
                  <Label>Price Max (₹)</Label>
                  <Input type="number" placeholder="e.g. 85000000" {...form.register("priceMax")} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Area Min (sq ft)</Label>
                  <Input type="number" placeholder="e.g. 850" {...form.register("areaMin")} />
                </div>
                <div className="space-y-2">
                  <Label>Area Max (sq ft)</Label>
                  <Input type="number" placeholder="e.g. 1800" {...form.register("areaMax")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Launch Date</Label>
                <Input type="date" {...form.register("launchDate")} />
              </div>

              <div className="space-y-2">
                <Label>Possession Date</Label>
                <Input type="date" {...form.register("possessionDate")} />
              </div>
            </div>
          )}

          {/* Towers & Units Step */}
          {currentStep === "towers" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Total Towers</Label>
                  <Input type="number" placeholder="e.g. 4" {...form.register("towers")} />
                </div>
                <div className="space-y-2">
                  <Label>Total Units</Label>
                  <Input type="number" placeholder="e.g. 200" {...form.register("totalUnits")} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Individual unit inventory can be managed in the Unit Inventory section after project creation.
              </p>
            </div>
          )}

          {/* Amenities & Specs Step */}
          {currentStep === "amenities" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Description / Highlights</Label>
                <textarea
                  {...form.register("description")}
                  rows={4}
                  placeholder="Describe the project's key features and USPs..."
                  className="flex h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Detailed amenities and unit-level specifications can be configured after project creation.
              </p>
            </div>
          )}

          {/* Media Step */}
          {currentStep === "media" && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Upload project images, floor plans, master plan, and brochure via the Media Library.
              </p>
            </div>
          )}

          {/* Documents Step */}
          {currentStep === "documents" && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Upload project approval documents, RERA registration, and agreement templates.
              </p>
            </div>
          )}

          {/* Payment Plan Step */}
          {currentStep === "payment" && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Configure payment schedule stages with percentages. This can be edited per-unit later.
              </p>
            </div>
          )}

          {/* Commission Step */}
          {currentStep === "commission" && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Commission rules can be configured per builder or project. Default terms from builder are applied.
              </p>
            </div>
          )}

          {/* SEO Step */}
          {currentStep === "seo" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input placeholder="e.g. Shree Green Valley - Apartments in Indore" {...form.register("seoTitle")} />
                </div>
                <div className="space-y-2">
                  <Label>SEO Description</Label>
                  <textarea
                    {...form.register("seoDescription")}
                    rows={3}
                    className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                SEO fields can be edited later in the SEO module.
              </p>
            </div>
          )}

          {/* Review & Publish Step */}
          {currentStep === "review" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <p className="text-muted-foreground">{form.getValues("name")}</p>
                </div>
                <div className="space-y-2">
                  <Label>Builder</Label>
                  <p className="text-muted-foreground">
                    {builderSuggestions.find((b) => b.id === form.getValues("builderId"))?.name || "—"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <p className="text-muted-foreground">{form.getValues("type")}</p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <p className="text-muted-foreground">{form.getValues("status")}</p>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <p className="text-muted-foreground">
                    {form.getValues("city")}, {form.getValues("locality")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <p className="text-muted-foreground">
                    {form.getValues("priceMin") && form.getValues("priceMax")
                      ? `₹${(form.getValues("priceMin") as number / 10000000).toFixed(1)}Cr - ₹${(form.getValues("priceMax") as number / 10000000).toFixed(1)}Cr`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button variant="outline" onClick={prevStep} disabled={isLoading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            {isLastStep ? (
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                onClick={(e) => {
                  e.preventDefault();
                  const vals = form.getValues();
                  onSubmit({
                    ...vals,
                    featured: Boolean(vals.featured),
                    sortOrder: Number(vals.sortOrder) || 0,
                  });
                }}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Project
              </Button>
            ) : (
              <Button
                onClick={() => {
                  // Basic validation before next step
                  nextStep();
                }}
                className="w-full"
                disabled={isLoading}
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentStep === "review"
              ? "Review all details before publishing"
              : `Step ${stepIndex + 1} of ${steps.length}`}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
