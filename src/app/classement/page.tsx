"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Avatar } from "@/components/game/Avatar";
import { RankBadge } from "@/components/game/RankBadge";
import { Tabs } from "@/components/ui/Tabs";
import { levelLabel } from "@/lib/content/curriculum";
import { type LeaderboardScope, buildLeaderboard, realEntries } from "@/lib/game/leaderboard";
import type { PublicProfile } from "@/lib/game/save";
import { levelFromXp, rankFromRp } from "@/lib/game/progression";
import { useCloud } from "@/lib/store/cloud-sync";
import { useGame } from "@/lib/store/game-store";

const PODIUM = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const game = useGame();
  const profile = game.profile!;
  const [scope, setScope] = useState<LeaderboardScope>("hebdo");
  const selfId = useCloud((s) => s.user?.id ?? null);
  const [players, setPlayers] = useState<PublicProfile[]>([]);

  // Vrais joueurs inscrits ; hors ligne, on garde seulement les rivaux simulés.
  useEffect(() => {
    let alive = true;
    fetch("/api/leaderboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { players: [] }))
      .then((json: { players?: PublicProfile[] }) => alive && setPlayers(Array.isArray(json.players) ? json.players : []))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const entries = useMemo(
    () =>
      buildLeaderboard(
        { pseudo: profile.pseudo, avatar: profile.avatar, photo: profile.photo ?? profile.photoThumb, level: profile.level, playerLevel: levelFromXp(game.xp).level, weeklyXp: game.weekly.xp, rp: game.rp },
        scope,
        new Date(),
        realEntries(players, selfId),
      ),
    [profile, game.xp, game.weekly.xp, game.rp, scope, players, selfId],
  );
  const realCount = players.filter((p) => p.id !== selfId).length;
  const position = entries.findIndex((e) => e.isPlayer) + 1;
  const above = entries[position - 2];
  const valueOf = (e: (typeof entries)[number]) => (scope === "hebdo" ? `${e.weeklyXp} XP` : `${e.rp} RP`);
  const gap = above ? (scope === "hebdo" ? above.weeklyXp - game.weekly.xp : above.rp - game.rp) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">🏆 Classement</h1>
          <p className="text-slate-400">
            Tu es <b className="text-white">{position}<sup>e</sup></b> sur {entries.length}
            {above && <> · encore <b className="text-violet-300">{gap + 1} {scope === "hebdo" ? "XP" : "RP"}</b> pour dépasser {above.pseudo}</>}
          </p>
        </div>
        <Tabs<LeaderboardScope>
          value={scope}
          onChange={setScope}
          options={[
            { value: "hebdo", label: "Cette semaine" },
            { value: "global", label: "Rang global" },
            { value: "niveau", label: levelLabel(profile.level) },
          ]}
        />
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 items-end gap-3">
        {[1, 0, 2].map((i) => {
          const e = entries[i];
          if (!e) return <div key={i} />;
          return (
            <div key={e.id} className={clsx("rounded-3xl border p-4 text-center", e.isPlayer ? "border-violet-400 bg-violet-600/20" : "border-white/10 bg-slate-900/70", i === 0 ? "pb-8" : "pb-4")}>
              <div className="text-3xl">{PODIUM[i]}</div>
              <Avatar emoji={e.avatar} photo={e.photo} name={e.pseudo} size={i === 0 ? "lg" : "md"} rp={e.rp} className="mx-auto my-2" />
              <p className="truncate font-bold text-white">{e.pseudo}</p>
              <p className="text-sm text-violet-300">{valueOf(e)}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
        {entries.map((e, i) => (
          <div key={e.id} className={clsx("flex items-center gap-3 border-b border-white/5 px-4 py-2.5 last:border-0", e.isPlayer && "bg-violet-600/20")}>
            <span className={clsx("w-8 text-center font-black", i < 3 ? "text-amber-300" : "text-slate-500")}>{i + 1}</span>
            <Avatar emoji={e.avatar} photo={e.photo} name={e.pseudo} size="sm" rp={e.rp} />
            <div className="min-w-0 flex-1">
              <p className={clsx("flex items-center gap-1.5 font-semibold", e.isPlayer ? "text-violet-200" : "text-white")}>
                <span className="truncate">{e.pseudo}{e.isPlayer && " (toi)"}</span>
                {e.isReal && (
                  <span title="Vrai joueur inscrit" className="shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">Joueur</span>
                )}
              </p>
              <p className="text-xs text-slate-500">Niv. {e.playerLevel} · {levelLabel(e.level)}</p>
            </div>
            <span className="hidden sm:block"><RankBadge rp={e.rp} size="sm" /></span>
            <span className="w-24 text-right font-mono text-sm font-bold text-slate-200">{valueOf(e)}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-slate-500">
        Rang actuel : {rankFromRp(game.rp).label}. Le classement hebdomadaire repart à zéro chaque lundi. {realCount > 0
          ? `${realCount} joueur${realCount > 1 ? "s" : ""} inscrit${realCount > 1 ? "s" : ""} (badge « Joueur ») et des rivaux simulés.`
          : "Rivaux simulés en attendant d'autres joueurs inscrits."}
      </p>
    </div>
  );
}
