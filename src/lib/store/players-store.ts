"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { leagueRivals } from "@/lib/game/league";
import { weekKey } from "@/lib/game/progression";
import type { PublicProfile } from "@/lib/game/save";
import { useCloud } from "./cloud-sync";
import { useGame } from "./game-store";

/** Vrais joueurs inscrits (GET /api/leaderboard), partagés par le classement et la ligue. */
interface PlayersState {
  players: PublicProfile[];
  loaded: boolean;
}

export const usePlayers = create<PlayersState>(() => ({ players: [], loaded: false }));

const REFRESH_MS = 2 * 60_000;
let inflight: Promise<void> | null = null;
let lastLoad = 0;

/** Recharge la liste (au plus toutes les 2 minutes, sauf `force`) et mémorise le groupe de ligue. */
export function loadPlayers(force = false): Promise<void> {
  if (inflight) return inflight;
  if (!force && Date.now() - lastLoad < REFRESH_MS) return Promise.resolve();
  inflight = fetch("/api/leaderboard", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((json: { players?: PublicProfile[] } | null) => {
      if (!json || !Array.isArray(json.players)) return;
      lastLoad = Date.now();
      usePlayers.setState({ players: json.players, loaded: true });
      rememberRivals(json.players);
    })
    .catch(() => undefined)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Garde dans la sauvegarde les scores du groupe de la semaine (sans photos). */
function rememberRivals(players: PublicProfile[]) {
  const game = useGame.getState();
  const now = new Date();
  if (!game.profile || game.league.week !== weekKey(now)) return;
  game.setLeagueRivals(leagueRivals(players, useCloud.getState().user?.id ?? null, game.rp, now, false));
}

/** Charge les joueurs au démarrage, puis à chaque retour sur l'appli et toutes les 2 minutes. */
export function usePlayersSync(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    void loadPlayers(true);
    const onVisible = () => document.visibilityState === "visible" && void loadPlayers();
    document.addEventListener("visibilitychange", onVisible);
    const id = setInterval(() => document.visibilityState === "visible" && void loadPlayers(), REFRESH_MS);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(id);
    };
  }, [enabled]);
}
