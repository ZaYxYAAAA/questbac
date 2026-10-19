"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { fmt, tryCompile } from "@/lib/math/parser";

/** Mise en page standard d'un labo : graphique à gauche, panneau à droite. */
export function LabShell({ graph, panel }: { graph: ReactNode; panel: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-3">{graph}</div>
      <aside className="space-y-3">{panel}</aside>
    </div>
  );
}

export function Panel({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-2xl border border-white/10 bg-slate-900/70 p-4", className)}>
      {title && <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">{title}</h3>}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function Readout({ label, value, color }: { label: ReactNode; value: ReactNode; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-800/60 px-3 py-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono font-semibold" style={{ color: color ?? "#f8fafc" }}>{value}</span>
    </div>
  );
}

export function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), onChange(!checked))}
        onClick={() => onChange(!checked)}
        className={clsx("relative h-5 w-9 rounded-full transition", checked ? "bg-violet-600" : "bg-slate-700")}
      >
        <span className={clsx("absolute top-0.5 h-4 w-4 rounded-full bg-white transition", checked ? "left-[18px]" : "left-0.5")} />
      </span>
      {children}
    </label>
  );
}

export function Chips<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            "rounded-lg border px-2.5 py-1 text-xs font-medium transition",
            value === o.value ? "border-violet-400 bg-violet-600/30 text-white" : "border-white/10 bg-slate-800 text-slate-300 hover:border-white/30",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Coefficient LaTeX « propre » : 1x → x, -1x → -x, +- → -. */
function term(coef: number, variable: string, first: boolean): string {
  // On décide sur la valeur affichée (arrondie) : 0,999 s'écrit « x » et 0,001 disparaît, comme à l'écran.
  const shown = fmt(Math.abs(coef));
  if (shown === "0") return "";
  const sign = coef < 0 ? "-" : first ? "" : "+";
  const c = variable && shown === "1" ? "" : shown;
  return `${sign} ${c}${variable} `;
}

/** Écrit un polynôme Σ coefs[i]·x^(deg-i) en LaTeX. */
export function polyTex(coefs: number[], variable = "x"): string {
  const deg = coefs.length - 1;
  let out = "";
  coefs.forEach((c, i) => {
    const p = deg - i;
    const v = p === 0 ? "" : p === 1 ? variable : `${variable}^{${p}}`;
    out += term(c, v, out.trim() === "");
  });
  return out.trim() === "" ? "0" : out.trim().replace(/,/g, "{,}");
}

/**
 * Compile une fonction de x pour un labo sans curseurs de paramètres :
 * une autre lettre (« a*x ») donnerait une courbe vide sans explication.
 */
export function compileX(source: string): ReturnType<typeof tryCompile> {
  const result = tryCompile(source);
  if (!result.ok || result.expr.params.length === 0) return result;
  const names = result.expr.params.join(", ");
  return { ok: false, error: `Lettre inconnue : ${names}. Ici, seule la variable x est permise (le traceur universel gère les paramètres).` };
}

/** Nombre LaTeX avec virgule décimale. */
export const texNum = (v: number, digits = 2) => fmt(v, digits).replace("−", "-").replace(",", "{,}");
