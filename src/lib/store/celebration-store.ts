"use client";

import { create } from "zustand";
import type { Promotion } from "@/lib/game/ranks";

/** Célébration plein écran d'une promotion de rang (non sauvegardée). */
interface CelebrationStore {
  promotion: Promotion | null;
  show: (promotion: Promotion | null) => void;
  close: () => void;
}

export const useCelebration = create<CelebrationStore>((set) => ({
  promotion: null,
  show: (promotion) => promotion && set({ promotion }),
  close: () => set({ promotion: null }),
}));
