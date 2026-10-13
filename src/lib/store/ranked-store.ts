"use client";

import { create } from "zustand";
import type { RankedSubject } from "@/lib/game/ranked";
import type { GroupRow, MatchResult, RankView } from "@/lib/server/ranked";
import type { Level, Question } from "@/lib/types";
import { useGame } from "./game-store";

export type { GroupRow, MatchResult, RankView };

export interface RankedOverview {
  level: Level;
  subject: RankedSubject;
  ranks: RankView[];
  group: GroupRow[];
  top: GroupRow[];
  players: number;
  active: { id: string; subject: RankedSubject; index: number; total: number } | null;
  pendingLoss: { id: string; subject: RankedSubject; reason: string; jokerAvailable: boolean } | null;
  seasons: Record<string, Partial<Record<RankedSubject, number>>>;
  season: string;
  week: string;
  endsInMs: number;
}

export interface ServedQuestion {
  index: number;
  total: number;
  question: Question;
  seconds: number;
  elapsedMs: number;
  score: number;
}

export interface AnswerReply {
  correct: boolean;
  timedOut: boolean;
  points: number;
  question: Question;
  done: boolean;
  result: MatchResult | null;
}

interface RankedState {
  overview: RankedOverview | null;
  loading: boolean;
  error: string | null;
  /** Heure de réception (pour le compte à rebours de fin de semaine). */
  fetchedAt: number;
}

export const useRanked = create<RankedState>(() => ({ overview: null, loading: false, error: null, fetchedAt: 0 }));

async function call<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    cache: "no-store",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(typeof json?.error === "string" ? json.error : `Erreur ${res.status}`);
  return json as T;
}

/** Recopie le rang Général dans la sauvegarde locale (badge affiché partout). */
function syncGeneral(overview: RankedOverview) {
  const general = overview.ranks.find((r) => r.subject === "general");
  if (general?.placed) useGame.getState().syncRankedStep(general.step);
}

export async function loadRanked(subject: RankedSubject = "general") {
  useRanked.setState({ loading: true });
  try {
    const overview = await call<RankedOverview>(`/api/ranked?subject=${subject}`);
    useRanked.setState({ overview, loading: false, error: null, fetchedAt: Date.now() });
    syncGeneral(overview);
    return overview;
  } catch (e) {
    useRanked.setState({ loading: false, error: e instanceof Error ? e.message : "Erreur" });
    return null;
  }
}

export interface PresenceReply {
  outcome: { kind: "ok" } | { kind: "strike"; exits: number } | { kind: "lost"; reason: string };
  exits: number;
  voided: boolean;
  result: MatchResult | null;
  index: number;
}

export const startRanked = (subject: RankedSubject) => call<{ match: ServedQuestion & { id: string; subject: RankedSubject } }>("/api/ranked/start", { subject }).then((r) => r.match);
export const nextRanked = (id: string) => call<{ next: ServedQuestion } | { lost: PresenceReply }>("/api/ranked/next", { id });
export const answerRanked = (id: string, index: number, answer: number | boolean | string) => call<AnswerReply | { lost: PresenceReply }>("/api/ranked/answer", { id, index, answer });
export const presenceRanked = (id: string, type: "visible" | "beat", away = 0) => call<PresenceReply>("/api/ranked/event", { id, type, away });
/** Envoi garanti même quand l'appli passe en arrière-plan. */
export function beaconHidden(id: string) {
  const body = JSON.stringify({ id, type: "hidden" });
  if (!navigator.sendBeacon?.("/api/ranked/event", new Blob([body], { type: "text/plain" }))) {
    void fetch("/api/ranked/event", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  }
}
export const jokerRanked = (id: string, use: boolean) => call<{ annulled: boolean; rank: RankView | null }>("/api/ranked/joker", { id, use });
export const reportRanked = (playerId: string) => call<{ already: boolean }>("/api/ranked/report", { playerId });
export const acknowledgeRanked = (subjects: RankedSubject[]) => call<{ ok: true }>("/api/ranked/seen", { subjects });
export const forfeitRanked = (id: string) => call<{ result: MatchResult }>("/api/ranked/forfeit", { id }).then((r) => r.result);
