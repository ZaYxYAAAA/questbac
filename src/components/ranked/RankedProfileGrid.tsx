"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Card, SectionTitle } from "@/components/ui/Card";
import { type RankedSubject, rankedSubjectMeta, seasonLabel, stepLabel } from "@/lib/game/ranked";
import { useCloud } from "@/lib/store/cloud-sync";
import { loadRanked, useRanked } from "@/lib/store/ranked-store";
import { RankedBadge } from "./RankedBadge";

/** Rangs classés par matière et meilleurs rangs des saisons passées (profil). */
export function RankedProfileGrid() {
  const user = useCloud((s) => s.user);
  const overview = useRanked((s) => s.overview);
  useEffect(() => {
    if (user && !useRanked.getState().overview) void loadRanked("general");
  }, [user]);
  if (!user || !overview) return null;

  const seasons = Object.entries(overview.seasons).sort(([a], [b]) => b.localeCompare(a));
  return (
    <Card>
      <SectionTitle icon={<span>⚔️</span>} action={<Link href="/classement" className="text-sm text-amber-300 hover:text-amber-200">Jouer en classé →</Link>}>
        Rangs par matière
      </SectionTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {overview.ranks.map((r) => {
          const m = rankedSubjectMeta(r.subject);
          return (
            <div key={r.subject} className="rounded-2xl border border-white/10 bg-slate-800/40 p-3">
              <p className="mb-1.5 truncate text-sm font-semibold text-white">{m.emoji} {m.name}</p>
              <RankedBadge step={r.step} placementLeft={r.placed ? 0 : r.placementLeft} size="sm" />
            </div>
          );
        })}
      </div>
      {seasons.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Saisons passées</p>
          {seasons.map(([key, peaks]) => (
            <div key={key} className="rounded-xl bg-slate-800/40 p-2.5 text-xs text-slate-300">
              <b className="text-white">{seasonLabel(key)}</b> :{" "}
              {(Object.entries(peaks) as [RankedSubject, number][]).map(([s, step]) => `${rankedSubjectMeta(s).emoji} ${stepLabel(step)}`).join(" · ")}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
