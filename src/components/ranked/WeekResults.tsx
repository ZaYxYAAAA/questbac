"use client";

import { useState } from "react";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { RankEmblem } from "@/components/game/RankEmblem";
import { celebrate } from "@/components/game/RewardScreen";
import { Button } from "@/components/ui/Button";
import { type WeekZone, rankedSubjectMeta, stepLabel } from "@/lib/game/ranked";
import { RANK_STEPS } from "@/lib/game/ranks";
import { type RankView, acknowledgeRanked } from "@/lib/store/ranked-store";

const TEXT: Record<WeekZone, string> = {
  promotion: "Promu",
  objective: "Objectif atteint : promu",
  safe: "Maintenu",
  relegation: "Relégué",
  unranked: "Pas assez de manches",
  inactive: "Inactif : une division de moins",
  review: "Promotion bloquée (vérification)",
};

const Emblem = ({ step }: { step: number }) => <RankEmblem tierId={RANK_STEPS[step].tier.id} division={RANK_STEPS[step].division} size="xs" />;

/** Bilan de la semaine écoulée, matière par matière (affiché une fois). */
export function WeekResults({ ranks }: { ranks: RankView[] }) {
  const pending = ranks.filter((r) => r.last && !r.last.seen);
  const [hidden, setHidden] = useState(false);
  if (hidden || pending.length === 0) return null;
  const ups = pending.filter((r) => r.last!.to > r.last!.from).length;
  const downs = pending.filter((r) => r.last!.to < r.last!.from).length;

  const close = () => {
    setHidden(true);
    if (ups > 0) celebrate("big");
    void acknowledgeRanked(pending.map((r) => r.subject)).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-slate-950/85 p-3 backdrop-blur-sm sm:place-items-center">
      <div className="qb-pop max-h-[85dvh] w-full max-w-md space-y-4 overflow-y-auto rounded-3xl border border-amber-400/40 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
        <div className="text-center">
          <p className="text-5xl">{ups > 0 ? "🏆" : downs > 0 ? "💪" : "📅"}</p>
          <p className="mt-1 text-2xl font-black text-white">Bilan de la semaine</p>
          <p className="text-sm text-slate-400">
            {ups > 0 && <b className="text-emerald-300">{ups} promotion{ups > 1 ? "s" : ""}</b>}
            {ups > 0 && downs > 0 && " · "}
            {downs > 0 && <b className="text-rose-300">{downs} descente{downs > 1 ? "s" : ""}</b>}
            {ups === 0 && downs === 0 && "Pas de changement de division cette fois."}
          </p>
        </div>
        <div className="space-y-2">
          {pending.map((r) => {
            const last = r.last!;
            const m = rankedSubjectMeta(r.subject);
            const up = last.to > last.from;
            const down = last.to < last.from;
            return (
              <div
                key={r.subject}
                className={clsx("flex items-center gap-3 rounded-2xl border p-3", up ? "border-emerald-500/40 bg-emerald-500/10" : down ? "border-rose-500/40 bg-rose-500/10" : "border-white/10 bg-slate-800/40")}
              >
                <span className="text-2xl">{m.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{m.name}</p>
                  <p className={clsx("text-xs font-semibold", up ? "text-emerald-300" : down ? "text-rose-300" : "text-slate-400")}>
                    {TEXT[last.zone]}
                    {last.rank > 0 && ` · ${last.rank}${last.rank === 1 ? "er" : "e"}/${last.size}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Emblem step={last.from} />
                  {last.to !== last.from && (
                    <>
                      <ArrowRight size={14} className={up ? "text-emerald-300" : "text-rose-300"} />
                      <Emblem step={last.to} />
                    </>
                  )}
                </div>
                <span className="sr-only">{stepLabel(last.from)} vers {stepLabel(last.to)}</span>
              </div>
            );
          })}
        </div>
        <Button variant="gold" className="w-full py-3" onClick={close}>{ups > 0 ? "Génial !" : "Compris"}</Button>
      </div>
    </div>
  );
}
