/** Générateurs de questions — Mathématiques, Terminale. */
import { type Generator, cards, claims, frac, fracTex, int, mcq, nonZero, numeric, oneOf, par, pick, poly, tex, term, tf } from "./kit";

const pt = (...n: number[]) => `(${n.map((v) => tex(v)).join("\\,;\\,")})`;
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const binom = (n: number, k: number) => fact(n) / (fact(k) * fact(n - k));
const LIMITS = ["$+\\infty$", "$-\\infty$", "$0$", "$1$"];

// ───────────── Suites et récurrence ─────────────

const recurrence: Generator[] = [
  (r) => {
    const q = pick(r, [0.2, 0.5, 0.9, -0.5, 1.5, 2, 3, -0.3, 0.99, 1.01]);
    const ans = Math.abs(q) < 1 ? "$0$" : "$+\\infty$";
    return mcq(r, `$\\displaystyle\\lim_{n \\to +\\infty} ${par(q)}^{n} = \\;?$`, ans, [...LIMITS, "n'existe pas"], Math.abs(q) < 1 ? `$|q| < 1$ donc $q^n \\to 0$.` : `$q > 1$ donc $q^n \\to +\\infty$.`);
  },
  (r) => {
    const a = nonZero(r, 9), b = int(r, -9, 9), c = nonZero(r, 9), d = int(r, -9, 9);
    return mcq(r, `$\\displaystyle\\lim_{n \\to +\\infty} \\dfrac{${poly([a, b], "n")}}{${poly([c, d], "n")}} = \\;?$`, frac(a, c), [frac(b || 1, d || 1), frac(c, a), "$+\\infty$", "$0$"], `On factorise par $n$ : limite $\\dfrac{${a}}{${c}}$.`);
  },
  (r) => {
    const a = nonZero(r, 5), b = int(r, -20, 20), c = int(r, -20, 20);
    return mcq(r, `$\\displaystyle\\lim_{n \\to +\\infty} \\left(${poly([a, b, c], "n")}\\right) = \\;?$`, a > 0 ? "$+\\infty$" : "$-\\infty$", [...LIMITS, `$${a}$`], `Le terme de plus haut degré $${a}n^2$ l'emporte.`);
  },
  cards([
    ["$\\displaystyle\\lim_{n\\to+\\infty} \\dfrac{1}{n^2} = \\;?$", "$0$", ["$+\\infty$", "$1$", "$-\\infty$"], "Inverse d'une quantité qui tend vers $+\\infty$."],
    ["$\\displaystyle\\lim_{n\\to+\\infty} \\sqrt{n} = \\;?$", "$+\\infty$", ["$0$", "$1$", "n'existe pas"], "La racine tend vers $+\\infty$."],
    ["$\\displaystyle\\lim_{n\\to+\\infty} \\dfrac{(-1)^n}{n} = \\;?$", "$0$", ["n'existe pas", "$1$", "$-1$"], "Encadrement par $-\\frac1n$ et $\\frac1n$ (gendarmes)."],
    ["$\\displaystyle\\lim_{n\\to+\\infty} (-1)^n = \\;?$", "n'existe pas", ["$0$", "$1$", "$-1$"], "La suite oscille entre $-1$ et $1$."],
  ]),
  (r) => {
    const u0 = int(r, -3, 5), k = int(r, 1, 3);
    let u = u0;
    const terms = [u0];
    for (let n = 0; n < 3; n++) {
      u = u + k * (2 * n + 1);
      terms.push(u);
    }
    return numeric(`$u_0 = ${u0}$ et $u_{n+1} = u_n + ${k === 1 ? "" : k}(2n + 1)$. $u_3 = \\;?$`, terms[3], `$u_1 = ${terms[1]}$, $u_2 = ${terms[2]}$, $u_3 = ${terms[3]}$.`);
  },
  claims([
    ["Une suite croissante et majorée converge.", true, "Théorème de convergence monotone."],
    ["Une suite bornée converge toujours.", false, "Contre-exemple : $(-1)^n$."],
    ["Une récurrence se compose d'une initialisation et d'une hérédité.", true, "Les deux étapes sont indispensables."],
    ["Si $u_n \\leq v_n$ et $u_n \\to +\\infty$, alors $v_n \\to +\\infty$.", true, "Théorème de comparaison."],
    ["Une suite croissante tend forcément vers $+\\infty$.", false, "Elle peut converger, par exemple $1 - \\frac1n$."],
  ]),
];

// ───────────── Limites de fonctions ─────────────

