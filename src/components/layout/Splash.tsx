"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useHydrated } from "@/lib/store/game-store";

const SEEN_KEY = "qb-splash-seen";
/** Durée minimale à l'ouverture de l'appli (pour que l'animation se voie). */
const MIN_MS = 1300;

/**
 * Écran de chargement au lancement : logo qui apparaît, nom, petite barre.
 * Rendu dès le HTML du serveur (pas d'écran vide pendant le chargement), puis
 * il s'efface quand la sauvegarde est lue. Une seule fois par session.
 */
export function Splash() {
  const hydrated = useHydrated();
  const [phase, setPhase] = useState<"show" | "hide" | "gone">("show");
  const [start] = useState(() => Date.now());

  useEffect(() => {
    if (!hydrated) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Stockage indisponible : on l'affiche normalement.
    }
    const wait = seen ? 0 : Math.max(0, MIN_MS - (Date.now() - start));
    const t1 = setTimeout(() => setPhase("hide"), wait);
    const t2 = setTimeout(() => setPhase("gone"), wait + 450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hydrated, start]);

  if (phase === "gone") return null;
  return (
    <div
      aria-hidden={phase === "hide"}
      role="status"
      aria-label="Chargement de QuestBac"
      className={clsx(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-[#050816] transition-opacity duration-[450ms]",
        phase === "hide" && "pointer-events-none opacity-0",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#4c1d95_0%,#1e1048_35%,#050816_70%)]" />
      <div className="relative">
        <span className="qb-splash-ring absolute -inset-6 rounded-[44px] bg-violet-500/30 blur-2xl" />
        {/* eslint-disable-next-line @next/next/no-img-element -- icône locale, affichée avant le chargement de l'appli */}
        <img src="/icon-512.png?v=2" alt="" width={120} height={120} className="qb-splash-logo relative h-[120px] w-[120px] rounded-[30px] shadow-2xl shadow-violet-950" />
      </div>
      <div className="qb-splash-text relative text-center">
        <p className="text-3xl font-black tracking-tight text-white">
          Quest<span className="text-violet-400">Bac</span>
        </p>
        <p className="mt-1 text-sm font-medium text-slate-400">Révise en jouant</p>
      </div>
      <div className="relative mt-2 h-1 w-32 overflow-hidden rounded-full bg-white/10">
        <span className="qb-splash-bar absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" />
      </div>
    </div>
  );
}
