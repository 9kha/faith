"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Building2,
  Home,
  UserCheck,
  UserPlus,
  Clock,
  Sparkles,
  ExternalLink,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  TrendingUp,
  Tag,
  Car,
  Plus,
} from "lucide-react";
import { formatCompactINR } from "@/lib/format";

type LeadDetail = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string;
  status: string;
  message: string | null;
  budget: number | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  refCode: string | null;
  nextFollowUpAt: string | null;
  lostReason: string | null;
  clientId: string | null;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    slug: string;
    city: string;
    locality: string;
  } | null;
  property?: {
    id: string;
    title: string;
    slug: string;
    city: string;
    locality: string;
    price: number | null;
  } | null;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
  client?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    type: string;
  } | null;
  activities: {
    id: string;
    type: string;
    content: string | null;
    createdAt: string;
  }[];
  siteVisits: {
    id: string;
    scheduledAt: string;
    status: string;
    pickupRequired: boolean;
    pickupAddress: string | null;
  }[];
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; desc: string }
> = {
  NEW: {
    label: "New Enquiry",
    color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    desc: "Fresh uncontacted lead",
  },
  CONTACTED: {
    label: "Contacted",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    desc: "Call or WhatsApp message initiated",
  },
  SITE_VISIT_SCHEDULED: {
    label: "Site Visit Scheduled",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    desc: "Site visit date confirmed",
  },
  SITE_VISIT_DONE: {
    label: "Site Visit Done",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    desc: "Client toured project/property",
  },
  NEGOTIATION: {
    label: "Negotiation",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    desc: "Discussions on price and floor unit",
  },
  BOOKED: {
    label: "Token Booked",
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    desc: "Booking token received",
  },
  CLOSED_WON: {
    label: "Closed (Won)",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    desc: "Sale / Registry executed",
  },
  CLOSED_LOST: {
    label: "Closed (Lost)",
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    desc: "Did not materialize or dropped",
  },
};

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Status & Follow-up State
  const [status, setStatus] = useState("NEW");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);

  // Conversion Modal State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertForm, setConvertForm] = useState({
    type: "BUYER" as "BUYER" | "TENANT" | "OWNER",
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState<{
    clientId: string;
    name: string;
  } | null>(null);

  // Note creation State
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Load Lead details
  const loadLead = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${resolvedParams.id}`);
      const data = await res.json();
      if (!res.ok || !data.lead) {
        setErrorMsg(data.error || "Lead could not be loaded");
        setLead(null);
        return;
      }
      setLead(data.lead);
      setStatus(data.lead.status);
      if (data.lead.nextFollowUpAt) {
        setNextFollowUp(
          new Date(data.lead.nextFollowUpAt).toISOString().slice(0, 16)
        );
      }
      setConvertForm({
        type: "BUYER",
        name: data.lead.name || "",
        phone: data.lead.phone || "",
        email: data.lead.email || "",
        address: "",
        notes: data.lead.message ? `Requirement: ${data.lead.message}` : "",
      });
    } catch {
      setErrorMsg("Network error loading lead details.");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    void loadLead();
  }, [loadLead]);

  // Handle Status Update
  const handleSaveStatus = async () => {
    setSavingStatus(true);
    setStatusSuccess(false);
    try {
      const res = await fetch(`/api/leads/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          nextFollowUpAt: nextFollowUp ? new Date(nextFollowUp).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 3000);
      void loadLead();
    } catch (e: any) {
      alert(e.message || "Failed to save status");
    } finally {
      setSavingStatus(false);
    }
  };

  // Handle Convert Lead to Client
  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConverting(true);
    try {
      const res = await fetch(`/api/leads/${resolvedParams.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(convertForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Conversion failed");
      }

      setConversionSuccess({
        clientId: data.clientId,
        name: data.client?.name || convertForm.name,
      });
      setShowConvertModal(false);
      void loadLead();
    } catch (err: any) {
      alert(err.message || "Failed to convert lead to client");
    } finally {
      setIsConverting(false);
    }
  };

  // Handle Adding Internal Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/leads/${resolvedParams.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote.trim(), type: "NOTE" }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      setNewNote("");
      void loadLead();
    } catch {
      alert("Failed to save note");
    } finally {
      setIsAddingNote(false);
    }
  };

  // Handle Delete Lead
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      const res = await fetch(`/api/leads/${resolvedParams.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete lead");
      router.push("/admin/leads");
    } catch {
      alert("Failed to delete lead");
    }
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-4 text-center py-16">
        <p className="text-muted-foreground">{errorMsg || "Lead not found."}</p>
        <Button asChild variant="outline">
          <Link href="/admin/leads">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Leads
          </Link>
        </Button>
      </div>
    );
  }

  const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
  const statusInfo = STATUS_CONFIG[lead.status] || {
    label: lead.status,
    color: "bg-muted text-foreground",
    desc: "",
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Leads
        </Link>

        {/* Top Action Conversion Button */}
        <div className="flex items-center gap-3">
          {lead.client ? (
            <Button
              asChild
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
            >
              <Link href={`/admin/clients/${lead.client.id}`}>
                <UserCheck className="h-4 w-4" />
                <span>Client Profile ({lead.client.name}) →</span>
              </Link>
            </Button>
          ) : (
            <Button
              onClick={() => setShowConvertModal(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md"
            >
              <UserPlus className="h-4 w-4" />
              <span>Convert to Client</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conversion Success Notification */}
      {conversionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-bold">
                Lead converted to Client successfully!
              </p>
              <p className="text-xs">
                {conversionSuccess.name} is now saved in your permanent client roster with site visit &amp; booking management.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-emerald-600 text-white font-semibold shrink-0">
            <Link href={`/admin/clients/${conversionSuccess.clientId}`}>
              Open Client Record →
            </Link>
          </Button>
        </div>
      )}

      {/* Lead Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-bold text-white shadow-md">
                {lead.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {lead.name}
                  </h1>
                  <Badge variant="outline" className={`font-semibold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-muted/60 text-muted-foreground">
                    Source: {lead.source}
                  </Badge>
                  {lead.client && (
                    <Badge className="bg-emerald-600 text-white gap-1">
                      <UserCheck className="h-3 w-3" />
                      Converted Client
                    </Badge>
                  )}
                </div>

                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Received on{" "}
                  {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={`tel:${lead.phone}`}>
                  <Phone className="h-3.5 w-3.5 text-blue-600" />
                  <span>Call {lead.phone}</span>
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
              >
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hello ${lead.name}, thank you for contacting Faith Venture Realty. We received your inquiry regarding ${
                      lead.project?.name || lead.property?.title || "real estate"
                    }.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </Button>
              {lead.email && (
                <Button asChild variant="ghost" size="sm" className="gap-1.5">
                  <a href={`mailto:${lead.email}`}>
                    <Mail className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Email</span>
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (8 cols): Details, Requirement, Site Visits, Notes */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card: Inquiry & Property Interest */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>Inquiry Requirement &amp; Interest</span>
              </CardTitle>
              <CardDescription>
                Property details, budget expectations, and captured customer notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-muted/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Inquired Project / Property
                  </span>
                  {lead.project ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground">{lead.project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.project.locality}, {lead.project.city}
                        </p>
                      </div>
                      <Link
                        href={`/projects/${lead.project.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  ) : lead.property ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground">{lead.property.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {lead.property.locality}, {lead.property.city}
                        </p>
                      </div>
                      <Link
                        href={`/properties/${lead.property.slug}`}
                        target="_blank"
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">General / Unspecified Inquiry</p>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Indicative Budget
                  </span>
                  {lead.budget ? (
                    <p className="text-xl font-extrabold text-foreground">
                      {formatCompactINR(lead.budget)}
                      <span className="text-xs text-muted-foreground font-normal ml-1">
                        (₹{(lead.budget / 100000).toFixed(1)} Lakhs)
                      </span>
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">Not specified</p>
                  )}
                </div>
              </div>

              {lead.message && (
                <div className="p-4 rounded-xl border border-border bg-card">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Customer Message / Details
                  </span>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    "{lead.message}"
                  </p>
                </div>
              )}

              {/* Campaign attribution */}
              {(lead.utmSource || lead.utmCampaign || lead.refCode) && (
                <div className="pt-3 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
                  {lead.utmSource && (
                    <span>UTM Source: <strong className="text-foreground">{lead.utmSource}</strong></span>
                  )}
                  {lead.utmCampaign && (
                    <span>Campaign: <strong className="text-foreground">{lead.utmCampaign}</strong></span>
                  )}
                  {lead.refCode && (
                    <span>Referral Code: <strong className="text-foreground">{lead.refCode}</strong></span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Linked Site Visits */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Car className="h-4 w-4 text-primary" />
                  <span>Site Visits ({lead.siteVisits.length})</span>
                </CardTitle>
                {lead.clientId ? (
                  <Button asChild variant="outline" size="sm" className="text-xs gap-1">
                    <Link href={`/admin/clients/${lead.clientId}`}>
                      <Calendar className="h-3.5 w-3.5" />
                      Manage in Client
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConvertModal(true)}
                    className="text-xs gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Schedule via Client
                  </Button>
                )}
              </div>
              <CardDescription>
                Tours and in-person inspections associated with this lead
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lead.siteVisits.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                  No site visits recorded yet. Convert to Client to schedule VIP cab escorted tours.
                </div>
              ) : (
                <div className="space-y-3">
                  {lead.siteVisits.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground">
                            {new Date(v.scheduledAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {v.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Activities & Discussion Notes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Lead Activity Timeline &amp; Notes</span>
              </CardTitle>
              <CardDescription>
                Record discussion points, call logs, and team updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Log a call note, customer requirement, or follow-up note..."
                  rows={2}
                  className="resize-none text-sm"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isAddingNote || !newNote.trim()}
                    className="gap-1.5 font-semibold"
                  >
                    {isAddingNote ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    <span>Save Note</span>
                  </Button>
                </div>
              </form>

              {/* Activity Timeline List */}
              <div className="space-y-3 pt-3 border-t border-border">
                {lead.activities.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No activity logs recorded yet.
                  </p>
                ) : (
                  lead.activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-border/80 bg-muted/20 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                          {act.type.replace(/_/g, " ")}
                        </Badge>
                        <span>
                          {new Date(act.createdAt).toLocaleString("en-IN", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed pt-1">
                        {act.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Pipeline Status, Follow-up, Client Status */}
        <div className="space-y-6 lg:col-span-4">
          {/* Status & Next Follow-Up */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Pipeline Stage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lead Status</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  {STATUS_CONFIG[status]?.desc || ""}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Next Follow-Up Date &amp; Time</Label>
                <Input
                  type="datetime-local"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                  className="text-xs"
                />
              </div>

              {statusSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Pipeline status updated!</span>
                </div>
              )}

              <Button
                onClick={handleSaveStatus}
                disabled={savingStatus}
                className="w-full font-semibold gap-1.5"
              >
                {savingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Update Status</span>
              </Button>
            </CardContent>
          </Card>

          {/* Client Conversion Banner Card */}
          <Card className={lead.client ? "border-emerald-500/40 bg-emerald-500/5" : "border-primary/30 bg-primary/5"}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">
                  {lead.client ? "Client Master Linked" : "Convert Lead to Client"}
                </CardTitle>
              </div>
              <CardDescription>
                {lead.client
                  ? "This lead is attached to an official client account."
                  : "Graduate this inquiry into an active client record with booking management."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.client ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                    <p className="font-bold text-foreground text-sm">{lead.client.name}</p>
                    <p className="text-muted-foreground">{lead.client.phone}</p>
                    <Badge variant="outline" className="mt-1">
                      Type: {lead.client.type}
                    </Badge>
                  </div>
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    <Link href={`/admin/clients/${lead.client.id}`}>
                      View Full Client Profile →
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowConvertModal(true)}
                  className="w-full font-bold bg-primary text-white shadow-md gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Convert to Client Now</span>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Lead Assignment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Team Assignment</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Assigned Agent</span>
                <span className="font-semibold text-foreground">
                  {lead.assignedTo?.name || "Unassigned"}
                </span>
              </div>
              {lead.assignedTo?.email && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Agent Email</span>
                  <span className="font-medium">{lead.assignedTo.email}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lead ID</span>
                <span className="font-mono text-[10px] text-muted-foreground">{lead.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Convert to Client Modal Overlay */}
      {showConvertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Convert Lead to Client
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Create an official client profile in your CRM roster.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConvertModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConvert} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Client Classification *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["BUYER", "TENANT", "OWNER"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setConvertForm((prev) => ({ ...prev, type: t }))}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        convertForm.type === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t === "BUYER" ? "Property Buyer" : t === "TENANT" ? "Tenant" : "Property Owner"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    value={convertForm.name}
                    onChange={(e) =>
                      setConvertForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Phone Number *</Label>
                  <Input
                    value={convertForm.phone}
                    onChange={(e) =>
                      setConvertForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Email Address</Label>
                <Input
                  type="email"
                  value={convertForm.email}
                  onChange={(e) =>
                    setConvertForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="client@example.com"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Address / City</Label>
                <Input
                  value={convertForm.address}
                  onChange={(e) =>
                    setConvertForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="e.g. Scheme 54, Vijay Nagar, Indore"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Initial Client Notes</Label>
                <Textarea
                  value={convertForm.notes}
                  onChange={(e) =>
                    setConvertForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Property preferences, budget, or remarks..."
                  rows={2}
                  className="resize-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConvertModal(false)}
                  disabled={isConverting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isConverting}
                  className="bg-primary text-white font-bold gap-2"
                >
                  {isConverting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                  <span>Confirm &amp; Convert</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
