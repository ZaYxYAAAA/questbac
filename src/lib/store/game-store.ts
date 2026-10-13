"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomMission, Level } from "@/lib/types";
import { migrateSave, toGameData } from "@/lib/game/save";
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
  /** Remet la progression à zéro en gardant le profil. */
  resetAll: () => void;
  /** Remplace tout l'état (sauvegarde serveur ou fichier importé), sans toucher à `updatedAt` ; quêtes remises au jour. */
  replaceAll: (data: GameData) => void;
  /** Efface toutes les données locales (retour à l'accueil). */
  clearLocal: () => void;
}

export type GameStore = GameData & GameActions;

/**
 * Persistance locale (localStorage) + synchronisation serveur pour les joueurs
 * connectés (voir `cloud-sync.ts`). Chaque modification met à jour `updatedAt`.
 */
export const useGame = create<GameStore>()(
  persist(
    (set, get) => {
      const data = (): GameData => toGameData(get());
      const commit = (patch: Partial<GameData>) => set({ ...patch, updatedAt: Date.now() });
      return {
        ...createInitialData(),
        completeOnboarding: (profile) => commit({ profile: { ...profile, createdAt: Date.now() } }),
        updateProfile: (patch) => {
          const p = get().profile;
          if (p) commit({ profile: { ...p, ...patch } });
        },
        setLevel: (level) => get().updateProfile({ level }),
        recordSession: (session) => {
          const { data: next, summary } = applySession(data(), session);
          commit(next);
          return summary;
        },
        recordActivity: (activity) => {
          const { data: next, summary } = applyActivity(data(), activity);
          commit(next);
          return summary;
        },
        updateMission: (mission) => commit({ missions: get().missions.map((m) => (m.id === mission.id ? mission : m)) }),
        deleteMission: (id) => commit({ missions: get().missions.filter((m) => m.id !== id) }),
        deleteFiche: (id) => commit({ fiches: get().fiches.filter((f) => f.id !== id) }),
        // Le changement de jour / semaine est calculé, pas une action du joueur :
        // `updatedAt` reste inchangé, sinon une vieille sauvegarde locale
        // paraîtrait plus récente que celle du serveur.
        refresh: () => {
          const current = data();
          const next = refreshPeriods(current);
          if (next !== current) set({ quests: next.quests, weekly: next.weekly });
        },
        resetAll: () => commit({ ...createInitialData(), profile: get().profile }),
        replaceAll: (next) => set(refreshPeriods(toGameData(next))),
        clearLocal: () => set(createInitialData()),
      };
    },
    {
      name: "questbac-save",
      version: 2,
      // v1 → v2 : ajout de `updatedAt` ; la migration complète sans rien effacer.
      migrate: (persisted) => (migrateSave(persisted) ?? createInitialData()) as GameStore,
    },
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
