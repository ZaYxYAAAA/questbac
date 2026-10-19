/** Générateurs de questions — Mathématiques, Première. */
import { type Generator, cards, claims, frac, fracTex, int, mcq, nonZero, numeric, oneOf, par, pick, poly, shift, term, tex, tf } from "./kit";

const pt = (...n: number[]) => `(${n.map((v) => tex(v)).join("\\,;\\,")})`;
const set = (...v: string[]) => `$\\left\\{${v.join("\\,;\\,")}\\right\\}$`;
/** Ensemble de deux entiers distincts, écrit dans l'ordre croissant ; "" si les deux valeurs coïncident (à filtrer). */
const pair = (a: number, b: number) => (a === b ? "" : set(...[a, b].sort((x, y) => x - y).map(String)));
/** Deux entiers distincts tirés dans [min ; max], pour compléter les leurres. */
const pairFill = (r: () => number, min: number, max: number) => () => {
  const a = int(r, min, max);
  let b = int(r, min, max - 1);
  if (b >= a) b++;
  return pair(a, b);
};

// ───────────── Second degré ─────────────

const secondDegre: Generator[] = [
  (r) => {
    const a = nonZero(r, 5), b = int(r, -9, 9), c = int(r, -9, 9);
    const d = b * b - 4 * a * c;
    return numeric(`Discriminant de $${poly([a, b, c])}$ ?`, d, `$\\Delta = b^2 - 4ac = ${par(b)}^2 - 4 \\times ${par(a)} \\times ${par(c)} = ${d}$.`);
  },
  (r) => {
    const a = nonZero(r, 4), b = int(r, -8, 8), c = int(r, -8, 8);
    const d = b * b - 4 * a * c;
    const ans = d > 0 ? "Deux racines distinctes" : d === 0 ? "Une racine double" : "Aucune racine réelle";
    // Trois cas seulement (pas de leurre absurde comme « une infinité » pour un trinôme).
    return mcq(r, `Combien de racines réelles pour $${poly([a, b, c])} = 0$ ?`, ans, ["Deux racines distinctes", "Une racine double", "Aucune racine réelle"], `$\\Delta = ${par(b)}^2 - 4 \\times ${par(a)} \\times ${par(c)} = ${d}$, ${d > 0 ? "positif" : d === 0 ? "nul" : "négatif"}.`);
  },
  (r) => {
    const a = pick(r, [1, 1, 2, -1]), p = int(r, -7, 7), q = int(r, -7, 7);
    if (p === q) return mcq(r, `Racine de $${poly([a, -a * 2 * p, a * p * p])}$ ?`, `$${p}$`, [`$${-p}$`, `$${2 * p}$`, `$${p * p}$`], `$${a === 1 ? "" : a === -1 ? "-" : a}${p === 0 ? "x" : `(${shift(p)})`}^2$ : racine double $${p}$.`, () => `$${int(r, -7, 7)}$`);
    const lo = Math.min(p, q), hi = Math.max(p, q);
    // Ensembles de deux entiers distincts écrits dans l'ordre croissant (pas de « {-3 ; -3} », de « {5 ; 1} » ni de singleton).
    return mcq(r, `Racines de $${poly([a, -a * (p + q), a * p * q])}$ ?`, pair(lo, hi), [pair(-hi, -lo), pair(lo, -hi), pair(-lo, hi), pair(p + q, p * q)].filter(Boolean),
      `Forme factorisée : $${a === 1 ? "" : a === -1 ? "-" : a}${p === 0 ? "x" : `(${shift(p)})`}${q === 0 ? "x" : `(${shift(q)})`}$ : un produit est nul si l'un des facteurs est nul.`, pairFill(r, -7, 7));
  },
  (r) => {
    const a = nonZero(r, 3), al = int(r, -6, 6), be = int(r, -9, 9);
    const b = -2 * a * al, c = a * al * al + be;
    return mcq(r, `Sommet de la parabole $y = ${poly([a, b, c])}$ ?`, `$${pt(al, be)}$`, [`$${pt(-al, be)}$`, `$${pt(al, -be)}$`, `$${pt(be, al)}$`],
      `$\\alpha = -\\dfrac{b}{2a} = ${al}$ et $\\beta = f(${al}) = ${be}$.`);
  },
  (r) => {
    const k = nonZero(r, 7), c = int(r, -10, 10);
    const beta = c - k * k;
    const sq = `(x ${k < 0 ? "-" : "+"} ${Math.abs(k)})^2`;
    const fmt = (v: number) => (v === 0 ? "" : v < 0 ? ` - ${-v}` : ` + ${v}`);
    return mcq(r, `Forme canonique de $${poly([1, 2 * k, c])}$ ?`, `$${sq}${fmt(beta)}$`, [`$${sq}${fmt(c)}$`, `$${sq}${fmt(c + k * k)}$`, `$(x ${k < 0 ? "+" : "-"} ${Math.abs(k)})^2${fmt(beta)}$`],
      `$${poly([1, 2 * k, 0])} = ${sq} - ${k * k}$, donc $${poly([1, 2 * k, c])} = ${sq} - ${k * k} + ${par(c)}$ et $${par(c)} - ${k * k} = ${beta}$.`);
  },
  (r) => {
    const p = int(r, -6, 4), q = p + int(r, 1, 6);
    const lt = r() < 0.5;
    const inside = `$]${p}\\,;\\,${q}[$`, outside = `$]-\\infty\\,;\\,${p}[\\,\\cup\\,]${q}\\,;\\,+\\infty[$`;
    return mcq(r, `Solutions de $${poly([1, -(p + q), p * q])} ${lt ? "<" : ">"} 0$ ?`, lt ? inside : outside, [lt ? outside : inside, `$]${-q}\\,;\\,${-p}[$`, `$]${p}\\,;\\,+\\infty[$`, lt ? `$[${p}\\,;\\,${q}]$` : `$]-\\infty\\,;\\,${p}]\\,\\cup\\,[${q}\\,;\\,+\\infty[$`],
      `Racines $${p}$ et $${q}$ ; le trinôme est du signe de $a = 1 > 0$ à l'extérieur des racines, négatif entre elles.`);
  },
  (r) => {
    const a = pick(r, [1, 2, -1, 3]), p = int(r, -6, 6), q = int(r, -6, 6);
    const b = -a * (p + q), c = a * p * q;
    return oneOf(r, [
      () => mcq(r, `Somme des racines de $${poly([a, b, c])}$ ?`, `$${fracTex(-b, a)}$`, [`$${fracTex(b, a)}$`, `$${fracTex(c, a)}$`, `$${fracTex(-c, a)}$`], `$x_1 + x_2 = -\\dfrac{b}{a}$.`, () => `$${fracTex(-b + nonZero(r, 4), a)}$`),
      () => mcq(r, `Produit des racines de $${poly([a, b, c])}$ ?`, `$${fracTex(c, a)}$`, [`$${fracTex(-c, a)}$`, `$${fracTex(-b, a)}$`, `$${fracTex(b, a)}$`], `$x_1 x_2 = \\dfrac{c}{a}$.`, () => `$${fracTex(c + nonZero(r, 4), a)}$`),
    ]);
  },
];

