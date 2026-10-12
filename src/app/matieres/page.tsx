"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { LEVELS, subjectsForLevel } from "@/lib/content/curriculum";
import { subjectProgress } from "@/lib/game/selectors";
import { useGame } from "@/lib/store/game-store";
import type { Level } from "@/lib/types";

export default function SubjectsPage() {
  const game = useGame();
  const [level, setLevel] = useState<Level>(game.profile!.level);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">🗺️ Carte des matières</h1>
          <p className="text-slate-400">Choisis un territoire, termine ses chapitres et débloque son boss.</p>
        </div>
        <Tabs value={level} onChange={setLevel} options={LEVELS.map((l) => ({ value: l.id, label: l.label }))} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {subjectsForLevel(level).map((s) => {
          const p = subjectProgress(game, s.id, level);
          return (
            <Link
              key={s.id}
              href={`/matieres/${s.id}?niveau=${level}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-white/25"
            >
              <div className={clsx("absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-30 blur-2xl transition group-hover:opacity-60", s.gradient)} />
              <div className={clsx("relative mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-lg", s.gradient)}>{s.emoji}</div>
              <h2 className="relative text-lg font-black text-white">{s.name}</h2>
              <p className="relative mb-3 text-sm text-slate-400">{p.done}/{p.total} chapitres · {p.stars}/{p.maxStars} ⭐</p>
              <ProgressBar value={p.ratio} barClassName={clsx("bg-gradient-to-r", s.gradient)} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
