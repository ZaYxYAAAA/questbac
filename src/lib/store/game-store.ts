"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { RANK_EPOCH } from "@/lib/game/ranked";

const RANK_EPOCH_KEY = "questbac-rank-epoch";
import { persist } from "zustand/middleware";
import type { CustomMission, Level } from "@/lib/types";
import type { DailyReward } from "@/lib/game/daily";
import type { LeagueRow } from "@/lib/game/league";
import { promotionBetween } from "@/lib/game/ranks";
import { migrateSave, toGameData } from "@/lib/game/save";
import {
  type ActivityInput,
  type GameData,
  type Profile,
  type RewardSummary,
  type SessionInput,
  acknowledgeLeague,
  applyActivity,
  applyDailyClaim,
  applySession,
  createInitialData,
  refreshPeriods,
} from "@/lib/game/state";
import { useCelebration } from "./celebration-store";

interface GameActions {
  completeOnboarding: (profile: Omit<Profile, "createdAt">) => void;
  updateProfile: (patch: Partial<Omit<Profile, "createdAt">>) => void;
  setLevel: (level: Level) => void;
  recordSession: (session: SessionInput) => RewardSummary;
  recordActivity: (activity: ActivityInput) => RewardSummary;
  updateMission: (mission: CustomMission) => void;
  deleteMission: (id: string) => void;
  deleteFiche: (id: string) => void;
  /** Ouvre le coffre de connexion du jour ; null s'il est déjà ouvert. */
  claimDaily: () => { summary: RewardSummary; reward: DailyReward } | null;
  /** Masque le message de fin de ligue. */
  acknowledgeLeague: () => void;
  /** Mémorise les derniers scores connus des adversaires de la ligue. */
  setLeagueRivals: (rivals: LeagueRow[]) => void;
  refresh: () => void;
  /** Rang Général du mode classé et meilleur rang (tenus par le serveur) recopiés localement. */
  syncRank: (rp: number, peakRp: number) => void;
  /** Remise à zéro locale des rangs quand l'époque des rangs change (l'XP reste). */
  applyRankEpoch: () => void;
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
          useCelebration.getState().show(summary.promotion);
          return summary;
        },
        recordActivity: (activity) => {
          const { data: next, summary } = applyActivity(data(), activity);
          commit(next);
          useCelebration.getState().show(summary.promotion);
          return summary;
        },
        claimDaily: () => {
          const claimed = applyDailyClaim(data());
          if (!claimed) return null;
          commit(claimed.data);
          useCelebration.getState().show(claimed.summary.promotion);
          return { summary: claimed.summary, reward: claimed.reward };
        },
        acknowledgeLeague: () => {
          const current = data();
          const next = acknowledgeLeague(current);
          if (next !== current) commit({ league: next.league });
        },
        // Donnée observée (pas une action du joueur) : `updatedAt` reste inchangé.
        setLeagueRivals: (rivals) => set({ league: { ...get().league, rivals } }),
        updateMission: (mission) => commit({ missions: get().missions.map((m) => (m.id === mission.id ? mission : m)) }),
        deleteMission: (id) => commit({ missions: get().missions.filter((m) => m.id !== id) }),
        deleteFiche: (id) => commit({ fiches: get().fiches.filter((f) => f.id !== id) }),
        // Le changement de jour / semaine est calculé, pas une action du joueur :
        // `updatedAt` reste inchangé, sinon une vieille sauvegarde locale
        // paraîtrait plus récente que celle du serveur (le calcul est déterministe,
        // un autre appareil obtiendra le même résultat).
        refresh: () => {
          const current = data();
          const next = refreshPeriods(current);
          if (next === current) return;
          const { updatedAt: _keep, ...changes } = next;
          set(changes);
          useCelebration.getState().show(promotionBetween(current.peakRp, next.rp));
        },
        // Donnée du serveur : `updatedAt` reste inchangé.
        syncRank: (rp, peakRp) => {
          const before = get();
          if (before.rp === rp && before.peakRp === peakRp) return;
          set({ rp, peakRp });
          if (rp > before.peakRp) useCelebration.getState().show(promotionBetween(before.peakRp, rp));
        },
        applyRankEpoch: () => {
          try {
            if (localStorage.getItem(RANK_EPOCH_KEY) === String(RANK_EPOCH)) return;
            set({ rp: 0, peakRp: 0 });
            localStorage.setItem(RANK_EPOCH_KEY, String(RANK_EPOCH));
          } catch {
            // Stockage indisponible : le serveur recopiera le bon rang à la prochaine synchro.
          }
        },
        resetAll: () => commit({ ...createInitialData(), profile: get().profile }),
        replaceAll: (next) => set(refreshPeriods(toGameData(next))),
        clearLocal: () => set(createInitialData()),
      };
    },
    {
      name: "questbac-save",
      version: 4,
      // v1 → v2 : ajout de `updatedAt` ; v2 → v3 : photo de profil à part de l'emoji ;
      // v3 → v4 : ligue hebdomadaire, coffre quotidien, fil d'actualité, meilleur RP.
      // La migration complète sans rien effacer.
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