// ───────────── Suites ─────────────

const suites: Generator[] = [
  (r) => {
    const u0 = int(r, -10, 15), d = nonZero(r, 7), n = int(r, 4, 30);
    return numeric(`$(u_n)$ arithmétique, $u_0 = ${u0}$ et $r = ${d}$. $u_{${n}} = \\;?$`, u0 + n * d, `$u_n = u_0 + nr = ${u0} + ${n} \\times ${par(d)} = ${u0 + n * d}$.`);
  },
  (r) => {
    // Rangs assez grands pour ne pas se réduire à u0 × q ou u0 × q², mais calculables de tête (aussi en automatismes).
    const u0 = pick(r, [1, 2, 3, 5, -1, -2]), q = pick(r, [2, 3, -2, 0.5]), n = q === 2 || q === -2 ? int(r, 4, 8) : int(r, 3, 5);
    const v = u0 * q ** n;
    return numeric(`$(u_n)$ géométrique, $u_0 = ${u0}$ et $q = ${tex(q)}$. $u_{${n}} = \\;?$`, v, `$u_n = u_0 \\times q^n = ${u0} \\times ${par(q)}^{${n}} = ${tex(v, 6)}$.`, undefined, 0.001);
  },
  (r) => {
    const d = nonZero(r, 6), p = int(r, 1, 8), q = p + int(r, 2, 10), u0 = int(r, -10, 10);
    return numeric(`$(u_n)$ arithmétique avec $u_{${p}} = ${u0 + p * d}$ et $u_{${q}} = ${u0 + q * d}$. Raison ?`, d, `$r = \\dfrac{u_{${q}} - u_{${p}}}{${q} - ${p}} = \\dfrac{${(q - p) * d}}{${q - p}} = ${d}$.`);
  },
  (r) => {
    const kind = int(r, 0, 2);
    if (kind === 0) {
      const d = nonZero(r, 9);
      return mcq(r, `$u_{n+1} = u_n ${d < 0 ? "-" : "+"} ${Math.abs(d)}$. La suite $(u_n)$ est…`, d > 0 ? "croissante" : "décroissante", ["croissante", "décroissante", "constante", "ni croissante ni décroissante"], `$u_{n+1} - u_n = ${d}$ ${d > 0 ? "> 0" : "< 0"}.`);
    }
    const u0 = pick(r, [1, 2, 4, 10]), q = pick(r, [0.5, 0.8, 1.5, 2, 3]);
    return mcq(r, `$(u_n)$ géométrique, $u_0 = ${u0}$, $q = ${tex(q)}$. Elle est…`, q > 1 ? "croissante" : "décroissante", ["croissante", "décroissante", "constante", "alternée"], `$u_0 > 0$ et $q ${q > 1 ? "> 1" : "\\in\\,]0\\,;\\,1["}$.`);
  },
  (r) => {
    const n = int(r, 10, 100);
    return oneOf(r, [
      () => numeric(`$1 + 2 + 3 + \\dots + ${n} = \\;?$`, (n * (n + 1)) / 2, `$\\dfrac{n(n+1)}{2} = \\dfrac{${n} \\times ${n + 1}}{2}$.`),
      () => {
        const q = pick(r, [2, 3]), k = int(r, 3, q === 2 ? 9 : 6);
        return numeric(`$1 + ${q} + ${q}^2 + \\dots + ${q}^{${k}} = \\;?$`, (q ** (k + 1) - 1) / (q - 1), `$\\dfrac{1 - q^{n+1}}{1 - q} = \\dfrac{${q}^{${k + 1}} - 1}{${q - 1}}$.`);
      },
    ]);
  },
  (r) => {
    const b = int(r, -9, 9), c = int(r, -9, 9);
    return oneOf(r, [
      () => {
        // u(n+1) - u(n) pour une suite explicite du second degré : (n + 1)² - n² = 2n + 1.
        const ans = `$${poly([2, 1 + b], "n")}$`;
        return mcq(r, `$u_n = ${poly([1, b, c], "n")}$. Expression de $u_{n+1} - u_n$ ?`, ans, [`$${poly([1, b], "n")}$`, `$${poly([2, b], "n")}$`, `$${poly([2, 1 + b, c], "n")}$`, `$${poly([0, 1 + b], "n")}$`, `$${poly([2, 1 - b], "n")}$`].filter((w) => w !== ans),
          `$u_{n+1} - u_n = \\left[(n + 1)^2 - n^2\\right]${b === 0 ? "" : ` ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}\\left[(n + 1) - n\\right]`} = 2n + 1${term(b)} = ${poly([2, 1 + b], "n")}$ : la constante $${c}$ s'élimine.`);
      },
      () => {
        const m = pick(r, [2, 3, -1, -2]), c = int(r, -4, 4), u0 = int(r, -3, 5);
        let u = u0;
        for (let i = 0; i < 3; i++) u = m * u + c;
        return numeric(`$u_0 = ${u0}$ et $u_{n+1} = ${poly([m, c], "u_n")}$. $u_3 = \\;?$`, u, `On calcule de proche en proche $u_1$, $u_2$ puis $u_3 = ${u}$.`);
      },
    ]);
  },
  claims([
    ["Une suite arithmétique de raison négative est décroissante.", true, "$u_{n+1} - u_n = r < 0$."],
    ["Une suite géométrique de raison $-2$ est croissante.", false, "Ses termes changent de signe : elle n'est pas monotone."],
    ["Les termes d'une suite arithmétique sont alignés sur un graphique.", true, "Les points $(n\\,;\\,u_n)$ sont sur une droite de pente $r$."],
    ["Si $u_{n+1} = 3u_n$, la suite est arithmétique.", false, "Elle est géométrique de raison 3."],
  ]),
];

