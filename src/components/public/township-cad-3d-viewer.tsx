"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Layers,
  Box,
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Sun,
  Moon,
  Move,
  Info,
  CheckCircle2,
  Building2,
  Home,
  Sparkles,
  MapPin,
  Eye,
  Sliders,
  ShieldCheck,
  Download,
  X,
  ChevronRight,
  Maximize,
  FileCode,
  Crosshair,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CadDxfCanvas,
  type CadModelInfo,
  type CadTheme,
} from "@/components/public/cad-dxf-canvas";
import {
  Model3DFileCanvas,
  modelFormatFromFileName,
} from "@/components/public/model-3d-canvas";

export type TownshipBuilding = {
  id: string;
  name: string;
  code: string;
  type: "TOWER" | "BUNGALOW" | "CLUBHOUSE" | "PARK" | "HELIPAD" | "COMMERCIAL";
  floors: string;
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  priceRange: string;
  carpetArea: string;
  description: string;
  features: string[];
  // 2D CAD & 3D base coordinates (centered at 500, 325)
  x: number;
  y: number;
  width: number;
  depth: number;
  height3d: number; // Volumetric extruded height in pixels
  cadLabel: string;
  color: string;
  accentColor: string;
  nightColor?: string;
};

// Non-overlapping, architecturally aligned coordinate layout
const DEFAULT_BUILDINGS: TownshipBuilding[] = [
  {
    id: "tower-1",
    name: "Tower 1 (T1) - The Pinnacle",
    code: "T1",
    type: "TOWER",
    floors: "G + 23 Floors",
    totalUnits: 92,
    availableUnits: 34,
    soldUnits: 58,
    priceRange: "₹1.95 Cr - ₹4.50 Cr",
    carpetArea: "1,650 - 3,450 sq ft",
    description:
      "Iconic high-rise tower featuring alternating Odd-Even cantilevered sky balconies and panoramic skyline views.",
    features: [
      "Odd Floors: Double-height cantilevered sky deck",
      "Even Floors: Extended living room party terrace",
      "G+23 floors with 4 high-speed Otis elevators",
      "Earthquake resistant RCC shear wall structure",
    ],
    x: 100,
    y: 80,
    width: 145,
    depth: 105,
    height3d: 210, // 23 floors elevation
    cadLabel: "TOWER 1 (T1): SKY RESIDENCES",
    color: "#2563eb",
    accentColor: "#60a5fa",
    nightColor: "#1d4ed8",
  },
  {
    id: "tower-2",
    name: "Tower 2 (T2) - The Horizon",
    code: "T2",
    type: "TOWER",
    floors: "G + 23 Floors",
    totalUnits: 92,
    availableUnits: 28,
    soldUnits: 64,
    priceRange: "₹1.95 Cr - ₹4.50 Cr",
    carpetArea: "1,650 - 3,450 sq ft",
    description:
      "Twin residential tower oriented towards north-east for optimal Vastu light and uninterrupted garden views.",
    features: [
      "Vastu-compliant east-facing grand foyers",
      "Odd/Even alternating architectural facade",
      "Italian marble flooring in living & dining",
      "Dedicated EV charging points per parking slot",
    ],
    x: 280,
    y: 80,
    width: 145,
    depth: 105,
    height3d: 210,
    cadLabel: "TOWER 2 (T2): HORIZON TOWER",
    color: "#0284c7",
    accentColor: "#38bdf8",
    nightColor: "#0369a1",
  },
  {
    id: "tower-3",
    name: "Tower 3 (T3) - The Meridian",
    code: "T3",
    type: "TOWER",
    floors: "G + 23 Floors",
    totalUnits: 92,
    availableUnits: 41,
    soldUnits: 51,
    priceRange: "₹2.10 Cr - ₹4.85 Cr",
    carpetArea: "1,850 - 3,600 sq ft",
    description:
      "Luxury signature tower overlooking the Olympic swimming pool and landscaped central boulevard.",
    features: [
      "Double-height sky party deck on every alternating floor",
      "Smart biometric entry locks and video door phones",
      "Private lift lobby for top 4 penthouse levels",
      "Thermal-break acoustic double glazed windows",
    ],
    x: 100,
    y: 310,
    width: 145,
    depth: 105,
    height3d: 210,
    cadLabel: "TOWER 3 (T3): THE MERIDIAN",
    color: "#4f46e5",
    accentColor: "#818cf8",
    nightColor: "#3730a3",
  },
  {
    id: "tower-4",
    name: "Tower 4 (T4) - The Celestia",
    code: "T4",
    type: "TOWER",
    floors: "G + 23 Floors",
    totalUnits: 92,
    availableUnits: 38,
    soldUnits: 54,
    priceRange: "₹2.10 Cr - ₹4.85 Cr",
    carpetArea: "1,850 - 3,600 sq ft",
    description:
      "High-rise tower adjacent to the high-street retail arcade and private helipad landing pad.",
    features: [
      "Direct sheltered walkway to high-street shopping",
      "Rooftop infinity observatory lounge on 24th terrace",
      "G+23 floors with separate goods/service lift",
      "100% DG power backup for all common and residential points",
    ],
    x: 280,
    y: 310,
    width: 145,
    depth: 105,
    height3d: 210,
    cadLabel: "TOWER 4 (T4): CELESTIA TOWER",
    color: "#7c3aed",
    accentColor: "#a78bfa",
    nightColor: "#5b21b6",
  },
  {
    id: "bungalows",
    name: "Presidential Bungalow Enclave (4-8 BHK)",
    code: "VILLAS",
    type: "BUNGALOW",
    floors: "G + 2 Storey Villas",
    totalUnits: 16,
    availableUnits: 7,
    soldUnits: 9,
    priceRange: "₹6.80 Cr - ₹16.50 Cr",
    carpetArea: "4,200 - 12,000 sq ft",
    description:
      "Gated ultra-luxury villa sanctuary with private infinity pools, passenger hydraulic elevators, and landscaped private lawns.",
    features: [
      "Individual plot boundaries: 400 to 1,200 sq yards",
      "Private swimming pool & sunken garden seating",
      "Internal private elevator by Schindler",
      "Separate servant & chauffeur quarters with private entry",
      "Rooftop barbecue deck and solar heating setup",
    ],
    x: 470,
    y: 80,
    width: 440,
    depth: 210,
    height3d: 55, // 2-3 story villa elevation
    cadLabel: "PRESIDENTIAL BUNGALOW ENCLAVE (16 VILLAS)",
    color: "#d97706",
    accentColor: "#fbbf24",
    nightColor: "#b45309",
  },
  {
    id: "clubhouse",
    name: "Clubhouse 'The Grand Solitaire'",
    code: "CLUB",
    type: "CLUBHOUSE",
    floors: "G + 3 Levels",
    totalUnits: 1,
    availableUnits: 1,
    soldUnits: 0,
    priceRange: "Exclusive to Residents",
    carpetArea: "50,000 sq ft built-up",
    description:
      "5-star lifestyle clubhouse with all-weather Olympic swimming pool, indoor badminton courts, bowling alley, and banquet halls.",
    features: [
      "Olympic size temperature-controlled lap pool",
      "4-lane bowling alley and virtual golf simulator",
      "Fine dining multi-cuisine restaurant & cafe",
      "Spa, steam, sauna and Jacuzzi wellness suites",
      "300-seat multipurpose ballroom and banquet lawn",
    ],
    x: 470,
    y: 330,
    width: 190,
    depth: 120,
    height3d: 75,
    cadLabel: "CLUBHOUSE 'GRAND SOLITAIRE' (50,000 SQ FT)",
    color: "#059669",
    accentColor: "#34d399",
    nightColor: "#047857",
  },
  {
    id: "helipad",
    name: "Private Certified Rooftop Helipad",
    code: "HELI",
    type: "HELIPAD",
    floors: "Elevated Deck",
    totalUnits: 1,
    availableUnits: 1,
    soldUnits: 0,
    priceRange: "Civil Aviation DGCA Approved",
    carpetArea: "Diameter: 32 Meters",
    description:
      "Dedicated VIP air-mobility helipad designed to accommodate twin-engine executive helicopters with emergency night lighting.",
    features: [
      "DGCA certified high-load landing platform",
      "Dedicated VIP passenger transit lounge",
      "Aviation perimeter beacon and night-vision guidance",
      "Direct express elevator link to clubhouse concourse",
    ],
    x: 470,
    y: 475,
    width: 125,
    depth: 110,
    height3d: 40,
    cadLabel: "VIP HELIPORT · DGCA CERTIFIED",
    color: "#dc2626",
    accentColor: "#f87171",
    nightColor: "#b91c1c",
  },
  {
    id: "central-park",
    name: "Central Eco Park & Amphitheatre",
    code: "PARK",
    type: "PARK",
    floors: "Ground Landscape",
    totalUnits: 1,
    availableUnits: 1,
    soldUnits: 0,
    priceRange: "Community Green Zone",
    carpetArea: "5.5 Acres of Open Greens",
    description:
      "Lush landscaped central park featuring water fountains, 1.5 km jogging track, Zen meditation gardens, and open-air amphitheatre.",
    features: [
      "1.5 km reflexology pathway and cycling track",
      "Open-air Greek amphitheatre for community gatherings",
      "Aroma garden with over 2,000 native tree species",
      "Children's adventure playground with rubberized flooring",
    ],
    x: 690,
    y: 330,
    width: 220,
    depth: 255,
    height3d: 15,
    cadLabel: "CENTRAL ECO PARK · 5.5 ACRES",
    color: "#16a34a",
    accentColor: "#4ade80",
    nightColor: "#15803d",
  },
];

