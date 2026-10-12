"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Check } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">🧪 Labo de maths</h1>
          <p className="text-slate-400">Des graphiques où tout se manipule : déplace les points, règle les curseurs, observe.</p>
        </div>
        <Tabs<Level | "all"> value={level} onChange={setLevel} options={[...LEVELS.map((l) => ({ value: l.id as Level | "all", label: l.label })), { value: "all", label: "Tous" }]} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {labs.map((lab) => {
          const opened = game.stats.labsOpened.includes(lab.id);
          return (
            <Link key={lab.id} href={`/labo/${lab.id}`} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-5 transition hover:-translate-y-1 hover:border-violet-400/40">
              <div className="absolute -right-6 -top-6 text-8xl opacity-10 transition group-hover:scale-110 group-hover:opacity-20">{lab.emoji}</div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{lab.emoji}</span>
                  {opened && <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300"><Check size={12} /> Exploré</span>}
                </div>
                <h2 className="mt-3 text-lg font-black text-white">{lab.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{lab.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {lab.interactions.map((i) => (
                    <span key={i} className="rounded-md bg-violet-500/15 px-2 py-0.5 text-xs text-violet-200">{i}</span>
                  ))}
                </div>
                <div className="mt-3 flex gap-1">
                  {lab.levels.map((l) => (
                    <span key={l} className={clsx("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", "bg-slate-800 text-slate-400")}>
                      {LEVELS.find((x) => x.id === l)!.short}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
