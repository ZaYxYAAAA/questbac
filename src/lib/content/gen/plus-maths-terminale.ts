/**
 * Maths, Terminale (spécialité) : questions supplémentaires couvrant toutes les
 * notions du programme, en plus de `maths-terminale.ts`.
 */
import { type Generator, cards, claims, frac, fracTex, int, mcq, nonZero, numeric, oneOf, par, pick, poly, shift, tex, tf } from "./kit";

/** Équation de plan $ax + by + cz + d = 0$ bien écrite (termes nuls omis). */
const plane3 = (a: number, b: number, c: number, d: number) => {
  const parts: string[] = [];
  for (const [k, v] of [[a, "x"], [b, "y"], [c, "z"], [d, ""]] as const) {
    if (k === 0) continue;
    const body = `${Math.abs(k) === 1 && v ? "" : Math.abs(k)}${v}`;
    parts.push(parts.length === 0 ? `${k < 0 ? "-" : ""}${body}` : `${k < 0 ? "-" : "+"} ${body}`);
  }
  return `${parts.join(" ")} = 0`;
};
const pt = (...n: number[]) => `(${n.map((v) => tex(v)).join("\\,;\\,")})`;
const LIM = (to: string) => `\\displaystyle\\lim_{${to}}`;
const binom = (n: number, k: number): number => (k < 0 || k > n ? 0 : k === 0 || k === n ? 1 : binom(n - 1, k - 1) + binom(n - 1, k));
const LIMITS = ["$+\\infty$", "$-\\infty$", "$0$", "$1$", "pas de limite"];

// ───────────── Suites, récurrence, convergence ─────────────

const recurrence: Generator[] = [
  (r) => {
    const a = pick(r, [0.5, 0.2, 0.25, 0.8]), l = int(r, -5, 9);
    const b = Math.round(l * (1 - a) * 100) / 100;
    return numeric(`$u_{n+1} = ${tex(a)}u_n ${b < 0 ? "-" : "+"} ${tex(Math.abs(b))}$. Si $(u_n)$ converge, quelle est sa limite ?`, l,
      `La limite $\\ell$ vérifie $\\ell = ${tex(a)}\\ell + ${par(b)}$ (point fixe), soit $${tex(1 - a)}\\ell = ${tex(b)}$ et $\\ell = ${l}$.`);
  },
  (r) => {
    const [n, d] = pick(r, [[1, 2], [1, 5], [-1, 2], [1, 4], [2, 3]] as const);
    const q = fracTex(n, d), qp = n < 0 ? `\\left(${q}\\right)` : q;
    return mcq(r, `$\\displaystyle\\lim_{n \\to +\\infty} \\left(1 + ${qp} + ${qp}^2 + \\dots + ${qp}^n\\right) = \\;?$`, frac(d, d - n), [frac(d, d + n), "$+\\infty$", "$1$"],
      `Somme géométrique $\\dfrac{1 - q^{n+1}}{1 - q}$ et $q^{n+1} \\to 0$ car $-1 < q < 1$ : limite $\\dfrac{1}{1 - q} = ${fracTex(d, d - n)}$.`);
  },
  (r) =>
    oneOf(r, [
      () => mcq(r, `$${LIM("n \\to +\\infty")} \\dfrac{\\sin n}{n} = \\;?$`, "$0$", LIMITS.filter((x) => x !== "$0$"), "$-\\frac1n \\leq \\frac{\\sin n}{n} \\leq \\frac1n$ et les deux bornes tendent vers 0 : théorème des gendarmes."),
      () => mcq(r, `$${LIM("n \\to +\\infty")} \\dfrac{(-1)^n}{n} = \\;?$`, "$0$", LIMITS.filter((x) => x !== "$0$"), "Encadrement par $-\\frac1n$ et $\\frac1n$."),
      () => mcq(r, `$${LIM("n \\to +\\infty")} (-1{,}5)^n = \\;?$`, "pas de limite", LIMITS.filter((x) => x !== "pas de limite"), "$q < -1$ : les termes alternent de signe en grandissant."),
      () => mcq(r, `$${LIM("n \\to +\\infty")} (n + \\cos n) = \\;?$`, "$+\\infty$", LIMITS.filter((x) => x !== "$+\\infty$"), "$n + \\cos n \\geq n - 1 \\to +\\infty$ : théorème de comparaison."),
      () => mcq(r, `$${LIM("n \\to +\\infty")} \\dfrac{2^n}{3^n} = \\;?$`, "$0$", LIMITS.filter((x) => x !== "$0$"), "$\\left(\\frac23\\right)^n$ avec $0 < \\frac23 < 1$."),
    ]),
  (r) => {
    const k = int(r, 1, 5);
    return oneOf(r, [
      () => tf(`$u_0 = ${k}$ et $u_{n+1} = u_n + n^2 + 1$. La suite $(u_n)$ est croissante.`, true, "$u_{n+1} - u_n = n^2 + 1 > 0$."),
      () => tf(`$u_n = ${k} + \\dfrac{1}{n + 1}$ est majorée par $${k + 1}$.`, true, `$\\frac{1}{n+1} \\leq 1$ pour tout $n \\geq 0$.`),
      () => tf(`Une suite croissante et majorée par $${k}$ converge vers $${k}$.`, false, `Elle converge, mais vers une limite $\\ell \\leq ${k}$ qui n'est pas forcément $${k}$.`),
    ]);
  },
  cards([
    ["Dans une démonstration par récurrence, l'hérédité consiste à montrer que…", "si $P(n)$ est vraie, alors $P(n+1)$ est vraie", ["$P(0)$ est vraie", "$P(n)$ est vraie pour tout $n$", "$P(n+1)$ implique $P(n)$"], "On suppose la propriété vraie à un rang $n$ fixé (hypothèse de récurrence)."],
    ["L'initialisation d'une récurrence consiste à…", "vérifier la propriété au premier rang", ["supposer la propriété vraie", "conclure", "calculer la limite"], "Sans elle, l'hérédité ne prouve rien."],
    ["Une suite décroissante et minorée…", "converge", ["tend vers $-\\infty$", "est constante", "diverge"], "Théorème de convergence monotone."],
    ["Si $u_n \\leq v_n$ et $u_n \\to +\\infty$, alors…", "$v_n \\to +\\infty$", ["$v_n \\to 0$", "$v_n$ converge", "on ne peut rien dire"], "Théorème de comparaison."],
    ["Une suite convergente est toujours…", "bornée", ["croissante", "positive", "géométrique"], "À partir d'un rang, ses termes restent proches de la limite."],
  ]),
];

