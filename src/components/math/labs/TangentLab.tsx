"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play } from "lucide-react";
import { COLORS, Graph, Line, MovablePoint, Plot, Point, Segment } from "@/components/math/Graph";
import { Slider } from "@/components/ui/Slider";
import { Tex } from "@/components/ui/Tex";
import { derivative, fmt, tryCompile } from "@/lib/math/parser";
import { Chips, LabShell, Panel, Readout, Toggle, polyTex } from "./common";

const PRESETS = {
  carre: { label: "x²", expr: "x^2" },
  cube: { label: "x³ − 3x", expr: "x^3-3x" },
  sin: { label: "sin x", expr: "sin(x)" },
  exp: { label: "eˣ", expr: "e^x" },
  ln: { label: "ln x", expr: "ln(x)" },
  inv: { label: "1/x", expr: "1/x" },
  perso: { label: "Perso", expr: "" },
} as const;
type PresetKey = keyof typeof PRESETS;

export default function TangentLab() {
  const [preset, setPreset] = useState<PresetKey>("cube");
  const [custom, setCustom] = useState("x^3/3 - x");
  const [a, setA] = useState(1.5);
  const [h, setH] = useState(1.5);
  const [showDerivative, setShowDerivative] = useState(false);
  const [showSecant, setShowSecant] = useState(true);
  const anim = useRef(0);

  const source = preset === "perso" ? custom : PRESETS[preset].expr;
  const compiled = useMemo(() => tryCompile(source), [source]);
  const f = useMemo(
    () => (compiled.ok ? (x: number) => compiled.expr.evaluate({ x }) : () => NaN),
    [compiled],
  );
  const fp = useMemo(() => (x: number) => derivative(f, x), [f]);

  const fa = f(a);
  const slope = fp(a);
  const secantSlope = (f(a + h) - fa) / h;
  const intercept = fa - slope * a;

  // Animation : h décroît vers 0
  const animate = () => {
    cancelAnimationFrame(anim.current);
    setShowSecant(true);
    const start = performance.now();
    const h0 = 2;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 2500);
      setH(Math.max(0.01, h0 * Math.pow(1 - k, 2.2)));
      if (k < 1) anim.current = requestAnimationFrame(tick);
    };
    anim.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  return (
    <LabShell
      graph={
        <Graph initial={{ xMin: -5, xMax: 5, yMin: -4, yMax: 4 }} height={460}>
          {showDerivative && <Plot f={fp} color={COLORS.amber} dashed width={2} />}
          <Plot f={f} color={COLORS.violet} width={3} />
          {Number.isFinite(fa) && Number.isFinite(slope) && (
            <Line x1={a} y1={fa} x2={a + 1} y2={fa + slope} color={COLORS.cyan} />
          )}
          {showSecant && Number.isFinite(secantSlope) && (
            <>
              <Line x1={a} y1={fa} x2={a + h} y2={f(a + h)} color={COLORS.pink} width={1.8} dashed />
              <Segment x1={a} y1={fa} x2={a + h} y2={fa} color={COLORS.muted} dashed />
              <Segment x1={a + h} y1={fa} x2={a + h} y2={f(a + h)} color={COLORS.muted} dashed />
              <Point x={a + h} y={f(a + h)} color={COLORS.pink} label="N" />
            </>
          )}
          {showDerivative && <Point x={a} y={slope} color={COLORS.amber} r={4} />}
          <MovablePoint x={a} y={fa} label="M" onMove={(x) => setA(x)} constrain={(x) => [x, f(x)]} />
        </Graph>
      }
      panel={
        <>
          <Panel title="Fonction">
            <Chips value={preset} onChange={setPreset} options={(Object.keys(PRESETS) as PresetKey[]).map((k) => ({ value: k, label: PRESETS[k].label }))} />
            {preset === "perso" && (
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 font-mono text-sm text-white outline-none focus:border-violet-400"
              />
            )}
            {!compiled.ok && <p className="text-xs text-rose-400">{compiled.error}</p>}
            <Toggle checked={showDerivative} onChange={setShowDerivative}>Tracer la fonction dérivée f′</Toggle>
          </Panel>

          <Panel title="De la sécante à la tangente">
            <Toggle checked={showSecant} onChange={setShowSecant}>Afficher la sécante (MN)</Toggle>
            <Slider label="h" value={h} min={0.01} max={3} step={0.01} onChange={setH} color="#f472b6" />
            <button type="button" onClick={animate} className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-500/20 py-2 text-sm font-semibold text-pink-300 hover:bg-pink-500/30">
              <Play size={14} /> Faire tendre h vers 0
            </button>
            <Readout label={<Tex>{"\\frac{f(a+h)-f(a)}{h}"}</Tex>} value={fmt(secantSlope, 4)} color={COLORS.pink} />
            <Readout label={<>Nombre dérivé <Tex>{"f'(a)"}</Tex></>} value={fmt(slope, 4)} color={COLORS.cyan} />
            <p className="text-xs text-slate-500">Quand h → 0, le taux d&apos;accroissement tend vers f′(a) : la sécante devient la tangente.</p>
          </Panel>

          <Panel title="Tangente en M">
            <Readout label="a" value={fmt(a, 3)} />
            <Readout label="f(a)" value={fmt(fa, 3)} />
            <div className="rounded-xl bg-slate-950 p-3 text-center text-cyan-300">
              <Tex>{"y = f'(a)(x - a) + f(a)"}</Tex>
              <div className="mt-2 text-lg">
                <Tex>{Number.isFinite(slope) ? `y = ${polyTex([slope, intercept])}` : "\\text{non définie}"}</Tex>
              </div>
            </div>
          </Panel>
        </>
      }
    />
  );
}