export type TownshipCadFile = {
  id?: string;
  fileName?: string;
  url?: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
};

/* ------------------------------------------------------------------ */
/* Upload classification: 2D CAD drawings vs real 3D model files        */
/* ------------------------------------------------------------------ */

const CAD_2D_EXT_RE = /\.(dwg|dxf)$/i;
const MODEL_3D_EXT_RE = /\.(glb|gltf|obj|stl)$/i;

function classifyCadFiles(cadFiles: TownshipCadFile[] | undefined, kind: "2d" | "3d"): TownshipCadFile[] {
  if (!Array.isArray(cadFiles)) return [];
  return cadFiles.filter((f) => {
    if (!f?.url) return false;
    // Ignore the admin "Load Sample CAD Demo" placeholder entries - those
    // files were never stored on disk and would only produce error tabs.
    if (/^\/uploads\/evara-/i.test(f.url)) return false;
    const name = f.fileName || "";
    const type = (f.type || "").toUpperCase();
    if (kind === "2d") {
      return CAD_2D_EXT_RE.test(name) || type.startsWith("AUTOCAD");
    }
    return (
      MODEL_3D_EXT_RE.test(name) || type.startsWith("MODEL_3D")
    );
  });
}

const CAD_BADGES: Record<string, string> = {
  dwg: "AutoCAD DWG",
  dxf: "AutoCAD DXF",
  glb: "glTF Binary · 3D",
  gltf: "glTF · 3D Model",
  obj: "Wavefront OBJ · 3D",
  stl: "STL · 3D Mesh",
};

function cadFormatBadge(fileName: string): string {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  return CAD_BADGES[ext] || "CAD / 3D File";
}

interface TownshipCad3DViewerProps {
  title?: string;
  projectName?: string;
  totalAcreage?: string;
  buildings?: TownshipBuilding[];
  onSelectBuilding?: (building: TownshipBuilding) => void;
  selectedBuildingId?: string;
  showAdminControls?: boolean;
  cadFiles?: TownshipCadFile[];
  allowDemoFallback?: boolean;
}

