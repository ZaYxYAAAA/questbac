"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Plus, Trash2 } from "lucide-react";
import { CURVE_COLORS, Graph, MovablePoint, Plot, Point } from "@/components/math/Graph";
import { Slider } from "@/components/ui/Slider";
import { derivative, fmt, tryCompile } from "@/lib/math/parser";
import { LabShell, Panel, Readout, Toggle } from "./common";

interface Curve {
  id: number;
  expr: string;
  showDerivative: boolean;
}

const PRESETS = [
  { label: "a·sin(bx + c)", expr: "a*sin(b*x+c)" },
  { label: "a(x − h)² + k", expr: "a(x-h)^2+k" },
  { label: "x³ − 3x", expr: "x^3-3x" },
  { label: "e^(kx)", expr: "e^(k*x)" },
  { label: "ln(x)", expr: "ln(x)" },
  { label: "1/(x − a)", expr: "1/(x-a)" },
  { label: "√x", expr: "sqrt(x)" },
  { label: "|x − a|", expr: "abs(x-a)" },
];

const DEFAULT_PARAMS: Record<string, number> = { a: 1, b: 1, c: 0, h: 0, k: 1 };

let nextId = 3;

export default function FreePlotter() {
  const [curves, setCurves] = useState<Curve[]>([
    { id: 1, expr: "a*sin(b*x+c)", showDerivative: false },
    { id: 2, expr: "x^2/4-1", showDerivative: false },
  ]);
  const [params, setParams] = useState<Record<string, number>>(DEFAULT_PARAMS);
  const [animated, setAnimated] = useState<string | null>(null);
  const [traceX, setTraceX] = useState(1);

  const compiled = useMemo(() => curves.map((c) => ({ curve: c, result: tryCompile(c.expr) })), [curves]);
  const paramNames = useMemo(() => {
    const set = new Set<string>();
    for (const { result } of compiled) if (result.ok) result.expr.params.forEach((p) => set.add(p));
    return [...set].sort();
  }, [compiled]);

  // Animation d'un paramètre (oscillation entre -5 et 5)
  const frame = useRef<number>(0);
  useEffect(() => {
    if (!animated) return;
    const start = performance.now();
    const base = params[animated] ?? 1;
    const tick = (t: number) => {
      const v = Math.round((base + 3 * Math.sin((t - start) / 900)) * 100) / 100;
      setParams((p) => ({ ...p, [animated]: Math.max(-5, Math.min(5, v)) }));
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  // Un paramètre tapé par l'élève (« m*x ») vaut 1, comme son curseur, tant qu'on ne l'a pas réglé.
  const values = Object.fromEntries(paramNames.map((name) => [name, params[name] ?? 1]));
  const fns = compiled.map(({ result }) =>
    result.ok ? (x: number) => result.expr.evaluate({ ...values, x }) : null,
  );
  const first = fns.find((f): f is (x: number) => number => f !== null) ?? null;
  const traceY = first ? first(traceX) : NaN;

  const update = (id: number, patch: Partial<Curve>) =>
    setCurves((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <LabShell
      graph={
        <>
          <Graph initial={{ xMin: -8, xMax: 8, yMin: -5, yMax: 5 }} height={460}>
            {compiled.map(({ curve }, i) => {
              const f = fns[i];
              if (!f) return null;
              const color = CURVE_COLORS[i % CURVE_COLORS.length];
              return (
                <g key={curve.id}>
                  <Plot f={f} color={color} />
                  {curve.showDerivative && <Plot f={(x) => derivative(f, x)} color={color} dashed width={2} opacity={0.8} />}
                </g>
              );
            })}
            {first && Number.isFinite(traceY) && (
              <>
                <Point x={traceX} y={0} color="#64748b" r={3} />
                <MovablePoint
                  x={traceX}
                  y={traceY}
                  label="M"
                  onMove={(x) => setTraceX(x)}
                  constrain={(x) => [x, first(x)]}
                />
              </>
            )}
          </Graph>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.expr}
                type="button"
                // 6 courbes au plus : on n'écrase pas en silence une fonction déjà tapée.
                disabled={curves.length >= 6}
                onClick={() => setCurves((cs) => (cs.length >= 6 ? cs : [...cs, { id: nextId++, expr: p.expr, showDerivative: false }]))}
                className="rounded-lg border border-white/10 bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-300 hover:border-violet-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                + {p.label}
              </button>
            ))}
          </div>
        </>
      }
      panel={
        <>
          <Panel title="Fonctions">
            {compiled.map(({ curve, result }, i) => (
              <div key={curve.id} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: CURVE_COLORS[i % CURVE_COLORS.length] }} />
                  <span className="font-mono text-sm text-slate-400">f{i + 1}(x) =</span>
                  <input
                    value={curve.expr}
                    onChange={(e) => update(curve.id, { expr: e.target.value })}
                    spellCheck={false}
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950 px-2 py-1 font-mono text-sm text-white outline-none focus:border-violet-400"
                  />
                  <button
                    type="button"
                    aria-label="Supprimer la courbe"
                    onClick={() => setCurves((cs) => cs.filter((c) => c.id !== curve.id))}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {!result.ok ? (
                  <p className="pl-5 text-xs text-rose-400">{result.error}</p>
                ) : (
                  <div className="pl-5">
                    <Toggle checked={curve.showDerivative} onChange={(v) => update(curve.id, { showDerivative: v })}>
                      Afficher la dérivée f{i + 1}′ (pointillés)
                    </Toggle>
                  </div>
                )}
              </div>
            ))}
            {curves.length < 6 && (
              <button
                type="button"
                onClick={() => setCurves((cs) => [...cs, { id: nextId++, expr: "", showDerivative: false }])}
                className="flex items-center gap-1 text-sm font-medium text-violet-300 hover:text-violet-200"
              >
                <Plus size={16} /> Ajouter une fonction
              </button>
            )}
            <p className="text-xs text-slate-500">
              Syntaxe : <code>2x^2</code>, <code>sin(x)</code>, <code>e^x</code>, <code>ln(x)</code>, <code>sqrt(x)</code>, <code>abs(x)</code>, <code>pi</code>. Toute autre lettre devient un paramètre réglable.
            </p>
          </Panel>

          {paramNames.length > 0 && (
            <Panel title="Paramètres">
              {paramNames.map((name) => (
                <div key={name} className="flex items-end gap-2">
                  <div className="flex-1">
                    <Slider
                      label={<span className="font-mono">{name}</span>}
                      value={params[name] ?? 1}
                      min={-5}
                      max={5}
                      step={0.05}
                      onChange={(v) => setParams((p) => ({ ...p, [name]: v }))}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={animated === name ? `Arrêter l'animation de ${name}` : `Animer ${name}`}
                    onClick={() => setAnimated((a) => (a === name ? null : name))}
                    className="mb-0.5 grid h-8 w-8 place-items-center rounded-lg bg-slate-800 text-violet-300 hover:bg-violet-600 hover:text-white"
                  >
                    {animated === name ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                </div>
              ))}
            </Panel>
          )}

          {first && (
            <Panel title="Point M sur f1">
              <Readout label="x" value={fmt(traceX)} />
              <Readout label="f1(x)" value={fmt(traceY)} color={CURVE_COLORS[0]} />
              <Readout label="f1′(x) (pente)" value={fmt(derivative(first, traceX))} />
              <p className="text-xs text-slate-500">Fais glisser M le long de la courbe.</p>
            </Panel>
          )}
        </>
      }
    />
  );
}
