/**
 * Boîte à outils des générateurs de questions : tirages, mise en forme des
 * nombres et des polynômes, et fabriques de QCM / vrai-faux / réponse numérique.
 * Un générateur reçoit un hasard `r` et renvoie une question sans identifiant.
 */
import type { Difficulty, McqQuestion, NumericQuestion, TrueFalseQuestion } from "@/lib/types";
import { hashString, shuffle } from "@/lib/game/quests";

export type Rand = () => number;
export type Draft = Omit<McqQuestion, "id"> | Omit<NumericQuestion, "id"> | Omit<TrueFalseQuestion, "id">;
/** Carte mémoire (fiches de révision) : recto, verso et précision facultative. */
export interface Memo {
  front: string;
  back: string;
  note?: string;
}
/** Générateur de questions ; les banques de connaissances y joignent leurs cartes mémoire. */
export type Generator = ((r: Rand) => Draft) & { memo?: Memo[] };

/** Joint des cartes mémoire à un générateur. */
const withMemo = (g: Generator, memo: Memo[]): Generator => Object.assign(g, { memo });

/** Rattache une question à l'information qu'elle teste (mêmes parties = même information). */
export const withFact = (d: Draft, ...parts: string[]): Draft => ({ ...d, fact: hashString(parts.join("|")).toString(36) });

// ───────────── Tirages ─────────────

export const int = (r: Rand, min: number, max: number) => min + Math.floor(r() * (max - min + 1));
export const pick = <T,>(r: Rand, items: readonly T[]): T => items[Math.floor(r() * items.length)];
/** Entier non nul entre -max et max (hors -1, 0, 1 si `noOne`). */
export const nonZero = (r: Rand, max: number, noOne = false): number => {
  for (;;) {
    const v = int(r, -max, max);
    if (v !== 0 && (!noOne || Math.abs(v) !== 1)) return v;
  }
};
export const sample = <T,>(r: Rand, items: readonly T[], n: number): T[] => shuffle(items, r).slice(0, n);
/** Exécute une des variantes au hasard. */
export const oneOf = (r: Rand, variants: Array<() => Draft>): Draft => pick(r, variants)();

// ───────────── Mise en forme ─────────────

/** Nombre à la française : virgule décimale, 3 décimales au plus. */
export const fr = (n: number, digits = 3) => {
  const v = Math.round(n * 10 ** digits) / 10 ** digits;
  return String(Object.is(v, -0) ? 0 : v).replace(".", ",");
};
/** Nombre en LaTeX : virgule décimale protégée, espaces des milliers. */
export const tex = (n: number, digits = 3) => {
  const [int, dec] = fr(n, digits).split(",");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
  return dec ? `${grouped}{,}${dec}` : grouped;
};
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
/** Fraction irréductible en LaTeX (`$` non compris). */
export const fracTex = (n: number, d: number) => {
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d) || 1;
  const [a, b] = [n / g, d / g];
  if (b === 1) return `${a}`;
  return `${a < 0 ? "-" : ""}\\dfrac{${Math.abs(a)}}{${b}}`;
};
export const frac = (n: number, d: number) => `$${fracTex(n, d)}$`;
/** `x - a` bien écrit : `x`, `x - 3`, `x + 2`. */
export const shift = (a: number, v = "x") => (a === 0 ? v : `${v} ${a < 0 ? "+" : "-"} ${tex(Math.abs(a))}`);
/** Terme `± k·v` à la suite d'une expression : `+ 3y`, `- y`, rien si k = 0. */
export const term = (k: number, v = "") => (k === 0 ? "" : ` ${k < 0 ? "-" : "+"} ${Math.abs(k) === 1 && v ? "" : tex(Math.abs(k))}${v}`);
/** Nombre entre parenthèses s'il est négatif : `(-3)`. */
export const par = (n: number) => (n < 0 ? `(${tex(n)})` : tex(n));

