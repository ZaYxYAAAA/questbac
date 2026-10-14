"use client";

import { create } from "zustand";
import type { RankProfile } from "@/lib/game/ranked";
import type { BoardRow, MatchView, XpRow } from "@/lib/server/match";
import type { GivenAnswer } from "@/lib/game/session";
import type { Question } from "@/lib/types";
import { useGame } from "./game-store";

export type { BoardRow, MatchView, XpRow };

/** Mon rang (sans l'historique des questions vues) et ma partie en cours. */
export type MyRank = Omit<RankProfile, "seen" | "active"> & { active: string | null };

interface RankedState {
  rank: MyRank | null;
  board: BoardRow[];
  xp: XpRow[];
  /** Parties à jouer ailleurs avant de rejouer chaque matière (0 = libre). */
  locks: Record<string, number>;
  /** Matière du jour (+25 % de points de rang gagnés). */
  daily: string | null;
  error: string | null;
  loadedAt: number;
}

export const useRanked = create<RankedState>(() => ({ rank: null, board: [], xp: [], locks: {}, daily: null, error: null, loadedAt: 0 }));

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(typeof json?.error === "string" ? json.error : `Erreur ${res.status}`);
  return json as T;
}

let inflight: Promise<void> | null = null;

/** Recharge mon rang et le classement général ; aligne les points de rang de la sauvegarde. */
export function loadRanked(): Promise<void> {
  if (inflight) return inflight;
  inflight = call<{ rank: MyRank; board: BoardRow[]; xp: XpRow[]; locks: Record<string, number>; daily: string }>("/api/ranked")
    .then(({ rank, board, xp, locks, daily }) => {
      useRanked.setState({ rank, board, xp, locks, daily, error: null, loadedAt: Date.now() });
      useGame.getState().syncRank(rank.rp, rank.peak);
    })
    .catch((e) => useRanked.setState({ error: e instanceof Error ? e.message : "Erreur" }))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export const joinQueue = (subject: string) =>
  call<{ ticket?: string; matchId?: string }>("/api/match/queue", { method: "POST", body: JSON.stringify({ subject }) });

export const pollQueue = (ticket: string) => call<{ matchId?: string; elapsedMs: number }>(`/api/match/queue?ticket=${encodeURIComponent(ticket)}`);

export const cancelQueue = (ticket: string) =>
  fetch(`/api/match/queue?ticket=${encodeURIComponent(ticket)}`, { method: "DELETE", keepalive: true }).catch(() => undefined);

export const fetchMatch = (id: string) => call<MatchView>(`/api/match/${id}`);

export const voteChapter = (id: string, chapter: string) =>
  call<MatchView>(`/api/match/${id}/vote`, { method: "POST", body: JSON.stringify({ chapter }) });

export const sendAnswer = (id: string, index: number, answer: GivenAnswer) =>
  call<{ status: string; correct?: boolean; question?: Question; view: MatchView }>(`/api/match/${id}/answer`, {
    method: "POST",
    body: JSON.stringify({ index, answer }),
  });

/** Signale au serveur qu'on quitte l'appli pendant une question (elle compte fausse). */
export function reportAway(id: string) {
  const url = `/api/match/${id}/away`;
  if (typeof navigator !== "undefined" && navigator.sendBeacon?.(url)) return;
  void fetch(url, { method: "POST", keepalive: true }).catch(() => undefined);
}
