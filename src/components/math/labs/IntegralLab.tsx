"use client";

import { useMemo, useState } from "react";
import { Area, COLORS, Graph, MovablePoint, Plot, Polygon, Rect, Segment } from "@/components/math/Graph";
import { Slider } from "@/components/ui/Slider";
import { Tex } from "@/components/ui/Tex";
import { fmt, integrate } from "@/lib/math/parser";
import { Chips, LabShell, Panel, Readout, Toggle, compileX } from "./common";

const PRESETS = {
  carre: { label: "x²/2", expr: "x^2/2" },
  sin: { label: "sin x + 1", expr: "sin(x)+1" },
  cube: { label: "x³/4 − x", expr: "x^3/4 - x" },
  gauss: { label: "3e^(−x²)", expr: "3e^(-x^2)" },
  perso: { label: "Perso", expr: "" },
} as const;
type PresetKey = keyof typeof PRESETS;
type Method = "gauche" | "droite" | "milieu" | "trapezes";

export default function IntegralLab() {
  const [preset, setPreset] = useState<PresetKey>("carre");
  const [custom, setCustom] = useState("sqrt(x)");
  const [a, setA] = useState(0);
  const [b, setB] = useState(3);
  const [n, setN] = useState(6);
  const [method, setMethod] = useState<Method>("gauche");
  const [showMean, setShowMean] = useState(false);

  const source = preset === "perso" ? custom : PRESETS[preset].expr;
  const compiled = useMemo(() => compileX(source), [source]);
  const f = useMemo(() => (compiled.ok ? (x: number) => compiled.expr.evaluate({ x }) : () => NaN), [compiled]);

  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const sign = a <= b ? 1 : -1;
  const dx = (hi - lo) / n;

  const pieces = useMemo(() => {
    const out: { x: number; h: number; h2?: number }[] = [];
    for (let i = 0; i < n; i++) {
      const x = lo + i * dx;
      if (method === "trapezes") out.push({ x, h: f(x), h2: f(x + dx) });
      else out.push({ x, h: f(method === "gauche" ? x : method === "droite" ? x + dx : x + dx / 2) });
    }
    return out;
  }, [f, lo, dx, n, method]);

  const approx = sign * pieces.reduce((s, p) => s + (p.h2 !== undefined ? ((p.h + p.h2) / 2) * dx : p.h * dx), 0);
  const exact = integrate(f, a, b, 2000);
  const mean = hi > lo ? exact / (b - a) : NaN;

  return (
    <LabShell
      graph={
        <Graph initial={{ xMin: -2, xMax: 6, yMin: -2.5, yMax: 5 }} height={460}>
          <Area f={f} a={lo} b={hi} color={COLORS.violet} opacity={0.15} splitSign />
          {pieces.map((p, i) =>
            p.h2 !== undefined ? (
              <Polygon key={i} points={[[p.x, 0], [p.x, p.h], [p.x + dx, p.h2], [p.x + dx, 0]]} fill={COLORS.amber} opacity={0.3} stroke={COLORS.amber} />
            ) : (
              <Rect key={i} x={p.x} y={0} w={dx} h={p.h} fill={p.h >= 0 ? COLORS.amber : COLORS.red} opacity={0.3} stroke={p.h >= 0 ? COLORS.amber : COLORS.red} />
            ),
          )}
          <Plot f={f} color={COLORS.violet} width={3} />
          {showMean && Number.isFinite(mean) && <Segment x1={lo} y1={mean} x2={hi} y2={mean} color={COLORS.emerald} width={2.5} dashed />}
          <Segment x1={a} y1={0} x2={a} y2={f(a)} color={COLORS.cyan} dashed />
          <Segment x1={b} y1={0} x2={b} y2={f(b)} color={COLORS.pink} dashed />
          <MovablePoint x={a} y={0} label="a" color={COLORS.cyan} snap={0.25} onMove={(x) => setA(x)} constrain={(x) => [x, 0]} />
          <MovablePoint x={b} y={0} label="b" color={COLORS.pink} snap={0.25} onMove={(x) => setB(x)} constrain={(x) => [x, 0]} />
        </Graph>
      }
      panel={
        <>
          <Panel title="Fonction">
            <Chips value={preset} onChange={setPreset} options={(Object.keys(PRESETS) as PresetKey[]).map((k) => ({ value: k, label: PRESETS[k].label }))} />
            {preset === "perso" && (
              <input value={custom} onChange={(e) => setCustom(e.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 font-mono text-sm text-white outline-none focus:border-violet-400" />
            )}
            {!compiled.ok && <p className="text-xs text-rose-400">{compiled.error}</p>}
          </Panel>
          <Panel title="Somme de Riemann">
            <Chips<Method>
              value={method}
              onChange={setMethod}
              options={[
                { value: "gauche", label: "Rectangles à gauche" },
                { value: "droite", label: "à droite" },
                { value: "milieu", label: "au milieu" },
                { value: "trapezes", label: "Trapèzes" },
              ]}
            />
            <Slider label="Nombre de subdivisions n" value={n} min={1} max={100} step={1} onChange={setN} color="#fbbf24" format={(v) => String(v)} />
            <Readout label="Approximation" value={fmt(approx, 5)} color={COLORS.amber} />
            <Readout label={<Tex>{`\\int_{${fmt(a).replace(",", "{,}")}}^{${fmt(b).replace(",", "{,}")}} f(x)\\,dx`}</Tex>} value={fmt(exact, 5)} color={COLORS.violet} />
            <Readout label="Erreur" value={fmt(Math.abs(approx - exact), 5)} color={COLORS.red} />
            <p className="text-xs text-slate-500">Augmente n : l&apos;approximation converge vers l&apos;intégrale. Les trapèzes et le point milieu convergent plus vite !</p>
          </Panel>
          <Panel title="Valeur moyenne">
            <Toggle checked={showMean} onChange={setShowMean}>Afficher la valeur moyenne</Toggle>
            <Readout label={<Tex>{"\\mu = \\frac{1}{b-a}\\int_a^b f"}</Tex>} value={fmt(mean, 4)} color={COLORS.emerald} />
            <p className="text-xs text-slate-500">Le rectangle de hauteur μ a la même aire (algébrique) que la zone sous la courbe.</p>
          </Panel>
        </>
      }
    />
  );
}
