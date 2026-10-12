"use client";

import { useState } from "react";
import { Shuffle, Trophy } from "lucide-react";
import { COLORS, Graph, Label, MovablePoint, Plot, Point, Segment } from "@/components/math/Graph";
import { Slider } from "@/components/ui/Slider";
import { Tex } from "@/components/ui/Tex";
import { fmt } from "@/lib/math/parser";
import { LabShell, Panel, Readout, polyTex, texNum } from "./common";

function newChallenge() {
  const r1 = Math.floor(Math.random() * 7) - 4;
  let r2 = r1;
  while (r2 === r1) r2 = Math.floor(Math.random() * 7) - 3;
  return { r1: Math.min(r1, r2), r2: Math.max(r1, r2), up: Math.random() < 0.5 };
}

export default function QuadraticLab() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-2);
  const [c, setC] = useState(-3);
  const [challenge, setChallenge] = useState<ReturnType<typeof newChallenge> | null>(null);

  const f = (x: number) => a * x * x + b * x + c;
  const alpha = -b / (2 * a);
  const beta = f(alpha);
  const delta = b * b - 4 * a * c;
  const roots = delta > 1e-9 ? [(-b - Math.sqrt(delta)) / (2 * a), (-b + Math.sqrt(delta)) / (2 * a)].sort((x, y) => x - y) : Math.abs(delta) <= 1e-9 ? [alpha] : [];

  const moveVertex = (x: number, y: number) => {
    // On garde a et on déplace le sommet : b = -2aα, c = aα² + β
    const nx = Math.round(x * 4) / 4;
    const ny = Math.round(y * 4) / 4;
    setB(Math.round(-2 * a * nx * 100) / 100);
    setC(Math.round((a * nx * nx + ny) * 100) / 100);
  };

  const canonical = `${a === 1 ? "" : a === -1 ? "-" : texNum(a)}\\left(x ${alpha <= 0 ? "+" : "-"} ${texNum(Math.abs(alpha))}\\right)^2 ${beta < 0 ? "-" : "+"} ${texNum(Math.abs(beta))}`;
  const factored =
    roots.length === 2
      ? `${a === 1 ? "" : a === -1 ? "-" : texNum(a)}(x ${roots[0] <= 0 ? "+" : "-"} ${texNum(Math.abs(roots[0]))})(x ${roots[1] <= 0 ? "+" : "-"} ${texNum(Math.abs(roots[1]))})`
      : roots.length === 1
        ? `${a === 1 ? "" : texNum(a)}(x ${alpha <= 0 ? "+" : "-"} ${texNum(Math.abs(alpha))})^2`
        : null;

  const won =
    challenge &&
    roots.length === 2 &&
    Math.abs(roots[0] - challenge.r1) < 0.05 &&
    Math.abs(roots[1] - challenge.r2) < 0.05 &&
    (a > 0) === challenge.up;

  return (
    <LabShell
      graph={
        <Graph initial={{ xMin: -7, xMax: 7, yMin: -7, yMax: 7 }} height={460}>
          <Segment x1={alpha} y1={-1000} x2={alpha} y2={1000} color={COLORS.muted} dashed opacity={0.5} />
          <Plot f={f} color={COLORS.violet} width={3} />
          {challenge && (
            <>
              <Point x={challenge.r1} y={0} color={COLORS.amber} r={7} />
              <Point x={challenge.r2} y={0} color={COLORS.amber} r={7} />
            </>
          )}
          {roots.map((r, i) => (
            <Point key={i} x={r} y={0} color={COLORS.emerald} label={`x${roots.length === 2 ? i + 1 : "₀"} = ${fmt(r)}`} />
          ))}
          <Point x={0} y={c} color={COLORS.cyan} r={4} />
          <Label x={alpha} y={beta} dy={a > 0 ? 24 : -14} anchor="middle" color={COLORS.pink}>
            S({fmt(alpha)} ; {fmt(beta)})
          </Label>
          <MovablePoint x={alpha} y={beta} onMove={moveVertex} />
        </Graph>
      }
      panel={
        <>
          <Panel title="Coefficients">
            <Slider label="a" value={a} min={-3} max={3} step={0.1} onChange={(v) => setA(Math.abs(v) < 0.05 ? (v < 0 ? -0.1 : 0.1) : v)} />
            <Slider label="b" value={b} min={-8} max={8} step={0.1} onChange={setB} color="#22d3ee" />
            <Slider label="c" value={c} min={-8} max={8} step={0.1} onChange={setC} color="#f472b6" />
            <p className="text-xs text-slate-500">Astuce : attrape directement le sommet S pour déplacer la parabole.</p>
          </Panel>

          <Panel title="Formes">
            <div className="space-y-2 rounded-xl bg-slate-950 p-3 text-violet-200">
              <div><span className="text-xs text-slate-500">Développée</span><br /><Tex>{`f(x) = ${polyTex([a, b, c])}`}</Tex></div>
              <div><span className="text-xs text-slate-500">Canonique</span><br /><Tex>{`f(x) = ${canonical}`}</Tex></div>
              {factored && <div><span className="text-xs text-slate-500">Factorisée</span><br /><Tex>{`f(x) = ${factored}`}</Tex></div>}
            </div>
          </Panel>

          <Panel title="Discriminant">
            <Readout label={<Tex>{"\\Delta = b^2 - 4ac"}</Tex>} value={fmt(delta, 3)} color={delta > 0 ? COLORS.emerald : delta < 0 ? COLORS.red : COLORS.amber} />
            <p className="text-sm text-slate-300">
              {delta > 1e-9 && <>Δ &gt; 0 : <b>deux racines</b> <Tex>{"x = \\frac{-b \\pm \\sqrt\\Delta}{2a}"}</Tex>. f est du signe de a à l&apos;extérieur des racines.</>}
              {Math.abs(delta) <= 1e-9 && <>Δ = 0 : <b>une racine double</b> <Tex>{"x_0 = -\\frac{b}{2a}"}</Tex>.</>}
              {delta < -1e-9 && <>Δ &lt; 0 : <b>aucune racine réelle</b>, f est toujours du signe de a.</>}
            </p>
            <Readout label={a > 0 ? "Minimum" : "Maximum"} value={`${fmt(beta)} en x = ${fmt(alpha)}`} color={COLORS.pink} />
          </Panel>

          <Panel title="Défi">
            {challenge ? (
              <>
                <p className="text-sm text-slate-300">
                  Trouve une parabole tournée vers le <b>{challenge.up ? "haut" : "bas"}</b> dont les racines sont <b className="text-amber-300">{challenge.r1}</b> et <b className="text-amber-300">{challenge.r2}</b>.
                </p>
                {won ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/15 p-3 text-emerald-300">
                    <span className="flex items-center gap-2 font-semibold"><Trophy size={18} /> Réussi !</span>
                    <button type="button" className="text-sm underline" onClick={() => setChallenge(newChallenge())}>Suivant</button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Indice : le sommet est à mi-chemin des deux racines.</p>
                )}
              </>
            ) : (
              <button type="button" onClick={() => setChallenge(newChallenge())} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/20 py-2 font-semibold text-amber-300 hover:bg-amber-500/30">
                <Shuffle size={16} /> Lancer un défi
              </button>
            )}
          </Panel>
        </>
      }
    />
  );
}