// ───────────── Dérivation ─────────────

const derivation: Generator[] = [
  (r) => {
    const a = nonZero(r, 4), b = int(r, -6, 6), c = int(r, -9, 9), d = int(r, -9, 9);
    return mcq(r, `Dérivée de $f(x) = ${poly([a, b, c, d])}$ ?`, `$${poly([3 * a, 2 * b, c])}$`, [`$${poly([a, b, c])}$`, `$${poly([3 * a, 2 * b, c, d])}$`, `$${poly([3 * a, b, c])}$`, `$${poly([2 * a, 2 * b, c])}$`],
      `$(x^n)' = nx^{n-1}$ et une constante a une dérivée nulle.`);
  },
  (r) => {
    const a = nonZero(r, 3), b = int(r, -5, 5), c = int(r, -5, 5), x = int(r, -3, 3);
    return numeric(`$f(x) = ${poly([a, b, c])}$. Nombre dérivé $f'(${x})$ ?`, 2 * a * x + b, `$f'(x) = ${poly([2 * a, b])}$ donc $f'(${x}) = ${2 * a * x + b}$.`);
  },
  (r) => {
    const k = nonZero(r, 3), b = int(r, -5, 5), c = int(r, -6, 6), a = int(r, -3, 3);
    const m = 2 * k * a + b, fa = k * a * a + b * a + c, p = fa - m * a;
    return mcq(r, `Tangente en $${a}$ à la courbe de $f(x) = ${poly([k, b, c])}$ ?`, `$y = ${poly([m, p])}$`, [`$y = ${poly([m, fa])}$`, `$y = ${poly([fa || 1, m])}$`, `$y = ${poly([m, -p])}$`, `$y = ${poly([m, fa + m * a])}$`],
      `$y = f'(${a})${a === 0 ? "x" : `(${shift(a)})`} + f(${a})$ avec $f'(x) = ${poly([2 * k, b])}$, $f'(${a}) = ${m}$ et $f(${a}) = ${fa}$.`, () => `$y = ${poly([nonZero(r, 6), int(r, -6, 6)])}$`);
  },
  cards([
    ["$(uv)' = \\;?$", "$u'v + uv'$", ["$u'v'$", "$u'v - uv'$", "$\\dfrac{u'}{v'}$"], "Dérivée d'un produit."],
    ["$\\left(\\dfrac{u}{v}\\right)' = \\;?$", "$\\dfrac{u'v - uv'}{v^2}$", ["$\\dfrac{u'v + uv'}{v^2}$", "$\\dfrac{u'}{v'}$", "$\\dfrac{uv' - u'v}{v^2}$"], "Dérivée d'un quotient (attention à l'ordre)."],
    ["Dérivée de $\\dfrac{1}{x}$ ?", "$-\\dfrac{1}{x^2}$", ["$\\dfrac{1}{x^2}$", "$\\ln x$", "$-\\dfrac{1}{x}$"], "$(1/x)' = -1/x^2$."],
    ["Dérivée de $\\sqrt{x}$ ?", "$\\dfrac{1}{2\\sqrt{x}}$", ["$2\\sqrt{x}$", "$\\dfrac{1}{\\sqrt{x}}$", "$\\dfrac{\\sqrt{x}}{2}$"], "Sur $]0\\,;\\,+\\infty[$."],
    ["Dérivée de $\\dfrac{1}{v}$ ?", "$-\\dfrac{v'}{v^2}$", ["$\\dfrac{1}{v'}$", "$\\dfrac{v'}{v^2}$", "$-\\dfrac{1}{v^2}$"], "Cas particulier du quotient."],
  ]),
  (r) => {
    const a = nonZero(r, 5, true), b = nonZero(r, 9);
    return oneOf(r, [
      () => mcq(r, `Dérivée de $(${poly([a, b])})^2$ ?`, `$${2 * a}(${poly([a, b])})$`, [`$2(${poly([a, b])})$`, `$${a}(${poly([a, b])})$`, `$${2 * a * a}x$`, `$${2 * a}$`, `$${a * a}(${poly([a, b])})$`], `$(u^2)' = 2u'u$ avec $u' = ${a}$.`),
      () => mcq(r, `Dérivée de $\\dfrac{1}{${poly([a, b])}}$ ?`, `$\\dfrac{${-a}}{(${poly([a, b])})^2}$`, [`$\\dfrac{${a}}{(${poly([a, b])})^2}$`, `$\\dfrac{-1}{(${poly([a, b])})^2}$`, `$${fracTex(1, a)}$`, `$\\dfrac{${-a}}{${poly([a, b])}}$`], `$(1/v)' = -v'/v^2$ avec $v' = ${a}$.`),
    ]);
  },
  (r) => {
    // |a| ≥ 2 : pour a = ±1, k/a² et ±k/a se confondent (deux leurres égaux, ou un leurre égal à la réponse).
    const k = nonZero(r, 12), a = pick(r, [2, 3, 4, -2, -3, -4]);
    return mcq(r, `$f(x) = \\dfrac{${k}}{x}$. $f'(${a}) = \\;?$`, frac(-k, a * a), [frac(k, a * a), frac(-k, a), frac(k, a)], `$f'(x) = -\\dfrac{${k}}{x^2}$, donc $f'(${a}) = ${fracTex(-k, a * a)}$.`);
  },
];

// ───────────── Variations ─────────────

