"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, SectionTitle } from "@/components/ui/Card";
import { buildFeed, timeAgo } from "@/lib/game/feed";
import { useGame } from "@/lib/store/game-store";

/** Fil d'actualité de l'accueil : tes derniers exploits. */
export function NewsFeed({ count = 7 }: { count?: number }) {
  const feed = useGame((s) => s.feed);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const items = useMemo(() => buildFeed(feed, count), [feed, count]);

  return (
    <Card>
      <SectionTitle icon={<span>📰</span>}>Mes exploits</SectionTitle>
      {items.length === 0 ? (
        <p className="rounded-2xl bg-slate-800/40 p-4 text-sm text-slate-400">
          Rien pour l&apos;instant : bats un boss, monte de rang ou{" "}
          <Link href="/duels" className="font-semibold text-violet-300 underline">gagne un duel</Link> pour remplir ton fil.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 rounded-2xl bg-violet-600/15 p-2.5 ring-1 ring-violet-500/30">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900/70 text-xl">{it.emoji}</span>
              <p className="min-w-0 flex-1 text-sm leading-snug text-slate-200">
                {it.text}
                <span className="block text-[11px] text-slate-500">{timeAgo(it.at, now)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
