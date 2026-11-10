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
import {
  Phone,
  Calendar,
  MessageCircle,
  FileDown,
  Landmark,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";

type InquiryFormProps = {
  projectId?: string;
  propertyId?: string;
  projectName?: string;
  propertyTitle?: string;
  propertyPrice?: string;
  builderName?: string;
  prefillMessage?: string;
  compact?: boolean;
};

type IntentType = "SITE_VISIT" | "PRICE_SHEET" | "HOME_LOAN" | "CALLBACK";

export function InquiryForm({
  projectId,
  propertyId,
  projectName,
  propertyTitle,
  propertyPrice,
  builderName,
  prefillMessage,
  compact = false,
}: InquiryFormProps) {
  const [intent, setIntent] = useState<IntentType>("SITE_VISIT");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [budget, setBudget] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitSlot, setVisitSlot] = useState("Morning (10 AM – 1 PM)");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  const targetName = propertyTitle || projectName || "Property";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please provide your name and phone number");
      return;
    }

    setIsLoading(true);
    setError(null);

    const intentLabels: Record<IntentType, string> = {
      SITE_VISIT: "Site Visit Request",
      PRICE_SHEET: "Price Sheet & Brochure Request",
      HOME_LOAN: "Home Loan Assistance Request",
      CALLBACK: "Instant Callback Request",
    };

    const details = [
      `[Intent: ${intentLabels[intent]}]`,
      targetName ? `Target: ${targetName}` : null,
      builderName ? `Builder: ${builderName}` : null,
      intent === "SITE_VISIT" && visitDate ? `Visit Date: ${visitDate} (${visitSlot})` : null,
      whatsappOptIn ? `WhatsApp Updates: Opted In` : null,
      prefillMessage ? `Note: ${prefillMessage}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const refCookie = typeof document !== "undefined"
      ? document.cookie
          .split("; ")
          .find((row) => row.startsWith("ref="))
          ?.split("=")[1]
      : undefined;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          source: "WEBSITE",
          utmSource: params?.get("utm_source") || undefined,
          utmMedium: params?.get("utm_medium") || undefined,
          utmCampaign: params?.get("utm_campaign") || undefined,
          refCode: refCookie || undefined,
          projectId,
          propertyId,
          message: details,
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

  const cleanPhone = phone.replace(/[^0-9]/g, "");

  if (submitted) {
    return (
      <Card className="border border-emerald-500/30 bg-emerald-50/50 p-6 text-center dark:bg-emerald-950/20 dark:border-emerald-500/30">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground">
          Enquiry Received for {targetName}!
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Thank you, <strong className="text-foreground">{name}</strong>. Our dedicated relationship manager has received your request and will call you on{" "}
          <strong className="text-foreground">{phone}</strong> within 15 minutes.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(
              `Hello! I just submitted an inquiry for ${targetName}. My name is ${name}. Please share detailed brochures and price sheets.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp Immediately
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setName("");
              setPhone("");
              setEmail("");
            }}
          >
            Submit Another Request
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-border bg-card shadow-sm transition-all">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Official Advisory Desk Assistance
          </span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Direct Pricing
          </span>
        </div>
        <CardTitle className="mt-2 text-xl font-bold tracking-tight text-foreground">
          {intent === "SITE_VISIT"
            ? `Schedule a VIP Site Visit`
            : intent === "PRICE_SHEET"
            ? `Download Price Sheet & Brochure`
            : intent === "HOME_LOAN"
            ? `Check Home Loan Eligibility`
            : `Request Quick Callback`}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Connect directly with certified property advisors for {targetName}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 p-6">
        {/* Intent Pills */}
        {!compact && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { id: "SITE_VISIT", label: "Site Visit", icon: Calendar },
              { id: "PRICE_SHEET", label: "Price Sheet", icon: FileDown },
              { id: "HOME_LOAN", label: "Home Loan", icon: Landmark },
              { id: "CALLBACK", label: "Call Back", icon: Phone },
            ].map((tab) => {
              const active = intent === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setIntent(tab.id as IntentType)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                  +91
                </span>
                <Input
                  placeholder="98765 43210"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-10 pl-11 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Email & Budget */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Email Address (Optional)</label>
              <Input
                placeholder="rahul@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Budget Expectation</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Select Budget Range</option>
                <option value="4000000">Under ₹40 Lakhs</option>
                <option value="6000000">₹40 L – ₹60 Lakhs</option>
                <option value="8000000">₹60 L – ₹80 Lakhs</option>
                <option value="12000000">₹80 L – ₹1.2 Crore</option>
                <option value="20000000">₹1.2 Cr – ₹2 Crore</option>
                <option value="30000000">₹2 Crore+</option>
              </select>
            </div>
          </div>

          {/* Conditional Site Visit Date & Slot */}
          {intent === "SITE_VISIT" && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Calendar className="h-4 w-4" />
                Select Preferred Site Visit Date & Time
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  type="date"
                  value={visitDate}
                  min={new Date().toISOString().split("T")[0]}
                  suppressHydrationWarning
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="h-9 text-xs"
                />
                <select
                  value={visitSlot}
                  onChange={(e) => setVisitSlot(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="Morning (10 AM – 1 PM)">Morning (10 AM – 1 PM)</option>
                  <option value="Afternoon (1 PM – 4 PM)">Afternoon (1 PM – 4 PM)</option>
                  <option value="Evening (4 PM – 7 PM)">Evening (4 PM – 7 PM)</option>
                </select>
              </div>
            </div>
          )}

          {/* WhatsApp Opt-in */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappOptIn}
                onChange={(e) => setWhatsappOptIn(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5 text-emerald-500 inline" />
                Send price sheet & updates on WhatsApp
              </span>
            </label>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              100% Privacy Protected
            </span>
          </div>

          {/* Submit CTA */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isLoading
              ? "Connecting with Advisor…"
              : intent === "SITE_VISIT"
              ? "Book My Free Site Visit"
              : intent === "PRICE_SHEET"
              ? "Get Instant Price Sheet"
              : intent === "HOME_LOAN"
              ? "Check Loan Eligibility"
              : "Request Immediate Callback"}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            Direct builder pricing · 100% verified listings · RERA registered partners only
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
