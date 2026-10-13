"use client";

import { useState } from "react";
import clsx from "clsx";
import { RANK_TIERS, rankFromRp } from "@/lib/game/progression";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, string> = {
  xs: "h-7 w-7 text-base",
  sm: "h-9 w-9 text-xl",
  md: "h-12 w-12 text-3xl",
  lg: "h-16 w-16 text-4xl",
  xl: "h-24 w-24 text-6xl",
};

const RING: Record<AvatarSize, number> = { xs: 2, sm: 2, md: 2, lg: 3, xl: 4 };

/** À partir de Diamant, le cadre brille. */
const GLOW_FROM = RANK_TIERS.findIndex((t) => t.id === "diamant");

/**
 * Avatar du joueur : sa photo s'il en a une, sinon son emoji.
 * Avec `rp`, le cadre prend la couleur du rang (et un halo pour les rangs élevés).
 */
export function Avatar({
  emoji,
  photo,
  name,
  size = "md",
  rp,
  className,
}: {
  emoji: string;
  photo?: string | null;
  /** Pseudo, pour le texte alternatif. */
  name?: string;
  size?: AvatarSize;
  rp?: number;
  className?: string;
}) {
  // Photo illisible (données abîmées) : on revient à l'emoji.
  const [broken, setBroken] = useState<string | null>(null);
  const showPhoto = Boolean(photo) && broken !== photo;
  const label = name ? `Avatar de ${name}` : "Avatar";

  let style: React.CSSProperties | undefined;
  if (rp !== undefined) {
    const tier = rankFromRp(rp).tier;
    const glow = RANK_TIERS.indexOf(tier) >= GLOW_FROM;
    const ring = RING[size];
    style = { boxShadow: `0 0 0 ${ring}px ${tier.color}${glow ? `, 0 0 ${ring * 4}px ${ring}px ${tier.color}88` : ""}` };
  }

  return (
    <span
      className={clsx(
        "relative inline-grid shrink-0 select-none place-items-center overflow-hidden rounded-full bg-slate-800 leading-none",
        SIZES[size],
        rp === undefined && "ring-2 ring-violet-500/50",
        className,
      )}
      style={style}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- data URL locale, rien à optimiser
        <img src={photo!} alt={label} draggable={false} className="h-full w-full object-cover" onError={() => setBroken(photo!)} />
      ) : (
        <span role="img" aria-label={label}>{emoji}</span>
      )}
    </span>
  );
}