const limites: Generator[] = [
  (r) => {
    const a = nonZero(r, 9), d = nonZero(r, 9), b = int(r, -9, 9), e = int(r, -9, 9);
    return mcq(r, `$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{${poly([a, b, 1])}}{${poly([d, e, 3])}} = \\;?$`, frac(a, d), [frac(d, a), frac(1, 3), "$+\\infty$", "$0$"], `Rapport des termes de plus haut degré : $\\dfrac{${a}x^2}{${d}x^2}$.`);
  },
  (r) => {
    const a = nonZero(r, 6), d = nonZero(r, 6), up = r() < 0.5;
    const num = up ? poly([a, 0, 0, 1]) : poly([a, 1]);
    const den = up ? poly([d, 0, 2]) : poly([d, 0, 0, 1]);
    const ans = up ? (a / d > 0 ? "$+\\infty$" : "$-\\infty$") : "$0$";
    return mcq(r, `$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{${num}}{${den}} = \\;?$`, ans, [...LIMITS, frac(a, d)], up ? `Degré du numérateur plus grand : $\\dfrac{${a}}{${d}}x \\to ${ans.replace(/\$/g, "")}$.` : `Degré du dénominateur plus grand : limite nulle.`);
  },
  (r) => {
    const a = nonZero(r, 6), b = int(r, -9, 9), c = nonZero(r, 7);
    return oneOf(r, [
      () => mcq(r, `Asymptote verticale de $f(x) = \\dfrac{${poly([a, b])}}{x ${c < 0 ? "+" : "-"} ${Math.abs(c)}}$ ?`, `$x = ${c}$`, [`$x = ${-c}$`, `$y = ${a}$`, `$x = ${a}$`], `Le dénominateur s'annule en $${c}$.`),
      () => mcq(r, `Asymptote horizontale en $+\\infty$ de $f(x) = \\dfrac{${poly([a, b])}}{x ${c < 0 ? "+" : "-"} ${Math.abs(c)}}$ ?`, `$y = ${a}$`, [`$y = ${c}$`, `$x = ${c}$`, `$y = 0$`, `$y = ${b || 1}$`], `$f(x) \\to \\dfrac{${a}x}{x} = ${a}$.`),
    ]);
  },
  cards([
    ["$\\displaystyle\\lim_{x\\to+\\infty} \\dfrac{e^x}{x^3} = \\;?$", "$+\\infty$", ["$0$", "$1$", "$3$"], "Croissances comparées : l'exponentielle l'emporte."],
    ["$\\displaystyle\\lim_{x\\to+\\infty} x e^{-x} = \\;?$", "$0$", ["$+\\infty$", "$1$", "$-\\infty$"], "Croissances comparées."],
    ["$\\displaystyle\\lim_{x\\to+\\infty} \\dfrac{\\ln x}{x} = \\;?$", "$0$", ["$+\\infty$", "$1$", "$e$"], "Croissances comparées : $x$ l'emporte sur $\\ln x$."],
    ["$\\displaystyle\\lim_{x\\to0^+} x\\ln x = \\;?$", "$0$", ["$-\\infty$", "$+\\infty$", "$1$"], "Croissances comparées en 0."],
    ["$\\displaystyle\\lim_{x\\to0^+} \\dfrac{1}{x} = \\;?$", "$+\\infty$", ["$-\\infty$", "$0$", "$1$"], "Inverse d'un nombre positif proche de 0."],
    ["$\\displaystyle\\lim_{x\\to0^-} \\dfrac{1}{x} = \\;?$", "$-\\infty$", ["$+\\infty$", "$0$", "$-1$"], "Inverse d'un nombre négatif proche de 0."],
    ["$\\displaystyle\\lim_{x\\to-\\infty} e^{x} = \\;?$", "$0$", ["$-\\infty$", "$+\\infty$", "$1$"], "L'exponentielle tend vers 0 en $-\\infty$."],
  ]),
  (r) => {
    const k = nonZero(r, 9, true);
    return mcq(r, `$\\displaystyle\\lim_{x \\to +\\infty} e^{${k}x} = \\;?$`, k > 0 ? "$+\\infty$" : "$0$", LIMITS, k > 0 ? `$${k}x \\to +\\infty$.` : `$${k}x \\to -\\infty$ et $e^X \\to 0$.`);
  },
];

// ───────────── Continuité et TVI ─────────────

