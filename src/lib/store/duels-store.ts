"use client";

import { create } from "zustand";
import type { DuelOutcome, DuelPlay, DuelStatus } from "@/lib/game/duel";
import type { Question, SubjectId } from "@/lib/types";

/** Miroir côté client de `DuelView` (src/lib/server/duels.ts). */
export interface DuelView {
  id: string;
  chapterId: string;
  chapterTitle: string;
  subject: SubjectId;
  createdAt: number;
  expiresAt: number;
  status: DuelStatus;
  outcome: DuelOutcome | null;
  rewarded: boolean;
  iChallenged: boolean;
  opponent: { id: string; pseudo: string; avatar: string; photoThumb?: string };
  mine: DuelPlay | null;
  theirs: DuelPlay | null;
  opponentPlayed: boolean;
}

interface DuelsState {
  duels: DuelView[];
  loaded: boolean;
  error: string | null;
}

export const useDuels = create<DuelsState>(() => ({ duels: [], loaded: false, error: null }));

/** Duels qui attendent une action : mon tour, ou récompense à récupérer. */
export const pendingCount = (duels: DuelView[]) =>
  duels.filter((d) => d.status === "your_turn" || (d.outcome && !d.rewarded)).length;

async function call<T>(url: string, method: "GET" | "POST" = "GET", body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(typeof json?.error === "string" ? json.error : `Erreur ${res.status}`);
  return json as T;
}

function upsert(view: DuelView) {
  const duels = useDuels.getState().duels;
  useDuels.setState({ duels: duels.some((d) => d.id === view.id) ? duels.map((d) => (d.id === view.id ? view : d)) : [view, ...duels] });
}

export async function loadDuels() {
  try {
    const { duels } = await call<{ duels: DuelView[] }>("/api/duels");
    useDuels.setState({ duels, loaded: true, error: null });
  } catch (e) {
    useDuels.setState({ loaded: true, error: e instanceof Error ? e.message : "Erreur" });
  }
}

export const createDuel = (friendId: string, chapterId: string) =>
  call<{ id: string }>("/api/duels", "POST", { friendId, chapterId });

export async function fetchDuel(id: string) {
  const res = await call<{ duel: DuelView; questions: Question[] }>(`/api/duels/${encodeURIComponent(id)}`);
  upsert(res.duel);
  return res;
}

export async function playDuel(id: string, answers: (number | boolean | string)[], times: number[]) {
  const { duel } = await call<{ duel: DuelView }>(`/api/duels/${encodeURIComponent(id)}/play`, "POST", { answers, times });
  upsert(duel);
  return duel;
}

export async function claimDuel(id: string) {
  const res = await call<{ outcome: DuelOutcome; duel: DuelView }>(`/api/duels/${encodeURIComponent(id)}/claim`, "POST");
  upsert(res.duel);
  return res;
}