/**
 * Rounds a floating-point coordinate to 2 decimal places to ensure 100% deterministic
 * numerical serialization between Node.js SSR and Browser client hydration.
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function TownshipCad3DViewer({
  title = "Interactive Township 3D Model & AutoCAD Blueprint",
  projectName = "Evara 27-Acre Luxury Township",
  totalAcreage = "27 Acres (Master Development)",
  buildings = DEFAULT_BUILDINGS,
  onSelectBuilding,
  selectedBuildingId,
  showAdminControls = false,
  cadFiles = [],
  allowDemoFallback = false,
}: TownshipCad3DViewerProps) {
  const cad2dFiles = useMemo(() => classifyCadFiles(cadFiles, "2d"), [cadFiles]);
  const model3dFiles = useMemo(() => classifyCadFiles(cadFiles, "3d"), [cadFiles]);
  const hasModel3d = model3dFiles.length > 0;
  const has2dFiles = cad2dFiles.length > 0;
  const hasAnyUploaded = hasModel3d || has2dFiles;

  const preferredMode: "3D" | "MODEL" | "CAD" = hasModel3d
    ? "MODEL"
    : has2dFiles
      ? "CAD"
      : allowDemoFallback
        ? "3D"
        : "CAD";

  const [viewMode, setViewMode] = useState<"3D" | "MODEL" | "CAD">(preferredMode);

  // Strictly enforce that if no 3D model file is uploaded, we NEVER stay in 3D or MODEL mode when CAD files exist!
  useEffect(() => {
    if (hasModel3d) {
      if (viewMode === "3D") setViewMode("MODEL");
    } else {
      if (has2dFiles) {
        if (viewMode !== "CAD") setViewMode("CAD");
      } else if (!allowDemoFallback) {
        if (viewMode === "3D" || viewMode === "MODEL") setViewMode("CAD");
      }
    }
  }, [hasModel3d, has2dFiles, allowDemoFallback, viewMode]);

  const [activeCadId, setActiveCadId] = useState<string>(
    has2dFiles ? cad2dFiles[0]?.id || cad2dFiles[0]?.fileName || "cad-0" : ""
  );
  const [activeModelId, setActiveModelId] = useState<string>(
    hasModel3d ? model3dFiles[0]?.id || model3dFiles[0]?.fileName || "model-0" : ""
  );

  const active2dFile = useMemo(() => {
    if (!has2dFiles) return null;
    return cad2dFiles.find((f) => (f.id || f.fileName) === activeCadId) || cad2dFiles[0];
  }, [cad2dFiles, activeCadId, has2dFiles]);

  const activeModelFile = useMemo(() => {
    if (!hasModel3d) return null;
    return model3dFiles.find((f) => (f.id || f.fileName) === activeModelId) || model3dFiles[0];
  }, [model3dFiles, activeModelId, hasModel3d]);

  // Real CAD canvas state
  const [showCadGrid, setShowCadGrid] = useState(true);
  const [cadColorTheme, setCadColorTheme] = useState<CadTheme>("dark");
  const cycleCadTheme = () =>
    setCadColorTheme((t) =>
      t === "dark" ? "blueprint" : t === "blueprint" ? "white" : "dark"
    );
  const [cadFitKey, setCadFitKey] = useState(0);
  const [modelResetKey, setModelResetKey] = useState(0);
  const [cadLayerVisibility, setCadLayerVisibility] = useState<Record<string, boolean>>({});
  const [cadModelInfo, setCadModelInfo] = useState<CadModelInfo | null>(null);
  const [activeBuildingId, setActiveBuildingId] = useState<string>(
    selectedBuildingId || "tower-1"
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // 3D Orbit Camera Angles
  const [rotationAngle, setRotationAngle] = useState<number>(-35); // -180 to 180 degrees
  const [tiltAngle, setTiltAngle] = useState<number>(55); // 20 to 80 degrees
  const [isNightMode, setIsNightMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [canvasHeightMode, setCanvasHeightMode] = useState<"standard" | "large">(
    "standard"
  );
  const [showUnitsModal, setShowUnitsModal] = useState<boolean>(false);

  // Mouse & Touch Drag Orbit Interaction
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; rot: number; tilt: number }>({
    x: 0,
    y: 0,
    rot: -35,
    tilt: 55,
  });
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  // AutoCAD Layer Visibility Toggles
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showGreenery, setShowGreenery] = useState(true);

  // Sync selectedBuildingId from parent if controlled
  useEffect(() => {
    if (selectedBuildingId) {
      setActiveBuildingId(selectedBuildingId);
    }
  }, [selectedBuildingId]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const selectedBuilding =
    buildings.find((b) => b.id === (selectedBuildingId || activeBuildingId)) ||
    buildings[0];

  const handleBuildingClick = (b: TownshipBuilding) => {
    setActiveBuildingId(b.id);
    if (onSelectBuilding) {
      onSelectBuilding(b);
    }
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setRotationAngle(-35);
    setTiltAngle(55);
    if (viewMode === "CAD") setCadFitKey((k) => k + 1);
    if (viewMode === "MODEL") setModelResetKey((k) => k + 1);
  };

  // Wheel zoom (3D demo + CAD modes; MODEL has OrbitControls of its own).
  // Native non-passive listener so preventDefault works over the canvas.
  const CAD_ZOOM_MIN = 0.4;
  const CAD_ZOOM_MAX = 24;
  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (viewMode === "MODEL") return;
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      setZoomLevel((z) => Math.min(CAD_ZOOM_MAX, Math.max(CAD_ZOOM_MIN, z * factor)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [viewMode]);

  // Drag Orbit Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== "3D") return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rot: rotationAngle,
      tilt: tiltAngle,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || viewMode !== "3D") return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const newRot = (dragStartRef.current.rot + deltaX * 0.45) % 360;
    const newTilt = Math.min(
      80,
      Math.max(20, dragStartRef.current.tilt - deltaY * 0.35)
    );

    setRotationAngle(newRot);
    setTiltAngle(newTilt);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode !== "3D" || e.touches.length !== 1) return;
    const t = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      x: t.clientX,
      y: t.clientY,
      rot: rotationAngle,
      tilt: tiltAngle,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || viewMode !== "3D" || e.touches.length !== 1) return;
    const t = e.touches[0];
    const deltaX = t.clientX - dragStartRef.current.x;
    const deltaY = t.clientY - dragStartRef.current.y;

    const newRot = (dragStartRef.current.rot + deltaX * 0.45) % 360;
    const newTilt = Math.min(
      80,
      Math.max(20, dragStartRef.current.tilt - deltaY * 0.35)
    );

    setRotationAngle(newRot);
    setTiltAngle(newTilt);
  };

  /* ======================================================================= */
  /* TRUE 3D PROJECTION ENGINE MATH                                          */
  /* ======================================================================= */
  const cx = 500;
  const cy = 325;
  const rad = (rotationAngle * Math.PI) / 180;
  const tiltRad = (tiltAngle * Math.PI) / 180;
  const cosRad = Math.cos(rad);
  const sinRad = Math.sin(rad);
  const sinTilt = Math.sin(tiltRad);
  const cosTilt = Math.cos(tiltRad);

  // 3D Point to 2D Screen projection formula
  const project3D = useCallback(
    (x: number, y: number, z: number) => {
      const dx = x - cx;
      const dy = y - cy;
      const rx = dx * cosRad - dy * sinRad;
      const ry = dx * sinRad + dy * cosRad;

      const screenX = round2(cx + rx);
      const screenY = round2(cy + ry * sinTilt - z * cosTilt);
      const depth = round2(ry * cosTilt + z * sinTilt);

      return { x: screenX, y: screenY, depth };
    },
    [cosRad, sinRad, sinTilt, cosTilt]
  );

  // Calculate 3D projected elements with depth sorting
  const projectedBuildings = useMemo(() => {
    return buildings
      .map((b) => {
        const x1 = b.x;
        const y1 = b.y;
        const x2 = b.x + b.width;
        const y2 = b.y + b.depth;
        const h = b.height3d;

        // Ground 4 vertices (z = 0)
        const g0 = project3D(x1, y1, 0); // Back-Left
        const g1 = project3D(x2, y1, 0); // Back-Right
        const g2 = project3D(x2, y2, 0); // Front-Right
        const g3 = project3D(x1, y2, 0); // Front-Left

        // Roof 4 vertices (z = h)
        const r0 = project3D(x1, y1, h); // Back-Left Roof
        const r1 = project3D(x2, y1, h); // Back-Right Roof
        const r2 = project3D(x2, y2, h); // Front-Right Roof
        const r3 = project3D(x1, y2, h); // Front-Left Roof

        // Center depth for painter's sorting algorithm
        const centerDepth = round2((g0.depth + g1.depth + g2.depth + g3.depth) / 4);

        // Ground shadow polygon (offset along light vector)
        const shadowOffset = 25;
        const s0 = { x: round2(g0.x + shadowOffset), y: round2(g0.y + shadowOffset * 0.4) };
        const s1 = { x: round2(g1.x + shadowOffset), y: round2(g1.y + shadowOffset * 0.4) };
        const s2 = { x: round2(g2.x + shadowOffset), y: round2(g2.y + shadowOffset * 0.4) };
        const s3 = { x: round2(g3.x + shadowOffset), y: round2(g3.y + shadowOffset * 0.4) };

        // Precalculated centroid midpoints for badges and rooftop amenities
        const midX = round2((r0.x + r2.x) / 2);
        const midY = round2((r0.y + r2.y) / 2);

        return {
          building: b,
          centerDepth,
          g: [g0, g1, g2, g3],
          r: [r0, r1, r2, r3],
          shadow: [s0, s1, s2, s3],
          midX,
          midY,
          h,
        };
      })
      .sort((a, b) => a.centerDepth - b.centerDepth); // Depth sort
  }, [buildings, project3D]);

  // Projected 3D Ground Turf Foundation & Roads
  const groundBoundary = useMemo(() => {
    const p0 = project3D(40, 30, 0);
    const p1 = project3D(960, 30, 0);
    const p2 = project3D(960, 620, 0);
    const p3 = project3D(40, 620, 0);
    return `${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
  }, [project3D]);

  // Projected Main Spine Boulevard
  const spineRoad = useMemo(() => {
    const r0 = project3D(40, 245, 0);
    const r1 = project3D(960, 245, 0);
    const r2 = project3D(960, 290, 0);
    const r3 = project3D(40, 290, 0);
    return `${r0.x},${r0.y} ${r1.x},${r1.y} ${r2.x},${r2.y} ${r3.x},${r3.y}`;
  }, [project3D]);

  // Render the core viewer content (shared between inline and fullscreen)
  const renderViewerBody = (isModal = false) => {
    return (
      <div className="flex flex-col h-full w-full">
        {/* Top Header & View Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-4 py-3 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              {viewMode === "3D" ? <Box className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-[10px] font-mono tracking-tight bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                >
                  {viewMode === "CAD" ? "AutoCAD 2D Blueprint Engine" : "60 FPS · 3D Model"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {projectName} · {totalAcreage}
              </p>
            </div>
          </div>

          {/* Action Tools & Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher Pills */}
            <div className="inline-flex rounded-xl bg-slate-200/80 dark:bg-slate-800 p-1 text-xs font-semibold">
              {hasModel3d ? (
                <button
                  type="button"
                  onClick={() => setViewMode("MODEL")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === "MODEL"
                      ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Box className="h-3.5 w-3.5" />
                  <span>
                    3D Architectural View
                    {activeModelFile?.fileName
                      ? ` (.${(activeModelFile.fileName.split(".").pop() || "model").toLowerCase()})`
                      : ""}
                  </span>
                </button>
              ) : !has2dFiles && allowDemoFallback ? (
                <button
                  type="button"
                  onClick={() => setViewMode("3D")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === "3D"
                      ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Box className="h-3.5 w-3.5" />
                  <span>3D Architectural View</span>
                </button>
              ) : null}
              {has2dFiles && (
                <button
                  type="button"
                  onClick={() => setViewMode("CAD")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    viewMode === "CAD"
                      ? "bg-white dark:bg-primary text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>
                    {active2dFile
                      ? `AutoCAD (${active2dFile.fileName})`
                      : "AutoCAD 2D Blueprint (DWG)"}
                  </span>
                </button>
              )}
            </div>

            {/* Uploaded File Switcher Chips (files of the active mode) */}
            {viewMode !== "3D" &&
              (viewMode === "MODEL" ? model3dFiles : cad2dFiles).length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5">
                  {(viewMode === "MODEL" ? model3dFiles : cad2dFiles).map((f, i) => {
                    const fid = f.id || f.fileName || `f-${i}`;
                    const isActive =
                      fid === (viewMode === "MODEL" ? activeModelId : activeCadId);
                    return (
                      <button
                        key={`${fid}-${i}`}
                        type="button"
                        onClick={() =>
                          viewMode === "MODEL"
                            ? setActiveModelId(fid)
                            : setActiveCadId(fid)
                        }
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono border whitespace-nowrap transition-all ${
                          isActive
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                        title={`Show ${f.fileName}`}
                      >
                        <FileCode className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[140px] sm:max-w-[220px]">
                          {f.fileName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

            {/* Day / Night Lighting Switch (Only in 3D) */}
            {viewMode === "3D" && (
              <button
                type="button"
                onClick={() => setIsNightMode(!isNightMode)}
                className={`p-2 rounded-xl border transition-all ${
                  isNightMode
                    ? "bg-slate-800 border-amber-500/40 text-amber-300 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                }`}
                title={isNightMode ? "Switch to Day Sunlight" : "Switch to Night Skyline"}
              >
                {isNightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            )}

            {/* Inline Size Switcher (Only when not modal) */}
            {!isModal && (
              <button
                type="button"
                onClick={() =>
                  setCanvasHeightMode((h) =>
                    h === "standard" ? "large" : "standard"
                  )
                }
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Canvas Height"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>{canvasHeightMode === "standard" ? "Large Size" : "Standard Size"}</span>
              </button>
            )}

            {/* Fullscreen Expand / Close Button */}
            <Button
              variant={isModal ? "default" : "outline"}
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-xs font-semibold gap-1.5"
            >
              {isModal ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Exit Full Size</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Full Size View</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Interactive View Canvas & Inspection Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-0">
          {/* Visual Canvas Area (8 cols on lg or 9 cols in fullscreen) */}
          <div
            ref={canvasWrapRef}
            className={`relative ${
              isModal
                ? "lg:col-span-9"
                : viewMode === "3D"
                  ? "lg:col-span-8"
                  : "lg:col-span-9"
            } bg-[#060a14] overflow-hidden select-none flex items-center justify-center p-2 sm:p-4 ${
              isModal
                ? "h-full min-h-[500px]"
                : canvasHeightMode === "large"
                ? "min-h-[760px]"
                : "min-h-[520px]"
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* Canvas Floating Utility Controls */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
              {/* Zoom & Reset Controls */}
              <div className="flex items-center rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/60 p-1 shadow-lg text-slate-200">
                {viewMode !== "MODEL" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(z * 1.5, 24))}
                      className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(z / 1.5, 0.4))}
                      className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-px bg-slate-700 mx-1" />
                  </>
                )}
                {viewMode !== "MODEL" && (
                  <>
                    <button
                      type="button"
                      onClick={cycleCadTheme}
                      className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors text-[11px] font-mono ${
                        cadColorTheme === "white"
                          ? "text-slate-900 bg-white hover:bg-slate-100"
                          : cadColorTheme === "blueprint"
                            ? "text-blue-200 bg-blue-600/30 hover:bg-blue-600/40"
                            : "text-amber-200 hover:bg-slate-800"
                      }`}
                      title="Change preview background: Dark Night / Blueprint / White Paper"
                    >
                      {cadColorTheme === "dark" ? (
                        <Moon className="h-3.5 w-3.5" />
                      ) : cadColorTheme === "blueprint" ? (
                        <FileCode className="h-3.5 w-3.5" />
                      ) : (
                        <Sun className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {cadColorTheme === "dark"
                          ? "Dark"
                          : cadColorTheme === "blueprint"
                            ? "Blueprint"
                            : "White"}
                      </span>
                    </button>
                    <div className="h-4 w-px bg-slate-700 mx-1" />
                  </>
                )}
                <button
                  type="button"
                  onClick={handleResetView}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white"
                  title={viewMode === "MODEL" ? "Reset Camera" : "Reset View"}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* 3D Orbit Preset Buttons (Only in 3D Mode) */}
              {viewMode === "3D" && (
                <div className="hidden sm:flex items-center rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/60 p-1 shadow-lg text-xs font-mono text-slate-300">
                  <button
                    type="button"
                    onClick={() => {
                      setRotationAngle(-35);
                      setTiltAngle(55);
                    }}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      rotationAngle === -35 && tiltAngle === 55
                        ? "bg-blue-600 text-white font-bold"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    Isometric 45°
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRotationAngle(0);
                      setTiltAngle(25);
                    }}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      rotationAngle === 0 && tiltAngle === 25
                        ? "bg-blue-600 text-white font-bold"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    Front View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRotationAngle(90);
                      setTiltAngle(55);
                    }}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      rotationAngle === 90
                        ? "bg-blue-600 text-white font-bold"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    Side View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRotationAngle(0);
                      setTiltAngle(80);
                    }}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      tiltAngle >= 80
                        ? "bg-blue-600 text-white font-bold"
                        : "hover:bg-slate-800"
                    }`}
                  >
                    Top Plan
                  </button>
                </div>
              )}

              {/* Quick Orbit Rotation Steppers */}
              {viewMode === "3D" && (
                <div className="flex items-center rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/60 p-1 shadow-lg text-slate-300">
                  <button
                    type="button"
                    onClick={() => setRotationAngle((r) => (r - 25) % 360)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
                    title="Rotate Left"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotationAngle((r) => (r + 25) % 360)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
                    title="Rotate Right"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Compass & Interactive Hint */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/60 px-3 py-1.5 shadow-lg text-xs font-mono text-emerald-400">
                <Compass
                  className="h-4 w-4 transition-transform duration-300"
                  style={{
                    transform: `rotate(${rotationAngle}deg)`,
                  }}
                />
                <span className="font-bold text-white">NORTH</span>
              </div>
              {viewMode === "3D" && (
                <div className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/80 backdrop-blur border border-slate-700/60 px-2.5 py-1.5 text-[11px] text-slate-400">
                  <Move className="h-3 w-3 text-cyan-400" />
                  <span>Click &amp; Drag to Orbit 3D</span>
                </div>
              )}
            </div>

            {/* CAD Layers Bar (shown in CAD mode) */}
            {viewMode === "CAD" && (
              <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-900/90 backdrop-blur border border-slate-700/60 p-1.5 shadow-lg text-xs">
                {active2dFile ? (
                  <>
                    <span className="text-[11px] font-semibold text-slate-400 px-2">
                      {active2dFile.fileName?.split(".").pop()?.toUpperCase() || "CAD"} Layers:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCadGrid(!showCadGrid)}
                      className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                        showCadGrid
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Grid (F7)
                    </button>
                    {(cadModelInfo?.layers ?? []).slice(0, 8).map((layer) => (
                      <button
                        key={layer.name}
                        type="button"
                        onClick={() =>
                          setCadLayerVisibility((prev) => ({
                            ...prev,
                            [layer.name]: prev[layer.name] === false ? true : false,
                          }))
                        }
                        className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors max-w-[180px] truncate ${
                          cadLayerVisibility[layer.name] === false
                            ? "text-slate-500 hover:text-slate-300"
                            : "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                        }`}
                        title={`Layer ${layer.name} — toggle visibility`}
                      >
                        {layer.name} ({layer.count})
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-semibold text-slate-400 px-2">Blueprint Layers:</span>
                    <button
                      type="button"
                      onClick={() => setShowGrid(!showGrid)}
                      className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                        showGrid
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDimensions(!showDimensions)}
                      className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                        showDimensions
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Dimensions
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRoads(!showRoads)}
                      className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                        showRoads
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      18m Avenue
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGreenery(!showGreenery)}
                      className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                        showGreenery
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Green Forest
                    </button>
                    <button
                      type="button"
                      onClick={cycleCadTheme}
                      className="px-2 py-1 rounded-md text-[11px] font-mono text-slate-300 hover:bg-slate-800 transition-colors border border-slate-700"
                      title="Cycle CAD Theme: Dark Night -> Blueprint -> White Paper"
                    >
                      {cadColorTheme === "dark"
                        ? "Theme: Dark Night"
                        : cadColorTheme === "blueprint"
                          ? "Theme: Blueprint"
                          : "Theme: White Paper"}
                    </button>
                  </>
                )}
                {active2dFile && (
                  <>
                    <button
                      type="button"
                      onClick={cycleCadTheme}
                      className="px-2 py-1 rounded-md text-[11px] font-mono text-slate-300 hover:bg-slate-800 transition-colors border border-slate-700"
                      title="Cycle CAD Theme: Dark Night -> Blueprint -> White Paper"
                    >
                      {cadColorTheme === "dark"
                        ? "Theme: Dark Night"
                        : cadColorTheme === "blueprint"
                          ? "Theme: Blueprint"
                          : "Theme: White Paper"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCadFitKey((k) => k + 1)}
                      className="px-2 py-1 rounded-md text-[11px] font-mono text-slate-300 hover:bg-slate-800 transition-colors border border-slate-700"
                      title="Fit drawing to view"
                    >
                      Fit View
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* 3D ARCHITECTURAL VECTOR CANVAS (True Volumetric Prisms)        */}
            {/* ============================================================= */}
            {viewMode === "3D" ? (
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out cursor-grab active:cursor-grabbing"
                style={{
                  transform: `scale(${zoomLevel})`,
                }}
                suppressHydrationWarning
              >
                <svg
                  viewBox="0 0 1000 650"
                  className="w-full h-full max-h-[850px] drop-shadow-2xl overflow-visible"
                  suppressHydrationWarning
                >
                  <defs>
                    {/* Architectural Glass Reflections */}
                    <linearGradient id="glass-reflection" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                      <stop offset="40%" stopColor="#0284c7" stopOpacity="0.75" />
                      <stop offset="70%" stopColor="#1e3a8a" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
                    </linearGradient>

                    {/* Illuminated Night Glass Gradient */}
                    <linearGradient id="night-glass" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                      <stop offset="35%" stopColor="#1d4ed8" stopOpacity="0.8" />
                      <stop offset="65%" stopColor="#0f172a" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
                    </linearGradient>

                    {/* Side Shadow Facade Gradient */}
                    <linearGradient id="side-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0f172a" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
                    </linearGradient>

                    {/* Villa Terracotta Roof Gradient */}
                    <linearGradient id="villa-roof" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#b45309" stopOpacity="0.95" />
                    </linearGradient>

                    {/* Olympic Pool Water Gradient */}
                    <linearGradient id="pool-water" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
                    </linearGradient>

                    {/* Ground Turf 3D Gradient */}
                    <radialGradient id="turf-lighting" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={isNightMode ? "#064e3b" : "#047857"} stopOpacity="0.6" />
                      <stop offset="70%" stopColor={isNightMode ? "#022c22" : "#064e3b"} stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
                    </radialGradient>
                  </defs>

                  {/* 1. 3D Ground Turf Slab */}
                  <polygon
                    points={groundBoundary}
                    fill="url(#turf-lighting)"
                    stroke={isNightMode ? "#1e293b" : "#334155"}
                    strokeWidth="2"
                    className="transition-colors duration-500"
                  />

                  {/* 2. 3D Main Spine Boulevard (18m Avenue) */}
                  <polygon
                    points={spineRoad}
                    fill={isNightMode ? "#090d16" : "#1e293b"}
                    stroke="#f59e0b"
                    strokeWidth="1.2"
                    strokeDasharray="8 6"
                  />

                  {/* 3. Render Depth-Sorted 3D Buildings */}
                  {projectedBuildings.map(({ building: b, g, r, shadow, midX, midY, h }) => {
                    const isSelected = selectedBuilding.id === b.id;
                    const isTower = b.type === "TOWER";
                    const isBungalow = b.type === "BUNGALOW";
                    const isClubhouse = b.type === "CLUBHOUSE";
                    const isHelipad = b.type === "HELIPAD";
                    const isPark = b.type === "PARK";

                    // Building Base points: g[0] Back-L, g[1] Back-R, g[2] Front-R, g[3] Front-L
                    // Building Roof points: r[0] Back-L, r[1] Back-R, r[2] Front-R, r[3] Front-L

                    return (
                      <g
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuildingClick(b);
                        }}
                        className="cursor-pointer group transition-all"
                      >
                        {/* A. 3D Drop Shadow on Ground */}
                        <polygon
                          points={`${shadow[0].x},${shadow[0].y} ${shadow[1].x},${shadow[1].y} ${shadow[2].x},${shadow[2].y} ${shadow[3].x},${shadow[3].y}`}
                          fill="#000000"
                          fillOpacity={isNightMode ? "0.6" : "0.45"}
                          filter="blur(4px)"
                        />

                        {/* B. South/Front Facade (r3 - r2 - g2 - g3) */}
                        <polygon
                          points={`${r[3].x},${r[3].y} ${r[2].x},${r[2].y} ${g[2].x},${g[2].y} ${g[3].x},${g[3].y}`}
                          fill={
                            isSelected
                              ? "#1d4ed8"
                              : isNightMode
                              ? "url(#night-glass)"
                              : "url(#glass-reflection)"
                          }
                          stroke={isSelected ? "#60a5fa" : b.accentColor}
                          strokeWidth={isSelected ? "2.5" : "1.2"}
                          className="transition-colors"
                        />

                        {/* C. East/Side Facade (r2 - r1 - g1 - g2) */}
                        <polygon
                          points={`${r[2].x},${r[2].y} ${r[1].x},${r[1].y} ${g[1].x},${g[1].y} ${g[2].x},${g[2].y}`}
                          fill="url(#side-shadow)"
                          stroke={isSelected ? "#60a5fa" : "#334155"}
                          strokeWidth={isSelected ? "2" : "1"}
                        />

                        {/* D. West/Side Facade (if facing camera) */}
                        <polygon
                          points={`${r[0].x},${r[0].y} ${r[3].x},${r[3].y} ${g[3].x},${g[3].y} ${g[0].x},${g[0].y}`}
                          fill="#090e1a"
                          stroke={isSelected ? "#60a5fa" : "#1e293b"}
                          strokeWidth="0.8"
                          fillOpacity="0.8"
                        />

                        {/* E. 3D Floor Slabs & Cantilevered Balconies for High-Rise Towers (23 floors) */}
                        {isTower &&
                          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map(
                            (floorIdx) => {
                              const ratio = floorIdx / 23;
                              const fx1 = round2(g[3].x + (r[3].x - g[3].x) * ratio);
                              const fy1 = round2(g[3].y + (r[3].y - g[3].y) * ratio);
                              const fx2 = round2(g[2].x + (r[2].x - g[2].x) * ratio);
                              const fy2 = round2(g[2].y + (r[2].y - g[2].y) * ratio);

                              const isOdd = floorIdx % 2 !== 0;

                              return (
                                <g key={floorIdx}>
                                  {/* Floor Line */}
                                  <line
                                    x1={fx1}
                                    y1={fy1}
                                    x2={fx2}
                                    y2={fy2}
                                    stroke={
                                      isOdd
                                        ? "#38bdf8"
                                        : isNightMode
                                        ? "#fbbf24"
                                        : "#e2e8f0"
                                    }
                                    strokeWidth={isOdd ? "1.6" : "1"}
                                    strokeOpacity={isOdd ? "0.9" : "0.6"}
                                  />

                                  {/* Physical 3D Cantilevered Balcony Slab on Odd Floors */}
                                  {isOdd && (
                                    <line
                                      x1={round2(fx1 - 6)}
                                      y1={round2(fy1 + 3)}
                                      x2={round2(fx2 + 6)}
                                      y2={round2(fy2 + 3)}
                                      stroke="#38bdf8"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeOpacity="0.85"
                                    />
                                  )}
                                </g>
                              );
                            }
                          )}

                        {/* F. Presidential Bungalow Enclave 3D Villas Visualization */}
                        {isBungalow && (
                          <g>
                            {/* Villa Cluster Enclave Grid */}
                            {[
                              { dx: 40, dy: 30 },
                              { dx: 110, dy: 30 },
                              { dx: 180, dy: 30 },
                              { dx: 250, dy: 30 },
                              { dx: 40, dy: 100 },
                              { dx: 110, dy: 100 },
                              { dx: 180, dy: 100 },
                              { dx: 250, dy: 100 },
                            ].map((v, i) => {
                              const vp = project3D(b.x + v.dx, b.y + v.dy, 25);
                              const vx = round2(vp.x);
                              const vy = round2(vp.y);
                              return (
                                <g key={i}>
                                  {/* Mini 3D Villa Roof */}
                                  <rect
                                    x={round2(vx - 14)}
                                    y={round2(vy - 10)}
                                    width="28"
                                    height="18"
                                    rx="3"
                                    fill="url(#villa-roof)"
                                    stroke="#fbbf24"
                                    strokeWidth="1"
                                    transform={`rotate(10 ${vx} ${vy})`}
                                  />
                                  {/* Mini Turquoise Private Pool */}
                                  <rect
                                    x={round2(vx + 16)}
                                    y={round2(vy - 4)}
                                    width="14"
                                    height="10"
                                    rx="2"
                                    fill="url(#pool-water)"
                                    stroke="#38bdf8"
                                    strokeWidth="0.8"
                                  />
                                </g>
                              );
                            })}
                          </g>
                        )}

                        {/* G. Clubhouse Olympic Lap Pool Visualization */}
                        {isClubhouse && (
                          <g>
                            {/* Stepped Pavilion Roof */}
                            <polygon
                              points={`${r[3].x},${r[3].y} ${r[2].x},${r[2].y} ${r[1].x},${r[1].y} ${r[0].x},${r[0].y}`}
                              fill="#047857"
                              stroke="#34d399"
                              strokeWidth="2"
                            />
                            {/* Rooftop Lap Pool */}
                            <rect
                              x={round2(midX - 35)}
                              y={round2(midY - 15)}
                              width="70"
                              height="30"
                              rx="4"
                              fill="url(#pool-water)"
                              stroke="#67e8f9"
                              strokeWidth="1.5"
                            />
                            <text
                              x={midX}
                              y={round2(midY + 3)}
                              fill="#ffffff"
                              fontSize="9"
                              fontFamily="monospace"
                              textAnchor="middle"
                              fontWeight="bold"
                            >
                              OLYMPIC POOL
                            </text>
                          </g>
                        )}

                        {/* H. Helipad Elevated Circular Touchdown Deck */}
                        {isHelipad && (
                          <g>
                            {/* Circular Helipad Elevated Deck */}
                            <ellipse
                              cx={midX}
                              cy={midY}
                              rx="40"
                              ry="24"
                              fill="#991b1b"
                              stroke="#f87171"
                              strokeWidth="2.5"
                            />
                            {/* Inner Touchdown Ring */}
                            <ellipse
                              cx={midX}
                              cy={midY}
                              rx="26"
                              ry="15"
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              strokeDasharray="6 3"
                            />
                            {/* Big "H" Aviation Letter */}
                            <text
                              x={midX}
                              y={round2(midY + 6)}
                              fill="#ffffff"
                              fontSize="20"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              H
                            </text>
                          </g>
                        )}

                        {/* I. Central Park Green Canopy Landscape */}
                        {isPark && (
                          <g>
                            {/* Park Lake */}
                            <ellipse
                              cx={midX}
                              cy={midY}
                              rx="60"
                              ry="35"
                              fill="url(#pool-water)"
                              stroke="#34d399"
                              strokeWidth="1.5"
                            />
                            <text
                              x={midX}
                              y={round2(midY + 4)}
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              5.5 ACRE FOREST PARK
                            </text>
                          </g>
                        )}

                        {/* J. Top Roof Face Polygon (Floating atop height H) */}
                        {!isClubhouse && !isHelipad && !isPark && (
                          <polygon
                            points={`${r[3].x},${r[3].y} ${r[2].x},${r[2].y} ${r[1].x},${r[1].y} ${r[0].x},${r[0].y}`}
                            fill={
                              isSelected
                                ? "#3b82f6"
                                : isNightMode
                                ? b.nightColor || "#1e293b"
                                : b.color
                            }
                            stroke={isSelected ? "#ffffff" : b.accentColor}
                            strokeWidth={isSelected ? "2.5" : "1.2"}
                          />
                        )}

                        {/* K. Floating Holographic 3D Building Badge */}
                        <g
                          transform={`translate(${midX}, ${
                            round2(r[0].y - 20)
                          })`}
                        >
                          {/* Marker background pill */}
                          <rect
                            x="-50"
                            y="-14"
                            width="100"
                            height="24"
                            rx="12"
                            fill={isSelected ? "#2563eb" : "#0f172a"}
                            stroke={isSelected ? "#60a5fa" : "#334155"}
                            strokeWidth={isSelected ? "2" : "1"}
                            className="shadow-xl"
                          />
                          <text
                            x="0"
                            y="2"
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {b.code} · {b.floors.split(" ")[0]}
                          </text>

                          {isSelected && (
                            <circle cx="0" cy="18" r="4" fill="#38bdf8" />
                          )}
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : viewMode === "MODEL" && activeModelFile?.url ? (
              /* ============================================================= */
              /* REAL UPLOADED 3D MODEL (GLB / GLTF / OBJ / STL)                */
              /* ============================================================= */
              <Model3DFileCanvas
                src={activeModelFile.url}
                fileName={activeModelFile.fileName || "model.3d"}
                loadKey={modelResetKey}
              />
            ) : viewMode === "CAD" && active2dFile?.url ? (
              /* ============================================================= */
              /* REAL UPLOADED CAD DRAWING (DXF entities rendered server-converted) */
              /* ============================================================= */
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out will-change-transform"
                style={{
                  transform: `scale(${zoomLevel})`,
                }}
                suppressHydrationWarning
              >
                <CadDxfCanvas
                  src={active2dFile.url}
                  fileName={active2dFile.fileName || "drawing.dwg"}
                  theme={cadColorTheme}
                  showGrid={showCadGrid}
                  layerVisibility={cadLayerVisibility}
                  fitKey={cadFitKey}
                  onModelInfo={setCadModelInfo}
                />
              </div>
            ) : (
              /* ============================================================= */
              /* AUTOCAD 2D VECTOR BLUEPRINT (Clean Non-Overlapping Layout)   */
              /* ============================================================= */
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out will-change-transform"
                style={{
                  transform: `scale(${zoomLevel})`,
                }}
                suppressHydrationWarning
              >
                <svg
                  viewBox="0 0 1000 650"
                  className="w-full h-full max-h-[850px] drop-shadow-2xl"
                  style={{ background: "#060b14" }}
                  suppressHydrationWarning
                >
                  <defs>
                    {/* CAD Grid Pattern */}
                    <pattern
                      id="cad-grid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="0.8"
                      />
                      <path
                        d="M 200 0 L 0 0 0 200"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="1.2"
                      />
                    </pattern>

                    {/* Architectural Hatching Pattern */}
                    <pattern
                      id="hatch-residential"
                      width="12"
                      height="12"
                      patternTransform="rotate(45 0 0)"
                      patternUnits="userSpaceOnUse"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="12"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        strokeOpacity="0.35"
                      />
                    </pattern>
                    <pattern
                      id="hatch-villas"
                      width="12"
                      height="12"
                      patternTransform="rotate(45 0 0)"
                      patternUnits="userSpaceOnUse"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="12"
                        stroke="#f59e0b"
                        strokeWidth="1"
                        strokeOpacity="0.35"
                      />
                    </pattern>
                  </defs>

                  {/* 1. CAD Background Grid */}
                  {showGrid && (
                    <rect width="1000" height="650" fill="url(#cad-grid)" />
                  )}

                  {/* 2. Outer Township Boundary with Setbacks */}
                  <rect
                    x="50"
                    y="35"
                    width="900"
                    height="580"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                  />
                  <text
                    x="70"
                    y="55"
                    fill="#38bdf8"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    RERA REGISTERED TOWNSHIP BOUNDARY · 27.00 ACRES · 6.00M SETBACK LINE
                  </text>

                  {/* 3. Internal Master Avenues (Roads) */}
                  {showRoads && (
                    <g>
                      {/* Main Spine Boulevard */}
                      <rect
                        x="50"
                        y="245"
                        width="900"
                        height="45"
                        fill="#0f172a"
                        stroke="#475569"
                        strokeWidth="1"
                      />
                      <line
                        x1="50"
                        y1="267"
                        x2="950"
                        y2="267"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="10 6"
                      />
                      <text
                        x="420"
                        y="271"
                        fill="#fbbf24"
                        fontSize="10"
                        fontFamily="monospace"
                        letterSpacing="2"
                      >
                        18.00 METER MASTER SPINE AVENUE
                      </text>

                      {/* North-South Cross Connector */}
                      <rect
                        x="440"
                        y="35"
                        width="24"
                        height="580"
                        fill="#0f172a"
                        stroke="#475569"
                        strokeWidth="1"
                      />
                      <line
                        x1="452"
                        y1="35"
                        x2="452"
                        y2="615"
                        stroke="#f59e0b"
                        strokeWidth="1.5"
                        strokeDasharray="8 6"
                      />
                    </g>
                  )}

                  {/* 4. Green Landscape Buffers */}
                  {showGreenery && (
                    <g>
                      <rect
                        x="690"
                        y="330"
                        width="220"
                        height="255"
                        rx="12"
                        fill="#064e3b"
                        fillOpacity="0.45"
                        stroke="#10b981"
                        strokeWidth="1.5"
                      />
                    </g>
                  )}

                  {/* 5. Clean Non-Overlapping Building Footprints */}
                  {buildings.map((b) => {
                    const isSelected = selectedBuilding.id === b.id;
                    const hatchFill =
                      b.type === "BUNGALOW"
                        ? "url(#hatch-villas)"
                        : "url(#hatch-residential)";

                    const centerX = b.x + b.width / 2;
                    const centerY = b.y + b.depth / 2;

                    return (
                      <g
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuildingClick(b);
                        }}
                        className="cursor-pointer group"
                      >
                        {/* Building Footprint Box */}
                        <rect
                          x={b.x}
                          y={b.y}
                          width={b.width}
                          height={b.depth}
                          rx="6"
                          fill={isSelected ? "#1e3a8a" : hatchFill}
                          stroke={isSelected ? "#60a5fa" : b.accentColor}
                          strokeWidth={isSelected ? "3" : "1.8"}
                          className="transition-all duration-200 group-hover:stroke-white"
                        />

                        {/* CAD Cross-Hair diagonals */}
                        <line
                          x1={b.x}
                          y1={b.y}
                          x2={b.x + b.width}
                          y2={b.y + b.depth}
                          stroke={b.accentColor}
                          strokeWidth="0.5"
                          strokeOpacity="0.4"
                        />
                        <line
                          x1={b.x + b.width}
                          y1={b.y}
                          x2={b.x}
                          y2={b.y + b.depth}
                          stroke={b.accentColor}
                          strokeWidth="0.5"
                          strokeOpacity="0.4"
                        />

                        {/* Centered Clean Non-Overlapping Blueprint Typography */}
                        <text
                          x={centerX}
                          y={centerY - 10}
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {b.cadLabel}
                        </text>

                        <text
                          x={centerX}
                          y={centerY + 8}
                          fill="#94a3b8"
                          fontSize="9.5"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {b.floors} · {b.totalUnits} Units · {b.availableUnits} Avail
                        </text>

                        <text
                          x={centerX}
                          y={centerY + 24}
                          fill="#38bdf8"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {b.priceRange}
                        </text>

                        {/* Dimension Annotation Line */}
                        {showDimensions && (
                          <g>
                            <line
                              x1={b.x}
                              y1={b.y - 6}
                              x2={b.x + b.width}
                              y2={b.y - 6}
                              stroke="#fbbf24"
                              strokeWidth="0.8"
                            />
                            <text
                              x={centerX}
                              y={b.y - 9}
                              fill="#fbbf24"
                              fontSize="8.5"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              {Math.round(b.width * 0.45)}m width
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* CAD Coordinate Legends & Scale */}
                  <text
                    x="70"
                    y="600"
                    fill="#64748b"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    COORDINATES: 75°53'14"E / 22°43'28"N | SCALE: 1:500 METRIC | SYSTEM: WGS84 ARCH REV 4.5
                  </text>
                </svg>
              </div>
            )}
          </div>

          {/* Building Inspector Sidebar (4 cols on lg or 3 cols in fullscreen) */}
          <div
            className={`${
              isModal
                ? "lg:col-span-3"
                : viewMode === "3D"
                  ? "lg:col-span-4"
                  : "lg:col-span-3"
            } border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 flex flex-col justify-between space-y-6 overflow-y-auto`}
          >
            {viewMode === "CAD" && active2dFile ? (
              /* --- Real AutoCAD Drawing Inspector --- */
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      {cadFormatBadge(active2dFile.fileName || "")}
                    </Badge>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Real Drawing
                    </span>
                  </div>
                  <h4 className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-2 break-all">
                    {active2dFile.fileName}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {String(active2dFile.fileName || "").toLowerCase().endsWith(".dwg")
                      ? "Real DWG file converted to vector entities on the server and rendered live on the drawing canvas."
                      : "Real DXF file parsed live in the browser and rendered as vector entities."}
                  </p>
                </div>

                {/* Drawing Quick Specs Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-1 font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                      File Size
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {active2dFile.size
                        ? active2dFile.size > 1024 * 1024
                          ? `${(active2dFile.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${(active2dFile.size / 1024).toFixed(1)} KB`
                        : "—"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                      Format
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block break-all">
                      {String(active2dFile.fileName || "").toLowerCase().endsWith(".dxf")
                        ? "DXF (native vector)"
                        : "DWG → DXF (server converted)"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                      Entities
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {cadModelInfo ? cadModelInfo.entityCount.toLocaleString() : "parsing…"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                      Extents
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {cadModelInfo
                        ? `${cadModelInfo.extents.w.toLocaleString(undefined, { maximumFractionDigits: 1 })} × ${cadModelInfo.extents.h.toLocaleString(undefined, { maximumFractionDigits: 1 })} units`
                        : "parsing…"}
                    </span>
                  </div>
                </div>

                {/* Layer Breakdown */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Drawing Layers (click to toggle)
                  </span>
                  <div className="space-y-1.5 font-mono text-xs">
                    {cadModelInfo ? (
                      cadModelInfo.layers.length === 0 ? (
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-500">
                          No layers found (flat drawing).
                        </div>
                      ) : (
                        cadModelInfo.layers.map((layer) => (
                          <button
                            key={layer.name}
                            type="button"
                            onClick={() =>
                              setCadLayerVisibility((prev) => ({
                                ...prev,
                                [layer.name]: prev[layer.name] === false ? true : false,
                              }))
                            }
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-left"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                                  cadLayerVisibility[layer.name] === false
                                    ? "bg-slate-400"
                                    : "bg-sky-400"
                                }`}
                              />
                              <span
                                className={`truncate ${
                                  cadLayerVisibility[layer.name] === false
                                    ? "text-slate-400 line-through"
                                    : "text-slate-700 dark:text-slate-200"
                                }`}
                              >
                                {layer.name}
                              </span>
                            </div>
                            <span className="text-slate-400 text-[11px] shrink-0">
                              {layer.count} ent
                            </span>
                          </button>
                        ))
                      )
                    ) : (
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-500">
                        Loading layer info…
                      </div>
                    )}
                  </div>
                </div>

                {/* CAD Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  {cad2dFiles.length > 1 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        Other Uploaded Drawings
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cad2dFiles.map((f) => {
                          const id = f.id || f.fileName || "";
                          const active = id === (active2dFile.id || active2dFile.fileName);
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => {
                                setActiveCadId(id);
                                setCadModelInfo(null);
                                setCadLayerVisibility({});
                              }}
                              className={`px-2 py-1 rounded-md text-[11px] font-mono truncate max-w-[200px] transition-colors ${
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {f.fileName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <a
                    href={active2dFile.url}
                    download
                    className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all text-xs"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Original ({active2dFile.fileName})</span>
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold gap-1.5"
                    onClick={() => setViewMode(hasModel3d ? "MODEL" : "3D")}
                  >
                    <Box className="h-3.5 w-3.5" />
                    <span>Switch to {hasModel3d ? "3D Model View" : "3D Township View"}</span>
                  </Button>
                </div>
              </div>
            ) : viewMode === "MODEL" && activeModelFile ? (
              /* --- Real Uploaded 3D Model Inspector --- */
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="text-[11px] font-mono font-semibold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30">
                      {modelFormatFromFileName(activeModelFile.fileName || "")?.toUpperCase() || "3D MODEL"}
                    </Badge>
                    <span className="text-[10px] font-mono text-cyan-500 font-bold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse inline-block" />
                      Real 3D Model
                    </span>
                  </div>
                  <h4 className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-2 break-all">
                    {activeModelFile.fileName}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Interactive WebGL viewer — drag to orbit, scroll to zoom, right-drag to pan around the actual uploaded model.
                  </p>
                </div>

                {/* Model Quick Specs */}
                <div className="grid grid-cols-2 gap-2.5 pt-1 font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                      File Size
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {activeModelFile.size
                        ? activeModelFile.size > 1024 * 1024
                          ? `${(activeModelFile.size / (1024 * 1024)).toFixed(2)} MB`
                          : `${(activeModelFile.size / 1024).toFixed(1)} KB`
                        : "—"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                      Renderer
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">
                      WebGL · Orbit Camera
                    </span>
                  </div>
                </div>

                {/* Model Switcher + Actions */}
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  {model3dFiles.length > 1 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        Other Uploaded 3D Models
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {model3dFiles.map((f) => {
                          const id = f.id || f.fileName || "";
                          const active = id === (activeModelFile.id || activeModelFile.fileName);
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => {
                                setActiveModelId(id);
                              }}
                              className={`px-2 py-1 rounded-md text-[11px] font-mono truncate max-w-[200px] transition-colors ${
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {f.fileName}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <a
                    href={activeModelFile.url}
                    download
                    className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all text-xs"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Model ({activeModelFile.fileName})</span>
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold gap-1.5"
                    onClick={() => setViewMode("3D")}
                  >
                    <Box className="h-3.5 w-3.5" />
                    <span>Switch to 3D Township View</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* --- Standard 3D Building Inspector (Towers / Masterplan) --- */
              <div className="space-y-5">
                {/* Building Badge & Header */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      className={`text-xs font-semibold ${
                        selectedBuilding.type === "BUNGALOW"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {selectedBuilding.type} · {selectedBuilding.floors}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                      {selectedBuilding.code}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold font-serif text-slate-900 dark:text-white mt-2">
                    {selectedBuilding.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {selectedBuilding.description}
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold">
                      Price Range
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {selectedBuilding.priceRange}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold">
                      Carpet Sizes
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {selectedBuilding.carpetArea}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold">
                      Availability
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {selectedBuilding.availableUnits} of {selectedBuilding.totalUnits} Units
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold">
                      Architecture
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {selectedBuilding.floors}
                    </span>
                  </div>
                </div>

                {/* Architectural Highlights */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Key Specifications
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    {selectedBuilding.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                className="w-full font-semibold shadow-md gap-2"
                onClick={() => {
                  const el = document.getElementById("inventory-section");
                  if (el) {
                    if (isModal) setIsFullscreen(false);
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    setShowUnitsModal(true);
                  }
                }}
              >
                <Eye className="h-4 w-4" />
                <span>Explore {selectedBuilding.code} Units</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold gap-1.5"
                onClick={() => setShowUnitsModal(true)}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>View All Floor Units &amp; Prices</span>
              </Button>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-1">
                <span>* 3D Extruded Geometry</span>
                <span>100% RERA Escrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Standard In-Page Viewer Container */}
      <div
        className="w-full min-w-0 max-w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-xl transition-all"
        suppressHydrationWarning
      >
        {renderViewerBody(false)}
      </div>

      {/* Fullscreen / Full Size Modal Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
          {renderViewerBody(true)}
        </div>
      )}

      {/* Interactive Building Units Floor-by-Floor Modal */}
      {showUnitsModal && (
        <BuildingUnitsModal
          building={selectedBuilding}
          onClose={() => setShowUnitsModal(false)}
        />
      )}
    </>
  );
}


// Sub-component: Floor-by-floor units breakdown dialog for any clicked tower/villa
function BuildingUnitsModal({
  building,
  onClose,
}: {
  building: TownshipBuilding;
  onClose: () => void;
}) {
  const [filterType, setFilterType] = useState<"ALL" | "AVAILABLE" | "SOLD">("ALL");

  // Generate real unit breakdown for this building
  const sampleUnits = useMemo(() => {
    const isVilla = building.type === "BUNGALOW";
    const total = isVilla ? 16 : 24; // Show top 24 units across floors

    const list = [];
    for (let i = 1; i <= total; i++) {
      if (isVilla) {
        const status = i <= 7 ? "AVAILABLE" : i <= 14 ? "SOLD" : "HOLD";
        const bhk = i <= 6 ? "4 BHK Luxury Villa" : i <= 12 ? "5 BHK Royal Bungalow" : "8 BHK Presidential Mansion";
        const carpet = 4200 + i * 450;
        const price = 68000000 + i * 5500000;
        list.push({
          id: `villa-${i}`,
          unitNo: `Villa #${String(i).padStart(2, "0")}`,
          floor: "G+2 Storey",
          bhk,
          carpet,
          price,
          status,
          facing: i % 2 === 0 ? "East (Garden Facing)" : "North-East (Pool View)",
          deck: "Private Lawns & Infinity Pool",
        });
      } else {
        const floor = 24 - Math.floor(i / 2);
        const status = i % 3 === 0 ? "SOLD" : i % 7 === 0 ? "HOLD" : "AVAILABLE";
        const isOdd = floor % 2 !== 0;
        const bhk = floor >= 22 ? "4 BHK Penthouse Sky Villa" : floor >= 12 ? "3 BHK Royal Residence" : "2.5 BHK Luxury Suite";
        const carpet = floor >= 22 ? 3450 : floor >= 12 ? 2150 : 1650;
        const price = floor >= 22 ? 42500000 : floor >= 12 ? 28500000 : 19500000;

        list.push({
          id: `unit-${floor}-${i}`,
          unitNo: `${building.code}-${floor}${String(i % 4 + 1).padStart(2, "0")}`,
          floor: `Floor ${floor}`,
          bhk,
          carpet,
          price,
          status,
          facing: i % 2 === 0 ? "North-East (Central Park View)" : "East (Skyline Boulevard)",
          deck: isOdd ? "Odd Level: Double-Height Cantilevered Sky Balcony" : "Even Level: Extended Party Terrace",
        });
      }
    }
    return list;
  }, [building]);

  const filtered = sampleUnits.filter((u) => {
    if (filterType === "ALL") return true;
    return u.status === filterType;
  });

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-700 bg-slate-900 text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-white text-xs">{building.code}</Badge>
              <h3 className="text-lg sm:text-xl font-bold font-serif">{building.name}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {building.floors} · {building.carpetArea} · {building.priceRange}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/40 text-xs">
          <div className="flex items-center gap-2">
            {(["ALL", "AVAILABLE", "SOLD"] as const).map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterType === ft
                    ? "bg-primary text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {ft === "ALL" ? "All Units" : ft}
              </button>
            ))}
          </div>
          <span className="text-slate-400">
            Showing <strong>{filtered.length}</strong> Units in {building.code}
          </span>
        </div>

        {/* Units List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((u) => {
              const isAvail = u.status === "AVAILABLE";
              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-2xl border transition-all text-xs space-y-2 ${
                    isAvail
                      ? "bg-slate-800/80 border-slate-700 hover:border-primary"
                      : "bg-slate-950/50 border-slate-800 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-white">{u.unitNo}</span>
                    <Badge
                      className={`text-[10px] font-semibold ${
                        isAvail
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {u.status}
                    </Badge>
                  </div>

                  <div className="flex items-baseline justify-between text-slate-300">
                    <span className="font-semibold text-white">{u.bhk}</span>
                    <span className="font-mono font-bold text-amber-400">
                      ₹{(u.price / 10000000).toFixed(2)} Cr
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-700/50">
                    <p>{u.floor} · {u.carpet} sq ft carpet · {u.facing}</p>
                    <p className="text-cyan-400 font-medium">✦ {u.deck}</p>
                  </div>

                  <div className="pt-2">
                    {isAvail ? (
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white"
                        onClick={() => {
                          onClose();
                          const el = document.getElementById("contact-section") || document.getElementById("inventory-section");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        Request Priority Booking &amp; Floor Plan
                      </Button>
                    ) : (
                      <div className="w-full h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[11px] text-slate-500 font-medium">
                        Unit Reserved in Escrow
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
