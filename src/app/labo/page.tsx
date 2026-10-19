"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { LEVELS } from "@/lib/content/curriculum";
import { LABS } from "@/lib/content/labs";
import { useGame } from "@/lib/store/game-store";
import type { Level } from "@/lib/types";

export default function LabsPage() {
  const game = useGame();
  const [level, setLevel] = useState<Level | "all">(game.profile!.level);
  const labs = LABS.filter((l) => level === "all" || l.levels.includes(level));

  return (
    <div className="space-y-4">
      <PageHeader
        title="🧪 Labo"
        subtitle="Courbes et figures à manipuler du bout du doigt."
        action={<Tabs<Level | "all"> value={level} onChange={setLevel} options={[...LEVELS.map((l) => ({ value: l.id as Level | "all", label: l.label })), { value: "all", label: "Tous" }]} />}
      />
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => {
          const opened = game.stats.labsOpened.includes(lab.id);
          return (
            <Link key={lab.id} href={`/labo/${lab.id}`} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-3 transition hover:border-violet-400/40 active:scale-[0.99]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-2xl">{lab.emoji}</span>
              <div className="min-w-0 flex-1">
                <h2 className="flex min-w-0 items-center gap-1.5 font-bold text-white">
                  <span className="truncate">{lab.title}</span>
                  {opened && <Check size={14} className="shrink-0 text-emerald-400" aria-label="Exploré" />}
                </h2>
                <p className="line-clamp-2 text-xs text-slate-400">{lab.description}</p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-slate-300" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
