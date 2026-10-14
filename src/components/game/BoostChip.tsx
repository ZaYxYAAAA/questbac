"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { activeBoost, fmtMult } from "@/lib/game/boost";
import { useGame } from "@/lib/store/game-store";

/** Boost d'XP en cours (boss, quêtes, coffre de série ou dimanche), avec le temps restant. */
export function BoostChip({ className, long = false }: { className?: string; long?: boolean }) {
  const boost = useGame((s) => s.boost);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);
  const active = activeBoost(boost, new Date(now));
  if (!active) return null;
  const minutes = active.until ? Math.max(1, Math.ceil((active.until - now) / 60_000)) : null;
  return (
    <span
      className={clsx(
        "qb-pop qb-glow-pulse inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-400/25 to-orange-500/20 px-2.5 py-1 text-xs font-black text-amber-100",
        className,
      )}
      title={active.label}
    >
      🚀 XP ×{fmtMult(active.mult)}
      <span className="font-semibold text-amber-200/80">{minutes ? `· ${minutes} min` : "· aujourd'hui"}</span>
      {long && <span className="hidden font-semibold text-amber-200/80 sm:inline">· {active.label}</span>}
    </span>
  );
}
