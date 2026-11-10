"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  MapPin,
  Car,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Star,
  Trash2,
  Building2,
  Loader2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface SiteVisitRecord {
  id: string;
  clientId: string;
  projectId?: string | null;
  propertyId?: string | null;
  scheduledAt: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  feedback?: string | null;
  rating?: number | null;
  notes?: string | null;
  pickupRequired: boolean;
  pickupAddress?: string | null;
  createdAt: string;
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
  } | null;
  organizedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const STATUS_BADGES = {
  SCHEDULED: { label: "Scheduled", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  COMPLETED: { label: "Completed", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  CANCELLED: { label: "Cancelled", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  NO_SHOW: { label: "No-Show", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

export function ClientSiteVisitsTab({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [visits, setVisits] = useState<SiteVisitRecord[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; city: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [isScheduling, setIsScheduling] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // New visit form state
  const [formProjectId, setFormProjectId] = useState("");
  const [formScheduledAt, setFormScheduledAt] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Complete visit form state
  const [completeFeedback, setCompleteFeedback] = useState("");
  const [completeRating, setCompleteRating] = useState(5);

  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/${clientId}/site-visits`);
      if (res.ok) {
        const data = await res.json();
        setVisits(data.visits || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Load projects list for dropdown
  useEffect(() => {
    fetch("/api/projects?limit=100")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.projects) {
          setProjects(data.projects);
          if (data.projects[0]) setFormProjectId(data.projects[0].id);
        }
      })
      .catch(() => undefined);

    void fetchVisits();
  }, [clientId, fetchVisits]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formScheduledAt) {
      alert("Please select a date and time for the site visit.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/site-visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: formProjectId || null,
          scheduledAt: formScheduledAt,
          notes: formNotes,
          status: "SCHEDULED",
        }),
      });

      if (!res.ok) throw new Error("Failed to schedule site visit");

      setIsScheduling(false);
      setFormNotes("");
      await fetchVisits();
    } catch (err) {
      console.error(err);
      alert("Could not schedule site visit.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    visitId: string,
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
    extra?: { feedback?: string; rating?: number }
  ) => {
    try {
      const res = await fetch(`/api/site-visits/${visitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      setCompletingId(null);
      await fetchVisits();
    } catch (err) {
      console.error(err);
      alert("Failed to update site visit status.");
    }
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (!confirm("Are you sure you want to remove this site visit record?")) return;
    try {
      const res = await fetch(`/api/site-visits/${visitId}`, { method: "DELETE" });
      if (res.ok) {
        setVisits((prev) => prev.filter((v) => v.id !== visitId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scheduledCount = visits.filter((v) => v.status === "SCHEDULED").length;
  const completedCount = visits.filter((v) => v.status === "COMPLETED").length;
  const cancelledCount = visits.filter((v) => v.status === "CANCELLED").length;

  return (
    <div className="space-y-6 pt-4">
      {/* Top Banner & Metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-card shadow-xs border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium">Total Site Visits</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{visits.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-xs border">
          <CardContent className="p-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Upcoming Scheduled</p>
            <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{scheduledCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-xs border">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Completed Visits</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{completedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-xs border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Cancelled / No-Show</p>
              <p className="text-2xl font-bold mt-1 text-muted-foreground">{cancelledCount}</p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsScheduling(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Schedule Visit</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Visit Modal Form */}
      {isScheduling && (
        <Card className="border-primary/40 bg-primary/5 shadow-md animate-in fade-in duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Schedule Site Visit for {clientName}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Pick target project, date, VIP cab service, and visit agenda.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsScheduling(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Select Project *</Label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formScheduledAt}
                    onChange={(e) => setFormScheduledAt(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pre-Visit Notes / Unit Preferences</Label>
                <Textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Client interested in 3 BHK corner unit with park view. Wants to inspect clubhouse amenities."
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduling(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="text-xs font-bold gap-1"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Confirm Site Visit</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Visits List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Site Visit History &amp; Records</span>
            <span className="text-xs font-normal text-muted-foreground">
              Total {visits.length} scheduled visits
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading site visit records...</span>
            </div>
          ) : visits.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
              No site visits recorded for this client yet. Click &ldquo;Schedule Visit&rdquo; above to record a site tour.
            </div>
          ) : (
            <div className="space-y-3">
              {visits.map((visit) => {
                const badgeInfo = STATUS_BADGES[visit.status] || STATUS_BADGES.SCHEDULED;
                const dateObj = new Date(visit.scheduledAt);
                const formattedDate = dateObj.toLocaleDateString("en-IN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={visit.id}
                    className="p-4 rounded-xl border bg-card hover:border-primary/40 transition-colors shadow-2xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {visit.project?.name || visit.property?.title || "Property Visit"}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {visit.project?.locality || visit.property?.locality || "Central India"},{" "}
                              {visit.project?.city || visit.property?.city || "Indore"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeInfo.color}`}
                        >
                          {badgeInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Date & Details */}
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-4 border-t pt-2.5">
                      <span className="flex items-center gap-1.5 text-foreground font-medium">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>{formattedDate}</span>
                      </span>
                      {visit.notes && (
                        <span className="italic text-slate-500 dark:text-slate-400">
                          &ldquo;{visit.notes}&rdquo;
                        </span>
                      )}
                    </div>

                    {/* Completion Feedback & Rating */}
                    {visit.status === "COMPLETED" && (
                      <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                          {[...Array(visit.rating || 5)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                          <span className="text-[11px] text-muted-foreground ml-1">
                            {visit.rating || 5}/5 Experience Rating
                          </span>
                        </div>
                        {visit.feedback && (
                          <p className="text-foreground leading-relaxed">
                            {visit.feedback}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Completing Dialog Inline */}
                    {completingId === visit.id && (
                      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 space-y-2 animate-in fade-in">
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          Record Client Feedback &amp; Complete Visit
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <Label className="text-[11px]">Client Rating (1-5 Stars)</Label>
                            <select
                              value={completeRating}
                              onChange={(e) => setCompleteRating(Number(e.target.value))}
                              className="w-full h-8 rounded border border-input bg-background px-2 text-xs"
                            >
                              <option value={5}>⭐⭐⭐⭐⭐ 5 - Highly Interested</option>
                              <option value={4}>⭐⭐⭐⭐ 4 - Good, Liked Layout</option>
                              <option value={3}>⭐⭐⭐ 3 - Neutral / Considering</option>
                              <option value={2}>⭐⭐ 2 - Pricing High</option>
                              <option value={1}>⭐ 1 - Not Interested</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-[11px]">Feedback &amp; Next Action</Label>
                            <Input
                              value={completeFeedback}
                              onChange={(e) => setCompleteFeedback(e.target.value)}
                              placeholder="e.g. Liked 12th floor unit, wants payment plan."
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => setCompletingId(null)}
                            className="text-xs"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="xs"
                            onClick={() =>
                              handleUpdateStatus(visit.id, "COMPLETED", {
                                feedback: completeFeedback,
                                rating: completeRating,
                              })
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                          >
                            Save Completed Visit
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between border-t pt-2">
                      <div className="flex items-center gap-1.5">
                        {visit.status === "SCHEDULED" && (
                          <>
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() => {
                                setCompletingId(visit.id);
                                setCompleteFeedback(visit.notes || "");
                              }}
                              className="text-xs text-emerald-600 hover:text-emerald-700 border-emerald-500/30 gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Mark Done</span>
                            </Button>
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() => handleUpdateStatus(visit.id, "NO_SHOW")}
                              className="text-xs text-amber-600 hover:text-amber-700 border-amber-500/30"
                            >
                              No-Show
                            </Button>
                            <Button
                              type="button"
                              size="xs"
                              variant="outline"
                              onClick={() => handleUpdateStatus(visit.id, "CANCELLED")}
                              className="text-xs text-rose-600 hover:text-rose-700 border-rose-500/30"
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {visit.status !== "SCHEDULED" && (
                          <Button
                            type="button"
                            size="xs"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(visit.id, "SCHEDULED")}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Re-Open
                          </Button>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteVisit(visit.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                        title="Delete record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
