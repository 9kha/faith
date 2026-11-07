"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone } from "lucide-react";

type InquiryFormProps = {
  projectId?: string;
  propertyId?: string;
  projectName?: string;
  propertyTitle?: string;
  prefillMessage?: string;
};

type UtmParams = Record<string, string | undefined>;

export function InquiryForm({
  projectId,
  propertyId,
  projectName,
  propertyTitle,
  prefillMessage,
}: InquiryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;
    const budget = formData.get("budget") as string;

    const honeypot = formData.get("website");
    if (honeypot) {
      setIsLoading(false);
      setSubmitted(true);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const refCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("ref="))
      ?.split("=")[1];

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          source: "WEBSITE",
          utmSource: params.get("utm_source") || undefined,
          utmMedium: params.get("utm_medium") || undefined,
          utmCampaign: params.get("utm_campaign") || undefined,
          refCode: refCookie || undefined,
          projectId,
          propertyId,
          message,
          budget: budget ? parseInt(budget, 10) : undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Failed to submit. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mx-auto mb-4">
          <Phone className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600 text-sm">
          Your inquiry has been submitted. Our team will contact you shortly.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Enquiry</CardTitle>
        <CardDescription>
          Get in touch with our team for more information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot field - hidden from users, filled by bots */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            style={{ position: "absolute", left: "-9999px", visibility: "hidden" }}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Full Name</label>
              <Input
                placeholder="John Doe"
                name="name"
                required
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Phone</label>
              <Input
                placeholder="+91 98765 43210"
                type="tel"
                name="phone"
                required
                className="h-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Email</label>
            <Input
              placeholder="john@example.com"
              type="email"
              name="email"
              className="h-9"
            />
          </div>
          {projectName || propertyTitle ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Interested In</label>
              <Input
                placeholder={projectName || propertyTitle || "Property"}
                name="interest"
                readOnly
                className="h-9 bg-gray-50"
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Message</label>
            <textarea
              placeholder="Tell us about your requirements..."
              name="message"
              rows={3}
              className="w-full px-3 py-2 rounded border border-input text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Budget (₹)</label>
            <Input
              placeholder="e.g. 5000000"
              type="number"
              name="budget"
              className="h-9"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Enquiry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
