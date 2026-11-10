"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Download, FileCode, Loader2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types (minimal shapes of what we consume from dxf-parser output)    */
/* ------------------------------------------------------------------ */

type DxfPoint = { x: number; y: number };

interface DxfEntity {
  type?: string;
  layer?: string;
  colorIndex?: number;
  color?: number;
  // LWPOLYLINE / POLYLINE / LINE
  // LINE (dxf-parser >=1.1 emits vertices = [p1, p2]); polylines carry bulge.
  vertices?: Array<Partial<DxfPoint> & { bulge?: number } | null | undefined>;
  shape?: boolean | number | string;
  // CIRCLE / ARC
  center?: DxfPoint;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  // LINE (older parser versions exposed this shape)
  startPoint?: DxfPoint;
  endPoint?: DxfPoint;
  // ELLIPSE
  majorAxisEndPoint?: DxfPoint;
  axisRatio?: number;
  // SPLINE
  controlPoints?: DxfPoint[];
  fitPoints?: DxfPoint[];
  knots?: number[];
  knotValues?: number[];
  degreeOfCurve?: number;
  degreeOfSplineCurve?: number;
  // TEXT / MTEXT
  text?: string;
  position?: DxfPoint;
  height?: number;
  textHeight?: number;
  rotation?: number;
  // INSERT
  name?: string;
  scaleFactor?: DxfPoint;
  xScale?: number;
  yScale?: number;
  // DIMENSION (graphics live in its referenced block)
  block?: string;
  // SOLID / 3DFACE
  points?: DxfPoint[];
  corners?: DxfPoint[];
}

export interface DxfParsedSheet {
  entities: DxfEntity[];
  blocks?: Array<{ name?: string; entities?: DxfEntity[] }>;
  tables?: {
    layer?: {
      layers?: Record<
        string,
        { name?: string; colorIndex?: number; color?: number }
      >;
    };
  };
}

export interface CadLayerStat {
  name: string;
  count: number;
  colorInt?: number;
}

export interface CadModelInfo {
  entityCount: number;
  extents: { w: number; h: number };
  layers: CadLayerStat[];
}

export type CadTheme = "dark" | "blueprint" | "white";

/* ------------------------------------------------------------------ */
/* Vector helpers: everything is emitted in "flipped" SVG space         */
/* (DXF y grows upward, SVG y grows downward => y' = -y)                */
/* ------------------------------------------------------------------ */

type Mat = [number, number, number, number, number, number]; // a b c d e f
const IDENT: Mat = [1, 0, 0, 1, 0, 0];