const continuite: Generator[] = [
  (r) => {
    const a = int(r, -5, 2), b = a + int(r, 1, 5), fa = int(r, -20, 10), fb = fa + int(r, 1, 30), k = int(r, -25, 40);
    const inside = k > fa && k < fb;
    return tf(`$f$ est continue et strictement croissante sur $[${a}\\,;\\,${b}]$, $f(${a}) = ${fa}$, $f(${b}) = ${fb}$. L'équation $f(x) = ${k}$ a une unique solution dans $[${a}\\,;\\,${b}]$.`, inside,
      inside ? `$${k}$ est entre $${fa}$ et $${fb}$ : TVI + stricte monotonie.` : `$${k}$ n'est pas entre $${fa}$ et $${fb}$.`);
  },
  (r) => {
    const a = int(r, 0, 4), b = a + 2 * int(r, 1, 3), m = (a + b) / 2;
    const left = r() < 0.5;
    return mcq(r, `Dichotomie sur $[${a}\\,;\\,${b}]$ avec $f(${a}) < 0 < f(${b})$. On trouve $f(${m}) ${left ? ">" : "<"} 0$. Nouvel intervalle ?`, left ? `$[${a}\\,;\\,${m}]$` : `$[${m}\\,;\\,${b}]$`, [left ? `$[${m}\\,;\\,${b}]$` : `$[${a}\\,;\\,${m}]$`, `$[${a}\\,;\\,${b}]$`, `$[${m - 1}\\,;\\,${m + 1}]$`],
      `On garde la moitié où $f$ change de signe.`);
  },
  (r) => {
    const a = int(r, 0, 3), b = a + int(r, 1, 4), c = int(r, -9, 9);
    return mcq(r, `Image de $[${a}\\,;\\,${b}]$ par $f(x) = ${poly([1, 0, c])}$ (croissante sur $[0\\,;\\,+\\infty[$) ?`, `$[${a * a + c}\\,;\\,${b * b + c}]$`, [`$[${a + c}\\,;\\,${b + c}]$`, `$[${b * b + c}\\,;\\,${a * a + c}]$`, `$[${a * a}\\,;\\,${b * b}]$`], `Continue et croissante : $f([a\\,;\\,b]) = [f(a)\\,;\\,f(b)]$.`);
  },
  (r) => {
    const a = int(r, -3, 0), b = a + int(r, 1, 3), c = int(r, -6, 6);
    const f = (x: number) => x ** 3 + x + c;
    const change = f(a) * f(b) < 0;
    return tf(`$f(x) = ${poly([1, 0, 1, c])}$. $f(${a}) = ${f(a)}$ et $f(${b}) = ${f(b)}$ : l'équation $f(x) = 0$ a une solution dans $]${a}\\,;\\,${b}[$.`, change,
      change ? `$f$ est continue et change de signe (TVI).` : `Pas de changement de signe : $f$ est strictement croissante, donc pas de solution sur cet intervalle.`);
  },
  claims([
    ["Une fonction dérivable sur un intervalle y est continue.", true, "Dérivable ⇒ continue."],
    ["Une fonction continue est toujours dérivable.", false, "Contre-exemple : $|x|$ en 0."],
    ["Les fonctions polynômes sont continues sur $\\mathbb{R}$.", true, "Comme exp, sin, cos."],
    ["Le TVI donne l'unicité de la solution sans autre hypothèse.", false, "L'unicité demande la stricte monotonie."],
  ]),
];

// ───────────── Convexité ─────────────

const convexite: Generator[] = [
  (r) => {
    const a = nonZero(r, 4), b = int(r, -6, 6), c = int(r, -9, 9), d = int(r, -9, 9);
    return mcq(r, `$f(x) = ${poly([a, b, c, d])}$. $f''(x) = \\;?$`, `$${poly([6 * a, 2 * b])}$`, [`$${poly([3 * a, 2 * b, c])}$`, `$${poly([6 * a, b])}$`, `$${poly([3 * a, 2 * b])}$`], `$f'(x) = ${poly([3 * a, 2 * b, c])}$ puis on dérive encore.`);
  },
  (r) => {
    const a = nonZero(r, 5), b = int(r, -9, 9), c = int(r, -9, 9);
    return tf(`$f(x) = ${poly([a, b, c])}$ est convexe sur $\\mathbb{R}$.`, a > 0, `$f''(x) = ${2 * a}$, ${a > 0 ? "positive : convexe" : "négative : concave"}.`);
  },
  (r) => {
    const b = 3 * nonZero(r, 3), c = int(r, -9, 9);
    return numeric(`Abscisse du point d'inflexion de $f(x) = ${poly([1, b, c, 1])}$ ?`, -b / 3, `$f''(x) = 6x + ${par(2 * b)}$ s'annule en changeant de signe en $x = ${-b / 3}$.`);
  },
  (r) => {
    const a = nonZero(r, 5, true), b = nonZero(r, 7), n = int(r, 2, 6);
    return oneOf(r, [
      () => mcq(r, `Dérivée de $(${poly([a, b])})^{${n}}$ ?`, `$${n * a}(${poly([a, b])})^{${n - 1}}$`, [`$${n}(${poly([a, b])})^{${n - 1}}$`, `$${a}(${poly([a, b])})^{${n}}$`, `$${n * a}(${poly([a, b])})^{${n}}$`], `$(u^n)' = n\\,u'\\,u^{n-1}$ avec $u' = ${a}$.`),
      () => mcq(r, `Dérivée seconde de $e^{${a}x}$ ?`, `$${a * a}e^{${a}x}$`, [`$${a}e^{${a}x}$`, `$${2 * a}e^{${a}x}$`, `$e^{${a}x}$`], `On dérive deux fois : $${a} \\times ${par(a)}$.`),
      () => mcq(r, `Dérivée de $\\sqrt{${poly([a, b])}}$ ?`, `$\\dfrac{${a}}{2\\sqrt{${poly([a, b])}}}$`, [`$\\dfrac{1}{2\\sqrt{${poly([a, b])}}}$`, `$${a}\\sqrt{${poly([a, b])}}$`, `$\\dfrac{${2 * a}}{\\sqrt{${poly([a, b])}}}$`], `$(\\sqrt{u})' = \\dfrac{u'}{2\\sqrt{u}}$.`),
    ]);
  },
  claims([
    ["$f$ est convexe sur $I$ si et seulement si $f'$ est croissante sur $I$.", true, "Caractérisation par la dérivée."],
    ["Une fonction convexe a sa courbe au-dessus de ses tangentes.", true, "Et en dessous de ses cordes."],
    ["La fonction exponentielle est concave.", false, "$(e^x)'' = e^x > 0$ : elle est convexe."],
    ["La fonction $\\ln$ est concave sur $]0\\,;\\,+\\infty[$.", true, "$(\\ln x)'' = -\\frac{1}{x^2} < 0$."],
    ["En un point d'inflexion, la courbe traverse sa tangente.", true, "C'est la définition géométrique."],
  ]),
];

