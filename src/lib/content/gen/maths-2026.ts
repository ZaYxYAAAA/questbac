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
    const [row1, row2, col1, col2] = pick(r, [
      ["filles", "garçons", "font du sport", "n'en font pas"],
      ["Seconde", "Première", "demi-pensionnaires", "externes"],
      ["fumeurs", "non-fumeurs", "malades", "non malades"],
      ["vaccinés", "non vaccinés", "infectés", "non infectés"],
    ] as const);
    const table = `| | ${col1} | ${col2} |\n|---|---|---|\n| **${row1}** | ${a} | ${b} |\n| **${row2}** | ${c} | ${d} |`;
    return oneOf(r, [
      () => mcq(r, `${table}\n\nOn choisit une personne au hasard. Probabilité qu'elle soit parmi les ${row1} **et** ${col1} ?`, frac(a, total), [frac(a, a + b), frac(a, a + c), frac(a + b, total)], `$\\dfrac{${a}}{${total}}$ : effectif de la case sur l'effectif total.`),
      () => mcq(r, `${table}\n\nParmi les ${row1}, quelle proportion ${col1.startsWith("n'") ? "n'en font pas" : col1} ?`, frac(a, a + b), [frac(a, total), frac(a, a + c), frac(b, a + b)], `Fréquence conditionnelle : $\\dfrac{${a}}{${a} + ${b}} = ${fracTex(a, a + b)}$.`),
      () => mcq(r, `${table}\n\nParmi les personnes « ${col1} », quelle proportion sont des ${row2} ?`, frac(c, a + c), [frac(c, c + d), frac(c, total), frac(a, a + c)], `$\\dfrac{${c}}{${a} + ${c}} = ${fracTex(c, a + c)}$.`),
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
    const evo = Math.round((c - 1) * 1000) / 10;
    return texMcq(r, `Une ${up1 ? "hausse" : "baisse"} de $${t1}\\,\\%$ puis une ${up2 ? "hausse" : "baisse"} de $${t2}\\,\\%$ correspondent à une évolution globale de (en %) :`, evo, [(up1 ? t1 : -t1) + (up2 ? t2 : -t2), 0, evo + 2], `On multiplie les coefficients : $${tex(1 + (up1 ? t1 : -t1) / 100)} \\times ${tex(1 + (up2 ? t2 : -t2) / 100)} = ${tex(c, 4)}$.`, "%");
  },
  (r) => {
    const [p1, p2] = [pick(r, [10, 20, 25, 40, 50, 60, 75]), pick(r, [10, 20, 25, 40, 50, 80])];
    return texMcq(r, `$${p2}\\,\\%$ des élèves d'un lycée sont en Seconde, et $${p1}\\,\\%$ d'entre eux font du latin. Part des élèves du lycée en Seconde qui font du latin (en %) ?`, (p1 * p2) / 100, [p1 + p2, Math.abs(p1 - p2), (p1 * p2) / 10], `Proportion de proportion : $${tex(p1 / 100)} \\times ${tex(p2 / 100)} = ${tex((p1 * p2) / 10000)}$.`, "%");
  },
  (r) => {
    const k = pick(r, [1.25, 0.8, 1.5, 2, 0.5, 1.1]);
    const t = Math.round((1 / k - 1) * 10000) / 100;
    return texMcq(r, `Un prix est multiplié par $${tex(k)}$. Par combien faut-il le multiplier pour revenir au prix initial ?`, Math.round((1 / k) * 1000) / 1000, [2 - k, -k, k - 1], `Coefficient réciproque : $\\dfrac{1}{${tex(k)}} = ${tex(1 / k)}$ (soit une évolution de $${tex(t)}\\,\\%$).`);
  },
  (r) => {
    const a = nonZero(r, 9), b = nonZero(r, 9);
    return oneOf(r, [
      () => mcq(r, `$${fracTex(a, 3)} + ${b < 0 ? `\\left(${fracTex(b, 6)}\\right)` : fracTex(b, 6)} = \\;?$`, frac(2 * a + b, 6), [frac(a + b, 9), frac(a + b, 6), frac(a * b, 18)], `Dénominateur commun 6 : $\\dfrac{${2 * a} + ${par(b)}}{6}$.`),
      () => mcq(r, `$${fracTex(a, 3)} \\div \\dfrac{1}{2} = \\;?$`, frac(2 * a, 3), [frac(a, 6), frac(a, 3), frac(3 * a, 2)], `Diviser par $\\frac12$ revient à multiplier par 2.`),
    ]);
  },
  (r) => {
    const n = pick(r, [2, 3, 5, 10]), p = int(r, 2, 5), q = int(r, -3, 4);
    return texMcq(r, `$${n}^{${p}} \\times ${n}^{${q}} \\div ${n}^{${p - 1}}$ s'écrit $${n}^{k}$ avec $k = \\;?$`, q + 1, [p + q - p - 1, 2 * p + q, q], `$${p} + ${par(q)} - ${p - 1} = ${q + 1}$.`);
  },
  (r) => {
    const a = nonZero(r, 5, true), x0 = int(r, -6, 6), b = -a * x0 + nonZero(r, 9) * a;
    const sol = (-b) / a;
    return numeric(`Résous sans calculatrice : $${poly([a, b])} = 0$.`, sol, `$x = -\\dfrac{${b}}{${a}} = ${tex(sol)}$.`, undefined, 0.001);
  },
  (r) => {
    const v = pick(r, [30, 45, 60, 80, 90, 120]), t = pick(r, [15, 20, 30, 40, 45, 90]);
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
    const scale = pick(r, [1000, 2000, 5000, 10000, 25000, 50000]), cm = int(r, 2, 12);
    return numeric(`Sur une carte au $1/${tex(scale)}$, deux villages sont à $${cm}$ cm. Distance réelle (km) ?`, (cm * scale) / 100000, `$${cm} \\times ${tex(scale)}$ cm $= ${tex(cm * scale)}$ cm.`, "km", 0.001);
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
