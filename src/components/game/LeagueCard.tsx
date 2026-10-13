"use client";

import { useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Clock } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { RankEmblem } from "@/components/game/RankEmblem";
import { celebrate } from "@/components/game/RewardScreen";
import { LeagueCountdown, useLeagueStandings } from "@/components/game/WeeklyLeague";
import { Button } from "@/components/ui/Button";
import { leagueName, zoneOf } from "@/lib/game/league";
import { useGame } from "@/lib/store/game-store";

const ordinal = (n: number) => (n === 1 ? "1er" : `${n}e`);

/** Résumé de la ligue de la semaine (accueil). */
export function LeagueCard() {
  const weeklyXp = useGame((s) => s.weekly.xp);
  const { rows, position, tierId } = useLeagueStandings();
  const zone = zoneOf(position, rows.length);
  const around = rows.slice(Math.max(0, position - 2), Math.max(0, position - 2) + 3);

  return (
    <Link href="/classement" className="group block rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-black/20 transition hover:border-violet-400/40 sm:p-5">
      <div className="flex items-center gap-3">
        <RankEmblem tierId={tierId} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ligue de la semaine</p>
          <p className="truncate text-lg font-black text-white">{leagueName(tierId)}</p>
        </div>
        <div className="text-right">
          <p className={clsx("text-2xl font-black", weeklyXp === 0 ? "text-slate-500" : zone === "promotion" ? "text-emerald-300" : zone === "relegation" ? "text-rose-300" : "text-white")}>{weeklyXp === 0 ? "—" : ordinal(position)}</p>
          <p className="text-[11px] text-slate-500">sur {rows.length}</p>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {around.map((r) => {
          const rank = rows.indexOf(r) + 1;
          const z = zoneOf(rank, rows.length);
          return (
            <div key={r.id} className={clsx("flex items-center gap-2 rounded-lg px-2 py-1 text-sm", r.isPlayer ? "bg-violet-600/25 text-violet-100" : "text-slate-300")}>
              <span className={clsx("w-5 text-center text-xs font-black", z === "promotion" ? "text-emerald-300" : z === "relegation" ? "text-rose-300" : "text-slate-500")}>{rank}</span>
              <span className="min-w-0 flex-1 truncate">{r.avatar} {r.pseudo}{r.isPlayer && " (toi)"}</span>
              <span className="font-mono text-xs">{r.weeklyXp} XP</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <Clock size={13} className="text-amber-300" /> Fin dans <LeagueCountdown className="font-bold text-amber-200" />
        <span className="ml-auto text-violet-300 group-hover:text-violet-200">{weeklyXp === 0 ? "Entre dans la course →" : "Voir la ligue →"}</span>
      </p>
    </Link>
  );
}

/** Message de fin de semaine, affiché à la reconnexion jusqu'à ce que le joueur le ferme. */
export function LeagueResultBanner() {
  const last = useGame((s) => s.league.last);
  const profile = useGame((s) => s.profile);
  const rp = useGame((s) => s.rp);
  const acknowledge = useGame((s) => s.acknowledgeLeague);
  const pending = last && !last.seen ? last : null;
  const podium = pending ? pending.rank <= 3 : false;

  useEffect(() => {
    if (podium && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) void celebrate("small");
  }, [podium]);

  if (!pending || !profile) return null;
  const rewards = [pending.rewardXp > 0 && `+${pending.rewardXp} XP`, pending.rewardRp !== 0 && `${pending.rewardRp > 0 ? "+" : ""}${pending.rewardRp} RP`].filter(Boolean).join(" · ");

  return (
    <section
      className={clsx(
        "qb-pop flex flex-col gap-3 rounded-3xl border p-4 sm:flex-row sm:items-center sm:p-5",
        pending.zone === "promotion" ? "border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 to-slate-900" : pending.zone === "relegation" ? "border-rose-400/40 bg-gradient-to-r from-rose-500/15 to-slate-900" : "border-violet-400/40 bg-gradient-to-r from-violet-500/20 to-slate-900",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-4xl">{pending.rank === 1 ? "🏆" : pending.rank === 2 ? "🥈" : pending.rank === 3 ? "🥉" : pending.zone === "relegation" ? "🌧️" : "📊"}</span>
        <Avatar emoji={profile.avatar} photo={profile.photoThumb ?? profile.photo} name={profile.pseudo} size="md" rp={rp} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-black text-white">
          {pending.zone === "relegation"
            ? `Semaine difficile : ${ordinal(pending.rank)} de ta ${leagueName(pending.tierId)}.`
            : `Tu as fini ${ordinal(pending.rank)} de ta ${leagueName(pending.tierId)} !`}
        </p>
        <p className="text-sm text-slate-300">
          {pending.xp} XP gagnés la semaine dernière{rewards ? ` · récompense : ${rewards}` : ""}.
          {pending.zone === "relegation" ? " Nouvelle semaine, nouvelle chance !" : " Un nouveau groupe t'attend."}
        </p>
      </div>
      <Button variant={pending.zone === "promotion" ? "gold" : "secondary"} onClick={acknowledge}>
        {pending.zone === "promotion" ? "Génial !" : "C'est parti"}
      </Button>
    </section>
  );
}
