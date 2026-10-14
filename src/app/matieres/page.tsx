"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { LEVELS, schoolSubjects } from "@/lib/content/curriculum";
import { subjectProgress } from "@/lib/game/selectors";
import { useGame } from "@/lib/store/game-store";
import type { Level } from "@/lib/types";

export default function SubjectsPage() {
  const game = useGame();
  const [level, setLevel] = useState<Level>(game.profile!.level);

  return (
    <div className="space-y-4">
      <PageHeader
        title="🗺️ Carte"
        subtitle="Termine les chapitres pour débloquer les boss."
        action={<Tabs value={level} onChange={setLevel} options={LEVELS.map((l) => ({ value: l.id, label: l.label }))} />}
      />

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {schoolSubjects(level).map((s) => {
          const p = subjectProgress(game, s.id, level);
          return (
            <Link
              key={s.id}
              href={`/matieres/${s.id}?niveau=${level}`}
              className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3 transition hover:border-white/25 active:scale-[0.99]"
            >
              <span className={clsx("grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-2xl", s.gradient)}>{s.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="truncate font-bold text-white">{s.name}</h2>
                  <span className="shrink-0 text-xs text-slate-400">{p.stars}/{p.maxStars} ⭐</span>
                </div>
                <ProgressBar value={p.ratio} height="h-1.5" className="mt-1.5" barClassName={clsx("bg-gradient-to-r", s.gradient)} />
                <p className="mt-1 text-xs text-slate-500">{p.done}/{p.total} chapitres</p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
            </Link>
          );
        })}
      </div>

      <Link href="/culture" className="qb-press group flex items-center gap-3 rounded-2xl border border-teal-400/30 bg-gradient-to-r from-teal-500/15 to-cyan-600/10 p-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-2xl">🌍</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-white">Culture générale</h2>
          <p className="text-xs text-slate-400">Hors programme · 16 thèmes pour tous les niveaux</p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-teal-300 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
