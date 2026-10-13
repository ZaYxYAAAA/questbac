"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Avatar } from "@/components/game/Avatar";
import { PlayerTitle } from "@/components/game/PlayerTitle";
import { Tabs } from "@/components/ui/Tabs";
import { levelLabel } from "@/lib/content/curriculum";
import type { LeaderboardEntry } from "@/lib/game/leaderboard";
import { currentWeeklyXp } from "@/lib/game/save";
import { rankFromRp } from "@/lib/game/progression";
import { useCloud } from "@/lib/store/cloud-sync";
import { loadFriends, useFriends } from "@/lib/store/friends-store";

type Scope = "hebdo" | "global";

/** Classement entre amis : le joueur et ses amis, à la semaine ou au rang. */
export function FriendsBoard({ player }: { player: Omit<LeaderboardEntry, "id" | "isPlayer"> }) {
  const user = useCloud((s) => s.user);
  const { friends, loaded } = useFriends();
  const [scope, setScope] = useState<Scope>("hebdo");

  useEffect(() => {
    if (user) loadFriends();
  }, [user]);

  const rows = useMemo(() => {
    const now = new Date();
    const list: LeaderboardEntry[] = [
      { ...player, id: "player", isPlayer: true },
      ...friends.map((f) => ({
        id: f.id,
        pseudo: f.pseudo,
        avatar: f.avatar,
        photo: f.photoThumb,
        titleId: f.titleId,
        frameId: f.frameId,
        level: f.level,
        playerLevel: f.playerLevel,
        weeklyXp: currentWeeklyXp(f, now),
        rp: f.rp,
        isReal: true,
      })),
    ];
    const key = scope === "hebdo" ? "weeklyXp" : "rp";
    return list.sort((a, b) => b[key] - a[key] || (a.isPlayer ? -1 : 1));
  }, [player, friends, scope]);

  if (!user) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-center">
        <p className="text-4xl">👥</p>
        <p className="mt-2 text-slate-300">Crée un compte (depuis ton profil) pour ajouter des amis et vous affronter au classement.</p>
        <Link href="/profil" className="mt-4 inline-block rounded-xl bg-violet-600 px-4 py-2 font-semibold text-white">Aller au profil</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs<Scope> value={scope} onChange={setScope} options={[{ value: "hebdo", label: "Cette semaine" }, { value: "global", label: "Rang global" }]} />
        <Link href="/amis" className="rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500">➕ Inviter des amis</Link>
      </div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70">
        {rows.map((e, i) => (
          <div key={e.id} className={clsx("flex items-center gap-3 border-b border-white/5 px-4 py-2.5 last:border-0", e.isPlayer && "bg-violet-600/20")}>
            <span className={clsx("w-8 text-center font-black", i < 3 ? "text-amber-300" : "text-slate-500")}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
            <Avatar emoji={e.avatar} photo={e.photo} name={e.pseudo} size="sm" rp={e.rp} frame={e.frameId} />
            <div className="min-w-0 flex-1">
              <p className={clsx("truncate font-semibold", e.isPlayer ? "text-violet-200" : "text-white")}>{e.pseudo}{e.isPlayer && " (toi)"}</p>
              <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                <PlayerTitle titleId={e.titleId ?? rankFromRp(e.rp).tier.id} className="text-[10px]" />
                <span>Niv. {e.playerLevel} · {levelLabel(e.level)}</span>
              </p>
            </div>
            <span className="w-24 text-right font-mono text-sm font-bold text-slate-200">{scope === "hebdo" ? `${e.weeklyXp} XP` : `${e.rp} RP`}</span>
          </div>
        ))}
      </div>
      {loaded && friends.length === 0 && (
        <p className="text-center text-sm text-slate-400">Tu n&apos;as pas encore d&apos;amis : envoie-leur ton lien d&apos;invitation depuis la page Amis.</p>
      )}
    </div>
  );
}
