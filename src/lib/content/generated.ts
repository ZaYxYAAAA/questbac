/**
 * Questions générées par chapitre : chaque chapitre a ses générateurs
 * (valeurs tirées au hasard en sciences, banques de connaissances ailleurs).
 * Le tirage évite les énoncés déjà posés (`avoid`) pour ne pas se répéter.
 */
import type { Level, Question, SubjectId } from "@/lib/types";
import { hashString, shuffle } from "@/lib/game/quests";
import { CHAPTERS, chapterById } from "./curriculum";
import type { Generator, Memo, Rand } from "./gen/kit";
import { CULTURE, CULTURE_TIERS, TIERS, type Tier } from "./gen/culture";
import { ESPAGNOL } from "./gen/espagnol";
import { EXTRA_HISTOIRE } from "./gen/extra-histoire";
import { EXTRA_LETTRES } from "./gen/extra-lettres";
import { EXTRA_PHILO } from "./gen/extra-philo";
import { EXTRA_SES_LANGUES } from "./gen/extra-ses-langues";
import { EXTRA_SVT } from "./gen/extra-svt";
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
import { MATHS_PREMIERE_PLUS } from "./gen/plus-maths-premiere";
import { MATHS_SECONDE_PLUS } from "./gen/plus-maths-seconde";
import { MATHS_TERMINALE_PLUS } from "./gen/plus-maths-terminale";
import { PHYSIQUE_PLUS } from "./gen/plus-physique";
import { HG_PLUS } from "./gen/plus-hg";
import { SES_PHILO_PLUS } from "./gen/plus-ses-philo";
import { SVT_PLUS } from "./gen/plus-svt";
import { LETTRES_LANGUES_PLUS } from "./gen/plus-lettres-langues";
import { questionsForChapter } from "./questions";
import { withCalc } from "@/lib/game/calculator";

const BASE_GENERATORS: Record<string, Generator[]> = {
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
  ...CULTURE,
};

/** Banques d'informations supplémentaires, ajoutées aux chapitres existants. */
const EXTRAS: Record<string, Generator[]>[] = [EXTRA_PHILO, EXTRA_HISTOIRE, EXTRA_LETTRES, EXTRA_SVT, EXTRA_SES_LANGUES, MATHS_SECONDE_PLUS, MATHS_PREMIERE_PLUS, MATHS_TERMINALE_PLUS, PHYSIQUE_PLUS, HG_PLUS, SES_PHILO_PLUS, SVT_PLUS, LETTRES_LANGUES_PLUS];

export const CHAPTER_GENERATORS: Record<string, Generator[]> = { ...BASE_GENERATORS };
for (const extra of EXTRAS) {
  for (const [id, gens] of Object.entries(extra)) CHAPTER_GENERATORS[id] = [...(CHAPTER_GENERATORS[id] ?? []), ...gens];
}

export const hasGenerators = (chapterId: string) => (CHAPTER_GENERATORS[chapterId]?.length ?? 0) > 0;

/** Clé d'unicité d'un énoncé (mêmes valeurs = même question). */
export const questionKey = (q: Pick<Question, "prompt">) => hashString(q.prompt.trim()).toString(36);

/**
 * Clé de l'information testée : commune aux formes directe, inverse et vrai/faux
 * d'une même notion ; à défaut, l'énoncé lui-même.
 */
export const factKey = (q: Pick<Question, "prompt" | "fact">) => q.fact ?? questionKey(q);

/** Déjà vu : liste ordonnée de la plus ancienne à la plus récente (ou ensemble, même ordre). */
export type Seen = ReadonlySet<string> | readonly string[];

/**
 * Gabarit d'un énoncé : deux questions calculées qui ne diffèrent que par leurs
 * nombres sont des quasi-doublons. Les questions de banque (avec `fact`) ont
 * chacune leur gabarit (« en 1789 » / « en 1914 » sont deux questions distinctes).
 */
export const templateKey = (q: Pick<Question, "prompt" | "fact">) =>
  q.fact ? `f:${q.fact}` : `t:${q.prompt.trim().replace(/\d+(?:[.,]\d+)?/g, "#").replace(/\s+/g, " ")}`;

interface Candidate {
  q: Omit<Question, "id">;
  template: string;
  /** Rang d'ancienneté parmi les candidats déjà vus : 0 = le plus ancien, 1 = le plus récent ; absent si jamais vu. */
  age?: number;
  seenAt?: number;
}

