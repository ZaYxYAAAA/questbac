/**
 * Calculatrice des questions : quand l'afficher (calcul pas faisable de tête)
 * et l'évaluation des expressions tapées (sans `eval`).
 */
import type { McqQuestion, NumericQuestion, TrueFalseQuestion } from "@/lib/types";

/** Question avec ou sans identifiant. */
type AnyQuestion = Omit<McqQuestion, "id"> | Omit<TrueFalseQuestion, "id"> | Omit<NumericQuestion, "id">;

// ─────────────────────────── Quand proposer la calculatrice ───────────────────────────

/** Chiffres significatifs d'un nombre (98,7 → 3 ; 1000 → 1 ; 0,57 → 2). */
export function significantDigits(n: number): number {
  if (!Number.isFinite(n) || n === 0) return 0;
  const s = Math.abs(Math.round(n * 1e6) / 1e6)
    .toFixed(6)
    .replace(".", "")
    .replace(/^0+/, "")
    .replace(/0+$/, "");
  return s.length;
}

const decimals = (n: number) => {
  const s = String(Math.round(Math.abs(n) * 1e6) / 1e6);
  return s.includes(".") ? s.split(".")[1].length : 0;
};

const SCIENTIFIC = /\\times\s*10\^|×\s*10\^|10\^\{?-?\d/;
/** Nombre décimal écrit dans l'énoncé (« 4,7 », « 4{,}7 », « 0.25 »). */
const DECIMAL_IN_TEXT = /\d(?:\{,\}|,|\.)\d/;
const FUNCTIONS = /\\(?:ln|log|sqrt|sin|cos|tan)\b|\be\^/;

/** Valeur d'un choix de QCM s'il s'agit d'un nombre simple (pas une fraction ni une expression). */
export function choiceNumber(choice: string): number | null {
  const s = choice
    .replace(/\$/g, "")
    .replace(/\\[,;!]|\\ |~/g, "")
    .replace(/\{,\}/g, ",")
    .replace(/\\text\{[^}]*\}|\\mathrm\{[^}]*\}/g, "")
    .replace(/[a-zA-Zµ°%·/²³]+.*$/, "")
    .trim();
  if (!/^[−-]?\d[\d\s]*(?:[.,]\d+)?$/.test(s)) return null;
  const n = Number(s.replace(/\s/g, "").replace("−", "-").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** L'énoncé contient une formule avec des nombres (pas une date dans une phrase). */
const MATH_WITH_NUMBER = /\$[^$]*\d[^$]*\$/;

/** Mantisse d'une écriture scientifique (« 3{,}01 \times 10^{23} » → 3,01). */
function mantissa(text: string): number | null {
  const m = /(\d+(?:\{,\}|,|\.)?\d*)\s*(?:\\times|×)\s*10\^/.exec(text);
  return m ? Number(m[1].replace("{,}", ".").replace(",", ".")) : null;
}

/** Un résultat demandé est-il pénible à calculer de tête ? */
function hardValue(value: number, prompt: string): boolean {
  if (!Number.isFinite(value)) return false;
  if (/arrondi/i.test(prompt)) return true;
  if (Number.isInteger(value)) {
    const digits = significantDigits(value);
    return MATH_WITH_NUMBER.test(prompt) && (digits >= 4 || (digits >= 3 && DECIMAL_IN_TEXT.test(prompt)));
  }
  if (decimals(value) >= 3) return true;
  return significantDigits(value) >= 3 && (DECIMAL_IN_TEXT.test(prompt) || FUNCTIONS.test(prompt));
}

/**
 * Faut-il la calculatrice ? Seulement pour les questions de calcul dont le
 * résultat n'est pas faisable de tête (décimaux, notation scientifique,
 * grands nombres) ; jamais pour une question de cours ou un calcul simple.
 */
export function needsCalculator(q: AnyQuestion): boolean {
  if (q.type === "truefalse") return false;
  if (!/\d/.test(q.prompt)) return false;
  if (q.type === "numeric") return (SCIENTIFIC.test(q.prompt) && significantDigits(q.answer) >= 2) || hardValue(q.answer, q.prompt);
  const right = q.choices[q.answer];
  if (right === undefined) return false;
  const m = mantissa(right);
  if (m !== null) return significantDigits(m) >= 3;
  const n = choiceNumber(right);
  return n !== null && hardValue(n, q.prompt);
}

/** Ajoute le drapeau `calc` aux questions qui le méritent. */
export function withCalc<T extends AnyQuestion>(q: T): T {
  return needsCalculator(q) ? { ...q, calc: true } : q;
}

// ─────────────────────────── Évaluation ───────────────────────────

export type AngleMode = "deg" | "rad";

type Token = { t: "num"; v: number } | { t: "op"; v: string } | { t: "fn"; v: string } | { t: "(" } | { t: ")" };

const FN_NAMES = ["sqrt", "ln", "log", "sin", "cos", "tan", "exp"];

function tokenize(src: string): Token[] {
  const s = src.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/√/g, "sqrt").replace(/π/g, "pi").replace(/,/g, ".");
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const num = /^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/.exec(s.slice(i));
    if (num) {
      out.push({ t: "num", v: Number(num[0]) });
      i += num[0].length;
      continue;
    }
    const fn = FN_NAMES.find((f) => s.startsWith(f, i));
    if (fn) {
      out.push({ t: "fn", v: fn });
      i += fn.length;
      continue;
    }
    if (s.startsWith("pi", i)) {
      out.push({ t: "num", v: Math.PI });
      i += 2;
      continue;
    }
    if (c === "e") {
      out.push({ t: "num", v: Math.E });
      i++;
      continue;
    }
    if ("+-*/^%".includes(c)) out.push({ t: "op", v: c });
    else if (c === "(") out.push({ t: "(" });
    else if (c === ")") out.push({ t: ")" });
    else throw new Error("Caractère inconnu");
    i++;
  }
  return out;
}

