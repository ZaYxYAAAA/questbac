import "server-only";
import { createHash } from "node:crypto";
import { codeFromBytes } from "@/lib/friend-code";
import type { PublicProfile } from "@/lib/game/save";
import { publicPlayerId } from "./auth";
import { getStore } from "./store";

/**
 * Amis : liste symétrique `friends:<id>` (ids de compte, jamais exposés) et
 * index `friendcodes` (code → id de compte) pour retrouver un joueur par son code.
 * Connaître le code (ou le lien d'invitation) suffit pour devenir amis.
 */

export const MAX_FRIENDS = 100;

export const friendCodeOf = (accountId: string) =>
  codeFromBytes(createHash("sha256").update(`questbac-friend:${accountId}`).digest());

/** Rend le code d'un joueur utilisable (appelé à chaque sauvegarde et à l'ouverture des amis). */
export async function registerFriendCode(accountId: string) {
  await getStore().hset("friendcodes", friendCodeOf(accountId), accountId);
}

export async function accountIdForCode(code: string): Promise<string | null> {
  const [id] = await getStore().hmget<string>("friendcodes", [code]);
  return id;
}

export async function friendIds(accountId: string): Promise<string[]> {
  return (await getStore().get<string[]>(`friends:${accountId}`)) ?? [];
}

export type AddResult = "added" | "already" | "self" | "full";

/** Ajoute l'amitié dans les deux sens. */
export async function addFriendship(a: string, b: string): Promise<AddResult> {
  if (a === b) return "self";
  const store = getStore();
  const [mine, theirs] = await Promise.all([friendIds(a), friendIds(b)]);
  if (mine.includes(b)) return "already";
  if (mine.length >= MAX_FRIENDS || theirs.length >= MAX_FRIENDS) return "full";
  await store.set(`friends:${a}`, [...mine, b]);
  if (!theirs.includes(a)) await store.set(`friends:${b}`, [...theirs, a]);
  return "added";
}

/** Retire l'amitié des deux côtés ; `publicId` est l'identifiant vu par le client. */
export async function removeFriendship(a: string, publicId: string): Promise<boolean> {
  const store = getStore();
  const mine = await friendIds(a);
  const b = mine.find((id) => publicPlayerId(id) === publicId);
  if (!b) return false;
  await store.set(`friends:${a}`, mine.filter((id) => id !== b));
  const theirs = await friendIds(b);
  await store.set(`friends:${b}`, theirs.filter((id) => id !== a));
  return true;
}

/** Profils publics des amis (ceux qui n'ont encore rien sauvegardé sont ignorés). */
export async function friendProfiles(accountId: string): Promise<PublicProfile[]> {
  const ids = await friendIds(accountId);
  const profiles = await getStore().hmget<PublicProfile>("players", ids);
  return profiles.flatMap((p, i) => (p ? [{ ...p, id: publicPlayerId(ids[i]) }] : []));
}