// ───────────── Limites de fonctions ─────────────

const limites: Generator[] = [
  (r) =>
    oneOf(r, [
      () => mcq(r, `$${LIM("x \\to +\\infty")} x e^{-x} = \\;?$`, "$0$", LIMITS.filter((x) => x !== "$0$"), "Croissances comparées : $\\frac{x}{e^x} \\to 0$."),
      () => mcq(r, `$${LIM("x \\to +\\infty")} \\dfrac{e^{x}}{x^{3}} = \\;?$`, "$+\\infty$", LIMITS.filter((x) => x !== "$+\\infty$"), "L'exponentielle l'emporte sur toute puissance de $x$."),
      () => mcq(r, `$${LIM("x \\to +\\infty")} \\dfrac{\\ln x}{x^{2}} = \\;?$`, "$0$", LIMITS.filter((x) => x !== "$0$"), "Toute puissance de $x$ l'emporte sur le logarithme."),
      () => mcq(r, `$${LIM("x \\to 0^+")} x \\ln x = \\;?$`, "$0$", LIMITS.filter((x) => x !== "$0$"), "Croissances comparées en 0."),
      () => mcq(r, `$${LIM("x \\to -\\infty")} x^{2} e^{x} = \\;?$`, "$0$", LIMITS.filter((x) => x !== "$0$"), "En $-\\infty$, $e^x$ tend vers 0 plus vite que $x^2$ ne grandit."),
      () => mcq(r, `$${LIM("x \\to +\\infty")} (e^{x} - x) = \\;?$`, "$+\\infty$", LIMITS.filter((x) => x !== "$+\\infty$"), "$e^x - x = e^x\\left(1 - \\frac{x}{e^x}\\right)$ et $\\frac{x}{e^x} \\to 0$."),
    ]),
  (r) => {
    const a = int(r, -5, 5);
    return oneOf(r, [
      () => mcq(r, `$${LIM(`x \\to ${a}^+`)} \\dfrac{1}{${shift(a)}} = \\;?$`, "$+\\infty$", ["$-\\infty$", "$0$", `$${a}$`], `Pour $x > ${a}$, $${shift(a)} \\to 0^+$ : le quotient est positif et grandit sans limite.`),
      () => mcq(r, `$${LIM(`x \\to ${a}^-`)} \\dfrac{1}{${shift(a)}} = \\;?$`, "$-\\infty$", ["$+\\infty$", "$0$", `$${a}$`], `Pour $x < ${a}$, $${shift(a)} \\to 0^-$ : le quotient est négatif.`),
      () => mcq(r, `$${LIM(`x \\to ${a}`)} \\dfrac{1}{(${shift(a)})^2} = \\;?$`, "$+\\infty$", ["$-\\infty$", "$0$", "pas de limite"], "Un carré est positif : le quotient tend vers $+\\infty$ des deux côtés."),
    ]);
  },
  (r) => {
    const a = nonZero(r, 4), b = int(r, -5, 5);
    return oneOf(r, [
      () => mcq(r, `$${LIM("x \\to -\\infty")} (${poly([a, 0, b, 1])}) = \\;?$`, a > 0 ? "$-\\infty$" : "$+\\infty$", [a > 0 ? "$+\\infty$" : "$-\\infty$", "$0$", `$${a}$`], `Le terme de plus haut degré $${a}x^3$ l'emporte, et $x^3 \\to -\\infty$.`),
      () => mcq(r, `$${LIM("x \\to +\\infty")} (\\sqrt{x + ${Math.abs(b) + 1}} - \\sqrt{x}) = \\;?$`, "$0$", ["$+\\infty$", "$1$", `$${Math.abs(b) + 1}$`], `Quantité conjuguée : $\\dfrac{${Math.abs(b) + 1}}{\\sqrt{x + ${Math.abs(b) + 1}} + \\sqrt{x}} \\to 0$.`),
      () => mcq(r, `$${LIM("x \\to +\\infty")} e^{-x^2} = \\;?$`, "$0$", ["$+\\infty$", "$1$", "$-\\infty$"], "Composée : $-x^2 \\to -\\infty$ et $e^X \\to 0$ quand $X \\to -\\infty$."),
      () => mcq(r, `$${LIM("x \\to +\\infty")} \\ln\\left(1 + \\dfrac{1}{x}\\right) = \\;?$`, "$0$", ["$+\\infty$", "$1$", "$-\\infty$"], "$1 + \\frac1x \\to 1$ et $\\ln 1 = 0$."),
    ]);
  },
  cards([
    ["Laquelle est une forme indéterminée ?", "$\\infty - \\infty$", ["$\\infty + \\infty$", "$\\dfrac{1}{\\infty}$", "$\\infty \\times \\infty$"], "Les autres donnent $+\\infty$ ou $0$."],
    ["Si $\\displaystyle\\lim_{x \\to +\\infty} f(x) = 3$, la courbe de $f$ admet…", "une asymptote horizontale $y = 3$", ["une asymptote verticale $x = 3$", "une tangente horizontale en 3", "un maximum égal à 3"], "La courbe se rapproche de la droite $y = 3$."],
    ["Pour lever l'indétermination d'un quotient de polynômes en $+\\infty$, on…", "factorise par le terme de plus haut degré", ["remplace $x$ par $+\\infty$", "dérive le numérateur", "multiplie par $x$"], "Puis on simplifie."],
  ]),
];

