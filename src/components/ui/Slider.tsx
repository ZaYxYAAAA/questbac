"use client";

import type { ReactNode } from "react";
import { fmt } from "@/lib/math/parser";

export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  color = "#a78bfa",
  format,
  suffix,
}: {
  label: ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  color?: string;
  format?: (v: number) => string;
  suffix?: ReactNode;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block select-none">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs text-white">
          {format ? format(value) : fmt(value)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="qb-range w-full"
        style={{ "--qb-fill": `${pct}%`, "--qb-color": color } as React.CSSProperties}
      />
    </label>
  );
}
