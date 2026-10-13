"use client";

import { useState } from "react";
import clsx from "clsx";
import { rankFromRp } from "@/lib/game/progression";
import { rewardFor, tierById, tierIndex } from "@/lib/game/ranks";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, string> = {
  xs: "h-7 w-7 text-base",
  sm: "h-9 w-9 text-xl",
  md: "h-12 w-12 text-3xl",
  lg: "h-16 w-16 text-4xl",
  xl: "h-24 w-24 text-6xl",
};

const RING: Record<AvatarSize, number> = { xs: 2, sm: 2, md: 3, lg: 3, xl: 4 };

/** À partir de Maître, le cadre tourne lentement. */
const SPIN_FROM = tierIndex("maitre");

/**
 * Avatar du joueur : sa photo s'il en a une, sinon son emoji.
 * Le cadre vient du palier `frame` (cadre choisi) ou, à défaut, du rang de `rp`.
 */
export function Avatar({
  emoji,
  photo,
  name,
  size = "md",
  rp,
  frame,
  emblem = size === "lg" || size === "xl",
  className,
}: {
  emoji: string;
  photo?: string | null;
  /** Pseudo, pour le texte alternatif. */
  name?: string;
  size?: AvatarSize;
  rp?: number;
  /** Palier du cadre (id) ; sinon celui du rang de `rp`. */
  frame?: string | null;
  /** Petit emblème du palier en bas à droite. */
  emblem?: boolean;
  className?: string;
}) {
  // Photo illisible (données abîmées) : on revient à l'emoji.
  const [broken, setBroken] = useState<string | null>(null);
  const showPhoto = Boolean(photo) && broken !== photo;
  const label = name ? `Avatar de ${name}` : "Avatar";
  const tierId = frame ?? (rp !== undefined ? rankFromRp(rp).tier.id : null);

  const content = showPhoto ? (
    // eslint-disable-next-line @next/next/no-img-element -- data URL locale, rien à optimiser
    <img src={photo!} alt={label} draggable={false} className="h-full w-full object-cover" onError={() => setBroken(photo!)} />
  ) : (
    <span role="img" aria-label={label}>{emoji}</span>
  );

  if (!tierId) {
    return (
      <span className={clsx("relative inline-grid shrink-0 select-none place-items-center overflow-hidden rounded-full bg-slate-800 leading-none ring-2 ring-violet-500/50", SIZES[size], className)}>
        {content}
      </span>
    );
  }

  const tier = tierById(tierId);
  const reward = rewardFor(tier.id);
  const ring = RING[size];
  const spin = tierIndex(tier.id) >= SPIN_FROM;

  return (
    <span
      className={clsx("relative inline-block shrink-0 select-none rounded-full leading-none", SIZES[size], className)}
      style={reward.glow ? { boxShadow: `0 0 ${ring * 4}px ${ring}px ${tier.color}66` } : undefined}
      title={reward.frame}
    >
      <span
        aria-hidden
        className={clsx("absolute inset-0 rounded-full", spin && "qb-frame-spin")}
        style={{ background: `conic-gradient(from 210deg, ${reward.frameColors.join(", ")})` }}
      />
      <span className="absolute grid place-items-center overflow-hidden rounded-full bg-slate-800" style={{ inset: ring }}>
        {content}
      </span>
      {emblem && (
        <span
          aria-hidden
          className={clsx("absolute -bottom-1 -right-1 grid place-items-center rounded-full border-2 border-slate-950 bg-gradient-to-br leading-none", tier.gradient, size === "xl" ? "h-8 w-8 text-base" : "h-6 w-6 text-xs")}
        >
          {tier.emoji}
        </span>
      )}
    </span>
  );
}
