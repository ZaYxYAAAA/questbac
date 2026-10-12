/**
 * Parseur d'expressions mathématiques sûr (aucun eval).
 *
 * Gère : + − × ÷ ^, parenthèses, multiplication implicite (2x, 3(x+1), ax),
 * fonctions usuelles (sin, cos, tan, exp, ln, log, sqrt/√, abs...),
 * constantes (pi/π, e) et paramètres d'une lettre (a, b, c, k...).
 */

export class ParseError extends Error {}

type Node =
  | { kind: "num"; value: number }
  | { kind: "var"; name: string }
  | { kind: "unary"; op: "-"; arg: Node }
  | { kind: "binary"; op: "+" | "-" | "*" | "/" | "^"; left: Node; right: Node }
  | { kind: "call"; fn: string; arg: Node };

const FUNCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  arcsin: Math.asin,
  arccos: Math.acos,
  arctan: Math.atan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  sqrt: Math.sqrt,
  racine: Math.sqrt,
  abs: Math.abs,
  floor: Math.floor,
  ent: Math.floor,
  ceil: Math.ceil,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
};

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

// Noms multi-lettres reconnus, du plus long au plus court (pour « sinx » → sin x).
const NAMES = [...Object.keys(FUNCTIONS), "pi"].sort((a, b) => b.length - a.length);

type Token =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "^" }
  | { t: "("; }
  | { t: ")"; };

function normalize(input: string): string {
  return input
    .replace(/[×·]/g, "*")
    .replace(/[÷:]/g, "/")
    .replace(/[−–]/g, "-")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\*\*/g, "^")
    .replace(/(\d),(\d)/g, "$1.$2") // virgule décimale française
    .replace(/[\[{]/g, "(")
    .replace(/[\]}]/g, ")");
}

function tokenize(input: string): Token[] {
  const s = normalize(input);
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
    } else if (/[0-9.]/.test(c)) {
      const m = /^\d*\.?\d+(?:e[+-]?\d+)?|^\d+\.?/i.exec(s.slice(i));
      if (!m) throw new ParseError(`Nombre invalide près de « ${s.slice(i, i + 5)} »`);
      // « 2e » doit rester « 2 × e », pas une notation scientifique incomplète.
      let raw = m[0];
      if (/e$/i.test(raw)) raw = raw.slice(0, -1);
      tokens.push({ t: "num", v: parseFloat(raw) });
      i += raw.length;
    } else if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-zA-Z_]/.test(s[j])) j++;
      const word = s.slice(i, j);
      // Découpe « axsin » en a · x · sin
      let k = 0;
      while (k < word.length) {
        const name = NAMES.find((n) => word.startsWith(n, k));
        if (name) {
          tokens.push({ t: "id", v: name });
          k += name.length;
        } else {
          tokens.push({ t: "id", v: word[k] });
          k++;
        }
      }
      i = j;
    } else if ("+-*/^".includes(c)) {
      tokens.push({ t: "op", v: c as "+" });
      i++;
    } else if (c === "(" || c === ")") {
      tokens.push({ t: c });
      i++;
    } else {
      throw new ParseError(`Caractère inattendu « ${c} »`);
    }
  }
  return tokens;
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  parse(): Node {
    if (this.tokens.length === 0) throw new ParseError("Expression vide");
    const node = this.expr();
    if (this.pos < this.tokens.length) throw new ParseError("Expression mal formée (symbole en trop)");
    return node;
  }

  private peek() {
    return this.tokens[this.pos];
  }

  // expr := term (('+'|'-') term)*
  private expr(): Node {
    let left = this.term();
    for (let tok = this.peek(); tok?.t === "op" && (tok.v === "+" || tok.v === "-"); tok = this.peek()) {
      this.pos++;
      left = { kind: "binary", op: tok.v, left, right: this.term() };
    }
    return left;
  }

  // term := unary (('*'|'/'|implicite) unary)*
  private term(): Node {
    let left = this.unary();
    for (;;) {
      const tok = this.peek();
      if (tok?.t === "op" && (tok.v === "*" || tok.v === "/")) {
        this.pos++;
        left = { kind: "binary", op: tok.v, left, right: this.unary() };
      } else if (tok && (tok.t === "num" || tok.t === "id" || tok.t === "(")) {
        left = { kind: "binary", op: "*", left, right: this.power() };
      } else {
        return left;
      }
    }
  }

  // unary := '-' unary | '+' unary | power
  private unary(): Node {
    const tok = this.peek();
    if (tok?.t === "op" && tok.v === "-") {
      this.pos++;
      return { kind: "unary", op: "-", arg: this.unary() };
    }
    if (tok?.t === "op" && tok.v === "+") {
      this.pos++;
      return this.unary();
    }
    return this.power();
  }

  // power := primary ('^' unary)?   (associatif à droite, -x^2 = -(x^2))
  private power(): Node {
    const base = this.primary();
    const tok = this.peek();
    if (tok?.t === "op" && tok.v === "^") {
      this.pos++;
      return { kind: "binary", op: "^", left: base, right: this.unary() };
    }
    return base;
  }

  private primary(): Node {
    const tok = this.peek();
    if (!tok) throw new ParseError("Expression incomplète");
    if (tok.t === "num") {
      this.pos++;
      return { kind: "num", value: tok.v };
    }
    if (tok.t === "(") {
      this.pos++;
      const inner = this.expr();
      if (this.peek()?.t !== ")") throw new ParseError("Parenthèse fermante manquante");
      this.pos++;
      return inner;
    }
    if (tok.t === "id") {
      this.pos++;
      if (tok.v in FUNCTIONS) {
        // sin(x), sin x, sin 2x → l'argument est la puissance suivante
        const arg = this.peek()?.t === "(" ? this.primary() : this.power();
        // sin(x)^2 : la puissance s'applique au résultat
        const call: Node = { kind: "call", fn: tok.v, arg };
        return call;
      }
      return { kind: "var", name: tok.v };
    }
    if (tok.t === ")") throw new ParseError("Parenthèse fermante inattendue");
    throw new ParseError(`Opérateur « ${tok.v} » mal placé`);
  }
}

