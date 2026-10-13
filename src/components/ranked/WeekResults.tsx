"use client";

import { useState } from "react";
import clsx from "clsx";
import { celebrate } from "@/components/game/RewardScreen";
import { Button } from "@/components/ui/Button";
import { type WeekZone, rankedSubjectMeta, stepLabel } from "@/lib/game/ranked";
import { type RankView, acknowledgeRanked } from "@/lib/store/ranked-store";

const TEXT: Record<WeekZone, string> = {
  promotion: "Promu ⬆️",
  objective: "Objectif atteint, promu ⬆️",
  safe: "Maintenu",
  relegation: "Relégué ⬇️",
  unranked: "Pas assez de manches",
  inactive: "Inactif ⬇️",
};

/** Bilan de la semaine écoulée, matière par matière (une fois). */
export function WeekResults({ ranks }: { ranks: RankView[] }) {
  const pending = ranks.filter((r) => r.last && !r.last.seen);
  const [hidden, setHidden] = useState(false);
  if (hidden || pending.length === 0) return null;
  const promoted = pending.some((r) => r.last!.to > r.last!.from);

  const close = () => {
    setHidden(true);
    if (promoted) celebrate("big");
    void acknowledgeRanked(pending.map((r) => r.subject)).catch(() => {});
  };

  return (
    <div className="qb-pop space-y-3 rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-500/15 to-slate-900 p-5">
      <p className="text-lg font-black text-white">📅 Bilan de la semaine</p>
      <div className="space-y-1.5">
        {pending.map((r) => {
          const last = r.last!;
          const m = rankedSubjectMeta(r.subject);
          return (
            <div key={r.subject} className="flex items-center gap-2 rounded-xl bg-slate-950/40 px-3 py-2 text-sm">
              <span>{m.emoji}</span>
              <span className="flex-1 font-semibold text-white">{m.name}</span>
              {last.rank > 0 && <span className="text-xs text-slate-400">{last.rank}{last.rank === 1 ? "er" : "e"}/{last.size}</span>}
              <span className={clsx("text-xs font-bold", last.to > last.from ? "text-emerald-300" : last.to < last.from ? "text-rose-300" : "text-slate-300")}>
                {TEXT[last.zone]}
                {last.to !== last.from && ` · ${stepLabel(last.to)}`}
              </span>
            </div>
          );
        })}
      </div>
      <Button variant="gold" className="w-full" onClick={close}>Compris !</Button>
    </div>
  );
}