const variations: Generator[] = [
  (r) => {
    const p = int(r, -5, 3), q = p + int(r, 1, 5), a = pick(r, [1, 2, 3, -1, -2]);
    const between = a > 0 ? "décroissante" : "croissante";
    const fac = (v: number) => (v === 0 ? "x" : `(${shift(v)})`);
    return mcq(r, `$f'(x) = ${a === 1 ? "" : a === -1 ? "-" : a}${fac(p)}${fac(q)}$. Sur $[${p}\\,;\\,${q}]$, $f$ est…`, between, ["croissante", "décroissante", "constante", "positive"],
      `Entre ses racines, $f'$ est du signe de $-a$ : ${a > 0 ? "négative" : "positive"}.`);
  },
  (r) => {
    const a = nonZero(r, 3), al = int(r, -5, 5), be = int(r, -9, 9);
    const b = -2 * a * al, c = a * al * al + be;
    return oneOf(r, [
      () => numeric(`$f(x) = ${poly([a, b, c])}$ admet un ${a > 0 ? "minimum" : "maximum"}. Sa valeur ?`, be, `Atteint en $x = -\\dfrac{b}{2a} = ${al}$ : $f(${al}) = ${be}$.`),
      () => numeric(`En quelle valeur de $x$ la fonction $f(x) = ${poly([a, b, c])}$ atteint-elle son extremum ?`, al, `$f'(x) = ${poly([2 * a, b])} = 0 \\iff x = ${al}$.`),
    ]);
  },
  (r) => {
    // f(x) = 2x³ - 3(p + q)x² + 6pq x + c, donc f'(x) = 6(x - p)(x - q).
    const p = int(r, -5, 4), q = p + int(r, 1, 6), c = int(r, -9, 9);
    const fac = (v: number) => (v === 0 ? "x" : `(${shift(v)})`);
    return oneOf(r, [
      () => mcq(r, `$f(x) = ${poly([2, -3 * (p + q), 6 * p * q, c])}$. En quelles valeurs $f'$ s'annule-t-elle ?`, pair(p, q), [pair(-q, -p), pair(2 * p, 2 * q), pair(p + q, p * q), pair(0, q), pair(p, -q)].filter(Boolean),
        `$f'(x) = ${poly([6, -6 * (p + q), 6 * p * q])} = 6(${poly([1, -(p + q), p * q])}) = 6${fac(p)}${fac(q)}$.`, pairFill(r, -6, 10)),
      () => mcq(r, `$f(x) = ${poly([2, -3 * (p + q), 6 * p * q, c])}$. Sur quel intervalle $f$ est-elle décroissante ?`, `$[${p}\\,;\\,${q}]$`, [`$]-\\infty\\,;\\,${p}]$`, `$[${q}\\,;\\,+\\infty[$`, `$[${-q}\\,;\\,${-p}]$`, "$\\mathbb{R}$"],
        `$f'(x) = 6${fac(p)}${fac(q)}$ est négative entre ses racines $${p}$ et $${q}$ (coefficient $6 > 0$).`),
    ]);
  },
  (r) => {
    const m = nonZero(r, 6), x0 = int(r, -5, 5);
    return mcq(r, `$f'(x) = ${poly([m, -m * x0])}$. $f$ est croissante sur…`, m > 0 ? `$[${x0}\\,;\\,+\\infty[$` : `$]-\\infty\\,;\\,${x0}]$`, [m > 0 ? `$]-\\infty\\,;\\,${x0}]$` : `$[${x0}\\,;\\,+\\infty[$`, `$[${-x0}\\,;\\,+\\infty[$`, `$\\mathbb{R}$`],
      `$f'(x) \\geq 0 \\iff x ${m > 0 ? "\\geq" : "\\leq"} ${x0}$.`);
  },
  claims([
    ["Si $f'$ s'annule en changeant de signe en $a$, $f$ admet un extremum local en $a$.", true, "Théorème du cours."],
    ["Si $f'(a) = 0$, alors $f$ admet forcément un extremum en $a$.", false, "Contre-exemple : $x^3$ en 0."],
    ["Si $f' > 0$ sur un intervalle, $f$ y est strictement croissante.", true, "Lien signe de la dérivée / variations."],
    ["Une fonction croissante a une dérivée positive ou nulle.", true, "Pour une fonction dérivable sur un intervalle."],
  ]),
];

// ───────────── Exponentielle ─────────────

/** Puissance de e bien écrite : 1, e, e^{n}. */
const ePow = (n: number) => (n === 0 ? "1" : n === 1 ? "e" : `e^{${n}}`);