// ───────────── Continuité, TVI ─────────────

const continuite: Generator[] = [
  (r) => {
    const v1 = int(r, 2, 8), v = [int(r, -6, -1), v1, int(r, -6, Math.min(v1 - 1, 2)), int(r, 3, 9)];
    // Variations : croissante, décroissante, croissante
    const xs = [0, 2, 5, 8];
    const table = `| $x$ | $${xs[0]}$ | | $${xs[1]}$ | | $${xs[2]}$ | | $${xs[3]}$ |\n|---|---|---|---|---|---|---|---|\n| $f$ | $${v[0]}$ | ↗ | $${v[1]}$ | ↘ | $${v[2]}$ | ↗ | $${v[3]}$ |`;
    let count = 0;
    for (let i = 0; i < 3; i++) if ((v[i] < 0 && v[i + 1] > 0) || (v[i] > 0 && v[i + 1] < 0)) count++;
    const zeros = v.filter((y) => y === 0).length;
    if (zeros) return numeric(`$f$ continue :\n\n${table}\n\nValeur de $f(${xs[v.indexOf(0)]})$ ?`, 0, "On la lit dans le tableau.");
    return numeric(`$f$ est continue et ses variations sont :\n\n${table}\n\nNombre de solutions de $f(x) = 0$ sur $[0\\,;\\,8]$ ?`, count,
      `Sur chaque intervalle où $f$ est strictement monotone et change de signe, le TVI (cas monotone) donne une unique solution : ${count} en tout.`);
  },
  (r) => {
    const a = int(r, 0, 3), len = pick(r, [1, 2, 4]), n = int(r, 2, 5);
    return numeric(`On applique $${n}$ étapes de dichotomie à partir de l'intervalle $[${a}\\,;\\,${a + len}]$. Longueur de l'intervalle obtenu ?`, len / 2 ** n,
      `Chaque étape divise la longueur par 2 : $\\dfrac{${len}}{2^{${n}}} = ${tex(len / 2 ** n, 5)}$.`, undefined, 0.0001);
  },
  (r) => {
    const l = int(r, 2, 6), a = int(r, 1, l), b = l * l - a * l;
    return numeric(`$u_{n+1} = \\sqrt{${a === 1 ? "" : a}u_n + ${b}}$ et $(u_n)$ converge vers $\\ell > 0$. Que vaut $\\ell$ ?`, l,
      `$f(x) = \\sqrt{${a === 1 ? "" : a}x + ${b}}$ est continue, donc $\\ell = \\sqrt{${a}\\ell + ${b}}$ : $\\ell^2 - ${a}\\ell - ${b} = 0$, dont la solution positive est $${l}$.`);
  },
  claims([
    ["Toute fonction continue est dérivable.", false, "La valeur absolue est continue en 0 mais pas dérivable en 0."],
    ["Toute fonction dérivable est continue.", true, "La réciproque est fausse."],
    ["Si $f(a)$ et $f(b)$ sont de signes contraires et $f$ continue sur $[a\\,;\\,b]$, $f$ s'annule au moins une fois sur $[a\\,;\\,b]$.", true, "C'est le TVI avec $k = 0$."],
    ["Le TVI donne toujours la valeur exacte de la solution.", false, "Il prouve l'existence ; on l'approche ensuite par dichotomie ou balayage."],
  ]),
];

// ───────────── Dérivation, convexité ─────────────