/** Polynôme en LaTeX à partir des coefficients du plus haut degré au terme constant. */
export function poly(coefs: number[], v = "x"): string {
  const deg = coefs.length - 1;
  const parts: string[] = [];
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const p = deg - i;
    const abs = Math.abs(c);
    const body = p === 0 ? tex(abs) : `${abs === 1 ? "" : tex(abs)}${v}${p > 1 ? `^{${p}}` : ""}`;
    parts.push(parts.length === 0 ? (c < 0 ? `-${body}` : body) : `${c < 0 ? "-" : "+"} ${body}`);
  });
  return parts.length ? parts.join(" ") : "0";
}

// ───────────── Fabriques de questions ─────────────

/** Contractions françaises après assemblage : « de le » → « du », « à les » → « aux »… */
export const frText = (t: string) =>
  t
    .replace(/(?<!\p{L})([Dd])e le(?!\p{L})/gu, "$1u")
    .replace(/(?<!\p{L})([Dd])e les(?!\p{L})/gu, "$1es")
    .replace(/(?<!\p{L})([Dd])e des(?!\p{L})/gu, "$1e")
    .replace(/(?<!\p{L})([Dd])e ([aeiouyéèê])/gu, "$1'$2")
    .replace(/(?<!\p{L})([Àà]) le(?!\p{L})/gu, (_, a) => (a === "À" ? "Au" : "au"))
    .replace(/(?<!\p{L})([Àà]) les(?!\p{L})/gu, (_, a) => (a === "À" ? "Aux" : "aux"));

/**
 * Leurre automatique : modifie un ou plusieurs nombres de la bonne réponse
 * (coordonnées, polynômes, fractions…). Null si la réponse ne contient aucun nombre.
 */
export function perturb(answer: string, r: Rand): string | null {
  // Les nombres hors commandes LaTeX (pas les exposants de \dfrac etc. : on garde tout chiffre).
  const nums = answer.match(/\d+/g);
  if (!nums) return null;
  const target = Math.floor(r() * nums.length);
  let i = -1;
  return answer.replace(/\d+/g, (m) => {
    i++;
    if (i !== target && r() < 0.7) return m;
    const old = Number(m);
    const v = old + (r() < 0.5 ? -1 : 1) * int(r, 1, 3);
    return String(v <= 0 ? old + int(r, 1, 3) : v);
  });
}

/** QCM : la bonne réponse + 3 leurres distincts (complétés par `fill`, sinon par `perturb`). */
export function mcq(r: Rand, prompt: string, answer: string, wrongs: string[], explanation: string, fill?: () => string, difficulty: Difficulty = 1): Draft {
  const pool = [...new Set(wrongs.filter((w) => w !== answer))];
  const more = fill ?? (() => perturb(answer, r) ?? answer);
  for (let guard = 0; pool.length < 3 && guard < 40; guard++) {
    const w = more();
    if (w !== answer && !pool.includes(w)) pool.push(w);
  }
  const choices = shuffle([answer, ...shuffle(pool, r).slice(0, 3)], r);
  return { type: "mcq", prompt: frText(prompt), choices, answer: choices.indexOf(answer), explanation: frText(explanation), difficulty };
}

/** QCM numérique : leurres proches (erreurs typiques puis voisins). `wrap` habille chaque choix. */
export function numMcq(r: Rand, prompt: string, answer: number, typical: number[], explanation: string, wrap = (s: string) => s, difficulty: Difficulty = 1): Draft {
  const step = Math.max(1, Math.round(Math.abs(answer) * 0.1));
  const show = (n: number) => wrap(fr(n));
  return mcq(r, prompt, show(answer), typical.filter((t) => Number.isFinite(t) && t !== answer).map(show), explanation, () =>
    show(answer + (r() < 0.5 ? -1 : 1) * step * int(r, 1, 4)),
    difficulty,
  );
}

