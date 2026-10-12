import clsx from "clsx";
import { rankFromRp } from "@/lib/game/progression";

export function RankBadge({ rp, size = "md" }: { rp: number; size?: "sm" | "md" | "lg" }) {
  const rank = rankFromRp(rp);
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r font-bold text-slate-950 shadow",
        rank.tier.gradient,
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base",
      )}
    >
      <span>{rank.tier.emoji}</span>
      {rank.label}
    </span>
  );
}
