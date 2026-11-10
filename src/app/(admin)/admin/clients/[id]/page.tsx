"use client";

import { useCallback, useEffect, useState, use } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Home,
  CreditCard,
  User,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Edit,
  Save,
  Loader2,
  DollarSign,
  TrendingUp,
  Sparkles,
  Share2,
  Check,
  Clock,
  ArrowRight,
  Plus,
  X,
  AlertCircle,
  ShieldCheck,
  Layers,
  Banknote,
  ChevronRight,
} from "lucide-react";
import { formatCompactINR } from "@/lib/format";
import { ClientSiteVisitsTab } from "@/components/admin/client-site-visits-tab";

type BookingRecord = {
  id: string;
  agreementValue: number;
  tokenAmount: number;
  discount?: number;
  bookingDate: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  project?: { id: string; name: string; slug: string; city: string } | null;
  property?: { id: string; title: string; slug: string; price: number | null } | null;
  unit?: { id: string; unitNumber: string; tower?: string | null } | null;
  payments?: { id: string; amount: number; paymentMode: string; status: string; paidAt: string }[];
};

type ClientDetail = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  type: "BUYER" | "TENANT" | "OWNER";
  address: string | null;
  notes: string | null;
  createdAt: string;
  bookings: BookingRecord[];
  leads: {
    id: string;
    status: string;
    source: string;
    budget: number | null;
    message: string | null;
    createdAt: string;
  }[];
  siteVisits?: {
    id: string;
    scheduledAt: string;
    status: string;
    project?: { id: string; name: string } | null;
    property?: { id: string; title: string } | null;
  }[];
};

