"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Users,
  Building2,
  MapPin,
  ShieldCheck,
  Award,
  CheckCircle2,
  MoveUp,
  MoveDown,
  Loader2,
  Radio,
  Sliders,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultMarketPulse,
  defaultHomeStats,
  type MarketPulseItem,
  type HomeStatCard,
} from "@/lib/settings";

const AVAILABLE_ICONS = [
  { value: "Users", label: "Happy Families / Clients (Users)", icon: Users },
  { value: "Building2", label: "Premium Projects / Buildings (Building2)", icon: Building2 },
  { value: "MapPin", label: "Cities / Locations (MapPin)", icon: MapPin },
  { value: "TrendingUp", label: "Years Experience / Growth (TrendingUp)", icon: TrendingUp },
  { value: "ShieldCheck", label: "RERA / Trust / Security (ShieldCheck)", icon: ShieldCheck },
  { value: "Award", label: "Awards / Excellence (Award)", icon: Award },
  { value: "Sparkles", label: "Luxury / Premium Amenities (Sparkles)", icon: Sparkles },
  { value: "CheckCircle2", label: "Verified / Completed Deals (CheckCircle2)", icon: CheckCircle2 },
];

const STAT_ICON_COMPONENTS: Record<string, any> = {
  Users,
  Building2,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
};

interface HomePageManagerProps {
  initialMarketPulse?: MarketPulseItem[];
  initialStats?: HomeStatCard[];
  initialTownship?: {
    enabled: boolean;
    projectSlugs: string[];
    heading: string;
    subheading: string;
  };
  projectOptions?: { slug: string; name: string }[];
  onSaveSuccess?: () => void;
  onFieldChange?: (key: string, value: string) => void;
  onBatchChange?: (updates: Record<string, string>) => void;
}

