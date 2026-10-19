/**
 * Mathématiques — ajouts des programmes 2026 (BO n° 14 du 2 avril 2026) :
 * probabilités conditionnelles et tableaux croisés dès la Seconde, statistiques
 * avec regroupement en classes, et « automatismes » (QCM sans calculatrice,
 * partie de l'épreuve anticipée de mathématiques de fin de Première).
 */
import { MATHS_PREMIERE } from "./maths-premiere";
import { MATHS_SECONDE } from "./maths-seconde";
import { type Generator, claims, frac, fracTex, int, mcq, nonZero, numeric, oneOf, par, pick, poly, tex, texMcq } from "./kit";

// ───────────── Seconde : probabilités conditionnelles, tableaux croisés ─────────────

const crossTable = (r: () => number) => {
  const a = int(r, 5, 40), b = int(r, 5, 40), c = int(r, 5, 40), d = int(r, 5, 40);
  return { a, b, c, d, total: a + b + c + d };
};

const probasCond2: Generator[] = [
  (r) => {
    const { a, b, c, d, total } = crossTable(r);
    // Libellés : groupe (pluriel), caractère « oui », caractère « non ».
    const [row1, row2, col1, col2] = pick(r, [
      ["filles", "garçons", "sportifs", "non sportifs"],
      ["élèves de Seconde", "élèves de Première", "demi-pensionnaires", "externes"],
      ["fumeurs", "non-fumeurs", "malades", "non malades"],
      ["vaccinés", "non vaccinés", "infectés", "non infectés"],
    ] as const);
    const table = `| | ${col1} | ${col2} |\n|---|---|---|\n| **${row1}** | ${a} | ${b} |\n| **${row2}** | ${c} | ${d} |`;
    // Complément : des fréquences sur l'effectif total, toujours irréductibles (perturb donnerait 40/108).
    const fill = () => frac(int(r, 5, total - 5), total);
    return oneOf(r, [
      () => mcq(r, `${table}\n\nOn choisit une personne au hasard. Probabilité qu'elle fasse partie des ${row1} **et** des ${col1} ?`, frac(a, total), [frac(a, a + b), frac(a, a + c), frac(a + b, total), frac(a + c, total)], `$\\dfrac{${a}}{${total}}$ : effectif de la case sur l'effectif total.`, fill),
      () => mcq(r, `${table}\n\nParmi les ${row1}, quelle est la proportion de ${col1} ?`, frac(a, a + b), [frac(a, total), frac(a, a + c), frac(b, a + b), frac(a + b, total), frac(a + c, total)], `Fréquence conditionnelle : on se restreint à la ligne des ${row1}, $\\dfrac{${a}}{${a} + ${b}} = ${fracTex(a, a + b)}$.`, fill),
      () => mcq(r, `${table}\n\nParmi les ${col1}, quelle est la proportion de ${row2} ?`, frac(c, a + c), [frac(c, c + d), frac(c, total), frac(a, a + c), frac(c + d, total), frac(a + c, total)], `On se restreint à la colonne des ${col1} : $\\dfrac{${c}}{${a} + ${c}} = ${fracTex(c, a + c)}$.`, fill),
      () => mcq(r, `${table}\n\nOn choisit une personne au hasard. Probabilité qu'elle fasse partie des ${row1} **ou** des ${col1} ?`, frac(a + b + c, total), [...(2 * a + b + c < total ? [frac(2 * a + b + c, total)] : []), frac(b + c, total), frac(a, total), frac(a + b, total), frac(a + c, total)], `$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = \\dfrac{${a + b} + ${a + c} - ${a}}{${total}}$ : on ne compte pas deux fois la case commune.`, fill),
    ]);
  },
  ...MATHS_PREMIERE["maths-1-probas-cond"].slice(0, 4),
  claims([
    ["Dans un arbre pondéré, on multiplie les probabilités le long d'un chemin.", true, "On obtient la probabilité de l'intersection."],
    ["$P_A(B)$ se lit « probabilité de B sachant A ».", true, "Probabilité conditionnelle."],
    ["Une fréquence conditionnelle se calcule en divisant par l'effectif total.", false, "On divise par l'effectif de la sous-population (la ligne ou la colonne)."],
  ]),
];

// ───────────── Statistiques : regroupement en classes ─────────────

const statsClasses: Generator = (r) => {
  const w = pick(r, [2, 4, 5, 10]), start = int(r, 0, 4) * w;
  const counts = [int(r, 1, 9), int(r, 1, 9), int(r, 1, 9)];
  const centers = counts.map((_, i) => start + w * i + w / 2);
  const n = counts.reduce((s, x) => s + x, 0), sum = centers.reduce((s, c, i) => s + c * counts[i], 0);
  const classes = counts.map((k, i) => `$[${start + w * i}\\,;\\,${start + w * (i + 1)}[$ : ${k}`).join(" · ");
  return numeric(`Série regroupée en classes (effectifs) — ${classes}. Moyenne estimée avec les centres des classes (au centième) ?`, Math.round((sum / n) * 100) / 100, `Centres : $${centers.map((c) => tex(c)).join("\\,;\\,")}$. Moyenne $= \\dfrac{${sum}}{${n}}$.`, undefined, 0.011);
};

