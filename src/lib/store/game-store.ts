"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomMission, Level } from "@/lib/types";
import {
  type ActivityInput,
  type GameData,
  type Profile,
  type RewardSummary,
  type SessionInput,
  applyActivity,
  applySession,
  createInitialData,
  refreshPeriods,
} from "@/lib/game/state";

interface GameActions {
  completeOnboarding: (profile: Omit<Profile, "createdAt">) => void;
  updateProfile: (patch: Partial<Omit<Profile, "createdAt">>) => void;
  setLevel: (level: Level) => void;
  recordSession: (session: SessionInput) => RewardSummary;
  recordActivity: (activity: ActivityInput) => RewardSummary;
  updateMission: (mission: CustomMission) => void;
  deleteMission: (id: string) => void;
  deleteFiche: (id: string) => void;
  refresh: () => void;
  resetAll: () => void;
}

export type GameStore = GameData & GameActions;

/**
 * Persistance locale (localStorage). Pour un mode multijoueur, remplacer
 * `persist` par une synchronisation serveur : toutes les règles du jeu sont
 * dans `lib/game/state.ts` et peuvent tourner côté serveur à l'identique.
 */
export const useGame = create<GameStore>()(
  persist(
    (set, get) => {
      const data = (): GameData => {
        const s = get();
        return {
          version: s.version, profile: s.profile, xp: s.xp, rp: s.rp, streak: s.streak, chapters: s.chapters,
          bosses: s.bosses, stats: s.stats, achievements: s.achievements, quests: s.quests, weekly: s.weekly,
          xpByDay: s.xpByDay, fiches: s.fiches, missions: s.missions,
        };
      };
      return {
        ...createInitialData(),
        completeOnboarding: (profile) => set({ profile: { ...profile, createdAt: Date.now() } }),
        updateProfile: (patch) => {
          const p = get().profile;
          if (p) set({ profile: { ...p, ...patch } });
        },
        setLevel: (level) => get().updateProfile({ level }),
        recordSession: (session) => {
          const { data: next, summary } = applySession(data(), session);
          set(next);
          return summary;
        },
        recordActivity: (activity) => {
          const { data: next, summary } = applyActivity(data(), activity);
          set(next);
          return summary;
        },
        updateMission: (mission) => set({ missions: get().missions.map((m) => (m.id === mission.id ? mission : m)) }),
        deleteMission: (id) => set({ missions: get().missions.filter((m) => m.id !== id) }),
        deleteFiche: (id) => set({ fiches: get().fiches.filter((f) => f.id !== id) }),
        refresh: () => set(refreshPeriods(data())),
        resetAll: () => set(createInitialData()),
      };
    },
    { name: "questbac-save", version: 1 },
  ),
);

/** Évite les écarts d'hydratation SSR : vrai une fois l'état local rechargé. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const done = () => setHydrated(true);
    if (useGame.persist.hasHydrated()) done();
    return useGame.persist.onFinishHydration(done);
  }, []);
  return hydrated;
}