export function HomePageManager({
  initialMarketPulse,
  initialStats,
  initialTownship,
  projectOptions = [],
  onSaveSuccess,
  onFieldChange,
  onBatchChange,
}: HomePageManagerProps) {
  // Market Pulse state
  const [marketPulse, setMarketPulse] = useState<MarketPulseItem[]>(
    initialMarketPulse && initialMarketPulse.length > 0 ? initialMarketPulse : defaultMarketPulse
  );
  const [pulseText, setPulseText] = useState("");
  const [pulseHighlight, setPulseHighlight] = useState(false);
  const [editingPulseId, setEditingPulseId] = useState<string | null>(null);
  const [savingPulse, setSavingPulse] = useState(false);
  const [savedPulseSuccess, setSavedPulseSuccess] = useState(false);

  // Stats Cards state
  const [stats, setStats] = useState<HomeStatCard[]>(
    initialStats && initialStats.length > 0 ? initialStats : defaultHomeStats
  );
  const [statNumber, setStatNumber] = useState("");
  const [statLabel, setStatLabel] = useState("");
  const [statIcon, setStatIcon] = useState("Users");
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [savingStats, setSavingStats] = useState(false);
  const [savedStatsSuccess, setSavedStatsSuccess] = useState(false);

  // Township section state
  const [townshipEnabled, setTownshipEnabled] = useState(initialTownship?.enabled ?? true);
  const [selectedProjects, setSelectedProjects] = useState<string[]>(
    initialTownship?.projectSlugs ?? ["evara-27-acre-luxury-township"]
  );
  const [townshipHeading, setTownshipHeading] = useState(initialTownship?.heading || "");
  const [townshipSubheading, setTownshipSubheading] = useState(initialTownship?.subheading || "");
  const [savingTownship, setSavingTownship] = useState(false);
  const [savedTownshipSuccess, setSavedTownshipSuccess] = useState(false);

  // Global save state
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if props change (e.g. after parent reload)
  useEffect(() => {
    if (initialMarketPulse && initialMarketPulse.length > 0) {
      setMarketPulse(initialMarketPulse);
    }
  }, [initialMarketPulse]);

  useEffect(() => {
    if (initialStats && initialStats.length > 0) {
      setStats(initialStats);
    }
  }, [initialStats]);

  useEffect(() => {
    if (initialTownship) {
      setTownshipEnabled(initialTownship.enabled);
      if (initialTownship.projectSlugs && initialTownship.projectSlugs.length > 0) {
        setSelectedProjects(initialTownship.projectSlugs);
      }
      if (initialTownship.heading !== undefined) setTownshipHeading(initialTownship.heading);
      if (initialTownship.subheading !== undefined) setTownshipSubheading(initialTownship.subheading);
    }
  }, [initialTownship]);

  // Direct persistence helper
  const saveDirectly = async (payload: { key: string; value: string; group?: string }[]) => {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to save settings");
    onSaveSuccess?.();
  };

  // --- Market Pulse handlers with instant auto-save ---
  const savePulseList = async (nextPulse: MarketPulseItem[]) => {
    setSavingPulse(true);
    try {
      const jsonStr = JSON.stringify(nextPulse);
      onFieldChange?.("home.marketPulse", jsonStr);
      await saveDirectly([{ key: "home.marketPulse", value: jsonStr, group: "SYSTEM" }]);
      setSavedPulseSuccess(true);
      setTimeout(() => setSavedPulseSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save market pulse ticker.");
    } finally {
      setSavingPulse(false);
    }
  };

  const handleAddOrUpdatePulse = async () => {
    if (!pulseText.trim()) return;

    let nextPulse: MarketPulseItem[];
    if (editingPulseId) {
      nextPulse = marketPulse.map((item) =>
        item.id === editingPulseId
          ? { ...item, text: pulseText.trim(), highlight: pulseHighlight }
          : item
      );
      setEditingPulseId(null);
    } else {
      const newItem: MarketPulseItem = {
        id: `pulse-${Date.now()}`,
        text: pulseText.trim(),
        highlight: pulseHighlight,
      };
      nextPulse = [...marketPulse, newItem];
    }

    setMarketPulse(nextPulse);
    setPulseText("");
    setPulseHighlight(false);
    await savePulseList(nextPulse);
  };

  const handleEditPulse = (item: MarketPulseItem) => {
    setEditingPulseId(item.id);
    setPulseText(item.text);
    setPulseHighlight(Boolean(item.highlight));
  };

  const handleDeletePulse = async (id: string) => {
    const nextPulse = marketPulse.filter((item) => item.id !== id);
    setMarketPulse(nextPulse);
    if (editingPulseId === id) {
      setEditingPulseId(null);
      setPulseText("");
      setPulseHighlight(false);
    }
    await savePulseList(nextPulse);
  };

  const movePulse = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= marketPulse.length) return;
    const next = [...marketPulse];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    setMarketPulse(next);
    await savePulseList(next);
  };

  // --- Stats Cards handlers with instant auto-save ---
  const saveStatsList = async (nextStats: HomeStatCard[]) => {
    setSavingStats(true);
    try {
      const jsonStr = JSON.stringify(nextStats);
      onFieldChange?.("home.stats", jsonStr);
      await saveDirectly([{ key: "home.stats", value: jsonStr, group: "SYSTEM" }]);
      setSavedStatsSuccess(true);
      setTimeout(() => setSavedStatsSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save stat metric cards.");
    } finally {
      setSavingStats(false);
    }
  };

  const handleAddOrUpdateStat = async () => {
    if (!statNumber.trim() || !statLabel.trim()) return;

    let nextStats: HomeStatCard[];
    if (editingStatId) {
      nextStats = stats.map((s) =>
        s.id === editingStatId
          ? { ...s, number: statNumber.trim(), label: statLabel.trim(), icon: statIcon }
          : s
      );
      setEditingStatId(null);
    } else {
      const newCard: HomeStatCard = {
        id: `stat-${Date.now()}`,
        number: statNumber.trim(),
        label: statLabel.trim(),
        icon: statIcon,
      };
      nextStats = [...stats, newCard];
    }

    setStats(nextStats);
    setStatNumber("");
    setStatLabel("");
    setStatIcon("Users");
    await saveStatsList(nextStats);
  };

  const handleEditStat = (stat: HomeStatCard) => {
    setEditingStatId(stat.id);
    setStatNumber(stat.number);
    setStatLabel(stat.label);
    setStatIcon(stat.icon || "Users");
  };

  const handleDeleteStat = async (id: string) => {
    if (stats.length <= 1) {
      alert("Please keep at least 1 stat card.");
      return;
    }
    const nextStats = stats.filter((s) => s.id !== id);
    setStats(nextStats);
    if (editingStatId === id) {
      setEditingStatId(null);
      setStatNumber("");
      setStatLabel("");
      setStatIcon("Users");
    }
    await saveStatsList(nextStats);
  };

  const moveStat = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stats.length) return;
    const next = [...stats];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    setStats(next);
    await saveStatsList(next);
  };

  // --- Township section handlers with instant auto-save ---
  const handleToggleTownship = async (checked: boolean) => {
    setTownshipEnabled(checked);
    onFieldChange?.("home.masterTownship.enabled", checked ? "true" : "false");
    setSavingTownship(true);
    try {
      await saveDirectly([
        {
          key: "home.masterTownship.enabled",
          value: checked ? "true" : "false",
          group: "SYSTEM",
        },
      ]);
      setSavedTownshipSuccess(true);
      setTimeout(() => setSavedTownshipSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update Master Township visibility.");
    } finally {
      setSavingTownship(false);
    }
  };

  const toggleProject = (slug: string) => {
    const nextProjects = selectedProjects.includes(slug)
      ? selectedProjects.filter((s) => s !== slug)
      : [...selectedProjects, slug];
    setSelectedProjects(nextProjects);
    onFieldChange?.("home.masterTownship.projectSlugs", JSON.stringify(nextProjects));
  };

  const handleSaveTownship = async () => {
    setSavingTownship(true);
    try {
      const payload = [
        {
          key: "home.masterTownship.enabled",
          value: townshipEnabled ? "true" : "false",
          group: "SYSTEM",
        },
        {
          key: "home.masterTownship.projectSlugs",
          value: JSON.stringify(selectedProjects),
          group: "SYSTEM",
        },
        {
          key: "home.masterTownship.heading",
          value: townshipHeading,
          group: "SYSTEM",
        },
        {
          key: "home.masterTownship.subheading",
          value: townshipSubheading,
          group: "SYSTEM",
        },
      ];
      onFieldChange?.("home.masterTownship.enabled", townshipEnabled ? "true" : "false");
      onFieldChange?.("home.masterTownship.projectSlugs", JSON.stringify(selectedProjects));
      onFieldChange?.("home.masterTownship.heading", townshipHeading);
      onFieldChange?.("home.masterTownship.subheading", townshipSubheading);
      await saveDirectly(payload);
      setSavedTownshipSuccess(true);
      setTimeout(() => setSavedTownshipSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save Township configuration.");
    } finally {
      setSavingTownship(false);
    }
  };

  // Save all settings to DB
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = [
        {
          key: "home.marketPulse",
          value: JSON.stringify(marketPulse),
          group: "SYSTEM",
        },
        {
          key: "home.stats",
          value: JSON.stringify(stats),
          group: "SYSTEM",
        },
        {
          key: "home.masterTownship.enabled",
          value: townshipEnabled ? "true" : "false",
          group: "SYSTEM",
        },
        {
          key: "home.masterTownship.projectSlugs",
          value: JSON.stringify(selectedProjects),
          group: "SYSTEM",
        },
        {
          key: "home.masterTownship.heading",
          value: townshipHeading,
          group: "SYSTEM",
        },
        {
          key: "home.masterTownship.subheading",
          value: townshipSubheading,
          group: "SYSTEM",
        },
      ];

      onBatchChange?.({
        "home.marketPulse": JSON.stringify(marketPulse),
        "home.stats": JSON.stringify(stats),
        "home.masterTownship.enabled": townshipEnabled ? "true" : "false",
        "home.masterTownship.projectSlugs": JSON.stringify(selectedProjects),
        "home.masterTownship.heading": townshipHeading,
        "home.masterTownship.subheading": townshipSubheading,
      });

      await saveDirectly(payload);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      alert("Failed to save Home Page settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner with Save Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <span>Home Page Content &amp; Metrics Studio</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage Market Pulse ticker announcements, bottom stats cards (1200+ Happy Families, etc.), and township 3D showcase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-4 w-4" />
              Saved to Live Website!
            </span>
          )}
          <Button
            onClick={() => void handleSaveAll()}
            disabled={saving}
            className="gap-2 bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving Changes..." : "Save Home Page Settings"}
          </Button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. MARKET PULSE TICKER MANAGER                                        */}
      {/* ===================================================================== */}
      <Card className="border border-border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="h-4 w-4 text-rose-500 animate-pulse" />
                <span>Market Pulse Ticker (Live News Strip)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                The continuous marquee news strip displayed below the home search bar. Add real estate updates, RERA approvals, or launch announcements.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {savedPulseSuccess && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Live Ticker Updated!
                </span>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void savePulseList(marketPulse)}
                disabled={savingPulse}
                className="gap-1.5 text-xs h-8"
              >
                {savingPulse ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {savingPulse ? "Saving..." : "Save Ticker News"}
              </Button>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {marketPulse.length} active
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Live Marquee Preview Box */}
          <div className="rounded-xl border border-border bg-slate-950 text-white p-3 overflow-hidden select-none">
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400 shrink-0">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                Market Pulse Preview:
              </span>
              <div className="overflow-hidden flex-1 relative whitespace-nowrap">
                <div className="flex items-center gap-6">
                  {marketPulse.map((item, i) => (
                    <div key={item.id || i} className="flex items-center gap-2 shrink-0">
                      <span className={`font-medium ${item.highlight ? "text-amber-400 font-bold" : "text-slate-200"}`}>
                        {item.text}
                      </span>
                      <span className="text-slate-600">/</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Add / Edit Pulse Item Form */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
            <Label className="text-xs font-semibold text-foreground">
              {editingPulseId ? "Edit Announcement Text:" : "+ Add New Market Pulse Announcement:"}
            </Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Input
                placeholder="e.g. Indore Super Corridor: +16.8% YoY Property Appreciation"
                value={pulseText}
                onChange={(e) => setPulseText(e.target.value)}
                className="flex-1 bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOrUpdatePulse();
                  }
                }}
              />
              <div className="flex items-center gap-2 shrink-0 px-2 py-1 bg-background rounded-lg border border-border">
                <Switch
                  checked={pulseHighlight}
                  onCheckedChange={setPulseHighlight}
                  id="pulse-hl"
                />
                <Label htmlFor="pulse-hl" className="text-xs font-medium cursor-pointer">
                  Highlight (Gold Color)
                </Label>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  onClick={handleAddOrUpdatePulse}
                  disabled={!pulseText.trim()}
                  size="sm"
                  className="gap-1.5"
                >
                  {editingPulseId ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  <span>{editingPulseId ? "Update" : "Add News"}</span>
                </Button>
                {editingPulseId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingPulseId(null);
                      setPulseText("");
                      setPulseHighlight(false);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Current Ticker Items List */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Current Ticker Items ({marketPulse.length})
            </p>
            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              {marketPulse.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-3 p-3 text-xs transition-colors hover:bg-muted/40 ${
                    editingPulseId === item.id ? "bg-primary/10 border-l-4 border-primary" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-muted-foreground w-5">{idx + 1}.</span>
                    {item.highlight ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                        HIGHLIGHTED
                      </span>
                    ) : null}
                    <span className="font-medium text-foreground truncate">{item.text}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => movePulse(idx, "up")}
                      disabled={idx === 0}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Move Up"
                    >
                      <MoveUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => movePulse(idx, "down")}
                      disabled={idx === marketPulse.length - 1}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Move Down"
                    >
                      <MoveDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPulse(item)}
                      className="h-7 px-2 text-[11px] gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePulse(item.id)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================================== */}
      {/* 2. STATS & KEY METRICS CARDS MANAGER (The 4 cards below Market Pulse)  */}
      {/* ===================================================================== */}
      <Card className="border border-border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Key Metrics &amp; Bottom Cards (1200+ Happy Families, etc.)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                The 4 trust metric cards displayed directly below the Market Pulse ticker on the home page.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {savedStatsSuccess && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Live Website Updated!
                </span>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => void saveStatsList(stats)}
                disabled={savingStats}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-medium shadow-xs"
              >
                {savingStats ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {savingStats ? "Saving..." : "Save Stats to Live Site"}
              </Button>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {stats.length} cards active
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Live Visual Preview of the 4 Cards */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Live Home Page Visual Preview:
            </p>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 p-4 rounded-2xl bg-muted/40 border border-border">
              {stats.map((s) => {
                const IconComponent = (s.icon && STAT_ICON_COMPONENTS[s.icon]) || Users;
                return (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-border bg-card p-5 text-center shadow-xs"
                  >
                    <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="text-2xl font-bold text-foreground sm:text-3xl">
                      {s.number}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add / Edit Stat Card Form */}
          <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
            <Label className="text-xs font-semibold text-foreground">
              {editingStatId ? "Edit Stat Card:" : "+ Edit or Add Stat Metric Card:"}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">Number / Stat Value</Label>
                <Input
                  placeholder="e.g. 100+, 20+, 5+"
                  value={statNumber}
                  onChange={(e) => setStatNumber(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">Label / Title</Label>
                <Input
                  placeholder="e.g. Happy Families, Cities Covered"
                  value={statLabel}
                  onChange={(e) => setStatLabel(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">Card Icon</Label>
                <select
                  value={statIcon}
                  onChange={(e) => setStatIcon(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {AVAILABLE_ICONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {editingStatId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingStatId(null);
                    setStatNumber("");
                    setStatLabel("");
                    setStatIcon("Users");
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                onClick={handleAddOrUpdateStat}
                disabled={!statNumber.trim() || !statLabel.trim() || savingStats}
                size="sm"
                className="gap-1.5 bg-primary hover:bg-primary/90 text-white font-medium"
              >
                {savingStats ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : editingStatId ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                <span>
                  {savingStats
                    ? "Saving to Website..."
                    : editingStatId
                    ? "Update & Save to Live Site"
                    : "Add & Save Card"}
                </span>
              </Button>
            </div>
          </div>

          {/* List of Current Cards with Controls */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Manage Cards Order &amp; Content ({stats.length})
            </p>
            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              {stats.map((s, idx) => {
                const IconComponent = (s.icon && STAT_ICON_COMPONENTS[s.icon]) || Users;
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between gap-3 p-3 text-xs transition-colors hover:bg-muted/40 ${
                      editingStatId === s.id ? "bg-primary/10 border-l-4 border-primary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-muted-foreground w-4">{idx + 1}.</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-foreground text-sm mr-2">{s.number}</span>
                        <span className="text-muted-foreground">{s.label}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStat(idx, "up")}
                        disabled={idx === 0}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Move Left / Up"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => moveStat(idx, "down")}
                        disabled={idx === stats.length - 1}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Move Right / Down"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStat(s)}
                        className="h-7 px-2 text-[11px] gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStat(s.id)}
                        className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================================== */}
      {/* 3. MASTER TOWNSHIP 3D SHOWCASE SECTION                                */}
      {/* ===================================================================== */}
      <Card className="border border-border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span>Flagship Master Township Experience (3D / AutoCAD Section)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Toggle and configure the interactive township showcase section displayed on the home page.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {savingTownship && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </span>
              )}
              {savedTownshipSuccess && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Live Website Updated!
                </span>
              )}
              <div className="flex items-center gap-2 bg-muted/60 px-3 py-1.5 rounded-xl border border-border">
                <Label htmlFor="township-toggle" className="text-xs font-semibold cursor-pointer select-none">
                  {townshipEnabled ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      Section Visible on Live Site
                    </span>
                  ) : (
                    <span className="text-rose-500 dark:text-rose-400 flex items-center gap-1 font-bold">
                      <EyeOff className="h-3.5 w-3.5" />
                      Section Hidden from Live Site
                    </span>
                  )}
                </Label>
                <Switch
                  id="township-toggle"
                  checked={townshipEnabled}
                  onCheckedChange={(checked) => void handleToggleTownship(checked)}
                  disabled={savingTownship}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        {townshipEnabled && (
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                Select Showcase Projects:
              </Label>
              <div className="flex flex-wrap gap-2">
                {projectOptions.map((p) => {
                  const isChecked = selectedProjects.includes(p.slug);
                  return (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => toggleProject(p.slug)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                        isChecked
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${isChecked ? "bg-primary" : "bg-muted-foreground/40"}`} />
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Custom Section Heading (optional)
                </Label>
                <Input
                  placeholder="Defaults to project name"
                  value={townshipHeading}
                  onChange={(e) => {
                    setTownshipHeading(e.target.value);
                    onFieldChange?.("home.masterTownship.heading", e.target.value);
                  }}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Custom Section Subheading (optional)
                </Label>
                <Input
                  placeholder="Defaults to project description"
                  value={townshipSubheading}
                  onChange={(e) => {
                    setTownshipSubheading(e.target.value);
                    onFieldChange?.("home.masterTownship.subheading", e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              {savedTownshipSuccess && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Township settings saved!
                </span>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => void handleSaveTownship()}
                disabled={savingTownship}
                className="gap-1.5"
              >
                {savingTownship ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {savingTownship ? "Saving Township..." : "Save Township Configuration"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Sticky Bottom Floating Quick-Save Bar */}
      <div className="sticky bottom-4 z-40 flex items-center justify-between gap-4 p-4 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-foreground">
            Home Page Studio — All changes sync live to <code className="font-mono text-primary font-semibold">localhost:3000</code>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-4 w-4" />
              All Changes Saved &amp; Live!
            </span>
          )}
          <Button
            type="button"
            onClick={() => void handleSaveAll()}
            disabled={saving}
            className="gap-2 bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving All Changes..." : "Save All Home Page Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
