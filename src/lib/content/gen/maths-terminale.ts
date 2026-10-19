/** Générateurs de questions — Mathématiques, Terminale. */
import { type Generator, cards, claims, frac, fracTex, gcd, int, mcq, nonZero, numeric, oneOf, par, pick, poly, tex, term, tf } from "./kit";

const pt = (...n: number[]) => `(${n.map((v) => tex(v)).join("\\,;\\,")})`;
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const binom = (n: number, k: number) => fact(n) / (fact(k) * fact(n - k));
const LIMITS = ["$+\\infty$", "$-\\infty$", "$0$", "$1$"];

// ───────────── Suites et récurrence ─────────────

const recurrence: Generator[] = [
  (r) => {
    // u_n = a·qⁿ + b : limite b si |q| < 1, ±∞ selon le signe de a si q > 1, pas de limite si q ≤ -1.
    const q = pick(r, [0.2, 0.5, 0.9, -0.5, 1.5, 2, 3, -0.3, 0.99, 1.01, -2, -1.5]), a = nonZero(r, 5), b = int(r, -6, 6);
    const ans = Math.abs(q) < 1 ? `$${b}$` : q > 1 ? (a > 0 ? "$+\\infty$" : "$-\\infty$") : "n'existe pas";
    const expr = `${a === 1 ? "" : a === -1 ? "-" : a}${a === 1 || a === -1 ? "" : " \\times "}${par(q)}^{n}${b === 0 ? "" : ` ${b < 0 ? "-" : "+"} ${Math.abs(b)}`}`;
    return mcq(r, `$\\displaystyle\\lim_{n \\to +\\infty} \\left(${expr}\\right) = \\;?$`, ans, ["$+\\infty$", "$-\\infty$", "n'existe pas", `$${b}$`, `$${a + b}$`, "$0$"],
      Math.abs(q) < 1 ? `$-1 < q < 1$ donc $${par(q)}^n \\to 0$ : la limite est $${b}$.`
        : q > 1 ? `$q > 1$ donc $${par(q)}^n \\to +\\infty$, multiplié par $${a}$ ${a > 0 ? "(positif)" : "(négatif)"}.`
        : `$q \\leq -1$ : $${par(q)}^n$ change de signe à chaque rang sans se stabiliser, la suite n'a pas de limite.`);
  },
  (r) => {
    const a = nonZero(r, 9), b = int(r, -9, 9), c = nonZero(r, 9), d = int(r, -9, 9);
    return mcq(r, `$\\displaystyle\\lim_{n \\to +\\infty} \\dfrac{${poly([a, b], "n")}}{${poly([c, d], "n")}} = \\;?$`, frac(a, c), [frac(b || 1, d || 1), frac(c, a), "$+\\infty$", "$0$"], `On factorise par $n$ au numérateur et au dénominateur : la limite est le quotient des coefficients de $n$, $${fracTex(a, c)}$.`);
  },
  (r) => {
    // Forme indéterminée « ∞ - ∞ » : le terme de plus haut degré impose la limite.
    const a = nonZero(r, 5), b = nonZero(r, 20), c = int(r, -20, 20), k = int(r, 2, 9);
    return oneOf(r, [
      () => mcq(r, `$\\displaystyle\\lim_{n \\to +\\infty} \\left(${poly([b > 0 ? -Math.abs(a) : Math.abs(a), b, c], "n")}\\right) = \\;?$`, b > 0 ? "$-\\infty$" : "$+\\infty$", [...LIMITS, `$${b}$`],
        `Forme indéterminée : on factorise par $n^2$, $n^2\\left(${b > 0 ? -Math.abs(a) : Math.abs(a)} + \\frac{${b}}{n} + \\frac{${c}}{n^2}\\right)$ ; la parenthèse tend vers $${b > 0 ? -Math.abs(a) : Math.abs(a)}$.`),
      () => mcq(r, `$\\displaystyle\\lim_{n \\to +\\infty} \\left(n - ${k}\\sqrt{n}\\right) = \\;?$`, "$+\\infty$", [...LIMITS, `$-${k}$`],
        `Forme indéterminée : $n - ${k}\\sqrt{n} = \\sqrt{n}\\left(\\sqrt{n} - ${k}\\right)$, produit de deux facteurs qui tendent vers $+\\infty$.`),
      () => mcq(r, `$\\displaystyle\\lim_{n \\to +\\infty} \\left(${k}^n - ${k + 1}^n\\right) = \\;?$`, "$-\\infty$", [...LIMITS, "$+\\infty$"],
        `$${k}^n - ${k + 1}^n = ${k + 1}^n\\left(\\left(\\frac{${k}}{${k + 1}}\\right)^n - 1\\right)$ : la parenthèse tend vers $-1$ et $${k + 1}^n \\to +\\infty$.`),
    ]);
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
    const rec = `$u_0 = ${u0}$ et $u_{n+1} = u_n + ${k === 1 ? "" : k}(2n + 1)$`;
    return oneOf(r, [
      () => numeric(`${rec}. $u_3 = \\;?$`, terms[3], `$u_1 = ${terms[1]}$, $u_2 = ${terms[2]}$, $u_3 = ${terms[3]}$.`),
      () => mcq(r, `${rec}. Quelle expression de $u_n$ se démontre par récurrence ?`, `$u_n = ${poly([k, 0, u0], "n")}$`,
        [`$u_n = ${poly([k, u0], "n")}$`, `$u_n = ${poly([2 * k, u0], "n")}$`, `$u_n = ${poly([k, k, u0], "n")}$`, `$u_n = ${poly([k, 0, u0 + k], "n")}$`],
        `Les premiers termes $${terms.join("\\,;\\,")}$ suggèrent $u_n = ${poly([k, 0, u0], "n")}$. Hérédité : $${poly([k, 0, u0], "n")} + ${k === 1 ? "" : k}(2n + 1) = ${k === 1 ? "" : k}(n + 1)^2${term(u0)}$.`),
    ]);
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
    return mcq(r, `$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{${poly([a, b, 1])}}{${poly([d, e, 3])}} = \\;?$`, frac(a, d), [frac(d, a), frac(1, 3), "$+\\infty$", "$0$"], `Rapport des termes de plus haut degré : $\\dfrac{${poly([a, 0, 0])}}{${poly([d, 0, 0])}} = ${fracTex(a, d)}$.`);
  },
  (r) => {
    const a = nonZero(r, 6), d = nonZero(r, 6), up = r() < 0.5;
    const num = up ? poly([a, 0, 0, 1]) : poly([a, 1]);
    const den = up ? poly([d, 0, 2]) : poly([d, 0, 0, 1]);
    const ans = up ? (a / d > 0 ? "$+\\infty$" : "$-\\infty$") : "$0$";
    return mcq(r, `$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{${num}}{${den}} = \\;?$`, ans, [...LIMITS, frac(a, d)], up ? `Degré du numérateur plus grand : le quotient se comporte comme $${a === d ? "" : a === -d ? "-" : fracTex(a, d)}x \\to ${ans.replace(/\$/g, "")}$.` : `Degré du dénominateur plus grand : limite nulle.`);
  },
  (r) => {
    const a = nonZero(r, 6), b = int(r, -9, 9), c = nonZero(r, 7);
    return oneOf(r, [
      () => mcq(r, `Asymptote verticale de $f(x) = \\dfrac{${poly([a, b])}}{x ${c < 0 ? "+" : "-"} ${Math.abs(c)}}$ ?`, `$x = ${c}$`, [`$x = ${-c}$`, `$y = ${a}$`, `$x = ${a}$`], `Le dénominateur s'annule en $${c}$.`),
      () => mcq(r, `Asymptote horizontale en $+\\infty$ de $f(x) = \\dfrac{${poly([a, b])}}{x ${c < 0 ? "+" : "-"} ${Math.abs(c)}}$ ?`, `$y = ${a}$`, [`$y = ${c}$`, `$x = ${c}$`, `$y = 0$`, `$y = ${b || 1}$`], `Les termes de plus haut degré donnent $\\dfrac{${a === 1 ? "" : a === -1 ? "-" : a}x}{x} = ${a}$ : $f(x) \\to ${a}$.`),
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
    // Composée e^{kx + b} en +∞ ou en -∞, et somme « affine + exponentielle ».
    const k = nonZero(r, 9, true), b = int(r, -5, 5), plus = r() < 0.5, m = nonZero(r, 5);
    const toPlus = (k > 0) === plus;
    return oneOf(r, [
      () => mcq(r, `$\\displaystyle\\lim_{x \\to ${plus ? "+" : "-"}\\infty} e^{${poly([k, b])}} = \\;?$`, toPlus ? "$+\\infty$" : "$0$", LIMITS,
        `$${poly([k, b])} \\to ${toPlus ? "+" : "-"}\\infty$ et $\\displaystyle\\lim_{X \\to ${toPlus ? "+\\infty} e^X = +\\infty" : "-\\infty} e^X = 0"}$.`),
      () => mcq(r, `$\\displaystyle\\lim_{x \\to -\\infty} \\left(${poly([m, b])} + e^{x}\\right) = \\;?$`, m > 0 ? "$-\\infty$" : "$+\\infty$", [...LIMITS, `$${b}$`],
        `$e^x \\to 0$ en $-\\infty$ et $${poly([m, b])} \\to ${m > 0 ? "-" : "+"}\\infty$.`),
    ]);
  },
];

// ───────────── Continuité et TVI ─────────────

const continuite: Generator[] = [
  (r) => {
    const a = int(r, -5, 2), b = a + int(r, 1, 5), fa = int(r, -20, 10), fb = fa + int(r, 2, 30);
    const k = r() < 0.5 ? int(r, fa, fb) : r() < 0.5 ? fa - int(r, 1, 15) : fb + int(r, 1, 15);
    // Intervalle fermé : k = f(a) ou k = f(b) donne aussi une (unique) solution, en a ou en b.
    const inside = k >= fa && k <= fb;
    return tf(`$f$ est continue et strictement croissante sur $[${a}\\,;\\,${b}]$, $f(${a}) = ${fa}$, $f(${b}) = ${fb}$. L'équation $f(x) = ${k}$ a une unique solution dans $[${a}\\,;\\,${b}]$.`, inside,
      inside ? `$${k}$ est compris entre $${fa}$ et $${fb}$ : TVI (existence) et stricte monotonie (unicité)${k === fa ? `, la solution est $${a}$` : k === fb ? `, la solution est $${b}$` : ""}.` : `$${k}$ n'est pas compris entre $${fa}$ et $${fb}$ : $f$ prend ses valeurs dans $[${fa}\\,;\\,${fb}]$.`);
  },
  (r) => {
    // Deux étapes de dichotomie : on garde à chaque fois la moitié où f change de signe (intervalle final de largeur 1).
    const a = int(r, -3, 4), b = a + 4, m1 = a + 2;
    const s1 = r() < 0.5, [lo1, hi1] = s1 ? [a, m1] : [m1, b];
    const m2 = (lo1 + hi1) / 2, s2 = r() < 0.5, [lo, hi] = s2 ? [lo1, m2] : [m2, hi1];
    const iv = (u: number, v: number) => `$[${u}\\,;\\,${v}]$`;
    const quarters = [0, 1, 2, 3].map((i) => iv(a + i, a + i + 1));
    return mcq(r, `Dichotomie sur $[${a}\\,;\\,${b}]$ avec $f(${a}) < 0 < f(${b})$. On trouve $f(${m1}) ${s1 ? ">" : "<"} 0$, puis $f(${m2}) ${s2 ? ">" : "<"} 0$. Intervalle obtenu ?`, iv(lo, hi), [...quarters, iv(lo1, hi1)],
      `$f(${m1}) ${s1 ? "> 0" : "< 0"}$ : le changement de signe a lieu dans $[${lo1}\\,;\\,${hi1}]$ ; puis $f(${m2}) ${s2 ? "> 0" : "< 0"}$ : il a lieu dans $[${lo}\\,;\\,${hi}]$.`);
  },
  (r) => {
    // Image d'un intervalle par une fonction continue : il faut tenir compte des variations (minimum en 0 si 0 ∈ [a ; b]).
    const a = int(r, -4, 3), b = a + int(r, 1, 5), c = int(r, -9, 9);
    const f = (x: number) => x * x + c;
    const lo = a <= 0 && b >= 0 ? c : Math.min(f(a), f(b)), hi = Math.max(f(a), f(b));
    const iv = (u: number, v: number) => `$[${u}\\,;\\,${v}]$`;
    return mcq(r, `Image de l'intervalle $[${a}\\,;\\,${b}]$ par la fonction continue $f(x) = ${poly([1, 0, c])}$ ?`, iv(lo, hi),
      // Leurres : de vrais intervalles (borne gauche < borne droite), erreurs typiques sur f(a), f(b) ou le minimum.
      ([[Math.min(f(a), f(b)), hi], [a + c, b + c], [Math.min(a * a, b * b), Math.max(a * a, b * b)], [c, b * b + c]] as const).filter(([u, v]) => u < v).map(([u, v]) => iv(u, v)),
      `$f$ est décroissante sur $]-\\infty\\,;\\,0]$ et croissante sur $[0\\,;\\,+\\infty[$. ${a <= 0 && b >= 0 ? `Comme $0 \\in [${a}\\,;\\,${b}]$, le minimum est $f(0) = ${c}$` : `$f$ est monotone sur $[${a}\\,;\\,${b}]$ : le minimum est $${lo}$`} et le maximum est $\\max(f(${a})\\,;\\,f(${b})) = ${hi}$.`,
      () => (r() < 0.5 ? iv(lo - int(r, 1, 4), hi) : iv(lo, hi + int(r, 1, 4))));
  },
  (r) => {
    const a = int(r, -3, 1), b = a + int(r, 1, 2);
    const f0 = (x: number) => x ** 3 + x;
    // c strictement entre -f0(b) et -f0(a) : f(a) < 0 < f(b) ; sinon pas de changement de signe.
    const c = r() < 0.5 ? int(r, -f0(b) + 1, -f0(a) - 1) : r() < 0.5 ? -f0(a) + int(r, 1, 6) : -f0(b) - int(r, 1, 6);
    const f = (x: number) => f0(x) + c;
    const change = f(a) * f(b) < 0;
    return tf(`$f(x) = ${poly([1, 0, 1, c])}$. $f(${a}) = ${f(a)}$ et $f(${b}) = ${f(b)}$ : l'équation $f(x) = 0$ a une solution dans $]${a}\\,;\\,${b}[$.`, change,
      change ? `$f$ est continue et change de signe sur $[${a}\\,;\\,${b}]$ : le TVI donne une solution (unique car $f' = 3x^2 + 1 > 0$).`
        : `$f$ est strictement croissante ($f'(x) = 3x^2 + 1 > 0$) et $f(${a})$, $f(${b})$ ${f(a) > 0 ? "sont positifs" : "sont négatifs"} : $f$ ne s'annule pas sur $]${a}\\,;\\,${b}[$.`);
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
    const a = nonZero(r, 5), b = int(r, -9, 9), c = int(r, -9, 9), k = int(r, -4, 4);
    return oneOf(r, [
      () => tf(`$f(x) = ${poly([a, b, c])}$ est convexe sur $\\mathbb{R}$.`, a > 0, `$f''(x) = ${2 * a}$, ${a > 0 ? "positive : convexe" : "négative : concave"}.`),
      () => {
        // f(x) = (x + k)e^x : f''(x) = (x + k + 2)e^x, du signe de x + k + 2.
        const x0 = -k - 2, right = r() < 0.5, convex = r() < 0.5;
        const iv = right ? `[${x0}\\,;\\,+\\infty[` : `]-\\infty\\,;\\,${x0}]`;
        return tf(`$f(x) = ${k === 0 ? "x" : `(${poly([1, k])})`}e^{x}$ est ${convex ? "convexe" : "concave"} sur $${iv}$.`, convex === right,
          `$f'(x) = ${k === -1 ? "x" : `(${poly([1, k + 1])})`}e^x$ et $f''(x) = ${k === -2 ? "x" : `(${poly([1, k + 2])})`}e^x$, du signe de $${poly([1, k + 2])}$ : ${right ? "positive" : "négative"} sur $${iv}$, donc $f$ y est ${right ? "convexe" : "concave"}.`);
      },
    ]);
  },
  (r) => {
    const b = 3 * nonZero(r, 3), c = int(r, -9, 9);
    return numeric(`Abscisse du point d'inflexion de $f(x) = ${poly([1, b, c, 1])}$ ?`, -b / 3, `$f''(x) = ${poly([6, 2 * b])}$ s'annule en changeant de signe en $x = ${-b / 3}$.`);
  },
  (r) => {
    const a = nonZero(r, 5, true), b = nonZero(r, 7), n = int(r, 3, 6);
    return oneOf(r, [
      () => mcq(r, `Dérivée de $(${poly([a, b])})^{${n}}$ ?`, `$${n * a}(${poly([a, b])})^{${n - 1}}$`, [`$${n}(${poly([a, b])})^{${n - 1}}$`, `$${a}(${poly([a, b])})^{${n}}$`, `$${n * a}(${poly([a, b])})^{${n}}$`, `$${n * a}x^{${n - 1}}$`], `$(u^n)' = n\\,u'\\,u^{n-1}$ avec $u' = ${a}$.`),
      () => mcq(r, `Dérivée seconde de $e^{${a}x}$ ?`, `$${a * a}e^{${a}x}$`, [`$${a}e^{${a}x}$`, `$${2 * a}e^{${a}x}$`, `$e^{${a}x}$`, `$${-a * a}e^{${a}x}$`, `$${a * a}e^{${2 * a}x}$`], `On dérive deux fois : $${a} \\times ${par(a)} = ${a * a}$.`),
      () => {
        // n / (d√u) simplifiée : 2/(2√u) s'écrit 1/√u, 4/(2√u) s'écrit 2/√u.
        const u = poly([a, b]);
        const sq = (n: number, d: number) => {
          const g = gcd(n, d), [p, q] = [Math.abs(n / g), d / g];
          return `$${n < 0 ? "-" : ""}\\dfrac{${p}}{${q === 1 ? "" : q}\\sqrt{${u}}}$`;
        };
        return mcq(r, `Dérivée de $\\sqrt{${u}}$ ?`, sq(a, 2), [sq(1, 2), sq(a, 1), `$${a}\\sqrt{${u}}$`, sq(2 * a, 1)],
          `$(\\sqrt{u})' = \\dfrac{u'}{2\\sqrt{u}}$ avec $u' = ${a}$ : $\\dfrac{${a}}{2\\sqrt{${u}}}${a % 2 === 0 ? ` = ${sq(a, 2).replace(/\$/g, "")}` : ""}$.`);
      },
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
    // b ≠ a : sinon ln(ab − b) = ln a (a = b = 2). n ≠ a et (a ; n) ≠ (2 ; 4), (4 ; 2) : sinon « a ln n » ou « ln a + ln n »
    // vaudrait n ln a (2 ln 4 = 4 ln 2, ln 2 + ln 2 = 2 ln 2) et serait une deuxième bonne réponse.
    const a = int(r, 2, 9), b = pick(r, [2, 3, 4, 5, 6, 7, 8, 9].filter((v) => v !== a));
    const n = pick(r, [2, 3, 4, 5, 6].filter((v) => v !== a && !(a * v === 8 && a + v === 6)));
    return oneOf(r, [
      () => mcq(r, `$\\ln ${a} + \\ln ${b} = \\;?$`, `$\\ln ${a * b}$`, [`$\\ln ${a + b}$`, `$\\ln ${a} \\times \\ln ${b}$`, `$${a * b}$`], `$\\ln a + \\ln b = \\ln(ab)$.`),
      () => mcq(r, `$\\ln\\left(${a}^{${n}}\\right) = \\;?$`, `$${n}\\ln ${a}$`, [`$(\\ln ${a})^{${n}}$`, `$\\ln ${a * n}$`, `$${a}\\ln ${n}$`, `$\\ln ${a} + \\ln ${n}$`], `$\\ln(a^n) = n\\ln a$.`),
      () => mcq(r, `$\\ln ${a * b} - \\ln ${b} = \\;?$`, `$\\ln ${a}$`, [`$\\ln ${a * b - b}$`, `$\\dfrac{\\ln ${a * b}}{\\ln ${b}}$`, `$${a}$`], `$\\ln a - \\ln b = \\ln\\dfrac{a}{b}$.`),
    ]);
  },
  (r) => {
    const k = nonZero(r, 6), a = nonZero(r, 6, true), b = int(r, -9, 9);
    return oneOf(r, [
      () => mcq(r, `Solution de $\\ln x = ${k}$ ?`, k === 1 ? "$e$" : `$e^{${k}}$`, [k === 1 ? "$1$" : k === -1 ? "$-e$" : `$${k}e$`, `$\\ln ${Math.abs(k)}$`, k === -1 ? "$e$" : `$e^{${-k}}$`, `$${k}$`], `$\\ln x = k \\iff x = e^k$.`),
      () => mcq(r, `Solution de $\\ln(${poly([a, b])}) = 0$ ?`, `$x = ${fracTex(1 - b, a)}$`, [`$x = ${fracTex(-b, a)}$`, `$x = ${fracTex(b - 1, a)}$`, `$x = ${fracTex(1 + b, a)}$`,
        // Confusion ln u = 0 ⟺ u = e : x = (e − b)/a.
        `$x = \\dfrac{${a > 0 ? (b === 0 ? "e" : `e ${b > 0 ? "-" : "+"} ${Math.abs(b)}`) : b === 0 ? "-e" : `${b} - e`}}{${Math.abs(a)}}$`], `$\\ln u = 0 \\iff u = 1$ : $${poly([a, b])} = 1$, donc $x = ${fracTex(1 - b, a)}$.`),
    ]);
  },
  (r) => {
    const k = int(r, 2, 9), m = int(r, 2, 6);
    return oneOf(r, [
      () => numeric(`$\\ln\\left(e^{${k}}\\sqrt{e}\\right) = \\;?$`, k + 0.5, `$\\ln(e^{${k}}) + \\ln(e^{1/2}) = ${k} + 0{,}5$.`),
      () => numeric(`$e^{${m}\\ln ${k}} = \\;?$`, k ** m, `$e^{${m}\\ln ${k}} = e^{\\ln(${k}^{${m}})} = ${k}^{${m}} = ${k ** m}$.`),
      () => numeric(`$e^{-\\ln ${k}} = \\;?$`, 1 / k, `$e^{-\\ln ${k}} = \\dfrac{1}{e^{\\ln ${k}}} = \\dfrac{1}{${k}}$.`, undefined, 0.001),
      () => numeric(`$\\ln\\left(\\dfrac{e^{${k + m}}}{e^{${m}}}\\right) - \\ln\\left(e^{-${m}}\\right) = \\;?$`, k + m, `$\\ln(e^{${k}}) - (-${m}) = ${k} + ${m} = ${k + m}$.`),
      () => numeric(`$\\dfrac{\\ln(${k}^{${m}})}{\\ln ${k}} = \\;?$`, m, `$\\ln(${k}^{${m}}) = ${m}\\ln ${k}$.`),
    ]);
  },
  (r) => {
    // b non nul : la dérivée de ln(ax) se simplifie en 1/x, ce qui rendrait « a/(ax) » maladroit.
    const a = nonZero(r, 6, true), b = nonZero(r, 9);
    return oneOf(r, [
      () => mcq(r, `Dérivée de $\\ln(${poly([a, b])})$ ?`, `$\\dfrac{${a}}{${poly([a, b])}}$`, [`$\\dfrac{1}{${poly([a, b])}}$`, `$${a}\\ln(${poly([a, b])})$`, `$\\dfrac{${a}x}{${poly([a, b])}}$`], `$(\\ln u)' = \\dfrac{u'}{u}$.`),
      () => mcq(r, `Dérivée de $x\\ln x$ ?`, `$\\ln x + 1$`, [`$\\ln x$`, `$\\dfrac{1}{x}$`, `$x + \\ln x$`], `$(uv)' = 1 \\times \\ln x + x \\times \\dfrac1x$.`),
    ]);
  },
  (r) => {
    // n ≥ 3 : pour n = 2, « 2^{n-1} ln 2 » et « 2 ln n » valent 2 ln 2 ; « 2 ln n » écarté pour n = 4 (2 ln 4 = 4 ln 2).
    const n = int(r, 3, 10);
    return r() < 0.5
      ? mcq(r, `$\\ln ${2 ** n}$ s'écrit…`, `$${n}\\ln 2$`, [`$${2 ** (n - 1)}\\ln 2$`, ...(n === 4 ? [] : [`$2\\ln ${n}$`]), `$${n + 1}\\ln 2$`, `$${n - 1}\\ln 2$`], `$${2 ** n} = 2^{${n}}$.`)
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
    return mcq(r, `Une primitive de $f(x) = ${poly([a, b, c])}$ ?`, `$${poly([a / 3, b / 2, c, 0])}$`, [`$${poly([2 * a, b])}$`, `$${poly([a, b, c, 0])}$`, `$${poly([a / 3, b, c, 0])}$`, `$${poly([a / 2, b / 2, c, 0])}$`, `$${poly([a / 3, b / 2, 0, c])}$`], `$x^n$ a pour primitive $\\dfrac{x^{n+1}}{n+1}$ : on vérifie en dérivant.`);
  },
  (r) => {
    const k = nonZero(r, 6, true);
    return oneOf(r, [
      () => mcq(r, `Une primitive de $e^{${k}x}$ ?`, `$${fracTex(1, k)}e^{${k}x}$`, [`$${k}e^{${k}x}$`, `$e^{${k}x}$`, k + 1 === 1 ? "$e^{x}$" : k + 1 === -1 ? "$-e^{-x}$" : `$\\dfrac{e^{${k + 1}x}}{${k + 1}}$`], `On divise par $${k}$ : dériver $\\frac{1}{k}e^{kx}$ redonne $e^{kx}$.`),
      () => mcq(r, `Une primitive de $\\dfrac{${k}}{x}$ sur $]0\\,;\\,+\\infty[$ ?`, `$${k}\\ln x$`, [`$\\dfrac{${-k}}{x^2}$`, `$${k}e^{x}$`, `$\\dfrac{${k}}{\\ln x}$`], `$\\dfrac1x$ a pour primitive $\\ln x$.`),
    ]);
  },
  (r) => {
    const a = nonZero(r, 5, true), y0 = nonZero(r, 9), b = nonZero(r, 9);
    return oneOf(r, [
      () => mcq(r, `Solutions de $y' = ${a}y$ ?`, `$y = Ce^{${a}x},\\ C \\in \\mathbb{R}$`, [`$y = e^{${a}x} + C$`, `$y = Cx^{${a}}$`, `$y = ${a}e^{Cx}$`], `$y' = ay$ a pour solutions $Ce^{ax}$.`),
      () => {
        const c0 = y0 === 1 ? "" : y0 === -1 ? "-" : `${y0}`;
        return mcq(r, `Solution de $y' = ${a}y$ avec $y(0) = ${y0}$ ?`, `$y = ${c0}e^{${a}x}$`, [`$y = e^{${a}x}${term(y0)}$`, `$y = ${a}e^{${c0}x}$`, `$y = ${c0}e^{${-a}x}$`, `$y = ${c0}xe^{${a}x}$`], `$y = Ce^{${a}x}$ et $y(0) = C = ${y0}$.`);
      },
      () => mcq(r, `Solution constante de $y' = ${a}y ${b < 0 ? "-" : "+"} ${Math.abs(b)}$ ?`, `$y = ${fracTex(-b, a)}$`, [`$y = ${fracTex(b, a)}$`, `$y = ${b}$`, `$y = ${fracTex(a, b)}$`, `$y = ${-b}$`], `Une solution constante a une dérivée nulle : $0 = ${a}y ${b < 0 ? "-" : "+"} ${Math.abs(b)}$, donc $y = ${fracTex(-b, a)}$.`),
    ]);
  },
  (r) => {
    const k = int(r, -9, 9), c = int(r, -9, 9);
    return mcq(r, `Primitive $F$ de $f(x) = ${poly([2, k])}$ telle que $F(0) = ${c}$ ?`, `$${poly([1, k, c])}$`, [`$${poly([1, k, 0])}$`, `$${poly([2, k, c])}$`, `$${poly([1, c, k])}$`, `$${poly([1, k, -c])}$`, `$${poly([2, c])}$`, `$${poly([1, k + 1, c])}$`, `$${poly([2, 0, c])}$`], `$F(x) = ${poly([1, k, 0])} + C$ et $F(0) = C = ${c}$.`);
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
    const k = pick(r, [2, 3, 4]), n = int(r, 2, 5), a = int(r, 2, 9);
    return oneOf(r, [
      () => mcq(r, `$\\displaystyle\\int_0^1 e^{${k}x}\\,dx = \\;?$`, `$\\dfrac{e^{${k}} - 1}{${k}}$`, [`$e^{${k}} - 1$`, `$${k}(e^{${k}} - 1)$`, `$\\dfrac{e^{${k}}}{${k}}$`, `$\\dfrac{e^{${k + 1}} - 1}{${k + 1}}$`],
        `Une primitive de $e^{${k}x}$ est $\\dfrac{1}{${k}}e^{${k}x}$ : $\\dfrac{e^{${k}} - e^{0}}{${k}}$.`),
      () => numeric(`$\\displaystyle\\int_1^{e^{${n}}} \\dfrac{1}{x}\\,dx = \\;?$`, n, `$\\left[\\ln x\\right]_1^{e^{${n}}} = ${n} - 0 = ${n}$.`),
      () => numeric(`$\\displaystyle\\int_0^{\\ln ${a}} e^{x}\\,dx = \\;?$`, a - 1, `$\\left[e^x\\right]_0^{\\ln ${a}} = e^{\\ln ${a}} - e^0 = ${a} - 1 = ${a - 1}$.`),
      () => numeric(`$\\displaystyle\\int_1^{${a}} \\dfrac{${k}}{x^2}\\,dx = \\;?$`, k * (1 - 1 / a), `Primitive $-\\dfrac{${k}}{x}$ : $-\\dfrac{${k}}{${a}} + ${k} = ${fracTex(k * (a - 1), a)}$.`, undefined, 0.01),
    ]);
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
    return numeric(`$\\displaystyle\\int_{${a}}^{${b}} (${poly([m, p])})\\,dx = \\;?$`, F(b) - F(a), `Primitive $F(x) = ${fracTex(m, 2) === "1" ? "" : fracTex(m, 2) === "-1" ? "-" : fracTex(m, 2)}x^2${term(p, "x")}$ : $F(${b}) - F(${a}) = ${tex(F(b) - F(a))}$.`, undefined, 0.01);
  },
  (r) => {
    const a = 0, b = int(r, 2, 6), m = nonZero(r, 4), p = int(r, -5, 5);
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
    const n = int(r, 5, 10), k = int(r, 2, n - 2);
    return numeric(`$\\dbinom{${n}}{${k}} = \\;?$`, binom(n, k), `$\\dbinom{${n}}{${k}} = \\dfrac{${n}!}{${k}!\\,${n - k}!} = ${binom(n, k)}$.`);
  },
  (r) => {
    const n = pick(r, [10, 20, 25, 40, 50, 100, 200]), p = pick(r, [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8]);
    return oneOf(r, [
      () => numeric(`$X \\sim \\mathcal{B}(${n}\\,;\\,${tex(p)})$. $E(X) = \\;?$`, n * p, `$E(X) = np = ${n} \\times ${tex(p)}$.`, undefined, 0.01),
      () => numeric(`$X \\sim \\mathcal{B}(${n}\\,;\\,${tex(p)})$. $V(X) = \\;?$`, n * p * (1 - p), `$V(X) = np(1-p) = ${n} \\times ${tex(p)} \\times ${tex(1 - p)}$.`, undefined, 0.01),
      () => numeric(`$X$ suit une loi binomiale de paramètre $p = ${tex(p)}$ et d'espérance $E(X) = ${tex(n * p)}$. Que vaut $n$ ?`, n, `$E(X) = np$, donc $n = \\dfrac{${tex(n * p)}}{${tex(p)}} = ${n}$.`),
    ]);
  },
  (r) => {
    // n ≥ 3 : pour n = 2, les leurres se confondent avec la bonne réponse (2/4 = 1/2).
    const n = int(r, 3, 8);
    return oneOf(r, [
      () => mcq(r, `$X \\sim \\mathcal{B}(${n}\\,;\\,0{,}5)$. $P(X = 0) = \\;?$`, frac(1, 2 ** n), [frac(1, 2 * n), frac(n, 2 ** n), frac(1, 2)], `$(1 - p)^n = \\left(\\frac12\\right)^{${n}}$.`),
      () => mcq(r, `$X \\sim \\mathcal{B}(${n}\\,;\\,0{,}5)$. $P(X \\geq 1) = \\;?$`, frac(2 ** n - 1, 2 ** n), [frac(1, 2 ** n), frac(n, 2 ** n), frac(1, 2)], `$1 - P(X = 0) = 1 - \\frac{1}{${2 ** n}}$.`),
      () => {
        const k = int(r, 1, n - 1);
        // Leurres : des probabilités (quotients inférieurs à 1), comme l'oubli du coefficient binomial.
        const wrongs = [[k, n], [1, 2 ** n], [binom(n, k), 2 ** k], [k, 2 ** n], [binom(n, k), 2 ** (n + 1)]].filter(([u, v]) => u < v).map(([u, v]) => frac(u, v));
        return mcq(r, `$X \\sim \\mathcal{B}(${n}\\,;\\,0{,}5)$. $P(X = ${k}) = \\;?$`, frac(binom(n, k), 2 ** n), wrongs, `$\\dbinom{${n}}{${k}}\\left(\\frac12\\right)^{${n}} = \\dfrac{${binom(n, k)}}{${2 ** n}}$.`,
          () => frac(int(r, 1, 2 ** n - 1), 2 ** n));
      },
    ]);
  },
  (r) => {
    // P(X = n), P(X = 0) ou P(X = 1) : formule P(X = k) = C(n, k) p^k (1 - p)^(n - k), leurres compris entre 0 et 1.
    const n = int(r, 2, 5), p = pick(r, [0.1, 0.2, 0.3, 0.4, 0.9]), q = 1 - p;
    const show = (v: number) => `$${tex(v, 6)}$`;
    const ok = (vs: number[]) => vs.filter((v) => v > 0 && v < 1).map(show);
    return oneOf(r, [
      () => mcq(r, `$X \\sim \\mathcal{B}(${n}\\,;\\,${tex(p)})$. $P(X = ${n}) = \\;?$`, show(p ** n), ok([p * n, p ** (n - 1), q ** n, p ** (n + 1)]), `$P(X = ${n}) = p^{${n}} = ${tex(p)}^{${n}} = ${tex(p ** n, 6)}$.`),
      () => mcq(r, `$X \\sim \\mathcal{B}(${n}\\,;\\,${tex(p)})$. $P(X = 0) = \\;?$`, show(q ** n), ok([p ** n, 1 - p ** n, q * n, q ** (n - 1)]), `Aucun succès : $P(X = 0) = (1 - p)^{${n}} = ${tex(q)}^{${n}} = ${tex(q ** n, 6)}$.`),
      () => mcq(r, `$X \\sim \\mathcal{B}(${n}\\,;\\,${tex(p)})$. $P(X = 1) = \\;?$ (valeur exacte)`, show(n * p * q ** (n - 1)), ok([p * q ** (n - 1), n * p, p ** n, 1 - q ** n]),
        `$P(X = 1) = \\dbinom{${n}}{1} \\times ${tex(p)} \\times ${tex(q)}${n - 1 === 1 ? "" : `^{${n - 1}}`} = ${n} \\times ${tex(p)} \\times ${tex(q ** (n - 1), 6)} = ${tex(n * p * q ** (n - 1), 6)}$ : on n'oublie pas le coefficient binomial (position du succès).`, undefined, 2),
    ]);
  },
  claims([
    ["Un schéma de Bernoulli répète des épreuves identiques et indépendantes.", true, "Deux issues, mêmes probabilités, indépendance."],
    ["Si $X \\sim \\mathcal{B}(n\\,;\\,p)$, $X$ peut prendre la valeur $n + 1$.", false, "$X$ prend les valeurs de $0$ à $n$."],
    ["$\\dbinom{n}{k} = \\dbinom{n}{n-k}$", true, "Symétrie des coefficients binomiaux."],
    ["$\\dbinom{n}{1} = 1$", false, "$\\dbinom{n}{1} = n$."],
  ]),
];

// ───────────── Dénombrement ─────────────

const WORDS = ["MATH", "JOUR", "LIVRE", "TABLE", "PLUME", "GLOBE", "CRAYON", "COMPTE", "PRISME"];
/** Mots avec lettres répétées : [mot, nombre d'anagrammes, explication]. */
const REPEATED: Array<[string, number, string]> = [
  ["ANANAS", 60, "On place les 3 A ($\\binom{6}{3} = 20$ choix), puis les 2 N parmi les 3 places restantes ($\\binom{3}{2} = 3$) : $20 \\times 3 = 60$."],
  ["BALLE", 60, "On place les 2 L ($\\binom{5}{2} = 10$ choix), puis B, A, E dans les 3 places restantes ($3! = 6$) : $60$."],
  ["ELLE", 6, "On choisit les 2 places des L parmi 4 : $\\binom{4}{2} = 6$."],
  ["RADAR", 30, "On place les 2 R ($\\binom{5}{2} = 10$), puis les 2 A ($\\binom{3}{2} = 3$), le D va dans la dernière place : $30$."],
  ["COCO", 6, "On choisit les 2 places des C parmi 4 : $\\binom{4}{2} = 6$."],
  ["NAVIRE", 720, "6 lettres toutes distinctes : $6! = 720$."],
];

const denombrement: Generator[] = [
  (r) => {
    const n = int(r, 6, 20), k = pick(r, [2, 3]);
    return oneOf(r, [
      () => numeric(`$\\dfrac{${n}!}{${n - k}!} = \\;?$`, fact(n) / fact(n - k), `On simplifie sans tout calculer : $\\dfrac{${n}!}{${n - k}!} = ${Array.from({ length: k }, (_, i) => n - i).join(" \\times ")} = ${fact(n) / fact(n - k)}$.`),
      () => numeric(`$\\dfrac{(n + 1)!}{n!}$ pour $n = ${n}$ ?`, n + 1, `$(n + 1)! = (n + 1) \\times n!$, donc le quotient vaut $n + 1 = ${n + 1}$.`),
    ]);
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
    const base = pick(r, [2, 10, 26]), k = base === 2 ? int(r, 4, 10) : base === 10 ? int(r, 3, 6) : int(r, 2, 3);
    const what = base === 2 ? "bits (0 ou 1)" : base === 10 ? "chiffres" : "lettres";
    const l = int(r, 1, 3), c = int(r, 2, 4);
    return oneOf(r, [
      () => numeric(`Combien de codes de $${k}$ ${what}, répétitions autorisées ?`, base ** k, `$${base}^{${k}} = ${base ** k}$ ($k$-uplets).`),
      () => numeric(`Une plaque est formée de $${l}$ lettre${l > 1 ? "s" : ""} (parmi 26) suivie${l > 1 ? "s" : ""} de $${c}$ chiffres. Combien de plaques possibles ?`, 26 ** l * 10 ** c, `Principe multiplicatif : $${l === 1 ? "26" : `26^{${l}}`} \\times 10^{${c}} = ${tex(26 ** l * 10 ** c)}$.`),
      () => numeric(`Combien de codes de $${Math.min(k, 4)}$ chiffres ont tous leurs chiffres différents ?`, fact(10) / fact(10 - Math.min(k, 4)), `Arrangements de $${Math.min(k, 4)}$ chiffres parmi 10 : $${Array.from({ length: Math.min(k, 4) }, (_, i) => 10 - i).join(" \\times ")}$.`),
    ]);
  },
  (r) => {
    const n = int(r, 3, 10);
    return oneOf(r, [
      () => numeric(`Combien de parties (sous-ensembles) a un ensemble à $${n}$ éléments ?`, 2 ** n, `Chaque élément est pris ou non : $2^{${n}}$.`),
      () => numeric(`Combien de parties non vides a un ensemble à $${n}$ éléments ?`, 2 ** n - 1, `$2^{${n}}$ parties en tout, moins la partie vide : $${2 ** n - 1}$.`),
      () => numeric(`Combien de parties d'un ensemble à $${n}$ éléments contiennent un élément donné $a$ ?`, 2 ** (n - 1), `$a$ est pris ; chacun des $${n - 1}$ autres éléments est pris ou non : $2^{${n - 1}}$.`),
    ]);
  },
  (r) => {
    if (r() < 0.5) {
      const w = pick(r, WORDS);
      return numeric(`Combien d'anagrammes (mots possibles, même sans sens) du mot ${w} ?`, fact(w.length), `${w.length} lettres distinctes : $${w.length}! = ${fact(w.length)}$.`);
    }
    const [w, n, e] = pick(r, REPEATED);
    return numeric(`Combien d'anagrammes (mots possibles, même sans sens) du mot ${w} ?`, n, e);
  },
  (r) => {
    const a = int(r, 2, 5), b = int(r, 2, 6), c = int(r, 2, 4);
    // Principe multiplicatif seul, ou combiné au principe additif (« ou » exclusif).
    if (r() < 0.5) return numeric(`Un menu : $${a}$ entrées, $${b}$ plats, $${c}$ desserts. Combien de menus complets (entrée, plat et dessert) ?`, a * b * c, `Principe multiplicatif : $${a} \\times ${b} \\times ${c} = ${a * b * c}$.`);
    return numeric(`Une carte propose $${a}$ entrées, $${b}$ plats et $${c}$ desserts. Une formule comprend un plat et, au choix, une entrée ou un dessert (pas les deux). Combien de formules ?`, b * (a + c),
      `Pour l'accompagnement : $${a} + ${c} = ${a + c}$ choix (principe additif, cas disjoints) ; avec le plat : $${b} \\times ${a + c} = ${b * (a + c)}$.`);
  },
];

// ───────────── Géométrie dans l'espace ─────────────

const NORMS = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [2, 10, 11, 15]] as const;

const espace: Generator[] = [
  (r) => {
    const A = [int(r, -5, 5), int(r, -5, 5), int(r, -5, 5)], B = [int(r, -5, 5), int(r, -5, 5), int(r, -5, 5)];
    if (A.every((x, i) => x === B[i])) B[0] += 1;
    // Leurres : A − B, A + B, et une erreur de signe sur une seule coordonnée.
    const k = int(r, 0, 2), slip = B.map((x, i) => (i === k ? A[i] - x : x - A[i]));
    return mcq(r, `$A${pt(...A)}$, $B${pt(...B)}$. Coordonnées de $\\overrightarrow{AB}$ ?`, `$${pt(B[0] - A[0], B[1] - A[1], B[2] - A[2])}$`, [`$${pt(A[0] - B[0], A[1] - B[1], A[2] - B[2])}$`, `$${pt(A[0] + B[0], A[1] + B[1], A[2] + B[2])}$`, `$${pt(...slip)}$`], `$\\overrightarrow{AB} = B - A$ coordonnée par coordonnée.`);
  },
  (r) => {
    const u = [nonZero(r, 4), int(r, -4, 4), nonZero(r, 4)], w = [int(r, -4, 4), int(r, -4, 4), int(r, -4, 4)];
    // Une fois sur deux, on ajuste la 3e coordonnée de v pour que u·v = 0 (si la division tombe juste).
    const rest = u[0] * w[0] + u[1] * w[1], ortho = r() < 0.5 && rest % u[2] === 0;
    const v = ortho ? [w[0], w[1], -rest / u[2]] : w;
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
      () => {
        const col = (v: number[]) => v[0] * b - v[1] * a === 0 && v[0] * c - v[2] * a === 0 && v[1] * c - v[2] * b === 0;
        const wrongs = [[a, b, d], [b, c, d], [-b, a, 0], [a, c, b], [d, b, c]].filter((v) => !col(v)).map((v) => `$${pt(...v)}$`);
        return mcq(r, `Un vecteur normal au plan $${plane}$ ?`, `$${pt(a, b, c)}$`, wrongs, `Pour $ax + by + cz + d = 0$, $\\vec{n}\\,(a\\,;\\,b\\,;\\,c)$ ; tout vecteur colinéaire convient aussi.`, () => {
          for (;;) {
            const v = [int(r, -5, 5), int(r, -5, 5), int(r, -5, 5)];
            if (!col(v)) return `$${pt(...v)}$`;
          }
        });
      },
      () => {
        // Une fois sur deux, on cherche un point du plan (z entier), sinon un point au hasard.
        let [x, y, z] = [int(r, -3, 3), int(r, -3, 3), int(r, -3, 3)];
        if (r() < 0.5) {
          for (let i = 0; i < 60; i++) {
            const [tx, ty] = [int(r, -4, 4), int(r, -4, 4)], rest = -(a * tx + b * ty + d);
            if (rest % c === 0) {
              [x, y, z] = [tx, ty, rest / c];
              break;
            }
          }
        }
        const really = a * x + b * y + c * z + d === 0;
        return tf(`Le point $${pt(x, y, z)}$ appartient au plan $${plane}$.`, really, `$${a}\\times${par(x)} + ${par(b)}\\times${par(y)} + ${par(c)}\\times${par(z)} + ${par(d)} = ${a * x + b * y + c * z + d}$.`);
      },
    ]);
  },
  (r) => {
    const A = [int(r, -5, 5), int(r, -5, 5), int(r, -5, 5)], B = A.map((x) => x + 2 * int(r, -3, 3));
    if (A.every((x, i) => x === B[i])) B[0] += 2;
    // Leurres : B − A, A + B (oubli de diviser par 2) et (B − A)/2 (demi-vecteur au lieu de la demi-somme).
    return mcq(r, `Milieu de $[AB]$ avec $A${pt(...A)}$ et $B${pt(...B)}$ ?`, `$${pt(...A.map((x, i) => (x + B[i]) / 2))}$`, [`$${pt(...A.map((x, i) => B[i] - x))}$`, `$${pt(...A.map((x, i) => x + B[i]))}$`, `$${pt(...A.map((x, i) => (B[i] - x) / 2))}$`], `Moyenne des coordonnées.`);
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
