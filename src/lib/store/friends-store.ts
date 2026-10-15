"use client";

import { create } from "zustand";
import { normalizeFriendCode } from "@/lib/friend-code";
import type { PublicProfile } from "@/lib/game/save";

interface FriendsState {
  code: string | null;
  friends: PublicProfile[];
  loaded: boolean;
  error: string | null;
}

export const useFriends = create<FriendsState>(() => ({ code: null, friends: [], loaded: false, error: null }));

async function call(method: "GET" | "POST" | "DELETE", body?: unknown) {
  const res = await fetch("/api/friends", {
    method,
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(typeof json?.error === "string" ? json.error : `Erreur ${res.status}`);
  return json;
}

export async function loadFriends() {
  try {
    const json = await call("GET");
    useFriends.setState({ code: json.code, friends: json.friends ?? [], loaded: true, error: null });
  } catch (e) {
    useFriends.setState({ loaded: true, error: e instanceof Error ? e.message : "Erreur" });
  }
}

/** Ajoute un ami ; renvoie son profil s'il vient d'être ajouté (ou l'était déjà). */
export async function addFriend(code: string): Promise<{ result: "added" | "already"; friend: PublicProfile | null }> {
  const before = new Set(useFriends.getState().friends.map((f) => f.id));
  const json = await call("POST", { code });
  const friends: PublicProfile[] = json.friends ?? [];
  useFriends.setState({ friends });
  return { result: json.result, friend: friends.find((f) => !before.has(f.id)) ?? null };
}

/** Ajoute un ami depuis sa fiche (identifiant public). */
export async function addFriendById(id: string): Promise<"added" | "already"> {
  const json = await call("POST", { id });
  useFriends.setState({ friends: json.friends ?? [] });
  return json.result;
}

export async function removeFriend(id: string) {
  const json = await call("DELETE", { id });
  useFriends.setState({ friends: json.friends ?? [] });
}

// ───────────── Invitation en attente (lien ouvert avant d'avoir un compte) ─────────────

const PENDING_KEY = "questbac-pending-invite";

export function rememberInvite(raw: string) {
  const code = normalizeFriendCode(raw);
  if (!code) return;
  try {
    localStorage.setItem(PENDING_KEY, code);
  } catch {
    // Stockage indisponible : l'invitation devra être ouverte à nouveau.
  }
}

export function takeInvite(): string | null {
  try {
    const code = localStorage.getItem(PENDING_KEY);
    localStorage.removeItem(PENDING_KEY);
    return code;
  } catch {
    return null;
  }
}

export const inviteUrl = (code: string) => `${window.location.origin}/invite/${code}`;

/** Partage natif (téléphone) ou copie dans le presse-papiers ; renvoie ce qui a été fait. */
export async function shareInvite(code: string): Promise<"shared" | "copied" | "failed"> {
  const url = inviteUrl(code);
  const text = `Rejoins-moi sur QuestBac pour réviser en jouant ! Mon code d'ami : ${code}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "QuestBac", text, url });
      return "shared";
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") return "failed";
    try {
      await navigator.clipboard.writeText(url);
      return "copied";
    } catch {
      return "failed";
    }
  }
}