const exponentielle: Generator[] = [
  (r) => {
    // Exposants différents de ±1 et de 0 dans l'énoncé (pas de « e^{1} »), résultat écrit 1, e ou e^n.
    const a = nonZero(r, 9, true), b = nonZero(r, 9, true);
    // Complément si des leurres se confondent (a = b : e^{a+b} = e^{ab} pour a = 2) : une autre puissance de e.
    const fill = () => `$${ePow(int(r, -12, 12))}$`;
    return oneOf(r, [
      () => mcq(r, `$e^{${a}} \\times e^{${b}} = \\;?$`, `$${ePow(a + b)}$`, [`$${ePow(a * b)}$`, `$2${a + b === 0 ? "" : ePow(a + b)}$`, `$${ePow(a - b)}$`, `$${ePow(-(a + b))}$`], `$e^a e^b = e^{a+b}$.`, fill),
      () => mcq(r, `$\\dfrac{e^{${a}}}{e^{${b}}} = \\;?$`, `$${ePow(a - b)}$`, [`$${ePow(a + b)}$`, `$${ePow(b - a)}$`, a % b === 0 ? `$${ePow(a / b)}$` : `$e^{${fracTex(a, b)}}$`, `$${ePow(a * b)}$`], `$\\dfrac{e^a}{e^b} = e^{a-b}$.`, fill),
      () => mcq(r, `$\\left(e^{${a}}\\right)^{${b}} = \\;?$`, `$${ePow(a * b)}$`, [`$${ePow(a + b)}$`, `$${ePow(a - b)}$`, `$${b}e^{${a}}$`, `$${ePow(-a * b)}$`], `$(e^a)^b = e^{ab}$.`, fill),
    ]);
  },
  (r) => {
    const k = nonZero(r, 9, true), b = int(r, -5, 5);
    const w = (c: number) => (c === 0 ? "x" : `(${poly([1, c])})`);
    return oneOf(r, [
      () => mcq(r, `Dérivée de $e^{${k}x}$ ?`, `$${k}e^{${k}x}$`, [`$e^{${k}x}$`, `$${k}xe^{${k}x - 1}$`, `$e^{${k}}$`], `$(e^{kx})' = ke^{kx}$.`),
      () => mcq(r, `Dérivée de $e^{${poly([k, b])}}$ ?`, `$${k}e^{${poly([k, b])}}$`, [`$e^{${poly([k, b])}}$`, `$${b === 0 || b === 1 ? "x" : b === -1 ? "-" : b}e^{${poly([k, b])}}$`, `$(${poly([k, b])})e^{${poly([k, b])}}$`, `$${k}xe^{${poly([k, b])}}$`], `$(e^{u})' = u'e^{u}$ avec $u' = ${k}$.`),
      () => mcq(r, `Dérivée de $${b === 0 ? "x" : `(${poly([1, b])})`}e^{x}$ ?`, `$${w(b + 1)}e^{x}$`, [`$e^{x}$`, `$${w(b)}e^{x}$`, `$${b === -1 ? "-" : b === 0 || b === 1 ? "" : b}e^{x}$`, `$${w(b - 1)}e^{x}$`].filter((v) => v !== `$${w(b + 1)}e^{x}$`), `$(uv)' = u'v + uv'$ avec $u = ${poly([1, b])}$ et $v = e^x$ : $e^x + ${w(b)}e^x = ${w(b + 1)}e^x$.`),
    ]);
  },
  (r) => {
    // b non nul : e^{ax} = 1 donnerait x = 0 sans calcul. Leurres : signe, u = 1 au lieu de u = 0, quotient inversé, oubli de diviser par a.
    const a = nonZero(r, 6, true), b = nonZero(r, 12), c = int(r, -9, 9);
    return oneOf(r, [
      () => mcq(r, `Solution de $e^{${poly([a, b])}} = 1$ ?`, `$x = ${fracTex(-b, a)}$`, [`$x = ${fracTex(b, a)}$`, `$x = ${fracTex(1 - b, a)}$`, `$x = 0$`, `$x = ${fracTex(-a, b)}$`, `$x = ${-b}$`], `$e^{u} = 1 \\iff u = 0$ : $${poly([a, b])} = 0$, donc $x = ${fracTex(-b, a)}$.`),
      () => numeric(`Résous $e^{${poly([2, b])}} = e^{${poly([1, c])}}$. $x = \\;?$`, c - b, `$e^a = e^b \\iff a = b$ : $${poly([2, b])} = ${poly([1, c])}$, donc $x = ${c - b}$.`),
    ]);
  },
  (r) => {
    const a = int(r, -6, 6);
    // Signe de (mx + p)e^{kx} : l'exponentielle est strictement positive, seul le facteur affine compte.
    const m = nonZero(r, 3), k = pick(r, [1, -1, 2, -3]), p = -m * a;
    const lin = p === 0 ? poly([m, 0]) : `(${poly([m, p])})`, ex = `e^{${k === 1 ? "" : k === -1 ? "-" : k}x}`;
    const left = `$]-\\infty\\,;\\,${a}[$`, right = `$]${a}\\,;\\,+\\infty[$`;
    return mcq(r, `Sur quel intervalle $${lin}${ex}$ est-il strictement négatif ?`, m > 0 ? left : right, [m > 0 ? right : left, "$\\mathbb{R}$", `$]-\\infty\\,;\\,${-a}[$`, `$]${-a}\\,;\\,+\\infty[$`],
      `$${ex} > 0$ pour tout $x$ : le signe est celui de $${poly([m, p])}$, qui s'annule en $${a}$ et est du signe de $${m}$ à droite de ce zéro.`);
  },
  claims([
    ["Pour tout réel $x$, $e^x > 0$.", true, "L'exponentielle est strictement positive."],
    ["$e^0 = 0$", false, "$e^0 = 1$."],
    ["La fonction exponentielle est croissante sur $\\mathbb{R}$.", true, "Elle est égale à sa dérivée, qui est positive."],
    ["$e^{-x} = \\dfrac{1}{e^x}$", true, "Propriété algébrique."],
    ["$e^{a+b} = e^a + e^b$", false, "$e^{a+b} = e^a \\times e^b$."],
    ["$e \\approx 2{,}718$", true, "$e = e^1$."],
  ]),
];

// ───────────── Trigonométrie ─────────────

const ANGLES: Array<[number, string, string, string]> = [
  // degrés, radians, cos, sin
  [0, "0", "1", "0"],
  [30, "\\dfrac{\\pi}{6}", "\\dfrac{\\sqrt{3}}{2}", "\\dfrac{1}{2}"],
  [45, "\\dfrac{\\pi}{4}", "\\dfrac{\\sqrt{2}}{2}", "\\dfrac{\\sqrt{2}}{2}"],
  [60, "\\dfrac{\\pi}{3}", "\\dfrac{1}{2}", "\\dfrac{\\sqrt{3}}{2}"],
  [90, "\\dfrac{\\pi}{2}", "0", "1"],
  [120, "\\dfrac{2\\pi}{3}", "-\\dfrac{1}{2}", "\\dfrac{\\sqrt{3}}{2}"],
  [135, "\\dfrac{3\\pi}{4}", "-\\dfrac{\\sqrt{2}}{2}", "\\dfrac{\\sqrt{2}}{2}"],
  [150, "\\dfrac{5\\pi}{6}", "-\\dfrac{\\sqrt{3}}{2}", "\\dfrac{1}{2}"],
  [180, "\\pi", "-1", "0"],
  [210, "\\dfrac{7\\pi}{6}", "-\\dfrac{\\sqrt{3}}{2}", "-\\dfrac{1}{2}"],
  [240, "\\dfrac{4\\pi}{3}", "-\\dfrac{1}{2}", "-\\dfrac{\\sqrt{3}}{2}"],
  [270, "\\dfrac{3\\pi}{2}", "0", "-1"],
  [300, "\\dfrac{5\\pi}{3}", "\\dfrac{1}{2}", "-\\dfrac{\\sqrt{3}}{2}"],
  [330, "\\dfrac{11\\pi}{6}", "\\dfrac{\\sqrt{3}}{2}", "-\\dfrac{1}{2}"],
];
const TRIG_VALUES = ["0", "1", "-1", "\\dfrac{1}{2}", "-\\dfrac{1}{2}", "\\dfrac{\\sqrt{2}}{2}", "-\\dfrac{\\sqrt{2}}{2}", "\\dfrac{\\sqrt{3}}{2}", "-\\dfrac{\\sqrt{3}}{2}"];