// ───────────── Logarithme ─────────────

const ln: Generator[] = [
  (r) => {
    const a = int(r, 2, 9), b = int(r, 2, 9), n = int(r, 2, 6);
    return oneOf(r, [
      () => mcq(r, `$\\ln ${a} + \\ln ${b} = \\;?$`, `$\\ln ${a * b}$`, [`$\\ln ${a + b}$`, `$\\ln ${a} \\times \\ln ${b}$`, `$${a * b}$`], `$\\ln a + \\ln b = \\ln(ab)$.`),
      () => mcq(r, `$\\ln\\left(${a}^{${n}}\\right) = \\;?$`, `$${n}\\ln ${a}$`, [`$(\\ln ${a})^{${n}}$`, `$\\ln ${a * n}$`, `$${a}\\ln ${n}$`], `$\\ln(a^n) = n\\ln a$.`),
      () => mcq(r, `$\\ln ${a * b} - \\ln ${b} = \\;?$`, `$\\ln ${a}$`, [`$\\ln ${a * b - b}$`, `$\\dfrac{\\ln ${a * b}}{\\ln ${b}}$`, `$${a}$`], `$\\ln a - \\ln b = \\ln\\dfrac{a}{b}$.`),
    ]);
  },
  (r) => {
    const k = nonZero(r, 6), a = nonZero(r, 6, true), b = int(r, -9, 9);
    return oneOf(r, [
      () => mcq(r, `Solution de $\\ln x = ${k}$ ?`, `$e^{${k}}$`, [`$${k}e$`, `$\\ln ${Math.abs(k)}$`, `$e^{${-k}}$`], `$\\ln x = k \\iff x = e^k$.`),
      () => mcq(r, `Solution de $\\ln(${poly([a, b])}) = 0$ ?`, `$x = ${fracTex(1 - b, a)}$`, [`$x = ${fracTex(-b, a)}$`, `$x = ${fracTex(b - 1, a)}$`, `$x = ${fracTex(1 + b, a)}$`], `$\\ln u = 0 \\iff u = 1$ : $${a}x + ${par(b)} = 1$.`),
    ]);
  },
  (r) => {
    const k = int(r, 2, 15);
    return oneOf(r, [
      () => numeric(`$\\ln(e^{${k}}) = \\;?$`, k, `$\\ln$ et $\\exp$ sont réciproques.`),
      () => numeric(`$e^{\\ln ${k}} = \\;?$`, k, `$e^{\\ln a} = a$ pour $a > 0$.`),
      () => numeric(`$\\ln\\left(\\dfrac{1}{e^{${k}}}\\right) = \\;?$`, -k, `$\\ln(e^{-${k}}) = -${k}$.`),
    ]);
  },
  (r) => {
    const a = nonZero(r, 6, true), b = int(r, -9, 9);
    return oneOf(r, [
      () => mcq(r, `Dérivée de $\\ln(${poly([a, b])})$ ?`, `$\\dfrac{${a}}{${poly([a, b])}}$`, [`$\\dfrac{1}{${poly([a, b])}}$`, `$${a}\\ln(${poly([a, b])})$`, `$\\dfrac{${a}x}{${poly([a, b])}}$`], `$(\\ln u)' = \\dfrac{u'}{u}$.`),
      () => mcq(r, `Dérivée de $x\\ln x$ ?`, `$\\ln x + 1$`, [`$\\ln x$`, `$\\dfrac{1}{x}$`, `$x + \\ln x$`], `$(uv)' = 1 \\times \\ln x + x \\times \\dfrac1x$.`),
    ]);
  },
  (r) => {
    const n = int(r, 2, 10);
    return r() < 0.5
      ? mcq(r, `$\\ln ${2 ** n}$ s'écrit…`, `$${n}\\ln 2$`, [`$${2 ** (n - 1)}\\ln 2$`, `$2\\ln ${n}$`, `$${n + 1}\\ln 2$`], `$${2 ** n} = 2^{${n}}$.`)
      : mcq(r, `$\\ln\\left(\\dfrac{1}{${3 ** Math.min(n, 6)}}\\right)$ s'écrit…`, `$-${Math.min(n, 6)}\\ln 3$`, [`$${Math.min(n, 6)}\\ln 3$`, `$-\\ln ${3 * Math.min(n, 6)}$`, `$\\dfrac{1}{${Math.min(n, 6)}\\ln 3}$`], `$\\ln\\frac1a = -\\ln a$ et $${3 ** Math.min(n, 6)} = 3^{${Math.min(n, 6)}}$.`);
  },
  (r) => {
    const base = pick(r, [2, 3, 1.5, 1.1]), target = pick(r, [100, 1000, 500, 2000, 10000]);
    const n = Math.ceil(Math.log(target) / Math.log(base));
    return numeric(`Plus petit entier $n$ tel que $${tex(base)}^n > ${target}$ ?`, n, `$n > \\dfrac{\\ln ${target}}{\\ln ${tex(base)}} \\approx ${tex(Math.log(target) / Math.log(base), 2)}$, donc $n = ${n}$.`);
  },
  claims([
    ["$\\ln$ est définie sur $]0\\,;\\,+\\infty[$.", true, "Le logarithme n'est défini que pour $x > 0$."],
    ["$\\ln 1 = 0$", true, "Car $e^0 = 1$."],
    ["$\\ln(a + b) = \\ln a + \\ln b$", false, "C'est $\\ln(ab) = \\ln a + \\ln b$."],
    ["$\\ln x < 0$ pour $0 < x < 1$.", true, "$\\ln$ est croissante et $\\ln 1 = 0$."],
    ["$\\displaystyle\\lim_{x\\to+\\infty}\\ln x = +\\infty$", true, "Mais très lentement."],
  ]),
];

