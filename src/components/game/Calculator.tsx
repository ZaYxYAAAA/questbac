"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Calculator as CalcIcon, Delete, X } from "lucide-react";
import { type AngleMode, evaluate, formatResult } from "@/lib/game/calculator";

type Key = { label: string; insert?: string; action?: "clear" | "back" | "equal"; tone?: "fn" | "op" | "eq" | "danger"; aria?: string };

const KEYS: Key[] = [
  { label: "sin", insert: "sin(", tone: "fn" },
  { label: "cos", insert: "cos(", tone: "fn" },
  { label: "tan", insert: "tan(", tone: "fn" },
  { label: "ln", insert: "ln(", tone: "fn" },
  { label: "log", insert: "log(", tone: "fn" },
  { label: "√", insert: "√(", tone: "fn", aria: "racine carrée" },
  { label: "x²", insert: "^2", tone: "fn", aria: "au carré" },
  { label: "xʸ", insert: "^", tone: "fn", aria: "puissance" },
  { label: "(", insert: "(", tone: "fn" },
  { label: ")", insert: ")", tone: "fn" },
  { label: "7", insert: "7" },
  { label: "8", insert: "8" },
  { label: "9", insert: "9" },
  { label: "÷", insert: "÷", tone: "op", aria: "diviser" },
  { label: "⌫", action: "back", tone: "danger", aria: "effacer" },
  { label: "4", insert: "4" },
  { label: "5", insert: "5" },
  { label: "6", insert: "6" },
  { label: "×", insert: "×", tone: "op", aria: "multiplier" },
  { label: "C", action: "clear", tone: "danger", aria: "tout effacer" },
  { label: "1", insert: "1" },
  { label: "2", insert: "2" },
  { label: "3", insert: "3" },
  { label: "−", insert: "−", tone: "op", aria: "moins" },
  { label: "π", insert: "π", tone: "fn" },
  { label: "0", insert: "0" },
  { label: ",", insert: "," },
  { label: "×10ⁿ", insert: "E", tone: "fn", aria: "fois dix puissance" },
  { label: "+", insert: "+", tone: "op", aria: "plus" },
  { label: "=", action: "equal", tone: "eq", aria: "égal" },
];

/** Écrit l'expression lisiblement (« E » devient « ×10^ »). */
const pretty = (s: string) => s.replace(/E/g, "×10^");

/** Valeur à recopier dans une réponse libre (sans la notation « E »). */
function forAnswer(v: number): string {
  const s = formatResult(v);
  return s.includes("E") ? s.replace("E", "*10^") : s;
}

/**
 * Petite calculatrice scientifique, proposée seulement sur les questions de
 * calcul difficiles (`question.calc`). Elle s'ouvre dans l'appli : pas besoin
 * de sortir (ce qui ferait perdre la question en classé).
 */
export function Calculator({ onUse }: { onUse?: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [expr, setExpr] = useState("");
  const [angle, setAngle] = useState<AngleMode>("deg");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  let preview: number | null = null;
  try {
    preview = expr ? evaluate(expr, angle) : null;
  } catch {
    preview = null;
  }

  const press = (k: Key) => {
    setError(false);
    if (k.action === "clear") return setExpr("");
    if (k.action === "back") return setExpr((e) => e.replace(/(sin\(|cos\(|tan\(|ln\(|log\(|√\(|.)$/, ""));
    if (k.action === "equal") {
      if (!expr) return;
      try {
        setExpr(formatResult(evaluate(expr, angle)));
      } catch {
        setError(true);
      }
      return;
    }
    setExpr((e) => (e.length > 80 ? e : e + k.insert));
  };

  // Clavier (ordinateur) quand la calculatrice est ouverte.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const map: Record<string, Key | undefined> = {
        Enter: KEYS.find((k) => k.action === "equal"),
        "=": KEYS.find((k) => k.action === "equal"),
        Backspace: KEYS.find((k) => k.action === "back"),
        "*": KEYS.find((k) => k.label === "×"),
        "/": KEYS.find((k) => k.label === "÷"),
        "-": KEYS.find((k) => k.label === "−"),
        ".": KEYS.find((k) => k.label === ","),
      };
      if (e.key === "Escape") return setOpen(false);
      const k = map[e.key] ?? KEYS.find((x) => x.insert === e.key && x.insert.length === 1);
      if (k) {
        e.preventDefault();
        e.stopPropagation();
        press(k);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  const sheet = open && (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" onClick={() => setOpen(false)}>
      <div className="qb-backdrop absolute inset-0 bg-slate-950/40" />
      <div
        role="dialog"
        aria-label="Calculatrice"
        onClick={(e) => e.stopPropagation()}
        className="qb-sheet relative w-full max-w-sm rounded-t-3xl border border-white/10 bg-slate-900/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl shadow-black/60 backdrop-blur sm:rounded-3xl"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAngle((a) => (a === "deg" ? "rad" : "deg"))}
            className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-300"
            aria-label="Unité des angles"
          >
            {angle === "deg" ? "DEG" : "RAD"}
          </button>
          <span className="flex-1" />
          <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="grid h-8 w-8 place-items-center rounded-full bg-slate-800 text-slate-300">
            <X size={16} />
          </button>
        </div>
        <div className="mb-3 rounded-2xl bg-slate-950/80 px-4 py-3 text-right">
          <p className={clsx("min-h-7 break-all font-mono text-xl text-white", error && "qb-shake text-rose-300")}>{pretty(expr) || <span className="text-slate-600">0</span>}</p>
          <p className="min-h-5 font-mono text-sm text-slate-500">{preview !== null && formatResult(preview) !== expr ? `= ${pretty(formatResult(preview))}` : error ? "Calcul impossible" : " "}</p>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {KEYS.map((k) => (
            <button
              key={k.label}
              type="button"
              aria-label={k.aria ?? k.label}
              onClick={() => press(k)}
              className={clsx(
                "flex h-11 items-center justify-center rounded-xl text-base font-semibold transition active:scale-90 active:brightness-125",
                k.tone === "fn" && "bg-slate-800/80 text-sm text-violet-200",
                k.tone === "op" && "bg-violet-600/30 text-lg text-violet-100",
                k.tone === "eq" && "bg-gradient-to-br from-violet-500 to-indigo-600 text-lg text-white",
                k.tone === "danger" && "bg-rose-500/15 text-rose-200",
                !k.tone && "bg-slate-800 text-lg text-white",
              )}
            >
              {k.action === "back" ? <Delete size={18} /> : k.label}
            </button>
          ))}
        </div>
        {onUse && (
          <button
            type="button"
            disabled={preview === null}
            onClick={() => {
              if (preview === null) return;
              onUse(forAnswer(preview));
              setOpen(false);
            }}
            className="mt-2 w-full rounded-xl bg-white py-2.5 text-sm font-bold text-slate-900 transition active:scale-[0.98] disabled:opacity-40"
          >
            Mettre {preview !== null ? pretty(formatResult(preview)) : "le résultat"} en réponse
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="qb-pop inline-flex items-center gap-1.5 rounded-full border border-violet-400/40 bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-100 transition hover:bg-violet-500/25 active:scale-95"
      >
        <CalcIcon size={14} /> Calculatrice
      </button>
      {mounted && sheet ? createPortal(sheet, document.body) : null}
    </>
  );
}
