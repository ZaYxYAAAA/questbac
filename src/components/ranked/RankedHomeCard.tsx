"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Clock, Swords } from "lucide-react";
import { formatCountdown } from "@/lib/game/league";
import { PLACEMENT_MATCHES } from "@/lib/game/ranked";
import { useCloud } from "@/lib/store/cloud-sync";
import { loadRanked, useRanked } from "@/lib/store/ranked-store";
import { RankedBadge } from "./RankedBadge";
import { WeekResults } from "./WeekResults";

/** Résumé de la semaine classée sur l'accueil. */
export function RankedHomeCard() {
  const { user, checked } = useCloud();
  const { overview, fetchedAt } = useRanked();
  useEffect(() => {
    if (user) void loadRanked("general");
  }, [user]);

  if (checked && !user) {
    return (
      <Link href="/classement" className="block rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-slate-900 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">⚔️ Mode classé</p>
        <p className="mt-1 font-bold text-white">Crée un compte pour obtenir ton rang par matière et grimper chaque semaine.</p>
      </Link>
    );
  }
  if (!overview) return <div className="h-36 animate-pulse rounded-3xl bg-slate-900/60" />;

  const general = overview.ranks.find((r) => r.subject === "general");
  const subjects = overview.ranks.filter((r) => r.subject !== "general");
  const placed = subjects.filter((r) => r.placed).length;
  const played = overview.ranks.reduce((n, r) => n + r.played, 0);
  const position = overview.subject === "general" ? overview.group.findIndex((r) => r.isMe) + 1 : 0;
  const endsIn = overview.endsInMs - (Date.now() - fetchedAt);

  return (
    <div className="space-y-3">
      <WeekResults ranks={overview.ranks} />
      <Link href="/classement" className="group block rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 p-5 transition hover:border-amber-300/60">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-300">⚔️ Ta semaine classée</p>
          <p className="flex items-center gap-1 text-xs text-amber-200"><Clock size={12} /> {formatCountdown(endsIn)}</p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {general && <RankedBadge step={general.step} size="md" />}
          <p className="text-sm text-slate-300">
            {played === 0 ? "Aucune manche cette semaine" : `${played} manche${played > 1 ? "s" : ""} jouée${played > 1 ? "s" : ""}`}
            {position > 0 && overview.group.length > 1 && <> · <b className="text-white">{position}<sup>e</sup></b>/{overview.group.length} de ton groupe</>}
          </p>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          {placed}/{subjects.length} matières classées · {PLACEMENT_MATCHES} manches de placement par matière
        </p>
        <span className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-sm font-bold text-slate-950">
          <Swords size={16} /> Jouer en classé
        </span>
      </Link>
    </div>
  );
}