// ───────────── Primitives et équations différentielles ─────────────

const primitives: Generator[] = [
  (r) => {
    const a = 3 * nonZero(r, 3), b = 2 * int(r, -4, 4), c = int(r, -9, 9);
    return mcq(r, `Une primitive de $f(x) = ${poly([a, b, c])}$ ?`, `$${poly([a / 3, b / 2, c, 0])}$`, [`$${poly([2 * a, b])}$`, `$${poly([a, b, c, 0])}$`, `$${poly([a / 3, b, c, 0])}$`], `$x^n$ a pour primitive $\\dfrac{x^{n+1}}{n+1}$.`);
  },
  (r) => {
    const k = nonZero(r, 6, true);
    return oneOf(r, [
      () => mcq(r, `Une primitive de $e^{${k}x}$ ?`, `$${fracTex(1, k)}e^{${k}x}$`, [`$${k}e^{${k}x}$`, `$e^{${k}x}$`, `$\\dfrac{e^{${k + 1}x}}{${k + 1}}$`], `On divise par $${k}$ : dériver $\\frac{1}{k}e^{kx}$ redonne $e^{kx}$.`),
      () => mcq(r, `Une primitive de $\\dfrac{${k}}{x}$ sur $]0\\,;\\,+\\infty[$ ?`, `$${k}\\ln x$`, [`$\\dfrac{${-k}}{x^2}$`, `$${k}e^{x}$`, `$\\dfrac{${k}}{\\ln x}$`], `$\\dfrac1x$ a pour primitive $\\ln x$.`),
    ]);
  },
  (r) => {
    const a = nonZero(r, 5, true), y0 = nonZero(r, 9), b = nonZero(r, 9);
    return oneOf(r, [
      () => mcq(r, `Solutions de $y' = ${a}y$ ?`, `$y = Ce^{${a}x},\\ C \\in \\mathbb{R}$`, [`$y = e^{${a}x} + C$`, `$y = Cx^{${a}}$`, `$y = ${a}e^{Cx}$`], `$y' = ay$ a pour solutions $Ce^{ax}$.`),
      () => mcq(r, `Solution de $y' = ${a}y$ avec $y(0) = ${y0}$ ?`, `$y = ${y0}e^{${a}x}$`, [`$y = e^{${a}x}${term(y0)}$`, `$y = ${a}e^{${y0}x}$`, `$y = ${y0}e^{${-a}x}$`], `$y = Ce^{${a}x}$ et $y(0) = C = ${y0}$.`),
      () => mcq(r, `Solution constante de $y' = ${a}y ${b < 0 ? "-" : "+"} ${Math.abs(b)}$ ?`, `$y = ${fracTex(-b, a)}$`, [`$y = ${fracTex(b, a)}$`, `$y = ${b}$`, `$y = ${fracTex(a, b)}$`], `On résout $0 = ${a}y + ${par(b)}$.`),
    ]);
  },
  (r) => {
    const k = int(r, -9, 9), c = int(r, -9, 9);
    return mcq(r, `Primitive $F$ de $f(x) = ${poly([2, k])}$ telle que $F(0) = ${c}$ ?`, `$${poly([1, k, c])}$`, [`$${poly([1, k, 0])}$`, `$${poly([2, k, c])}$`, `$${poly([1, c, k])}$`], `$F(x) = x^2 + ${par(k)}x + C$ et $F(0) = C = ${c}$.`);
  },
  claims([
    ["Deux primitives d'une même fonction diffèrent d'une constante.", true, "Sur un intervalle."],
    ["Toute fonction continue sur un intervalle admet des primitives.", true, "Théorème fondamental."],
    ["$\\ln x$ est une primitive de $\\dfrac1x$ sur $]0\\,;\\,+\\infty[$.", true, "$(\\ln x)' = \\frac1x$."],
    ["Une primitive de $\\cos x$ est $-\\sin x$.", false, "C'est $\\sin x$ (car $(\\sin x)' = \\cos x$)."],
  ]),
];

// ───────────── Calcul intégral ─────────────