// ───────────── Automatismes (sans calculatrice) ─────────────

const autoCommon: Generator[] = [
  (r) => {
    const t1 = pick(r, [10, 20, 25, 50]), t2 = pick(r, [10, 20, 25, 50]), up1 = r() < 0.5, up2 = r() < 0.5;
    const c = (1 + (up1 ? t1 : -t1) / 100) * (1 + (up2 ? t2 : -t2) / 100);
    // Arrondi au centième : deux baisses de 25 % donnent -43,75 %, pas -43,7 %.
    const evo = Math.round((c - 1) * 10000) / 100;
    return texMcq(r, `Une ${up1 ? "hausse" : "baisse"} de $${t1}\\,\\%$ puis une ${up2 ? "hausse" : "baisse"} de $${t2}\\,\\%$ correspondent à une évolution globale de (en %) :`, evo, [(up1 ? t1 : -t1) + (up2 ? t2 : -t2), 0, evo + 2], `On multiplie les coefficients : $${tex(1 + (up1 ? t1 : -t1) / 100)} \\times ${tex(1 + (up2 ? t2 : -t2) / 100)} = ${tex(c, 4)}$.`, "%");
  },
  (r) => {
    const [p1, p2] = [pick(r, [10, 20, 25, 40, 50, 60, 75]), pick(r, [10, 20, 25, 40, 50, 80])];
    // Leurres : des pourcentages possibles (strictement entre 0 et 100), pas « 0 % » ni « 160 % ».
    const typical = [p1 + p2, Math.abs(p1 - p2), (p1 * p2) / 10, p1, p2 / 2].filter((v) => v > 0 && v < 100);
    return texMcq(r, `$${p2}\\,\\%$ des élèves d'un lycée sont en Seconde, et $${p1}\\,\\%$ d'entre eux font du latin. Part des élèves du lycée en Seconde qui font du latin (en %) ?`, (p1 * p2) / 100, typical, `Proportion de proportion : $${tex(p1 / 100)} \\times ${tex(p2 / 100)} = ${tex((p1 * p2) / 10000)}$.`, "%");
  },
  (r) => {
    const k = pick(r, [1.25, 0.8, 2, 0.5, 1.6, 0.625, 0.4, 2.5]);
    const t = Math.round((1 / k - 1) * 10000) / 100;
    // Leurres toujours positifs (un coefficient multiplicateur l'est) : évolution opposée 2 - k, k lui-même, k ∓ 1, puis des voisins de 1/k.
    const ans = Math.round((1 / k) * 1000) / 1000, show = (v: number) => `$${tex(v)}$`;
    return mcq(r, `Un prix est multiplié par $${tex(k)}$. Par combien faut-il le multiplier pour revenir au prix initial ?`, show(ans), [2 - k, k, k > 1 ? k - 1 : 1 + k].filter((v) => v > 0).map(show),
      `Coefficient réciproque : $\\dfrac{1}{${tex(k)}} = ${tex(1 / k)}$ (soit une évolution de $${tex(t)}\\,\\%$).`, () => show(Math.round(ans * pick(r, [0.6, 0.75, 0.8, 1.2, 1.25, 1.5]) * 1000) / 1000));
  },
  (r) => {
    // a non multiple de 3 : sinon a/3 est un entier et le calcul de fractions disparaît.
    // b premier avec 6 : b/6 reste irréductible, il faut vraiment passer au dénominateur commun 6.
    const a0 = nonZero(r, 9), a = a0 % 3 === 0 ? a0 + (a0 > 0 ? 1 : -1) : a0, b = pick(r, [-7, -5, -1, 1, 5, 7]);
    const fill = () => frac(nonZero(r, 20), pick(r, [2, 3, 6, 9]));
    return oneOf(r, [
      () => mcq(r, `$${fracTex(a, 3)} + ${b < 0 ? `\\left(${fracTex(b, 6)}\\right)` : fracTex(b, 6)} = \\;?$`, frac(2 * a + b, 6), [frac(a + b, 9), frac(a + b, 6), frac(a * b, 18)], `Dénominateur commun 6 : $\\dfrac{${2 * a} + ${par(b)}}{6}$.`, fill),
      () => mcq(r, `$${fracTex(a, 3)} \\div \\dfrac{1}{2} = \\;?$`, frac(2 * a, 3), [frac(a, 6), frac(a, 3), frac(3 * a, 2)], `Diviser par $\\frac12$ revient à multiplier par 2.`, fill),
    ]);
  },
  (r) => {
    const n = pick(r, [2, 3, 5, 10]), p = int(r, 2, 5), q = int(r, -3, 4);
    return texMcq(r, `$${n}^{${p}} \\times ${n}^{${q}} \\div ${n}^{${p - 1}}$ s'écrit $${n}^{k}$ avec $k = \\;?$`, q + 1, [p + q - p - 1, 2 * p + q, q], `$${p} + ${par(q)} - ${p - 1} = ${q + 1}$.`);
  },
  (r) => {
    // ax + b = cx + d, de solution entière, demi-entière ou en quarts (a - c multiple du dénominateur).
    const den = pick(r, [1, 2, 4]), k = nonZero(r, 12), x = k / den;
    const a = nonZero(r, 9), c = a - den * nonZero(r, 2), b = int(r, -12, 12), d = (a - c) * x + b;
    return numeric(`Résous sans calculatrice : $${poly([a, b])} = ${poly([c, d])}$.`, x, `On regroupe les $x$ : $${poly([a - c, 0])} = ${d - b}$, donc $x = ${fracTex(d - b, a - c)}${den === 1 || Number.isInteger(x) ? "" : ` = ${tex(x)}`}$.`, undefined, 0.001);
  },
  (r) => {
    const v = pick(r, [30, 45, 60, 80, 90, 120]), t = pick(r, [15, 20, 30, 40, 45, 90].filter((m) => (v * m) % 30 === 0));
    return numeric(`On roule à $${v}$ km/h pendant $${t}$ minutes. Distance parcourue (km) ?`, (v * t) / 60, `$${v} \\times \\dfrac{${t}}{60}$.`, "km", 0.01);
  },
  (r) => {
    const m = nonZero(r, 4), p = int(r, -5, 5), x = int(r, -4, 4);
    return mcq(r, `La droite d'équation $y = ${poly([m, p])}$ passe par le point…`, `$(${x}\\,;\\,${m * x + p})$`, [`$(${x}\\,;\\,${m * x - p})$`, `$(${m * x + p}\\,;\\,${x})$`, `$(${x}\\,;\\,${m + x + p})$`], `$${m} \\times ${par(x)} + ${par(p)} = ${m * x + p}$.`);
  },
  (r) => {
    const a = int(r, 2, 9), b = int(r, 2, 9);
    return oneOf(r, [
      () => mcq(r, `Développer $(x + ${a})(x - ${a})$ :`, `$x^2 - ${a * a}$`, [`$x^2 + ${a * a}$`, `$x^2 - ${2 * a}x - ${a * a}$`, `$x^2 - ${a}$`], `$(a + b)(a - b) = a^2 - b^2$.`),
      () => mcq(r, `Factoriser $${a}x^2 + ${a * b}x$ :`, `$${a}x(x + ${b})$`, [`$x(${a}x + ${b})$`, `$${a}(x^2 + ${b})$`, `$${a}x(x + ${a * b})$`], `Facteur commun $${a}x$.`),
    ]);
  },
  (r) => {
    // Échelles de cartes routières ou de randonnée : au 1/1 000, deux villages ne seraient qu'à quelques dizaines de mètres.
    const scale = pick(r, [10000, 20000, 25000, 50000, 100000, 250000]), cm = int(r, 2, 12);
    return numeric(`Sur une carte au $1/${tex(scale)}$, deux villages sont à $${cm}$ cm. Distance réelle (km) ?`, (cm * scale) / 100000, `$${cm} \\times ${tex(scale)}$ cm $= ${tex(cm * scale)}$ cm, soit $${tex((cm * scale) / 100000)}$ km ($1$ km $= 100\\,000$ cm).`, "km", 0.001);
  },
  claims([
    ["Augmenter de 10 % puis baisser de 10 % ramène au prix de départ.", false, "$1{,}1 \\times 0{,}9 = 0{,}99$ : on a perdu 1 %."],
    ["Multiplier par $0{,}75$ revient à baisser de 25 %.", true, "$1 - 0{,}25 = 0{,}75$."],
    ["Diviser par $0{,}5$ revient à multiplier par 2.", true, "$\\dfrac{1}{0{,}5} = 2$."],
    ["$(a + b)^2 = a^2 + b^2$", false, "Il manque le double produit : $a^2 + 2ab + b^2$."],
  ]),
];

const automatismes2: Generator[] = [
  ...autoCommon,
  ...MATHS_SECONDE["maths-2-nombres"].slice(0, 4),
  ...MATHS_SECONDE["maths-2-equations"].slice(0, 3),
];

const automatismes1: Generator[] = [
  ...autoCommon,
  ...MATHS_SECONDE["maths-2-nombres"].slice(0, 4),
  ...MATHS_SECONDE["maths-2-affines"].slice(0, 3),
  ...MATHS_PREMIERE["maths-1-second-degre"].slice(0, 2),
  ...MATHS_PREMIERE["maths-1-derivation"].slice(0, 2),
  ...MATHS_PREMIERE["maths-1-suites"].slice(0, 2),
];

export const MATHS_2026: Record<string, Generator[]> = {
  "maths-2-probas-cond": probasCond2,
  "maths-2-automatismes": automatismes2,
  "maths-1-automatismes": automatismes1,
};

/** Générateur ajouté au chapitre de statistiques de Seconde. */
export const STATS_CLASSES = statsClasses;