function matCompose(m: Mat, n: Mat): Mat {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

function matTranslate(tx: number, ty: number): Mat {
  return [1, 0, 0, 1, tx, ty];
}

function matScale(sx: number, sy: number): Mat {
  return [sx, 0, 0, sy, 0, 0];
}

function matRotate(deg: number): Mat {
  const r = (deg * Math.PI) / 180;
  return [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
}

function applyMat(mat: Mat, p: DxfPoint): DxfPoint {
  return {
    x: mat[0] * p.x + mat[2] * p.y + mat[4],
    y: mat[1] * p.x + mat[3] * p.y + mat[5],
  };
}

function matScaleOf(mat: Mat): number {
  return Math.hypot(mat[0], mat[1]) || 1;
}

function isFinitePair(p: DxfPoint | undefined | null): p is DxfPoint {
  return Boolean(p && Number.isFinite(p.x) && Number.isFinite(p.y));
}

const fmt = (n: number) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------------ */
/* Geometry: homogeneous op list extraction                             */
/* ------------------------------------------------------------------ */

type CadOp =
  | { kind: "path"; layer: string; aci: number | null; layerColorInt: number | null; hex: string | null; pts: DxfPoint[]; closed: boolean }
  | { kind: "circle"; layer: string; aci: number | null; layerColorInt: number | null; hex: string | null; cx: number; cy: number; r: number };

interface TxtOp {
  kind: "text";
  layer: string;
  aci: number | null;
  layerColorInt: number | null;
  hex: string | null;
  at: DxfPoint;
  height: number;
  rotationDeg: number;
  label: string;
}

const MAX_COMMANDS = 150_000;
const MAX_INSERT_DEPTH = 6;

function cleanMText(raw: string): string {
  return raw
    .replace(/\\P/g, " ")
    .replace(/\{\\[^;{}]*;/g, "")
    .replace(/[{}]/g, "")
    .trim();
}

function arcPoints(
  cx: number,
  cy: number,
  radius: number,
  startRad: number,
  endRad: number
): DxfPoint[] {
  if (![cx, cy, radius].every(Number.isFinite) || radius <= 0) return [];
  let delta = endRad - startRad;
  while (delta <= 1e-9) delta += Math.PI * 2;
  if (delta >= Math.PI * 2) delta = Math.PI * 2;
  const segs = Math.max(6, Math.min(96, Math.ceil((delta / (Math.PI * 2)) * 96)));
  const pts: DxfPoint[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = startRad + (delta * i) / segs;
    pts.push({ x: cx + radius * Math.cos(t), y: cy + radius * Math.sin(t) });
  }
  return pts;
}

function ellipsePoints(e: DxfEntity): DxfPoint[] {
  const c = e.center;
  const major = e.majorAxisEndPoint;
  if (!isFinitePair(c) || !isFinitePair(major)) return [];
  const aLen = Math.hypot(major.x, major.y);
  if (aLen <= 1e-9) return [];
  const ratio = Math.min(Math.max(1e-6, e.axisRatio ?? 1), 1);
  const bLen = aLen * ratio;
  const ux = major.x / aLen;
  const uy = major.y / aLen;
  const rawStart = e.startAngle ?? 0;
  const rawEnd = e.endAngle ?? Math.PI * 2;
  const full = Math.abs(rawEnd - rawStart) < 1e-9;
  const startRad = full ? 0 : Math.atan2(Math.sin(rawStart), Math.cos(rawStart));
  let delta = full
    ? Math.PI * 2
    : Math.atan2(Math.sin(rawEnd - rawStart), Math.cos(rawEnd - rawStart));
  while (delta <= 1e-9) delta += Math.PI * 2;
  if (delta > Math.PI * 2) delta = Math.PI * 2;
  const segs = Math.max(8, Math.min(256, Math.ceil((delta / (Math.PI * 2)) * 128)));
  const pts: DxfPoint[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = startRad + (delta * i) / segs;
    pts.push({
      x: c.x + aLen * Math.cos(t) * ux - bLen * Math.sin(t) * uy,
      y: c.y + aLen * Math.cos(t) * uy + bLen * Math.sin(t) * ux,
    });
  }
  return pts;
}

/** Arc sample of an LWPOLYLINE vertex bulge from previous vertex to this vertex. */
function bulgePoints(from: DxfPoint, to: DxfPoint, bulge: number): DxfPoint[] {
  const chord = Math.hypot(to.x - from.x, to.y - from.y);
  if (chord < 1e-9) return [];
  const theta = 4 * Math.atan(bulge);
  const tanHalf = Math.abs(Math.tan(theta / 2));
  if (!Number.isFinite(tanHalf) || tanHalf > 1e7) return [];
  const r = (chord / 2) * Math.sqrt(1 + tanHalf * tanHalf);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const ux = (to.x - from.x) / chord;
  const uy = (to.y - from.y) / chord;
  const halfChord = chord / 2;
  const centerDist = Math.sqrt(Math.max(0, r * r - halfChord * halfChord));
  const sign = bulge > 0 ? 1 : -1;
  const cx = midX - uy * centerDist * sign;
  const cy = midY + ux * centerDist * sign;
  const a1 = Math.atan2(from.y - cy, from.x - cx);
  let delta = Math.atan2(to.y - cy, to.x - cx) - a1;
  if (sign > 0 && delta <= 0) delta += Math.PI * 2;
  if (sign < 0 && delta >= 0) delta -= Math.PI * 2;
  const segs = Math.max(2, Math.min(64, Math.ceil((Math.abs(delta) / (Math.PI * 2)) * 96)));
  const inner: DxfPoint[] = [];
  for (let i = 1; i < segs; i++) {
    const t = a1 + (delta * i) / segs;
    inner.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
  }
  return inner;
}

function splinePoints(e: DxfEntity): DxfPoint[] {
  const cps = (e.controlPoints ?? []).filter(isFinitePair);
  const fits = (e.fitPoints ?? []).filter(isFinitePair);
  const degree = Math.max(
    1,
    Math.min(3, Math.floor(e.degreeOfSplineCurve ?? e.degreeOfCurve ?? 3))
  );
  const knots = Array.isArray(e.knots)
    ? e.knots
    : Array.isArray(e.knotValues)
      ? e.knotValues
      : undefined;
  if (
    cps.length > degree &&
    Array.isArray(knots) &&
    knots.length >= cps.length + degree + 1
  ) {
    const tStart = knots[degree] + 1e-7;
    const tEnd = knots[cps.length] - 1e-7;
    if (tEnd <= tStart) {
      return cps;
    }
    const segs = Math.min(720, Math.max(32, cps.length * 5));
    const pts: DxfPoint[] = [];
    for (let i = 0; i <= segs; i++) {
      const t = tStart + ((tEnd - tStart) * i) / segs;
      pts.push(deBoorPoint(t, cps, knots, degree));
    }
    return pts;
  }
  if (fits.length >= 2) return fits;
  return cps;
}

function deBoorPoint(t: number, cps: DxfPoint[], knots: number[], degree: number): DxfPoint {
  const n = cps.length - 1;
  let k = degree;
  for (let i = degree; i <= n; i++) {
    if (t >= knots[i] && t <= knots[i + 1]) {
      k = i;
      break;
    }
  }
  k = Math.min(Math.max(k, degree), n);
  const d: Array<[number, number]> = [];
  for (let j = 0; j <= degree; j++) {
    const idx = Math.min(Math.max(0, k - degree + j), n);
    d.push([cps[idx].x, cps[idx].y]);
  }
  for (let r = 1; r <= degree; r++) {
    for (let j = degree; j >= r; j--) {
      const i = k - degree + j;
      const denom = knots[i + degree + 1 - r] - knots[i];
      const alpha = denom === 0 ? 0 : Math.min(Math.max((t - knots[i]) / denom, 0), 1);
      const a = d[j - 1];
      const b = d[j];
      d[j] = [(1 - alpha) * a[0] + alpha * b[0], (1 - alpha) * a[1] + alpha * b[1]];
    }
  }
  return { x: d[degree][0], y: d[degree][1] };
}

function entityAnchor(e: DxfEntity): DxfPoint | null {
  for (const p of [e.position, e.startPoint, e.center]) {
    if (isFinitePair(p)) return p as DxfPoint;
  }
  return null;
}

type LayerInfo = { colorIndex?: number; color?: number };

function collectOps(
  entity: DxfEntity,
  mat: Mat,
  depth: number,
  blocks: Map<string, DxfEntity[]>,
  layerColors: Record<string, number>,
  byBlockHex: string | null,
  out: { ops: CadOp[]; texts: TxtOp[] }
): void {
  if (depth > MAX_INSERT_DEPTH || !entity) return;
  const type = String(entity.type || "").toUpperCase();
  const layer = typeof entity.layer === "string" && entity.layer ? entity.layer : "0";
  const rawColorIndex =
    typeof entity.colorIndex === "number" ? entity.colorIndex : 0;
  // 256 = BYBLOCK -> inherit the INSERT's resolved colour
  const byBlock = rawColorIndex === 256;
  const aci = rawColorIndex > 0 && rawColorIndex < 256 ? rawColorIndex : null;
  // Resolve the true display colour once per entity:
  //   1. BYBLOCK -> parent INSERT colour
  //   2. entity true-colour (RGB int > 255)
  //   3. entity ACI index (1..255)
  //   4. BYLAYER -> this entity's own layer colour (RGB int or ACI index)
  const entityRgb =
    typeof entity.color === "number" && entity.color > 255
      ? entity.color
      : null;
  const layerColorHint = layerColors[layer] ?? null;
  const baseHex = byBlock
    ? byBlockHex
    : resolveBaseHex(entityRgb, aci, layerColorHint);

  const addPath = (pts: DxfPoint[], closed = false) => {
    if (pts.length < 2) return;
    const transformed = pts
      .map((p) => applyMat(mat, p))
      .filter(isFinitePair);
    if (transformed.length < 2) return;
    out.ops.push({
      kind: "path",
      layer,
      aci,
      layerColorInt: layerColorHint,
      hex: baseHex,
      pts: transformed,
      closed,
    });
  };
  const addCircle = (c: DxfPoint, r: number) => {
    if (!isFinitePair(c) || !(r > 0)) return;
    const center = applyMat(mat, c);
    out.ops.push({
      kind: "circle",
      layer,
      aci,
      layerColorInt: layerColorHint,
      hex: baseHex,
      cx: center.x,
      cy: center.y,
      r: r * matScaleOf(mat),
    });
  };

  switch (type) {
    case "LWPOLYLINE":
    case "POLYLINE": {
      const verts = (entity.vertices ?? []).filter(
        (v): v is DxfPoint & { bulge?: number } =>
          Number.isFinite(v?.x) && Number.isFinite(v?.y)
      );
      if (verts.length < 2) return;
      const pts: DxfPoint[] = [verts[0]];
      for (let i = 1; i < verts.length; i++) {
        const bulge = typeof verts[i].bulge === "number" ? (verts[i].bulge as number) : 0;
        if (Math.abs(bulge) > 1e-8) {
          pts.push(...bulgePoints(verts[i - 1], verts[i], bulge));
        }
        pts.push(verts[i]);
      }
      const closed =
        verts.length > 2 &&
        (entity.shape === true ||
          entity.shape === 1 ||
          entity.shape === "true" ||
          entity.shape === "1");
      if (closed) pts.push(verts[0]);
      addPath(pts, false);
      break;
    }
    case "LINE": {
      // dxf-parser >=1.1: LINE exposes vertices:[p1, p2]; older versions
      // exposed startPoint/endPoint. Support both so no line is dropped.
      let a: DxfPoint | undefined;
      let b: DxfPoint | undefined;
      if (Array.isArray(entity.vertices) && entity.vertices.length >= 2) {
        a = entity.vertices[0] as DxfPoint;
        b = entity.vertices[1] as DxfPoint;
      }
      if (!isFinitePair(a)) a = entity.startPoint;
      if (!isFinitePair(b)) b = entity.endPoint;
      if (isFinitePair(a) && isFinitePair(b) && !(a.x === b.x && a.y === b.y)) {
        addPath([a as DxfPoint, b as DxfPoint]);
      }
      break;
    }
    case "CIRCLE": {
      if (isFinitePair(entity.center) && (entity.radius ?? 0) > 0) {
        addCircle(entity.center as DxfPoint, entity.radius as number);
      }
      break;
    }
    case "ARC": {
      const pts = arcPoints(
        entity.center?.x ?? 0,
        entity.center?.y ?? 0,
        entity.radius ?? 0,
        entity.startAngle ?? 0,
        entity.endAngle ?? 0
      );
      addPath(pts);
      break;
    }
    case "ELLIPSE": {
      addPath(ellipsePoints(entity));
      break;
    }
    case "SPLINE": {
      addPath(splinePoints(entity));
      break;
    }
    case "POINT": {
      const p = entityAnchor(entity);
      if (!p) return;
      const q = applyMat(mat, p);
      out.ops.push({
        kind: "path",
        layer,
        aci,
        layerColorInt: layerColorHint,
        hex: baseHex,
        pts: [
          { x: q.x - 1, y: q.y - 1 },
          { x: q.x + 1, y: q.y + 1 },
        ],
        closed: false,
      });
      break;
    }
    case "TEXT":
    case "MTEXT": {
      const p = entityAnchor(entity);
      const raw = typeof entity.text === "string" ? entity.text.trim() : "";
      if (!isFinitePair(p) || !raw) return;
      out.texts.push({
        kind: "text",
        layer,
        aci,
        layerColorInt: layerColorHint,
        hex: baseHex,
        at: applyMat(mat, p),
        height: entity.height ?? entity.textHeight ?? 0,
        rotationDeg: rotationToDeg(entity.rotation ?? 0),
        label: cleanMText(raw).slice(0, 200),
      });
      break;
    }
    case "SOLID":
    case "3DFACE": {
      const rawPts = entity.vertices ?? entity.points ?? entity.corners ?? [];
      const pts = (rawPts as DxfPoint[]).filter(isFinitePair);
      if (pts.length >= 2) addPath(pts, true);
      break;
    }
    case "DIMENSION": {
      // The dimension's arrowheads/witness lines live in its *D block; expand
      // it in place with the current transform (block coords are WCS).
      const dimBlock = blocks.get(String(entity.block ?? ""));
      if (dimBlock && dimBlock.length > 0) {
        for (const child of dimBlock) {
          collectOps(child as DxfEntity, mat, depth + 1, blocks, layerColors, byBlockHex, out);
        }
      }
      break;
    }
    case "INSERT": {
      const block = blocks.get(String(entity.name ?? ""));
      if (!block || block.length === 0) return;
      const base = entityAnchor(entity) ?? { x: 0, y: 0 };
      const sx = entity.scaleFactor?.x ?? entity.xScale ?? 1;
      const sy = entity.scaleFactor?.y ?? sx;
      const rotRaw = typeof entity.rotation === "number" ? entity.rotation : 0;
      let inner = matCompose(
        mat,
        matCompose(matTranslate(base.x, base.y), matRotate(inferRotationDeg(rotRaw)))
      );
      if (sx !== 1 || sy !== 1) {
        inner = matCompose(inner, matScale(sx, sy));
      }
      for (const child of block) {
        collectOps(child, inner, depth + 1, blocks, layerColors, baseHex, out);
      }
      break;
    }
    default:
      return;
  }
}

function rotationToDeg(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  if (Math.abs(raw) > Math.PI * 2.5) return raw;
  return (raw * 180) / Math.PI;
}

function inferRotationDeg(raw: number): number {
  if (!Number.isFinite(raw)) return 0;
  if (Math.abs(raw) > Math.PI * 2.5) return raw;
  return (raw * 180) / Math.PI;
}

/* ------------------------------------------------------------------ */
/* Builder: dxf-parser output -> flat, styled command list              */
/* ------------------------------------------------------------------ */

export interface CadCommand {
  layer: string;
  kind: "path" | "circle" | "text";
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  size?: number;
  rotationDeg?: number;
  label?: string;
  aci: number | null;
  layerColorInt: number | null;
  hex: string | null;
}

export interface CadBuiltSheet {
  commands: CadCommand[];
  layers: CadLayerStat[];
  extents: { minX: number; maxX: number; minY: number; maxY: number };
  entityCount: number;
}

export function buildCadSheet(parsed: DxfParsedSheet): CadBuiltSheet {
  const layerMap =
    parsed.tables?.layer?.layers &&
    typeof parsed.tables.layer.layers === "object"
      ? (parsed.tables.layer.layers as Record<string, LayerInfo>)
      : {};
  const blocks = new Map<string, DxfEntity[]>();
  // dxf-parser exposes blocks as an object keyed by name in newer versions
  // and as an array in older ones - handle both shapes.
  const rawBlocks = parsed.blocks;
  const blockList: Array<{
    name?: string;
    entities?: DxfEntity[];
    rotationAngle?: number;
    basePoint?: DxfPoint;
  }> = Array.isArray(rawBlocks)
    ? (rawBlocks as Array<{ name?: string; entities?: DxfEntity[]; rotationAngle?: number; basePoint?: DxfPoint }>)
    : rawBlocks && typeof rawBlocks === "object"
      ? Object.values(rawBlocks as Record<string, { name?: string; entities?: DxfEntity[]; rotationAngle?: number; basePoint?: DxfPoint }>)
      : [];
  for (const block of blockList) {
    if (block?.name && Array.isArray(block.entities) && block.entities.length > 0) {
      blocks.set(block.name, block.entities);
    }
  }

  const raw: { ops: CadOp[]; texts: TxtOp[] } = { ops: [], texts: [] };
  const entities = Array.isArray(parsed.entities) ? parsed.entities : [];

  // Per-layer colour table so BYLAYER entities (incl. inside blocks) resolve
  // against their OWN layer, not the parent INSERT's layer.
  const layerColors: Record<string, number> = {};
  for (const [name, info] of Object.entries(layerMap)) {
    if (typeof info?.color === "number" && info.color > 0) {
      layerColors[name] = info.color;
    } else if (typeof info?.colorIndex === "number" && info.colorIndex > 0) {
      layerColors[name] = info.colorIndex;
    }
  }
  for (const e of entities) {
    collectOps(e, IDENT, 0, blocks, layerColors, null, raw);
  }

  // Extents. Real-world DWGs frequently contain a handful of stray entities
  // sitting kilometres away (leftover construction lines etc). Using the raw
  // min/max then squeezes the actual drawing into a tiny strip, so detect
  // such outliers via coordinate percentiles and clip the view to the dense
  // core of the geometry.
  const xs: number[] = [];
  const ys: number[] = [];
  for (const op of raw.ops) {
    if (op.kind === "circle") {
      if (!Number.isFinite(op.cx) || !Number.isFinite(op.cy) || !(op.r > 0)) continue;
      xs.push(op.cx - op.r, op.cx + op.r);
      ys.push(op.cy - op.r, op.cy + op.r);
    } else {
      for (const p of op.pts) {
        if (!isFinitePair(p)) continue;
        xs.push(p.x);
        ys.push(p.y);
      }
    }
  }
  for (const t of raw.texts) {
    if (!isFinitePair(t.at)) continue;
    xs.push(t.at.x);
    ys.push(t.at.y);
  }

  const robustRange = (vals: number[]): [number, number] => {
    if (vals.length === 0) return [0, 0];
    vals.sort((a, b) => a - b);
    const lo0 = vals[0];
    const hi0 = vals[vals.length - 1];
    if (vals.length < 64) return [lo0, hi0];
    const q = (frac: number) => vals[Math.floor(frac * (vals.length - 1))];
    const lo = q(0.004);
    const hi = q(0.996);
    const core = hi - lo;
    if (core > 1e-9 && hi0 - lo0 > core * 2.5) return [lo, hi];
    return [lo0, hi0];
  };
  const [minXr, maxXr] = robustRange(xs);
  const [minYr, maxYr] = robustRange(ys);
  const bounds = { minX: minXr, minY: minYr, maxX: maxXr, maxY: maxYr };

  const hasGeometry =
    Number.isFinite(bounds.minX) &&
    Number.isFinite(bounds.maxX) &&
    bounds.maxX - bounds.minX > 1e-9;
  if (!hasGeometry) {
    bounds.minX = 0;
    bounds.maxX = 100;
    bounds.minY = 0;
    bounds.maxY = 100;
  }
  const diag = Math.max(
    1e-6,
    Math.hypot(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY)
  );

  // Flatten ops into drawable commands (points in flipped space).
  const commands: CadCommand[] = [];
  const layerStats = new Map<string, { count: number; colorInt: number | null }>();
  const push = (cmd: CadCommand) => {
    if (commands.length >= MAX_COMMANDS) return;
    commands.push(cmd);
    const stat = layerStats.get(cmd.layer) ?? { count: 0, colorInt: cmd.layerColorInt };
    stat.count += 1;
    if (stat.colorInt === null && cmd.layerColorInt !== null) {
      stat.colorInt = cmd.layerColorInt;
    }
    layerStats.set(cmd.layer, stat);
  };

  const toPath = (opt: { pts: DxfPoint[]; closed: boolean; layer: string; aci: number | null; layerColorInt: number | null; hex: string | null }) => {
    let d = "";
    opt.pts.forEach((p, i) => {
      d += i ? ` L ${fmt(p.x)} ${fmt(-p.y)}` : ` M ${fmt(p.x)} ${fmt(-p.y)}`;
    });
    if (opt.closed) d += " Z";
    push({
      layer: opt.layer,
      kind: "path",
      d: d.trim(),
      aci: opt.aci,
      layerColorInt: opt.layerColorInt,
      hex: opt.hex,
    });
  };

  for (const op of raw.ops) {
    if (op.kind === "circle") {
      push({
        layer: op.layer,
        kind: "circle",
        cx: fmt(op.cx),
        cy: fmt(-op.cy),
        r: fmt(op.r),
        aci: op.aci,
        layerColorInt: op.layerColorInt,
        hex: op.hex,
      });
    } else {
      toPath(op);
    }
  }

  const defaultTextHeight = diag * 0.014;
  for (const t of raw.texts) {
    const height = t.height > 0 ? t.height : defaultTextHeight;
    push({
      layer: t.layer,
      kind: "text",
      x: fmt(t.at.x),
      y: fmt(-t.at.y),
      size: fmt(height),
      rotationDeg: -t.rotationDeg,
      label: t.label,
      aci: t.aci,
      layerColorInt: t.layerColorInt,
      hex: t.hex,
    });
  }

  const layers: CadLayerStat[] = [...layerStats.entries()]
    .map(([name, stat]) => ({ name, count: stat.count, colorInt: stat.colorInt ?? undefined }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    commands,
    layers,
    extents: bounds,
    entityCount: entities.length,
  };
}

/* ------------------------------------------------------------------ */
/* Color resolution                                                    */
/* ------------------------------------------------------------------ */

function rgbIntToHex(int: number): string {
  const v = Math.max(0, Math.min(0xffffff, Math.floor(int)));
  return `#${v.toString(16).padStart(6, "0")}`;
}

function hsvHex(h: number, s: number, v: number): string {
  const c = v * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = v - c;
  const ch = (n: number) =>
    Math.round(Math.max(0, Math.min(255, (n + m) * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${ch(r)}${ch(g)}${ch(b)}`;
}

// Full AutoCAD Color Index palette (1-255), generated once.
const ACI_HEX: string[] = (() => {
  const out: string[] = [];
  out[0] = "#cbd5e1"; // BYLAYER fallback
  out[1] = "#ff0000";
  out[2] = "#ffff00";
  out[3] = "#00ff00";
  out[4] = "#00ffff";
  out[5] = "#0000ff";
  out[6] = "#ff00ff";
  out[7] = "#ffffff";
  out[8] = "#808080";
  out[9] = "#c0c0c0";
  const shadeVals = [1.0, 0.8, 0.6, 0.4, 0.2];
  for (let i = 10; i <= 249; i++) {
    const band = Math.floor((i - 10) / 10); // 0..23
    const shade = (i - 10) % 10; // 0..9
    const hue = (band * 15) % 360;
    const sat = shade < 5 ? 1.0 : 0.5;
    const val = shadeVals[shade % 5];
    out[i] = hsvHex(hue, sat, val);
  }
  const grays = [51, 91, 132, 173, 214, 255];
  for (let i = 0; i < 6; i++) out[250 + i] = rgbIntToHex((grays[i] << 16) | (grays[i] << 8) | grays[i]);
  return out;
})();

function aciToHex(index: number): string | null {
  if (!Number.isFinite(index) || index < 1 || index > 255) return null;
  return ACI_HEX[Math.floor(index)] ?? null;
}

/** Base colour for an entity: true colour > entity ACI > layer colour. */
function resolveBaseHex(
  entityRgb: number | null,
  aci: number | null,
  layerColorHint: number | null
): string | null {
  if (entityRgb !== null) return rgbIntToHex(entityRgb);
  if (aci !== null) return aciToHex(aci);
  if (layerColorHint !== null && layerColorHint > 0) {
    if (layerColorHint > 255) return rgbIntToHex(layerColorHint);
    return aciToHex(layerColorHint);
  }
  return null;
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function colorFor(
  cmd: Pick<CadCommand, "hex" | "aci" | "layerColorInt">,
  theme: CadTheme
): string {
  const fallback =
    theme === "dark" ? "#94a3b8" : theme === "white" ? "#475569" : "#334155";
  const base =
    cmd.hex ??
    resolveBaseHex(null, cmd.aci, cmd.layerColorInt) ??
    fallback;
  const lum = luminance(base);
  if (theme === "dark") {
    // Near-black lines vanish on the night canvas -> lift to light gray.
    if (lum < 0.16) return "#cbd5e1";
    if (lum < 0.28) return "#94a3b8";
    return base;
  }
  if (theme === "white") {
    // Only near-white lines vanish on paper; real colours (cyan, orange,
    // green...) stay untouched.
    if (lum > 0.8) return "#374151";
    return base;
  }
  // blueprint: light paper canvas with navy ink
  if (lum > 0.6) return "#1e3a5f";
  if (lum < 0.12) return "#0f172a";
  return base;
}

/* ------------------------------------------------------------------ */
/* React component                                                     */
/* ------------------------------------------------------------------ */

interface CadDxfCanvasProps {
  src: string;
  fileName: string;
  theme: CadTheme;
  showGrid: boolean;
  layerVisibility?: Record<string, boolean>;
  fitKey?: number;
  onModelInfo?: (info: CadModelInfo) => void;
}

interface CanvasState {
  status: "loading" | "ready" | "error";
  error?: string;
  detail?: string;
  sheet?: CadBuiltSheet;
}

function niceStep(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const frac = raw / pow;
  return (frac >= 5 ? 5 : frac >= 2 ? 2 : 1) * pow;
}

export function CadDxfCanvas({
  src,
  fileName,
  theme,
  showGrid,
  layerVisibility,
  fitKey = 0,
  onModelInfo,
}: CadDxfCanvasProps) {
  const [state, setState] = useState<
    CanvasState & { src: string }
  >({ status: "loading", src });
  const [pan, setPan] = useState({ x: 0, y: 0, fitKey: fitKey });
  const [isPanning, setIsPanning] = useState(false);
  const [mouseUnit, setMouseUnit] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Derive-in-render resets (React "adjust state when props change" pattern):
  // a new src restarts loading; a bumped fitKey resets pan/zoom fit.
  if (state.src !== src) {
    setState({ status: "loading", src });
  }
  if (pan.fitKey !== fitKey) {
    setPan({ x: 0, y: 0, fitKey });
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/media/cad-preview?src=${encodeURIComponent(src)}`);
        if (!res.ok) {
          let message = "CAD preview request failed.";
          let detail: string | undefined;
          try {
            const body = await res.json();
            message = body.error || message;
            detail = body.detail;
          } catch {
            // non-JSON error body
          }
          if (!cancelled) setState({ error: message, detail, status: "error", src });
          return;
        }
        const dxfText = await res.text();
        const mod = await import("dxf-parser");
        const ParserCtor = (mod.default ?? mod) as unknown as new () => {
          parseSync: (text: string) => DxfParsedSheet;
        };
        const parser = new ParserCtor();
        const parsed = parser.parseSync(dxfText);
        if (!parsed || !Array.isArray(parsed.entities)) {
          throw new Error("Parsed drawing contained no entities.");
        }
        const sheet = buildCadSheet(parsed);
        if (cancelled) return;
        setState({ status: "ready", sheet, src });
        onModelInfo?.({
          entityCount: sheet.entityCount,
          extents: {
            w: Math.max(1e-6, sheet.extents.maxX - sheet.extents.minX),
            h: Math.max(1e-6, sheet.extents.maxY - sheet.extents.minY),
          },
          layers: sheet.layers,
        });
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : String(error);
        setState({
          status: "error",
          src,
          error: "Could not render this CAD drawing.",
          detail: message,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const sheet = state.status === "ready" ? state.sheet : undefined;

  const viewBox = useMemo(() => {
    if (!sheet) return undefined;
    const { minX, maxX, minY, maxY } = sheet.extents;
    const w = Math.max(maxX - minX, 1e-3);
    const h = Math.max(maxY - minY, 1e-3);
    const padX = w * 0.03;
    const padY = h * 0.03;
    return `${fmt(minX - padX)} ${fmt(-maxY - padY)} ${fmt(w + padX * 2)} ${fmt(h + padY * 2)}`;
  }, [sheet]);

  const minorStep = useMemo(() => {
    if (!sheet) return 10;
    const w = Math.max(sheet.extents.maxX - sheet.extents.minX, 1e-3);
    const h = Math.max(sheet.extents.maxY - sheet.extents.minY, 1e-3);
    return niceStep(Math.min(w, h) / 24);
  }, [sheet]);

  const visibleCommands = useMemo(() => {
    if (!sheet) return [] as CadCommand[];
    if (!layerVisibility) return sheet.commands;
    return sheet.commands.filter((c) => layerVisibility[c.layer] !== false);
  }, [sheet, layerVisibility]);

  // Performance: collapse tens of thousands of commands into one mega-path
  // per rendered colour. Pan/zoom then only touches a handful of DOM nodes.
  const drawNodes = useMemo(() => {
    if (!sheet) return null;
    const groups = new Map<string, string[]>();
    const textNodes: React.ReactNode[] = [];
    for (const cmd of visibleCommands) {
      if (cmd.kind === "text") {
        textNodes.push(
          <text
            key={`t${textNodes.length}`}
            x={cmd.x}
            y={cmd.y}
            fontSize={cmd.size}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fill={colorFor(cmd, theme)}
            transform={
              cmd.rotationDeg
                ? `rotate(${cmd.rotationDeg} ${cmd.x} ${cmd.y})`
                : undefined
            }
            opacity="0.95"
          >
            {cmd.label}
          </text>
        );
        continue;
      }
      const color = colorFor(cmd, theme);
      let d: string;
      if (cmd.kind === "path") {
        d = cmd.d ?? "";
      } else {
        const cx = cmd.cx ?? 0;
        const cy = cmd.cy ?? 0;
        const r = cmd.r ?? 0;
        d = `M ${fmt(cx - r)} ${fmt(cy)} A ${fmt(r)} ${fmt(r)} 0 1 1 ${fmt(cx + r)} ${fmt(cy)} A ${fmt(r)} ${fmt(r)} 0 1 1 ${fmt(cx - r)} ${fmt(cy)} Z`;
      }
      if (!d) continue;
      const arr = groups.get(color);
      if (arr) arr.push(d);
      else groups.set(color, [d]);
    }
    const pathNodes: React.ReactNode[] = [];
    groups.forEach((ds, color) => {
      pathNodes.push(
        <path
          key={`p${color}`}
          d={ds.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      );
    });
    return (
      <>
        {pathNodes}
        {textNodes}
      </>
    );
  }, [visibleCommands, theme, sheet]);

  // Pan is tracked in PIXELS and applied as a CSS transform on the <svg>
  // element so dragging is compositor-only - the (possibly multi-MB) vector
  // geometry is never re-tessellated while moving.
  const onPointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (e.button !== 0) return;
      dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      setIsPanning(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pan]
  );

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const viewBoxVal = svg.viewBox.baseVal;
    const rect = svg.getBoundingClientRect();
    const scaleX = viewBoxVal.width / Math.max(rect.width, 1);
    const scaleY = viewBoxVal.height / Math.max(rect.height, 1);
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setMouseUnit({
      x: Math.round((viewBoxVal.x + px * scaleX) * 10) / 10,
      y: Math.round(-((viewBoxVal.y + py * scaleY)) * 10) / 10,
    });
    const drag = dragRef.current;
    if (!drag) return;
    setPan({
      x: Math.round(drag.panX + (e.clientX - drag.x)),
      y: Math.round(drag.panY + (e.clientY - drag.y)),
      fitKey: pan.fitKey,
    });
  }, [pan]);

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setIsPanning(false);
  }, []);

  if (state.status === "error") {
    return (
      <div className="w-full h-full flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
            <FileCode className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <p className="font-bold text-base text-white">{state.error}</p>
            <p className="text-xs text-slate-400 break-all font-mono">{fileName}</p>
          </div>
          <a
            href={src}
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all text-xs"
          >
            <Download className="h-4 w-4" />
            <span>Download file to view in AutoCAD</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {state.status === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#060a14]/70 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-slate-900/90 px-5 py-3 shadow-xl">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            <div className="text-xs">
              <p className="font-bold text-white">Parsing CAD drawing…</p>
              <p className="text-slate-400 font-mono">{fileName}</p>
            </div>
          </div>
        </div>
      )}

      {sheet && (
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
          style={{
            background:
              theme === "white"
                ? "#ffffff"
                : theme === "blueprint"
                  ? "#eef2f8"
                  : "transparent",
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transition: isPanning ? "none" : "transform 120ms ease-out",
            willChange: "transform",
          }}
          suppressHydrationWarning
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
        >
          {showGrid && (
            <>
              <defs>
                <pattern
                  id="dxf-grid-minor"
                  width={minorStep}
                  height={minorStep}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${minorStep} 0 L 0 0 0 ${minorStep}`}
                    fill="none"
                    stroke={
                      theme === "white"
                        ? "#e5e7eb"
                        : theme === "blueprint"
                          ? "#dbe3ee"
                          : "#16233c"
                    }
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                </pattern>
                <pattern
                  id="dxf-grid-major"
                  width={minorStep * 5}
                  height={minorStep * 5}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${minorStep * 5} 0 L 0 0 0 ${minorStep * 5}`}
                    fill="none"
                    stroke={
                      theme === "white"
                        ? "#d1d5db"
                        : theme === "blueprint"
                          ? "#c3cfdc"
                          : "#1f3a5c"
                    }
                    strokeWidth="1.4"
                    vectorEffect="non-scaling-stroke"
                  />
                </pattern>
              </defs>
              <rect x={sheet.extents.minX} y={-sheet.extents.maxY} width={sheet.extents.maxX - sheet.extents.minX} height={sheet.extents.maxY - sheet.extents.minY} fill="url(#dxf-grid-minor)" />
              <rect x={sheet.extents.minX} y={-sheet.extents.maxY} width={sheet.extents.maxX - sheet.extents.minX} height={sheet.extents.maxY - sheet.extents.minY} fill="url(#dxf-grid-major)" />
            </>
          )}

          <g>{drawNodes}</g>
        </svg>
      )}

      {sheet && (
        <div className="absolute bottom-2 right-2 z-10 hidden md:flex items-center gap-2 rounded-lg bg-slate-900/85 backdrop-blur border border-slate-700/60 px-2.5 py-1.5 text-[10px] font-mono text-slate-300 shadow">
          <Crosshair className="h-3 w-3 text-cyan-400" />
          <span>
            X {mouseUnit ? mouseUnit.x.toFixed(1) : "—"} · Y{" "}
            {mouseUnit ? mouseUnit.y.toFixed(1) : "—"}
          </span>
          <span className="text-slate-500">| drag to pan</span>
        </div>
      )}
    </div>
  );
}
