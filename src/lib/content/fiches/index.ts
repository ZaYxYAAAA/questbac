/**
 * Fiches de révision : « l'essentiel » écrit pour chaque chapitre du programme,
 * complété par les cartes mémoire tirées des banques de questions.
 */
import { HUMANITES } from "./humanites";
import { SCIENCES } from "./sciences";

export interface Fiche {
  /** Points clés : définitions, formules, dates, méthodes (Markdown + LaTeX). */
  essentiel: string[];
  /** Erreurs classiques à éviter. */
  pieges: string[];
}

function parse(doc: string): Record<string, Fiche> {
  const out: Record<string, Fiche> = {};
  for (const block of doc.split(/^@/m).slice(1)) {
    const [head, ...lines] = block.split("\n");
    const fiche: Fiche = { essentiel: [], pieges: [] };
    for (const raw of lines) {
      const line = raw.trim();
      if (line.startsWith("- ")) fiche.essentiel.push(line.slice(2));
      else if (line.startsWith("! ")) fiche.pieges.push(line.slice(2));
    }
    out[head.trim()] = fiche;
  }
  return out;
}

const FICHES: Record<string, Fiche> = { ...parse(SCIENCES), ...parse(HUMANITES) };

export const ficheFor = (chapterId: string): Fiche | null => FICHES[chapterId] ?? null;
export const ficheIds = () => Object.keys(FICHES);