/** QCM dont les choix sont des nombres en LaTeX. */
export const texMcq = (r: Rand, prompt: string, answer: number, typical: number[], explanation: string, unit = "", difficulty: Difficulty = 1) =>
  numMcq(r, prompt, answer, typical, explanation, (s) => `$${s.replace(",", "{,}")}$${unit ? ` ${unit}` : ""}`, difficulty);

export const numeric = (prompt: string, answer: number, explanation: string, unit?: string, tolerance?: number, difficulty: Difficulty = 1): Draft => ({
  type: "numeric",
  prompt: frText(prompt),
  answer: Math.round(answer * 1e6) / 1e6,
  explanation: frText(explanation),
  difficulty,
  ...(unit ? { unit } : {}),
  ...(tolerance !== undefined ? { tolerance } : {}),
});

export const tf = (prompt: string, answer: boolean, explanation: string, difficulty: Difficulty = 1): Draft => ({ type: "truefalse", prompt: frText(prompt), answer, explanation: frText(explanation), difficulty });

// ───────────── Banques de connaissances ─────────────

export type Pair = readonly [string, string];

export interface PairOptions {
  /** Énoncé pour trouver la 2e colonne à partir de la 1re. */
  ask: (a: string) => string;
  /** Énoncé inverse (2e colonne → 1re), facultatif. */
  reverse?: (b: string) => string;
  /** Affirmation « a ↔ b » pour un vrai/faux, facultatif. */
  claim?: (a: string, b: string) => string;
  /** Explication commune. */
  explain?: (a: string, b: string) => string;
}

/**
 * Transforme une table de correspondances (terme → définition, œuvre → auteur…)
 * en 1 à 3 générateurs : question directe, question inverse et vrai/faux.
 * Les leurres sont pris dans les autres lignes de la table.
 */
export function pairs(items: readonly Pair[], o: PairOptions): Generator[] {
  const explain = o.explain ?? ((a: string, b: string) => `${a} → ${b}.`);
  const gens: Generator[] = [
    withMemo(
      (r) => {
        const [a, b] = pick(r, items);
        return withFact(mcq(r, o.ask(a), b, items.filter(([x, y]) => x !== a && y !== b).map(([, y]) => y), explain(a, b)), a, b);
      },
      items.map(([a, b]) => ({ front: o.ask(a), back: b })),
    ),
  ];
  if (o.reverse) {
    const reverse = o.reverse;
    gens.push((r) => {
      const [a, b] = pick(r, items);
      return withFact(mcq(r, reverse(b), a, items.filter(([x, y]) => y !== b && x !== a).map(([x]) => x), explain(a, b)), a, b);
    });
  }
  if (o.claim) {
    const claim = o.claim;
    gens.push((r) => {
      const [a, b] = pick(r, items);
      if (r() < 0.5) return withFact(tf(claim(a, b), true, explain(a, b)), a, b);
      const others = items.filter(([x, y]) => x !== a && y !== b);
      const [, wrong] = pick(r, others);
      return withFact(tf(claim(a, wrong), false, explain(a, b)), a, b);
    });
  }
  return gens;
}

/** Question de cours : [énoncé, bonne réponse, leurres, explication]. */
export type Card = readonly [string, string, readonly string[], string];

/** Un générateur qui tire une carte de cours (ordre des choix mélangé). */
export const cards = (items: readonly Card[]): Generator =>
  withMemo(
    (r) => {
      const [q, a, w, e] = pick(r, items);
      return withFact(mcq(r, q, a, [...w], e), q);
    },
    items.map(([q, a, , e]) => ({ front: q, back: a, note: e })),
  );

/** Affirmation de cours : [énoncé, vrai ?, explication]. */
export type Claim = readonly [string, boolean, string];

export const claims = (items: readonly Claim[]): Generator =>
  withMemo(
    (r) => {
      const [q, a, e] = pick(r, items);
      return withFact(tf(q, a, e), q);
    },
    items.map(([q, a, e]) => ({ front: `Vrai ou faux : ${q}`, back: a ? "Vrai" : "Faux", note: e })),
  );