const integrale: Generator[] = [
  (r) => {
    const k = nonZero(r, 9), a = int(r, -4, 3), b = a + int(r, 1, 6);
    return numeric(`$\\displaystyle\\int_{${a}}^{${b}} ${k}\\,dx = \\;?$`, k * (b - a), `Aire d'un rectangle (signée) : $${k} \\times (${b} - ${par(a)})$.`);
  },
  (r) => {
    const a = int(r, 0, 3), b = a + int(r, 1, 4);
    return oneOf(r, [
      () => numeric(`$\\displaystyle\\int_{${a}}^{${b}} x\\,dx = \\;?$`, (b * b - a * a) / 2, `$\\left[\\dfrac{x^2}{2}\\right]_{${a}}^{${b}} = \\dfrac{${b * b} - ${a * a}}{2}$.`, undefined, 0.01),
      () => numeric(`$\\displaystyle\\int_{${a}}^{${b}} 3x^2\\,dx = \\;?$`, b ** 3 - a ** 3, `$\\left[x^3\\right]_{${a}}^{${b}} = ${b ** 3} - ${a ** 3}$.`),
    ]);
  },
  (r) => {
    const m = nonZero(r, 4), p = int(r, -5, 5), a = int(r, 0, 2), b = a + int(r, 1, 4);
    const F = (x: number) => (m * x * x) / 2 + p * x;
    return numeric(`$\\displaystyle\\int_{${a}}^{${b}} (${poly([m, p])})\\,dx = \\;?$`, F(b) - F(a), `Primitive $F(x) = ${fracTex(m, 2)}x^2 + ${par(p)}x$ : $F(${b}) - F(${a}) = ${tex(F(b) - F(a))}$.`, undefined, 0.01);
  },
  (r) => {
    const a = 0, b = int(r, 1, 6), m = nonZero(r, 4), p = int(r, -5, 5);
    const I = (m * b * b) / 2 + p * b;
    return numeric(`Valeur moyenne de $f(x) = ${poly([m, p])}$ sur $[${a}\\,;\\,${b}]$ ?`, I / b, `$\\dfrac{1}{${b}}\\displaystyle\\int_0^{${b}} f = \\dfrac{${tex(I)}}{${b}} = ${tex(I / b)}$.`, undefined, 0.01);
  },
  (r) => {
    const A = int(r, -9, 9), B = int(r, -9, 9), al = nonZero(r, 4), be = nonZero(r, 4);
    return oneOf(r, [
      () => numeric(`$\\int_0^1 f = ${A}$ et $\\int_0^1 g = ${B}$. $\\int_0^1 (${al === 1 ? "" : al === -1 ? "-" : al}f${term(be, "g")}) = \\;?$`, al * A + be * B, `Linéarité : $${al} \\times ${par(A)} + ${par(be)} \\times ${par(B)}$.`),
      () => numeric(`$\\int_0^2 f = ${A}$ et $\\int_2^5 f = ${B}$. $\\int_0^5 f = \\;?$`, A + B, `Relation de Chasles.`),
    ]);
  },
  cards([
    ["$\\displaystyle\\int_0^1 e^x\\,dx = \\;?$", "$e - 1$", ["$e$", "$1$", "$e + 1$"], "$[e^x]_0^1 = e - 1$."],
    ["$\\displaystyle\\int_1^e \\dfrac{1}{x}\\,dx = \\;?$", "$1$", ["$e$", "$0$", "$e - 1$"], "$[\\ln x]_1^e = 1 - 0$."],
    ["Si $f \\geq 0$ sur $[a\\,;\\,b]$, $\\int_a^b f$ représente…", "l'aire sous la courbe, en unités d'aire", ["la longueur de la courbe", "la valeur maximale de $f$", "la pente moyenne"], "Interprétation géométrique."],
    ["$\\displaystyle\\int_a^a f(x)\\,dx = \\;?$", "$0$", ["$f(a)$", "$1$", "$a$"], "Intervalle réduit à un point."],
  ]),
];

// ───────────── Loi binomiale ─────────────