/**
 * Tire `count` questions : les générateurs tournent (types de questions
 * variés), sans deux fois la même information ni le même énoncé. Priorité aux
 * informations jamais vues et aux gabarits pas encore posés dans la partie ;
 * si le chapitre est épuisé, on repose d'abord les informations les plus
 * anciennes (une variante chiffrée d'un calcul passe avant une question déjà
 * vue, tant que ce calcul n'est pas trop répété). `taken` : clés (`factKey`,
 * `questionKey`) à exclure.
 */
export function generateFrom(
  generators: Generator[],
  count: number,
  r: Rand = Math.random,
  avoid: Seen = [],
  idPrefix = "gen",
  extra: Question[] = [],
  taken: Iterable<string> = [],
): Question[] {
  const sources: Array<() => Omit<Question, "id">> = [...generators.map((g) => () => g(r)), ...extra.map((q) => () => q)];
  if (sources.length === 0 || count <= 0) return [];
  const recency = new Map([...avoid].map((k, i) => [k, i]));
  const blocked = new Set(taken);
  const facts = new Set<string>();
  const prompts = new Set<string>();
  const candidates: Candidate[] = [];
  const freshTemplates = new Set<string>();
  let bag: Array<() => Omit<Question, "id">> = [];
  // On pioche jusqu'à avoir `count` questions inédites de gabarits différents (ou à court d'essais).
  for (let i = 0, tries = count * 80; i < tries && freshTemplates.size < count; i++) {
    if (bag.length === 0) bag = shuffle(sources, r);
    const q = bag.pop()!();
    const fact = factKey(q);
    const prompt = questionKey(q);
    if (facts.has(fact) || prompts.has(prompt) || blocked.has(fact) || blocked.has(prompt)) continue;
    facts.add(fact);
    prompts.add(prompt);
    const template = templateKey(q);
    const seenAt = recency.get(fact) ?? recency.get(prompt);
    candidates.push({ q, template, seenAt });
    if (seenAt === undefined) freshTemplates.add(template);
  }
  const seen = candidates.filter((c) => c.seenAt !== undefined).sort((a, b) => a.seenAt! - b.seenAt!);
  seen.forEach((c, i) => (c.age = seen.length > 1 ? i / (seen.length - 1) : 0));
  // Coût : 0 pour une information inédite, de 1,5 (vue il y a longtemps) à 3 (vue tout récemment), +1 par usage du gabarit dans la partie.
  const cost = (c: Candidate, uses: number) => (c.age === undefined ? 0 : 1.5 + 1.5 * c.age) + uses;
  const picked: Candidate[] = [];
  const templateUses = new Map<string, number>();
  while (picked.length < count && candidates.length > 0) {
    let best = 0;
    for (let j = 1; j < candidates.length; j++) {
      if (cost(candidates[j], templateUses.get(candidates[j].template) ?? 0) < cost(candidates[best], templateUses.get(candidates[best].template) ?? 0)) best = j;
    }
    const [c] = candidates.splice(best, 1);
    picked.push(c);
    templateUses.set(c.template, (templateUses.get(c.template) ?? 0) + 1);
  }
  const stamp = Date.now().toString(36);
  return shuffle(picked, r).map((c, i) => withCalc({ ...c.q, id: `${idPrefix}-${stamp}-${i}` } as Question));
}

