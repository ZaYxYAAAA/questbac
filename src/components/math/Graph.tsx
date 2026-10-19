"use client";

/**
 * Moteur de graphes interactif (SVG) maison.
 *
 * <Graph> gère le repère, la grille, le déplacement (glisser), le zoom
 * (molette après un clic, pincement, boutons) et fournit un contexte de
 * conversion coordonnées mathématiques ⇄ pixels à ses enfants
 * (<Plot>, <MovablePoint>, <Vector>, <Area>...).
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { fmt } from "@/lib/math/parser";

export interface ViewBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface GraphContextValue {
  view: ViewBox;
  width: number;
  height: number;
  sx: (x: number) => number;
  sy: (y: number) => number;
  toWorld: (px: number, py: number) => [number, number];
  svgRef: React.RefObject<SVGSVGElement | null>;
}

const GraphContext = createContext<GraphContextValue | null>(null);

export function useGraph() {
  const ctx = useContext(GraphContext);
  if (!ctx) throw new Error("useGraph doit être utilisé dans <Graph>");
  return ctx;
}

export const COLORS = {
  violet: "#a78bfa",
  cyan: "#22d3ee",
  pink: "#f472b6",
  amber: "#fbbf24",
  emerald: "#34d399",
  red: "#f87171",
  blue: "#60a5fa",
  white: "#f8fafc",
  muted: "#94a3b8",
};

export const CURVE_COLORS = [COLORS.violet, COLORS.cyan, COLORS.pink, COLORS.amber, COLORS.emerald, COLORS.blue];

function niceStep(range: number, pixels: number, targetPx = 70) {
  const raw = range / Math.max(1, pixels / targetPx);
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * p;
}

function zoomAround(v: ViewBox, wx: number, wy: number, factor: number): ViewBox {
  const range = (v.xMax - v.xMin) * factor;
  if (range < 1e-3 || range > 1e5) return v;
  return {
    xMin: wx - (wx - v.xMin) * factor,
    xMax: wx + (v.xMax - wx) * factor,
    yMin: wy - (wy - v.yMin) * factor,
    yMax: wy + (v.yMax - wy) * factor,
  };
}

const PI_LABELS: Record<number, string> = { 1: "π", [-1]: "−π" };
function piLabel(k: number): string {
  // k = multiple de π/2
  if (k === 0) return "0";
  if (k % 2 === 0) return PI_LABELS[k / 2] ?? `${fmt(k / 2)}π`;
  return `${k < 0 ? "−" : ""}${Math.abs(k) === 1 ? "" : Math.abs(k)}π/2`;
}

export interface GraphProps {
  initial: ViewBox;
  height?: number;
  /**
   * Même échelle sur les deux axes (cercles ronds). Par défaut, la largeur de la fenêtre est gardée et la hauteur
   * s'adapte (elle peut être rognée) ; avec « contain », toute la fenêtre reste visible et c'est l'autre axe qui s'élargit.
   */
  equalAspect?: boolean | "contain";
  /** Graduations en multiples de π/2 sur l'axe des abscisses. */
  piTicks?: boolean;
  showGrid?: boolean;
  xLabel?: string;
  yLabel?: string;
  children?: ReactNode;
  className?: string;
}

