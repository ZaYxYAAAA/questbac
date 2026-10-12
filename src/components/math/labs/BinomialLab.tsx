"use client";

import { useMemo, useState } from "react";
import { COLORS, Graph, Rect, Segment } from "@/components/math/Graph";
import { Slider } from "@/components/ui/Slider";
import { Tex } from "@/components/ui/Tex";
import { fmt } from "@/lib/math/parser";
import { Chips, LabShell, Panel, Readout } from "./common";

type Mode = "eq" | "le" | "ge";

export function binomialPmf(n: number, p: number): number[] {
  const out: number[] = [];
  let coef = 1; // C(n, k) calculé de proche en proche
  for (let k = 0; k <= n; k++) {
    if (k > 0) coef = (coef * (n - k + 1)) / k;
    out.push(coef * Math.pow(p, k) * Math.pow(1 - p, n - k));
  }
  return out;
}

export default function BinomialLab() {
  const [n, setN] = useState(20);
  const [p, setP] = useState(0.35);
  const [k, setK] = useState(7);
  const [mode, setMode] = useState<Mode>("eq");

  const pmf = useMemo(() => binomialPmf(n, p), [n, p]);
  const kk = Math.min(k, n);
  const prob = mode === "eq" ? pmf[kk] : mode === "le" ? pmf.slice(0, kk + 1).reduce((s, v) => s + v, 0) : pmf.slice(kk).reduce((s, v) => s + v, 0);
  const mean = n * p;
  const variance = n * p * (1 - p);
  const sigma = Math.sqrt(variance);
  const maxP = Math.max(...pmf);
  const yTop = Math.max(0.05, Math.ceil(maxP * 1.25 * 20) / 20);

  const highlighted = (i: number) => (mode === "eq" ? i === kk : mode === "le" ? i <= kk : i >= kk);

  return (
    <LabShell
      graph={
        <Graph key={`${n}-${yTop}`} initial={{ xMin: -1.5, xMax: n + 1.5, yMin: -yTop * 0.12, yMax: yTop }} height={460} xLabel="k" yLabel="P(X = k)">
          <Rect x={mean - 2 * sigma} y={0} w={4 * sigma} h={yTop * 2} fill={COLORS.emerald} opacity={0.06} />
          {pmf.map((v, i) => (
            <Rect key={i} x={i - 0.4} y={0} w={0.8} h={v} fill={highlighted(i) ? COLORS.amber : COLORS.violet} opacity={highlighted(i) ? 0.85 : 0.45} stroke={highlighted(i) ? COLORS.amber : undefined} />
          ))}
          <Segment x1={mean} y1={0} x2={mean} y2={yTop * 2} color={COLORS.emerald} dashed width={2} />
        </Graph>
      }
      panel={
        <>
          <Panel title="Paramètres">
            <div className="rounded-xl bg-slate-950 py-2 text-center text-violet-200">
              <Tex>{`X \\sim \\mathcal{B}(${n}\\,;\\,${fmt(p).replace(",", "{,}")})`}</Tex>
            </div>
            <Slider label="n (nombre d'épreuves)" value={n} min={1} max={60} step={1} onChange={setN} format={(v) => String(v)} />
            <Slider label="p (probabilité de succès)" value={p} min={0} max={1} step={0.01} onChange={setP} color="#22d3ee" />
          </Panel>
          <Panel title="Calcul de probabilité">
            <Chips<Mode> value={mode} onChange={setMode} options={[{ value: "eq", label: "P(X = k)" }, { value: "le", label: "P(X ≤ k)" }, { value: "ge", label: "P(X ≥ k)" }]} />
            <Slider label="k" value={kk} min={0} max={n} step={1} onChange={setK} color="#fbbf24" format={(v) => String(v)} />
            <Readout label={mode === "eq" ? `P(X = ${kk})` : mode === "le" ? `P(X ≤ ${kk})` : `P(X ≥ ${kk})`} value={fmt(prob, 4)} color={COLORS.amber} />
            {mode === "eq" && (
              <div className="rounded-xl bg-slate-950 p-2 text-center text-sm text-slate-200">
                <Tex>{`\\binom{${n}}{${kk}}\\,p^{${kk}}(1-p)^{${n - kk}}`}</Tex>
              </div>
            )}
          </Panel>
          <Panel title="Indicateurs">
            <Readout label={<Tex>{"E(X) = np"}</Tex>} value={fmt(mean, 3)} color={COLORS.emerald} />
            <Readout label={<Tex>{"V(X) = np(1-p)"}</Tex>} value={fmt(variance, 3)} />
            <Readout label={<Tex>{"\\sigma(X)"}</Tex>} value={fmt(sigma, 3)} />
            <p className="text-xs text-slate-500">La zone verte représente [E − 2σ ; E + 2σ], où se concentre l&apos;essentiel de la loi.</p>
          </Panel>
        </>
      }
    />
  );
}