const convexite: Generator[] = [
  (r) => {
    const a = nonZero(r, 3);
    return oneOf(r, [
      () => mcq(r, `Dérivée de $e^{${a === 1 ? "" : a === -1 ? "-" : a}x^2}$ ?`, `$${2 * a}xe^{${a === 1 ? "" : a === -1 ? "-" : a}x^2}$`, [`$e^{${2 * a}x}$`, `$${a}x^2e^{${a === 1 ? "" : a === -1 ? "-" : a}x^2 - 1}$`, `$e^{${a === 1 ? "" : a === -1 ? "-" : a}x^2}$`], "$(e^u)' = u'e^u$ avec $u = " + (a === 1 ? "" : a === -1 ? "-" : String(a)) + "x^2$."),
      () => mcq(r, `Dérivée de $\\ln(x^2 + ${Math.abs(a)})$ ?`, `$\\dfrac{2x}{x^2 + ${Math.abs(a)}}$`, [`$\\dfrac{1}{x^2 + ${Math.abs(a)}}$`, `$\\dfrac{2x}{x}$`, `$2x\\ln(x^2 + ${Math.abs(a)})$`], "$(\\ln u)' = \\dfrac{u'}{u}$."),
      () => mcq(r, `Dérivée de $\\sqrt{x^2 + ${Math.abs(a)}}$ ?`, `$\\dfrac{x}{\\sqrt{x^2 + ${Math.abs(a)}}}$`, [`$\\dfrac{1}{2\\sqrt{x^2 + ${Math.abs(a)}}}$`, `$\\dfrac{2x}{\\sqrt{x^2 + ${Math.abs(a)}}}$`, `$2x\\sqrt{x^2 + ${Math.abs(a)}}$`], "$(\\sqrt u)' = \\dfrac{u'}{2\\sqrt u} = \\dfrac{2x}{2\\sqrt{\\ldots}}$."),
    ]);
  },
  (r) => {
    const k = nonZero(r, 4);
    return oneOf(r, [
      () => mcq(r, `$f(x) = ${poly([1, -3 * k, 0, 1])}$. Sur quel intervalle $f$ est-elle convexe ?`, `$[${k}\\,;\\,+\\infty[$`, [`$]-\\infty\\,;\\,${k}]$`, "$\\mathbb{R}$", `$[${-k}\\,;\\,+\\infty[$`], `$f''(x) = 6x - ${par(6 * k)}$, positive pour $x \\geq ${k}$.`),
      () => numeric(`$f(x) = (x ${k < 0 ? "-" : "+"} ${Math.abs(k)})e^{x}$. Abscisse du point d'inflexion ?`, -k - 2, `$f'(x) = (x + ${par(k + 1)})e^x$ et $f''(x) = (x + ${par(k + 2)})e^x$, qui s'annule en changeant de signe en $${-k - 2}$.`),
    ]);
  },
  claims([
    ["Pour tout réel $x$, $e^{x} \\geq x + 1$.", true, "$\\exp$ est convexe : sa courbe est au-dessus de sa tangente en 0, $y = x + 1$."],
    ["Pour tout $x > 0$, $\\ln x \\leq x - 1$.", true, "$\\ln$ est concave : sa courbe est en dessous de sa tangente en 1."],
    ["Si $f'$ est décroissante sur $I$, alors $f$ est convexe sur $I$.", false, "$f'$ décroissante ⇔ $f$ concave."],
    ["En un point d'inflexion, la courbe traverse sa tangente.", true, "C'est la définition géométrique."],
    ["Une fonction convexe est toujours croissante.", false, "$x^2$ est convexe mais décroissante sur $]-\\infty\\,;\\,0]$."],
  ]),
  cards([
    ["Graphiquement, $f$ convexe signifie que sa courbe est…", "au-dessus de ses tangentes", ["en dessous de ses tangentes", "croissante", "au-dessus de l'axe des abscisses"], "Forme « en U »."],
    ["Sur une courbe de $f'$, on reconnaît que $f$ est convexe quand…", "$f'$ est croissante", ["$f'$ est positive", "$f'$ est nulle", "$f'$ est négative"], "$f$ convexe ⇔ $f'$ croissante ⇔ $f'' \\geq 0$."],
  ]),
];

// ───────────── Logarithme ─────────────

const ln: Generator[] = [
  (r) => {
    const x = int(r, 1, 9), a = int(r, 2, 4);
    // ln(a x - c) = ln(x + d) avec la solution x
    const c = int(r, 0, a * x - 1), d = (a - 1) * x - c;
    if (d + x <= 0) return numeric(`Résous $\\ln(x) = \\ln(${x})$.`, x, "$\\ln$ est strictement croissante : $x = " + x + "$.");
    return numeric(`Résous $\\ln(${poly([a, -c])}) = \\ln(${poly([1, d])})$. $x = \\;?$`, x,
      `On résout $${poly([a, -c])} = ${poly([1, d])}$, soit $x = ${x}$, et on vérifie que $${a * x - c} > 0$ et $${x + d} > 0$.`);
  },
  (r) => {
    const k = int(r, 1, 4);
    return oneOf(r, [
      () => mcq(r, `Solutions de $\\ln x > ${k}$ ?`, `$]e^{${k}}\\,;\\,+\\infty[$`, [`$]${k}\\,;\\,+\\infty[$`, `$]0\\,;\\,e^{${k}}[$`, `$]\\ln ${k}\\,;\\,+\\infty[$`], `$\\ln x > ${k} = \\ln e^{${k}} \\iff x > e^{${k}}$ (fonction croissante).`),
      () => mcq(r, "Solutions de $\\ln x < 0$ ?", "$]0\\,;\\,1[$", ["$]-\\infty\\,;\\,1[$", "$]-\\infty\\,;\\,0[$", "$]1\\,;\\,+\\infty[$"], "$\\ln x < \\ln 1$ et $\\ln$ n'est définie que pour $x > 0$."),
      () => mcq(r, `Ensemble de définition de $\\ln(${k} - x)$ ?`, `$]-\\infty\\,;\\,${k}[$`, [`$]${k}\\,;\\,+\\infty[$`, "$\\mathbb{R}$", `$[${k}\\,;\\,+\\infty[$`], `Il faut $${k} - x > 0$.`),
    ]);
  },
  (r) => {
    const [a, b] = pick(r, [[2, 3], [3, 7], [2, 5], [5, 2], [10, 3]] as const);
    return mcq(r, `Solution de $${a}^x = ${b}$ ?`, `$x = \\dfrac{\\ln ${b}}{\\ln ${a}}$`, [`$x = \\ln\\dfrac{${b}}{${a}}$`, `$x = \\dfrac{${b}}{${a}}$`, `$x = \\ln ${b} - \\ln ${a}$`],
      `On applique $\\ln$ : $x\\ln ${a} = \\ln ${b}$.`);
  },
  (r) =>
    oneOf(r, [
      () => numeric("$\\ln\\left(e^{3}\\sqrt{e}\\right) = \\;?$", 3.5, "$\\ln e^3 + \\ln e^{1/2} = 3 + 0{,}5$."),
      () => numeric("$\\ln(e^{2}) - 2\\ln(e) = \\;?$", 0, "$2 - 2 = 0$."),
      () => numeric("$\\dfrac{\\ln 8}{\\ln 2} = \\;?$", 3, "$\\ln 8 = \\ln 2^3 = 3\\ln 2$."),
      () => numeric("$\\ln(\\sqrt{e}) = \\;?$", 0.5, "$\\sqrt e = e^{1/2}$."),
    ]),
  (r) => {
    const k = pick(r, [0.1, 0.2, 0.5, 0.05]);
    return mcq(r, `$N(t) = N_0e^{-${tex(k)}t}$. Au bout de combien de temps la quantité est-elle divisée par 2 ?`, `$t = \\dfrac{\\ln 2}{${tex(k)}}$`, [`$t = \\dfrac{${tex(k)}}{\\ln 2}$`, `$t = -\\dfrac{\\ln 2}{${tex(k)}}$`, `$t = ${tex(k)}\\ln 2$`],
      `$e^{-${tex(k)}t} = \\frac12 \\iff -${tex(k)}t = -\\ln 2$.`);
  },
  cards([
    ["La fonction $\\ln$ est définie sur…", "$]0\\,;\\,+\\infty[$", ["$\\mathbb{R}$", "$[0\\,;\\,+\\infty[$", "$\\mathbb{R}^*$"], "On ne prend le logarithme que de nombres strictement positifs."],
    ["$\\ln$ et $\\exp$ sont…", "des fonctions réciproques", ["égales", "opposées", "inverses l'une de l'autre ($\\frac1x$)"], "$e^{\\ln x} = x$ et $\\ln(e^x) = x$."],
    ["La courbe de $\\ln$ coupe l'axe des abscisses en…", "$x = 1$", ["$x = 0$", "$x = e$", "elle ne le coupe pas"], "$\\ln 1 = 0$."],
    ["$\\ln x$ tend vers $+\\infty$ quand $x \\to +\\infty$, mais…", "très lentement", ["plus vite que $x$", "plus vite que $e^x$", "en oscillant"], "$\\ln(10^{6}) \\approx 13{,}8$ seulement."],
  ]),
];

