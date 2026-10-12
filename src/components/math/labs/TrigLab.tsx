"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { COLORS, Circle, Graph, Label, MovablePoint, Plot, Point, Segment, useGraph } from "@/components/math/Graph";
import { Tex } from "@/components/ui/Tex";
import { fmt } from "@/lib/math/parser";
import { LabShell, Panel, Readout, Toggle } from "./common";

const TAU = 2 * Math.PI;

// Angles remarquables : [k (en π/12), angle, cos, sin]
const REMARKABLE: [number, string, string, string][] = [
  [0, "0", "1", "0"],
  [2, "\\frac{\\pi}{6}", "\\frac{\\sqrt3}{2}", "\\frac12"],
  [3, "\\frac{\\pi}{4}", "\\frac{\\sqrt2}{2}", "\\frac{\\sqrt2}{2}"],
  [4, "\\frac{\\pi}{3}", "\\frac12", "\\frac{\\sqrt3}{2}"],
  [6, "\\frac{\\pi}{2}", "0", "1"],
  [8, "\\frac{2\\pi}{3}", "-\\frac12", "\\frac{\\sqrt3}{2}"],
  [9, "\\frac{3\\pi}{4}", "-\\frac{\\sqrt2}{2}", "\\frac{\\sqrt2}{2}"],
  [10, "\\frac{5\\pi}{6}", "-\\frac{\\sqrt3}{2}", "\\frac12"],
  [12, "\\pi", "-1", "0"],
  [14, "\\frac{7\\pi}{6}", "-\\frac{\\sqrt3}{2}", "-\\frac12"],
  [15, "\\frac{5\\pi}{4}", "-\\frac{\\sqrt2}{2}", "-\\frac{\\sqrt2}{2}"],
  [16, "\\frac{4\\pi}{3}", "-\\frac12", "-\\frac{\\sqrt3}{2}"],
  [18, "\\frac{3\\pi}{2}", "0", "-1"],
  [20, "\\frac{5\\pi}{3}", "\\frac12", "-\\frac{\\sqrt3}{2}"],
  [21, "\\frac{7\\pi}{4}", "\\frac{\\sqrt2}{2}", "-\\frac{\\sqrt2}{2}"],
  [22, "\\frac{11\\pi}{6}", "\\frac{\\sqrt3}{2}", "-\\frac12"],
];

const remarkableFor = (theta: number) =>
  REMARKABLE.find(([k]) => Math.abs((k * Math.PI) / 12 - theta) < 1e-6);

function AngleArc({ theta }: { theta: number }) {
  const { sx, sy } = useGraph();
  const r = 0.28;
  const steps = Math.max(2, Math.ceil(theta * 20));
  let d = `M${sx(r)},${sy(0)}`;
  for (let i = 1; i <= steps; i++) {
    const t = (theta * i) / steps;
    d += `L${sx(r * Math.cos(t))},${sy(r * Math.sin(t))}`;
  }
  return <path d={d} fill="none" stroke={COLORS.amber} strokeWidth={2} pointerEvents="none" />;
}

