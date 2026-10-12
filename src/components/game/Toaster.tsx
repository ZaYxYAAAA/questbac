"use client";

import clsx from "clsx";
import { useToasts } from "@/lib/store/toast-store";

const TONES = {
  gold: "border-amber-400/40 from-amber-500/25",
  violet: "border-violet-400/40 from-violet-500/25",
  emerald: "border-emerald-400/40 from-emerald-500/25",
  rose: "border-rose-400/40 from-rose-500/25",
};

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4 lg:left-auto lg:right-4 lg:items-end">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={clsx(
            "qb-toast pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border bg-gradient-to-r to-slate-900/95 p-3 text-left shadow-2xl backdrop-blur",
            TONES[t.tone],
          )}
        >
          <span className="text-2xl">{t.emoji}</span>
          <span className="min-w-0">
            <span className="block font-bold text-white">{t.title}</span>
            {t.body && <span className="block truncate text-xs text-slate-300">{t.body}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