const binomiale: Generator[] = [
  (r) => {
    const n = int(r, 4, 10), k = int(r, 1, n - 1);
    return numeric(`$\\dbinom{${n}}{${k}} = \\;?$`, binom(n, k), `$\\dbinom{${n}}{${k}} = \\dfrac{${n}!}{${k}!\\,${n - k}!} = ${binom(n, k)}$.`);
  },
  (r) => {
    const n = pick(r, [10, 20, 25, 40, 50, 100, 200]), p = pick(r, [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8]);
    return oneOf(r, [
      () => numeric(`$X \\sim \\mathcal{B}(${n}\\,;\\,${tex(p)})$. $E(X) = \\;?$`, n * p, `$E(X) = np = ${n} \\times ${tex(p)}$.`, undefined, 0.01),
      () => numeric(`$X \\sim \\mathcal{B}(${n}\\,;\\,${tex(p)})$. $V(X) = \\;?$`, n * p * (1 - p), `$V(X) = np(1-p) = ${n} \\times ${tex(p)} \\times ${tex(1 - p)}$.`, undefined, 0.01),
    ]);
  },
  (r) => {
    const n = int(r, 2, 8);
    return oneOf(r, [
      () => mcq(r, `$X \\sim \\mathcal{B}(${n}\\,;\\,0{,}5)$. $P(X = 0) = \\;?$`, frac(1, 2 ** n), [frac(1, 2 * n), frac(n, 2 ** n), frac(1, 2)], `$(1 - p)^n = \\left(\\frac12\\right)^{${n}}$.`),
      () => mcq(r, `$X \\sim \\mathcal{B}(${n}\\,;\\,0{,}5)$. $P(X \\geq 1) = \\;?$`, frac(2 ** n - 1, 2 ** n), [frac(1, 2 ** n), frac(n, 2 ** n), frac(1, 2)], `$1 - P(X = 0) = 1 - \\frac{1}{${2 ** n}}$.`),
      () => {
        const k = int(r, 1, n - 1);
        return mcq(r, `$X \\sim \\mathcal{B}(${n}\\,;\\,0{,}5)$. $P(X = ${k}) = \\;?$`, frac(binom(n, k), 2 ** n), [frac(k, n), frac(1, 2 ** n), frac(binom(n, k), 2 ** k)], `$\\dbinom{${n}}{${k}}\\left(\\frac12\\right)^{${n}} = \\dfrac{${binom(n, k)}}{${2 ** n}}$.`);
      },
    ]);
  },
  (r) => {
    const n = int(r, 2, 5), p = pick(r, [0.1, 0.2, 0.3, 0.9]);
    const show = (v: number) => `$${tex(v, 6)}$`;
    return mcq(r, `$X \\sim \\mathcal{B}(${n}\\,;\\,${tex(p)})$. $P(X = ${n}) = \\;?$`, show(p ** n), [show(p * n), show(p ** (n - 1)), show((1 - p) ** n), show(p ** (n + 1))], `$p^n = ${tex(p)}^{${n}} = ${tex(p ** n, 6)}$.`);
  },
  claims([
    ["Un schéma de Bernoulli répète des épreuves identiques et indépendantes.", true, "Deux issues, mêmes probabilités, indépendance."],
    ["Si $X \\sim \\mathcal{B}(n\\,;\\,p)$, $X$ peut prendre la valeur $n + 1$.", false, "$X$ prend les valeurs de $0$ à $n$."],
    ["$\\dbinom{n}{k} = \\dbinom{n}{n-k}$", true, "Symétrie des coefficients binomiaux."],
    ["$\\dbinom{n}{1} = 1$", false, "$\\dbinom{n}{1} = n$."],
  ]),
];

// ───────────── Dénombrement ─────────────

const WORDS = ["BAC", "MATH", "JOUR", "LIVRE", "TABLE", "PLUME", "GLOBE", "CRAYON", "COMPTE", "PRISME"];

const denombrement: Generator[] = [
  (r) => {
    const n = int(r, 3, 8);
    return numeric(`$${n}! = \\;?$`, fact(n), `$${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(" \\times ")}$.`);
  },
  (r) => {
    const n = int(r, 5, 15), k = pick(r, [2, 3]);
    const v = fact(n) / fact(n - k);
    return numeric(`$${n}$ coureurs : combien de podiums ${k === 3 ? "(or, argent, bronze)" : "(1er et 2e)"} possibles ?`, v, `Arrangements : $${Array.from({ length: k }, (_, i) => n - i).join(" \\times ")} = ${v}$.`);
  },
  (r) => {
    const n = int(r, 5, 12), k = int(r, 2, 3);
    return numeric(`Combien de façons de choisir $${k}$ délégués parmi $${n}$ élèves ?`, binom(n, k), `Ordre sans importance : $\\dbinom{${n}}{${k}} = ${binom(n, k)}$.`);
  },
  (r) => {
    const k = int(r, 2, 5), base = pick(r, [2, 10, 26]);
    const what = base === 2 ? "bits (0 ou 1)" : base === 10 ? "chiffres" : "lettres";
    return numeric(`Combien de codes de $${k}$ ${what}, répétitions autorisées ?`, base ** k, `$${base}^{${k}} = ${base ** k}$ ($k$-uplets).`);
  },
  (r) => {
    const n = int(r, 2, 10);
    return numeric(`Combien de parties (sous-ensembles) a un ensemble à $${n}$ éléments ?`, 2 ** n, `Chaque élément est pris ou non : $2^{${n}}$.`);
  },
  (r) => {
    const w = pick(r, WORDS);
    return numeric(`Combien d'anagrammes (mots possibles, même sans sens) du mot ${w} ?`, fact(w.length), `${w.length} lettres distinctes : $${w.length}! = ${fact(w.length)}$.`);
  },
  (r) => {
    const a = int(r, 2, 5), b = int(r, 2, 6), c = int(r, 2, 4);
    return numeric(`Un menu : $${a}$ entrées, $${b}$ plats, $${c}$ desserts. Combien de menus complets ?`, a * b * c, `Principe multiplicatif : $${a} \\times ${b} \\times ${c}$.`);
  },
];

// ───────────── Géométrie dans l'espace ─────────────

const NORMS = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [2, 10, 11, 15]] as const;

