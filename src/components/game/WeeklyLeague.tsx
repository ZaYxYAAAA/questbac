"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronsDown, ChevronsUp, Clock } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { RankEmblem } from "@/components/game/RankEmblem";
import {
  LEAGUE_SIZE,
  PROMOTION_SPOTS,
  RELEGATION_SPOTS,
  formatCountdown,
  leagueName,
  leagueReward,
  leagueStandings,
  weekEnd,
  weekProgress,
  zoneOf,
} from "@/lib/game/league";
import { playerFrame, tierById } from "@/lib/game/ranks";
import { leagueKey } from "@/lib/game/state";
import { useGame } from "@/lib/store/game-store";

/** Compte à rebours jusqu'à la fin de la semaine (rafraîchi chaque seconde). */
export function LeagueCountdown({ className }: { className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className={clsx("tabular-nums", className)}>{formatCountdown(weekEnd(new Date(now)).getTime() - now)}</span>;
}

/** Classement de la ligue de la semaine, recalculé chaque minute. */
export function useLeagueStandings() {
  const game = useGame();
  const profile = game.profile!;
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const rows = useMemo(
    () => leagueStandings(game.league, leagueKey(game), { pseudo: profile.pseudo, avatar: profile.avatar, weeklyXp: game.weekly.xp }, weekProgress(now)),
    [game, profile, now],
  );
  const position = rows.findIndex((r) => r.isPlayer) + 1;
  return { rows, position, tierId: game.league.tierId };
}

const ordinal = (n: number) => (n === 1 ? "1er" : `${n}e`);

export function WeeklyLeague() {
  const game = useGame();
  const profile = game.profile!;
  const { rows, position, tierId } = useLeagueStandings();
  const tier = tierById(tierId);
  const zone = zoneOf(position, rows.length);
  const last = game.league.last;
  const above = rows[position - 2];
  const frame = playerFrame(profile, game.peakRp);

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-4 sm:p-5">
        <div aria-hidden className="absolute inset-0 opacity-25" style={{ background: `radial-gradient(30rem 14rem at 0% 0%, ${tier.color}, transparent 70%)` }} />
        <div className="relative flex items-center gap-4">
          <RankEmblem tierId={tierId} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Ligue de la semaine</p>
            <h2 className="text-2xl font-black text-white">{leagueName(tierId)}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
              <Clock size={15} className="text-amber-300" /> Fin dans <LeagueCountdown className="font-bold text-amber-200" />
            </p>
          </div>
        </div>
        <div className="relative mt-4 rounded-2xl bg-slate-950/50 p-3 text-sm">
          {game.weekly.xp === 0 ? (
            <p className="text-slate-300">Gagne ta première XP de la semaine pour entrer dans la course : <b className="text-white">{LEAGUE_SIZE - 1} rivaux</b> de ton niveau t&apos;attendent.</p>
          ) : (
            <p className="text-slate-300">
              Tu es <b className="text-white">{ordinal(position)}</b> sur {rows.length}
              {zone === "promotion" && <span className="text-emerald-300"> · zone de promotion, tiens bon !</span>}
              {zone === "relegation" && <span className="text-rose-300"> · zone de relégation, remonte vite !</span>}
              {above && <> · <b className="text-violet-300">{above.weeklyXp - game.weekly.xp + 1} XP</b> pour dépasser {above.pseudo}</>}
            </p>
          )}
        </div>
      </section>

      {last && (
        <p className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-300">
          Semaine dernière : <b className="text-white">{ordinal(last.rank)}</b> de la {leagueName(last.tierId)}
          {(last.rewardXp > 0 || last.rewardRp !== 0) && (
            <> · {[last.rewardXp > 0 && `+${last.rewardXp} XP`, last.rewardRp !== 0 && `${last.rewardRp > 0 ? "+" : ""}${last.rewardRp} RP`].filter(Boolean).join(", ")}</>
          )}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        {[1, 2, 3].map((r) => {
          const rw = leagueReward(r);
          return (
            <div key={r} className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2">
              <p className="font-bold text-emerald-200">{["🥇", "🥈", "🥉"][r - 1]} {ordinal(r)}</p>
              <p className="text-emerald-100/80">+{rw.xp} XP · +{rw.rp} RP</p>
            </div>
          );
        })}
        <div className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
          <p className="font-bold text-slate-200">4e – 10e</p>
          <p className="text-slate-400">+{leagueReward(4).xp} XP</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
        {rows.map((r, i) => {
          const rank = i + 1;
          const z = zoneOf(rank, rows.length);
          return (
            <div key={r.id}>
              {rank === rows.length - RELEGATION_SPOTS + 1 && (
                <p className="flex items-center justify-center gap-1 bg-rose-500/10 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-300">
                  <ChevronsDown size={14} /> Zone de relégation · −{Math.abs(leagueReward(rows.length).rp)} RP
                </p>
              )}
              <div
                className={clsx(
                  "flex items-center gap-3 border-l-4 px-3 py-2.5 sm:px-4",
                  z === "promotion" ? "border-emerald-400 bg-emerald-500/[0.07]" : z === "relegation" ? "border-rose-500 bg-rose-500/[0.07]" : "border-transparent",
                  r.isPlayer && "!bg-violet-600/25",
                )}
              >
                <span className={clsx("w-7 text-center font-black", z === "promotion" ? "text-emerald-300" : z === "relegation" ? "text-rose-300" : "text-slate-500")}>{rank}</span>
                {r.isPlayer ? (
                  <Avatar emoji={profile.avatar} photo={profile.photoThumb ?? profile.photo} name={profile.pseudo} size="sm" rp={game.rp} frame={frame} />
                ) : (
                  <Avatar emoji={r.avatar} name={r.pseudo} size="sm" frame={tierId} />
                )}
                <p className={clsx("min-w-0 flex-1 truncate font-semibold", r.isPlayer ? "text-violet-200" : "text-white")}>
                  {r.pseudo}{r.isPlayer && " (toi)"}
                </p>
                <span className="font-mono text-sm font-bold text-slate-200">{r.weeklyXp} XP</span>
              </div>
              {rank === PROMOTION_SPOTS && (
                <p className="flex items-center justify-center gap-1 bg-emerald-500/10 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  <ChevronsUp size={14} /> Zone de promotion
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-500">
        Ton groupe est tiré chaque lundi parmi des rivaux de ton palier. Les récompenses sont versées à ta reconnexion après la fin de la semaine.
      </p>
    </div>
  );
}
