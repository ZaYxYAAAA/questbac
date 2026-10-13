"use client";

import { type ReactNode, useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowUpCircle, RotateCcw, Star, Trophy } from "lucide-react";
import { Avatar } from "@/components/game/Avatar";
import { Button, LinkButton } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { levelFromXp } from "@/lib/game/progression";
import type { RewardSummary } from "@/lib/game/state";
import { useGame } from "@/lib/store/game-store";

export async function celebrate(intensity: "small" | "big" = "small") {
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#a78bfa", "#22d3ee", "#f472b6", "#fbbf24", "#34d399"];
  if (intensity === "small") {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 }, colors });
    return;
  }
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function RewardScreen({
  summary,
  heading,
  subheading,
  emoji,
  onReplay,
  backHref,
  backLabel = "Retour",
  children,
}: {
  summary: RewardSummary;
  heading: string;
  subheading?: string;
  emoji?: string;
  onReplay?: () => void;
  backHref: string;
  backLabel?: string;
  children?: ReactNode;
}) {
  const xp = useGame((s) => s.xp);
  const rp = useGame((s) => s.rp);
  const profile = useGame((s) => s.profile);
  const level = levelFromXp(xp);
  const counted = useCountUp(summary.xpGained);
  const levelUp = summary.levelAfter > summary.levelBefore;

  useEffect(() => {
    if (levelUp || summary.rankUp || (summary.stars ?? 0) >= 2) celebrate(levelUp ? "big" : "small");
  }, [levelUp, summary.rankUp, summary.stars]);

  return (
    <div className="mx-auto max-w-xl space-y-5 text-center">
      {emoji && <div className="qb-pop text-7xl">{emoji}</div>}
      <div>
        <h1 className="text-3xl font-black text-white">{heading}</h1>
        {subheading && <p className="mt-1 text-slate-400">{subheading}</p>}
      </div>

      {summary.stars !== undefined && (
        <div className="flex justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              size={52}
              style={{ animationDelay: `${s * 180}ms` }}
              className={clsx("qb-star", s <= summary.stars! ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" : "text-slate-700")}
            />
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-violet-500/30 bg-violet-500/10 p-5">
        <p className="text-5xl font-black text-violet-200">+{counted} <span className="text-2xl">XP</span></p>
        <p className={clsx("mt-1 font-bold", summary.rpDelta >= 0 ? "text-cyan-300" : "text-rose-300")}>
          {summary.rpDelta >= 0 ? "+" : ""}{summary.rpDelta} RP · {summary.rankAfter}
        </p>
        <div className="mt-4 text-left">
          <div className="mb-1 flex justify-between text-xs text-slate-400">
            <span>Niveau {level.level}</span>
            <span>{level.current} / {level.needed} XP</span>
          </div>
          <ProgressBar value={level.progress} height="h-3" />
        </div>
      </div>

      {(levelUp || summary.rankUp) && (
        <div className="qb-pop space-y-2">
          {levelUp && (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-3 font-black text-slate-950">
              <ArrowUpCircle /> Niveau {summary.levelAfter} atteint !
            </div>
          )}
          {summary.rankUp && (
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 p-3 font-black text-slate-950">
              {profile ? <Avatar emoji={profile.avatar} photo={profile.photo} name={profile.pseudo} size="md" rp={rp} /> : <Trophy />}
              <span>Promotion : {summary.rankBefore} → {summary.rankAfter}</span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-1.5 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-left text-sm">
        {summary.lines.map((l, i) => (
          <div key={i} className="flex justify-between gap-3">
            <span className="text-slate-400">{l.label}</span>
            <span className="shrink-0 font-semibold text-slate-100">{l.value}</span>
          </div>
        ))}
      </div>

      {summary.achievements.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Succès débloqués</h2>
          {summary.achievements.map((a) => (
            <div key={a.id} className="qb-pop flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-left">
              <span className="text-3xl">{a.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-amber-200">{a.name}</p>
                <p className="text-xs text-slate-400">{a.description}</p>
              </div>
              {a.xp > 0 && <span className="text-sm font-bold text-amber-300">+{a.xp} XP</span>}
            </div>
          ))}
        </div>
      )}

      {children}

      <div className="flex flex-wrap justify-center gap-3">
        {onReplay && (
          <Button variant="secondary" onClick={onReplay}>
            <RotateCcw size={16} /> Rejouer
          </Button>
        )}
        <LinkButton href={backHref}>{backLabel}</LinkButton>
      </div>
    </div>
  );
}
