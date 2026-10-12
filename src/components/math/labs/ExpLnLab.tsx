"use client";

import { useState } from "react";
import { COLORS, Graph, Label, Line, MovablePoint, Plot, Point, Segment } from "@/components/math/Graph";
import { Slider } from "@/components/ui/Slider";
import { Tex } from "@/components/ui/Tex";
import { fmt } from "@/lib/math/parser";
import { LabShell, Panel, Readout, Toggle } from "./common";

export default function ExpLnLab() {
  const [a, setA] = useState(0.7);
  const [showTangents, setShowTangents] = useState(true);
  const [showBase, setShowBase] = useState(false);
  const [base, setBase] = useState(2);

  const ea = Math.exp(a);

  return (
    <LabShell
      graph={
        <Graph initial={{ xMin: -5, xMax: 7, yMin: -4, yMax: 6 }} height={480} equalAspect>
          <Plot f={(x) => x} color={COLORS.muted} dashed width={1.5} />
          <Plot f={Math.exp} color={COLORS.amber} width={3} />
          <Plot f={Math.log} color={COLORS.cyan} width={3} domain={[1e-6, 100]} />
          {showBase && <Plot f={(x) => Math.pow(base, x)} color={COLORS.pink} width={2.5} />}
          <Segment x1={a} y1={ea} x2={ea} y2={a} color={COLORS.violet} dashed />
          {showTangents && (
            <>
              <Line x1={a} y1={ea} x2={a + 1} y2={ea + ea} color={COLORS.amber} width={1.6} dashed />
              <Line x1={ea} y1={a} x2={ea + 1} y2={a + 1 / ea} color={COLORS.cyan} width={1.6} dashed />
            </>
          )}
          <Label x={2.3} y={Math.exp(2.3)} dx={8} color={COLORS.amber}>y = eˣ</Label>
          <Label x={5.5} y={Math.log(5.5)} dy={-10} color={COLORS.cyan}>y = ln x</Label>
          <Label x={4.6} y={4.6} dx={6} dy={14} color={COLORS.muted}>y = x</Label>
          <Point x={ea} y={a} color={COLORS.cyan} label="N" />
          <Point x={0} y={1} color={COLORS.amber} r={3.5} />
          <Point x={1} y={0} color={COLORS.cyan} r={3.5} />
          <MovablePoint x={a} y={ea} label="M" color={COLORS.amber} onMove={(x) => setA(Math.max(-4, Math.min(2.5, x)))} constrain={(x) => [x, Math.exp(x)]} />
        </Graph>
      }
      panel={
        <>
          <Panel title="Deux fonctions réciproques">
            <p className="text-sm text-slate-300">
              M(a ; eᵃ) est sur la courbe de exp. Son symétrique par rapport à y = x est N(eᵃ ; a), sur la courbe de ln.
            </p>
            <Readout label="a" value={fmt(a, 3)} />
            <Readout label={<Tex>{"e^a"}</Tex>} value={fmt(ea, 4)} color={COLORS.amber} />
            <Readout label={<Tex>{"\\ln(e^a)"}</Tex>} value={fmt(Math.log(ea), 4)} color={COLORS.cyan} />
          </Panel>
          <Panel title="Tangentes">
            <Toggle checked={showTangents} onChange={setShowTangents}>Afficher les tangentes en M et N</Toggle>
            <Readout label={<>Pente en M : <Tex>{"\\exp'(a) = e^a"}</Tex></>} value={fmt(ea, 4)} color={COLORS.amber} />
            <Readout label={<>Pente en N : <Tex>{"\\ln'(e^a) = \\frac{1}{e^a}"}</Tex></>} value={fmt(1 / ea, 4)} color={COLORS.cyan} />
            <p className="text-xs text-slate-500">Les pentes sont inverses l&apos;une de l&apos;autre : c&apos;est la symétrie par rapport à y = x.</p>
          </Panel>
          <Panel title="Fonctions x ↦ aˣ">
            <Toggle checked={showBase} onChange={setShowBase}>Comparer avec bˣ = e^(x ln b)</Toggle>
            {showBase && <Slider label="b" value={base} min={0.1} max={5} step={0.05} onChange={setBase} color="#f472b6" />}
            <div className="space-y-1 rounded-xl bg-slate-950 p-3 text-sm text-slate-200">
              <Tex>{"e^{a+b} = e^a e^b"}</Tex><br />
              <Tex>{"\\ln(ab) = \\ln a + \\ln b"}</Tex><br />
              <Tex>{"\\ln(e^x) = x,\\quad e^{\\ln x} = x\\ (x>0)"}</Tex>
            </div>
          </Panel>
        </>
      }
    />
  );
}