export function Graph({
  initial,
  height = 380,
  equalAspect = false,
  piTicks = false,
  showGrid = true,
  xLabel = "x",
  yLabel = "y",
  children,
  className = "",
}: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);
  const [rawView, setRawView] = useState<ViewBox>(initial);
  const [focused, setFocused] = useState(false);
  const clipId = useId().replace(/:/g, "");

  // Largeur responsive
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const view = useMemo<ViewBox>(() => {
    if (!equalAspect || !width) return rawView;
    const yr = ((rawView.xMax - rawView.xMin) * height) / width;
    if (equalAspect === "contain" && yr < rawView.yMax - rawView.yMin) {
      const xr = ((rawView.yMax - rawView.yMin) * width) / height;
      const cx = (rawView.xMin + rawView.xMax) / 2;
      return { ...rawView, xMin: cx - xr / 2, xMax: cx + xr / 2 };
    }
    const cy = (rawView.yMin + rawView.yMax) / 2;
    return { ...rawView, yMin: cy - yr / 2, yMax: cy + yr / 2 };
  }, [rawView, equalAspect, width, height]);

  const sx = useCallback((x: number) => ((x - view.xMin) / (view.xMax - view.xMin)) * width, [view, width]);
  const sy = useCallback((y: number) => height - ((y - view.yMin) / (view.yMax - view.yMin)) * height, [view, height]);
  const toWorld = useCallback(
    (px: number, py: number): [number, number] => [
      view.xMin + (px / width) * (view.xMax - view.xMin),
      view.yMin + ((height - py) / height) * (view.yMax - view.yMin),
    ],
    [view, width, height],
  );

  // ── Déplacement & pincement ──
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ startView: ViewBox; startX: number; startY: number; startDist?: number } | null>(null);

  const localPoint = (e: { clientX: number; clientY: number }) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setFocused(true);
    svgRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, localPoint(e));
    const pts = [...pointers.current.values()];
    if (pts.length === 1) {
      gesture.current = { startView: view, startX: pts[0].x, startY: pts[0].y };
    } else if (pts.length === 2) {
      const [a, b] = pts;
      gesture.current = {
        startView: view,
        startX: (a.x + b.x) / 2,
        startY: (a.y + b.y) / 2,
        startDist: Math.hypot(a.x - b.x, a.y - b.y),
      };
    }
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, localPoint(e));
    const g = gesture.current;
    const v = g.startView;
    const kx = (v.xMax - v.xMin) / width;
    const ky = (v.yMax - v.yMin) / height;
    const pts = [...pointers.current.values()];
    if (pts.length === 1) {
      const dx = (pts[0].x - g.startX) * kx;
      const dy = (pts[0].y - g.startY) * ky;
      setRawView({ xMin: v.xMin - dx, xMax: v.xMax - dx, yMin: v.yMin + dy, yMax: v.yMax + dy });
    } else if (pts.length === 2 && g.startDist) {
      const [a, b] = pts;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = v.xMin + g.startX * kx;
      const cy = v.yMin + (height - g.startY) * ky;
      setRawView(zoomAround(v, cx, cy, g.startDist / Math.max(dist, 1)));
    }
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
    const pts = [...pointers.current.values()];
    gesture.current = pts.length === 1 ? { startView: view, startX: pts[0].x, startY: pts[0].y } : null;
  };

  // ── Zoom molette (uniquement après un clic sur le graphe, pour ne pas bloquer le défilement de la page) ──
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      if (!focused && !e.ctrlKey) return;
      e.preventDefault();
      const { x, y } = localPoint(e);
      const [wx, wy] = toWorld(x, y);
      setRawView((v) => zoomAround(v, wx, wy, e.deltaY > 0 ? 1.12 : 1 / 1.12));
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [focused, toWorld]);

  useEffect(() => {
    if (!focused) return;
    const onDocDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, [focused]);

  const zoomCenter = (factor: number) =>
    setRawView((v) => zoomAround(v, (v.xMin + v.xMax) / 2, (v.yMin + v.yMax) / 2, factor));

  const ctx = useMemo<GraphContextValue>(
    () => ({ view, width, height, sx, sy, toWorld, svgRef }),
    [view, width, height, sx, sy, toWorld],
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 ${focused ? "ring-2 ring-violet-500/40" : ""} ${className}`}
      style={{ height }}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="block cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={width} height={height} />
          </clipPath>
        </defs>
        {width > 0 && (
          <GraphContext.Provider value={ctx}>
            <Axes showGrid={showGrid} piTicks={piTicks} xLabel={xLabel} yLabel={yLabel} />
            <g clipPath={`url(#${clipId})`}>{children}</g>
          </GraphContext.Provider>
        )}
      </svg>

      <div className="absolute right-2 top-2 flex flex-col gap-1">
        {[
          { icon: <Plus size={16} />, label: "Zoomer", run: () => zoomCenter(1 / 1.4) },
          { icon: <Minus size={16} />, label: "Dézoomer", run: () => zoomCenter(1.4) },
          { icon: <Maximize2 size={14} />, label: "Recentrer", run: () => setRawView(initial) },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            title={b.label}
            aria-label={b.label}
            onClick={b.run}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-slate-900/80 text-slate-300 backdrop-blur transition hover:bg-violet-600 hover:text-white"
          >
            {b.icon}
          </button>
        ))}
      </div>
      {!focused && (
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-slate-900/70 px-2 py-1 text-[11px] text-slate-400">
          Glisse pour te déplacer · clique puis molette pour zoomer
        </div>
      )}
    </div>
  );
}

