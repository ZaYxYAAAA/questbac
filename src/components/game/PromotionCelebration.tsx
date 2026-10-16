"use client";

import { useEffect, useRef } from "react";
import { celebrate } from "@/components/game/RewardScreen";
import { RankEmblem } from "@/components/game/RankEmblem";
import { Button } from "@/components/ui/Button";
import { rewardFor } from "@/lib/game/ranks";
import { useCelebration } from "@/lib/store/celebration-store";
import { play } from "@/lib/sound";

const AUTO_CLOSE_MS = 6500;

/** Célébration plein écran d'une promotion : emblème, confettis. Se ferme seule ou d'un geste. */
export function PromotionCelebration() {
  const promotion = useCelebration((s) => s.promotion);
  const close = useCelebration((s) => s.close);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!promotion) return;
    button.current?.focus({ preventScroll: true });
    play("promotion");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) void celebrate(promotion.newTier ? "big" : "small");
    const timer = setTimeout(close, AUTO_CLOSE_MS);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [promotion, close]);

  if (!promotion) return null;
  const { step, newTier } = promotion;
  const reward = rewardFor(step.tier.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qb-promo-title"
      onClick={close}
      className="qb-fade fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-slate-950/85 p-6 backdrop-blur-sm"
    >
      <div
        aria-hidden
        className="qb-rays pointer-events-none absolute left-1/2 top-1/2 h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-30"
        style={{ background: `repeating-conic-gradient(${step.tier.color}55 0deg 8deg, transparent 8deg 24deg)` }}
      />
      <div className="relative flex max-w-sm flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
        <p className="qb-pop text-sm font-black uppercase tracking-[0.3em]" style={{ color: step.tier.color }}>
          {newTier ? "Nouveau palier" : "Promotion"}
        </p>
        <RankEmblem tierId={step.tier.id} division={step.division} size="xl" className="qb-emblem my-6" />
        <h2 id="qb-promo-title" className="text-4xl font-black text-white">{step.label}</h2>
        <p className="mt-2 text-slate-300">
          {newTier ? "Tu rejoins un nouveau palier. Les rivaux seront plus coriaces !" : "Tu montes d'une division. Continue sur ta lancée !"}
        </p>
        {newTier && (
          <div className="qb-pop mt-4 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm" style={{ animationDelay: "500ms" }}>
            <p className="text-slate-400">Débloqués :</p>
            <p className="font-bold" style={{ color: step.tier.color }}>Titre « {reward.title} » · {reward.frame}</p>
          </div>
        )}
        <Button ref={button} variant="gold" className="mt-6" onClick={close}>Continuer</Button>
      </div>
    </div>
  );
}
