"use client";

import { useState } from "react";
import {
  Building2,
  Box,
  Layers,
  Crown,
  Store,
  Briefcase,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  Sparkles,
  Eye,
  Plus,
  Compass,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TownshipCad3DViewer } from "@/components/public/township-cad-3d-viewer";

export type UnitRecord = {
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

type TowerBlock = {
  towerName: string;
  towerId: string | null;
  floors: Record<number, UnitRecord[]>;
};

interface GraphicalElevationViewerProps {
  towerData: TowerBlock[];
  projectName?: string;
  onSelectUnit: (unit: UnitRecord) => void;
  onAddUnit: (floor?: number, towerId?: string | null) => void;
}

const STATUS_PILL: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  AVAILABLE: {
    label: "Available",
    bg: "bg-emerald-500/10 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30 hover:border-emerald-500",
    dot: "bg-emerald-500",
  },
  SOLD: {
    label: "Sold",
    bg: "bg-rose-500/10 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/30 hover:border-rose-500",
    dot: "bg-rose-500",
  },
  HOLD: {
    label: "Hold",
    bg: "bg-amber-500/10 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30 hover:border-amber-500",
    dot: "bg-amber-500",
  },
  BLOCKED: {
    label: "Blocked",
    bg: "bg-slate-500/10 dark:bg-slate-800/60",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-500/30 hover:border-slate-500",
    dot: "bg-slate-500",
  },
  RENTED: {
    label: "Rented",
    bg: "bg-blue-500/10 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/30 hover:border-blue-500",
    dot: "bg-blue-500",
  },
};