function Axes({ showGrid, piTicks, xLabel, yLabel }: { showGrid: boolean; piTicks: boolean; xLabel: string; yLabel: string }) {
  const { view, width, height, sx, sy } = useGraph();
  const xStep = piTicks ? (Math.PI / 2) * Math.max(1, Math.round(niceStep(view.xMax - view.xMin, width) / (Math.PI / 2))) : niceStep(view.xMax - view.xMin, width);
  const yStep = niceStep(view.yMax - view.yMin, height);

  const xs: number[] = [];
  for (let x = Math.ceil(view.xMin / xStep) * xStep; x <= view.xMax; x += xStep) xs.push(x);
  const ys: number[] = [];
  for (let y = Math.ceil(view.yMin / yStep) * yStep; y <= view.yMax; y += yStep) ys.push(y);

  // Position des axes (collés au bord si l'origine est hors champ)
  const ax = Math.min(Math.max(sy(0), 0), height);
  const ay = Math.min(Math.max(sx(0), 0), width);
  const labelY = ax > height - 20 ? ax - 6 : ax + 14;
  const labelX = ay < 30 ? ay + 6 : ay - 6;
  const anchorX = ay < 30 ? "start" : "end";

  return (
    <g fontSize={11} fontFamily="ui-sans-serif, system-ui" pointerEvents="none">
      {showGrid && (
        <g stroke="#334155" strokeOpacity={0.45}>
          {xs.map((x) => <line key={`gx${x}`} x1={sx(x)} x2={sx(x)} y1={0} y2={height} />)}
          {ys.map((y) => <line key={`gy${y}`} x1={0} x2={width} y1={sy(y)} y2={sy(y)} />)}
        </g>
      )}
      <line x1={0} x2={width} y1={ax} y2={ax} stroke="#94a3b8" strokeWidth={1.4} />
      <line x1={ay} x2={ay} y1={0} y2={height} stroke="#94a3b8" strokeWidth={1.4} />
      <g fill="#94a3b8">
        {xs.map((x) => {
          if (Math.abs(x) < xStep / 1e6) return null;
          const label = piTicks ? piLabel(Math.round(x / (Math.PI / 2))) : fmt(x, 4);
          return <text key={`tx${x}`} x={sx(x)} y={labelY} textAnchor="middle">{label}</text>;
        })}
        {ys.map((y) =>
          Math.abs(y) < yStep / 1e6 ? null : (
            <text key={`ty${y}`} x={labelX} y={sy(y) + 4} textAnchor={anchorX}>{fmt(y, 4)}</text>
          ),
        )}
        <text x={width - 8} y={ax - 8} textAnchor="end" fontStyle="italic" fontSize={13} fill="#cbd5e1">{xLabel}</text>
        <text x={ay + 8} y={14} fontStyle="italic" fontSize={13} fill="#cbd5e1">{yLabel}</text>
      </g>
    </g>
  );
}

// ─────────────────────────── Primitives ───────────────────────────

export function Plot({
  f,
  color = COLORS.violet,
  width: strokeWidth = 2.5,
  dashed = false,
  domain,
  opacity = 1,
}: {
  f: (x: number) => number;
  color?: string;
  width?: number;
  dashed?: boolean;
  domain?: [number, number];
  opacity?: number;
}) {
  const { view, width, height, sx, sy } = useGraph();
  const d = useMemo(() => {
    const a = Math.max(view.xMin, domain?.[0] ?? -Infinity);
    const b = Math.min(view.xMax, domain?.[1] ?? Infinity);
    if (a >= b) return "";
    const steps = Math.ceil(((b - a) / (view.xMax - view.xMin)) * width / 1.5);
    let path = "";
    let prev: number | null = null;
    for (let i = 0; i <= steps; i++) {
      const x = a + ((b - a) * i) / steps;
      const y = f(x);
      if (!Number.isFinite(y)) {
        prev = null;
        continue;
      }
      const py = sy(y);
      // Saut vertical énorme = asymptote : on coupe le tracé
      const jump = prev !== null && Math.abs(py - prev) > height * 2;
      const clamped = Math.max(-height * 4, Math.min(height * 5, py));
      path += `${prev === null || jump ? "M" : "L"}${sx(x).toFixed(1)},${clamped.toFixed(1)}`;
      prev = py;
    }
    return path;
  }, [f, view, width, height, sx, sy, domain]);

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeOpacity={opacity}
      strokeDasharray={dashed ? "6 6" : undefined}
      strokeLinejoin="round"
      strokeLinecap="round"
      pointerEvents="none"
    />
  );
}

