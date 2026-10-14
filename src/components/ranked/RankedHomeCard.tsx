"use client";

import Link from "next/link";
import { Swords } from "lucide-react";
import { RankEmblem } from "@/components/game/RankEmblem";
import { rankFromRp } from "@/lib/game/progression";
import { useGame } from "@/lib/store/game-store";

/** Accueil : mon rang et l'entrée du mode classé. */
export function RankedHomeCard() {
  const rp = useGame((s) => s.rp);
  const info = rankFromRp(rp);
  return (
    <Link
      href="/classement"
      className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 p-4"
    >
      <RankEmblem tierId={info.tier.id} division={info.division} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Mode classé</p>
        <p className="truncate text-lg font-black text-white">{info.label}</p>
        <p className="text-xs text-slate-400">Parties à 3 en direct · {rp} pts</p>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-sm font-bold text-slate-950 transition group-hover:brightness-110">
        <Swords size={16} /> Jouer
      </span>
    </Link>
  );
}
