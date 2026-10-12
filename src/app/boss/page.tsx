"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Lock, Swords, Trophy } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { bossesForLevel } from "@/lib/content/bosses";
import { LEVELS, subjectMeta } from "@/lib/content/curriculum";
import { bossStatus } from "@/lib/game/selectors";
import { useGame } from "@/lib/store/game-store";
import type { Level } from "@/lib/types";

export default function BossLairPage() {
  const game = useGame();
  const [level, setLevel] = useState<Level>(game.profile!.level);
  const bosses = bossesForLevel(level).map((b) => ({ boss: b, status: bossStatus(game, b, level) }));
  const defeated = bosses.filter((b) => b.status.defeated).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">💀 Repaire des boss</h1>
          <p className="text-slate-400">
            Valide des chapitres pour débloquer chaque boss. {defeated}/{bosses.length} vaincus en {LEVELS.find((l) => l.id === level)!.label}.
          </p>
        </div>
        <Tabs value={level} onChange={setLevel} options={LEVELS.map((l) => ({ value: l.id, label: l.label }))} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bosses.map(({ boss, status }) => {
          const meta = subjectMeta(boss.subject);
          const card = (
            <div className={clsx("relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-5 transition", boss.gradient, status.unlocked ? "hover:-translate-y-1 hover:shadow-2xl" : "grayscale-[0.7]")}>
              <div className={clsx("absolute inset-0", status.unlocked ? "bg-slate-950/45" : "bg-slate-950/70")} />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <span className="rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white">{meta.emoji} {meta.name}</span>
                  {status.defeated && <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-slate-950"><Trophy size={12} /> Vaincu</span>}
                </div>
                <div className={clsx("my-4 text-center text-7xl", status.unlocked && "qb-bob")}>{status.unlocked ? boss.emoji : "❔"}</div>
                <h2 className="text-xl font-black text-white">{boss.name}</h2>
                <p className="text-sm text-white/75">{boss.title}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/80">
                  <span className="rounded-md bg-black/30 px-2 py-1">❤️ {boss.hp} PV</span>
                  <span className="rounded-md bg-black/30 px-2 py-1">⏱️ {boss.secondsPerQuestion} s</span>
                  <span className="rounded-md bg-black/30 px-2 py-1">✨ {boss.xpReward} XP</span>
                  <span className="rounded-md bg-black/30 px-2 py-1">🏅 +{boss.rpReward} RP</span>
                </div>
                <div className="mt-auto pt-4">
                  {status.unlocked ? (
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-bold text-slate-900">
                      <Swords size={16} /> {status.defeated ? "Revanche" : "Affronter"}
                    </span>
                  ) : (
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black/40 py-2.5 text-sm text-white">
                      <Lock size={14} /> {status.completed}/{status.required} chapitres validés
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
          return status.unlocked ? (
            <Link key={boss.id} href={`/boss/${boss.id}`}>{card}</Link>
          ) : (
            <Link key={boss.id} href={`/matieres/${boss.subject}?niveau=${level}`} title="Valide des chapitres pour débloquer ce boss">{card}</Link>
          );
        })}
      </div>
    </div>
  );
}