export default function TrigLab() {
  const [theta, setTheta] = useState(Math.PI / 3);
  const [magnet, setMagnet] = useState(true);
  const [playing, setPlaying] = useState(false);
  const frame = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setTheta((th) => (th + dt * 0.8) % TAU);
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [playing]);

  const onCircle = (x: number, y: number): [number, number] => {
    let t = Math.atan2(y, x);
    if (t < 0) t += TAU;
    if (magnet) {
      const k = Math.round(t / (Math.PI / 12));
      const snapped = (k * Math.PI) / 12;
      if (remarkableFor(snapped % TAU) && Math.abs(snapped - t) < 0.07) t = snapped % TAU;
    }
    return [Math.cos(t), Math.sin(t)];
  };

  const angleOf = (x: number, y: number) => {
    const t = Math.atan2(y, x);
    setTheta(t < 0 ? t + TAU : t);
  };

  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const exact = remarkableFor(theta);

  return (
    <LabShell
      graph={
        <div className="grid gap-3 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Graph initial={{ xMin: -1.6, xMax: 1.6, yMin: -1.6, yMax: 1.6 }} height={360} equalAspect>
            <Circle cx={0} cy={0} r={1} color="#64748b" />
            {REMARKABLE.map(([k]) => (
              <Point key={k} x={Math.cos((k * Math.PI) / 12)} y={Math.sin((k * Math.PI) / 12)} color="#475569" r={2.5} />
            ))}
            <AngleArc theta={theta} />
            <Segment x1={0} y1={0} x2={c} y2={s} color={COLORS.white} width={2} />
            <Segment x1={c} y1={s} x2={c} y2={0} color={COLORS.pink} dashed />
            <Segment x1={c} y1={s} x2={0} y2={s} color={COLORS.cyan} dashed />
            <Segment x1={0} y1={0} x2={c} y2={0} color={COLORS.cyan} width={4} />
            <Segment x1={0} y1={0} x2={0} y2={s} color={COLORS.pink} width={4} />
            <Label x={c / 2} y={0} dy={s >= 0 ? 16 : -8} anchor="middle" color={COLORS.cyan}>cos</Label>
            <Label x={0} y={s / 2} dx={c >= 0 ? -8 : 8} anchor={c >= 0 ? "end" : "start"} color={COLORS.pink}>sin</Label>
            <MovablePoint x={c} y={s} label="M" color={COLORS.amber} onMove={angleOf} constrain={onCircle} />
          </Graph>
          <Graph initial={{ xMin: -0.6, xMax: 7, yMin: -1.6, yMax: 1.6 }} height={360} piTicks xLabel="θ">
            <Plot f={Math.cos} color={COLORS.cyan} opacity={0.9} />
            <Plot f={Math.sin} color={COLORS.pink} opacity={0.9} />
            <Plot f={Math.cos} color={COLORS.cyan} width={4} domain={[0, theta]} />
            <Plot f={Math.sin} color={COLORS.pink} width={4} domain={[0, theta]} />
            <Segment x1={theta} y1={-2} x2={theta} y2={2} color={COLORS.amber} dashed />
            <Point x={theta} y={c} color={COLORS.cyan} />
            <Point x={theta} y={s} color={COLORS.pink} />
          </Graph>
        </div>
      }
      panel={
        <>
          <Panel title="Angle θ">
            <div className="rounded-xl bg-slate-950 py-3 text-center text-xl text-amber-300">
              <Tex>{exact ? `\\theta = ${exact[1]}` : `\\theta \\approx ${fmt(theta, 3).replace(",", "{,}")}\\text{ rad}`}</Tex>
            </div>
            <Readout label="En degrés" value={`${fmt((theta * 180) / Math.PI, 1)}°`} color={COLORS.amber} />
            <Readout label="cos θ" value={exact ? <Tex>{exact[2]}</Tex> : fmt(c, 4)} color={COLORS.cyan} />
            <Readout label="sin θ" value={exact ? <Tex>{exact[3]}</Tex> : fmt(s, 4)} color={COLORS.pink} />
            <Readout label="cos²θ + sin²θ" value={fmt(c * c + s * s, 4)} />
          </Panel>
          <Panel title="Contrôles">
            <Toggle checked={magnet} onChange={setMagnet}>Aimanter sur les angles remarquables</Toggle>
            <button type="button" onClick={() => setPlaying((p) => !p)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/20 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/30">
              {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Faire tourner M</>}
            </button>
            <div className="flex flex-wrap gap-1.5">
              {REMARKABLE.filter(([k]) => k <= 12).map(([k, label]) => (
                <button key={k} type="button" onClick={() => setTheta((k * Math.PI) / 12)} className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-violet-600">
                  <Tex>{label}</Tex>
                </button>
              ))}
            </div>
          </Panel>
        </>
      }
    />
  );
}
