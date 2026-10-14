"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { Lock, Swords, Trophy } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
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
    <div className="space-y-4">
      <PageHeader
        title="💀 Boss"
        subtitle={`${defeated}/${bosses.length} vaincus · 3 essais par boss, pas un de plus.`}
        action={<Tabs value={level} onChange={setLevel} options={LEVELS.map((l) => ({ value: l.id, label: l.label }))} />}
      />

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {bosses.map(({ boss, status }) => {
          const meta = subjectMeta(boss.subject);
          return (
            <Link
              key={boss.id}
              href={status.unlocked ? `/boss/${boss.id}` : `/matieres/${boss.subject}?niveau=${level}`}
              className={clsx("relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-3 transition active:scale-[0.99]", boss.gradient, (!status.unlocked || status.lost) && "grayscale-[0.7]")}
            >
              <div className={clsx("absolute inset-0", status.unlocked ? "bg-slate-950/50" : "bg-slate-950/75")} />
              <span className={clsx("relative grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-black/30 text-4xl", status.unlocked && "qb-bob")}>{status.unlocked ? boss.emoji : "❔"}</span>
              <div className="relative min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-white/70">{meta.emoji} {meta.name}</p>
                <h2 className="truncate font-black text-white">{boss.name}</h2>
                <p className="text-xs text-white/70">
                  {status.defeated
                    ? status.flawless ? "🏅 Imbattable · vaincu du premier coup" : "🏆 Trophée gagné"
                    : status.lost
                      ? "🪦 Perdu · plus aucun essai"
                      : status.unlocked
                        ? `❤️ ${boss.hp} PV · ✨ ${boss.xpReward} XP · ${status.triesLeft}/3 essais`
                        : `🔒 ${status.completed}/${status.required} chapitres validés`}
                </p>
              </div>
              <span className="relative shrink-0">
                {status.defeated ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-slate-950"><Trophy size={12} /> Vaincu</span>
                ) : status.lost ? (
                  <span className="text-2xl grayscale">🪦</span>
                ) : status.unlocked ? (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-900"><Swords size={18} /></span>
                ) : (
                  <Lock size={18} className="text-white/60" />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