const espace: Generator[] = [
  (r) => {
    const A = [int(r, -5, 5), int(r, -5, 5), int(r, -5, 5)], B = [int(r, -5, 5), int(r, -5, 5), int(r, -5, 5)];
    return mcq(r, `$A${pt(...A)}$, $B${pt(...B)}$. Coordonnées de $\\overrightarrow{AB}$ ?`, `$${pt(B[0] - A[0], B[1] - A[1], B[2] - A[2])}$`, [`$${pt(A[0] - B[0], A[1] - B[1], A[2] - B[2])}$`, `$${pt(A[0] + B[0], A[1] + B[1], A[2] + B[2])}$`], `$\\overrightarrow{AB} = B - A$ coordonnée par coordonnée.`);
  },
  (r) => {
    const u = [int(r, -4, 4), int(r, -4, 4), int(r, -4, 4)], v = [int(r, -4, 4), int(r, -4, 4), int(r, -4, 4)];
    const dot = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    return r() < 0.6
      ? numeric(`$\\vec{u}\\,${pt(...u)}$ et $\\vec{v}\\,${pt(...v)}$. $\\vec{u}\\cdot\\vec{v} = \\;?$`, dot, `$xx' + yy' + zz' = ${dot}$.`)
      : tf(`$\\vec{u}\\,${pt(...u)}$ et $\\vec{v}\\,${pt(...v)}$ sont orthogonaux.`, dot === 0, `$\\vec{u}\\cdot\\vec{v} = ${dot}$.`);
  },
  (r) => {
    const [a, b, c, n] = pick(r, NORMS);
    const s = () => (r() < 0.5 ? -1 : 1);
    const v = [a * s(), b * s(), c * s()].sort(() => r() - 0.5);
    return numeric(`Norme de $\\vec{u}\\,${pt(...v)}$ ?`, n, `$\\sqrt{${a * a} + ${b * b} + ${c * c}} = \\sqrt{${n * n}} = ${n}$.`);
  },
  (r) => {
    const A = [int(r, -4, 4), int(r, -4, 4), int(r, -4, 4)], u = [nonZero(r, 3), int(r, -3, 3), int(r, -3, 3)], t = nonZero(r, 3);
    const P = A.map((x, i) => x + t * u[i]);
    const eq = (i: number, v: string) => `${v} = ${A[i] === 0 && u[i] !== 0 ? `${u[i] === -1 ? "-" : u[i] === 1 ? "" : u[i]}t` : `${A[i]}${term(u[i], "t")}`}`;
    return mcq(r, `Droite $\\begin{cases} ${eq(0, "x")} \\\\ ${eq(1, "y")} \\\\ ${eq(2, "z")} \\end{cases}$ : point de paramètre $t = ${t}$ ?`, `$${pt(...P)}$`, [`$${pt(...A)}$`, `$${pt(...u)}$`, `$${pt(...A.map((x, i) => x - t * u[i]))}$`], `On remplace $t$ par $${t}$.`);
  },
  (r) => {
    const a = nonZero(r, 5), b = int(r, -5, 5), c = nonZero(r, 5), d = int(r, -9, 9);
    const plane = `${poly([a, 0])}${term(b, "y")}${term(c, "z")}${term(d)} = 0`;
    return oneOf(r, [
      () => mcq(r, `Un vecteur normal au plan $${plane}$ ?`, `$${pt(a, b, c)}$`, [`$${pt(a, b, d)}$`, `$${pt(b, c, d)}$`, `$${pt(-b, a, 0)}$`], `Pour $ax + by + cz + d = 0$, $\\vec{n}\\,(a\\,;\\,b\\,;\\,c)$.`),
      () => {
        const x = int(r, -3, 3), y = int(r, -3, 3);
        const on = r() < 0.5 && (-(a * x + b * y + d)) % c === 0;
        const z = on ? -(a * x + b * y + d) / c : int(r, -3, 3);
        const really = a * x + b * y + c * z + d === 0;
        return tf(`Le point $${pt(x, y, z)}$ appartient au plan $${plane}$.`, really, `$${a}\\times${par(x)} + ${par(b)}\\times${par(y)} + ${par(c)}\\times${par(z)} + ${par(d)} = ${a * x + b * y + c * z + d}$.`);
      },
    ]);
  },
  (r) => {
    const A = [int(r, -5, 5), int(r, -5, 5), int(r, -5, 5)], B = A.map((x) => x + 2 * int(r, -3, 3));
    return mcq(r, `Milieu de $[AB]$ avec $A${pt(...A)}$ et $B${pt(...B)}$ ?`, `$${pt(...A.map((x, i) => (x + B[i]) / 2))}$`, [`$${pt(...A.map((x, i) => B[i] - x))}$`, `$${pt(...A.map((x, i) => x + B[i]))}$`], `Moyenne des coordonnées.`);
  },
  claims([
    ["Deux droites de l'espace non parallèles sont forcément sécantes.", false, "Elles peuvent être non coplanaires."],
    ["Une droite orthogonale à deux droites sécantes d'un plan est orthogonale au plan.", true, "Théorème du cours."],
    ["Trois points distincts non alignés définissent un plan.", true, "Un unique plan."],
    ["Deux plans parallèles ont des vecteurs normaux colinéaires.", true, "Même orientation."],
  ]),
];

export const MATHS_TERMINALE: Record<string, Generator[]> = {
  "maths-t-recurrence": recurrence,
  "maths-t-limites": limites,
  "maths-t-continuite": continuite,
  "maths-t-convexite": convexite,
  "maths-t-ln": ln,
  "maths-t-primitives": primitives,
  "maths-t-integrale": integrale,
  "maths-t-binomiale": binomiale,
  "maths-t-denombrement": denombrement,
  "maths-t-espace": espace,
};