const TYPE_CONFIG = {
  BUYER: { label: "Property Buyer", color: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  TENANT: { label: "Tenant (Rent)", color: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  OWNER: { label: "Property Owner / Seller", color: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
};

const PIPELINE_STAGES = [
  { id: "INQUIRY", label: "1. Lead Inquiry", desc: "First contact & source captured" },
  { id: "REQUIREMENT", label: "2. Requirement Noted", desc: "Budget & unit type verified" },
  { id: "SITE_VISIT", label: "3. Site Visit Done", desc: "Walkthrough of township/flats" },
  { id: "NEGOTIATION", label: "4. In Negotiation", desc: "Price, payment plan & unit lock" },
  { id: "BOOKED", label: "5. Booked & Closed", desc: "Token advance & agreement executed" },
];

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("deals");

  // Profile Edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    email: "",
    type: "BUYER" as "BUYER" | "TENANT" | "OWNER",
    address: "",
    notes: "",
  });

  // Deal Requirements & Pipeline state
  const [dealStage, setDealStage] = useState<string>("REQUIREMENT");
  const [savingStage, setSavingStage] = useState(false);
  const [isEditingReq, setIsEditingReq] = useState(false);
  const [reqBudget, setReqBudget] = useState("₹75 Lakhs – ₹1.2 Crore");
  const [reqPreference, setReqPreference] = useState("3 BHK Luxury Apartment / Villa");
  const [reqLocality, setReqLocality] = useState("Indore (Super Corridor / Bypass)");
  const [reqTimeline, setReqTimeline] = useState("Immediate / Within 30 days");
  const [reqLoanStatus, setReqLoanStatus] = useState("Bank Pre-Approved (HDFC/SBI)");

  // Booking Modal / Form state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [projectList, setProjectList] = useState<{ id: string; name: string; city: string; priceMin: number | null }[]>([]);
  const [bookingForm, setBookingForm] = useState({
    projectId: "",
    unitNumber: "",
    agreementValue: "",
    tokenAmount: "",
    discount: "0",
    bookingDate: new Date().toISOString().split("T")[0],
    status: "CONFIRMED" as "CONFIRMED" | "PENDING" | "COMPLETED",
    paymentMode: "BANK_TRANSFER",
    paymentReference: "",
    notes: "",
  });

  // Load Client Data
  const loadClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${resolvedParams.id}`);
      if (!res.ok) throw new Error("Client not found");
      const data = await res.json();
      const c = data.client;
      setClient(c);
      setProfileForm({
        name: c.name,
        phone: c.phone,
        email: c.email || "",
        type: c.type,
        address: c.address || "",
        notes: c.notes || "",
      });

      // Derive initial deal stage
      if (c.bookings && c.bookings.length > 0) {
        setDealStage("BOOKED");
      } else if (c.siteVisits && c.siteVisits.length > 0) {
        setDealStage("SITE_VISIT");
      } else {
        setDealStage("REQUIREMENT");
      }

      // Parse requirements from notes if present
      if (c.notes) {
        if (c.notes.includes("Target Budget/Amount:")) {
          const match = c.notes.match(/Target Budget\/Amount:\s*([^|\n]+)/);
          if (match) setReqBudget(match[1].trim());
        }
        if (c.notes.includes("City:")) {
          const match = c.notes.match(/City:\s*([^|\n]+)/);
          if (match) setReqLocality(match[1].trim());
        }
        if (c.notes.includes("Requirement:")) {
          const match = c.notes.match(/Requirement:\s*([^|\n]+)/);
          if (match) setReqPreference(match[1].trim());
        }
      }
    } catch {
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    void loadClient();
  }, [loadClient]);

  // Load Projects for dropdowns & match suggestions
  useEffect(() => {
    fetch("/api/projects?limit=50")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.projects)) {
          setProjectList(data.projects);
          if (data.projects.length > 0 && !bookingForm.projectId) {
            setBookingForm((prev) => ({ ...prev, projectId: data.projects[0].id }));
          }
        }
      })
      .catch(() => {});
  }, []);

  // Update Deal Stage
  const handleSetDealStage = async (newStage: string) => {
    setDealStage(newStage);
    setSavingStage(true);
    try {
      if (!client) return;
      const stageNote = `[Pipeline Stage Updated]: ${PIPELINE_STAGES.find((s) => s.id === newStage)?.label} on ${new Date().toLocaleDateString("en-IN")}`;
      const updatedNotes = client.notes ? `${client.notes}\n• ${stageNote}` : stageNote;
      await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: updatedNotes }),
      });
      await loadClient();
    } catch {
      // ignore
    } finally {
      setSavingStage(false);
    }
  };

  // Save Requirements
  const handleSaveRequirements = async () => {
    if (!client) return;
    try {
      const compiledReq = `[Active Requirement]: Budget: ${reqBudget} | Pref: ${reqPreference} | Location: ${reqLocality} | Timeline: ${reqTimeline} | Loan: ${reqLoanStatus}`;
      const updatedNotes = client.notes ? `${client.notes}\n• ${compiledReq}` : compiledReq;
      await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: updatedNotes }),
      });
      await loadClient();
      setIsEditingReq(false);
    } catch {
      alert("Failed to save requirements.");
    }
  };

  // Handle Create Booking
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    const agreementVal = Number(bookingForm.agreementValue);
    if (!agreementVal || agreementVal <= 0) {
      setBookingError("Please enter a valid total agreement / deal value (in ₹).");
      return;
    }

    setSavingBooking(true);
    setBookingError(null);

    try {
      const res = await fetch(`/api/clients/${client.id}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: bookingForm.projectId || null,
          unitNumber: bookingForm.unitNumber.trim() || null,
          agreementValue: agreementVal,
          tokenAmount: Number(bookingForm.tokenAmount) || 0,
          discount: Number(bookingForm.discount) || 0,
          bookingDate: bookingForm.bookingDate || new Date().toISOString(),
          status: bookingForm.status,
          paymentMode: bookingForm.paymentMode,
          paymentReference: bookingForm.paymentReference.trim() || undefined,
          notes: bookingForm.notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record booking");

      setIsBookingOpen(false);
      setBookingForm({
        projectId: projectList[0]?.id || "",
        unitNumber: "",
        agreementValue: "",
        tokenAmount: "",
        discount: "0",
        bookingDate: new Date().toISOString().split("T")[0],
        status: "CONFIRMED",
        paymentMode: "BANK_TRANSFER",
        paymentReference: "",
        notes: "",
      });
      await loadClient();
      setDealStage("BOOKED");
      setActiveTab("bookings");
    } catch (err: any) {
      setBookingError(err.message || "Failed to save booking");
    } finally {
      setSavingBooking(false);
    }
  };

  // Handle Booking Status Update
  const handleUpdateBookingStatus = async (bookingId: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED") => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Status update failed");
      await loadClient();
    } catch {
      alert("Could not update booking status");
    }
  };

  // Handle Delete Booking
  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking record?")) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await loadClient();
    } catch {
      alert("Failed to delete booking");
    }
  };

  // Handle Profile Save
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/clients/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error("Update failed");
      await loadClient();
      setEditingProfile(false);
    } catch {
      alert("Failed to update client profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Client Delete
  const handleDeleteClient = async () => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${resolvedParams.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/admin/clients");
    } catch {
      alert("Failed to delete client");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-muted-foreground">Client not found.</p>
        <Button asChild variant="outline">
          <Link href="/admin/clients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
          </Link>
        </Button>
      </div>
    );
  }

  const cleanPhone = client.phone.replace(/[^0-9]/g, "");
  const totalBookedValue = client.bookings.reduce((sum, b) => sum + (Number(b.agreementValue) || 0), 0);
  const totalTokenReceived = client.bookings.reduce((sum, b) => sum + (Number(b.tokenAmount) || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Clients List
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => {
              setIsBookingOpen(true);
              setActiveTab("bookings");
            }}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>+ Record Booking</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("site-visits")}
            className="gap-1.5 text-xs font-medium"
          >
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Schedule Visit</span>
          </Button>

          {editingProfile ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingProfile(false)}
                disabled={savingProfile}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => void handleSaveProfile()} disabled={savingProfile}>
                {savingProfile ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
                <Edit className="mr-1.5 h-4 w-4" /> Edit Profile
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => void handleDeleteClient()}
                disabled={deleting}
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Client Identity Card */}
      <Card className="border border-border shadow-xs overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-primary text-2xl font-bold text-white shadow-md font-serif">
                {client.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
                    {client.name}
                  </h1>
                  <Badge
                    className={`ring-1 ring-inset ${
                      TYPE_CONFIG[client.type]?.color || "bg-muted text-foreground"
                    }`}
                  >
                    {TYPE_CONFIG[client.type]?.label || client.type}
                  </Badge>
                  {client.bookings.length > 0 && (
                    <Badge className="bg-emerald-600 text-white font-semibold">
                      Verified Buyer ({client.bookings.length} Booked)
                    </Badge>
                  )}
                </div>
                <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Client since{" "}
                  {new Date(client.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Direct Connect Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={`tel:${client.phone}`}>
                  <Phone className="h-3.5 w-3.5 text-blue-600" />
                  Call {client.phone}
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hello ${client.name}, this is your relationship manager from Faith Venture Realty. We have shortlisted exclusive units matching your requirement.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </Button>
              {client.email && (
                <Button asChild variant="ghost" size="sm" className="gap-1.5">
                  <a href={`mailto:${client.email}`}>
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="mt-6 pt-5 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-muted-foreground font-medium">Total Deal Value Booked</span>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {totalBookedValue > 0 ? formatCompactINR(totalBookedValue) : "₹0 (In Pipeline)"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-muted-foreground font-medium">Token Advance Collected</span>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {totalTokenReceived > 0 ? formatCompactINR(totalTokenReceived) : "₹0"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-muted-foreground font-medium">Deals &amp; Units Booked</span>
              <p className="text-lg font-bold text-foreground mt-0.5">
                {client.bookings.length} {client.bookings.length === 1 ? "Unit" : "Units"}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-muted-foreground font-medium">Pipeline Stage</span>
              <p className="text-lg font-bold text-primary mt-0.5">
                {PIPELINE_STAGES.find((s) => s.id === dealStage)?.label.replace(/^\d+\.\s*/, "") || "Active Deal"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-3xl">
          <TabsTrigger value="deals" className="gap-1.5 text-xs font-semibold">
            <TrendingUp className="h-4 w-4" />
            <span>Deal Pipeline &amp; Match</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-1.5 text-xs font-semibold">
            <CreditCard className="h-4 w-4" />
            <span>Bookings ({client.bookings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="site-visits" className="gap-1.5 text-xs font-semibold">
            <MapPin className="h-4 w-4" />
            <span>Site Visits</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5 text-xs font-semibold">
            <User className="h-4 w-4" />
            <span>Client KYC &amp; Profile</span>
          </TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* TAB 1: REAL ACTIONABLE DEAL PIPELINE & REQUIREMENTS               */}
        {/* ================================================================= */}
        <TabsContent value="deals" className="space-y-6 pt-4">
          {/* A. Visual Pipeline Progress Stepper */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>Active Deal Journey &amp; Pipeline</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Click any stage to advance or update this client&apos;s active deal progress.
                  </CardDescription>
                </div>
                {savingStage && (
                  <span className="text-xs text-primary flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Saving stage...
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {PIPELINE_STAGES.map((st, idx) => {
                  const currentIdx = PIPELINE_STAGES.findIndex((s) => s.id === dealStage);
                  const isCompleted = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => void handleSetDealStage(st.id)}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : isCompleted
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                          : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80">
                          Step {idx + 1}
                        </span>
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : isCurrent ? (
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        ) : null}
                      </div>
                      <p className="font-bold text-xs mt-1">{st.label.replace(/^\d+\.\s*/, "")}</p>
                      <p className="text-[11px] opacity-75 mt-0.5 line-clamp-1">{st.desc}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* B. Actionable Client Requirements Card */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span>Client Requirements &amp; Financial Capability</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Target configuration, budget range, and loan readiness for closing deals
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingReq(!isEditingReq)}
                  className="text-xs"
                >
                  {isEditingReq ? "Cancel" : "Edit Requirements"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEditingReq ? (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Budget Range</Label>
                      <Input
                        value={reqBudget}
                        onChange={(e) => setReqBudget(e.target.value)}
                        placeholder="e.g. ₹75 Lakhs – ₹1.2 Crore"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Property Preference</Label>
                      <Input
                        value={reqPreference}
                        onChange={(e) => setReqPreference(e.target.value)}
                        placeholder="e.g. 3 BHK Luxury Apartment / Villa"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Target Locality / City</Label>
                      <Input
                        value={reqLocality}
                        onChange={(e) => setReqLocality(e.target.value)}
                        placeholder="e.g. Indore (Super Corridor / Bypass Road)"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Home Loan Status</Label>
                      <Input
                        value={reqLoanStatus}
                        onChange={(e) => setReqLoanStatus(e.target.value)}
                        placeholder="e.g. Bank Pre-Approved (SBI / HDFC)"
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button type="button" size="sm" onClick={() => void handleSaveRequirements()}>
                      Save Requirements
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3 p-4 rounded-xl bg-card border border-border">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground font-medium">Target Budget</span>
                      <span className="font-bold text-foreground text-sm">{reqBudget}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground font-medium">Configuration</span>
                      <span className="font-semibold text-foreground">{reqPreference}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground font-medium">Locality / City</span>
                      <span className="font-medium text-foreground">{reqLocality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Timeline</span>
                      <span className="font-medium text-foreground">{reqTimeline}</span>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 rounded-xl bg-card border border-border">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground font-medium">Bank Loan Eligibility</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{reqLoanStatus}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground font-medium">Brokerage Agreement</span>
                      <span className="font-semibold text-emerald-600">Direct Developer Partner Terms</span>
                    </div>
                    <div className="space-y-1 pt-1">
                      <span className="text-muted-foreground font-medium">Raw Notes / Message</span>
                      <p className="text-slate-600 dark:text-slate-300 italic whitespace-pre-wrap leading-relaxed">
                        {client.notes || "No special requirements recorded."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* C. Suggested Projects & Fast Booking / Visit Triggers */}
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Matching Developer Inventory &amp; Quick Actions</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Quickly book a unit, schedule a visit, or share project details directly with {client.name}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {projectList.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No projects in database yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectList.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col justify-between p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm text-foreground">{p.name}</h4>
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                            {p.city}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {p.priceMin ? `Starting from ${formatCompactINR(p.priceMin)}` : "Price on request"}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            setBookingForm((prev) => ({ ...prev, projectId: p.id }));
                            setIsBookingOpen(true);
                            setActiveTab("bookings");
                          }}
                          className="text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Record Booking</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("site-visits")}
                          className="text-xs gap-1"
                        >
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span>Schedule Visit</span>
                        </Button>

                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Hi ${client.name}, here are details and brochure for ${p.name} in ${p.city}. Let me know when you'd like to inspect the site!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Share</span>
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 2: TRANSACTIONS & BOOKINGS (WITH RECORD BOOKING MODAL/FORM)    */}
        {/* ================================================================= */}
        <TabsContent value="bookings" className="space-y-6 pt-4">
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span>Transactions, Bookings &amp; Deal Closures</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Record closed property bookings, agreement values, token advances, and developer commissions.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsBookingOpen(!isBookingOpen)}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isBookingOpen ? "Close Form" : "+ Record New Booking"}</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Record Booking Form / Modal */}
              {isBookingOpen && (
                <div className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-emerald-600" />
                      <h3 className="font-bold text-sm text-foreground">
                        Record Deal Booking for {client.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBookingOpen(false)}
                      className="text-muted-foreground hover:text-foreground text-xs p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {bookingError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateBooking} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Project Dropdown */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Select Project *</Label>
                        <select
                          value={bookingForm.projectId}
                          onChange={(e) => setBookingForm({ ...bookingForm, projectId: e.target.value })}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="">-- Direct / Custom Booking --</option>
                          {projectList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.city})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Unit / Flat Number */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Unit / Flat / Plot #</Label>
                        <Input
                          value={bookingForm.unitNumber}
                          onChange={(e) => setBookingForm({ ...bookingForm, unitNumber: e.target.value })}
                          placeholder="e.g. Tower T2 - Flat 402, or Villa 12"
                          className="text-xs"
                        />
                      </div>

                      {/* Booking Date */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Booking Date *</Label>
                        <Input
                          type="date"
                          value={bookingForm.bookingDate}
                          onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                          className="text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Total Agreement Value */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Total Agreement Value (₹) *</Label>
                        <Input
                          type="number"
                          value={bookingForm.agreementValue}
                          onChange={(e) => setBookingForm({ ...bookingForm, agreementValue: e.target.value })}
                          placeholder="e.g. 8500000"
                          className="text-xs font-semibold text-foreground"
                          required
                        />
                        {bookingForm.agreementValue && Number(bookingForm.agreementValue) > 0 && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            = {formatCompactINR(Number(bookingForm.agreementValue))}
                          </span>
                        )}
                      </div>

                      {/* Token Advance Amount */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Token / Advance Amount Paid (₹)</Label>
                        <Input
                          type="number"
                          value={bookingForm.tokenAmount}
                          onChange={(e) => setBookingForm({ ...bookingForm, tokenAmount: e.target.value })}
                          placeholder="e.g. 500000"
                          className="text-xs font-semibold text-emerald-600"
                        />
                        {bookingForm.tokenAmount && Number(bookingForm.tokenAmount) > 0 && (
                          <span className="text-[11px] text-emerald-600 font-mono">
                            = {formatCompactINR(Number(bookingForm.tokenAmount))}
                          </span>
                        )}
                      </div>

                      {/* Payment Mode */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Payment Mode</Label>
                        <select
                          value={bookingForm.paymentMode}
                          onChange={(e) => setBookingForm({ ...bookingForm, paymentMode: e.target.value })}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="BANK_TRANSFER">Bank Transfer (RTGS / NEFT / IMPS)</option>
                          <option value="CHEQUE">Bank Cheque / DD</option>
                          <option value="UPI">UPI / QR Code</option>
                          <option value="CASH">Cash Deposit</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Payment Reference */}
                      <div className="space-y-1.5">
                        <Label className="text-xs">Cheque # / UTR / Transaction Reference</Label>
                        <Input
                          value={bookingForm.paymentReference}
                          onChange={(e) => setBookingForm({ ...bookingForm, paymentReference: e.target.value })}
                          placeholder="e.g. UTR-99882190 or Cheque #004521"
                          className="text-xs"
                        />
                      </div>

                      {/* Status */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Booking Status</Label>
                        <select
                          value={bookingForm.status}
                          onChange={(e) => setBookingForm({ ...bookingForm, status: e.target.value as any })}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="CONFIRMED">CONFIRMED (Token Advance Cleared)</option>
                          <option value="PENDING">PENDING (Cheque / KYC in progress)</option>
                          <option value="COMPLETED">COMPLETED (Agreement Executed &amp; Handover)</option>
                        </select>
                      </div>
                    </div>

                    {/* Deal & Brokerage Notes */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Terms &amp; Brokerage Notes</Label>
                      <Textarea
                        rows={2}
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                        placeholder="e.g. 2% Developer brokerage terms agreed. Client opted for CLP payment plan."
                        className="text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-500/20">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsBookingOpen(false)}
                        disabled={savingBooking}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={savingBooking}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                      >
                        {savingBooking ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Recording Booking...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Confirm &amp; Record Booking</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Bookings List Display */}
              {client.bookings.length === 0 && !isBookingOpen ? (
                <div className="py-12 text-center text-muted-foreground rounded-2xl border border-dashed border-border p-8">
                  <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="font-semibold text-foreground text-sm">No bookings recorded yet for {client.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    When this client chooses a property or flat, click below to record agreement value, token advance, and booking status.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="mt-4 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Record First Booking</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {client.bookings.map((b) => {
                    const balanceDue = (b.agreementValue || 0) - (b.tokenAmount || 0);

                    return (
                      <div
                        key={b.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border p-4 sm:p-5 hover:border-emerald-500/40 bg-card transition-all shadow-xs"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-base text-foreground">
                              {b.project?.name || b.property?.title || "Property Deal Booking"}
                            </h4>
                            <Badge
                              className={`text-[10px] font-bold ${
                                b.status === "CONFIRMED"
                                  ? "bg-emerald-600 text-white"
                                  : b.status === "COMPLETED"
                                  ? "bg-blue-600 text-white"
                                  : b.status === "CANCELLED"
                                  ? "bg-rose-600 text-white"
                                  : "bg-amber-600 text-white"
                              }`}
                            >
                              {b.status}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {b.unit?.unitNumber && (
                              <span>Unit: <strong>{b.unit.unitNumber}</strong></span>
                            )}
                            {b.project?.city && (
                              <span>Location: {b.project.city}</span>
                            )}
                            <span>
                              Booking Date: {new Date(b.bookingDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Values & Action Controls */}
                        <div className="flex flex-wrap items-center gap-4 sm:justify-end">
                          <div className="text-left sm:text-right">
                            <p className="text-base font-extrabold text-foreground">
                              {formatCompactINR(b.agreementValue)}
                            </p>
                            <p className="text-xs text-emerald-600 font-medium">
                              Token Paid: {formatCompactINR(b.tokenAmount)}
                            </p>
                            {balanceDue > 0 && (
                              <p className="text-[11px] text-muted-foreground">
                                Balance: {formatCompactINR(balanceDue)}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {b.status !== "COMPLETED" && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void handleUpdateBookingStatus(b.id, "COMPLETED")}
                                className="text-[11px] h-8 text-blue-600 hover:text-blue-700"
                                title="Mark as Completed"
                              >
                                Complete
                              </Button>
                            )}

                            {b.status === "PENDING" && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void handleUpdateBookingStatus(b.id, "CONFIRMED")}
                                className="text-[11px] h-8 text-emerald-600 hover:text-emerald-700"
                                title="Confirm Booking"
                              >
                                Confirm
                              </Button>
                            )}

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleDeleteBooking(b.id)}
                              className="text-muted-foreground hover:text-rose-600 h-8 w-8 p-0"
                              title="Delete Booking"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 3: SITE VISITS TAB                                            */}
        {/* ================================================================= */}
        <TabsContent value="site-visits" className="space-y-6 pt-4">
          <ClientSiteVisitsTab clientId={client.id} clientName={client.name} />
        </TabsContent>

        {/* ================================================================= */}
        {/* TAB 4: CLIENT PROFILE DETAILS & KYC                               */}
        {/* ================================================================= */}
        <TabsContent value="profile" className="space-y-6 pt-4">
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Client Contact &amp; CRM Dossier</CardTitle>
                  <CardDescription className="text-xs">
                    Official contact information and complete lead conversation history
                  </CardDescription>
                </div>
                {!editingProfile && (
                  <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)} className="text-xs">
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingProfile ? (
                <div className="space-y-4 pt-2">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Client Full Name</Label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Phone Number</Label>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email Address</Label>
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Client Category</Label>
                      <select
                        value={profileForm.type}
                        onChange={(e) => setProfileForm((p) => ({ ...p, type: e.target.value as any }))}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="BUYER">Property Buyer</option>
                        <option value="TENANT">Tenant (Rental)</option>
                        <option value="OWNER">Property Owner / Seller</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Residential Address</Label>
                    <Input
                      value={profileForm.address}
                      onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="e.g. Scheme 78, Vijay Nagar, Indore"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Internal CRM Notes</Label>
                    <Textarea
                      rows={3}
                      value={profileForm.notes}
                      onChange={(e) => setProfileForm((p) => ({ ...p, notes: e.target.value }))}
                      className="text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => void handleSaveProfile()} disabled={savingProfile}>
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 text-xs">
                  <div className="space-y-3">
                    <div className="border-b pb-2">
                      <span className="text-muted-foreground font-medium">Phone Number</span>
                      <p className="font-semibold text-foreground text-sm mt-0.5">{client.phone}</p>
                    </div>
                    <div className="border-b pb-2">
                      <span className="text-muted-foreground font-medium">Email Address</span>
                      <p className="font-medium text-foreground mt-0.5">{client.email || "—"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium">Category</span>
                      <p className="font-medium text-foreground mt-0.5">{TYPE_CONFIG[client.type]?.label}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="border-b pb-2">
                      <span className="text-muted-foreground font-medium">Address</span>
                      <p className="font-medium text-foreground mt-0.5">{client.address || "Not recorded"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium">Internal CRM History &amp; Requirements</span>
                      <p className="font-medium text-foreground whitespace-pre-wrap mt-0.5 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border">
                        {client.notes || "No notes recorded yet."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
