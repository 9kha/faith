"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Save,
  ArrowLeft,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Eye,
  Type,
  ListChecks,
  Image as ImageIcon,
  BarChart3,
  HelpCircle,
  Quote,
  Megaphone,
  Check,
  AlertCircle,
  Loader2,
  MoveVertical,
} from "lucide-react";

export type PageBlockType =
  | "HERO"
  | "TEXT"
  | "FEATURES"
  | "MEDIA"
  | "STATS"
  | "FAQ"
  | "QUOTE"
  | "CTA";

export interface PageBlock {
  id: string;
  type: PageBlockType;
  title?: string;
  subtitle?: string;
  badge?: string;
  content?: string;
  align?: "left" | "center";
  // Features
  items?: { title: string; description?: string }[];
  // Media
  mediaType?: "image" | "video";
  mediaUrl?: string;
  mediaCaption?: string;
  // Stats
  stats?: { value: string; label: string }[];
  // FAQ
  faqs?: { question: string; answer: string }[];
  // Quote
  quoteText?: string;
  authorName?: string;
  authorRole?: string;
  // CTA
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  showForm?: boolean;
}

type PageData = {
  id?: string;
  title: string;
  slug: string;
  template?: string;
  content?: any;
  status: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

function extractBlocksFromContent(content: any): PageBlock[] {
  if (!content) return [];
  if (Array.isArray(content.blocks)) return content.blocks;
  if (Array.isArray(content)) return content;

  // Legacy format fallback
  const blocks: PageBlock[] = [];
  if (content.subtitle || content.badge) {
    blocks.push({
      id: `hero-${Date.now()}`,
      type: "HERO",
      title: "",
      subtitle: content.subtitle || "",
      badge: content.badge || "",
      ctaText: content.ctaText || "Get in Touch",
      ctaLink: content.ctaLink || "/contact",
    });
  }
  if (content.bodyText) {
    blocks.push({
      id: `text-${Date.now() + 1}`,
      type: "TEXT",
      title: "Overview",
      content: content.bodyText,
    });
  }
  if (Array.isArray(content.features) && content.features.length > 0) {
    blocks.push({
      id: `feat-${Date.now() + 2}`,
      type: "FEATURES",
      title: "Key Highlights",
      items: content.features.map((f: any, i: number) =>
        typeof f === "string"
          ? { title: f, description: "" }
          : { title: f.title || `Item ${i + 1}`, description: f.description || "" }
      ),
    });
  }
  if (content.calloutBox || content.ctaText) {
    blocks.push({
      id: `cta-${Date.now() + 3}`,
      type: "CTA",
      title: content.calloutBox || "Ready to Invest?",
      ctaText: content.ctaText || "Schedule VIP Consultation",
      ctaLink: content.ctaLink || "/contact",
    });
  }
  return blocks;
}

export default function PageBuilderForm({
  initialData,
  isEdit = false,
}: {
  initialData?: PageData;
  isEdit?: boolean;
}) {
  const router = useRouter();

  // Card 1: Page Details
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(
    initialData?.seoDescription || ""
  );
  const [isPublished, setIsPublished] = useState(
    initialData?.status ? initialData.status === "PUBLISHED" : true
  );

  // Card 2: Page Blocks
  const [blocks, setBlocks] = useState<PageBlock[]>(() =>
    extractBlocksFromContent(initialData?.content)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  // Block creation helpers
  const addBlock = (type: PageBlockType) => {
    const id = `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let newBlock: PageBlock;

    switch (type) {
      case "HERO":
        newBlock = {
          id,
          type: "HERO",
          title: title || "Welcome to Our Platform",
          subtitle: "Explore premium RERA verified real estate and investment options.",
          badge: "Featured Section",
          ctaText: "Explore Projects",
          ctaLink: "/projects",
        };
        break;
      case "TEXT":
        newBlock = {
          id,
          type: "TEXT",
          title: "About this Program",
          content: "Faith Venture Realty offers unparalleled advisory and verified listings...",
          align: "left",
        };
        break;
      case "FEATURES":
        newBlock = {
          id,
          type: "FEATURES",
          title: "Why Choose Our Services",
          subtitle: "Experience the benchmark in transparent central India real estate.",
          items: [
            { title: "Direct Builder Pricing", description: "Zero hidden charges with maximum transparent discounts." },
            { title: "100% RERA Verified", description: "Title checks, sanction approvals, and escrow accounts confirmed." },
            { title: "End-to-End Assistance", description: "From site visits in VIP cabs to loan sanction and registry." },
          ],
        };
        break;
      case "MEDIA":
        newBlock = {
          id,
          type: "MEDIA",
          title: "Township Walkthrough & Visuals",
          mediaType: "image",
          mediaUrl: "/images/project-1.jpg",
          mediaCaption: "Architectural overview and amenities landscape",
        };
        break;
      case "STATS":
        newBlock = {
          id,
          type: "STATS",
          title: "Our Track Record",
          stats: [
            { value: "1,200+", label: "Happy Families" },
            { value: "50+", label: "Verified Projects" },
            { value: "₹450 Cr+", label: "Delivered Value" },
            { value: "10+ Years", label: "Industry Standing" },
          ],
        };
        break;
      case "FAQ":
        newBlock = {
          id,
          type: "FAQ",
          title: "Frequently Asked Questions",
          faqs: [
            { question: "What are the payment terms?", answer: "We support flexible Construction Linked Payment (CLP) and Down Payment plans." },
            { question: "Are home loans available?", answer: "Yes, pre-approved home loans from SBI, HDFC, ICICI, and Axis Bank with door-step assistance." },
          ],
        };
        break;
      case "QUOTE":
        newBlock = {
          id,
          type: "QUOTE",
          quoteText: "Investing with Faith Venture Realty gave us complete peace of mind. Every agreement milestone was transparent.",
          authorName: "Rajesh & Priya Sharma",
          authorRole: "Homeowners at Super Corridor Township",
        };
        break;
      case "CTA":
        newBlock = {
          id,
          type: "CTA",
          title: "Ready to Find Your Dream Property?",
          subtitle: "Speak directly with our senior property advisors or schedule a free site visit.",
          ctaText: "Schedule VIP Consultation",
          ctaLink: "/contact",
          secondaryCtaText: "Call +91 98765 43210",
          secondaryCtaLink: "tel:+919876543210",
          showForm: true,
        };
        break;
    }

    setBlocks((prev) => [...prev, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<PageBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setBlocks(updated);
  };

  const duplicateBlock = (index: number) => {
    const target = blocks[index];
    const duplicated: PageBlock = {
      ...JSON.parse(JSON.stringify(target)),
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: target.title ? `${target.title} (Copy)` : undefined,
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, duplicated);
    setBlocks(updated);
  };

  const deleteBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setErrorMsg("Please provide both a Page Title and an Address (slug).");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSaveSuccess(false);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      status: isPublished ? "PUBLISHED" : "DRAFT",
      seoTitle: seoTitle.trim() || title.trim(),
      seoDescription: seoDescription.trim() || undefined,
      content: {
        blocks,
        updatedAt: new Date().toISOString(),
      },
    };

    try {
      const url = isEdit ? `/api/pages/${initialData?.id}` : "/api/pages";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save custom page.");
        setIsSaving(false);
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/admin/pages");
        router.refresh();
      }, 700);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An unexpected error occurred while saving the page.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0">
            <Link href="/admin/pages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {isEdit ? `Edit: ${initialData?.title}` : "New page"}
            </h1>
            <p className="text-xs text-muted-foreground">
              Build custom pages with modular blocks, SEO metadata, and live preview.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isEdit && slug && (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4" />
                <span>View Live</span>
              </a>
            </Button>
          )}
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSaving}
            size="sm"
            className="gap-1.5 shadow font-semibold bg-primary text-white"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isSaving ? "Saving..." : isEdit ? "Save Changes" : "Save page"}</span>
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>Page saved successfully!</span>
        </div>
      )}

      {/* CARD 1: Page Details (Matching Screenshot 5) */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <h2 className="text-base font-bold text-foreground">Page Details</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground">
              Page title <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. About Faith Venture Realty"
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">
              Address <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1.5 flex items-center rounded-md border border-input bg-muted/40 px-3 py-2 text-sm">
              <span className="font-mono text-xs text-muted-foreground select-none">
                /
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.replace(/^\/+/, ""))}
                placeholder="about-us"
                className="ml-1 flex-1 bg-transparent font-mono text-sm font-semibold text-primary focus:outline-none"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              The public URL path for this page (e.g. /{slug || "your-slug"})
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">
              SEO title
            </label>
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Search engine title"
              className="mt-1.5"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">
              SEO description
            </label>
            <Textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Search engine description"
              rows={3}
              className="mt-1.5 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-xs font-semibold text-foreground">Published</p>
              <p className="text-[11px] text-muted-foreground">
                {isPublished ? "Visible to the public" : "Hidden from the public (Draft)"}
              </p>
            </div>
            <Switch
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>
        </div>
      </div>

      {/* CARD 2: Page Blocks & Sections (Matching Screenshot 5) */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Page Blocks &amp; Sections ({blocks.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Add modular content blocks to design custom layouts without code.
            </p>
          </div>

          {/* Block Creation Action Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock("HERO")}
              className="gap-1 text-xs h-8 px-2.5 font-medium hover:border-primary hover:text-primary"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>+ Hero</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock("TEXT")}
              className="gap-1 text-xs h-8 px-2.5 font-medium hover:border-primary hover:text-primary"
            >
              <Type className="h-3.5 w-3.5 text-blue-500" />
              <span>+ Text</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock("FEATURES")}
              className="gap-1 text-xs h-8 px-2.5 font-medium hover:border-primary hover:text-primary"
            >
              <ListChecks className="h-3.5 w-3.5 text-emerald-500" />
              <span>+ Features</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock("MEDIA")}
              className="gap-1 text-xs h-8 px-2.5 font-medium hover:border-primary hover:text-primary"
            >
              <ImageIcon className="h-3.5 w-3.5 text-purple-500" />
              <span>+ Media</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock("STATS")}
              className="gap-1 text-xs h-8 px-2.5 font-medium hover:border-primary hover:text-primary"
            >
              <BarChart3 className="h-3.5 w-3.5 text-amber-500" />
              <span>+ Stats</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock("FAQ")}
              className="gap-1 text-xs h-8 px-2.5 font-medium hover:border-primary hover:text-primary"
            >
              <HelpCircle className="h-3.5 w-3.5 text-cyan-500" />
              <span>+ FAQ</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock("QUOTE")}
              className="gap-1 text-xs h-8 px-2.5 font-medium hover:border-primary hover:text-primary"
            >
              <Quote className="h-3.5 w-3.5 text-rose-500" />
              <span>+ Quote</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addBlock("CTA")}
              className="gap-1 text-xs h-8 px-2.5 font-medium hover:border-primary hover:text-primary"
            >
              <Megaphone className="h-3.5 w-3.5 text-indigo-500" />
              <span>+ CTA</span>
            </Button>
          </div>
        </div>

        {/* Empty State matching Screenshot 5 */}
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No blocks yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Click one of the buttons above to add sections to this page.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, idx) => (
              <div
                key={block.id}
                className="rounded-xl border border-border bg-muted/20 p-5 space-y-4 shadow-2xs transition-all hover:border-primary/30"
              >
                {/* Block Item Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-[11px] font-mono font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <Badge variant="outline" className="text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border-primary/20">
                      {block.type}
                    </Badge>
                    <span className="text-xs font-semibold text-foreground truncate max-w-xs">
                      {block.title || block.subtitle || "Untitled Section"}
                    </span>
                  </div>

                  {/* Reordering & Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveBlock(idx, "up")}
                      disabled={idx === 0}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveBlock(idx, "down")}
                      disabled={idx === blocks.length - 1}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateBlock(idx)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBlock(idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Block Fields based on Block Type */}
                {block.type === "HERO" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Badge / Pill Text</label>
                      <Input
                        value={block.badge || ""}
                        onChange={(e) => updateBlock(block.id, { badge: e.target.value })}
                        placeholder="e.g. Featured Program"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Hero Headline</label>
                      <Input
                        value={block.title || ""}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        placeholder="e.g. Luxury Waterfront Villas in Bhopal"
                        className="mt-1"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground">Hero Subtitle</label>
                      <Textarea
                        value={block.subtitle || ""}
                        onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                        placeholder="Enter introductory text..."
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Primary CTA Button Text</label>
                      <Input
                        value={block.ctaText || ""}
                        onChange={(e) => updateBlock(block.id, { ctaText: e.target.value })}
                        placeholder="e.g. Book Site Visit"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Primary CTA Link</label>
                      <Input
                        value={block.ctaLink || ""}
                        onChange={(e) => updateBlock(block.id, { ctaLink: e.target.value })}
                        placeholder="e.g. /contact or /projects"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {block.type === "TEXT" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground">Section Title</label>
                        <Input
                          value={block.title || ""}
                          onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                          placeholder="e.g. Overview & Market Dynamics"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Alignment</label>
                        <select
                          value={block.align || "left"}
                          onChange={(e) => updateBlock(block.id, { align: e.target.value as any })}
                          className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                        >
                          <option value="left">Left Aligned</option>
                          <option value="center">Center Aligned</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Body Content</label>
                      <Textarea
                        value={block.content || ""}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        placeholder="Write paragraphs or text..."
                        rows={5}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {block.type === "FEATURES" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Section Title</label>
                        <Input
                          value={block.title || ""}
                          onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                          placeholder="e.g. Key Features & Advantages"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Subtitle</label>
                        <Input
                          value={block.subtitle || ""}
                          onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                          placeholder="e.g. Why investors trust our process"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground">Feature Items</label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const items = block.items || [];
                            updateBlock(block.id, {
                              items: [...items, { title: "New Feature", description: "" }],
                            });
                          }}
                          className="text-xs text-primary h-7 px-2"
                        >
                          + Add Item
                        </Button>
                      </div>
                      {(block.items || []).map((item, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 bg-background p-2.5 rounded-lg border border-border">
                          <div className="flex-1 grid gap-2 sm:grid-cols-2">
                            <Input
                              value={item.title}
                              onChange={(e) => {
                                const newItems = [...(block.items || [])];
                                newItems[fIdx] = { ...newItems[fIdx], title: e.target.value };
                                updateBlock(block.id, { items: newItems });
                              }}
                              placeholder="Feature title"
                              className="h-8 text-xs"
                            />
                            <Input
                              value={item.description || ""}
                              onChange={(e) => {
                                const newItems = [...(block.items || [])];
                                newItems[fIdx] = { ...newItems[fIdx], description: e.target.value };
                                updateBlock(block.id, { items: newItems });
                              }}
                              placeholder="Brief description"
                              className="h-8 text-xs"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = (block.items || []).filter((_, i) => i !== fIdx);
                              updateBlock(block.id, { items: newItems });
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {block.type === "MEDIA" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Media Title / Caption</label>
                      <Input
                        value={block.title || ""}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        placeholder="e.g. Master Plan Renders"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Media Type</label>
                      <select
                        value={block.mediaType || "image"}
                        onChange={(e) => updateBlock(block.id, { mediaType: e.target.value as any })}
                        className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
                      >
                        <option value="image">Image (URL or path)</option>
                        <option value="video">YouTube / Facebook Video</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground">Media URL</label>
                      <Input
                        value={block.mediaUrl || ""}
                        onChange={(e) => updateBlock(block.id, { mediaUrl: e.target.value })}
                        placeholder="https://... or /images/project-1.jpg"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}

                {block.type === "STATS" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Section Title</label>
                      <Input
                        value={block.title || ""}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        placeholder="e.g. Our Track Record"
                        className="mt-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground">Metric Counters</label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const stats = block.stats || [];
                            updateBlock(block.id, {
                              stats: [...stats, { value: "100+", label: "New Metric" }],
                            });
                          }}
                          className="text-xs text-primary h-7 px-2"
                        >
                          + Add Stat
                        </Button>
                      </div>
                      {(block.stats || []).map((stat, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 bg-background p-2.5 rounded-lg border border-border">
                          <Input
                            value={stat.value}
                            onChange={(e) => {
                              const newStats = [...(block.stats || [])];
                              newStats[sIdx] = { ...newStats[sIdx], value: e.target.value };
                              updateBlock(block.id, { stats: newStats });
                            }}
                            placeholder="Value (e.g. 1200+)"
                            className="h-8 text-xs font-bold w-32"
                          />
                          <Input
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = [...(block.stats || [])];
                              newStats[sIdx] = { ...newStats[sIdx], label: e.target.value };
                              updateBlock(block.id, { stats: newStats });
                            }}
                            placeholder="Label (e.g. Happy Families)"
                            className="h-8 text-xs flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newStats = (block.stats || []).filter((_, i) => i !== sIdx);
                              updateBlock(block.id, { stats: newStats });
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {block.type === "FAQ" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Section Title</label>
                      <Input
                        value={block.title || ""}
                        onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                        placeholder="e.g. Frequently Asked Questions"
                        className="mt-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground">Questions &amp; Answers</label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const faqs = block.faqs || [];
                            updateBlock(block.id, {
                              faqs: [...faqs, { question: "What is your question?", answer: "Answer details..." }],
                            });
                          }}
                          className="text-xs text-primary h-7 px-2"
                        >
                          + Add FAQ
                        </Button>
                      </div>
                      {(block.faqs || []).map((faq, fIdx) => (
                        <div key={fIdx} className="space-y-2 bg-background p-3 rounded-lg border border-border">
                          <div className="flex items-center justify-between gap-2">
                            <Input
                              value={faq.question}
                              onChange={(e) => {
                                const newFaqs = [...(block.faqs || [])];
                                newFaqs[fIdx] = { ...newFaqs[fIdx], question: e.target.value };
                                updateBlock(block.id, { faqs: newFaqs });
                              }}
                              placeholder="Question text"
                              className="h-8 text-xs font-semibold"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newFaqs = (block.faqs || []).filter((_, i) => i !== fIdx);
                                updateBlock(block.id, { faqs: newFaqs });
                              }}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <Textarea
                            value={faq.answer}
                            onChange={(e) => {
                              const newFaqs = [...(block.faqs || [])];
                              newFaqs[fIdx] = { ...newFaqs[fIdx], answer: e.target.value };
                              updateBlock(block.id, { faqs: newFaqs });
                            }}
                            placeholder="Answer text..."
                            rows={2}
                            className="text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {block.type === "QUOTE" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Quote / Testimonial Text</label>
                      <Textarea
                        value={block.quoteText || ""}
                        onChange={(e) => updateBlock(block.id, { quoteText: e.target.value })}
                        placeholder="Enter endorsement, client testimonial, or quote..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Author Name</label>
                        <Input
                          value={block.authorName || ""}
                          onChange={(e) => updateBlock(block.id, { authorName: e.target.value })}
                          placeholder="e.g. Ramesh Verma"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Author Designation / Role</label>
                        <Input
                          value={block.authorRole || ""}
                          onChange={(e) => updateBlock(block.id, { authorRole: e.target.value })}
                          placeholder="e.g. Investor, Indore Central"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {block.type === "CTA" && (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">CTA Headline</label>
                        <Input
                          value={block.title || ""}
                          onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                          placeholder="e.g. Schedule a Free Site Visit"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">CTA Subtitle</label>
                        <Input
                          value={block.subtitle || ""}
                          onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                          placeholder="e.g. Schedule a private site visit with our advisor"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Primary Button Text</label>
                        <Input
                          value={block.ctaText || ""}
                          onChange={(e) => updateBlock(block.id, { ctaText: e.target.value })}
                          placeholder="e.g. Schedule Consultation"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Primary Button Link</label>
                        <Input
                          value={block.ctaLink || ""}
                          onChange={(e) => updateBlock(block.id, { ctaLink: e.target.value })}
                          placeholder="e.g. /contact"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Secondary Button Text</label>
                        <Input
                          value={block.secondaryCtaText || ""}
                          onChange={(e) => updateBlock(block.id, { secondaryCtaText: e.target.value })}
                          placeholder="e.g. Call Advisory Desk"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Secondary Button Link</label>
                        <Input
                          value={block.secondaryCtaLink || ""}
                          onChange={(e) => updateBlock(block.id, { secondaryCtaLink: e.target.value })}
                          placeholder="e.g. tel:+919876543210"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