// ───────────── Primitives et équations différentielles ─────────────

const primitives: Generator[] = [
  (r) =>
    oneOf(r, [
      () => mcq(r, "Une primitive de $\\dfrac{1}{x^2}$ sur $]0\\,;\\,+\\infty[$ ?", "$-\\dfrac{1}{x}$", ["$\\dfrac{1}{x}$", "$\\ln(x^2)$", "$-\\dfrac{2}{x^3}$"], "$\\left(-\\frac1x\\right)' = \\frac{1}{x^2}$."),
      () => mcq(r, "Une primitive de $2xe^{x^2}$ ?", "$e^{x^2}$", ["$x^2e^{x^2}$", "$2e^{x^2}$", "$e^{2x}$"], "Forme $u'e^u$ avec $u = x^2$."),
      () => mcq(r, "Une primitive de $\\dfrac{2x}{x^2 + 1}$ ?", "$\\ln(x^2 + 1)$", ["$\\dfrac{1}{x^2 + 1}$", "$2\\ln x$", "$\\dfrac{x^2}{x^3/3 + x}$"], "Forme $\\frac{u'}{u}$ avec $u = x^2 + 1 > 0$."),
      () => mcq(r, "Une primitive de $\\cos x$ ?", "$\\sin x$", ["$-\\sin x$", "$\\cos x$", "$-\\cos x$"], "$(\\sin x)' = \\cos x$."),
      () => mcq(r, "Une primitive de $\\ln x$ ?", "$x\\ln x - x$", ["$\\dfrac1x$", "$x\\ln x$", "$\\dfrac{(\\ln x)^2}{2}$"], "On vérifie : $(x\\ln x - x)' = \\ln x + 1 - 1$."),
      () => mcq(r, "Une primitive de $3(3x + 1)^2$ ?", "$(3x + 1)^3$", ["$9(3x + 1)$", "$(3x + 1)^3 / 3$", "$3(3x + 1)^3$"], "Forme $u'u^2$ : primitive $\\frac{u^3}{3}$, ici $\\frac{(3x+1)^3}{3} \\times 3$."),
    ]),
  (r) => {
    const a = nonZero(r, 3), c = nonZero(r, 9), b = c * a;
    const ex = (k: number) => `e^{${k === 1 ? "" : k === -1 ? "-" : k}x}`;
    const plus = (v: number) => `${v < 0 ? "-" : "+"} ${Math.abs(v)}`;
    return mcq(r, `Solutions de $y' = ${poly([-a, b], "y")}$ ?`, `$y = C${ex(-a)} ${plus(c)}$`, [`$y = C${ex(a)} ${plus(c)}$`, `$y = C${ex(-a)} ${plus(-c)}$`, `$y = C${ex(-a)}$`],
      `$y' = ay + b$ a pour solutions $Ce^{ax} - \\frac{b}{a}$, avec $a = ${-a}$ et $b = ${b}$ : $-\\frac{b}{a} = ${c}$ (c'est la solution constante).`);
  },
  (r) => {
    const amb = pick(r, [15, 18, 20, 22, 25]), t0 = pick(r, [80, 90, 100, 60]);
    return oneOf(r, [
      () => numeric(`Un café à $${t0}$ °C refroidit dans une pièce à $${amb}$ °C : $T' = -0{,}1(T - ${amb})$. Vers quelle température tend $T$ ?`, amb, `$T(t) = ${t0 - amb}e^{-0{,}1t} + ${amb}$, et $e^{-0{,}1t} \\to 0$.`, "°C"),
      () => mcq(r, `$T' = -0{,}1(T - ${amb})$ et $T(0) = ${t0}$. Expression de $T(t)$ ?`, `$T(t) = ${t0 - amb}e^{-0{,}1t} + ${amb}$`, [`$T(t) = ${t0}e^{-0{,}1t}$`, `$T(t) = ${t0}e^{-0{,}1t} + ${amb}$`, `$T(t) = ${t0 - amb}e^{0{,}1t} + ${amb}$`], `Solutions $Ce^{-0{,}1t} + ${amb}$ et $T(0) = C + ${amb} = ${t0}$.`),
    ]);
  },
  claims([
    ["$F(x) = x\\ln x - x$ est une primitive de $\\ln x$ sur $]0\\,;\\,+\\infty[$.", true, "$F'(x) = \\ln x + x \\times \\frac1x - 1 = \\ln x$."],
    ["Toute fonction continue sur un intervalle admet des primitives.", true, "Théorème du cours."],
    ["Une fonction a une seule primitive.", false, "Elles diffèrent toutes d'une constante."],
    ["$y = 5e^{2x}$ est solution de $y' = 2y$.", true, "$y' = 10e^{2x} = 2y$."],
  ]),
];