export function MovablePoint({
  x,
  y,
  onMove,
  color = COLORS.pink,
  constrain,
  snap,
  label,
}: {
  x: number;
  y: number;
  onMove: (x: number, y: number) => void;
  color?: string;
  /** Contraint la position (ex. rester sur une courbe ou un cercle). */
  constrain?: (x: number, y: number) => [number, number];
  /** Pas d'aimantation sur la grille. */
  snap?: number;
  label?: string;
}) {
  const { sx, sy, toWorld, svgRef, view } = useGraph();
  const [dragging, setDragging] = useState(false);

  const move = (nx: number, ny: number) => {
    let px = nx;
    let py = ny;
    if (snap) {
      px = Math.round(px / snap) * snap;
      py = Math.round(py / snap) * snap;
    }
    if (constrain) [px, py] = constrain(px, py);
    // Hors du domaine (ex. ln d'un négatif) : le point reste à sa dernière position valide au lieu de disparaître.
    if (!Number.isFinite(px) || !Number.isFinite(py)) return;
    onMove(px, py);
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!dragging || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const [wx, wy] = toWorld(e.clientX - r.left, e.clientY - r.top);
    move(wx, wy);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = snap ?? (view.xMax - view.xMin) / 100;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step],
    };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    move(x + m[0], y + m[1]);
  };

  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const cx = sx(x);
  const cy = sy(y);

  return (
    <g
      role="slider"
      aria-label={label ? `Point ${label}` : "Point déplaçable"}
      aria-valuetext={`(${fmt(x)} ; ${fmt(y)})`}
      tabIndex={0}
      className="cursor-grab outline-none active:cursor-grabbing"
      onPointerDown={(e) => {
        e.stopPropagation();
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        setDragging(true);
      }}
      onPointerMove={handleMove}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={onKeyDown}
    >
      <circle cx={cx} cy={cy} r={20} fill="transparent" />
      {!dragging && (
        <circle cx={cx} cy={cy} r={9} fill="none" stroke={color} strokeWidth={2} className="qb-pulse" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      )}
      <circle cx={cx} cy={cy} r={dragging ? 9 : 7} fill={color} stroke="#0f172a" strokeWidth={2.5} />
      {label && (
        <text x={cx + 12} y={cy - 10} fill={color} fontSize={14} fontWeight={700} className="qb-label" pointerEvents="none">
          {label}
        </text>
      )}
    </g>
  );
}

export function Point({ x, y, color = COLORS.white, r = 5, label }: { x: number; y: number; color?: string; r?: number; label?: string }) {
  const { sx, sy } = useGraph();
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return (
    <g pointerEvents="none">
      <circle cx={sx(x)} cy={sy(y)} r={r} fill={color} stroke="#0f172a" strokeWidth={2} />
      {label && (
        <text x={sx(x) + 9} y={sy(y) - 9} fill={color} fontSize={13} fontWeight={600} className="qb-label">{label}</text>
      )}
    </g>
  );
}

export function Segment({
  x1, y1, x2, y2, color = COLORS.muted, width = 2, dashed = false, opacity = 1,
}: { x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; dashed?: boolean; opacity?: number }) {
  const { sx, sy } = useGraph();
  if (![x1, y1, x2, y2].every(Number.isFinite)) return null;
  return (
    <line
      x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)}
      stroke={color} strokeWidth={width} strokeOpacity={opacity}
      strokeDasharray={dashed ? "5 5" : undefined} pointerEvents="none" strokeLinecap="round"
    />
  );
}

/** Droite infinie passant par deux points. */
export function Line({ x1, y1, x2, y2, color = COLORS.cyan, width = 2.5, dashed = false }: { x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; dashed?: boolean }) {
  const { view } = useGraph();
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (!len || !Number.isFinite(len)) return null;
  const big = 10 * Math.hypot(view.xMax - view.xMin, view.yMax - view.yMin) + Math.hypot(x1 - (view.xMin + view.xMax) / 2, y1 - (view.yMin + view.yMax) / 2);
  const ux = (dx / len) * big;
  const uy = (dy / len) * big;
  return <Segment x1={x1 - ux} y1={y1 - uy} x2={x1 + ux} y2={y1 + uy} color={color} width={width} dashed={dashed} />;
}

