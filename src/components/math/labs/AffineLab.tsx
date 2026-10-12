"use client";

import { useState } from "react";
import { Shuffle, Trophy } from "lucide-react";
import { COLORS, Graph, Label, Line, MovablePoint, Point, Segment } from "@/components/math/Graph";
import { Tex } from "@/components/ui/Tex";
import { fmt } from "@/lib/math/parser";
import { LabShell, Panel, Readout, polyTex } from "./common";

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function newTarget() {
  let m = 0;
  while (m === 0) m = randInt(-3, 3) / (Math.random() < 0.3 ? 2 : 1);
  return { m, p: randInt(-3, 3) };
}

export default function AffineLab() {
  const [A, setA] = useState({ x: -2, y: -1 });
  const [B, setB] = useState({ x: 2, y: 3 });
  const [target, setTarget] = useState<{ m: number; p: number } | null>(null);
  const [wins, setWins] = useState(0);

  const vertical = Math.abs(B.x - A.x) < 1e-9;
  const m = vertical ? NaN : (B.y - A.y) / (B.x - A.x);
  const p = vertical ? NaN : A.y - m * A.x;
  const success = target && !vertical && Math.abs(m - target.m) < 1e-6 && Math.abs(p - target.p) < 1e-6;

  const equation = vertical ? `x = ${fmt(A.x)}` : `y = ${polyTex([m, p])}`;

  return (
    <LabShell
      graph={
        <Graph initial={{ xMin: -7, xMax: 7, yMin: -5, yMax: 5 }} height={460} equalAspect>
          {!vertical && (
            <>
              <Segment x1={A.x} y1={A.y} x2={B.x} y2={A.y} color={COLORS.amber} dashed width={2} />
              <Segment x1={B.x} y1={A.y} x2={B.x} y2={B.y} color={COLORS.emerald} dashed width={2} />
              <Label x={(A.x + B.x) / 2} y={A.y} dy={B.y >= A.y ? 18 : -8} anchor="middle" color={COLORS.amber}>
                Δx = {fmt(B.x - A.x)}
              </Label>
              <Label x={B.x} y={(A.y + B.y) / 2} dx={8} color={COLORS.emerald}>
                Δy = {fmt(B.y - A.y)}
              </Label>
              <Point x={0} y={p} color={COLORS.violet} label={`(0 ; ${fmt(p)})`} />
              {Math.abs(m) > 1e-9 && <Point x={-p / m} y={0} color={COLORS.red} r={4} />}
            </>
          )}
          <Line x1={A.x} y1={A.y} x2={B.x} y2={B.y} color={COLORS.cyan} />
          <MovablePoint x={A.x} y={A.y} label="A" snap={0.5} onMove={(x, y) => setA({ x, y })} />
          <MovablePoint x={B.x} y={B.y} label="B" color={COLORS.amber} snap={0.5} onMove={(x, y) => setB({ x, y })} />
        </Graph>
      }
      panel={
        <>
          <Panel title="Équation de la droite">
            <div className="rounded-xl bg-slate-950 py-3 text-center text-xl text-cyan-300">
              <Tex>{equation}</Tex>
            </div>
            {!vertical ? (
              <>
                <Readout label={<>Coefficient directeur <Tex>{"m = \\frac{\\Delta y}{\\Delta x}"}</Tex></>} value={fmt(m, 3)} color={COLORS.cyan} />
                <Readout label="Ordonnée à l'origine p" value={fmt(p, 3)} color={COLORS.violet} />
                <Readout
                  label="Sens de variation"
                  value={m > 0 ? "croissante ↗" : m < 0 ? "décroissante ↘" : "constante →"}
                />
                {Math.abs(m) > 1e-9 && <Readout label="S'annule en x =" value={fmt(-p / m, 3)} color={COLORS.red} />}
              </>
            ) : (
              <p className="text-sm text-amber-300">Droite verticale : ce n'est pas la courbe d'une fonction affine !</p>
            )}
          </Panel>

          <Panel title="Défi">
            {target ? (
              <>
                <p className="text-sm text-slate-300">Place A et B pour tracer la droite :</p>
                <div className="rounded-xl bg-slate-950 py-2 text-center text-lg text-amber-300">
                  <Tex>{`y = ${polyTex([target.m, target.p])}`}</Tex>
                </div>
                {success ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/15 p-3 text-emerald-300">
                    <span className="flex items-center gap-2 font-semibold"><Trophy size={18} /> Bravo !</span>
                    <button type="button" className="text-sm underline" onClick={() => { setWins((w) => w + 1); setTarget(newTarget()); }}>
                      Défi suivant
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Astuce : place d'abord un point sur l'axe des ordonnées.</p>
                )}
              </>
            ) : (
              <button type="button" onClick={() => setTarget(newTarget())} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/20 py-2 font-semibold text-amber-300 hover:bg-amber-500/30">
                <Shuffle size={16} /> Lancer un défi
              </button>
            )}
            {wins > 0 && <p className="text-xs text-slate-400">Défis réussis : {wins}</p>}
          </Panel>
        </>
      }
    />
  );
}