// ───────────── Intégration ─────────────

const integrale: Generator[] = [
  (r) =>
    oneOf(r, [
      () => mcq(r, "$\\displaystyle\\int_0^1 e^{x}\\,dx = \\;?$", "$e - 1$", ["$e$", "$1$", "$e + 1$"], "$[e^x]_0^1 = e^1 - e^0$."),
      () => numeric("$\\displaystyle\\int_1^{e} \\dfrac{1}{x}\\,dx = \\;?$", 1, "$[\\ln x]_1^e = \\ln e - \\ln 1 = 1$."),
      () => numeric("$\\displaystyle\\int_{-2}^{2} x^3\\,dx = \\;?$", 0, "$x^3$ est impaire : les aires de part et d'autre de 0 se compensent."),
      () => mcq(r, "$\\displaystyle\\int_0^{\\pi} \\sin x\\,dx = \\;?$", "$2$", ["$0$", "$1$", "$\\pi$"], "$[-\\cos x]_0^{\\pi} = 1 - (-1) = 2$."),
      () => numeric("$\\displaystyle\\int_0^1 x e^{x}\\,dx = \\;?$ (intégration par parties)", 1, "$u = x$, $v' = e^x$ : $[xe^x]_0^1 - \\int_0^1 e^x\\,dx = e - (e - 1) = 1$."),
    ]),
  (r) =>
    oneOf(r, [
      () => mcq(r, "Aire du domaine compris entre les courbes de $y = x$ et $y = x^2$ sur $[0\\,;\\,1]$ ?", frac(1, 6), [frac(1, 2), frac(1, 3), frac(5, 6)], "$\\int_0^1 (x - x^2)\\,dx = \\frac12 - \\frac13 = \\frac16$ (sur $[0\\,;\\,1]$, $x \\geq x^2$)."),
      () => mcq(r, "Aire sous la courbe de $y = x^2$ entre $0$ et $3$ (unités d'aire) ?", "$9$", ["$27$", "$3$", "$6$"], "$\\left[\\frac{x^3}{3}\\right]_0^3 = 9$."),
      () => mcq(r, "Aire sous la courbe de $y = \\sqrt{x}$ entre $0$ et $4$ ?", frac(16, 3), ["$8$", "$2$", frac(8, 3)], "Primitive $\\frac23 x^{3/2}$ : $\\frac23 \\times 8 = \\frac{16}{3}$."),
    ]),
  (r) => {
    const A = int(r, -5, 9), B = int(r, -5, 9), a = nonZero(r, 3), b = nonZero(r, 3);
    return numeric(`$\\int_0^3 f = ${A}$ et $\\int_0^3 g = ${B}$. $\\int_0^3 (${a === 1 ? "" : a === -1 ? "-" : a}f ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}g) = \\;?$`, a * A + b * B, `Linéarité : $${a} \\times ${par(A)} + ${par(b)} \\times ${par(B)} = ${a * A + b * B}$.`);
  },
  (r) => {
    const m = pick(r, [3, 6]), b = int(r, 2, 6);
    return numeric(`Valeur moyenne de $f(x) = ${m === 1 ? "" : m}x^2$ sur $[0\\,;\\,${b}]$ ?`, (m * b * b) / 3, `$\\mu = \\dfrac{1}{${b}}\\displaystyle\\int_0^{${b}} ${m === 1 ? "" : m}x^2\\,dx = \\dfrac{1}{${b}} \\times \\dfrac{${m * b ** 3}}{3} = ${tex((m * b * b) / 3)}$.`, undefined, 0.01);
  },
  claims([
    ["Si $f \\leq g$ sur $[a\\,;\\,b]$ (avec $a \\leq b$), alors $\\int_a^b f \\leq \\int_a^b g$.", true, "Croissance de l'intégrale."],
    ["L'intégrale d'une fonction négative sur $[a\\,;\\,b]$ ($a < b$) est négative.", true, "Elle vaut l'opposé de l'aire."],
    ["$\\int_a^b f(x)\\,dx = -\\int_b^a f(x)\\,dx$.", true, "Échanger les bornes change le signe."],
    ["$\\int_0^1 f(x)g(x)\\,dx = \\int_0^1 f(x)\\,dx \\times \\int_0^1 g(x)\\,dx$.", false, "L'intégrale d'un produit n'est pas le produit des intégrales."],
  ]),
];

// ───────────── Loi binomiale, somme de variables ─────────────