/**
 * Évalue une expression : + − × ÷ ^, parenthèses (celles qui manquent à la fin
 * sont fermées), moins unaire, multiplication implicite (2π, 3(4+1)),
 * √ ln log sin cos tan exp, π et e, notation « E » (6,02E23).
 */
export function evaluate(expr: string, angle: AngleMode = "deg"): number {
  const tokens = tokenize(expr);
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (v: string) => {
    const t = peek();
    return t?.t === "op" && t.v === v;
  };
  const startsFactor = () => {
    const t = peek();
    return !!t && (t.t === "num" || t.t === "fn" || t.t === "(");
  };

  const expression = (): number => {
    let v = term();
    while (isOp("+") || isOp("-")) {
      const op = (tokens[pos++] as { v: string }).v;
      const w = term();
      v = op === "+" ? v + w : v - w;
    }
    return v;
  };
  const term = (): number => {
    let v = unary();
    for (;;) {
      if (isOp("*") || isOp("/")) {
        const op = (tokens[pos++] as { v: string }).v;
        const w = unary();
        v = op === "*" ? v * w : v / w;
      } else if (startsFactor()) v *= unary(); // multiplication implicite
      else return v;
    }
  };
  const unary = (): number => {
    if (isOp("-")) {
      pos++;
      return -unary();
    }
    if (isOp("+")) {
      pos++;
      return unary();
    }
    return power();
  };
  const power = (): number => {
    let base = postfix();
    if (isOp("^")) {
      pos++;
      base = base ** unary(); // associatif à droite
    }
    return base;
  };
  const postfix = (): number => {
    let v = primary();
    while (isOp("%")) {
      pos++;
      v /= 100;
    }
    return v;
  };
  const primary = (): number => {
    const t = tokens[pos++];
    if (!t) throw new Error("Expression incomplète");
    if (t.t === "num") return t.v;
    if (t.t === "(") {
      const v = expression();
      if (peek()?.t === ")") pos++;
      return v;
    }
    if (t.t === "fn") {
      const arg = peek()?.t === "(" ? primary() : unary();
      const rad = angle === "deg" ? (arg * Math.PI) / 180 : arg;
      switch (t.v) {
        case "sqrt":
          return Math.sqrt(arg);
        case "ln":
          return Math.log(arg);
        case "log":
          return Math.log10(arg);
        case "exp":
          return Math.exp(arg);
        case "sin":
          return cleanTrig(Math.sin(rad));
        case "cos":
          return cleanTrig(Math.cos(rad));
        default:
          return cleanTrig(Math.tan(rad));
      }
    }
    throw new Error("Expression invalide");
  };

  const v = expression();
  if (pos < tokens.length) {
    // Parenthèses fermantes en trop : on les ignore ; tout autre reste est une erreur.
    while (peek()?.t === ")") pos++;
    if (pos < tokens.length) throw new Error("Expression invalide");
  }
  if (!Number.isFinite(v)) throw new Error("Calcul impossible");
  return v;
}

/** sin(180°) vaut 0, pas 1,2e-16. */
const cleanTrig = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v);

/** Résultat affiché à la française : 10 chiffres significatifs, notation scientifique si besoin. */
export function formatResult(v: number): string {
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 1e10 || abs < 1e-6) {
    const [m, e] = v.toExponential(6).split("e");
    return `${String(Number(m)).replace(".", ",")}E${Number(e)}`;
  }
  return String(Number(v.toPrecision(10))).replace(".", ",");
}
