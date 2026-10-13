import clsx from "clsx";
import { tierById } from "@/lib/game/ranks";

const SIZES = {
  sm: "h-12 w-12 text-2xl",
  md: "h-16 w-16 text-3xl",
  lg: "h-24 w-24 text-5xl",
  xl: "h-36 w-36 text-7xl",
};

/**
 * Emblème d'un palier (blason hexagonal). `locked` : silhouette mystère
 * pour les paliers pas encore atteints.
 */
export function RankEmblem({
  tierId,
  size = "md",
  locked = false,
  division,
  className,
}: {
  tierId: string;
  size?: keyof typeof SIZES;
  locked?: boolean;
  division?: string | null;
  className?: string;
}) {
  const tier = tierById(tierId);
  return (
    <span className={clsx("relative inline-grid shrink-0 place-items-center", SIZES[size], className)} aria-hidden>
      <span
        className={clsx("qb-hex absolute inset-0 bg-gradient-to-br", locked ? "from-slate-700 to-slate-900" : tier.gradient)}
        style={locked ? undefined : { filter: `drop-shadow(0 0 10px ${tier.color}88)` }}
      />
      <span className="qb-hex absolute inset-[8%] bg-slate-950/45" />
      <span className={clsx("relative leading-none", locked && "qb-silhouette")}>{tier.emoji}</span>
      {locked && <span className="absolute font-black text-slate-300/80" style={{ fontSize: "0.45em" }}>?</span>}
      {division && !locked && (
        <span className="absolute -bottom-1 rounded-full bg-slate-950 px-1.5 text-[0.3em] font-black leading-tight text-white ring-1 ring-white/20">
          {division}
        </span>
      )}
    </span>
  );
}
