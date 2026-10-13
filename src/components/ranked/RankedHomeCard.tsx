"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Clock, Swords } from "lucide-react";
import { formatCountdown } from "@/lib/game/league";
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
      <Link href="/classement" className="group flex items-center gap-3 rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 p-3 transition hover:border-amber-300/60">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-2xl">⚔️</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-sm font-bold text-white">Ta semaine</p>
            {general && <RankedBadge step={general.step} size="sm" />}
          </div>
          <p className="truncate text-xs text-slate-400">
            {played === 0 ? "Aucune manche" : `${played} manche${played > 1 ? "s" : ""}`}
            {position > 0 && overview.group.length > 1 && ` · ${position}e/${overview.group.length}`} · {placed}/{subjects.length} matières classées
          </p>
          <p className="flex items-center gap-1 text-[11px] text-amber-200"><Clock size={11} /> Promotions dans {formatCountdown(endsIn)}</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-slate-950"><Swords size={18} /></span>
      </Link>
    </div>
  );
}