const promptText = (s: string) =>
  s.replace(/^Vrai ou faux : /, "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const extrasCache = new Map<string, Question[]>();

/**
 * Banque fixe d'un chapitre, sans les questions que ses banques de connaissances
 * posent déjà : sinon la même question reviendrait sous deux empreintes différentes.
 */
export function chapterExtras(chapterId: string): Question[] {
  let out = extrasCache.get(chapterId);
  if (!out) {
    const known = new Set((CHAPTER_GENERATORS[chapterId] ?? []).flatMap((g) => (g.memo ?? []).map((m) => promptText(m.front))));
    out = questionsForChapter(chapterId).filter((q) => !known.has(promptText(q.prompt)));
    extrasCache.set(chapterId, out);
  }
  return out;
}

/**
 * Questions d'un chapitre : générateurs + banque fixe du chapitre.
 * Les thèmes à niveaux (Culture générale) mélangent les 3 niveaux (voir `tierMix`).
 */
export function chapterQuestions(chapterId: string, count: number, r: Rand = Math.random, avoid?: Seen): Question[] {
  if (hasTiers(chapterId)) return mixedTierQuestions(chapterId, count, r, avoid);
  return generateFrom(CHAPTER_GENERATORS[chapterId] ?? [], count, r, avoid, chapterId, chapterExtras(chapterId));
}

export type { Tier };
export const TIER_LABELS: Record<Tier, string> = { 1: "Basique", 2: "Intermédiaire", 3: "Expert" };
export const hasTiers = (chapterId: string) => chapterId in CULTURE_TIERS;

/** Questions d'un seul niveau d'un thème. */
export function tierQuestions(chapterId: string, tier: Tier, count: number, r: Rand = Math.random, avoid?: Seen, taken?: Iterable<string>): Question[] {
  return generateFrom(CULTURE_TIERS[chapterId]?.[tier] ?? [], count, r, avoid, `${chapterId}-n${tier}`, [], taken);
}

/** Répartition par niveau : la moitié en Intermédiaire, le reste partagé (au hasard) entre Basique et Expert. */
export function tierMix(count: number, r: Rand = Math.random): Record<Tier, number> {
  const medium = Math.round(count / 2);
  const rest = count - medium;
  const basic = Math.floor(rest / 2) + (rest % 2 === 1 && r() < 0.5 ? 1 : 0);
  return { 1: basic, 2: medium, 3: rest - basic };
}

/** Partie classée : les 3 niveaux mélangés dans un ordre aléatoire, avec une majorité d'Intermédiaire. */
export function mixedTierQuestions(chapterId: string, count: number, r: Rand = Math.random, avoid?: Seen): Question[] {
  const mix = tierMix(count, r);
  const picked: Question[] = [];
  // Deux niveaux peuvent poser le même énoncé (« Quel satellite tourne autour de Jupiter ? ») : jamais deux fois dans une partie.
  const taken = () => picked.flatMap((q) => [factKey(q), questionKey(q)]);
  for (const t of TIERS) picked.push(...tierQuestions(chapterId, t, mix[t], r, avoid, taken()));
  // Un niveau trop court ? On complète avec les autres, Intermédiaire d'abord.
  for (const t of [2, 1, 3] as const) {
    if (picked.length < count) picked.push(...tierQuestions(chapterId, t, count - picked.length, r, avoid, taken()));
  }
  return shuffle(picked, r).map((q, i) => ({ ...q, id: `${chapterId}-mix-${i}-${q.id}` }));
}

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Générateurs pour un sujet libre (Forge, mode démo) : chapitres de la
 * matière et du niveau dont le titre ressemble au sujet, sinon tous.
 */
/** Questions d'un mélange de chapitres (même matière et même niveau). */
export function mixQuestions(subject: SubjectId, level: Level, count: number, r: Rand = Math.random, avoid?: Seen): Question[] {
  const { generators, extra } = generatorsForTopic(subject, level);
  return generateFrom(generators, count, r, avoid, `mix-${subject}`, extra);
}

export function generatorsForTopic(subject: SubjectId, level: Level, topic = "", chapterId?: string): { generators: Generator[]; extra: Question[] } {
  const direct = chapterId ? chapterById(chapterId) : undefined;
  if (direct) return { generators: CHAPTER_GENERATORS[direct.id] ?? [], extra: chapterExtras(direct.id) };
  const words = normalize(topic).split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  const inSubject = CHAPTERS.filter((c) => c.subject === subject);
  const sameLevel = inSubject.filter((c) => c.level === level);
  const matches = inSubject.filter((c) => words.some((w) => normalize(`${c.title} ${c.summary}`).includes(w)));
  const chosen = matches.length ? matches : sameLevel.length ? sameLevel : inSubject;
  return {
    generators: chosen.flatMap((c) => CHAPTER_GENERATORS[c.id] ?? []),
    extra: chosen.flatMap((c) => chapterExtras(c.id)),
  };
}

/**
 * Cartes mémoire d'un chapitre (fiches de révision) : tirées des banques de
 * connaissances et des questions écrites à la main, sans doublon.
 */
export function chapterMemos(chapterId: string): Memo[] {
  const out: Memo[] = [];
  const seen = new Set<string>();
  const add = (m: Memo) => {
    const key = normalize(m.front);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(m);
  };
  for (const g of CHAPTER_GENERATORS[chapterId] ?? []) for (const m of g.memo ?? []) add(m);
  for (const q of questionsForChapter(chapterId)) {
    if (q.type === "mcq") add({ front: q.prompt, back: q.choices[q.answer], note: q.explanation });
    else if (q.type === "truefalse") add({ front: `Vrai ou faux : ${q.prompt}`, back: q.answer ? "Vrai" : "Faux", note: q.explanation });
  }
  return out;
}
