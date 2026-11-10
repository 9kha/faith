"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Search,
  Plus,
  Layers,
  Wand2,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  KeyRound,
  Store,
  Briefcase,
  Home,
  Crown,
  Trees,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Box,
} from "lucide-react";
import { GraphicalElevationViewer } from "@/components/admin/graphical-elevation-viewer";

// Status Color Tokens - Theme Aware
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    badge: string;
    cardBg: string;
    cardBorder: string;
    dot: string;
    icon: typeof CheckCircle2;
  }
> = {
  AVAILABLE: {
    label: "Available",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    cardBg:
      "bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40",
    cardBorder:
      "border-emerald-200/90 dark:border-emerald-800/80 hover:border-emerald-400 dark:hover:border-emerald-600",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  SOLD: {
    label: "Sold",
    badge:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    cardBg:
      "bg-rose-50/40 hover:bg-rose-50 dark:bg-rose-950/20 dark:hover:bg-rose-950/40",
    cardBorder:
      "border-rose-200/90 dark:border-rose-800/80 hover:border-rose-400 dark:hover:border-rose-600",
    dot: "bg-rose-500",
    icon: XCircle,
  },
  HOLD: {
    label: "Hold",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    cardBg:
      "bg-amber-50/40 hover:bg-amber-50 dark:bg-amber-950/20 dark:hover:bg-amber-950/40",
    cardBorder:
      "border-amber-200/90 dark:border-amber-800/80 hover:border-amber-400 dark:hover:border-amber-600",
    dot: "bg-amber-500",
    icon: Clock,
  },
  BLOCKED: {
    label: "Blocked",
    badge:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    cardBg:
      "bg-slate-50/60 hover:bg-slate-100/60 dark:bg-slate-900/40 dark:hover:bg-slate-800/60",
    cardBorder:
      "border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600",
    dot: "bg-slate-500",
    icon: Ban,
  },
  RENTED: {
    label: "Rented",
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800",
    cardBg:
      "bg-blue-50/40 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40",
    cardBorder:
      "border-blue-200/90 dark:border-blue-800/80 hover:border-blue-400 dark:hover:border-blue-600",
    dot: "bg-blue-500",
    icon: KeyRound,
  },
};

type UnitRecord = {
  id: string;
  projectId: string;
  towerId: string | null;
  unitNo: string;
  floor: number | null;
  bhk: string | null;
  area: number | null;
  facing: string | null;
  price: number | null;
  status: string;
  holdUntil: string | null;
  tower?: { id: string; name: string; floors: number } | null;
  project?: { id: string; name: string; slug: string; type: string } | null;
};

type TowerRecord = {
  id: string;
  projectId: string;
  name: string;
  floors: number;
  sortOrder: number;
};

type ProjectSummary = {
  id: string;
  name: string;
  slug: string;
  type: string;
};

type InventoryStats = {
  total: number;
  available: number;
  sold: number;
  hold: number;
  blocked: number;
  rented: number;
  commercial: number;
  residential: number;
};

export default function UnitInventoryManagerPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [units, setUnits] = useState<UnitRecord[]>([]);
  const [towers, setTowers] = useState<TowerRecord[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    total: 0,
    available: 0,
    sold: 0,
    hold: 0,
    blocked: 0,
    rented: 0,
    commercial: 0,
    residential: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"GRAPHICAL" | "MATRIX" | "TABLE">("GRAPHICAL");

  // Modals state
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAddTowerModal, setShowAddTowerModal] = useState(false);
  const [activeUnit, setActiveUnit] = useState<UnitRecord | null>(null);

  // Load Projects on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/projects?limit=100");
        const data = await res.json();
        if (mounted && data.projects?.length > 0) {
          setProjects(data.projects);
          setSelectedProjectId(data.projects[0].id);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load Inventory for selected project
  const loadInventory = useCallback(async () => {
    if (!selectedProjectId) return;
    setRefreshing(true);
    try {
      const params = new URLSearchParams({ projectId: selectedProjectId });
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/inventory?${params.toString()}`);
      const data = await res.json();
      setUnits(data.units || []);
      setTowers(data.towers || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Failed to fetch inventory", err);
    } finally {
      setRefreshing(false);
    }
  }, [selectedProjectId, search, statusFilter]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Filtered units for Category (Mixed use filter)
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (categoryFilter === "COMMERCIAL") {
        return /shop|retail|showroom|office|commercial|kiosk/i.test(
          u.bhk || ""
        );
      }
      if (categoryFilter === "RESIDENTIAL") {
        return !/shop|retail|showroom|office|commercial|kiosk/i.test(
          u.bhk || ""
        );
      }
      if (categoryFilter === "PENTHOUSE") {
        return /penthouse|villa|sky/i.test(u.bhk || "");
      }
      return true;
    });
  }, [units, categoryFilter]);

  // Group units by tower, and inside tower by floor (descending from highest floor down to Ground floor)
  const towerGroupedData = useMemo(() => {
    // If no explicit towers exist, group under "Main Tower"
    const towerMap: Record<
      string,
      {
        towerName: string;
        towerId: string | null;
        floors: Record<number, UnitRecord[]>;
      }
    > = {};

    // Register all known towers for this project
    towers.forEach((t) => {
      towerMap[t.id] = {
        towerName: t.name,
        towerId: t.id,
        floors: {},
      };
    });

    // Bucket units into towers and floors
    filteredUnits.forEach((u) => {
      const tKey = u.towerId || "UNASSIGNED";
      if (!towerMap[tKey]) {
        towerMap[tKey] = {
          towerName: u.tower?.name || (tKey === "UNASSIGNED" ? "General Tower" : "Tower"),
          towerId: u.towerId,
          floors: {},
        };
      }
      const floorNum = u.floor ?? 1;
      if (!towerMap[tKey].floors[floorNum]) {
        towerMap[tKey].floors[floorNum] = [];
      }
      towerMap[tKey].floors[floorNum].push(u);
    });

    return Object.values(towerMap);
  }, [filteredUnits, towers]);

  // Quick Status change action
  const handleQuickStatusChange = async (unitId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId, status: newStatus }),
      });
      if (res.ok) {
        setUnits((prev) =>
          prev.map((u) => (u.id === unitId ? { ...u, status: newStatus } : u))
        );
        if (activeUnit && activeUnit.id === unitId) {
          setActiveUnit((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        loadInventory();
      }
    } catch (err) {
      console.error("Status update error", err);
    }
  };

  // Delete Unit action
  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;
    try {
      const res = await fetch(`/api/inventory?id=${unitId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUnits((prev) => prev.filter((u) => u.id !== unitId));
        setActiveUnit(null);
        loadInventory();
      }
    } catch (err) {
      console.error("Delete unit error", err);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading unit inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Unit Inventory & Structure Manager
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex text-xs">
              Live Interactive Grid
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage unit-level inventory with dynamic mixed-use floor plans, commercial podiums, and live status mapping.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddTowerModal(true)}
            className="gap-1.5"
          >
            <Building2 className="h-4 w-4" />
            <span>Add Tower / Wing</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBatchModal(true)}
            className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/50"
          >
            <Wand2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Smart Floor Generator</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddUnitModal(true)}
            className="gap-1.5 shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Add Custom Unit</span>
          </Button>
        </div>
      </div>

      {/* Project Switcher Bar */}
      <div className="rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-border dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Project:
            </span>
            <span className="font-bold text-foreground">
              {selectedProject?.name || "Select Project"}
            </span>
            {selectedProject && (
              <Badge variant="secondary" className="text-[11px] font-normal">
                {selectedProject.type}
              </Badge>
            )}
          </div>
          <button
            onClick={() => loadInventory()}
            disabled={refreshing}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Horizontal Project Pill List */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {projects.map((p) => {
            const isSelected = p.id === selectedProjectId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border dark:border-slate-800 bg-muted/40 dark:bg-slate-800/40 text-muted-foreground hover:bg-muted dark:hover:bg-slate-800 hover:text-foreground"
                }`}
              >
                <Building2 className="h-3.5 w-3.5 opacity-80" />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-3.5 shadow-sm">
          <p className="text-xs text-muted-foreground">Total Units</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
          </div>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {stats.available}
          </p>
        </div>
        <div className="rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Sold
          </div>
          <p className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-400">
            {stats.sold}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> On Hold
          </div>
          <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">
            {stats.hold}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-slate-500" /> Blocked
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-700 dark:text-slate-300">
            {stats.blocked}
          </p>
        </div>
        <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Rented
          </div>
          <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-400">
            {stats.rented}
          </p>
        </div>
        <div className="rounded-xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-3.5 shadow-sm">
          <p className="text-xs text-muted-foreground">Commercial / Res.</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {stats.commercial} Retail · {stats.residential} Res.
          </p>
        </div>
      </div>

      {/* Filter and View Controls Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search unit no, BHK, shop, office…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 rounded-xl border border-border dark:border-slate-800 bg-muted/30 p-1">
            {["ALL", "AVAILABLE", "SOLD", "HOLD", "BLOCKED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "ALL" ? "All Status" : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Mixed-Use Category Filter */}
          <div className="flex items-center gap-1 rounded-xl border border-border dark:border-slate-800 bg-muted/30 p-1">
            {[
              { id: "ALL", label: "All Types" },
              { id: "COMMERCIAL", label: "🛍️ Commercial" },
              { id: "RESIDENTIAL", label: "🏡 Residential" },
              { id: "PENTHOUSE", label: "👑 Penthouses" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-border dark:border-slate-800 bg-muted/30 p-1">
            <button
              onClick={() => setViewMode("GRAPHICAL")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "GRAPHICAL"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>3D &amp; Elevation Graphic</span>
            </button>
            <button
              onClick={() => setViewMode("MATRIX")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "MATRIX"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Tower Matrix</span>
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "TABLE"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>List Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Graphical Elevation, Tower Matrix, or Table */}
      {viewMode === "GRAPHICAL" ? (
        <div className="w-full min-w-0 max-w-full overflow-hidden">
          <GraphicalElevationViewer
            towerData={towerGroupedData}
            projectName={
              projects.find((p) => p.id === selectedProjectId)?.name ||
              "Township Development"
            }
            onSelectUnit={(u) => setActiveUnit(u)}
            onAddUnit={(floor, towerId) => {
              setShowAddUnitModal(true);
            }}
          />
        </div>
      ) : viewMode === "MATRIX" ? (
        <div className="space-y-8">
          {towerGroupedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border dark:border-slate-800 py-16 text-center">
              <Building2 className="mb-3 h-12 w-12 text-muted-foreground/40" />
              <h3 className="text-lg font-bold text-foreground">No units found</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                No units match your current filters. Create units manually or generate a complete floor structure.
              </p>
              <div className="mt-5 flex gap-3">
                <Button size="sm" onClick={() => setShowBatchModal(true)}>
                  <Wand2 className="mr-1.5 h-4 w-4" /> Smart Generate Tower
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddUnitModal(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Custom Unit
                </Button>
              </div>
            </div>
          ) : (
            towerGroupedData.map((towerBlock) => {
              // Extract sorted floors from highest floor number down to floor 1 (Architectural building elevation)
              const floorNumbers = Object.keys(towerBlock.floors)
                .map(Number)
                .sort((a, b) => b - a);

              return (
                <div
                  key={towerBlock.towerName}
                  className="rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 p-6 shadow-sm"
                >
                  {/* Tower Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground sm:text-xl">
                          {towerBlock.towerName}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {floorNumbers.length} Floors ·{" "}
                          {Object.values(towerBlock.floors).flat().length} Total Units
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddUnitModal(true);
                        }}
                        className="text-xs gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Unit Here</span>
                      </Button>
                    </div>
                  </div>

                  {/* Floor by Floor Architectural Cross Section */}
                  <div className="mt-6 space-y-4">
                    {floorNumbers.map((floorNum) => {
                      const floorUnits = towerBlock.floors[floorNum] || [];

                      // Determine floor character: Commercial Shopping vs Office vs Residential vs Penthouse vs Bungalows vs Odd/Even
                      const isShopping = floorUnits.some((u) =>
                        /shop|retail|showroom|kiosk/i.test(u.bhk || "")
                      );
                      const isOffice = floorUnits.some((u) =>
                        /office|corporate|suite|bay/i.test(u.bhk || "")
                      );
                      const isPenthouse = floorUnits.some((u) =>
                        /penthouse|sky villa/i.test(u.bhk || "")
                      );
                      const isVilla = floorUnits.some((u) =>
                        /villa|bungalow|mansion|palace/i.test(u.bhk || "")
                      );
                      const isOddFloor = floorNum > 0 && floorNum % 2 !== 0;
                      const isEvenFloor = floorNum > 0 && floorNum % 2 === 0;

                      const floorBadge = isVilla ? (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                          <Crown className="h-3 w-3 text-amber-500" /> Presidential Bungalow Enclave (4–8 BHK)
                        </span>
                      ) : isShopping ? (
                        <span className="flex items-center gap-1 rounded-md bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                          <Store className="h-3 w-3" /> Retail / Shopping Floor
                        </span>
                      ) : isOffice ? (
                        <span className="flex items-center gap-1 rounded-md bg-blue-500/10 dark:bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                          <Briefcase className="h-3 w-3" /> Commercial Offices
                        </span>
                      ) : isPenthouse ? (
                        <span className="flex items-center gap-1 rounded-md bg-purple-500/10 dark:bg-purple-500/20 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                          <Crown className="h-3 w-3" /> Penthouses & Sky Mansions
                        </span>
                      ) : isOddFloor ? (
                        <span className="flex items-center gap-1 rounded-md bg-blue-500/10 dark:bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                          <Layers className="h-3 w-3" /> ODD Floor: Sky Balcony Deck
                        </span>
                      ) : isEvenFloor ? (
                        <span className="flex items-center gap-1 rounded-md bg-purple-500/10 dark:bg-purple-500/20 px-2 py-0.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                          <Sparkles className="h-3 w-3" /> EVEN Floor: Double-Height Terrace
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-md bg-slate-500/10 dark:bg-slate-500/20 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          <Home className="h-3 w-3" /> Residential Apartments
                        </span>
                      );

                      return (
                        <div
                          key={floorNum}
                          className="flex flex-col gap-3 rounded-2xl border border-border/80 dark:border-slate-800/80 bg-muted/20 dark:bg-slate-950/40 p-4 sm:flex-row sm:items-center"
                        >
                          {/* Floor label pillar */}
                          <div className="flex shrink-0 items-center justify-between gap-3 sm:w-44 sm:flex-col sm:items-start sm:justify-center">
                            <div>
                              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                {floorNum === 0 ? "Ground Floor" : `Floor ${floorNum}`}
                              </span>
                              <div className="mt-1">{floorBadge}</div>
                            </div>
                            <span className="text-[11px] text-muted-foreground sm:mt-1">
                              {floorUnits.length} units
                            </span>
                          </div>

                          {/* Unit Cards in this Floor */}
                          <div className="flex-1 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                            {floorUnits.map((u) => {
                              const cfg = STATUS_CONFIG[u.status] || STATUS_CONFIG.AVAILABLE;
                              const isShop = /shop|retail|showroom|kiosk/i.test(u.bhk || "");
                              const formattedPrice = u.price
                                ? u.price >= 10000000
                                  ? `₹${(u.price / 10000000).toFixed(2)} Cr`
                                  : `₹${(u.price / 100000).toFixed(1)} L`
                                : "Price N/A";

                              return (
                                <div
                                  key={u.id}
                                  onClick={() => setActiveUnit(u)}
                                  className={`group relative flex flex-col justify-between rounded-xl border p-2.5 transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 ${cfg.cardBg} ${cfg.cardBorder}`}
                                >
                                  {/* Top Row: Unit No + Status Dot */}
                                  <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-sm text-foreground">
                                      {u.unitNo}
                                    </span>
                                    <span
                                      className={`h-2 w-2 rounded-full ${cfg.dot}`}
                                      title={cfg.label}
                                    />
                                  </div>

                                  {/* Middle Row: BHK / Type Badge */}
                                  <div className="mt-1.5 line-clamp-1 text-[11px] font-semibold text-foreground/90">
                                    {isShop && <Store className="inline-block mr-1 h-3 w-3 text-amber-600 dark:text-amber-400" />}
                                    {u.bhk || "Standard"}
                                  </div>

                                  {/* Area & Facing */}
                                  <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span>{u.area ? `${u.area} sqft` : "—"}</span>
                                    <span>{u.facing || "—"}</span>
                                  </div>

                                  {/* Price Tag */}
                                  <div className="mt-2 border-t border-border/40 dark:border-slate-800/60 pt-1.5 flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-foreground">
                                      {formattedPrice}
                                    </span>
                                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                      Edit →
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* List / Table View */
        <div className="overflow-hidden rounded-2xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border dark:border-slate-800 bg-muted/40 dark:bg-slate-800/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Unit No</th>
                  <th className="px-4 py-3">Tower</th>
                  <th className="px-4 py-3">Floor</th>
                  <th className="px-4 py-3">Category / BHK</th>
                  <th className="px-4 py-3">Area (sq ft)</th>
                  <th className="px-4 py-3">Facing</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-slate-800">
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      No units found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((u) => {
                    const cfg = STATUS_CONFIG[u.status] || STATUS_CONFIG.AVAILABLE;
                    const formattedPrice = u.price
                      ? u.price >= 10000000
                        ? `₹${(u.price / 10000000).toFixed(2)} Cr`
                        : `₹${(u.price / 100000).toFixed(1)} Lakh`
                      : "—";

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-muted/30 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-foreground">
                          {u.unitNo}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {u.tower?.name || "Main Tower"}
                        </td>
                        <td className="px-4 py-3 text-foreground font-medium">
                          {u.floor === 0 ? "Ground" : u.floor ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">{u.bhk}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {u.area ? `${u.area} sq ft` : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {u.facing || "—"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {formattedPrice}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-xs ${cfg.badge}`}>
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveUnit(u)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUnit(u.id)}
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: ADD SINGLE CUSTOM UNIT ================= */}
      {showAddUnitModal && (
        <AddCustomUnitModal
          projectId={selectedProjectId}
          towers={towers}
          onClose={() => setShowAddUnitModal(false)}
          onSuccess={() => {
            setShowAddUnitModal(false);
            loadInventory();
          }}
        />
      )}

      {/* ================= MODAL 2: SMART FLOOR & TOWER GENERATOR ================= */}
      {showBatchModal && (
        <SmartFloorGeneratorModal
          projectId={selectedProjectId}
          towers={towers}
          onClose={() => setShowBatchModal(false)}
          onSuccess={() => {
            setShowBatchModal(false);
            loadInventory();
          }}
        />
      )}

      {/* ================= MODAL 3: ADD TOWER / WING ================= */}
      {showAddTowerModal && (
        <AddTowerModal
          projectId={selectedProjectId}
          onClose={() => setShowAddTowerModal(false)}
          onSuccess={() => {
            setShowAddTowerModal(false);
            loadInventory();
          }}
        />
      )}

      {/* ================= MODAL 4: UNIT DETAIL & STATUS EDIT DRAWER ================= */}
      {activeUnit && (
        <UnitDetailEditModal
          unit={activeUnit}
          towers={towers}
          onClose={() => setActiveUnit(null)}
          onQuickStatusChange={handleQuickStatusChange}
          onDelete={handleDeleteUnit}
          onSuccess={() => {
            setActiveUnit(null);
            loadInventory();
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// MODAL 1: Add Single Custom Unit
// -------------------------------------------------------------
function AddCustomUnitModal({
  projectId,
  towers,
  onClose,
  onSuccess,
}: {
  projectId: string;
  towers: TowerRecord[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [towerId, setTowerId] = useState(towers[0]?.id || "");
  const [unitNo, setUnitNo] = useState("");
  const [floor, setFloor] = useState("1");
  const [categoryType, setCategoryType] = useState("2 BHK Flat");
  const [customBhk, setCustomBhk] = useState("");
  const [area, setArea] = useState("1100");
  const [facing, setFacing] = useState("East");
  const [price, setPrice] = useState("6500000");
  const [status, setStatus] = useState("AVAILABLE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitNo.trim()) return;
    setIsSubmitting(true);
    try {
      const bhkFinal = categoryType === "CUSTOM" ? customBhk : categoryType;
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_unit",
          projectId,
          towerId: towerId || null,
          unitNo: unitNo.trim(),
          floor: parseInt(floor, 10),
          bhk: bhkFinal,
          area: parseFloat(area),
          facing,
          price: parseInt(price, 10),
          status,
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create unit");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating unit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Add Custom Unit</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Tower / Wing
              </label>
              <select
                value={towerId}
                onChange={(e) => setTowerId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background dark:bg-slate-800 px-3 py-2 text-sm"
              >
                {towers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                <option value="">Default / General Tower</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Floor Number
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="0 = Ground, 1, 2..."
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Unit Number / Identifier
              </label>
              <Input
                value={unitNo}
                onChange={(e) => setUnitNo(e.target.value)}
                placeholder="e.g. Shop 101, Flat 204, P-1"
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Category & Floor Plan
              </label>
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <optgroup label="Commercial / Retail">
                  <option value="Retail Commercial Shop">Retail Shop (Ground/1st Floor)</option>
                  <option value="Retail Showroom">Retail Showroom</option>
                  <option value="Commercial Office Space">Commercial Office Suite</option>
                  <option value="F&B Cafe Space">Restaurant / Cafe Kiosk</option>
                </optgroup>
                <optgroup label="Residential">
                  <option value="1 BHK Compact">1 BHK Flat</option>
                  <option value="2 BHK Flat">2 BHK Flat</option>
                  <option value="3 BHK Luxury">3 BHK Luxury Flat</option>
                  <option value="4 BHK Penthouse">4 BHK Sky Villa / Penthouse</option>
                  <option value="Studio Apartment">Studio Apartment</option>
                </optgroup>
                <optgroup label="Plotted & Villas">
                  <option value="Independent Duplex Villa">Duplex Villa</option>
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Commercial Plot">Commercial Plot</option>
                  <option value="CUSTOM">Custom Type...</option>
                </optgroup>
              </select>
            </div>
          </div>

          {categoryType === "CUSTOM" && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Specify Custom Type
              </label>
              <Input
                value={customBhk}
                onChange={(e) => setCustomBhk(e.target.value)}
                placeholder="e.g. 5 BHK Duplex, Anchor Showroom"
                className="mt-1"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Super Area (sq ft)
              </label>
              <Input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="1100"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Facing / Vaastu
              </label>
              <select
                value={facing}
                onChange={(e) => setFacing(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="East">East (Vaastu Compliant)</option>
                <option value="North-East">North-East</option>
                <option value="North">North</option>
                <option value="West">West</option>
                <option value="South-East">South-East</option>
                <option value="Road Facing">Road Facing (Front)</option>
                <option value="Garden Facing">Garden Facing</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Price (₹ INR)
              </label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="6500000"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Initial Unit Status
            </label>
            <div className="mt-2 flex gap-2">
              {["AVAILABLE", "HOLD", "SOLD", "BLOCKED"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
                    status === st
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border dark:border-slate-800 bg-muted/40 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border dark:border-slate-800 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Save Unit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL 2: Smart Floor & Tower Batch Generator (Odd-Even, Evara 27-Acre, Bungalows)
// -------------------------------------------------------------
function SmartFloorGeneratorModal({
  projectId,
  towers,
  onClose,
  onSuccess,
}: {
  projectId: string;
  towers: TowerRecord[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [generatorMode, setGeneratorMode] = useState<
    "EVARA_TOWNSHIP" | "ODD_EVEN" | "BUNGALOWS" | "STANDARD"
  >("EVARA_TOWNSHIP");

  // Multi-tower targets (for odd-even and high rises)
  const [targetTowersInput, setTargetTowersInput] = useState(
    "Tower T1, Tower T2, Tower T3, Tower T4"
  );
  const [startFloor, setStartFloor] = useState("1");
  const [endFloor, setEndFloor] = useState("23");

  // Odd-Floor Settings
  const [oddBhk, setOddBhk] = useState("3 BHK + Extended Sky Balcony");
  const [oddUnits, setOddUnits] = useState("4");
  const [oddArea, setOddArea] = useState("2450");
  const [oddPrice, setOddPrice] = useState("19500000");
  const [oddFacing, setOddFacing] = useState("East Open Sky");

  // Even-Floor Settings
  const [evenBhk, setEvenBhk] = useState("4 BHK Sky Mansion (Double-Height Terrace)");
  const [evenUnits, setEvenUnits] = useState("3");
  const [evenArea, setEvenArea] = useState("3250");
  const [evenPrice, setEvenPrice] = useState("26500000");
  const [evenFacing, setEvenFacing] = useState("West Sunset Deck");

  // Bungalow Settings
  const [villaCount, setVillaCount] = useState("16");
  const [villaZoneName, setVillaZoneName] = useState(
    "Presidential Bungalows & Villas (27-Acre Enclave)"
  );

  // Standard / Uniform Settings
  const [towerName, setTowerName] = useState(towers[0]?.name || "Tower A");
  const [unitsPerFloor, setUnitsPerFloor] = useState("4");
  const [bhkType, setBhkType] = useState("2 BHK Luxury Flat");
  const [prefix, setPrefix] = useState("");
  const [baseArea, setBaseArea] = useState("1200");
  const [basePrice, setBasePrice] = useState("6500000");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let payload: Record<string, unknown> = {
        action: "batch_generate",
        projectId,
      };

      if (generatorMode === "EVARA_TOWNSHIP") {
        payload = {
          ...payload,
          generatorMode: "EVARA_27ACRE",
        };
      } else if (generatorMode === "ODD_EVEN") {
        payload = {
          ...payload,
          generatorMode: "ODD_EVEN",
          targetTowers: targetTowersInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          startFloor,
          endFloor,
          oddBhk,
          oddUnits,
          oddArea,
          oddPrice,
          oddFacing,
          evenBhk,
          evenUnits,
          evenArea,
          evenPrice,
          evenFacing,
        };
      } else if (generatorMode === "BUNGALOWS") {
        payload = {
          ...payload,
          generatorMode: "BUNGALOWS",
          villaCount,
          villaTowerName: villaZoneName,
        };
      } else {
        payload = {
          ...payload,
          generatorMode: "STANDARD",
          towerName,
          startFloor,
          endFloor,
          unitsPerFloor,
          bhkType,
          prefix,
          baseArea,
          basePrice,
        };
      }

      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to generate units");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating inventory structure");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Architectural Floor & Structure Generator
              </h3>
              <p className="text-xs text-muted-foreground">
                Odd-Even alternating floors, 27-acre township blueprints, and multi-tower replication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              id: "EVARA_TOWNSHIP",
              label: "🌟 Evara 27-Acre Model",
              sub: "Bungalows 4-8 BHK + T1-T4",
            },
            {
              id: "ODD_EVEN",
              label: "🔄 Odd-Even High-Rise",
              sub: "G+23 Alternating Floors",
            },
            {
              id: "BUNGALOWS",
              label: "🏡 Bungalow Enclave",
              sub: "4 BHK to 8 BHK Villas",
            },
            {
              id: "STANDARD",
              label: "🏢 Standard / Mixed-Use",
              sub: "Custom Floor Range",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setGeneratorMode(
                  tab.id as "EVARA_TOWNSHIP" | "ODD_EVEN" | "BUNGALOWS" | "STANDARD"
                )
              }
              className={`rounded-2xl border p-2.5 text-left transition-all ${
                generatorMode === tab.id
                  ? "border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 shadow-xs ring-1 ring-blue-500"
                  : "border-border dark:border-slate-800 bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              <p className="font-bold text-xs text-foreground">{tab.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{tab.sub}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* ============ MODE A: EVARA 27-ACRE TOWNSHIP ============ */}
          {generatorMode === "EVARA_TOWNSHIP" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 p-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  <Sparkles className="h-4 w-4" />
                  <span>Real-World Scenario: Evara 27-Acre Integrated Township</span>
                </div>
                <p className="mt-2 text-xs text-blue-950/80 dark:text-blue-200 leading-relaxed">
                  In modern mega-townships like Evara (27 Acres), builders develop two complementary product classes in one master development:
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-card dark:bg-slate-900 p-3">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <Crown className="h-3.5 w-3.5 text-amber-500" /> Zone 1: Presidential Bungalows
                    </span>
                    <ul className="mt-1.5 text-[11px] text-muted-foreground space-y-1">
                      <li>• 16 Luxury Bungalows from 4 BHK up to 8 BHK</li>
                      <li>• Private manicured lawns & pool options</li>
                      <li>• Sizes: 3,800 to 12,000 sq ft (₹4.2 Cr – ₹16.5 Cr)</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-card dark:bg-slate-900 p-3">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-blue-500" /> Zone 2: Towers T1, T2, T3, T4 (G+23)
                    </span>
                    <ul className="mt-1.5 text-[11px] text-muted-foreground space-y-1">
                      <li>• 4 Towers with G+23 Floors each</li>
                      <li>• Odd Floors: 4 units (3 BHK + Sky Balcony Deck)</li>
                      <li>• Even Floors: 3 units (4 BHK Sky Mansion Terrace)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border dark:border-slate-800 bg-muted/30 p-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Action: </span>
                Clicking Generate will deploy this entire 27-acre township structure into the current project in one automated batch.
              </div>
            </div>
          )}

          {/* ============ MODE B: ODD-EVEN ALTERNATING HIGH-RISE ============ */}
          {generatorMode === "ODD_EVEN" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Target Towers / Wings (Comma separated for multi-tower setup)
                </label>
                <Input
                  value={targetTowersInput}
                  onChange={(e) => setTargetTowersInput(e.target.value)}
                  placeholder="Tower T1, Tower T2, Tower T3, Tower T4"
                  className="mt-1"
                  required
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Enter multiple towers to replicate the G+23 structure across T1, T2, T3, T4 simultaneously!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Start Floor
                  </label>
                  <Input
                    type="number"
                    value={startFloor}
                    onChange={(e) => setStartFloor(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    End Floor
                  </label>
                  <Input
                    type="number"
                    value={endFloor}
                    onChange={(e) => setEndFloor(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              {/* Odd Floor Blueprint Card */}
              <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    ODD FLOORS Plan (Floor 1, 3, 5, 7, 9, ... 23)
                  </h4>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Configuration / Plan
                    </label>
                    <Input
                      value={oddBhk}
                      onChange={(e) => setOddBhk(e.target.value)}
                      className="mt-1 h-8 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Units Per Floor
                    </label>
                    <Input
                      type="number"
                      value={oddUnits}
                      onChange={(e) => setOddUnits(e.target.value)}
                      className="mt-1 h-8 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Avg Area (sq ft)
                    </label>
                    <Input
                      type="number"
                      value={oddArea}
                      onChange={(e) => setOddArea(e.target.value)}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Price (₹)
                    </label>
                    <Input
                      type="number"
                      value={oddPrice}
                      onChange={(e) => setOddPrice(e.target.value)}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Even Floor Blueprint Card */}
              <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                    EVEN FLOORS Plan (Floor 2, 4, 6, 8, 10, ... 22)
                  </h4>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Configuration / Plan
                    </label>
                    <Input
                      value={evenBhk}
                      onChange={(e) => setEvenBhk(e.target.value)}
                      className="mt-1 h-8 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Units Per Floor
                    </label>
                    <Input
                      type="number"
                      value={evenUnits}
                      onChange={(e) => setEvenUnits(e.target.value)}
                      className="mt-1 h-8 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Avg Area (sq ft)
                    </label>
                    <Input
                      type="number"
                      value={evenArea}
                      onChange={(e) => setEvenArea(e.target.value)}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground font-medium">
                      Price (₹)
                    </label>
                    <Input
                      type="number"
                      value={evenPrice}
                      onChange={(e) => setEvenPrice(e.target.value)}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ MODE C: BUNGALOW & VILLA ENCLAVE ============ */}
          {generatorMode === "BUNGALOWS" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Bungalow Enclave / Zone Title
                </label>
                <Input
                  value={villaZoneName}
                  onChange={(e) => setVillaZoneName(e.target.value)}
                  placeholder="Presidential Bungalows & Villas (27-Acre Enclave)"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Number of Bungalows / Villas to Generate
                </label>
                <Input
                  type="number"
                  min="4"
                  max="50"
                  value={villaCount}
                  onChange={(e) => setVillaCount(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
                <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  Automatic Layout Distribution:
                </span>
                <ul className="mt-2 text-xs text-emerald-900/80 dark:text-emerald-200 space-y-1">
                  <li>• 4 BHK Signature Bungalow (3,800 sq ft · ₹4.2 Cr)</li>
                  <li>• 5 BHK Royal Villa with Private Lawn (5,200 sq ft · ₹6.5 Cr)</li>
                  <li>• 6 BHK Heritage Mansion with Pool (7,500 sq ft · ₹9.8 Cr)</li>
                  <li>• 8 BHK Presidential Palace (12,000 sq ft · ₹16.5 Cr)</li>
                </ul>
              </div>
            </div>
          )}

          {/* ============ MODE D: STANDARD UNIFORM / MIXED-USE ============ */}
          {generatorMode === "STANDARD" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Tower / Wing Name
                </label>
                <Input
                  value={towerName}
                  onChange={(e) => setTowerName(e.target.value)}
                  placeholder="e.g. Tower C, Retail Podium"
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Start Floor
                  </label>
                  <Input
                    type="number"
                    value={startFloor}
                    onChange={(e) => setStartFloor(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    End Floor
                  </label>
                  <Input
                    type="number"
                    value={endFloor}
                    onChange={(e) => setEndFloor(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Units / Floor
                  </label>
                  <Input
                    type="number"
                    value={unitsPerFloor}
                    onChange={(e) => setUnitsPerFloor(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Category Label
                  </label>
                  <Input
                    value={bhkType}
                    onChange={(e) => setBhkType(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Prefix (Optional)
                  </label>
                  <Input
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="Shop, Office, Flat"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Base Area (sq ft)
                  </label>
                  <Input
                    type="number"
                    value={baseArea}
                    onChange={(e) => setBaseArea(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Base Price (₹)
                  </label>
                  <Input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border dark:border-slate-800 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="shadow">
              {isSubmitting
                ? "Deploying Structure..."
                : generatorMode === "EVARA_TOWNSHIP"
                ? "🚀 Deploy Evara 27-Acre Model"
                : "Generate Structure"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL 3: Add Tower / Wing
// -------------------------------------------------------------
function AddTowerModal({
  projectId,
  onClose,
  onSuccess,
}: {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [floors, setFloors] = useState("5");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_tower",
          projectId,
          name: name.trim(),
          floors: parseInt(floors, 10),
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create tower");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating tower");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Add Tower / Wing</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Tower / Block / Wing Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tower C, Commercial Wing, Retail Plaza"
              className="mt-1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Total Number of Floors
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              value={floors}
              onChange={(e) => setFloors(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-border dark:border-slate-800 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Tower"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODAL 4: Unit Detail & Status Action Modal / Drawer
// -------------------------------------------------------------
function UnitDetailEditModal({
  unit,
  towers,
  onClose,
  onQuickStatusChange,
  onDelete,
  onSuccess,
}: {
  unit: UnitRecord;
  towers: TowerRecord[];
  onClose: () => void;
  onQuickStatusChange: (unitId: string, status: string) => void;
  onDelete: (unitId: string) => void;
  onSuccess: () => void;
}) {
  const [unitNo, setUnitNo] = useState(unit.unitNo);
  const [floor, setFloor] = useState(String(unit.floor ?? 1));
  const [bhk, setBhk] = useState(unit.bhk || "2 BHK");
  const [area, setArea] = useState(String(unit.area || ""));
  const [facing, setFacing] = useState(unit.facing || "East");
  const [price, setPrice] = useState(String(unit.price || ""));
  const [towerId, setTowerId] = useState(unit.towerId || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFullUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: unit.id,
          unitNo,
          floor: parseInt(floor, 10),
          bhk,
          area: parseFloat(area),
          facing,
          price: parseInt(price, 10),
          towerId: towerId || null,
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update unit");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating unit");
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedPrice = unit.price
    ? unit.price >= 10000000
      ? `₹${(unit.price / 10000000).toFixed(2)} Cr`
      : `₹${(unit.price / 100000).toFixed(1)} Lakh`
    : "Price on request";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-3xl border border-border dark:border-slate-800 bg-card dark:bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-foreground">
                Unit {unit.unitNo}
              </h3>
              <Badge variant="outline" className={STATUS_CONFIG[unit.status]?.badge}>
                {STATUS_CONFIG[unit.status]?.label || unit.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {unit.tower?.name || "Tower"} · Floor {unit.floor ?? 1} · {unit.bhk}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Status Bar */}
        <div className="mt-4 rounded-2xl border border-border dark:border-slate-800 bg-muted/30 p-3.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Status Update:
          </label>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {Object.keys(STATUS_CONFIG).map((stKey) => {
              const cfg = STATUS_CONFIG[stKey];
              const isCurrent = unit.status === stKey;
              return (
                <button
                  key={stKey}
                  type="button"
                  onClick={() => onQuickStatusChange(unit.id, stKey)}
                  className={`rounded-xl px-2 py-2 text-xs font-bold text-center transition-all ${
                    isCurrent
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xs " + cfg.badge
                      : "border border-border dark:border-slate-800 bg-card dark:bg-slate-900 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Edit Form */}
        <form onSubmit={handleFullUpdate} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Unit Number
              </label>
              <Input
                value={unitNo}
                onChange={(e) => setUnitNo(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Floor
              </label>
              <Input
                type="number"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Category / Floor Plan
              </label>
              <Input
                value={bhk}
                onChange={(e) => setBhk(e.target.value)}
                placeholder="Retail Shop, 2 BHK, 3 BHK..."
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Tower / Wing
              </label>
              <select
                value={towerId}
                onChange={(e) => setTowerId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-input bg-background dark:bg-slate-800 px-3 py-2 text-sm"
              >
                {towers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                <option value="">Default Tower</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Area (sq ft)
              </label>
              <Input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Facing
              </label>
              <Input
                value={facing}
                onChange={(e) => setFacing(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Price (₹)
              </label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Pricing summary */}
          <div className="flex items-center justify-between rounded-xl border border-border dark:border-slate-800 bg-muted/40 p-3 text-xs">
            <span className="text-muted-foreground">Formatted Current Price:</span>
            <span className="font-extrabold text-blue-600 dark:text-blue-400">
              {formattedPrice}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-border dark:border-slate-800 pt-4">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onDelete(unit.id)}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Unit</span>
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
