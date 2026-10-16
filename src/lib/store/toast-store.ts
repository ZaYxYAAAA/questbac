"use client";

import { create } from "zustand";
import type { RewardSummary } from "@/lib/game/state";
import { play } from "@/lib/sound";

export interface Toast {
  id: number;
  emoji: string;
  title: string;
  body?: string;
  tone: "gold" | "violet" | "emerald" | "rose";
}

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToasts = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = ++counter;
    // Un seul « pop » pour une rafale de notifications.
    if (get().toasts.length === 0) play("pop");
    set({ toasts: [...get().toasts, { ...t, id }].slice(-4) });
    setTimeout(() => get().dismiss(id), 4500);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/**
 * Affiche en toasts ce qu'un résumé de récompenses contient de notable.
 * `questsOnly` : l'écran de récompenses affiche déjà niveaux, rangs et succès.
 */
export function announce(summary: RewardSummary, { questsOnly = false } = {}) {
  const { push } = useToasts.getState();
  for (const q of summary.quests) push({ emoji: q.emoji, title: "Quête accomplie", body: `${q.label} · +${q.xp} XP`, tone: "emerald" });
  if (summary.chest) push({ emoji: "🎁", title: "Coffre du jour ouvert !", body: "Toutes les quêtes sont terminées.", tone: "gold" });
  if (questsOnly) return;
  if (summary.levelAfter > summary.levelBefore) {
    push({ emoji: "⬆️", title: `Niveau ${summary.levelAfter} !`, body: "Continue comme ça.", tone: "gold" });
  }
  if (summary.rankUp) push({ emoji: "🏅", title: `Nouveau rang : ${summary.rankAfter}`, tone: "violet" });
  for (const a of summary.achievements) push({ emoji: a.emoji, title: `Succès : ${a.name}`, body: a.description, tone: "violet" });
}
