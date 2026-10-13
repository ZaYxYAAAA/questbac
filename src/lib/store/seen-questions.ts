"use client";

import type { Question } from "@/lib/types";
import { factKey } from "@/lib/content/generated";

/**
 * Mémoire des informations déjà testées sur cet appareil, de la plus ancienne à
 * la plus récente, tous chapitres confondus : une notion vue en mission n'est
 * pas reposée en « Mélange », même sous une autre forme (inverse, vrai/faux).
 */
const STORAGE_KEY = "questbac-seen";
const GLOBAL = "*";
const MAX_KEYS = 3000;

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

/** Liste globale (les anciennes listes par chapitre y sont fusionnées). */
function globalList(all: SeenMap): string[] {
  if (all[GLOBAL]) return all[GLOBAL];
  return [...new Set(Object.values(all).flat())].slice(-MAX_KEYS);
}

/** Informations déjà vues, de la plus ancienne à la plus récente (`_scope` gardé pour compatibilité). */
export function seenFor(_scope?: string): string[] {
  return globalList(read());
}

export function rememberSeen(_scope: string, questions: Pick<Question, "prompt" | "fact">[]) {
  try {
    const fresh = questions.map(factKey);
    const kept = globalList(read()).filter((k) => !fresh.includes(k));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ [GLOBAL]: [...kept, ...fresh].slice(-MAX_KEYS) }));
  } catch {
    // stockage indisponible (navigation privée) : on ignore
  }
}
