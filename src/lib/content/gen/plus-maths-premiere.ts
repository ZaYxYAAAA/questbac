/**
 * Maths, Première : questions supplémentaires couvrant toutes les notions du
 * programme (méthodes, modélisation, lectures, pièges), en plus de `maths-premiere.ts`.
 */
import { type Generator, cards, claims, frac, fracTex, int, mcq, nonZero, numeric, oneOf, par, pick, poly, shift, tex, tf } from "./kit";

const pt = (...n: number[]) => `(${n.map((v) => tex(v)).join("\\,;\\,")})`;
const fac = (a: number) => (a === 0 ? "x" : `(${shift(a)})`);
const coef = (a: number) => (a === 1 ? "" : a === -1 ? "-" : String(a));

// ───────────── Second degré ─────────────

const secondDegre: Generator[] = [
  (r) => {
    const a = pick(r, [1, 1, 2, -1, 3]), p = int(r, -7, 6), q = p + int(r, 1, 6);
    return numeric(`Plus grande solution de $${poly([a, -a * (p + q), a * p * q])} = 0$ ?`, q,
      `$\\Delta = ${a * a * (q - p) ** 2}$, racines $\\dfrac{${a * (p + q)} \\pm ${Math.abs(a * (q - p))}}{${2 * a}}$ : $${p}$ et $${q}$.`);
  },
  (r) => {
    const a = pick(r, [2, 3, -1, -2]), p = int(r, -5, 5), q = int(r, -5, 5);
    if (p === q) return tf(`$${poly([a, -2 * a * p, a * p * p])}$ a une racine double.`, true, `$${coef(a)}${fac(p)}^2$ : $\\Delta = 0$.`);
    const ans = `$${coef(a)}${fac(p)}${fac(q)}$`;
    return mcq(r, `Forme factorisée de $${poly([a, -a * (p + q), a * p * q])}$ ?`, ans, [`$${fac(p)}${fac(q)}$`, `$${coef(a)}${fac(-p)}${fac(-q)}$`, `$${coef(-a)}${fac(p)}${fac(q)}$`].filter((w) => w !== ans),
      `Racines $${p}$ et $${q}$ : $ax^2 + bx + c = a(x - x_1)(x - x_2)$ avec $a = ${a}$. Ne pas oublier le coefficient $a$ !`);
  },
  (r) => {
    const p = int(r, -6, 3), q = p + int(r, 1, 6);
    const pos = r() < 0.5;
    const inside = `$]${p}\\,;\\,${q}[$`, outside = `$]-\\infty\\,;\\,${p}[\\,\\cup\\,]${q}\\,;\\,+\\infty[$`;
    return mcq(r, `Solutions de $${poly([-1, p + q, -p * q])} ${pos ? ">" : "<"} 0$ ?`, pos ? inside : outside, [pos ? outside : inside, `$]${-q}\\,;\\,${-p}[$`, "$\\emptyset$"],
      `Racines $${p}$ et $${q}$, et $a = -1 < 0$ : le trinôme est négatif à l'extérieur des racines, positif entre elles.`);
  },
  (r) => {
    const k = int(r, 2, 8);
    return mcq(r, `Pour quelles valeurs de $m$ l'équation $x^2 + mx + ${k * k} = 0$ a-t-elle une racine double ?`, `$m = -${2 * k}$ ou $m = ${2 * k}$`, [`$m = ${2 * k}$ seulement`, `$m = ${k}$ ou $m = -${k}$`, `$m = ${k * k}$`],
      `Racine double $\\iff \\Delta = m^2 - 4 \\times ${k * k} = 0 \\iff m^2 = ${4 * k * k}$.`);
  },
  (r) => {
    const s = pick(r, [10, 12, 14, 16, 20]), x = int(r, 1, s / 2 - 1);
    const area = x * (s - x);
    return numeric(`Un rectangle a un périmètre de $${2 * s}$ cm et une aire de $${area}$ cm². Longueur de son plus petit côté (cm) ?`, x,
      `Côtés $x$ et $${s} - x$ : $x(${s} - x) = ${area} \\iff x^2 - ${s}x + ${area} = 0$, racines $${x}$ et $${s - x}$.`, "cm");
  },
  (r) => {
    const x0 = nonZero(r, 4), b = int(r, -6, 6);
    const c = -(x0 * x0 + b * x0);
    return numeric(`$${x0}$ est racine de $x^2 ${b < 0 ? "-" : "+"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}x + c$. Valeur de $c$ ?`.replace("+ 0x", "").replace("- 0x", ""), c,
      `On remplace $x$ par $${x0}$ : $${x0 * x0} + ${par(b * x0)} + c = 0$, donc $c = ${c}$.`);
  },
  (r) => {
    const a = pick(r, [1, 2, -1, -2]), al = int(r, -5, 5), be = int(r, -6, 6);
    const has = a * be < 0 ? 2 : be === 0 ? 1 : 0;
    return numeric(`Combien de solutions réelles a l'équation $${coef(a)}${al === 0 ? "x^2" : `(${shift(al)})^2`}${be === 0 ? "" : ` ${be < 0 ? "-" : "+"} ${Math.abs(be)}`} = 0$ ?`, has,
      `Forme canonique : ${has === 0 ? `$${coef(a)}(\\ldots)^2$ et $${be}$ sont de même signe, la somme ne s'annule jamais` : has === 1 ? "il reste un carré nul, une seule solution" : `on isole le carré : $(\\ldots)^2 = ${fracTex(-be, a)} > 0$, deux solutions`}.`);
  },
  cards([
    ["Si $\\Delta < 0$, le trinôme $ax^2 + bx + c$ est…", "du signe de $a$ pour tout $x$", ["toujours positif", "toujours négatif", "nul en $-\\frac{b}{2a}$"], "Il ne s'annule jamais."],
    ["L'axe de symétrie de la parabole $y = ax^2 + bx + c$ a pour équation…", "$x = -\\dfrac{b}{2a}$", ["$y = -\\dfrac{b}{2a}$", "$x = \\dfrac{b}{a}$", "$x = -\\dfrac{\\Delta}{4a}$"], "Il passe par le sommet."],
    ["Si $a > 0$, la parabole est tournée…", "vers le haut (en U)", ["vers le bas", "vers la droite", "cela dépend de $\\Delta$"], "Elle admet alors un minimum."],
    ["Deux nombres de somme $S$ et de produit $P$ sont les racines de…", "$x^2 - Sx + P = 0$", ["$x^2 + Sx + P = 0$", "$x^2 - Px + S = 0$", "$Sx^2 + P = 0$"], "Car $(x - x_1)(x - x_2) = x^2 - (x_1 + x_2)x + x_1x_2$."],
  ]),
  claims([
    ["Si $a$ et $c$ sont de signes contraires, le trinôme a deux racines.", true, "$\\Delta = b^2 - 4ac > 0$ car $-4ac > 0$."],
    ["Un trinôme du second degré a toujours au moins une racine réelle.", false, "Si $\\Delta < 0$, il n'en a aucune."],
    ["La forme canonique permet de lire directement le sommet de la parabole.", true, "$a(x - \\alpha)^2 + \\beta$ : sommet $(\\alpha\\,;\\,\\beta)$."],
  ]),
];

// ───────────── Suites ─────────────

const suites: Generator[] = [
  (r) => {
    const u0 = int(r, 1, 10), d = int(r, 1, 6), n = int(r, 5, 20);
    const last = u0 + (n - 1) * d;
    return numeric(`$(u_n)$ arithmétique, $u_0 = ${u0}$, $r = ${d}$. Calcule $S = u_0 + u_1 + \\dots + u_{${n - 1}}$.`, (n * (u0 + last)) / 2,
      `${n} termes, du premier $${u0}$ au dernier $u_{${n - 1}} = ${last}$ : $S = ${n} \\times \\dfrac{${u0} + ${last}}{2} = ${tex((n * (u0 + last)) / 2)}$.`);
  },
  (r) => {
    const u1 = pick(r, [2, 3, 4, 5, -2]), q = pick(r, [2, 3, -2, 0.5]), n = int(r, 3, 6);
    return oneOf(r, [
      () => numeric(`$(u_n)$ géométrique avec $u_1 = ${u1}$ et $u_2 = ${tex(u1 * q)}$. Raison $q$ ?`, q, `$q = \\dfrac{u_2}{u_1} = \\dfrac{${tex(u1 * q)}}{${u1}} = ${tex(q)}$.`),
      () => numeric(`$(u_n)$ géométrique, premier terme $u_1 = ${u1}$ et raison $q = ${tex(q)}$. $u_{${n}} = \\;?$`, u1 * q ** (n - 1), `Le premier terme est $u_1$ : $u_n = u_1 \\times q^{n-1}$, donc $u_{${n}} = ${u1} \\times ${par(q)}^{${n - 1}} = ${tex(u1 * q ** (n - 1))}$.`, undefined, 0.001),
    ]);
  },
  (r) => {
    const t = pick(r, [2, 3, 4, 5, 10, 20]), up = r() < 0.5, c = int(r, 5, 50) * 100;
    const q = up ? 1 + t / 100 : 1 - t / 100;
    return oneOf(r, [
      () => mcq(r, `Un capital de $${c}$ € ${up ? "augmente" : "perd"} $${t}\\,\\%$ par an. On note $C_n$ le capital après $n$ années. Expression de $C_n$ ?`, `$C_n = ${c} \\times ${tex(q)}^n$`,
        [`$C_n = ${c} + ${t}n$`, `$C_n = ${c} \\times ${tex(t / 100)}^n$`, `$C_n = ${c} \\times ${tex(up ? 1 - t / 100 : 1 + t / 100)}^n$`], `Suite géométrique de raison $1 ${up ? "+" : "-"} \\frac{${t}}{100} = ${tex(q)}$.`),
      () => mcq(r, `Une population ${up ? "augmente" : "diminue"} de $${t}\\,\\%$ par an. C'est une suite…`, `géométrique de raison $${tex(q)}$`, [`arithmétique de raison $${up ? "" : "-"}${t}$`, `géométrique de raison $${tex(t / 100)}$`, `arithmétique de raison $${tex(q)}$`], `Chaque année on multiplie par le même coefficient $${tex(q)}$.`),
    ]);
  },
  (r) => {
    const u0 = int(r, 1, 9), d = nonZero(r, 7), q = int(r, 2, 6);
    return oneOf(r, [
      () => mcq(r, `$u_0 = ${u0}$ et $u_{n+1} = u_n ${d < 0 ? "-" : "+"} ${Math.abs(d)}$. Expression de $u_n$ ?`, `$u_n = ${poly([d, u0], "n")}$`, [`$u_n = ${poly([u0, d], "n")}$`, `$u_n = ${u0} \\times ${par(d)}^n$`, `$u_n = ${poly([d, u0 + d], "n")}$`], `Suite arithmétique de raison $${d}$ : $u_n = u_0 + nr$.`),
      () => mcq(r, `$u_0 = ${u0}$ et $u_{n+1} = ${q} u_n$. Expression de $u_n$ ?`, `$u_n = ${u0} \\times ${q}^n$`, [`$u_n = ${poly([q, u0], "n")}$`, `$u_n = ${q} \\times ${u0}^n$`, `$u_n = ${u0} \\times ${q}^{n+1}$`], `Suite géométrique de raison $${q}$ : $u_n = u_0 \\times q^n$.`),
    ]);
  },
  (r) => {
    const u0 = pick(r, [100, 200, 500, 1000]), q = pick(r, [2, 3]), s = u0 * q ** int(r, 3, 6) - int(r, 1, 50);
    let n = 0;
    while (u0 * q ** n <= s) n++;
    return numeric(`$u_n = ${u0} \\times ${q}^n$. Plus petit entier $n$ tel que $u_n > ${tex(s)}$ ?`, n, `On calcule les termes : $u_{${n - 1}} = ${tex(u0 * q ** (n - 1))}$ et $u_{${n}} = ${tex(u0 * q ** n)}$ ; le seuil est dépassé au rang $${n}$.`);
  },
  (r) => {
    const k = int(r, 2, 8);
    return oneOf(r, [
      () => tf(`La suite $u_n = n^2 - ${2 * k + 1}n$ est croissante à partir du rang $${k}$.`, true, `$u_{n+1} - u_n = 2n + 1 - ${2 * k + 1} = 2(n - ${k})$, positif dès $n \\geq ${k}$.`),
      () => mcq(r, `$u_n = \\dfrac{${k}}{n + 1}$. La suite $(u_n)$ est…`, "décroissante", ["croissante", "constante", "ni croissante ni décroissante"], `Le dénominateur augmente, le quotient (positif) diminue.`),
      () => mcq(r, `$u_n = ${k} - \\dfrac{1}{n + 1}$. La suite $(u_n)$ est…`, "croissante", ["décroissante", "constante", "ni croissante ni décroissante"], `$\\frac{1}{n+1}$ diminue, donc on retire de moins en moins : la suite croît vers $${k}$.`),
    ]);
  },
  cards([
    ["Pour montrer qu'une suite est arithmétique, on montre que…", "$u_{n+1} - u_n$ est constant", ["$\\dfrac{u_{n+1}}{u_n}$ est constant", "$u_n$ est positif", "$u_{n+1} > u_n$"], "Cette constante est la raison $r$."],
    ["Pour montrer qu'une suite (non nulle) est géométrique, on montre que…", "$\\dfrac{u_{n+1}}{u_n}$ est constant", ["$u_{n+1} - u_n$ est constant", "$u_n = an + b$", "$u_0 = 1$"], "Cette constante est la raison $q$."],
    ["Une suite géométrique de raison $q$ avec $0 < q < 1$ et $u_0 > 0$ est…", "décroissante", ["croissante", "constante", "alternée"], "On multiplie par un nombre plus petit que 1."],
    ["La représentation graphique d'une suite arithmétique est…", "une suite de points alignés", ["une parabole", "une droite continue", "une hyperbole"], "Les points $(n\\,;\\,u_n)$ sont sur une droite de pente $r$."],
  ]),
  claims([
    ["Une suite de raison $q = -2$ est croissante.", false, "Ses termes changent de signe à chaque rang : elle n'est pas monotone."],
    ["Si $u_n = 3n + 1$, la suite est arithmétique de raison 3.", true, "$u_{n+1} - u_n = 3$."],
    ["Une augmentation de 5 % par an donne une suite arithmétique.", false, "On multiplie par 1,05 : suite géométrique."],
  ]),
];

// ───────────── Dérivation ─────────────

const derivation: Generator[] = [
  (r) => {
    const a = nonZero(r, 4), b = nonZero(r, 5);
    // f(x) = x^2 (a x + b) = a x^3 + b x^2
    return mcq(r, `Dérivée de $f(x) = x^2(${poly([a, b])})$ ?`, `$${poly([3 * a, 2 * b, 0])}$`, [`$${poly([2 * a, 0])}$`, `$${poly([3 * a, b, 0])}$`, `$${poly([a, 2 * b, 0])}$`],
      `On développe : $f(x) = ${poly([a, b, 0, 0])}$, puis $f'(x) = ${poly([3 * a, 2 * b, 0])}$ (ou formule $(uv)' = u'v + uv'$).`);
  },
  (r) => {
    const a = nonZero(r, 4), b = int(r, -6, 6), c = nonZero(r, 5);
    const num = a * c - b;
    if (num === 0) return tf(`$f(x) = \\dfrac{${poly([a, b])}}{${shift(-c)}}$ est constante sur son domaine.`, true, `$f'(x) = \\dfrac{${a} \\times ${par(c)} - ${par(b)}}{(x + ${c})^2} = 0$.`);
    return mcq(r, `Dérivée de $f(x) = \\dfrac{${poly([a, b])}}{${shift(-c)}}$ ?`, `$\\dfrac{${num}}{(${shift(-c)})^2}$`, [`$\\dfrac{${-num}}{(${shift(-c)})^2}$`, `$\\dfrac{${a}}{(${shift(-c)})^2}$`, `$${a}$`],
      `$\\left(\\dfrac uv\\right)' = \\dfrac{u'v - uv'}{v^2}$ : $\\dfrac{${a}(${shift(-c)}) - (${poly([a, b])}) \\times 1}{(${shift(-c)})^2} = \\dfrac{${num}}{(${shift(-c)})^2}$.`);
  },
  (r) => {
    const k = int(r, 1, 6);
    return oneOf(r, [
      () => mcq(r, `$f(x) = \\sqrt{x}$. $f'(${k * k}) = \\;?$`, frac(1, 2 * k), [frac(1, k), frac(1, 2 * k * k), `$${2 * k}$`], `$f'(x) = \\dfrac{1}{2\\sqrt x}$, donc $f'(${k * k}) = \\dfrac{1}{2 \\times ${k}}$.`),
      () => mcq(r, `$f(x) = \\dfrac{1}{x}$. $f'(${k}) = \\;?$`, `$${fracTex(-1, k * k)}$`, [frac(1, k * k), `$${fracTex(-1, k)}$`, `$${fracTex(-1, 2 * k)}$`], `$f'(x) = -\\dfrac{1}{x^2}$.`),
    ]);
  },
  (r) => {
    const a = nonZero(r, 3), b = int(r, -5, 5), c = int(r, -5, 5), x0 = int(r, -3, 3);
    const y0 = a * x0 * x0 + b * x0 + c, m = 2 * a * x0 + b, p = y0 - m * x0;
    const ans = `$y = ${poly([m, p])}$`;
    return mcq(r, `Équation de la tangente à la courbe de $f(x) = ${poly([a, b, c])}$ au point d'abscisse $${x0}$ ?`, ans, [`$y = ${poly([m, y0])}$`, `$y = ${poly([y0, m])}$`, `$y = ${poly([m + 1, p])}$`].filter((w) => w !== ans),
      `$f(${x0}) = ${y0}$ et $f'(${x0}) = ${m}$ : $y = ${m}(${shift(x0)}) + ${par(y0)} = ${poly([m, p])}$.`);
  },
  (r) => {
    const a = int(r, 2, 4), b = nonZero(r, 5), n = pick(r, [2, 3]);
    return mcq(r, `Dérivée de $f(x) = (${poly([a, b])})^{${n}}$ ?`, `$${n * a}(${poly([a, b])})${n - 1 > 1 ? `^{${n - 1}}` : ""}$`, [`$${n}(${poly([a, b])})${n - 1 > 1 ? `^{${n - 1}}` : ""}$`, `$${a}(${poly([a, b])})^{${n}}$`, `$${n * a}x${n - 1 > 1 ? `^{${n - 1}}` : ""}$`],
      `$\\big(g(ax + b)\\big)' = a\\,g'(ax + b)$ avec $g(X) = X^{${n}}$ : $${a} \\times ${n}(${poly([a, b])})${n - 1 > 1 ? `^{${n - 1}}` : ""}$.`);
  },
  (r) => {
    const x1 = int(r, -3, 1), x2 = x1 + int(r, 1, 3), m = nonZero(r, 4), y1 = int(r, -5, 5);
    return numeric(`La tangente à $\\mathcal{C}_f$ au point d'abscisse $a$ passe par $${pt(x1, y1)}$ et $${pt(x2, y1 + m * (x2 - x1))}$. Que vaut $f'(a)$ ?`, m,
      `$f'(a)$ est le coefficient directeur de la tangente : $\\dfrac{${y1 + m * (x2 - x1)} - ${par(y1)}}{${x2} - ${par(x1)}} = ${m}$.`);
  },
  cards([
    ["Le nombre dérivé $f'(a)$ est…", "le coefficient directeur de la tangente en $a$", ["l'ordonnée du point d'abscisse $a$", "la valeur maximale de $f$", "l'aire sous la courbe"], "C'est la pente de la courbe au point d'abscisse $a$."],
    ["Si la tangente en $a$ est horizontale, alors…", "$f'(a) = 0$", ["$f(a) = 0$", "$f'(a) = 1$", "$f$ n'est pas dérivable en $a$"], "Une droite horizontale a une pente nulle."],
    ["La fonction racine carrée n'est pas dérivable en…", "$0$", ["$1$", "aucun point", "tout réel négatif seulement"], "Sa tangente en 0 est verticale."],
    ["$(u \\times v)' = \\;?$", "$u'v + uv'$", ["$u'v'$", "$u'v - uv'$", "$\\dfrac{u'}{v'}$"], "Formule de dérivation d'un produit."],
  ]),
];

// ───────────── Variations et optimisation ─────────────

const variations: Generator[] = [
  (r) => {
    const a = int(r, -5, 1), b = a + int(r, 2, 6);
    return mcq(r, `$f'(x) = ${fac(a)}${fac(b)}$. Sur quel intervalle $f$ est-elle décroissante ?`, `$[${a}\\,;\\,${b}]$`, [`$]-\\infty\\,;\\,${a}]$`, `$[${b}\\,;\\,+\\infty[$`, `$[${-b}\\,;\\,${-a}]$`],
      `$f'$ est un produit négatif entre ses racines $${a}$ et $${b}$ : $f$ y décroît.`);
  },
  (r) => {
    const k = nonZero(r, 3);
    // f(x) = x^3 - 3k x^2 : f' = 3x(x - 2k), extrema en 0 et 2k ; f(0) = 0, f(2k) = -4k^3
    const lo = Math.min(0, 2 * k), hi = Math.max(0, 2 * k);
    return oneOf(r, [
      () => numeric(`$f(x) = ${poly([1, -3 * k, 0, 0])}$. Valeur du minimum local de $f$ ?`, -4 * k ** 3 < 0 ? -4 * k ** 3 : 0,
        `$f'(x) = 3x(x - ${par(2 * k)})$ s'annule en $${lo}$ et $${hi}$. $f'$ passe de $-$ à $+$ en $${hi}$ : minimum local $f(${hi}) = ${hi === 0 ? 0 : -4 * k ** 3}$.`),
      () => numeric(`$f(x) = ${poly([1, -3 * k, 0, 0])}$. En quelle valeur de $x$ $f$ admet-elle un maximum local ?`, lo, `$f'(x) = 3x(x - ${par(2 * k)})$ : positive avant $${lo}$, négative entre $${lo}$ et $${hi}$. Maximum local en $x = ${lo}$.`),
    ]);
  },
  (r) => {
    const p = pick(r, [20, 24, 28, 32, 40]);
    return oneOf(r, [
      () => numeric(`Parmi tous les rectangles de périmètre $${p}$ cm, quelle est l'aire maximale (cm²) ?`, (p / 4) ** 2, `Côtés $x$ et $${p / 2} - x$ : $A(x) = x(${p / 2} - x)$, maximale pour $x = ${p / 4}$ (carré) : $${(p / 4) ** 2}$ cm².`, "cm²"),
      () => numeric(`Bénéfice $B(x) = -x^2 + ${p}x - ${p * 2}$ (en milliers d'euros, $x$ en tonnes). Pour quelle production le bénéfice est-il maximal ?`, p / 2, `$B'(x) = -2x + ${p}$ s'annule en $x = ${p / 2}$, et $B'$ passe de $+$ à $-$ : maximum.`),
    ]);
  },
  (r) => {
    const a = pick(r, [1, 2, 3]), b = int(r, -4, 4);
    return mcq(r, `$f(x) = ${poly([a, b, 0])}$ sur $\\mathbb{R}$. $f'(x) = \\;?$ et le sens de variation ?`.replace("+ 0x", "").replace("- 0x", ""), `$f'(x) = ${poly([2 * a, b])}$, décroissante puis croissante`,
      [`$f'(x) = ${poly([2 * a, b])}$, croissante puis décroissante`, `$f'(x) = ${poly([a, b])}$, croissante sur $\\mathbb{R}$`, `$f'(x) = ${2 * a}x$, croissante sur $\\mathbb{R}$`],
      `$f'$ est affine de coefficient $${2 * a} > 0$ : négative puis positive.`);
  },
  claims([
    ["Si $f'(x) > 0$ sur un intervalle, $f$ y est strictement croissante.", true, "Théorème du signe de la dérivée."],
    ["Si $f'(a) = 0$, $f$ admet forcément un extremum en $a$.", false, "Contre-exemple : $x^3$ en 0 ($f'$ ne change pas de signe)."],
    ["Un maximum local est forcément le maximum sur tout $\\mathbb{R}$.", false, "« Local » : seulement au voisinage du point."],
    ["Pour dresser un tableau de variations, on étudie le signe de $f'$.", true, "Signe de $f'$ ⇒ sens de variation de $f$."],
  ]),
];

// ───────────── Exponentielle ─────────────

const exponentielle: Generator[] = [
  (r) => {
    const a = int(r, 2, 5), b = int(r, 1, 4);
    return oneOf(r, [
      () => mcq(r, `Simplifie $e^{${a}x} \\times e^{-${b}x}$.`, `$e^{${a - b === 1 ? "" : a - b}x}$`.replace("{0x}", "{0}"), [`$e^{-${a * b}x^2}$`, `$e^{${a + b}x}$`, `$${a - b}e^{x}$`], "On additionne les exposants."),
      () => mcq(r, `Simplifie $\\left(e^{x}\\right)^{${a}} \\times e^{${b}}$.`, `$e^{${a}x + ${b}}$`, [`$e^{${a}x \\times ${b}}$`, `$e^{x^{${a}} + ${b}}$`, `$${a}e^{x + ${b}}$`], "$(e^x)^n = e^{nx}$, puis on additionne les exposants."),
    ]);
  },
  (r) => {
    const a = int(r, -5, 5), b = nonZero(r, 3);
    return oneOf(r, [
      () => mcq(r, `Solutions de $e^{x} > e^{${a}}$ ?`, `$]${a}\\,;\\,+\\infty[$`, [`$]-\\infty\\,;\\,${a}[$`, `$]${Math.exp(a) > 100 ? a + 1 : -a}\\,;\\,+\\infty[$`, "$\\mathbb{R}$"].filter((w) => w !== `$]${a}\\,;\\,+\\infty[$`), "$\\exp$ est strictement croissante : $e^x > e^a \\iff x > a$."),
      () => mcq(r, `Solutions de $e^{${b}x} \\leq 1$ ?`, b > 0 ? "$]-\\infty\\,;\\,0]$" : "$[0\\,;\\,+\\infty[$", [b > 0 ? "$[0\\,;\\,+\\infty[$" : "$]-\\infty\\,;\\,0]$", "$\\emptyset$", "$\\mathbb{R}$"], `$1 = e^0$, donc $${b}x \\leq 0$${b < 0 ? " (on divise par un négatif : le sens change)" : ""}.`),
      () => mcq(r, "Solutions de $e^{x} = -1$ ?", "aucune solution", ["$x = 0$", "$x = -1$", "$x = 1$"], "Une exponentielle est toujours strictement positive."),
    ]);
  },
  (r) => {
    const k = nonZero(r, 4);
    return oneOf(r, [
      () => numeric(`$f(x) = (x ${k < 0 ? "-" : "+"} ${Math.abs(k)})e^{x}$. En quelle valeur de $x$ $f$ admet-elle son minimum ?`, -k - 1, `$f'(x) = e^x + (x + ${par(k)})e^x = (x + ${par(k + 1)})e^x$, du signe de $x + ${par(k + 1)}$ : minimum en $x = ${-k - 1}$.`),
      () => mcq(r, `$f(x) = x e^{${k}x}$. $f'(x) = \\;?$`, `$(1 ${k < 0 ? "-" : "+"} ${Math.abs(k) === 1 ? "" : Math.abs(k)}x)e^{${k}x}$`, [`$${k}e^{${k}x}$`, `$e^{${k}x}$`, `$(x + ${par(k)})e^{${k}x}$`], `$(uv)' = u'v + uv'$ avec $u = x$ et $v = e^{${k}x}$, $v' = ${k}e^{${k}x}$.`),
    ]);
  },
  (r) => {
    const n0 = pick(r, [100, 200, 500, 1000]), k = pick(r, [0.1, 0.2, 0.5]);
    return oneOf(r, [
      () => numeric(`La masse d'un médicament dans le sang est $m(t) = ${n0}e^{-${tex(k)}t}$ (mg, $t$ en heures). Masse injectée au départ ?`, n0, `$m(0) = ${n0} \\times e^0 = ${n0}$ mg.`, "mg"),
      () => mcq(r, `$m(t) = ${n0}e^{-${tex(k)}t}$. La masse…`, "diminue au cours du temps", ["augmente au cours du temps", "reste constante", "devient négative"], `$m'(t) = -${tex(k * n0)}e^{-${tex(k)}t} < 0$.`),
    ]);
  },
  claims([
    ["$e^{a} + e^{b} = e^{a + b}$.", false, "C'est le produit qui vaut $e^{a+b}$."],
    ["$(e^{x})^2 = e^{2x}$.", true, "$(e^x)^n = e^{nx}$."],
    ["La courbe de $\\exp$ passe par le point $(0\\,;\\,1)$.", true, "$e^0 = 1$."],
    ["$e^{-x}$ est négatif quand $x$ est positif.", false, "$e^{-x} = \\frac{1}{e^x} > 0$ toujours."],
    ["La suite $u_n = e^{n}$ est géométrique de raison $e$.", true, "$u_{n+1} = e^{n+1} = e \\times e^{n}$."],
  ]),
];

// ───────────── Trigonométrie ─────────────

const trigo: Generator[] = [
  (r) =>
    oneOf(r, [
      () => mcq(r, "$\\cos(\\pi - x) = \\;?$", "$-\\cos x$", ["$\\cos x$", "$\\sin x$", "$-\\sin x$"], "Symétrie par rapport à l'axe des ordonnées : l'abscisse change de signe."),
      () => mcq(r, "$\\sin(\\pi + x) = \\;?$", "$-\\sin x$", ["$\\sin x$", "$\\cos x$", "$-\\cos x$"], "Symétrie par rapport à l'origine : les deux coordonnées changent de signe."),
      () => mcq(r, "$\\cos\\left(\\dfrac{\\pi}{2} - x\\right) = \\;?$", "$\\sin x$", ["$\\cos x$", "$-\\sin x$", "$-\\cos x$"], "Symétrie par rapport à la droite $y = x$ : on échange cosinus et sinus."),
      () => mcq(r, "$\\sin(-x) = \\;?$", "$-\\sin x$", ["$\\sin x$", "$\\cos x$", "$-\\cos x$"], "Le sinus est impair."),
      () => mcq(r, "$\\cos(x + 2\\pi) = \\;?$", "$\\cos x$", ["$-\\cos x$", "$\\sin x$", "$\\cos x + 2\\pi$"], "Un tour complet ramène au même point."),
    ]),
  (r) =>
    oneOf(r, [
      () => mcq(r, "Solutions de $\\cos x = \\dfrac12$ sur $[0\\,;\\,2\\pi[$ ?", "$\\left\\{\\dfrac{\\pi}{3}\\,;\\,\\dfrac{5\\pi}{3}\\right\\}$", ["$\\left\\{\\dfrac{\\pi}{3}\\,;\\,\\dfrac{2\\pi}{3}\\right\\}$", "$\\left\\{\\dfrac{\\pi}{6}\\,;\\,\\dfrac{5\\pi}{6}\\right\\}$", "$\\left\\{\\dfrac{\\pi}{3}\\right\\}$"], "Deux points du cercle ont pour abscisse $\\frac12$ : symétriques par rapport à l'axe horizontal."),
      () => mcq(r, "Solutions de $\\sin x = \\dfrac12$ sur $[0\\,;\\,2\\pi[$ ?", "$\\left\\{\\dfrac{\\pi}{6}\\,;\\,\\dfrac{5\\pi}{6}\\right\\}$", ["$\\left\\{\\dfrac{\\pi}{6}\\,;\\,\\dfrac{11\\pi}{6}\\right\\}$", "$\\left\\{\\dfrac{\\pi}{3}\\,;\\,\\dfrac{2\\pi}{3}\\right\\}$", "$\\left\\{\\dfrac{\\pi}{6}\\right\\}$"], "Deux points du cercle ont pour ordonnée $\\frac12$ : symétriques par rapport à l'axe vertical."),
      () => numeric("Nombre de solutions de $\\sin x = 0$ sur $[0\\,;\\,2\\pi[$ ?", 2, "$x = 0$ et $x = \\pi$."),
      () => numeric("Nombre de solutions de $\\cos x = 2$ sur $\\mathbb{R}$ ?", 0, "Un cosinus est toujours entre $-1$ et $1$."),
    ]),
  (r) =>
    oneOf(r, [
      () => numeric("$\\cos\\dfrac{\\pi}{3} + \\sin\\dfrac{\\pi}{6} = \\;?$", 1, "$\\frac12 + \\frac12 = 1$."),
      () => numeric("$\\cos^2\\dfrac{\\pi}{7} + \\sin^2\\dfrac{\\pi}{7} = \\;?$", 1, "$\\cos^2 x + \\sin^2 x = 1$ pour tout $x$."),
      () => numeric("$\\cos \\pi + \\sin\\dfrac{\\pi}{2} = \\;?$", 0, "$-1 + 1 = 0$."),
      () => mcq(r, "$\\cos\\dfrac{2\\pi}{3}$ est…", "négatif", ["positif", "nul", "supérieur à 1"], "$\\frac{2\\pi}{3}$ est dans le deuxième quart du cercle (à gauche) : abscisse négative, $-\\frac12$."),
      () => mcq(r, "$\\sin\\dfrac{7\\pi}{6} = \\;?$", "$-\\dfrac12$", ["$\\dfrac12$", "$-\\dfrac{\\sqrt3}{2}$", "$\\dfrac{\\sqrt3}{2}$"], "$\\frac{7\\pi}{6} = \\pi + \\frac{\\pi}{6}$ et $\\sin(\\pi + x) = -\\sin x$."),
    ]),
  (r) => {
    const rad = int(r, 2, 9);
    const [ang, num, den] = pick(r, [["\\dfrac{\\pi}{2}", 1, 2], ["\\pi", 1, 1], ["\\dfrac{\\pi}{3}", 1, 3], ["2\\pi", 2, 1], ["\\dfrac{\\pi}{4}", 1, 4]] as const);
    const k = (rad * num) / den;
    const ans = `$${Number.isInteger(k) ? (k === 1 ? "" : k) : fracTex(rad * num, den)}\\pi$`;
    return mcq(r, `Longueur d'un arc de cercle de rayon $${rad}$ cm et d'angle $${ang}$ rad ?`, `${ans} cm`, [`$${rad}$ cm`, `$${tex((rad * num * 180) / den)}$ cm`, `$${2 * rad}\\pi$ cm`].filter((w) => w !== `${ans} cm`),
      `Longueur = rayon × angle en radians = $${rad} \\times ${ang}$.`);
  },
  cards([
    ["Sur le cercle trigonométrique, le cosinus se lit sur…", "l'axe des abscisses", ["l'axe des ordonnées", "la tangente", "le rayon"], "Le point associé à $x$ a pour coordonnées $(\\cos x\\,;\\,\\sin x)$."],
    ["Le rayon du cercle trigonométrique vaut…", "$1$", ["$\\pi$", "$2\\pi$", "$\\frac12$"], "D'où $\\cos^2 x + \\sin^2 x = 1$."],
    ["La fonction cosinus est…", "paire et $2\\pi$-périodique", ["impaire et $\\pi$-périodique", "paire et $\\pi$-périodique", "impaire et $2\\pi$-périodique"], "$\\cos(-x) = \\cos x$ et $\\cos(x + 2\\pi) = \\cos x$."],
    ["Un angle de $1$ radian correspond à environ…", "$57°$", ["$1°$", "$90°$", "$3{,}14°$"], "$\\frac{180}{\\pi} \\approx 57{,}3$."],
  ]),
];

// ───────────── Produit scalaire ─────────────

const produitScalaire: Generator[] = [
  (r) => {
    const ab = int(r, 2, 9), ah = int(r, 1, 9), same = r() < 0.6;
    return numeric(`$H$ est le projeté orthogonal de $C$ sur $(AB)$, avec $AB = ${ab}$ et $AH = ${ah}$, $H$ ${same ? "du même côté que $B$" : "du côté opposé à $B$"} par rapport à $A$. $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = \\;?$`, same ? ab * ah : -ab * ah,
      `$\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = \\overrightarrow{AB} \\cdot \\overrightarrow{AH} = ${same ? "" : "-"}AB \\times AH = ${same ? ab * ah : -ab * ah}$.`);
  },
  (r) => {
    const [bc, ab, ac, ang] = pick(r, [[7, 5, 8, 60], [7, 3, 5, 120], [7, 3, 8, 60], [13, 7, 8, 120], [7, 8, 5, 60]] as const);
    return numeric(`Triangle $ABC$ avec $AB = ${ab}$, $AC = ${ac}$ et $BC = ${bc}$. Mesure de l'angle $\\widehat{A}$ en degrés ?`, ang,
      `Al-Kashi : $\\cos\\widehat A = \\dfrac{AB^2 + AC^2 - BC^2}{2 \\times AB \\times AC} = \\dfrac{${ab * ab} + ${ac * ac} - ${bc * bc}}{${2 * ab * ac}} = ${ang === 60 ? "\\dfrac12" : "-\\dfrac12"}$.`, "°");
  },
  (r) => {
    const a = nonZero(r, 4), c = nonZero(r, 4), d = pick(r, [1, 2, -1, -2, 3]);
    if ((a * c) % d !== 0) return tf(`$\\vec u${pt(a, 0)}$ et $\\vec v${pt(0, c)}$ sont orthogonaux.`, true, "$a \\times 0 + 0 \\times c = 0$.");
    const m = -(a * c) / d;
    return numeric(`$\\vec u(${a}\\,;\\,m)$ et $\\vec v${pt(c, d)}$. Valeur de $m$ pour que $\\vec u \\perp \\vec v$ ?`, m, `$\\vec u \\cdot \\vec v = ${a} \\times ${par(c)} + m \\times ${par(d)} = 0 \\iff m = ${m}$.`);
  },
  (r) => {
    const u = int(r, 1, 6), v = int(r, 1, 6), p = nonZero(r, 8);
    return oneOf(r, [
      () => numeric(`$\\|\\vec u\\| = ${u}$, $\\|\\vec v\\| = ${v}$ et $\\vec u \\cdot \\vec v = ${p}$. $\\|\\vec u + \\vec v\\|^2 = \\;?$`, u * u + 2 * p + v * v, `$\\|\\vec u + \\vec v\\|^2 = \\|\\vec u\\|^2 + 2\\,\\vec u \\cdot \\vec v + \\|\\vec v\\|^2 = ${u * u} + ${par(2 * p)} + ${v * v}$.`),
      () => numeric(`$\\|\\vec u\\| = ${u}$, $\\|\\vec v\\| = ${v}$ et $\\vec u \\cdot \\vec v = ${p}$. $\\|\\vec u - \\vec v\\|^2 = \\;?$`, u * u - 2 * p + v * v, `$\\|\\vec u - \\vec v\\|^2 = \\|\\vec u\\|^2 - 2\\,\\vec u \\cdot \\vec v + \\|\\vec v\\|^2$.`),
      () => numeric(`$\\vec u \\cdot \\vec v = ${p}$. $(${3}\\vec u) \\cdot (-2\\vec v) = \\;?$`, -6 * p, "Le produit scalaire est bilinéaire : $3 \\times (-2) \\times \\vec u \\cdot \\vec v$."),
    ]);
  },
  (r) => {
    const a = int(r, -4, 4), b = int(r, -4, 4), rr = int(r, 1, 6);
    const sq = (c: number, v: string) => (c === 0 ? `${v}^2` : `(${shift(c, v)})^2`);
    return mcq(r, `Équation du cercle de centre $\\Omega${pt(a, b)}$ et de rayon $${rr}$ ?`, `$${sq(a, "x")} + ${sq(b, "y")} = ${rr * rr}$`,
      [`$${sq(a, "x")} + ${sq(b, "y")} = ${rr}$`, `$${sq(-a, "x")} + ${sq(-b, "y")} = ${rr * rr}$`, `$${sq(b, "x")} + ${sq(a, "y")} = ${rr * rr}$`],
      `$M(x\\,;\\,y)$ est sur le cercle $\\iff \\Omega M^2 = r^2$.`);
  },
  cards([
    ["L'ensemble des points $M$ tels que $\\overrightarrow{MA} \\cdot \\overrightarrow{MB} = 0$ est…", "le cercle de diamètre $[AB]$", ["la médiatrice de $[AB]$", "la droite $(AB)$", "le point milieu de $[AB]$"], "L'angle $\\widehat{AMB}$ est droit."],
    ["Si $\\vec u \\cdot \\vec v < 0$, l'angle entre $\\vec u$ et $\\vec v$ est…", "obtus", ["aigu", "droit", "nul"], "$\\cos\\theta < 0$."],
    ["$\\vec u \\cdot \\vec u = \\;?$", "$\\|\\vec u\\|^2$", ["$0$", "$1$", "$2\\|\\vec u\\|$"], "Le carré scalaire est le carré de la norme."],
    ["Un vecteur normal à une droite est…", "orthogonal à un vecteur directeur", ["colinéaire à un vecteur directeur", "de norme 1", "nul"], "Pour $ax + by + c = 0$, $\\vec n(a\\,;\\,b)$."],
  ]),
];

// ───────────── Probabilités conditionnelles ─────────────

const probasCond: Generator[] = [
  (r) => {
    const pm = pick(r, [0.01, 0.02, 0.05, 0.1]), se = pick(r, [0.9, 0.95, 0.99]), fp = pick(r, [0.02, 0.05, 0.1]);
    const pt_ = pm * se + (1 - pm) * fp;
    return numeric(`Une maladie touche $${tex(pm * 100)}\\,\\%$ de la population. Le test est positif chez $${tex(se * 100)}\\,\\%$ des malades et chez $${tex(fp * 100)}\\,\\%$ des non-malades. Probabilité qu'une personne testée positive soit malade (arrondie au centième) ?`,
      Math.round(((pm * se) / pt_) * 100) / 100,
      `$P(T) = ${tex(pm)} \\times ${tex(se)} + ${tex(1 - pm)} \\times ${tex(fp)} = ${tex(pt_, 4)}$, puis $P_T(M) = \\dfrac{${tex(pm * se, 4)}}{${tex(pt_, 4)}} \\approx ${tex((pm * se) / pt_, 2)}$.`, undefined, 0.011);
  },
  (r) => {
    const pa = pick(r, [0.2, 0.4, 0.5, 0.6]), pb = pick(r, [0.3, 0.5, 0.7]), indep = r() < 0.5;
    const pab = indep ? pa * pb : pa * pb + pick(r, [0.04, -0.04, 0.1]);
    return tf(`$P(A) = ${tex(pa)}$, $P(B) = ${tex(pb)}$ et $P(A \\cap B) = ${tex(pab)}$. Les événements $A$ et $B$ sont indépendants.`, indep,
      `$P(A) \\times P(B) = ${tex(pa * pb)}$${indep ? " = " : " ≠ "}$P(A \\cap B)$.`);
  },
  (r) => {
    const p = pick(r, [0.1, 0.2, 0.3, 0.5]), n = pick(r, [2, 3]);
    return numeric(`On répète $${n}$ fois, de façon indépendante, une épreuve qui réussit avec probabilité $${tex(p)}$. Probabilité d'au moins une réussite ?`, 1 - (1 - p) ** n,
      `$1 - P(\\text{aucune réussite}) = 1 - ${tex(1 - p)}^{${n}} = ${tex(1 - (1 - p) ** n)}$.`, undefined, 0.001);
  },
  (r) => {
    const a = int(r, 20, 40), b = int(r, 20, 40), ab = int(r, 5, Math.min(a, b) - 5);
    const table = `| | Sport | Pas de sport | Total |\n|---|---|---|---|\n| Seconde | ${ab} | ${a - ab} | ${a} |\n| Première | ${b - ab} | ${100 - a - b + ab} | ${100 - a} |\n| Total | ${b} | ${100 - b} | 100 |`;
    return oneOf(r, [
      () => numeric(`${table}\n\nOn choisit un élève qui fait du sport. Probabilité qu'il soit en seconde (arrondie au centième) ?`, Math.round((ab / b) * 100) / 100, `$P_{\\text{Sport}}(\\text{Seconde}) = \\dfrac{${ab}}{${b}} \\approx ${tex(ab / b, 2)}$.`, undefined, 0.011),
      () => numeric(`${table}\n\nOn choisit un élève de seconde. Probabilité qu'il fasse du sport (arrondie au centième) ?`, Math.round((ab / a) * 100) / 100, `$P_{\\text{Seconde}}(\\text{Sport}) = \\dfrac{${ab}}{${a}} \\approx ${tex(ab / a, 2)}$ : on se restreint à la ligne « Seconde ».`, undefined, 0.011),
    ]);
  },
  cards([
    ["La formule des probabilités totales sert à calculer…", "la probabilité d'un événement atteint par plusieurs chemins de l'arbre", ["une probabilité conditionnelle inversée uniquement", "une espérance", "un nombre de chemins"], "$P(B) = P(A \\cap B) + P(\\overline A \\cap B)$."],
    ["Dans un arbre pondéré, la probabilité inscrite sur une branche du second niveau est…", "une probabilité conditionnelle", ["une probabilité d'intersection", "toujours $\\frac12$", "une espérance"], "Par exemple $P_A(B)$."],
    ["$A$ et $B$ sont indépendants si…", "$P(A \\cap B) = P(A) \\times P(B)$", ["$P(A \\cap B) = 0$", "$P(A) = P(B)$", "$P(A \\cup B) = 1$"], "Savoir que $A$ est réalisé ne change pas la probabilité de $B$."],
  ]),
];

// ───────────── Variables aléatoires ─────────────

const va: Generator[] = [
  (r) => {
    const ps = pick(r, [[0.1, 0.3, 0.2], [0.25, 0.25, 0.1], [0.2, 0.2, 0.2], [0.15, 0.35, 0.3]]);
    const miss = Math.round((1 - ps.reduce((s, x) => s + x, 0)) * 100) / 100;
    const xs = [-2, 0, 1, 3];
    const table = `| $x_i$ | ${xs.join(" | ")} |\n|---|---|---|---|---|\n| $P(X = x_i)$ | ${ps.map((p) => tex(p)).join(" | ")} | $p$ |`;
    return oneOf(r, [
      () => numeric(`Loi de $X$ :\n\n${table}\n\nValeur de $p$ ?`, miss, `La somme des probabilités vaut 1 : $p = 1 - ${tex(ps.reduce((s, x) => s + x, 0))} = ${tex(miss)}$.`, undefined, 0.001),
      () => numeric(`Loi de $X$ :\n\n${table}\n\nAvec $p$ tel que la somme vaille 1, calcule $P(X \\geq 1)$.`, ps[2] + miss, `$P(X = 1) + P(X = 3) = ${tex(ps[2])} + ${tex(miss)}$.`, undefined, 0.001),
      () => numeric(`Loi de $X$ :\n\n${table}\n\nAvec $p$ tel que la somme vaille 1, calcule $E(X)$.`, -2 * ps[0] + ps[2] + 3 * miss,
        `$E(X) = -2 \\times ${tex(ps[0])} + 0 + 1 \\times ${tex(ps[2])} + 3 \\times ${tex(miss)} = ${tex(-2 * ps[0] + ps[2] + 3 * miss)}$.`, undefined, 0.001),
    ]);
  },
  (r) => {
    const mise = pick(r, [1, 2, 5]), pw = pick(r, [0.1, 0.2, 0.25, 0.5]);
    const gain = mise / pw;
    return numeric(`On mise $${mise}$ € ; avec probabilité $${tex(pw)}$ on reçoit $G$ €, sinon rien. Quelle valeur de $G$ rend le jeu équitable ?`, gain,
      `Gain algébrique : $G - ${mise}$ avec prob. $${tex(pw)}$, $-${mise}$ sinon. $E = ${tex(pw)}G - ${mise} = 0 \\iff G = ${tex(gain)}$ €.`, "€");
  },
  (r) => {
    const x = [0, 2], p = pick(r, [0.5, 0.25, 0.75]);
    const e = 2 * (1 - p), v = 4 * (1 - p) - e * e;
    return numeric(`$P(X = 0) = ${tex(p)}$ et $P(X = 2) = ${tex(1 - p)}$. Variance $V(X)$ ?`, v,
      `$E(X) = ${tex(e)}$, $E(X^2) = 4 \\times ${tex(1 - p)} = ${tex(4 * (1 - p))}$, donc $V(X) = ${tex(4 * (1 - p))} - ${tex(e)}^2 = ${tex(v)}$. (Valeurs : $${x.join(", ")}$.)`, undefined, 0.001);
  },
  cards([
    ["L'espérance d'une variable aléatoire s'interprète comme…", "la moyenne des valeurs obtenues sur un grand nombre de répétitions", ["la valeur la plus probable", "la valeur maximale", "la dispersion des valeurs"], "C'est une moyenne pondérée par les probabilités."],
    ["Un jeu est favorable au joueur si l'espérance de son gain est…", "strictement positive", ["nulle", "négative", "égale à la mise"], "En moyenne, il gagne de l'argent."],
    ["Si on ajoute 5 à toutes les valeurs de $X$, la variance…", "ne change pas", ["augmente de 5", "est multipliée par 5", "augmente de 25"], "$V(X + b) = V(X)$."],
  ]),
];

export const MATHS_PREMIERE_PLUS: Record<string, Generator[]> = {
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
