"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { PHOTO_BANNER, bannerById, defaultBannerId } from "@/lib/game/banners";

/**
 * Fond de bannière : une bannière prédéfinie (dégradés + effet animé) ou
 * l'image envoyée par le joueur. Le contenu est posé par-dessus.
 */
export function ProfileBanner({
  bannerId,
  image,
  peakRp = 0,
  className,
  children,
  fx = true,
  shade = true,
}: {
  bannerId?: string | null;
  /** Image de la bannière « photo » (grande ou miniature). */
  image?: string | null;
  /** Sert à choisir la bannière par défaut (celle du meilleur palier). */
  peakRp?: number;
  className?: string;
  children?: ReactNode;
  /** Effets animés (désactivés dans les longues listes). */
  fx?: boolean;
  /** Voile sombre pour la lisibilité du texte. */
  shade?: boolean;
}) {
  const photo = bannerId === PHOTO_BANNER && image;
  const banner = photo ? null : bannerById(bannerId) ?? bannerById(defaultBannerId(peakRp))!;
  return (
    <div className={clsx("qbb", className)} style={banner ? { background: banner.bg } : undefined}>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element -- data URL locale
        <img src={image} alt="" draggable={false} className="absolute inset-0 -z-10 h-full w-full object-cover" />
      )}
      {fx && banner?.fx && <span aria-hidden className={clsx("qbb-fx", `qbb-${banner.fx}`)} />}
      {shade && <span aria-hidden className="qbb-fx bg-gradient-to-r from-slate-950/70 via-slate-950/30 to-transparent" />}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
