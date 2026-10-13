"use client";

import type { Question } from "@/lib/types";
import { questionKey } from "@/lib/content/generated";

/**
 * Mémoire des questions déjà posées (par chapitre, sur cet appareil) pour ne
 * pas reposer le même énoncé : les 500 dernières clés de chaque chapitre.
 */
const STORAGE_KEY = "questbac-seen";
const MAX_PER_SCOPE = 500;

type SeenMap = Record<string, string[]>;

function read(): SeenMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as SeenMap) : {};
  } catch {
    return {};
  }
}

export function seenFor(scope: string): Set<string> {
  return new Set(read()[scope] ?? []);
}

export function rememberSeen(scope: string, questions: Pick<Question, "prompt">[]) {
  try {
    const all = read();
    const keys = [...(all[scope] ?? []), ...questions.map(questionKey)];
    all[scope] = [...new Set(keys)].slice(-MAX_PER_SCOPE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // stockage indisponible (navigation privée) : on ignore
  }
}
