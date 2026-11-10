"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Loader2, Home, Building2, Landmark, DollarSign } from "lucide-react";

type FormState = {
  name: string;
  phone: string;
  email: string;
  type: "BUYER" | "TENANT" | "OWNER";
  dealConcept: "BUYING" | "SELLING" | "LENDING" | "RENTING";
  budget: string;
  targetCity: string;
  preferredProject: string;
  address: string;
  notes: string;
};

const DEFAULT: FormState = {
  name: "",
  phone: "",
  email: "",
  type: "BUYER",
  dealConcept: "BUYING",
  budget: "",
  targetCity: "Indore",
  preferredProject: "",
  address: "",
  notes: "",
};

export function ClientForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Sync client type with deal concept if changed
      if (field === "dealConcept") {
        if (value === "BUYING" || value === "LENDING") updated.type = "BUYER";
        else if (value === "RENTING") updated.type = "TENANT";
        else if (value === "SELLING") updated.type = "OWNER";
      }
      return updated;
    });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!form.phone.trim() || form.phone.trim().length < 10) {
      newErrors.phone = "Valid phone number is required";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError(null);
    try {
      // Build comprehensive notes string with deal concept & preferences
      const metaNotes = [
        `[Concept: ${form.dealConcept}]`,
        form.budget ? `Target Budget/Amount: ${form.budget}` : null,
        form.targetCity ? `City: ${form.targetCity}` : null,
        form.preferredProject ? `Project/Builder: ${form.preferredProject}` : null,
        form.notes ? `\nNotes: ${form.notes}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          type: form.type,
          address: form.address.trim() || undefined,
          notes: metaNotes,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Failed to create client");
      }

      router.push("/admin/clients");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      {serverError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      {/* Deal Concept Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deal Concept & Primary Intent</CardTitle>
          <CardDescription>
            Select how this client intends to engage (Buying, Selling, Home Loan Lending, or Renting)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { id: "BUYING", label: "Property Buying", icon: Home, desc: "Purchasing home/plot" },
              { id: "SELLING", label: "Property Selling", icon: Building2, desc: "Owner listing sale" },
              { id: "LENDING", label: "Home Loan / Lending", icon: Landmark, desc: "Financing assistance" },
              { id: "RENTING", label: "Leasing / Renting", icon: DollarSign, desc: "Tenant or Landlord" },
            ].map((concept) => {
              const active = form.dealConcept === concept.id;
              const Icon = concept.icon;
              return (
                <button
                  type="button"
                  key={concept.id}
                  onClick={() => set("dealConcept", concept.id)}
                  className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                    active
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                      : "border-border hover:border-border/80 hover:bg-muted/40"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="mt-3 font-semibold text-sm text-foreground">{concept.label}</span>
                  <span className="mt-0.5 text-xs text-muted-foreground">{concept.desc}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Basic Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
          <CardDescription>Name and primary contact details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Ramesh Patel"
            />
            {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">
              Phone Number <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91 98765 43210"
              type="tel"
            />
            {errors.phone && <p className="text-xs text-rose-600">{errors.phone}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="ramesh@example.com"
              type="email"
            />
            {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Client Role</Label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="BUYER">Buyer (Purchasing / Investor)</option>
              <option value="TENANT">Tenant (Renting)</option>
              <option value="OWNER">Owner / Seller (Listing Property)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Deal Preference & Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requirements & Project Association</CardTitle>
          <CardDescription>
            Target budget, preferred project or builder, and location criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="budget">
              {form.dealConcept === "LENDING"
                ? "Loan Amount Required"
                : form.dealConcept === "SELLING"
                ? "Expected Sale Price"
                : form.dealConcept === "RENTING"
                ? "Monthly Rent Budget"
                : "Target Budget"}
            </Label>
            <Input
              id="budget"
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
              placeholder="e.g. ₹50 Lakhs, ₹1.2 Crore"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="targetCity">Target City / Locality</Label>
            <Input
              id="targetCity"
              value={form.targetCity}
              onChange={(e) => set("targetCity", e.target.value)}
              placeholder="e.g. Vijay Nagar, Indore"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="preferredProject">Associated Project or Builder</Label>
            <Input
              id="preferredProject"
              value={form.preferredProject}
              onChange={(e) => set("preferredProject", e.target.value)}
              placeholder="e.g. Shree Green Valley, DLF, etc."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Client Address / Location</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Current address or city"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="notes">Notes & Special Requirements</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Specific configurations (e.g. 3BHK East-facing), financing requirements, timeline for closing, etc."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3 border-t pt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Saving Record…" : "Save Client Record"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/clients">Cancel</Link>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