/** Mesures en π/6 et π/4 pour la mesure principale : numérateur / dénominateur. */
const radTex = (n: number, d: number) => {
  if (n === 0) return "0";
  const g = ((a: number, b: number): number => (b ? g(b, a % b) : Math.abs(a)));
  const k = g(n, d);
  const [a, b] = [n / k, d / k];
  const num = `${a < 0 ? "-" : ""}${Math.abs(a) === 1 ? "" : Math.abs(a)}\\pi`;
  return b === 1 ? num : `${a < 0 ? "-" : ""}\\dfrac{${Math.abs(a) === 1 ? "" : Math.abs(a)}\\pi}{${b}}`;
};

const trigo: Generator[] = [
  (r) => {
    const [deg, rad] = pick(r, ANGLES.filter(([d]) => d > 0));
    return r() < 0.5
      ? mcq(r, `$${deg}°$ en radians ?`, `$${rad}$`, ANGLES.filter(([d]) => d !== deg && d > 0).map(([, x]) => `$${x}$`), `$${deg}° = ${deg} \\times \\dfrac{\\pi}{180} = ${rad}$.`)
      : mcq(r, `$${rad}$ rad en degrés ?`, `$${deg}°$`, ANGLES.filter(([d]) => d !== deg && d > 0).map(([d]) => `$${d}°$`), `$\\pi$ rad $= 180°$.`);
  },
  (r) => {
    const [, rad, c, s] = pick(r, ANGLES);
    return r() < 0.5
      ? mcq(r, `$\\cos\\left(${rad}\\right) = \\;?$`, `$${c}$`, TRIG_VALUES.filter((v) => v !== c).map((v) => `$${v}$`), `Lecture sur le cercle trigonométrique : abscisse du point associé.`)
      : mcq(r, `$\\sin\\left(${rad}\\right) = \\;?$`, `$${s}$`, TRIG_VALUES.filter((v) => v !== s).map((v) => `$${v}$`), `Lecture sur le cercle trigonométrique : ordonnée du point associé.`);
  },
  (r) => {
    const d = pick(r, [3, 4, 6]);
    const base = int(r, -d + 1, d);
    const k = nonZero(r, 3);
    const n = base + 2 * d * k;
    return mcq(r, `Mesure principale de $${radTex(n, d)}$ ?`, `$${radTex(base, d)}$`, [`$${radTex(base + d, d)}$`, `$${radTex(-base || d, d)}$`, `$${radTex(base + 2 * d, d)}$`, `$${radTex(base - d, d)}$`],
      `On retire $${radTex(2 * d * k, d)}$ (des tours complets) pour arriver dans $]-\\pi\\,;\\,\\pi]$.`);
  },
  (r) => {
    // cos² + sin² = 1, puis le signe se lit sur l'intervalle (quart de cercle) où se trouve x.
    const [a, b, h] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]] as const);
    const [iv, sc, ss] = pick(r, [
      ["\\left[0\\,;\\,\\dfrac{\\pi}{2}\\right]", 1, 1],
      ["\\left[\\dfrac{\\pi}{2}\\,;\\,\\pi\\right]", -1, 1],
      ["\\left[-\\dfrac{\\pi}{2}\\,;\\,0\\right]", 1, -1],
      ["\\left[-\\pi\\,;\\,-\\dfrac{\\pi}{2}\\right]", -1, -1],
    ] as const);
    const giveCos = r() < 0.5;
    const [given, wanted, name, other, sign] = giveCos ? [sc * a, ss * b, "\\sin", "\\cos", ss] : [ss * a, sc * b, "\\cos", "\\sin", sc];
    return mcq(r, `$x \\in ${iv}$ et $${other} x = ${fracTex(given, h)}$. $${name} x = \\;?$`, frac(wanted, h), [frac(-wanted, h), frac(a, b), frac(h - a, h), frac(sign * (h - a), h)],
      `$${name}^2 x = 1 - ${other}^2 x = \\dfrac{${b * b}}{${h * h}}$, donc $${name} x = \\pm\\dfrac{${b}}{${h}}$ ; sur cet intervalle, $${name} x ${sign > 0 ? "\\geq" : "\\leq"} 0$.`);
  },
  claims([
    ["$\\cos(-x) = \\cos x$", true, "Le cosinus est pair."],
    ["$\\sin(-x) = \\sin x$", false, "Le sinus est impair : $\\sin(-x) = -\\sin x$."],
    ["$\\sin(\\pi - x) = \\sin x$", true, "Symétrie par rapport à l'axe des ordonnées."],
    ["$\\cos(\\pi + x) = \\cos x$", false, "$\\cos(\\pi + x) = -\\cos x$."],
    ["$\\cos^2 x + \\sin^2 x = 1$", true, "Relation fondamentale."],
    ["$\\cos\\left(\\dfrac{\\pi}{2} - x\\right) = \\sin x$", true, "Angles complémentaires."],
  ]),
];

// ───────────── Produit scalaire ─────────────