const binomiale: Generator[] = [
  (r) => {
    const [p, pq] = pick(r, [[0.2, 0.8], [0.1, 0.9], [0.3, 0.7], [0.5, 0.5]] as const), n = pick(r, [3, 4]), k = int(r, 1, n - 1);
    const val = binom(n, k) * p ** k * pq ** (n - k);
    return numeric(`$X \\sim \\mathcal{B}(${n}\\,;\\,${tex(p)})$. $P(X = ${k})$ (valeur exacte) ?`, val, `$\\dbinom{${n}}{${k}} \\times ${tex(p)}^{${k}} \\times ${tex(pq)}^{${n - k}} = ${binom(n, k)} \\times ${tex(p ** k, 6)} \\times ${tex(pq ** (n - k), 6)} = ${tex(val, 6)}$.`, undefined, 0.0001);
  },
  (r) => {
    const [p, n] = pick(r, [[0.5, 5], [0.1, 29], [0.2, 14], [0.3, 9]] as const);
    return numeric(`Une épreuve réussit avec probabilité $${tex(p)}$. Combien de répétitions indépendantes faut-il au minimum pour que la probabilité d'au moins une réussite dépasse $0{,}95$ ?`, n,
      `$1 - ${tex(1 - p)}^n \\geq 0{,}95 \\iff ${tex(1 - p)}^n \\leq 0{,}05 \\iff n \\geq \\dfrac{\\ln 0{,}05}{\\ln ${tex(1 - p)}} \\approx ${tex(Math.log(0.05) / Math.log(1 - p), 2)}$, donc $n = ${n}$.`);
  },
  (r) => {
    const ex = int(r, 2, 9), ey = int(r, 2, 9), vx = int(r, 1, 6), vy = int(r, 1, 6), n = pick(r, [4, 9, 16, 25, 100]);
    return oneOf(r, [
      () => numeric(`$E(X) = ${ex}$ et $E(Y) = ${ey}$. $E(X + Y) = \\;?$`, ex + ey, "Linéarité de l'espérance (toujours vraie)."),
      () => numeric(`$X$ et $Y$ indépendantes, $V(X) = ${vx}$ et $V(Y) = ${vy}$. $V(X + Y) = \\;?$`, vx + vy, "Pour des variables indépendantes, les variances s'additionnent."),
      () => numeric(`$X_1, \\dots, X_{${n}}$ indépendantes de même loi, de variance $${vx * n}$. Variance de la moyenne $M = \\dfrac{X_1 + \\dots + X_{${n}}}{${n}}$ ?`, vx, `$V(M) = \\dfrac{V(X)}{n} = \\dfrac{${vx * n}}{${n}} = ${vx}$.`),
      () => numeric(`$V(X) = ${vx}$. Majorant donné par l'inégalité de Bienaymé-Tchebychev pour $P(|X - E(X)| \\geq ${2})$ ?`, vx / 4, `$P(|X - E(X)| \\geq \\delta) \\leq \\dfrac{V(X)}{\\delta^2} = \\dfrac{${vx}}{4}$.`, undefined, 0.001),
    ]);
  },
  cards([
    ["Pour qu'une variable suive une loi binomiale, il faut…", "des épreuves de Bernoulli identiques et indépendantes", ["des tirages sans remise", "une probabilité de succès de 0,5", "au moins 30 répétitions"], "Tirages sans remise : les épreuves ne sont pas indépendantes."],
    ["$\\dbinom{n}{k}$ compte…", "le nombre de chemins de l'arbre réalisant $k$ succès", ["la probabilité de $k$ succès", "le nombre d'épreuves", "l'espérance"], "C'est aussi le nombre de façons de choisir $k$ éléments parmi $n$."],
    ["Si $X \\sim \\mathcal{B}(n\\,;\\,p)$, $E(X) = \\;?$", "$np$", ["$np(1 - p)$", "$\\frac{n}{p}$", "$p^n$"], "Moyenne du nombre de succès."],
  ]),
];

// ───────────── Dénombrement ─────────────

const denombrement: Generator[] = [
  (r) => {
    const n = int(r, 4, 15);
    return oneOf(r, [
      () => numeric(`$${n}$ personnes se serrent toutes la main une fois. Combien de poignées de main ?`, (n * (n - 1)) / 2, `Choisir 2 personnes parmi $${n}$ : $\\dbinom{${n}}{2} = \\dfrac{${n} \\times ${n - 1}}{2}$.`),
      () => numeric(`Nombre de diagonales d'un polygone convexe à $${n}$ côtés ?`, (n * (n - 3)) / 2, `$\\dbinom{${n}}{2}$ segments joignant 2 sommets, moins les $${n}$ côtés : $${(n * (n - 1)) / 2} - ${n}$.`),
    ]);
  },
  (r) => {
    const a = int(r, 2, 5), b = int(r, 2, 5);
    return numeric(`Sur un quadrillage, combien de chemins vont de $(0\\,;\\,0)$ à $(${a}\\,;\\,${b})$ en ne faisant que des pas vers la droite ou vers le haut ?`, binom(a + b, a),
      `Un chemin = $${a + b}$ pas dont on choisit les $${a}$ vers la droite : $\\dbinom{${a + b}}{${a}} = ${binom(a + b, a)}$.`);
  },
  (r) => {
    const n = int(r, 6, 10), k = int(r, 3, 4);
    return oneOf(r, [
      () => numeric(`Combien de groupes de $${k}$ élèves parmi $${n}$ contiennent un élève donné, Léa ?`, binom(n - 1, k - 1), `Léa est dedans ; on choisit les $${k - 1}$ autres parmi les $${n - 1}$ restants : $\\dbinom{${n - 1}}{${k - 1}}$.`),
      () => numeric(`Combien de mots de $${k}$ lettres distinctes peut-on former avec $${n}$ lettres ?`, Array.from({ length: k }, (_, i) => n - i).reduce((s, x) => s * x, 1), `Arrangements : $${Array.from({ length: k }, (_, i) => n - i).join(" \\times ")}$.`),
      () => numeric(`On range $${k}$ livres différents sur une étagère. Nombre d'ordres possibles ?`, [1, 1, 2, 6, 24][k], `$${k}! = ${[1, 1, 2, 6, 24][k]}$.`),
    ]);
  },
  (r) => {
    const n = int(r, 4, 7), k = int(r, 1, n - 1);
    return oneOf(r, [
      () => numeric(`$\\dbinom{${n}}{${k}} + \\dbinom{${n}}{${k + 1}} = \\;?$`, binom(n + 1, k + 1), `Relation de Pascal : $\\dbinom{${n + 1}}{${k + 1}} = ${binom(n + 1, k + 1)}$.`),
      () => numeric(`$\\dbinom{${n}}{0} + \\dbinom{${n}}{1} + \\dots + \\dbinom{${n}}{${n}} = \\;?$`, 2 ** n, `C'est le nombre de parties d'un ensemble à $${n}$ éléments : $2^{${n}}$.`),
    ]);
  },
  cards([
    ["Un $k$-uplet d'éléments d'un ensemble à $n$ éléments, c'est…", "une liste ordonnée de $k$ éléments, répétitions permises", ["un sous-ensemble à $k$ éléments", "une permutation", "un arrangement sans répétition"], "Il y en a $n^k$."],
    ["Une combinaison de $k$ éléments parmi $n$ est…", "une partie à $k$ éléments (sans ordre)", ["une liste ordonnée", "une permutation de $n$ éléments", "un tirage avec remise"], "Il y en a $\\binom nk$."],
    ["$0! = \\;?$", "$1$", ["$0$", "non défini", "$-1$"], "Convention cohérente avec $\\binom n0 = 1$."],
  ]),
];

