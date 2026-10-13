/**
 * Questions générées par chapitre : chaque chapitre a ses générateurs
 * (valeurs tirées au hasard en sciences, banques de connaissances ailleurs).
 * Le tirage évite les énoncés déjà posés (`avoid`) pour ne pas se répéter.
 */
import type { Level, Question, SubjectId } from "@/lib/types";
import { hashString, shuffle } from "@/lib/game/quests";
import { CHAPTERS, chapterById } from "./curriculum";
import type { Generator, Rand } from "./gen/kit";
import { ESPAGNOL } from "./gen/espagnol";
import { HISTOIRE } from "./gen/histoire";
import { HISTOIRE2 } from "./gen/histoire2";
import { HUMANITES2 } from "./gen/humanites2";
import { SCIENCES2 } from "./gen/sciences2";
import { LETTRES } from "./gen/lettres";
import { MATHS_2026, STATS_CLASSES } from "./gen/maths-2026";
import { MATHS_PREMIERE } from "./gen/maths-premiere";
import { MATHS_SECONDE } from "./gen/maths-seconde";
import { MATHS_TERMINALE } from "./gen/maths-terminale";
import { PHYSIQUE } from "./gen/physique";
import { SES_ANGLAIS } from "./gen/ses-anglais";
import { SVT } from "./gen/svt";
import { questionsForChapter } from "./questions";

export const CHAPTER_GENERATORS: Record<string, Generator[]> = {
  ...MATHS_SECONDE,
  ...MATHS_PREMIERE,
  ...MATHS_TERMINALE,
  ...MATHS_2026,
  "maths-2-stats": [...MATHS_SECONDE["maths-2-stats"], STATS_CLASSES],
  ...PHYSIQUE,
  ...SVT,
  ...HISTOIRE,
  ...LETTRES,
  ...SES_ANGLAIS,
  ...ESPAGNOL,
  ...HISTOIRE2,
  ...SCIENCES2,
  ...HUMANITES2,
};

export const hasGenerators = (chapterId: string) => (CHAPTER_GENERATORS[chapterId]?.length ?? 0) > 0;

/** Clé d'unicité d'une question : empreinte de son énoncé (mêmes valeurs = même question). */
export const questionKey = (q: Pick<Question, "prompt">) => hashString(q.prompt.trim()).toString(36);

/**
 * Tire `count` questions : les générateurs tournent (types de questions
 * variés), sans énoncé en double ni déjà vu. Si tout a déjà été vu, on
 * accepte d'anciens énoncés plutôt que de renvoyer moins de questions.
 */
export function generateFrom(
  generators: Generator[],
  count: number,
  r: Rand = Math.random,
  avoid: ReadonlySet<string> = new Set(),
  idPrefix = "gen",
  extra: Question[] = [],
): Question[] {
  const out: Question[] = [];
  const used = new Set<string>();
  const stamp = Date.now().toString(36);
  const sources: Array<() => Omit<Question, "id">> = [...generators.map((g) => () => g(r)), ...extra.map((q) => () => q)];
  if (sources.length === 0) return out;
  let bag: Array<() => Omit<Question, "id">> = [];
  const tries = count * 60;
  for (let i = 0; i < tries && out.length < count; i++) {
    if (bag.length === 0) bag = shuffle(sources, r);
    const q = bag.pop()!();
    const key = questionKey(q);
    if (used.has(key)) continue;
    // Dans la dernière partie des essais, on tolère un énoncé déjà vu.
    if (avoid.has(key) && i < tries * 0.7) continue;
    used.add(key);
    out.push({ ...q, id: `${idPrefix}-${stamp}-${out.length}` } as Question);
  }
  return out;
}

/** Questions d'un chapitre : générateurs + banque fixe du chapitre. */
export function chapterQuestions(chapterId: string, count: number, r: Rand = Math.random, avoid?: ReadonlySet<string>): Question[] {
  return generateFrom(CHAPTER_GENERATORS[chapterId] ?? [], count, r, avoid, chapterId, questionsForChapter(chapterId));
}

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Générateurs pour un sujet libre (Forge, mode démo) : chapitres de la
 * matière et du niveau dont le titre ressemble au sujet, sinon tous.
 */
/** Questions d'un mélange de chapitres (même matière et même niveau). */
export function mixQuestions(subject: SubjectId, level: Level, count: number, r: Rand = Math.random, avoid?: ReadonlySet<string>): Question[] {
  const { generators, extra } = generatorsForTopic(subject, level);
  return generateFrom(generators, count, r, avoid, `mix-${subject}`, extra);
}

export function generatorsForTopic(subject: SubjectId, level: Level, topic = "", chapterId?: string): { generators: Generator[]; extra: Question[] } {
  const direct = chapterId ? chapterById(chapterId) : undefined;
  if (direct) return { generators: CHAPTER_GENERATORS[direct.id] ?? [], extra: questionsForChapter(direct.id) };
  const words = normalize(topic).split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  const inSubject = CHAPTERS.filter((c) => c.subject === subject);
  const sameLevel = inSubject.filter((c) => c.level === level);
  const matches = inSubject.filter((c) => words.some((w) => normalize(`${c.title} ${c.summary}`).includes(w)));
  const chosen = matches.length ? matches : sameLevel.length ? sameLevel : inSubject;
  return {
    generators: chosen.flatMap((c) => CHAPTER_GENERATORS[c.id] ?? []),
    extra: chosen.flatMap((c) => questionsForChapter(c.id)),
  };
}
