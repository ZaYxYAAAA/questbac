"use client";

import { useMemo, useState } from "react";
import { COLORS, Graph, Plot, Point, Segment } from "@/components/math/Graph";
import { Slider } from "@/components/ui/Slider";
import { Tex } from "@/components/ui/Tex";
import { fmt, tryCompile } from "@/lib/math/parser";
import { Chips, LabShell, Panel, Readout, texNum } from "./common";

type Mode = "arith" | "geo" | "recur";

export default function SequenceLab() {
  const [mode, setMode] = useState<Mode>("geo");
  const [u0, setU0] = useState(1);
  const [r, setR] = useState(0.8);
  const [q, setQ] = useState(1.3);
  const [expr, setExpr] = useState("0.5x + 2");
  const [count, setCount] = useState(15);

  const compiled = useMemo(() => tryCompile(expr), [expr]);
  const f = useMemo(
    () => (compiled.ok ? (x: number) => compiled.expr.evaluate({ x }) : () => NaN),
    [compiled],
  );

  const terms = useMemo(() => {
    const out: number[] = [u0];
    for (let n = 1; n < count; n++) {
      const prev = out[n - 1];
      out.push(mode === "arith" ? prev + r : mode === "geo" ? prev * q : f(prev));
    }
    return out;
  }, [mode, u0, r, q, f, count]);

  const sum = terms.reduce((s, t) => s + t, 0);
  const last = terms[terms.length - 1];
  const before = terms[terms.length - 2];
  const converging = Number.isFinite(last) && Math.abs(last - before) < 1e-3;
  const finite = terms.filter(Number.isFinite);
  const yMax = Math.min(60, Math.max(4, ...finite.map((t) => Math.abs(t))) * 1.2);

  const formula =
    mode === "arith"
      ? `u_n = ${texNum(u0)} + ${texNum(r)}n`
      : mode === "geo"
        ? `u_n = ${texNum(u0)} \\times ${texNum(q)}^n`
        : `u_{n+1} = f(u_n),\\ u_0 = ${texNum(u0)}`;

  return (
    <LabShell
      graph={
        <>
          <Graph key={`${mode}-${count}-${Math.round(yMax)}`} initial={{ xMin: -1, xMax: count + 1, yMin: -yMax * 0.35, yMax }} height={mode === "recur" ? 300 : 460} xLabel="n" yLabel="uₙ">
            {terms.map((t, n) =>
              Number.isFinite(t) ? (
                <g key={n}>
                  <Segment x1={n} y1={0} x2={n} y2={t} color={COLORS.violet} opacity={0.35} />
                  <Point x={n} y={t} color={COLORS.violet} r={4.5} />
                </g>
              ) : null,
            )}
            {converging && <Segment x1={-100} y1={last} x2={1000} y2={last} color={COLORS.emerald} dashed />}
          </Graph>
          {mode === "recur" && (
            <Graph key={`cob-${Math.round(yMax)}`} initial={{ xMin: -1, xMax: Math.max(6, yMax * 0.9), yMin: -1, yMax: Math.max(6, yMax * 0.9) }} height={340} equalAspect yLabel="y">
              <Plot f={(x) => x} color={COLORS.muted} dashed />
              <Plot f={f} color={COLORS.cyan} width={3} />
              {terms.slice(0, -1).map((t, n) => {
                const next = terms[n + 1];
                if (!Number.isFinite(t) || !Number.isFinite(next)) return null;
                return (
                  <g key={n}>
                    <Segment x1={t} y1={n === 0 ? 0 : t} x2={t} y2={next} color={COLORS.amber} width={1.6} />
                    <Segment x1={t} y1={next} x2={next} y2={next} color={COLORS.amber} width={1.6} />
                  </g>
                );
              })}
              <Point x={u0} y={0} color={COLORS.pink} label="u₀" />
            </Graph>
          )}
        </>
      }
      panel={
        <>
          <Panel title="Type de suite">
            <Chips<Mode>
              value={mode}
              onChange={setMode}
              options={[
                { value: "arith", label: "Arithmétique" },
                { value: "geo", label: "Géométrique" },
                { value: "recur", label: "u(n+1) = f(u(n))" },
              ]}
            />
            <div className="rounded-xl bg-slate-950 py-2 text-center text-violet-200"><Tex>{formula}</Tex></div>
            <Slider label="u₀" value={u0} min={-5} max={10} step={0.1} onChange={setU0} />
            {mode === "arith" && <Slider label="Raison r" value={r} min={-3} max={3} step={0.1} onChange={setR} color="#22d3ee" />}
            {mode === "geo" && <Slider label="Raison q" value={q} min={-2} max={2} step={0.05} onChange={setQ} color="#22d3ee" />}
            {mode === "recur" && (
              <div>
                <label className="mb-1 block text-sm text-slate-300">f(x) =</label>
                <input
                  value={expr}
                  onChange={(e) => setExpr(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 font-mono text-sm text-white outline-none focus:border-violet-400"
                />
                {!compiled.ok && <p className="mt-1 text-xs text-rose-400">{compiled.error}</p>}
                <p className="mt-1 text-xs text-slate-500">Essaie <code>sqrt(x+6)</code>, <code>2x(1-x)</code> avec u₀ = 0,2, ou <code>3.5x(1-x)</code>…</p>
              </div>
            )}
            <Slider label="Nombre de termes" value={count} min={5} max={40} step={1} onChange={setCount} color="#f472b6" format={(v) => String(v)} />
          </Panel>

          <Panel title="Observations">
            <Readout label={`u${count - 1}`} value={fmt(last, 4)} />
            <Readout label={`Somme des ${count} premiers termes`} value={fmt(sum, 3)} />
            <p className={`rounded-lg px-3 py-2 text-sm ${converging ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800/60 text-slate-400"}`}>
              {converging
                ? `La suite semble converger vers ${fmt(last, 4)}.`
                : !Number.isFinite(last) || Math.abs(last) > 1e6
                  ? "La suite semble diverger."
                  : "Pas de convergence visible sur ces termes."}
            </p>
            {mode === "geo" && (
              <p className="text-xs text-slate-500">
                Rappel : si |q| &lt; 1 la suite tend vers 0 ; si q &gt; 1 et u₀ &gt; 0 elle tend vers +∞ ; si q &lt; −1 elle diverge en alternant.
              </p>
            )}
          </Panel>

          <Panel title="Premiers termes">
            <div className="grid max-h-56 grid-cols-2 gap-1 overflow-auto font-mono text-xs">
              {terms.map((t, n) => (
                <div key={n} className="flex justify-between rounded bg-slate-800/60 px-2 py-1">
                  <span className="text-slate-400">u{n}</span>
                  <span className="text-white">{fmt(t, 4)}</span>
                </div>
              ))}
            </div>
          </Panel>
        </>
      }
    />
  );
}
