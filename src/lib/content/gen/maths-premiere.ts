/** Générateurs de questions — Mathématiques, Première. */
import { type Generator, cards, claims, frac, fracTex, int, mcq, nonZero, numeric, oneOf, par, pick, poly, shift, tex, tf } from "./kit";

const pt = (...n: number[]) => `(${n.map((v) => tex(v)).join("\\,;\\,")})`;
const set = (...v: string[]) => `$\\left\\{${v.join("\\,;\\,")}\\right\\}$`;

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
    return mcq(r, `Combien de racines réelles pour $${poly([a, b, c])} = 0$ ?`, ans, ["Deux racines distinctes", "Une racine double", "Aucune racine réelle", "Une infinité"], `$\\Delta = ${d}$, ${d > 0 ? "positif" : d === 0 ? "nul" : "négatif"}.`);
  },
  (r) => {
    const a = pick(r, [1, 1, 2, -1]), p = int(r, -7, 7), q = int(r, -7, 7);
    if (p === q) return mcq(r, `Racine de $${poly([a, -a * 2 * p, a * p * p])}$ ?`, `$${p}$`, [`$${-p}$`, `$${2 * p}$`, `$${p * p}$`], `$${a === 1 ? "" : a === -1 ? "-" : a}(x ${p < 0 ? "+" : "-"} ${Math.abs(p)})^2$ : racine double $${p}$.`);
    const lo = Math.min(p, q), hi = Math.max(p, q);
    return mcq(r, `Racines de $${poly([a, -a * (p + q), a * p * q])}$ ?`, set(String(lo), String(hi)), [set(String(-hi), String(-lo)), set(String(lo), String(-hi)), set(String(p + q), String(p * q))],
      `Forme factorisée : $${a === 1 ? "" : a === -1 ? "-" : a}(x - ${par(p)})(x - ${par(q)})$.`);
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
      `$x^2 + ${2 * k}x = ${sq} - ${k * k}$, donc on ajoute $${par(c)} - ${k * k} = ${beta}$.`);
  },
  (r) => {
    const p = int(r, -6, 4), q = p + int(r, 1, 6);
    const lt = r() < 0.5;
    const inside = `$]${p}\\,;\\,${q}[$`, outside = `$]-\\infty\\,;\\,${p}[\\,\\cup\\,]${q}\\,;\\,+\\infty[$`;
    return mcq(r, `Solutions de $${poly([1, -(p + q), p * q])} ${lt ? "<" : ">"} 0$ ?`, lt ? inside : outside, [lt ? outside : inside, `$]${-q}\\,;\\,${-p}[$`, `$]${p}\\,;\\,+\\infty[$`],
      `Racines $${p}$ et $${q}$ ; le trinôme est du signe de $a = 1 > 0$ à l'extérieur des racines, négatif entre elles.`);
  },
  (r) => {
    const a = pick(r, [1, 2, -1, 3]), p = int(r, -6, 6), q = int(r, -6, 6);
    const b = -a * (p + q), c = a * p * q;
    return oneOf(r, [
      () => mcq(r, `Somme des racines de $${poly([a, b, c])}$ ?`, `$${fracTex(-b, a)}$`, [`$${fracTex(b, a)}$`, `$${fracTex(c, a)}$`, `$${fracTex(-c, a)}$`], `$x_1 + x_2 = -\\dfrac{b}{a}$.`),
      () => mcq(r, `Produit des racines de $${poly([a, b, c])}$ ?`, `$${fracTex(c, a)}$`, [`$${fracTex(-c, a)}$`, `$${fracTex(-b, a)}$`, `$${fracTex(b, a)}$`], `$x_1 x_2 = \\dfrac{c}{a}$.`),
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
    const u0 = pick(r, [1, 2, 3, 5, -1, -2]), q = pick(r, [2, 3, -2, 0.5]), n = int(r, 2, q === 3 ? 5 : 7);
    const v = u0 * q ** n;
    return numeric(`$(u_n)$ géométrique, $u_0 = ${u0}$ et $q = ${tex(q)}$. $u_{${n}} = \\;?$`, v, `$u_n = u_0 \\times q^n = ${u0} \\times ${par(q)}^{${n}} = ${tex(v)}$.`, undefined, 0.001);
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
    const a = nonZero(r, 6), b = int(r, -9, 9), k = int(r, 0, 20);
    return oneOf(r, [
      () => numeric(`$u_n = ${poly([a, b], "n")}$. $u_{${k}} = \\;?$`, a * k + b, `$u_{${k}} = ${a} \\times ${k} + ${par(b)}$.`),
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
    const b = int(r, -4, 4), a = int(r, -3, 3);
    const m = 2 * a + b, fa = a * a + b * a, p = fa - m * a;
    return mcq(r, `Tangente en $${a}$ à la courbe de $f(x) = ${poly([1, b, 0])}$ ?`, `$y = ${poly([m, p])}$`, [`$y = ${poly([m, fa])}$`, `$y = ${poly([fa || 1, m])}$`, `$y = ${poly([m, -p])}$`],
      `$y = f'(${a})(x - ${par(a)}) + f(${a})$ avec $f'(${a}) = ${m}$ et $f(${a}) = ${fa}$.`, () => `$y = ${poly([nonZero(r, 6), int(r, -6, 6)])}$`);
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
      () => mcq(r, `Dérivée de $(${poly([a, b])})^2$ ?`, `$${2 * a}(${poly([a, b])})$`, [`$2(${poly([a, b])})$`, `$${a}(${poly([a, b])})$`, `$(${poly([a, 0])})^2$`], `$(u^2)' = 2u'u$ avec $u' = ${a}$.`),
      () => mcq(r, `Dérivée de $\\dfrac{1}{${poly([a, b])}}$ ?`, `$\\dfrac{${-a}}{(${poly([a, b])})^2}$`, [`$\\dfrac{${a}}{(${poly([a, b])})^2}$`, `$\\dfrac{-1}{(${poly([a, b])})^2}$`, `$\\dfrac{1}{${a}}$`], `$(1/v)' = -v'/v^2$ avec $v' = ${a}$.`),
    ]);
  },
  (r) => {
    const k = nonZero(r, 12), a = pick(r, [1, 2, 3, 4, -1, -2]);
    return mcq(r, `$f(x) = \\dfrac{${k}}{x}$. $f'(${a}) = \\;?$`, frac(-k, a * a), [frac(k, a * a), frac(-k, a), frac(k, a)], `$f'(x) = -\\dfrac{${k}}{x^2}$, donc $f'(${a}) = ${fracTex(-k, a * a)}$.`);
  },
];

// ───────────── Variations ─────────────

const variations: Generator[] = [
  (r) => {
    const p = int(r, -5, 3), q = p + int(r, 1, 5), a = pick(r, [1, 2, 3, -1, -2]);
    const between = a > 0 ? "décroissante" : "croissante";
    return mcq(r, `$f'(x) = ${a === 1 ? "" : a === -1 ? "-" : a}(x ${p < 0 ? "+" : "-"} ${Math.abs(p)})(x ${q < 0 ? "+" : "-"} ${Math.abs(q)})$. Sur $[${p}\\,;\\,${q}]$, $f$ est…`, between, ["croissante", "décroissante", "constante", "positive"],
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
    const k = int(r, 1, 5);
    return mcq(r, `$f(x) = ${poly([1, 0, -3 * k * k, 0])}$. En quelles valeurs $f'$ s'annule-t-elle ?`, set(`-${k}`, String(k)), [set(String(-3 * k), String(3 * k)), set("0", String(k)), set(`-${k * k}`, String(k * k))],
      `$f'(x) = 3x^2 - ${3 * k * k} = 3(x^2 - ${k * k})$.`);
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

const exponentielle: Generator[] = [
  (r) => {
    const a = nonZero(r, 9), b = nonZero(r, 9);
    return oneOf(r, [
      () => mcq(r, `$e^{${a}} \\times e^{${b}} = \\;?$`, `$e^{${a + b}}$`, [`$e^{${a * b}}$`, `$2e^{${a + b}}$`, `$e^{${a - b}}$`], `$e^a e^b = e^{a+b}$.`),
      () => mcq(r, `$\\dfrac{e^{${a}}}{e^{${b}}} = \\;?$`, `$e^{${a - b}}$`, [`$e^{${a + b}}$`, `$e^{${b - a}}$`, `$e^{${fracTex(a, b)}}$`], `$\\dfrac{e^a}{e^b} = e^{a-b}$.`),
      () => mcq(r, `$\\left(e^{${a}}\\right)^{${b}} = \\;?$`, `$e^{${a * b}}$`, [`$e^{${a + b}}$`, `$e^{${a - b}}$`, `$${b}e^{${a}}$`], `$(e^a)^b = e^{ab}$.`),
    ]);
  },
  (r) => {
    const k = nonZero(r, 9, true), b = int(r, -5, 5);
    return oneOf(r, [
      () => mcq(r, `Dérivée de $e^{${k}x}$ ?`, `$${k}e^{${k}x}$`, [`$e^{${k}x}$`, `$${k}xe^{${k}x - 1}$`, `$e^{${k}}$`], `$(e^{kx})' = ke^{kx}$.`),
      () => mcq(r, `Dérivée de $e^{${poly([k, b])}}$ ?`, `$${k}e^{${poly([k, b])}}$`, [`$e^{${poly([k, b])}}$`, `$${b || 1}e^{${poly([k, b])}}$`, `$(${poly([k, b])})e^{${poly([k, b])}}$`], `$(e^{u})' = u'e^{u}$.`),
      () => mcq(r, `Dérivée de $${poly([1, b])} \\cdot e^{x}$ ?`, `$(${poly([1, b + 1])})e^{x}$`, [`$e^{x}$`, `$(${poly([1, b])})e^{x}$`, `$${b || 1}e^{x}$`], `$(uv)' = u'v + uv' = e^x + (${poly([1, b])})e^x$.`),
    ]);
  },
  (r) => {
    const a = nonZero(r, 6, true), b = int(r, -12, 12), c = int(r, -9, 9);
    return oneOf(r, [
      () => mcq(r, `Solution de $e^{${poly([a, b])}} = 1$ ?`, `$x = ${fracTex(-b, a)}$`, [`$x = ${fracTex(b, a)}$`, `$x = ${fracTex(1 - b, a)}$`, `$x = 0$`], `$e^{u} = 1 \\iff u = 0$.`),
      () => numeric(`Résous $e^{2x ${b < 0 ? "-" : "+"} ${Math.abs(b)}} = e^{x ${c < 0 ? "-" : "+"} ${Math.abs(c)}}$. $x = \\;?$`, c - b, `$e^a = e^b \\iff a = b$ : $2x + ${par(b)} = x + ${par(c)}$.`),
    ]);
  },
  (r) => {
    const a = int(r, -6, 6);
    return mcq(r, `Signe de $(${shift(a)})e^{x}$ : négatif sur…`, `$]-\\infty\\,;\\,${a}[$`, [`$]${a}\\,;\\,+\\infty[$`, `$\\mathbb{R}$`, `$]-\\infty\\,;\\,${-a}[$`], `$e^x > 0$ : le signe est celui de $x - ${par(a)}$.`);
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
    const [a, b, h] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]] as const);
    return mcq(r, `$x \\in \\left[0\\,;\\,\\dfrac{\\pi}{2}\\right]$ et $\\cos x = \\dfrac{${a}}{${h}}$. $\\sin x = \\;?$`, frac(b, h), [frac(a, b), frac(h - a, h), frac(-b, h)], `$\\sin^2 x = 1 - \\cos^2 x = \\dfrac{${b * b}}{${h * h}}$ et $\\sin x \\geq 0$.`);
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
    const a = int(r, -7, 7), b = int(r, -7, 7);
    return numeric(`$\\vec{u}\\,${pt(a, b)}$. $\\|\\vec{u}\\|^2 = \\;?$`, a * a + b * b, `$x^2 + y^2 = ${a * a} + ${b * b}$.`);
  },
  (r) => {
    const s = int(r, 2, 10), u = int(r, 1, 6), v = int(r, 1, 6);
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
    const pa = d10(r, 2, 8), pab = (int(r, 1, Math.round(pa * 10) - 1) * pa) / 10;
    return numeric(`$P(A) = ${tex(pa)}$ et $P(A \\cap B) = ${tex(pab)}$. $P_A(B) = \\;?$`, pab / pa, `$P_A(B) = \\dfrac{P(A \\cap B)}{P(A)} = ${tex(pab / pa)}$.`, undefined, 0.001);
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
    const p1 = d10(r, 1, 4), p2 = d10(r, 1, 4);
    return numeric(`$X$ prend 3 valeurs avec $P(X = x_1) = ${tex(p1)}$ et $P(X = x_2) = ${tex(p2)}$. $P(X = x_3) = \\;?$`, 1 - p1 - p2, `La somme des probabilités vaut 1 : $1 - ${tex(p1)} - ${tex(p2)}$.`, undefined, 0.001);
  },
  (r) => {
    const e = int(r, -5, 10), a = nonZero(r, 5), b = int(r, -9, 9), v = int(r, 1, 9);
    return oneOf(r, [
      () => numeric(`$E(X) = ${e}$. $E(${poly([a, b], "X")}) = \\;?$`, a * e + b, `$E(aX + b) = aE(X) + b$.`),
      () => numeric(`$V(X) = ${v}$. $V(${poly([a, b], "X")}) = \\;?$`, a * a * v, `$V(aX + b) = a^2 V(X)$ : le $+b$ ne change pas la dispersion.`),
      () => numeric(`$V(X) = ${v * v}$. Écart-type $\\sigma(X)$ ?`, v, `$\\sigma = \\sqrt{V}$.`),
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

