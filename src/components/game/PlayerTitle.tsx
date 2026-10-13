import clsx from "clsx";
import { activeTierReward, rewardFor, tierById } from "@/lib/game/ranks";

/**
 * Titre affiché sous le pseudo. Avec `peakRp`, le titre choisi `titleId`
 * n'est retenu que s'il est débloqué.
 */
export function PlayerTitle({ titleId, peakRp, className }: { titleId?: string; peakRp?: number; className?: string }) {
  const reward = peakRp !== undefined ? activeTierReward(titleId, peakRp) : rewardFor(titleId ?? "bronze");
  const tier = tierById(reward.tierId);
  return (
    <span className={clsx("inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide", className)} style={{ color: tier.color }}>
      <span aria-hidden>{tier.emoji}</span>
      {reward.title}
    </span>
  );
}