const produitScalaire: Generator[] = [
  (r) => {
    const a = int(r, -6, 6), b = int(r, -6, 6), c = int(r, -6, 6), d = int(r, -6, 6);
    return numeric(`$\\vec{u}\\,${pt(a, b)}$ et $\\vec{v}\\,${pt(c, d)}$. $\\vec{u} \\cdot \\vec{v} = \\;?$`, a * c + b * d, `$xx' + yy' = ${par(a)} \\times ${par(c)} + ${par(b)} \\times ${par(d)} = ${a * c + b * d}$.`);
  },
  (r) => {
    const a = nonZero(r, 6), b = nonZero(r, 6), k = nonZero(r, 3);
    const ortho = r() < 0.5;
    const [c, d] = ortho ? [-b * k, a * k] : [-b * k + nonZero(r, 2), a * k];
    return tf(`$\\vec{u}\\,${pt(a, b)}$ et $\\vec{v}\\,${pt(c, d)}$ sont orthogonaux.`, ortho, `$\\vec{u} \\cdot \\vec{v} = ${a * c + b * d}$${ortho ? " : nul" : " : non nul"}.`);
  },
  (r) => {
    const u = int(r, 1, 8), v = int(r, 1, 8);
    const [deg, cos, cosTex] = pick(r, [[0, 1, "1"], [60, 0.5, "\\dfrac12"], [90, 0, "0"], [120, -0.5, "-\\dfrac12"], [180, -1, "-1"]] as const);
    return numeric(`$\\|\\vec{u}\\| = ${u}$, $\\|\\vec{v}\\| = ${v}$ et l'angle entre eux vaut $${deg}°$. $\\vec{u} \\cdot \\vec{v} = \\;?$`, u * v * cos, `$\\|\\vec{u}\\|\\,\\|\\vec{v}\\|\\cos\\theta = ${u} \\times ${v} \\times ${cosTex}$.`, undefined, 0.01);
  },
  (r) => {
    const b = int(r, 2, 9), c = int(r, 2, 9);
    return numeric(`Triangle $ABC$ : $AB = ${c}$, $AC = ${b}$ et $\\widehat{A} = 60°$. $BC^2 = \\;?$`, b * b + c * c - b * c, `Al-Kashi : $BC^2 = AB^2 + AC^2 - 2\\,AB\\cdot AC\\cos 60° = ${c * c} + ${b * b} - ${b * c}$.`);
  },
  (r) => {
    // Produit scalaire à partir de points : on forme d'abord les vecteurs AB et AC.
    const xa = int(r, -5, 5), ya = int(r, -5, 5), xb = int(r, -6, 6), yb = int(r, -6, 6), xc = int(r, -6, 6), yc = int(r, -6, 6);
    const [ux, uy, vx, vy] = [xb - xa, yb - ya, xc - xa, yc - ya];
    return numeric(`$A${pt(xa, ya)}$, $B${pt(xb, yb)}$ et $C${pt(xc, yc)}$. $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = \\;?$`, ux * vx + uy * vy,
      `$\\overrightarrow{AB}\\,${pt(ux, uy)}$ et $\\overrightarrow{AC}\\,${pt(vx, vy)}$, donc $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = ${par(ux)} \\times ${par(vx)} + ${par(uy)} \\times ${par(vy)} = ${ux * vx + uy * vy}$.`);
  },
  (r) => {
    // |‖u‖ - ‖v‖| ≤ ‖u + v‖ ≤ ‖u‖ + ‖v‖ (inégalité triangulaire) : sinon la situation est impossible.
    const u = int(r, 1, 6), v = int(r, 1, 6), s = int(r, Math.max(1, Math.abs(u - v)), u + v);
    return numeric(`$\\|\\vec{u}+\\vec{v}\\| = ${s}$, $\\|\\vec{u}\\| = ${u}$, $\\|\\vec{v}\\| = ${v}$. $\\vec{u}\\cdot\\vec{v} = \\;?$`, (s * s - u * u - v * v) / 2, `$\\vec{u}\\cdot\\vec{v} = \\dfrac12\\left(\\|\\vec{u}+\\vec{v}\\|^2 - \\|\\vec{u}\\|^2 - \\|\\vec{v}\\|^2\\right)$.`, undefined, 0.01);
  },
];

// ───────────── Probabilités conditionnelles ─────────────

const d10 = (r: () => number, lo = 1, hi = 9) => int(r, lo, hi) / 10;

const probasCond: Generator[] = [
  (r) => {
    const pa = d10(r), pb = d10(r);
    return numeric(`$P(A) = ${tex(pa)}$ et $P_A(B) = ${tex(pb)}$. $P(A \\cap B) = \\;?$`, pa * pb, `$P(A \\cap B) = P(A) \\times P_A(B) = ${tex(pa * pb)}$.`, undefined, 0.001);
  },
  (r) => {
    // P_A(B) tirée indépendamment de P(A) (sinon elle serait toujours plus petite, et souvent égale à 0,1).
    const pa = d10(r, 2, 8), pba = d10(r), pab = Math.round(pa * pba * 100) / 100;
    return numeric(`$P(A) = ${tex(pa)}$ et $P(A \\cap B) = ${tex(pab)}$. $P_A(B) = \\;?$`, pba, `$P_A(B) = \\dfrac{P(A \\cap B)}{P(A)} = \\dfrac{${tex(pab)}}{${tex(pa)}} = ${tex(pba)}$.`, undefined, 0.001);
  },
  (r) => {
    const pa = d10(r), x = d10(r), y = d10(r);
    const pb = pa * x + (1 - pa) * y;
    return numeric(`$P(A) = ${tex(pa)}$, $P_A(B) = ${tex(x)}$, $P_{\\overline{A}}(B) = ${tex(y)}$. $P(B) = \\;?$`, pb, `Probabilités totales : $${tex(pa)} \\times ${tex(x)} + ${tex(1 - pa)} \\times ${tex(y)} = ${tex(pb)}$.`, undefined, 0.001);
  },
  (r) => {
    const pa = d10(r), pb = d10(r);
    const indep = r() < 0.5;
    const pab = indep ? pa * pb : pa * pb + pick(r, [0.01, 0.02, -0.01]);
    return tf(`$P(A) = ${tex(pa)}$, $P(B) = ${tex(pb)}$, $P(A \\cap B) = ${tex(pab)}$. $A$ et $B$ sont indépendants.`, indep, `$P(A) \\times P(B) = ${tex(pa * pb)}$${indep ? " : égal à $P(A \\cap B)$" : ", différent de $P(A \\cap B)$"}.`);
  },
  (r) => {
    const pa = d10(r), x = d10(r), y = d10(r);
    const pb = pa * x + (1 - pa) * y;
    const ans = (pa * x) / pb;
    return numeric(`$P(A) = ${tex(pa)}$, $P_A(B) = ${tex(x)}$, $P_{\\overline{A}}(B) = ${tex(y)}$. $P_B(A)$ (arrondi à $0{,}01$) ?`, Math.round(ans * 100) / 100, `$P_B(A) = \\dfrac{P(A \\cap B)}{P(B)} = \\dfrac{${tex(pa * x)}}{${tex(pb)}} \\approx ${tex(ans, 2)}$.`, undefined, 0.011, 2);
  },
  claims([
    ["Sur un arbre pondéré, la somme des probabilités issues d'un même nœud vaut 1.", true, "Les branches issues d'un nœud forment une partition."],
    ["$P_A(B) = P_B(A)$ en général.", false, "Ces deux probabilités sont généralement différentes."],
    ["Si $A$ et $B$ sont indépendants, $P_A(B) = P(B)$.", true, "Savoir que $A$ est réalisé ne change rien pour $B$."],
  ]),
];

