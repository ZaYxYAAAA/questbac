/**
 * Fiches de révision : « l'essentiel » écrit pour chaque chapitre du programme,
 * complété par les cartes mémoire tirées des banques de questions.
 *
 * Format des textes : « @id-du-chapitre », puis
 * - « - » un point clé, « > » son explication en clair (s'ajoute au point précédent),
 * - « ? » l'énoncé d'un exemple corrigé, « = » une étape de sa correction,
 * - « ! » un piège à éviter.
 */
import { HUMANITES } from "./humanites";
import { MATHS } from "./maths";
import { PHYSIQUE } from "./physique";
import { SCIENCES } from "./sciences";

export interface FichePoint {
  text: string;
  /** Ce que veut dire la formule, avec des mots simples. */
  explain?: string;
}

export interface FicheExample {
  question: string;
  steps: string[];
}

export interface Fiche {
  /** Points clés : définitions, formules, dates, méthodes (Markdown + LaTeX). */
  essentiel: FichePoint[];
  /** Exemples corrigés pas à pas. */
  exemples: FicheExample[];
  /** Erreurs classiques à éviter. */
  pieges: string[];
}

export function parseFiches(doc: string): Record<string, Fiche> {
  const out: Record<string, Fiche> = {};
  for (const block of doc.split(/^@/m).slice(1)) {
    const [head, ...lines] = block.split("\n");
    const fiche: Fiche = { essentiel: [], exemples: [], pieges: [] };
    for (const raw of lines) {
      const line = raw.trim();
      const body = line.slice(2);
      if (line.startsWith("- ")) fiche.essentiel.push({ text: body });
      else if (line.startsWith("> ")) {
        const last = fiche.essentiel.at(-1);
        if (last) last.explain = last.explain ? `${last.explain} ${body}` : body;
      } else if (line.startsWith("? ")) fiche.exemples.push({ question: body, steps: [] });
      else if (line.startsWith("= ")) fiche.exemples.at(-1)?.steps.push(body);
      else if (line.startsWith("! ")) fiche.pieges.push(body);
    }
    out[head.trim()] = fiche;
  }
  return out;
}

const FICHES: Record<string, Fiche> = { ...parseFiches(SCIENCES), ...parseFiches(MATHS), ...parseFiches(PHYSIQUE), ...parseFiches(HUMANITES) };

export const ficheFor = (chapterId: string): Fiche | null => FICHES[chapterId] ?? null;
export const ficheIds = () => Object.keys(FICHES);

/** Tous les textes d'une fiche (pour les contrôles et le lexique des symboles). */
export const ficheTexts = (f: Fiche) => [
  ...f.essentiel.flatMap((p) => [p.text, p.explain ?? ""]),
  ...f.exemples.flatMap((e) => [e.question, ...e.steps]),
  ...f.pieges,
];
