"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { migrateSave, serverSaveWins, toGameData } from "@/lib/game/save";
import type { GameData } from "@/lib/game/state";
import { useGame } from "./game-store";
import { useToasts } from "./toast-store";

/**
 * Synchronisation de la progression avec le compte du joueur.
 * Au démarrage : GET /api/me, la sauvegarde la plus récente (updatedAt) gagne.
 * Ensuite : chaque modification est envoyée après un court délai, et tout de
 * suite quand la page est masquée (changement d'appli, fermeture).
 */

export type SyncStatus = "checking" | "guest" | "saving" | "saved" | "offline" | "error";

export interface CloudUser {
  id: string;
  pseudo: string;
}

interface CloudState {
  status: SyncStatus;
  user: CloudUser | null;
  /** Vrai une fois la première vérification du compte terminée (réussie ou non). */
  checked: boolean;
  /** Date (updatedAt) de la version enregistrée sur le serveur. */
  savedAt: number | null;
  error: string | null;
}

const ACCOUNT_KEY = "questbac-account";
const DEBOUNCE_MS = 2500;
/** Au-delà, `keepalive` est refusé par les navigateurs : envoi classique. */
const KEEPALIVE_MAX = 60_000;

function readHint(): CloudUser | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    return raw ? (JSON.parse(raw) as CloudUser) : null;
  } catch {
    return null;
  }
}

function writeHint(user: CloudUser | null) {
  try {
    if (user) localStorage.setItem(ACCOUNT_KEY, JSON.stringify(user));
    else localStorage.removeItem(ACCOUNT_KEY);
  } catch {
    // Stockage indisponible (navigation privée) : sans conséquence.
  }
}

export const useCloud = create<CloudState>(() => ({ status: "checking", user: null, checked: false, savedAt: null, error: null }));

/** `updatedAt` de la dernière version connue du serveur. */
let serverUpdatedAt = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let inflight: Promise<void> | null = null;
let again = false;

const set = (patch: Partial<CloudState>) => useCloud.setState(patch);

function markServer(updatedAt: number) {
  serverUpdatedAt = updatedAt;
  set({ savedAt: updatedAt || null });
}

function setUser(user: CloudUser | null) {
  writeHint(user);
  set({ user, status: user ? "saved" : "guest", error: null });
}

/** Remplace l'état local par une sauvegarde serveur. */
function adopt(save: unknown, updatedAt: number) {
  const data = migrateSave(save);
  if (!data) return;
  markServer(updatedAt);
  useGame.getState().replaceAll({ ...data, updatedAt });
}

const localData = (): GameData => toGameData(useGame.getState());
const isDirty = () => localData().updatedAt > serverUpdatedAt;

async function readError(res: Response) {
  try {
    const body = await res.json();
    return typeof body?.error === "string" ? body.error : `Erreur ${res.status}`;
  } catch {
    return `Erreur ${res.status}`;
  }
}

/** Envoie l'état local s'il est plus récent que celui du serveur. */
export function pushNow(opts: { keepalive?: boolean } = {}): Promise<void> {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!useCloud.getState().user) return Promise.resolve();
  if (inflight) {
    again = true;
    return inflight;
  }
  if (!isDirty()) {
    if (useCloud.getState().status !== "offline") set({ status: "saved" });
    return Promise.resolve();
  }
  inflight = (async () => {
    const data = localData();
    const body = JSON.stringify({ save: data, updatedAt: data.updatedAt });
    set({ status: "saving" });
    try {
      const res = await fetch("/api/save", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: Boolean(opts.keepalive) && body.length < KEEPALIVE_MAX,
      });
      if (res.ok) {
        markServer(Math.max(serverUpdatedAt, data.updatedAt));
        set({ status: "saved", error: null });
      } else if (res.status === 409) {
        const json = await res.json();
        adopt(json.save, json.updatedAt);
        set({ status: "saved", error: null });
        useToasts.getState().push({ emoji: "☁️", title: "Progression mise à jour", body: "Une sauvegarde plus récente venait d'un autre appareil.", tone: "violet" });
      } else if (res.status === 401) {
        setUser(null);
        set({ error: "Session expirée : reconnecte-toi pour continuer à sauvegarder." });
        useToasts.getState().push({ emoji: "🔒", title: "Session expirée", body: "Reconnecte-toi depuis ton profil pour sauvegarder.", tone: "rose" });
      } else {
        set({ status: res.status >= 500 ? "offline" : "error", error: await readError(res) });
      }
    } catch {
      set({ status: "offline" });
      timer = setTimeout(() => void pushNow(), 30_000);
    } finally {
      inflight = null;
      if (again) {
        again = false;
        void pushNow();
      }
    }
  })();
  return inflight;
}