function collectVars(node: Node, out: Set<string>) {
  switch (node.kind) {
    case "var":
      if (!(node.name in CONSTANTS)) out.add(node.name);
      break;
    case "unary":
      collectVars(node.arg, out);
      break;
    case "binary":
      collectVars(node.left, out);
      collectVars(node.right, out);
      break;
    case "call":
      collectVars(node.arg, out);
      break;
  }
}

type Scope = Record<string, number>;

function build(node: Node): (s: Scope) => number {
  switch (node.kind) {
    case "num": {
      const v = node.value;
      return () => v;
    }
    case "var": {
      const name = node.name;
      if (name in CONSTANTS) {
        const v = CONSTANTS[name];
        return () => v;
      }
      return (s) => s[name] ?? NaN;
    }
    case "unary": {
      const a = build(node.arg);
      return (s) => -a(s);
    }
    case "call": {
      const f = FUNCTIONS[node.fn];
      const a = build(node.arg);
      return (s) => f(a(s));
    }
    case "binary": {
      const l = build(node.left);
      const r = build(node.right);
      switch (node.op) {
        case "+": return (s) => l(s) + r(s);
        case "-": return (s) => l(s) - r(s);
        case "*": return (s) => l(s) * r(s);
        case "/": return (s) => l(s) / r(s);
        case "^": return (s) => {
          const base = l(s);
          const exp = r(s);
          // Racine cubique de négatifs : (-8)^(1/3) = -2
          if (base < 0 && !Number.isInteger(exp)) {
            const inv = 1 / exp;
            if (Number.isInteger(inv) && Math.abs(inv) % 2 === 1) return -Math.pow(-base, exp);
          }
          return Math.pow(base, exp);
        };
      }
    }
  }
}

export interface CompiledExpression {
  source: string;
  /** Évalue avec un environnement (x, paramètres...). */
  evaluate: (scope: Scope) => number;
  /** Variables libres hors constantes, triées (x incluse si présente). */
  variables: string[];
  /** Paramètres = variables libres sauf la variable principale. */
  params: string[];
}

export function compile(source: string, mainVariable = "x"): CompiledExpression {
  const ast = new Parser(tokenize(source)).parse();
  const vars = new Set<string>();
  collectVars(ast, vars);
  const variables = [...vars].sort();
  return {
    source,
    evaluate: build(ast),
    variables,
    params: variables.filter((v) => v !== mainVariable),
  };
}

/** Variante qui ne lève pas : renvoie l'erreur sous forme de message. */
export function tryCompile(source: string, mainVariable = "x"):
  | { ok: true; expr: CompiledExpression }
  | { ok: false; error: string } {
  try {
    return { ok: true, expr: compile(source, mainVariable) };
  } catch (e) {
    return { ok: false, error: e instanceof ParseError ? e.message : "Expression invalide" };
  }
}

/** Dérivée numérique (différences centrées). */
export function derivative(f: (x: number) => number, x: number, h = 1e-4): number {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** Intégrale numérique par la méthode de Simpson composite. */
export function integrate(f: (x: number) => number, a: number, b: number, n = 1000): number {
  if (a === b) return 0;
  const m = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / m;
  let sum = f(a) + f(b);
  for (let i = 1; i < m; i++) sum += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
  return (sum * h) / 3;
}

/** Formate un nombre à la française, sans zéros inutiles. */
export function fmt(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return value > 0 ? "+∞" : value < 0 ? "−∞" : "—";
  const rounded = Math.round(value * 10 ** digits) / 10 ** digits;
  const s = (Object.is(rounded, -0) ? 0 : rounded).toFixed(digits).replace(/\.?0+$/, "");
  return s.replace("-", "−").replace(".", ",");
}
