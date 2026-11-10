"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Home,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Check,
  ArrowLeft,
  Upload,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Video,
  AlertCircle,
  Sparkles,
  Save,
  ExternalLink,
  Layers,
  HelpCircle,
  FileCheck,
  CreditCard,
  Percent,
  FolderArchive,
  Eye,
  Loader2,
  Crown,
  FileDown,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { updateProjectAction, createProjectAction } from "@/modules/project/actions";
import { VideoGalleryField } from "@/components/admin/video-gallery-field";
import type { VideoMediaItem } from "@/lib/video-utils";

export type ProjectInitialData = Record<string, any> & { id?: string };

type ContentBlock = {
  id: string;
  type: "TEXT" | "VIDEO" | "HIGHLIGHTS" | "CALLOUT" | "FAQ";
  title?: string;
  content?: string;
  videoUrl?: string;
  items?: string[];
  question?: string;
  answer?: string;
};

type PaymentMilestone = {
  id: string;
  stage: string;
  percentage: number;
  dueCondition: string;
};

type ProjectDocument = {
  id: string;
  title: string;
  category: string;
  url: string;
  size?: number;
  uploadedAt: string;
};

type CadFile = {
  id: string;
  fileName: string;
  url: string;
  size: number;
  type: "AUTOCAD_DWG" | "AUTOCAD_DXF" | "MODEL_3D_GLTF" | "MODEL_3D_GLB" | "MODEL_3D_OBJ" | "OTHER";
  uploadedAt: string;
};