// ───────────── Géométrie dans l'espace ─────────────

const espace: Generator[] = [
  (r) => {
    const [a, b, c, n] = pick(r, [[1, 2, 2, 3], [2, 1, 2, 3], [2, 2, 1, 3], [1, 4, 8, 9], [2, 3, 6, 7], [0, 3, 4, 5]] as const);
    const P = [int(r, -3, 3), int(r, -3, 3), int(r, -3, 3)], dist = int(r, 0, 4);
    const d = n * dist - (a * P[0] + b * P[1] + c * P[2]);
    const plane = plane3(a, b, c, d);
    return numeric(`Distance du point $A${pt(P[0], P[1], P[2])}$ au plan $${plane}$ ?`, dist,
      `$d = \\dfrac{|${a}x_A + ${b}y_A + ${c}z_A + ${par(d)}|}{\\sqrt{${a}^2 + ${b}^2 + ${c}^2}} = \\dfrac{${n * dist}}{${n}} = ${dist}$.`);
  },
  (r) => {
    const A = [int(r, -3, 3), int(r, -3, 3), int(r, -3, 3)], n = [nonZero(r, 3), nonZero(r, 3), nonZero(r, 3)];
    const d = -(n[0] * A[0] + n[1] * A[1] + n[2] * A[2]);
    const eq = (v: number[], dd: number) => plane3(v[0], v[1], v[2], dd);
    return mcq(r, `Équation du plan passant par $A${pt(A[0], A[1], A[2])}$ et de vecteur normal $\\vec n${pt(n[0], n[1], n[2])}$ ?`, `$${eq(n, d)}$`, [`$${eq(n, -d)}$`, `$${eq(n, d + 1)}$`, `$${eq([n[1], n[0], n[2]], d)}$`].filter((w) => w !== `$${eq(n, d)}$`),
      `$\\vec n$ donne les coefficients ; $d$ se trouve en écrivant que $A$ vérifie l'équation : $d = ${d}$.`);
  },
  (r) => {
    const n = [nonZero(r, 3), nonZero(r, 3), nonZero(r, 3)], u = [nonZero(r, 2), nonZero(r, 2), 0];
    u[2] = -(n[0] * u[0] + n[1] * u[1]) / n[2];
    const ok = Number.isInteger(u[2]);
    const v = ok ? u : [n[2], 0, -n[0]];
    const normal = r() < 0.5;
    const w = normal ? n : [n[0] + 1, n[1], n[2]];
    return tf(`$\\vec w${pt(w[0], w[1], w[2])}$ est orthogonal au vecteur $\\vec u${pt(v[0], v[1], v[2])}$.`, w[0] * v[0] + w[1] * v[1] + w[2] * v[2] === 0,
      `$\\vec w \\cdot \\vec u = ${w[0] * v[0] + w[1] * v[1] + w[2] * v[2]}$.`);
  },
  cards([
    ["Deux droites de l'espace non coplanaires sont…", "ni parallèles ni sécantes", ["parallèles", "sécantes", "confondues"], "C'est une situation propre à l'espace."],
    ["Une droite est orthogonale à un plan si elle est orthogonale à…", "deux droites sécantes de ce plan", ["une droite de ce plan", "tous les plans", "un vecteur directeur du plan seulement"], "Son vecteur directeur est alors normal au plan."],
    ["Pour trouver l'intersection d'une droite (paramétrée) et d'un plan, on…", "remplace $x$, $y$, $z$ dans l'équation du plan et on résout en $t$", ["calcule un produit scalaire nul", "cherche le milieu", "résout un système de deux équations"], "Puis on reporte $t$ dans la représentation paramétrique."],
    ["Le projeté orthogonal de $A$ sur un plan $\\mathcal{P}$ est…", "le point de $\\mathcal{P}$ le plus proche de $A$", ["le milieu de $A$ et de l'origine", "un point quelconque de $\\mathcal{P}$", "le symétrique de $A$"], "$AH$ est la distance de $A$ au plan."],
  ]),
];

export const MATHS_TERMINALE_PLUS: Record<string, Generator[]> = {
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
