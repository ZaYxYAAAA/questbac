"use client";

import { useState } from "react";
import { COLORS, Graph, MovablePoint, Polygon, Segment, Vector } from "@/components/math/Graph";
import { Slider } from "@/components/ui/Slider";
import { Tex } from "@/components/ui/Tex";
import { fmt } from "@/lib/math/parser";
import { LabShell, Panel, Readout, Toggle, texNum } from "./common";

export default function VectorLab() {
  const [u, setU] = useState({ x: 3, y: 1 });
  const [v, setV] = useState({ x: 1, y: 2.5 });
  const [showSum, setShowSum] = useState(true);
  const [showDiff, setShowDiff] = useState(false);
  const [k, setK] = useState(1);
  const [showK, setShowK] = useState(false);

  const det = u.x * v.y - u.y * v.x;
  const dot = u.x * v.x + u.y * v.y;
  const nu = Math.hypot(u.x, u.y);
  const nv = Math.hypot(v.x, v.y);
  const angle = nu && nv ? (Math.acos(Math.max(-1, Math.min(1, dot / (nu * nv)))) * 180) / Math.PI : NaN;
  const colinear = Math.abs(det) < 1e-9;
  const orthogonal = Math.abs(dot) < 1e-9;

  return (
    <LabShell
      graph={
        <Graph initial={{ xMin: -6, xMax: 8, yMin: -4, yMax: 6 }} height={460} equalAspect>
          {showSum && (
            <>
              <Polygon points={[[0, 0], [u.x, u.y], [u.x + v.x, u.y + v.y], [v.x, v.y]]} fill={COLORS.emerald} opacity={0.08} />
              <Segment x1={u.x} y1={u.y} x2={u.x + v.x} y2={u.y + v.y} color={COLORS.pink} dashed opacity={0.6} />
              <Segment x1={v.x} y1={v.y} x2={u.x + v.x} y2={u.y + v.y} color={COLORS.cyan} dashed opacity={0.6} />
              <Vector x1={0} y1={0} x2={u.x + v.x} y2={u.y + v.y} color={COLORS.emerald} label="u+v" />
            </>
          )}
          {showDiff && <Vector x1={v.x} y1={v.y} x2={u.x} y2={u.y} color={COLORS.amber} label="u−v" />}
          {showK && <Vector x1={0} y1={0} x2={k * u.x} y2={k * u.y} color={COLORS.violet} width={5} label={`${fmt(k)}u`} />}
          <Vector x1={0} y1={0} x2={u.x} y2={u.y} color={COLORS.cyan} label="u" />
          <Vector x1={0} y1={0} x2={v.x} y2={v.y} color={COLORS.pink} label="v" />
          <MovablePoint x={u.x} y={u.y} color={COLORS.cyan} snap={0.5} onMove={(x, y) => setU({ x, y })} />
          <MovablePoint x={v.x} y={v.y} color={COLORS.pink} snap={0.5} onMove={(x, y) => setV({ x, y })} />
        </Graph>
      }
      panel={
        <>
          <Panel title="Coordonnées">
            <div className="grid grid-cols-2 gap-2 text-center text-lg">
              <div className="rounded-xl bg-slate-950 py-2 text-cyan-300"><Tex>{`\\vec u\\begin{pmatrix}${texNum(u.x)}\\\\${texNum(u.y)}\\end{pmatrix}`}</Tex></div>
              <div className="rounded-xl bg-slate-950 py-2 text-pink-300"><Tex>{`\\vec v\\begin{pmatrix}${texNum(v.x)}\\\\${texNum(v.y)}\\end{pmatrix}`}</Tex></div>
            </div>
            <Readout label={<Tex>{"\\vec u + \\vec v"}</Tex>} value={`(${fmt(u.x + v.x)} ; ${fmt(u.y + v.y)})`} color={COLORS.emerald} />
            <Readout label={<Tex>{"\\|\\vec u\\|"}</Tex>} value={fmt(nu, 3)} color={COLORS.cyan} />
            <Readout label={<Tex>{"\\|\\vec v\\|"}</Tex>} value={fmt(nv, 3)} color={COLORS.pink} />
          </Panel>

          <Panel title="Relations (2nde & 1re)">
            <Readout label={<>Déterminant <Tex>{"xy' - yx'"}</Tex></>} value={fmt(det, 3)} />
            <p className={`rounded-lg px-3 py-2 text-sm ${colinear ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800/60 text-slate-400"}`}>
              {colinear ? "✔ Vecteurs colinéaires (déterminant nul)" : "Vecteurs non colinéaires"}
            </p>
            <Readout label={<>Produit scalaire <Tex>{"\\vec u\\cdot\\vec v"}</Tex></>} value={fmt(dot, 3)} />
            <Readout label="Angle (u, v)" value={`${fmt(angle, 1)}°`} />
            <p className={`rounded-lg px-3 py-2 text-sm ${orthogonal ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800/60 text-slate-400"}`}>
              {orthogonal ? "✔ Vecteurs orthogonaux (produit scalaire nul)" : "Vecteurs non orthogonaux"}
            </p>
          </Panel>

          <Panel title="Affichage">
            <Toggle checked={showSum} onChange={setShowSum}>Somme u + v (parallélogramme)</Toggle>
            <Toggle checked={showDiff} onChange={setShowDiff}>Différence u − v</Toggle>
            <Toggle checked={showK} onChange={setShowK}>Produit k·u</Toggle>
            {showK && <Slider label="k" value={k} min={-3} max={3} step={0.1} onChange={setK} />}
          </Panel>
        </>
      }
    />
  );
}