// ───────────── Variables aléatoires ─────────────

const va: Generator[] = [
  (r) => {
    const x = [int(r, -5, 0), int(r, 1, 4), int(r, 5, 10)], p1 = d10(r, 1, 5), p2 = d10(r, 1, 9 - Math.round(p1 * 10) - 0);
    const p3 = Math.round((1 - p1 - p2) * 10) / 10;
    if (p3 <= 0) return numeric(`$P(X = 1) = ${tex(p1)}$ et $P(X = 2) = ${tex(1 - p1)}$. $E(X) = \\;?$`, p1 + 2 * (1 - p1), `$E(X) = 1 \\times ${tex(p1)} + 2 \\times ${tex(1 - p1)}$.`, undefined, 0.001);
    const e = x[0] * p1 + x[1] * p2 + x[2] * p3;
    return numeric(`$X$ prend les valeurs $${x.join("\\,;\\,")}$ avec les probabilités $${tex(p1)}\\,;\\,${tex(p2)}\\,;\\,${tex(p3)}$. $E(X) = \\;?$`, e, `$E(X) = \\sum x_i\\,p_i = ${tex(e)}$.`, undefined, 0.001);
  },
  (r) => {
    const p1 = d10(r, 1, 4), p2 = d10(r, 1, 4), p3 = Math.round((1 - p1 - p2) * 10) / 10;
    const x1 = int(r, -4, 0), x2 = int(r, 1, 4), x3 = int(r, 5, 12);
    const e = x1 * p1 + x2 * p2 + x3 * p3;
    return oneOf(r, [
      () => numeric(`$X$ prend les valeurs $${x1}$, $${x2}$ et $${x3}$ avec $P(X = ${x1}) = ${tex(p1)}$ et $P(X = ${x2}) = ${tex(p2)}$. $E(X) = \\;?$`, e,
        `$P(X = ${x3}) = 1 - ${tex(p1)} - ${tex(p2)} = ${tex(p3)}$, puis $E(X) = ${par(x1)} \\times ${tex(p1)} + ${x2} \\times ${tex(p2)} + ${x3} \\times ${tex(p3)} = ${tex(e)}$.`, undefined, 0.001),
      () => numeric(`$X$ prend les valeurs $${x1}$, $${x2}$ et $x$ avec les probabilités $${tex(p1)}$, $${tex(p2)}$ et $${tex(p3)}$. Sachant que $E(X) = ${tex(e)}$, que vaut $x$ ?`, x3,
        `$${par(x1)} \\times ${tex(p1)} + ${x2} \\times ${tex(p2)} + ${tex(p3)}x = ${tex(e)}$, d'où $${tex(p3)}x = ${tex(x3 * p3)}$ et $x = ${x3}$.`, undefined, 0.001),
    ]);
  },
  (r) => {
    const e = int(r, -5, 10), a = nonZero(r, 5), b = int(r, -9, 9), v = int(r, 1, 9);
    return oneOf(r, [
      () => numeric(`$E(X) = ${e}$. $E(${poly([a, b], "X")}) = \\;?$`, a * e + b, `$E(aX + b) = aE(X) + b$.`),
      () => numeric(`$V(X) = ${v}$. $V(${poly([a, b], "X")}) = \\;?$`, a * a * v, `$V(aX + b) = a^2 V(X)$ : le $+b$ ne change pas la dispersion.`),
      () => numeric(`$\\sigma(X) = ${v}$. $\\sigma(${poly([a, b], "X")}) = \\;?$`, Math.abs(a) * v, `$V(aX + b) = a^2 V(X)$, donc $\\sigma(aX + b) = |a|\\,\\sigma(X) = ${Math.abs(a)} \\times ${v} = ${Math.abs(a) * v}$ : un écart-type n'est jamais négatif.`),
    ]);
  },
  (r) => {
    const mise = int(r, 1, 5), gain = int(r, 5, 20), n = pick(r, [4, 5, 6, 8, 10]);
    const e = gain / n - mise;
    return numeric(`On paie $${mise}$ € pour jouer ; on gagne $${gain}$ € avec probabilité $\\frac{1}{${n}}$. Espérance du gain net (en €) ?`, e, `$E = ${gain} \\times \\frac{1}{${n}} - ${mise} = ${tex(e)}$ €.`, "€", 0.01);
  },
  claims([
    ["Si $E(X) < 0$ pour le gain d'un jeu, le jeu est défavorable au joueur.", true, "En moyenne, il perd de l'argent."],
    ["La variance peut être négative.", false, "C'est une moyenne de carrés : $V(X) \\geq 0$."],
    ["$E(X + Y) = E(X) + E(Y)$", true, "Linéarité de l'espérance."],
  ]),
];

export const MATHS_PREMIERE: Record<string, Generator[]> = {
  "maths-1-second-degre": secondDegre,
  "maths-1-suites": suites,
  "maths-1-derivation": derivation,
  "maths-1-variations": variations,
  "maths-1-exponentielle": exponentielle,
  "maths-1-trigo": trigo,
  "maths-1-produit-scalaire": produitScalaire,
  "maths-1-probas-cond": probasCond,
  "maths-1-va": va,
};

