"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Avatar } from "@/components/game/Avatar";
import { Card, SectionTitle } from "@/components/ui/Card";
import { buildFeed, timeAgo } from "@/lib/game/feed";
import { leagueOpponents } from "@/lib/game/league";
import { playerFrame } from "@/lib/game/ranks";
import { leagueKey } from "@/lib/game/state";
import { useGame } from "@/lib/store/game-store";

/** Fil d'actualité de l'accueil : tes exploits et ceux des rivaux de ta ligue. */
export function NewsFeed({ count = 7 }: { count?: number }) {
  const game = useGame();
  const profile = game.profile!;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const names = useMemo(() => leagueOpponents(game.league, leagueKey(game)).map((o) => o.pseudo), [game]);
  const items = useMemo(() => buildFeed(game.feed, profile.avatar, now, count, names), [game.feed, profile.avatar, now, count, names]);

  return (
    <Card>
      <SectionTitle icon={<span>📰</span>} action={<span className="flex items-center gap-1.5 text-xs text-emerald-300"><span className="relative h-2 w-2 rounded-full bg-emerald-400"><span className="qb-pulse absolute inset-0 rounded-full bg-emerald-400" /></span>En direct</span>}>
        Fil d&apos;actualité
      </SectionTitle>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className={clsx("flex items-center gap-3 rounded-2xl p-2.5", it.mine ? "bg-violet-600/15 ring-1 ring-violet-500/30" : "bg-slate-800/40")}>
            {it.mine ? (
              <Avatar emoji={profile.avatar} photo={profile.photoThumb ?? profile.photo} name={profile.pseudo} size="sm" rp={game.rp} frame={playerFrame(profile, game.peakRp)} />
            ) : (
              <Avatar emoji={it.avatar} name={it.who ?? undefined} size="sm" />
            )}
            <p className="min-w-0 flex-1 text-sm leading-snug text-slate-300">
              {it.who && <b className="text-white">{it.who} </b>}
              {it.text}
              <span className="block text-[11px] text-slate-500">{timeAgo(it.at, now.getTime())}</span>
            </p>
            <span className="shrink-0 text-xl">{it.emoji}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
