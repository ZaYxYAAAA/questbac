"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, Heart, Lock, Swords, Timer, Zap } from "lucide-react";
import { BossFight } from "@/components/game/BossFight";
import { RewardScreen } from "@/components/game/RewardScreen";
import { Button, LinkButton } from "@/components/ui/Button";
import { bossById, bossQuestionPool } from "@/lib/content/bosses";
import { seenFor } from "@/lib/store/seen-questions";
import { bossStatus } from "@/lib/game/selectors";
import type { RewardSummary } from "@/lib/game/state";
import { useGame } from "@/lib/store/game-store";
import { announce } from "@/lib/store/toast-store";

type Phase = { kind: "intro" } | { kind: "fight"; round: number } | { kind: "done"; won: boolean; summary: RewardSummary; durationMs: number };

export function BossArena({ bossId }: { bossId: string }) {
  const boss = bossById(bossId)!;
  const game = useGame();
  const recordSession = useGame((s) => s.recordSession);
  const level = game.profile!.level;
  const effectiveLevel = boss.level === "all" ? level : boss.level;
  const status = bossStatus(game, boss, effectiveLevel);
  const pool = useMemo(() => bossQuestionPool(boss, effectiveLevel, seenFor()), [boss, effectiveLevel]);
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });

  if (phase.kind === "fight") {
    return (
      <BossFight
        key={phase.round}
        boss={boss}
        pool={pool}
        onComplete={({ won, result, hpLeft }) => {
          const summary = recordSession({
            kind: "boss",
            bossId: boss.id,
            subject: boss.subject,
            result,
            won,
            xpReward: boss.xpReward,
            rpReward: boss.rpReward,
            bossHpLeft: hpLeft,
          });
          announce(summary, { questsOnly: true });
          setPhase({ kind: "done", won, summary, durationMs: result.durationMs });
        }}
      />
    );
  }

  if (phase.kind === "done") {
    return (
      <RewardScreen
        summary={phase.summary}
        emoji={phase.won ? "🏆" : "☠️"}
        heading={phase.won ? `${boss.name} est vaincu !` : "Défaite…"}
        subheading={phase.won ? `« ${boss.defeatLine} » · ${Math.round(phase.durationMs / 1000)} s` : "Révise les chapitres de ce territoire et reviens plus fort."}
        onReplay={() => setPhase({ kind: "fight", round: Date.now() })}
        backHref="/boss"
        backLabel="Repaire des boss"
      />
    );
  }

  const record = game.bosses[boss.id];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/boss" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft size={16} /> Repaire des boss
      </Link>

      <div className={clsx("relative overflow-hidden rounded-3xl bg-gradient-to-br p-8 text-center", boss.gradient)}>
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="relative">
          <div className="qb-bob text-8xl">{boss.emoji}</div>
          <h1 className="mt-4 text-3xl font-black text-white">{boss.name}</h1>
          <p className="text-white/80">{boss.title}</p>
          <p className="mx-auto mt-4 max-w-md rounded-2xl bg-black/40 px-4 py-3 italic text-white">« {boss.intro} »</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: <Heart size={18} className="text-rose-400" />, label: "Points de vie", value: `${boss.hp}` },
          { icon: <Timer size={18} className="text-cyan-400" />, label: "Par question", value: `${boss.secondsPerQuestion} s` },
          { icon: <Zap size={18} className="text-amber-400" />, label: "Récompense", value: `${boss.xpReward} XP` },
          { icon: <Swords size={18} className="text-violet-400" />, label: "Victoires", value: `${record?.victories ?? 0}/${record?.attempts ?? 0}` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 text-center">
            <div className="flex justify-center">{s.icon}</div>
            <p className="mt-1 text-lg font-black text-white">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-3xl border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">
        <p className="font-bold text-white">Règles du combat</p>
        <p>❤️ Tu as 3 cœurs : chaque erreur ou temps écoulé t&apos;en coûte un.</p>
        <p>⚔️ Chaque bonne réponse inflige des dégâts ; le combo les augmente de 15 % par réponse.</p>
        <p>⚡ Réponds dans le premier tiers du temps pour un coup critique (×1,5).</p>
        <p>😡 Sous 50 % de PV, le boss s&apos;enrage : tu n&apos;as plus que 70 % du temps.</p>
      </div>

      {status.unlocked && pool.length > 0 ? (
        <Button variant="gold" className="w-full py-4 text-lg" onClick={() => setPhase({ kind: "fight", round: Date.now() })}>
          <Swords /> Lancer le combat
        </Button>
      ) : pool.length === 0 ? (
        <p className="rounded-2xl bg-slate-800 p-4 text-center text-slate-300">Ce boss n&apos;a pas encore de questions pour ta classe.</p>
      ) : (
        <div className="space-y-3 text-center">
          <p className="flex items-center justify-center gap-2 rounded-2xl bg-slate-800 p-4 text-slate-300">
            <Lock size={16} /> Valide encore {status.required - status.completed} chapitre(s) pour affronter ce boss.
          </p>
          <LinkButton href={`/matieres/${boss.subject}?niveau=${effectiveLevel}`} variant="secondary">Aller aux chapitres</LinkButton>
        </div>
      )}
    </div>
  );
}