export function GraphicalElevationViewer({
  towerData,
  projectName = "Township Development",
  onSelectUnit,
  onAddUnit,
}: GraphicalElevationViewerProps) {
  const [selectedTowerIndex, setSelectedTowerIndex] = useState<number>(0);
  const [showTownshipMaster, setShowTownshipMaster] = useState(true);

  if (!towerData || towerData.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900">
        <Building2 className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
          No Tower or Elevation Data
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Generate units or towers first to view the graphical elevation diagram.
        </p>
      </div>
    );
  }

  const activeTower = towerData[selectedTowerIndex] || towerData[0];
  const floorNumbers = Object.keys(activeTower.floors)
    .map(Number)
    .sort((a, b) => b - a);

  // Compute stats for current active tower
  const allUnitsInActiveTower = Object.values(activeTower.floors).flat();
  const availableCount = allUnitsInActiveTower.filter(
    (u) => u.status === "AVAILABLE"
  ).length;
  const soldCount = allUnitsInActiveTower.filter(
    (u) => u.status === "SOLD"
  ).length;
  const holdCount = allUnitsInActiveTower.filter(
    (u) => u.status === "HOLD"
  ).length;
  const soldPercent =
    allUnitsInActiveTower.length > 0
      ? Math.round((soldCount / allUnitsInActiveTower.length) * 100)
      : 0;

  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden space-y-8">
      {/* 1. Township 3D & AutoCAD Master Plan Viewer Toggle Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/70 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Township Master Plan &amp; 3D Architectural Model</span>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                >
                  60 FPS · Zero Lag
                </Badge>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AutoCAD 2D Blueprint + 3D Isometric View of all 4 Towers &amp; Bungalows
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTownshipMaster(!showTownshipMaster)}
            className="text-xs gap-1.5"
          >
            {showTownshipMaster ? "Collapse 3D Master" : "Expand 3D Master"}
          </Button>
        </div>

        {showTownshipMaster && (
          <div className="p-4 sm:p-6 bg-slate-950/20">
            <TownshipCad3DViewer
              title={`${projectName} Master Plan & 3D Model`}
              projectName={projectName}
              totalAcreage="27 Acres Integrated Development"
              allowDemoFallback={true}
              onSelectBuilding={(b) => {
                // If building code matches a tower, auto-select it
                const matchedIdx = towerData.findIndex(
                  (t) =>
                    t.towerName.toLowerCase().includes(b.code.toLowerCase()) ||
                    (b.code === "VILLAS" &&
                      t.towerName.toLowerCase().includes("bungalow"))
                );
                if (matchedIdx !== -1) {
                  setSelectedTowerIndex(matchedIdx);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* 2. Architectural Building Elevation Cut Diagram */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        {/* Tower Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Elevation Cross-Section
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Building Elevation Cut Graphic
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive floor-by-floor architectural cross-section with Odd/Even sky deck indicators
            </p>
          </div>

          {/* Tower Buttons */}
          <div className="flex flex-wrap gap-2">
            {towerData.map((t, idx) => (
              <button
                key={t.towerName}
                onClick={() => setSelectedTowerIndex(idx)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedTowerIndex === idx
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>{t.towerName}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-mono">
                  {Object.values(t.floors).flat().length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Tower Quick Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Total Units
            </span>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {allUnitsInActiveTower.length} Units
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Available For Sale
            </span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {availableCount} Units
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Sold / Booked
            </span>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {soldCount} Units ({soldPercent}%)
            </p>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Under Hold / Escrow
            </span>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {holdCount} Units
            </p>
          </div>
        </div>

        {/* Architectural Elevation Silhouette (Vertical Cross-Section) */}
        <div className="space-y-3">
          {/* Rooftop / Sky Deck Crown */}
          <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-3 flex items-center justify-between text-xs text-primary font-semibold">
            <span className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <span>Rooftop Observatory Deck &amp; Sky Lounge (Level 24)</span>
            </span>
            <span className="font-mono text-[11px]">+72.00m Elevation</span>
          </div>

          {/* Floor-by-Floor Slices (Descending from Top to Ground) */}
          <div className="space-y-2.5">
            {floorNumbers.map((floorNum) => {
              const floorUnits = activeTower.floors[floorNum] || [];

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

              const floorAvailable = floorUnits.filter(
                (u) => u.status === "AVAILABLE"
              ).length;
              const floorSold = floorUnits.filter(
                (u) => u.status === "SOLD"
              ).length;

              return (
                <div
                  key={floorNum}
                  className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 transition-all hover:border-primary/50 dark:hover:border-primary/50"
                >
                  {/* Floor Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-12 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-800 font-mono text-xs font-bold shadow-xs">
                        {floorNum === 0 ? "G" : `L${floorNum}`}
                      </span>

                      {/* Floor Archetype Pill */}
                      {isVilla ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                          <span>Presidential Bungalow Enclave (4–8 BHK)</span>
                        </span>
                      ) : isShopping ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <Store className="h-3.5 w-3.5" />
                          <span>Ground Floor: High-Street Retail &amp; Showrooms</span>
                        </span>
                      ) : isOffice ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>Commercial Offices</span>
                        </span>
                      ) : isPenthouse ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                          <Crown className="h-3.5 w-3.5" />
                          <span>Penthouse Sky Mansions</span>
                        </span>
                      ) : isOddFloor ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                          <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
                          <span>ODD Level: Cantilevered Sky Balcony Deck</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          <Layers className="h-3.5 w-3.5 text-amber-500" />
                          <span>EVEN Level: Double-Height Party Terrace</span>
                        </span>
                      )}
                    </div>

                    {/* Floor Availability Summary */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                          {floorAvailable}
                        </strong>{" "}
                        Available
                      </span>
                      <span>·</span>
                      <span>
                        <strong className="text-rose-600 dark:text-rose-400 font-mono">
                          {floorSold}
                        </strong>{" "}
                        Sold
                      </span>
                      <button
                        onClick={() => onAddUnit(floorNum, activeTower.towerId)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-primary transition-colors"
                        title="Add unit to this floor"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Graphical Unit Strips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                    {floorUnits.map((u) => {
                      const pill =
                        STATUS_PILL[u.status] || STATUS_PILL.AVAILABLE;

                      return (
                        <div
                          key={u.id}
                          onClick={() => onSelectUnit(u)}
                          className={`cursor-pointer rounded-xl border p-2.5 transition-all shadow-xs group ${pill.bg} ${pill.border}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs font-mono text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                              #{u.unitNo}
                            </span>
                            <span
                              className={`h-2 w-2 rounded-full ${pill.dot}`}
                              title={u.status}
                            />
                          </div>

                          <div className="mt-1 flex items-baseline justify-between text-[11px]">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                              {u.bhk || "Unit"}
                            </span>
                            {u.area && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                {u.area} sqft
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-1 text-[10px]">
                            <span className={`font-semibold ${pill.text}`}>
                              {pill.label}
                            </span>
                            {u.price && (
                              <span className="font-mono font-medium text-slate-600 dark:text-slate-300">
                                ₹{(u.price / 10000000).toFixed(2)} Cr
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Podium / Ground Level Foundation */}
          <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 p-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-semibold">
            <span className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Ground Podium Level &amp; Double-Height Grand Entrance Lobby</span>
            </span>
            <span className="font-mono text-[11px]">±0.00m Ground Datum</span>
          </div>
        </div>
      </div>
    </div>
  );
}