export function ProjectForm({
  initialData,
}: {
  initialData?: ProjectInitialData | null;
}) {
  const router = useRouter();
  const isEdit = Boolean(initialData?.id);
  const projectId = initialData?.id;

  // Active section scroll indicator
  const [activeSection, setActiveSection] = useState("basics");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Core Basics
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [builderId, setBuilderId] = useState(initialData?.builderId || "");
  const [type, setType] = useState(initialData?.type || "TOWNSHIP");
  const [status, setStatus] = useState(initialData?.status || "NEW_LAUNCH");
  const [featured, setFeatured] = useState(Boolean(initialData?.featured));
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);

  // 2. Location
  const [city, setCity] = useState(initialData?.city || "Indore");
  const [locality, setLocality] = useState(initialData?.locality || "");
  const [pincode, setPincode] = useState(initialData?.pincode || "");
  const [reraNo, setReraNo] = useState(initialData?.reraNo || "");
  const [lat, setLat] = useState(initialData?.lat ? String(initialData.lat) : "");
  const [lng, setLng] = useState(initialData?.lng ? String(initialData.lng) : "");

  // 3. Configurations & Pricing
  const [priceMin, setPriceMin] = useState(
    initialData?.priceMin ? String(initialData.priceMin) : ""
  );
  const [priceMax, setPriceMax] = useState(
    initialData?.priceMax ? String(initialData.priceMax) : ""
  );
  const [areaMin, setAreaMin] = useState(
    initialData?.areaMin ? String(initialData.areaMin) : ""
  );
  const [areaMax, setAreaMax] = useState(
    initialData?.areaMax ? String(initialData.areaMax) : ""
  );
  const [towers, setTowers] = useState(
    initialData?.towers ? String(initialData.towers) : "4"
  );
  const [totalUnits, setTotalUnits] = useState(
    initialData?.totalUnits ? String(initialData.totalUnits) : "384"
  );
  const [launchDate, setLaunchDate] = useState(
    initialData?.launchDate
      ? new Date(initialData.launchDate).toISOString().split("T")[0]
      : ""
  );
  const [possessionDate, setPossessionDate] = useState(
    initialData?.possessionDate
      ? new Date(initialData.possessionDate).toISOString().split("T")[0]
      : ""
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  // Builders list for dropdown
  const [buildersList, setBuildersList] = useState<{ id: string; name: string }[]>([]);

  // 4. Media & CAD/3D Files
  const [images, setImages] = useState<string[]>(
    Array.isArray(initialData?.images) ? initialData?.images : []
  );
  const [cadFiles, setCadFiles] = useState<CadFile[]>(
    Array.isArray(initialData?.cadFiles)
      ? (initialData.cadFiles as CadFile[])
      : []
  );
  const [brochureUrl, setBrochureUrl] = useState(initialData?.brochureId || "");
  const [virtualTourUrl, setVirtualTourUrl] = useState(
    initialData?.virtualTourUrl || ""
  );

  // 4b. Videos, Shorts & FB Reels Gallery
  const [videoList, setVideoList] = useState<VideoMediaItem[]>(() => {
    if (Array.isArray(initialData?.videoUrls)) return initialData.videoUrls;
    if (typeof initialData?.videoUrls === "string") {
      try {
        const parsed = JSON.parse(initialData.videoUrls);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return [];
  });

  // Banner Settings & Toggle
  const initialBanner = (initialData?.bannerConfig as Record<string, any>) || {};
  const [showBanner, setShowBanner] = useState<boolean>(
    initialBanner.showBanner !== undefined ? Boolean(initialBanner.showBanner) : true
  );
  const [bannerHeadline, setBannerHeadline] = useState<string>(initialBanner.headline || "");
  const [bannerTagline, setBannerTagline] = useState<string>(initialBanner.tagline || "");
  const [bannerBadge, setBannerBadge] = useState<string>(initialBanner.badge || "");
  const [bannerImage, setBannerImage] = useState<string>(initialBanner.imageUrl || "");

  // 5. Documents & Clearances
  const [documents, setDocuments] = useState<ProjectDocument[]>(
    Array.isArray(initialData?.documents)
      ? initialData?.documents
      : [
          {
            id: "doc-1",
            title: "Official RERA Registration Certificate",
            category: "RERA",
            url: "/uploads/rera-certificate.pdf",
            uploadedAt: "2026-11-01",
          },
          {
            id: "doc-2",
            title: "Town & Country Planning Sanction Map",
            category: "SANCTION_PLAN",
            url: "/uploads/sanction-plan.pdf",
            uploadedAt: "2026-11-01",
          },
        ]
  );

  // 6. Payment Plans & Milestones
  const [paymentPlanName, setPaymentPlanName] = useState("Construction Linked Payment Plan (CLP)");
  const [milestones, setMilestones] = useState<PaymentMilestone[]>(
    Array.isArray(initialData?.paymentPlan?.milestones)
      ? initialData?.paymentPlan.milestones
      : [
          { id: "m1", stage: "Token Booking Advance", percentage: 10, dueCondition: "At time of booking" },
          { id: "m2", stage: "On Execution of Agreement", percentage: 10, dueCondition: "Within 30 days of booking" },
          { id: "m3", stage: "On Completion of Plinth Level", percentage: 15, dueCondition: "Foundation casting" },
          { id: "m4", stage: "On Casting of 10th Floor Slab", percentage: 15, dueCondition: "Super-structure milestone" },
          { id: "m5", stage: "On Casting of 23rd Top Roof Slab", percentage: 15, dueCondition: "Terrace completion" },
          { id: "m6", stage: "On Brickwork & External Plaster", percentage: 15, dueCondition: "Finishing milestone" },
          { id: "m7", stage: "On Notice of Possession & Registry", percentage: 20, dueCondition: "Handover with OC" },
        ]
  );

  // 7. Commission & Brokerage Slab
  const [baseCommission, setBaseCommission] = useState(
    initialData?.commission?.base || "2.5"
  );
  const [bonusCommission, setBonusCommission] = useState(
    initialData?.commission?.bonus || "0.5"
  );
  const [payoutSchedule, setPayoutSchedule] = useState(
    initialData?.commission?.payout || "50% on Builder Agreement signing, 50% on 1st installment clearance."
  );

  // 8. WordPress-Style Custom Block Builder (Reorderable Up / Down)
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    Array.isArray(initialData?.customBlocks)
      ? initialData?.customBlocks
      : [
          {
            id: "b1",
            type: "HIGHLIGHTS",
            title: "Project Architectural USPs",
            items: [
              "27-Acre Master Township with 75% Landscaped Open Forest Greens",
              "4 Iconic High-Rise Towers (T1-T4, G+23 Floors) with Alternating Odd-Even Sky Decks",
              "Presidential Bungalow Enclave featuring 4 BHK to 8 BHK Private Pool Villas",
              "50,000 sq ft Lifestyle Clubhouse 'The Grand Solitaire' with Olympic Lap Pool",
              "DGCA Certified Private Rooftop Helipad for VIP Air Mobility",
            ],
          },
          {
            id: "b2",
            type: "VIDEO",
            title: "Official 4K Drone Walkthrough & Site Tour",
            videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          },
          {
            id: "b3",
            type: "CALLOUT",
            title: "Exclusive Launch Offer & NRI Priority Allocation",
            content: "Direct official pricing for priority buyers. Special 10:80:10 subvention payment schedule and dedicated FEMA/NRE wealth desk for international investors.",
          },
        ]
  );

  // 9. SEO & Metadata
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    initialData?.seoDescription || ""
  );

  const [isUploadingCad, setIsUploadingCad] = useState(false);
  const [cadUploadError, setCadUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch builders on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/builders?limit=100");
        const data = await res.json();
        if (data.builders?.length > 0) {
          setBuildersList(data.builders);
          if (!builderId && !isEdit) {
            setBuilderId(data.builders[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load builders", e);
      }
    })();
  }, [builderId, isEdit]);

  // Auto-generate slug from name if not custom
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  // --- Real File Upload Handler ---
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    typeCategory: "IMAGE" | "CAD_3D" | "DOCUMENT" | "BROCHURE"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (typeCategory === "CAD_3D") {
      setIsUploadingCad(true);
      setCadUploadError(null);
    } else if (typeCategory === "IMAGE") {
      setIsUploadingImage(true);
    }

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt", file.name);

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.media) {
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }

        const url = data.media.url;
        if (typeCategory === "IMAGE") {
          setImages((prev) => [...prev, url]);
        } else if (typeCategory === "CAD_3D") {
          const ext = file.name.split(".").pop()?.toLowerCase();
          let cType: CadFile["type"] = "OTHER";
          if (ext === "dwg") cType = "AUTOCAD_DWG";
          else if (ext === "dxf") cType = "AUTOCAD_DXF";
          else if (ext === "gltf") cType = "MODEL_3D_GLTF";
          else if (ext === "glb") cType = "MODEL_3D_GLB";
          else if (ext === "obj") cType = "MODEL_3D_OBJ";

          setCadFiles((prev) => [
            ...prev,
            {
              id: `cad-${Date.now()}-${i}`,
              fileName: file.name,
              url,
              size: file.size,
              type: cType,
              uploadedAt: new Date().toISOString().split("T")[0],
            },
          ]);
        } else if (typeCategory === "DOCUMENT") {
          setDocuments((prev) => [
            ...prev,
            {
              id: `doc-${Date.now()}-${i}`,
              title: file.name.replace(/\.[^/.]+$/, ""),
              category: "GENERAL",
              url,
              size: file.size,
              uploadedAt: new Date().toISOString().split("T")[0],
            },
          ]);
        } else if (typeCategory === "BROCHURE") {
          setBrochureUrl(url);
        }
      }
    } catch (err: any) {
      console.error("Upload failed", err);
      if (typeCategory === "CAD_3D") {
        setCadUploadError(err.message || "Failed to upload CAD / 3D file.");
      } else {
        alert(err.message || "Upload failed");
      }
    } finally {
      if (typeCategory === "CAD_3D") {
        setIsUploadingCad(false);
      } else if (typeCategory === "IMAGE") {
        setIsUploadingImage(false);
      }
      e.target.value = "";
    }
  };

  // --- Payment Milestones Handlers ---
  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        id: `m-${Date.now()}`,
        stage: "Next Milestone Stage",
        percentage: 10,
        dueCondition: "On progress completion",
      },
    ]);
  };

  const handleUpdateMilestone = (
    idx: number,
    field: keyof PaymentMilestone,
    val: any
  ) => {
    const updated = [...milestones];
    updated[idx] = { ...updated[idx], [field]: val };
    setMilestones(updated);
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  // --- WordPress-Style Block Builder Handlers ---
  const handleAddBlock = (bType: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type: bType,
      title:
        bType === "TEXT"
          ? "Architectural Overview"
          : bType === "VIDEO"
          ? "Project Video Reel"
          : bType === "HIGHLIGHTS"
          ? "Special Amenities & Features"
          : bType === "CALLOUT"
          ? "Important Buyer Advisory"
          : "Frequently Asked Question",
      content: "",
      items: bType === "HIGHLIGHTS" ? ["Key advantage 1", "Key advantage 2"] : undefined,
      videoUrl: bType === "VIDEO" ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : undefined,
      question: bType === "FAQ" ? "What is the expected possession timeline?" : undefined,
      answer: bType === "FAQ" ? "Phase 1 possession will begin by December 2027." : undefined,
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleMoveBlock = (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === blocks.length - 1) return;
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setBlocks(updated);
  };

  const handleRemoveBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const handleUpdateBlock = (index: number, updates: Partial<ContentBlock>) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], ...updates };
    setBlocks(updated);
  };

  // --- Master Save Action ---
  const handleMasterSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setErrorMsg("Project Name and URL Slug are required.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("builderId", builderId);
    formData.append("type", type);
    formData.append("status", status);
    formData.append("city", city);
    formData.append("locality", locality);
    if (pincode) formData.append("pincode", pincode);
    if (reraNo) formData.append("reraNo", reraNo);
    if (lat) formData.append("lat", lat);
    if (lng) formData.append("lng", lng);
    if (priceMin) formData.append("priceMin", priceMin);
    if (priceMax) formData.append("priceMax", priceMax);
    if (areaMin) formData.append("areaMin", areaMin);
    if (areaMax) formData.append("areaMax", areaMax);
    if (towers) formData.append("towers", towers);
    if (totalUnits) formData.append("totalUnits", totalUnits);
    if (launchDate) formData.append("launchDate", launchDate);
    if (possessionDate) formData.append("possessionDate", possessionDate);
    formData.append("description", description);
    formData.append("featured", featured ? "true" : "false");
    formData.append("sortOrder", String(sortOrder));
    if (seoTitle) formData.append("seoTitle", seoTitle);
    if (seoDescription) formData.append("seoDescription", seoDescription);

    // Structured JSON Fields
    formData.append("highlights", JSON.stringify(blocks));
    formData.append(
      "paymentPlan",
      JSON.stringify({ name: paymentPlanName, milestones })
    );
    formData.append("documents", JSON.stringify(documents));
    formData.append(
      "commission",
      JSON.stringify({
        base: baseCommission,
        bonus: bonusCommission,
        payout: payoutSchedule,
      })
    );
    formData.append("cadFiles", JSON.stringify(cadFiles));
    formData.append("images", JSON.stringify(images));
    formData.append("videoUrls", JSON.stringify(videoList));

    const bannerConfig = {
      showBanner,
      headline: bannerHeadline.trim() || undefined,
      tagline: bannerTagline.trim() || undefined,
      badge: bannerBadge.trim() || undefined,
      imageUrl: bannerImage.trim() || undefined,
    };
    formData.append("bannerConfig", JSON.stringify(bannerConfig));

    if (brochureUrl) formData.append("brochureId", brochureUrl);
    if (virtualTourUrl) formData.append("virtualTourUrl", virtualTourUrl);

    try {
      let result;
      if (isEdit && projectId) {
        result = await updateProjectAction(projectId, formData);
      } else {
        result = await createProjectAction(formData);
      }

      if (result.error) {
        if (typeof result.error === "string") {
          setErrorMsg(result.error);
        } else if (typeof result.error === "object") {
          const detailedMsg = Object.entries(result.error)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
            .join(" | ");
          setErrorMsg(detailedMsg || "Validation error. Please verify all required inputs.");
        } else {
          setErrorMsg("Validation error. Please verify all required inputs.");
        }
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Save failed", err);
      setErrorMsg(err.message || "Failed to save project.");
    } finally {
      setIsSaving(false);
    }
  };

  type FormTab = "all" | "basics" | "pricing" | "media" | "docs" | "payment" | "commission" | "blocks" | "seo";
  const [activeTab, setActiveTab] = useState<FormTab>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab") as FormTab;
      if (tabParam && ["all", "basics", "pricing", "media", "docs", "payment", "commission", "blocks", "seo"].includes(tabParam)) {
        return tabParam;
      }
      if (window.location.hash === "#sec-media") return "media";
    }
    return "basics";
  });

  const tabList: { id: FormTab; label: string; shortLabel: string; icon: any }[] = [
    { id: "basics", label: "1. Basics & Builder", shortLabel: "Basics", icon: Home },
    { id: "pricing", label: "2. Pricing & Areas", shortLabel: "Pricing", icon: DollarSign },
    { id: "media", label: "3. Videos, Media & 3D / CAD", shortLabel: "Videos & CAD", icon: Video },
    { id: "docs", label: "4. Documents & RERA", shortLabel: "Documents", icon: FileCheck },
    { id: "payment", label: "5. Payment Plans", shortLabel: "Payment", icon: CreditCard },
    { id: "commission", label: "6. Brokerage & Slabs", shortLabel: "Commission", icon: Percent },
    { id: "blocks", label: "7. Custom Page Blocks", shortLabel: "Custom Blocks", icon: Layers },
    { id: "seo", label: "8. SEO & Social Meta", shortLabel: "SEO & Meta", icon: FileText },
    { id: "all", label: "All Sections (Single View)", shortLabel: "Show All", icon: LayoutGrid },
  ];

  const tabSequence: FormTab[] = ["basics", "pricing", "media", "docs", "payment", "commission", "blocks", "seo"];
  const currentTabIdx = tabSequence.indexOf(activeTab);
  const prevTab = currentTabIdx > 0 ? tabSequence[currentTabIdx - 1] : null;
  const nextTab = currentTabIdx >= 0 && currentTabIdx < tabSequence.length - 1 ? tabSequence[currentTabIdx + 1] : null;

  const totalPercentage = milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);

  return (
    <div className="w-full min-w-0 max-w-full space-y-8 pb-32">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">
                {isEdit ? `Edit: ${name || "Project"}` : "Create New Project"}
              </h1>
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                Single-Page All-in-One Master
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage complete project content, AutoCAD &amp; 3D files, payment milestones, documents, and WordPress blocks.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {slug && (
            <Link
              href={`/projects/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Preview Live Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}

          <Button
            onClick={handleMasterSave}
            disabled={isSaving}
            className="font-bold shadow-lg shadow-primary/20 gap-2 bg-primary text-white"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? "Saving Everything..." : "Save Project"}</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-3">
          <Check className="h-5 w-5 shrink-0" />
          <span className="font-semibold">Project saved successfully! All updates, CAD files, and blocks are live.</span>
        </div>
      )}

      {/* Tab Switcher - Clean, Responsive & Completely Non-Sticky */}
      <div className="p-1.5 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabList.map((t) => {
            const isActive = activeTab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleMasterSave} className="space-y-8">
        {/* ================================================================= */}
        {/* SECTION 1: BASICS & BUILDER                                      */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "basics") && (
          <div id="sec-basics" className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">1. Core Basics &amp; Developer</h2>
              <p className="text-xs text-muted-foreground">General identity, builder partner, and status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Project Name *</Label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Evara 27-Acre Luxury Township"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">URL Slug *</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. evara-27-acre-luxury-township"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Builder / Developer *</Label>
              <select
                value={builderId}
                onChange={(e) => setBuilderId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Builder Partner</option>
                {buildersList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Development Type</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="TOWNSHIP">Integrated Township (Towers + Villas)</option>
                <option value="APARTMENT">High-Rise Residential Apartments</option>
                <option value="VILLA">Luxury Villa &amp; Bungalow Community</option>
                <option value="COMMERCIAL">High-Street Retail &amp; Offices</option>
                <option value="PLOTTED">Plotted Development</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Project Lifecycle Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="NEW_LAUNCH">New Launch (Active Booking)</option>
                <option value="UNDER_CONSTRUCTION">Under Construction</option>
                <option value="READY_TO_MOVE">Ready to Move</option>
                <option value="UPCOMING">Upcoming Pre-Launch</option>
                <option value="SOLD_OUT">Sold Out</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">RERA Registration Number</Label>
              <Input
                value={reraNo}
                onChange={(e) => setReraNo(e.target.value)}
                placeholder="e.g. P-IND-24-4567"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              <Switch checked={featured} onCheckedChange={setFeatured} id="featured-toggle" />
              <Label htmlFor="featured-toggle" className="text-sm font-semibold cursor-pointer">
                Feature on Homepage Top Spotlight
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Display Sort Order:</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-20 h-9 text-xs"
              />
            </div>
          </div>

          {/* Banner & Hero Settings Card */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Project Hero Banner Settings</h3>
                  <p className="text-xs text-muted-foreground">
                    Customize the headline, tagline, and background image, or turn off the banner completely.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-semibold ${showBanner ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {showBanner ? "Banner Enabled" : "Banner Disabled"}
                </span>
                <Switch checked={showBanner} onCheckedChange={setShowBanner} />
              </div>
            </div>

            {showBanner && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/60">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Custom Banner Headline (defaults to project name)</Label>
                  <Input
                    value={bannerHeadline}
                    onChange={(e) => setBannerHeadline(e.target.value)}
                    placeholder="e.g. Evara — 27-Acre Master Planned Township"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Banner Tagline / Subtitle</Label>
                  <Input
                    value={bannerTagline}
                    onChange={(e) => setBannerTagline(e.target.value)}
                    placeholder="e.g. Premium 2 & 3 BHK High-Rise Apartments & Luxury Villas"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Custom Badge Text</Label>
                  <Input
                    value={bannerBadge}
                    onChange={(e) => setBannerBadge(e.target.value)}
                    placeholder="e.g. Pre-Launch Exclusive Booking Offers"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Custom Banner Image URL</Label>
                  <Input
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="https://... or /images/project-1.jpg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 2: PRICING & CONFIGURATIONS                              */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "pricing") && (
          <div id="sec-pricing" className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">2. Pricing, Areas &amp; Structure</h2>
              <p className="text-xs text-muted-foreground">Price brackets, carpet areas, total towers and units</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Minimum Price (₹)</Label>
              <Input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="e.g. 19500000 (1.95 Cr)"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Maximum Price (₹)</Label>
              <Input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="e.g. 165000000 (16.5 Cr)"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Minimum Carpet Area (sq ft)</Label>
              <Input
                type="number"
                value={areaMin}
                onChange={(e) => setAreaMin(e.target.value)}
                placeholder="e.g. 1650"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Maximum Carpet Area (sq ft)</Label>
              <Input
                type="number"
                value={areaMax}
                onChange={(e) => setAreaMax(e.target.value)}
                placeholder="e.g. 12000"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Total Towers / Enclaves</Label>
              <Input
                type="number"
                value={towers}
                onChange={(e) => setTowers(e.target.value)}
                placeholder="e.g. 4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Total Inventory Units</Label>
              <Input
                type="number"
                value={totalUnits}
                onChange={(e) => setTotalUnits(e.target.value)}
                placeholder="e.g. 384"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Official Launch Date</Label>
              <Input
                type="date"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">RERA Possession Date</Label>
              <Input
                type="date"
                value={possessionDate}
                onChange={(e) => setPossessionDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-xs font-semibold">Project Main Narrative / Overview</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the project's architectural concept, lifestyle amenities, and structural USPs..."
            />
          </div>
        </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 3: MEDIA & CAD / 3D FILES (REAL UPLOADER)                 */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "media") && (
          <div id="sec-media" className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">3. Real Media &amp; AutoCAD / 3D Model Uploader</h2>
              <p className="text-xs text-muted-foreground">
                Upload photos, gallery images, PDF brochures, and real AutoCAD (.dwg, .dxf) / 3D model files (.gltf, .glb, .obj)
              </p>
            </div>
          </div>

          {/* A. AutoCAD & 3D Model Uploader Box */}
          <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-white text-[10px]">AutoCAD &amp; 3D Engine</Badge>
                  <span className="font-bold text-sm text-foreground">
                    Upload Your AutoCAD (DWG/DXF) &amp; 3D Model Files (GLTF/GLB/OBJ)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: <strong>.dwg, .dxf</strong> (AutoCAD 2D Blueprint) and <strong>.gltf, .glb, .obj, .stl, .ifc</strong> (3D Volumetric Models) up to 50MB.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-white shadow-md transition-all shrink-0 ${isUploadingCad ? "opacity-60 pointer-events-none" : ""}`}>
                  {isUploadingCad ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  <span>{isUploadingCad ? "Uploading..." : "Upload CAD / 3D File"}</span>
                  <input
                    type="file"
                    multiple
                    accept=".dwg,.dxf,.gltf,.glb,.obj,.stl,.ifc,.zip"
                    onChange={(e) => handleFileUpload(e, "CAD_3D")}
                    disabled={isUploadingCad}
                    className="hidden"
                  />
                </label>

                {cadFiles.length === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCadFiles([
                        {
                          id: `cad-demo-${Date.now()}-1`,
                          fileName: "Evara_27Acre_MasterPlan_Rev4.dwg",
                          url: "/uploads/evara-masterplan.dwg",
                          size: 4850000,
                          type: "AUTOCAD_DWG",
                          uploadedAt: new Date().toISOString().split("T")[0],
                        },
                        {
                          id: `cad-demo-${Date.now()}-2`,
                          fileName: "Evara_Towers_Isometric_3D.gltf",
                          url: "/uploads/evara-towers.gltf",
                          size: 12400000,
                          type: "MODEL_3D_GLTF",
                          uploadedAt: new Date().toISOString().split("T")[0],
                        },
                      ]);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Load Sample CAD Demo
                  </Button>
                )}
              </div>
            </div>

            {/* Uploading Notification */}
            {isUploadingCad && (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 text-xs font-semibold text-primary animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                <span>Uploading CAD file to server storage... please do not refresh.</span>
              </div>
            )}

            {/* Error Notification */}
            {cadUploadError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{cadUploadError}</span>
              </div>
            )}

            {/* Empty State */}
            {cadFiles.length === 0 && !isUploadingCad && (
              <div className="py-7 px-4 text-center rounded-xl border border-dashed border-border bg-card/60">
                <FileCode className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs font-semibold text-foreground">No CAD or 3D files attached to this project</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-md mx-auto">
                  Click <strong>&quot;Upload CAD / 3D File&quot;</strong> to attach technical architectural drawings (.dwg, .dxf) or 3D models (.gltf, .glb).
                </p>
              </div>
            )}

            {/* Uploaded CAD Files List */}
            {cadFiles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {cadFiles.map((f, idx) => (
                  <div
                    key={f.id || idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 font-mono text-[10px] font-bold">
                        {f.fileName.split(".").pop()?.toUpperCase() || "CAD"}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-foreground truncate">{f.fileName}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {(f.size / (1024 * 1024)).toFixed(2)} MB · {f.uploadedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={f.url}
                        target="_blank"
                        className="p-1.5 hover:bg-muted rounded text-primary transition-colors"
                        title="Download CAD File"
                      >
                        <FileDown className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setCadFiles(cadFiles.filter((_, i) => i !== idx))}
                        className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded transition-colors"
                        title="Delete CAD File"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* B. Project Gallery Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold">Project Photo Gallery</Label>
                <p className="text-[11px] text-muted-foreground">High resolution exterior elevation, master landscape, and interior renders</p>
              </div>
              <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors ${isUploadingImage ? "opacity-60 pointer-events-none" : ""}`}>
                {isUploadingImage ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Add Photos</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={isUploadingImage}
                  onChange={(e) => handleFileUpload(e, "IMAGE")}
                  className="hidden"
                />
              </label>
            </div>

            {images.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                <p className="text-xs font-medium text-foreground">No photos added yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Click &ldquo;Add Photos&rdquo; above to upload high-res exterior and interior renders</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-border bg-muted aspect-video shadow-xs"
                  >
                    <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono text-white">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                      title="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Videos, YouTube Shorts & Facebook Reels Gallery */}
          <VideoGalleryField
            videos={videoList}
            onChange={setVideoList}
            title="Project Videos, Shorts & Facebook Reels"
            description="Add YouTube videos, drone shoots, sample flat tours, 9:16 vertical YouTube shorts, and Facebook reels for this project."
          />

          {/* C. PDF Brochure & Virtual Tour Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Official Project PDF Brochure</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={brochureUrl}
                  onChange={(e) => setBrochureUrl(e.target.value)}
                  placeholder="URL to PDF brochure or upload below"
                />
                <label className="cursor-pointer px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 shrink-0">
                  <span>Browse PDF</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, "BROCHURE")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">360° Virtual Walkthrough / Drone URL</Label>
              <Input
                value={virtualTourUrl}
                onChange={(e) => setVirtualTourUrl(e.target.value)}
                placeholder="e.g. https://my.matterport.com/show/?m=..."
              />
            </div>
          </div>
        </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 4: DOCUMENTS & CLEARANCES                                 */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "docs") && (
          <div id="sec-docs" className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">4. Official Approvals &amp; Compliance Documents</h2>
                <p className="text-xs text-muted-foreground">RERA letter, sanctioned building plans, title deed, and NOCs</p>
              </div>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors">
              <Plus className="h-3.5 w-3.5" />
              <span>Upload Document</span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, "DOCUMENT")}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card text-xs shadow-xs"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0 font-bold">
                    ✓
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-foreground truncate">{doc.title}</p>
                    <span className="text-[10px] text-muted-foreground">
                      Category: {doc.category} · {doc.uploadedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={doc.url}
                    target="_blank"
                    className="p-1.5 hover:bg-muted rounded text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}
                    className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 5: PAYMENT PLANS & MILESTONES                             */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "payment") && (
          <div id="sec-payment" className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">5. Payment Schedules &amp; Milestone Breakdown</h2>
                <p className="text-xs text-muted-foreground">Configurable payment schedule stages for prospective investors</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`font-mono text-xs ${totalPercentage === 100 ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"}`}>
                Total: {totalPercentage}% {totalPercentage === 100 ? "✓ Balanced" : "(!)"}
              </Badge>
              <Button type="button" size="sm" variant="outline" onClick={handleAddMilestone} className="text-xs gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Stage</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Payment Plan Name</Label>
            <Input
              value={paymentPlanName}
              onChange={(e) => setPaymentPlanName(e.target.value)}
              placeholder="e.g. Construction Linked Payment Schedule"
            />
          </div>

          {/* Milestones Table */}
          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div
                key={m.id || idx}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl border border-border bg-muted/30 text-xs"
              >
                <span className="font-mono font-bold text-muted-foreground w-6">#{idx + 1}</span>

                <div className="flex-1">
                  <Input
                    value={m.stage}
                    onChange={(e) => handleUpdateMilestone(idx, "stage", e.target.value)}
                    placeholder="Milestone stage name"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="w-28 flex items-center gap-1">
                  <Input
                    type="number"
                    value={m.percentage}
                    onChange={(e) => handleUpdateMilestone(idx, "percentage", Number(e.target.value))}
                    className="h-9 text-xs font-mono font-bold"
                  />
                  <span className="text-muted-foreground font-semibold">%</span>
                </div>

                <div className="flex-1">
                  <Input
                    value={m.dueCondition}
                    onChange={(e) => handleUpdateMilestone(idx, "dueCondition", e.target.value)}
                    placeholder="Condition / due timing"
                    className="h-9 text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(idx)}
                  className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors ml-auto sm:ml-0"
                  title="Remove Milestone"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 6: COMMISSION & BROKERAGE SLAB                            */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "commission") && (
          <div id="sec-commission" className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
              <Percent className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">6. Associate Partner Commission &amp; Payout Slabs</h2>
              <p className="text-xs text-muted-foreground">Base commission, volume incentives, and disbursement terms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Base Commission (%)</Label>
              <Input
                value={baseCommission}
                onChange={(e) => setBaseCommission(e.target.value)}
                placeholder="e.g. 2.5%"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Volume Target Bonus (%)</Label>
              <Input
                value={bonusCommission}
                onChange={(e) => setBonusCommission(e.target.value)}
                placeholder="e.g. +0.5% on 3+ bookings"
              />
            </div>

            <div className="space-y-2 sm:col-span-1">
              <Label className="text-xs font-semibold">Payout Frequency</Label>
              <Input
                defaultValue="Within 15 days of buyer agreement"
                readOnly
                className="bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold">Disbursement Milestone Rules &amp; Broker Notes</Label>
            <Textarea
              value={payoutSchedule}
              onChange={(e) => setPayoutSchedule(e.target.value)}
              rows={3}
              placeholder="e.g. 50% upon registration of ATS, remaining 50% upon receipt of 20% buyer payment."
            />
          </div>
        </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 7: WORDPRESS-STYLE CUSTOM BLOCKS (UP / DOWN REORDER)      */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "blocks") && (
          <div id="sec-blocks" className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  7. WordPress-Style Custom Blocks (Reorder Up / Down)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Add custom paragraphs, YouTube video embeds, bulleted highlights, callout notices, and FAQs. Move up/down to rearrange order.
                </p>
              </div>
            </div>

            {/* + Add Block Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button type="button" size="sm" variant="outline" onClick={() => handleAddBlock("HIGHLIGHTS")} className="text-xs gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>+ Highlights</span>
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => handleAddBlock("VIDEO")} className="text-xs gap-1">
                <Video className="h-3.5 w-3.5 text-blue-500" />
                <span>+ YT Video</span>
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => handleAddBlock("CALLOUT")} className="text-xs gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                <span>+ Callout Alert</span>
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => handleAddBlock("FAQ")} className="text-xs gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-purple-500" />
                <span>+ FAQ</span>
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => handleAddBlock("TEXT")} className="text-xs gap-1">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                <span>+ Text Block</span>
              </Button>
            </div>
          </div>

          {/* Render Reorderable Blocks */}
          <div className="space-y-4">
            {blocks.map((b, idx) => (
              <div
                key={b.id}
                className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4 shadow-xs transition-all hover:border-primary/40"
              >
                {/* Block Header Toolbar */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-xs font-bold">
                      {idx + 1}
                    </span>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {b.type} BLOCK
                    </Badge>
                  </div>

                  {/* Reorder Up/Down & Delete Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveBlock(idx, "UP")}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                      title="Move Block Up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === blocks.length - 1}
                      onClick={() => handleMoveBlock(idx, "DOWN")}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground disabled:opacity-30"
                      title="Move Block Down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-px bg-border mx-1" />
                    <button
                      type="button"
                      onClick={() => handleRemoveBlock(idx)}
                      className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500"
                      title="Delete Block"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Block Content Editor */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Block Title / Headline</Label>
                    <Input
                      value={b.title || ""}
                      onChange={(e) => handleUpdateBlock(idx, { title: e.target.value })}
                      placeholder="Enter section headline"
                      className="h-9 text-xs"
                    />
                  </div>

                  {/* Specific Block Fields */}
                  {b.type === "VIDEO" && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">YouTube Video URL</Label>
                      <Input
                        value={b.videoUrl || ""}
                        onChange={(e) => handleUpdateBlock(idx, { videoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="h-9 text-xs"
                      />
                    </div>
                  )}

                  {b.type === "HIGHLIGHTS" && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Feature Bullet Points (one per line)</Label>
                      <Textarea
                        value={(b.items || []).join("\n")}
                        onChange={(e) =>
                          handleUpdateBlock(idx, {
                            items: e.target.value.split("\n").filter((l) => l.trim()),
                          })
                        }
                        rows={4}
                        placeholder="Point 1&#10;Point 2&#10;Point 3"
                        className="text-xs"
                      />
                    </div>
                  )}

                  {b.type === "CALLOUT" && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Callout Alert Message</Label>
                      <Textarea
                        value={b.content || ""}
                        onChange={(e) => handleUpdateBlock(idx, { content: e.target.value })}
                        rows={3}
                        placeholder="Important investor notice or promotional announcement..."
                        className="text-xs"
                      />
                    </div>
                  )}

                  {b.type === "FAQ" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Question</Label>
                        <Input
                          value={b.question || ""}
                          onChange={(e) => handleUpdateBlock(idx, { question: e.target.value })}
                          placeholder="What is the payment schedule?"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Answer</Label>
                        <Input
                          value={b.answer || ""}
                          onChange={(e) => handleUpdateBlock(idx, { answer: e.target.value })}
                          placeholder="Construction-linked with 10% booking token."
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {b.type === "TEXT" && (
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Body Content (Supports Multi-Paragraph)</Label>
                      <Textarea
                        value={b.content || ""}
                        onChange={(e) => handleUpdateBlock(idx, { content: e.target.value })}
                        rows={4}
                        placeholder="Detailed narrative, architectural specifications, or developer story..."
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 8: SEO & SEARCH VISIBILITY                                */}
        {/* ================================================================= */}
        {(activeTab === "all" || activeTab === "seo") && (
          <div id="sec-seo" className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">8. Search Engine Optimization (SEO)</h2>
                <p className="text-xs text-muted-foreground">Google title, meta tags, and snippet description</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Google SEO Title</Label>
                <Input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. Evara 27-Acre Township | Luxury Bungalows & Sky Towers"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Meta Description</Label>
                <Textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                  placeholder="Summary displayed in search results..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Clean Non-Sticky Action & Tab Navigation Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-card border border-border mt-8 shadow-xs">
          <div className="flex items-center gap-2">
            {activeTab !== "all" && prevTab && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab(prevTab);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="gap-2 text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous: {tabList.find((t) => t.id === prevTab)?.shortLabel}</span>
              </Button>
            )}
            {activeTab === "all" && (
              <span className="text-xs text-muted-foreground">
                Displaying all 8 project sections on one page.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/projects"
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-muted/40 hover:bg-muted text-muted-foreground transition-colors"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={isSaving}
              className="font-bold shadow-md shadow-primary/20 gap-2 bg-primary text-white cursor-pointer"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isSaving ? "Saving Project..." : "Save Project Changes"}</span>
            </Button>
            {activeTab !== "all" && nextTab && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab(nextTab);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="gap-2 text-xs"
              >
                <span>Next: {tabList.find((t) => t.id === nextTab)?.shortLabel}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