function schedulePush() {
  if (!useCloud.getState().user) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void pushNow(), DEBOUNCE_MS);
}

let lastPull = 0;

/** Récupère le compte et sa sauvegarde ; garde la plus récente des deux versions. */
export async function pull(): Promise<void> {
  lastPull = Date.now();
  try {
    const res = await fetch("/api/me?optional=1", { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(await readError(res));
    const json = (await res.json()) as { user: CloudUser | null; save: unknown; updatedAt: number };
    if (!json.user) {
      setUser(null);
      return;
    }
    setUser(json.user);
    const local = localData();
    if (serverSaveWins(local, json)) adopt(json.save, json.updatedAt);
    else {
      markServer(json.updatedAt);
      if (local.profile && isDirty()) void pushNow();
    }
  } catch {
    // Hors ligne : on reste sur les données locales, l'envoi reprendra plus tard.
    const hint = readHint();
    set({ user: hint, status: hint ? "offline" : "guest" });
  } finally {
    set({ checked: true });
  }
}

type AuthResult = { ok: true } | { ok: false; error: string };

async function authRequest(url: string, payload: object): Promise<AuthResult> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) return { ok: false, error: await readError(res) };
    const json = (await res.json()) as { user: CloudUser; save: unknown; updatedAt: number };
    setUser(json.user);
    adopt(json.save, json.updatedAt);
    return { ok: true };
  } catch {
    return { ok: false, error: "Impossible de joindre le serveur. Vérifie ta connexion." };
  }
}

/** Crée un compte avec la progression fournie (par défaut : la progression locale). */
export const register = (pseudo: string, password: string, save: GameData = localData()) =>
  authRequest("/api/auth/register", { pseudo, password, save });

/** Se connecte et remplace la progression locale par celle du compte. */
export const login = (pseudo: string, password: string) => authRequest("/api/auth/login", { pseudo, password });

/** Déconnexion : envoie d'abord les derniers changements, puis garde ou efface les données locales. */
export async function logout(keepLocal: boolean) {
  await pushNow().catch(() => undefined);
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
  markServer(0);
  setUser(null);
  if (!keepLocal) useGame.getState().clearLocal();
}

/** Demande au navigateur de ne pas effacer le stockage local (Safari, mode économie…). */
function requestPersistentStorage() {
  try {
    void navigator.storage?.persisted?.().then((done) => (done ? undefined : navigator.storage.persist()));
  } catch {
    // Non pris en charge.
  }
}

/** Monte la synchronisation (une fois l'état local rechargé). */
export function useCloudSync(hydrated: boolean) {
  useEffect(() => {
    if (!hydrated) return;
    set({ user: readHint() });
    void pull();
    requestPersistentStorage();

    const unsubscribe = useGame.subscribe((s, prev) => {
      if (s.updatedAt !== prev.updatedAt && s.updatedAt > serverUpdatedAt) schedulePush();
    });
    const onVisibility = () => {
      if (document.visibilityState === "hidden") void pushNow({ keepalive: true });
      else if (Date.now() - lastPull > 60_000) void pull();
    };
    const onHide = () => void pushNow({ keepalive: true });
    const onOnline = () => void pushNow();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    window.addEventListener("online", onOnline);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("online", onOnline);
    };
  }, [hydrated]);
}
