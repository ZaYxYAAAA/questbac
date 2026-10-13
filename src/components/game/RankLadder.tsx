"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { Crown, Lock, MapPin } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { RankEmblem } from "@/components/game/RankEmblem";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { LeaderboardEntry } from "@/lib/game/leaderboard";
import { RANK_TIERS, rankFromRp } from "@/lib/game/progression";
import { RANK_STEPS, formatShare, playerFrame, rewardFor, tierPopulation } from "@/lib/game/ranks";
import { useGame } from "@/lib/store/game-store";

const fmt = (n: number) => n.toLocaleString("fr-FR");

/**
 * L'échelle complète des rangs, du sommet (Légende) à la base (Bronze III) :
 * seuils, part des joueurs, récompenses, rivaux présents et position du joueur.
 */
export function RankLadder({ entries }: { entries: LeaderboardEntry[] }) {
  const game = useGame();
  const profile = game.profile!;
  const rank = rankFromRp(game.rp);
  const frame = playerFrame(profile, game.peakRp);

  const byTier = useMemo(() => {
    const map: Record<string, LeaderboardEntry[]> = {};
    for (const e of entries) {
      if (e.isPlayer) continue;
      (map[rankFromRp(e.rp).tier.id] ??= []).push(e);
    }
    return map;
  }, [entries]);

  const population = useMemo(() => {
    const real: Record<string, number> = {};
    for (const e of entries) real[rankFromRp(e.rp).tier.id] = (real[rankFromRp(e.rp).tier.id] ?? 0) + 1;
    return tierPopulation(real);
  }, [entries]);
  const total = population.reduce((n, p) => n + p.players, 0);

  // Part des autres joueurs que le joueur dépasse en RP.
  const others = entries.filter((e) => !e.isPlayer);
  const better = others.length ? (others.filter((e) => e.rp < game.rp).length / others.length) * 100 : 0;
  const maxShare = Math.max(1, ...population.map((p) => p.share));

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-700/30 to-slate-950 p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <Avatar emoji={profile.avatar} photo={profile.photo} name={profile.pseudo} size="lg" rp={game.rp} frame={frame} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-200">Ton rang</p>
            <p className="text-2xl font-black text-white">{rank.label}</p>
            <p className="text-sm text-slate-300">
              Rang général du mode classé{others.length > 0 && <> · tu fais mieux que <b className="text-white">{formatShare(better)}</b> des autres joueurs</>}
            </p>
          </div>
        </div>
        {rank.nextLabel && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-slate-300">
              <span>{rank.label}</span>
              <span>prochaine division : <b className="text-white">{rank.nextLabel}</b></span>
            </div>
            <ProgressBar value={rank.progress} height="h-2.5" barClassName="bg-gradient-to-r from-cyan-400 to-violet-500" />
          </div>
        )}
        <p className="mt-3 text-xs text-slate-400">
          {fmt(total)} joueurs classés. Une division se gagne en finissant dans le haut de ton groupe de la semaine. Chaque palier débloque un titre et un cadre d&apos;avatar, à choisir dans ton profil.
        </p>
      </section>

      <ol className="relative space-y-3">
        <span aria-hidden className="absolute bottom-8 left-[2.4rem] top-8 w-1 rounded-full bg-gradient-to-b from-amber-300/60 via-violet-500/40 to-orange-800/40 sm:left-[2.9rem]" />
        {[...RANK_TIERS].reverse().map((tier) => {
          const idx = RANK_TIERS.indexOf(tier);
          const reached = game.peakRp >= tier.minRp;
          const current = rank.tier.id === tier.id;
          const legend = tier.id === "legende";
          const reward = rewardFor(tier.id);
          const pop = population[idx];
          const steps = RANK_STEPS.filter((s) => s.tier.id === tier.id);
          const rivals = (byTier[tier.id] ?? []).sort((a, b) => b.rp - a.rp);
          const next = RANK_TIERS[idx + 1];

          return (
            <li
              key={tier.id}
              className={clsx(
                "relative overflow-hidden rounded-3xl border p-3 sm:p-4",
                current ? "qb-here border-violet-400 bg-violet-600/15" : legend ? "border-amber-300/50 bg-gradient-to-br from-amber-500/15 via-slate-900/90 to-fuchsia-900/30" : reached ? "border-white/10 bg-slate-900/80" : "border-white/5 bg-slate-950/80",
              )}
            >
              {legend && <span aria-hidden className="qb-legend pointer-events-none absolute inset-0" />}
              {!reached && !legend && <span aria-hidden className="qb-mystery pointer-events-none absolute inset-0" />}
              <div className="relative flex gap-3 sm:gap-4">
                <RankEmblem tierId={tier.id} size={legend ? "lg" : "md"} locked={!reached && !legend} className={clsx("z-10", legend && "-ml-1 sm:-ml-2")} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <h3 className={clsx("text-lg font-black", !reached && !legend && "opacity-80")} style={{ color: tier.color }}>{tier.name}</h3>
                    {legend && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
                        <Crown size={11} /> Le sommet
                      </span>
                    )}
                    {current && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                        <MapPin size={11} /> Tu es ici
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {steps.length > 1 ? `${steps.length} divisions` : next ? "Une seule division" : "Le dernier palier"} · {formatShare(pop.share)} des joueurs ({fmt(pop.players)})
                  </p>
                  <div className="mt-1 h-1 w-full max-w-48 overflow-hidden rounded-full bg-slate-800" title={`${formatShare(pop.share)} des joueurs`}>
                    <div className="h-full rounded-full" style={{ width: `${Math.max(2, (pop.share / maxShare) * 100)}%`, background: tier.color }} />
                  </div>

                  {/* Divisions */}
                  {steps.length > 1 && (
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {steps.map((s) => {
                        const here = rank.label === s.label;
                        const done = game.rp >= (s.maxRp ?? Infinity);
                        return (
                          <div key={s.label} className={clsx("rounded-lg px-2 py-1 text-center text-[11px] leading-tight", here ? "bg-violet-500 font-bold text-white" : done ? "bg-white/10 text-slate-200" : "bg-slate-800/70 text-slate-500")}>
                            <span className="block font-bold">{s.division}</span>
                            {here ? "toi" : done ? "✓" : "·"}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {current && rank.nextLabel && (
                    <div className="mt-2">
                      <ProgressBar value={rank.progress} height="h-1.5" barClassName="bg-gradient-to-r from-cyan-400 to-violet-500" />
                      <p className="mt-1 text-[11px] text-violet-200">Monte en classé pour atteindre {rank.nextLabel}</p>
                    </div>
                  )}

                  {/* Récompense */}
                  <div className={clsx("mt-2 flex items-center gap-2 rounded-xl p-2", reached ? "bg-slate-950/40" : "bg-slate-950/60")}>
                    <Avatar emoji={profile.avatar} photo={profile.photoThumb ?? profile.photo} name={profile.pseudo} size="sm" frame={tier.id} className={clsx(!reached && "opacity-70")} />
                    <div className="min-w-0 text-xs">
                      <p className="truncate font-bold" style={{ color: reached ? tier.color : undefined }}>
                        {!reached && <Lock size={11} className="mr-1 inline text-slate-500" />}Titre « {reward.title} »
                      </p>
                      <p className="truncate text-slate-400">{reward.frame}{reached ? " · débloqué" : ""}</p>
                    </div>
                  </div>

                  {/* Rivaux du palier */}
                  {rivals.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {rivals.slice(0, 5).map((e) => (
                          <Avatar key={e.id} emoji={e.avatar} photo={e.photo} name={e.pseudo} size="xs" frame={e.frameId} rp={e.rp} emblem={false} className="ring-2 ring-slate-950" />
                        ))}
                      </div>
                      <p className="min-w-0 truncate text-xs text-slate-400">
                        {rivals.slice(0, 2).map((e) => e.pseudo).join(", ")}
                        {rivals.length > 2 && ` et ${rivals.length - 2} autre${rivals.length > 3 ? "s" : ""}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="text-center text-xs text-slate-500">
        Répartition des joueurs inscrits. Les titres et cadres restent acquis même si tu redescends.
      </p>
    </div>
  );
}
