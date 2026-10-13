import { RankBadge } from "@/components/game/RankBadge";
import { PLACEMENT_MATCHES, stepMinRp } from "@/lib/game/ranked";

/** Badge d'un rang classé (par division), ou de la progression du placement. */
export function RankedBadge({ step, placementLeft, size = "md" }: { step: number; placementLeft?: number; size?: "sm" | "md" | "lg" }) {
  if (placementLeft && placementLeft > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-500 px-2.5 py-0.5 text-xs font-bold text-slate-300">
        🎯 Placement {PLACEMENT_MATCHES - placementLeft}/{PLACEMENT_MATCHES}
      </span>
    );
  }
  return <RankBadge rp={stepMinRp(step)} size={size} />;
}