export function Vector({ x1, y1, x2, y2, color = COLORS.cyan, width = 3, label }: { x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; label?: string }) {
  const { sx, sy } = useGraph();
  const ax = sx(x1), ay = sy(y1), bx = sx(x2), by = sy(y2);
  const len = Math.hypot(bx - ax, by - ay);
  if (!Number.isFinite(len) || len < 1) return null;
  const ux = (bx - ax) / len, uy = (by - ay) / len;
  const head = Math.min(14, len * 0.4);
  const p1 = `${bx},${by}`;
  const p2 = `${bx - ux * head - uy * head * 0.5},${by - uy * head + ux * head * 0.5}`;
  const p3 = `${bx - ux * head + uy * head * 0.5},${by - uy * head - ux * head * 0.5}`;
  return (
    <g pointerEvents="none">
      <line x1={ax} y1={ay} x2={bx - ux * head * 0.8} y2={by - uy * head * 0.8} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${p1} ${p2} ${p3}`} fill={color} />
      {label && (
        <text x={(ax + bx) / 2 - uy * 16} y={(ay + by) / 2 + ux * 16} fill={color} fontSize={14} fontWeight={700} textAnchor="middle" className="qb-label">
          {label}
        </text>
      )}
    </g>
  );
}

export function Polygon({ points, fill = COLORS.violet, opacity = 0.2, stroke, strokeWidth = 1.5 }: { points: [number, number][]; fill?: string; opacity?: number; stroke?: string; strokeWidth?: number }) {
  const { sx, sy } = useGraph();
  const valid = points.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (valid.length < 3) return null;
  return (
    <polygon
      points={valid.map(([x, y]) => `${sx(x)},${sy(y)}`).join(" ")}
      fill={fill}
      fillOpacity={opacity}
      stroke={stroke}
      strokeWidth={stroke ? strokeWidth : 0}
      pointerEvents="none"
    />
  );
}

/** Rectangle en coordonnées du repère (h peut être négatif). */
export function Rect({ x, y, w, h, fill = COLORS.violet, opacity = 0.35, stroke }: { x: number; y: number; w: number; h: number; fill?: string; opacity?: number; stroke?: string }) {
  const { sx, sy } = useGraph();
  if (![x, y, w, h].every(Number.isFinite)) return null;
  const px = Math.min(sx(x), sx(x + w));
  const py = Math.min(sy(y), sy(y + h));
  return (
    <rect
      x={px} y={py}
      width={Math.abs(sx(x + w) - sx(x))} height={Math.abs(sy(y + h) - sy(y))}
      fill={fill} fillOpacity={opacity} stroke={stroke} strokeWidth={stroke ? 1.2 : 0} pointerEvents="none"
    />
  );
}

export function Circle({ cx, cy, r, color = COLORS.muted, fill = "none", width = 2, dashed = false }: { cx: number; cy: number; r: number; color?: string; fill?: string; width?: number; dashed?: boolean }) {
  const { sx, sy } = useGraph();
  return (
    <ellipse
      cx={sx(cx)} cy={sy(cy)}
      rx={Math.abs(sx(cx + r) - sx(cx))} ry={Math.abs(sy(cy + r) - sy(cy))}
      stroke={color} strokeWidth={width} fill={fill} strokeDasharray={dashed ? "5 5" : undefined} pointerEvents="none"
    />
  );
}

/** Aire entre la courbe de f et l'axe (ou une autre courbe g) entre a et b. */
export function Area({ f, a, b, g = () => 0, color = COLORS.violet, opacity = 0.25, splitSign = false }: { f: (x: number) => number; a: number; b: number; g?: (x: number) => number; color?: string; opacity?: number; splitSign?: boolean }) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const n = 240;
  const top: [number, number][] = [];
  const bottom: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = lo + ((hi - lo) * i) / n;
    top.push([x, f(x)]);
    bottom.push([x, g(x)]);
  }
  if (!splitSign) return <Polygon points={[...top, ...bottom.reverse()]} fill={color} opacity={opacity} />;
  // Parties positive (couleur) et négative (rouge) séparées
  const pos = top.map(([x, y], i): [number, number] => [x, Math.max(y, bottom[i][1])]);
  const neg = top.map(([x, y], i): [number, number] => [x, Math.min(y, bottom[i][1])]);
  return (
    <>
      <Polygon points={[...pos, ...[...bottom].reverse()]} fill={color} opacity={opacity} />
      <Polygon points={[...neg, ...[...bottom].reverse()]} fill={COLORS.red} opacity={opacity} />
    </>
  );
}

export function Label({ x, y, children, color = COLORS.white, dx = 0, dy = 0, anchor = "start", size = 13 }: { x: number; y: number; children: ReactNode; color?: string; dx?: number; dy?: number; anchor?: "start" | "middle" | "end"; size?: number }) {
  const { sx, sy } = useGraph();
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return (
    <text x={sx(x) + dx} y={sy(y) + dy} fill={color} fontSize={size} fontWeight={600} textAnchor={anchor} className="qb-label" pointerEvents="none">
      {children}
    </text>
  );
}
