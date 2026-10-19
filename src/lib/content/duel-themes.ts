/**
 * Thèmes de duel : questions courtes, faisables de tête en quelques secondes.
 * Les maths et la physique sont générées au hasard (valeurs différentes à
 * chaque duel) ; les autres matières tirent dans des banques de repères.
 */
import type { Question, SubjectId } from "@/lib/types";
import { shuffle } from "@/lib/game/quests";
import { ESPAGNOL } from "./gen/espagnol";
import { type Generator, type Rand, fr, frac, gcd, int, mcq, numMcq, numeric, pick, tf } from "./gen/kit";

export interface DuelTheme {
  id: string;
  title: string;
  emoji: string;
  subject: SubjectId;
  description: string;
  generators: Generator[];
}

// ───────────── Calcul mental ─────────────

const calcul: Generator[] = [
  (r) => {
    const a = int(r, 6, 15), b = int(r, 4, 12);
    return numMcq(r, `$${a} \\times ${b} = \\;?$`, a * b, [a * b + a, a * b - b, a * (b + 1), (a + 1) * b], `$${a} \\times ${b} = ${a * b}$.`);
  },
  (r) => {
    const a = int(r, 24, 89), b = int(r, 13, 69);
    return numeric(`$${a} + ${b} = \\;?$`, a + b, `$${a} + ${b} = ${a + b}$.`);
  },
  (r) => {
    const a = int(r, 61, 150), b = int(r, 17, 58);
    return numMcq(r, `$${a} - ${b} = \\;?$`, a - b, [a - b + 10, a - b - 10, a - b + 2], `$${a} - ${b} = ${a - b}$.`);
  },
  (r) => {
    const b = int(r, 3, 9), q = int(r, 6, 14);
    return numeric(`$${b * q} \\div ${b} = \\;?$`, q, `$${b} \\times ${q} = ${b * q}$.`);
  },
  (r) => {
    const n = int(r, 11, 19);
    return numMcq(r, `$${n}^2 = \\;?$`, n * n, [n * 2, n * n + n, n * n - 10, (n - 1) * (n + 1)], `$${n}^2 = ${n * n}$.`);
  },
  (r) => {
    const [p, base] = pick(r, [[10, 10], [20, 5], [25, 4], [50, 2], [75, 4], [5, 20], [15, 20]] as const);
    const n = base * int(r, 2, 12);
    const ans = (p * n) / 100;
    return numMcq(r, `$${p}\\,\\%$ de $${n}$ = ?`, ans, [ans * 2, ans / 2, n - ans, ans + 10], `$${p}\\,\\% \\times ${n} = ${fr(ans)}$.`);
  },
  (r) => {
    const a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9);
    return numMcq(r, `$${a} + ${b} \\times ${c} = \\;?$`, a + b * c, [(a + b) * c, a * b + c, a + b + c], `La multiplication passe d'abord : $${b} \\times ${c} = ${b * c}$, puis $+\\,${a}$.`);
  },
  (r) => {
    const a = int(r, 2, 9) * 10 + 5;
    return numMcq(r, `Le double de $${a}$, c'est ?`, 2 * a, [2 * a + 10, 2 * a - 10, a + 2], `$2 \\times ${a} = ${2 * a}$.`);
  },
  (r) => {
    const a = int(r, 2, 9), b = int(r, 2, 9);
    return numMcq(r, `$${a * 100} \\times ${b} = \\;?$`, a * b * 100, [a * b * 10, a * b * 1000, (a + b) * 100], `$${a} \\times ${b} = ${a * b}$, puis $\\times 100$.`);
  },
  (r) => {
    const a = int(r, 2, 9);
    return numMcq(r, `$${a} \\times 0{,}5 \\times 4 = \\;?$`, a * 2, [a / 2, a * 4, a * 20], `$0{,}5 \\times 4 = 2$, donc $${a} \\times 2 = ${a * 2}$.`);
  },
];

// ───────────── Fractions, puissances, racines ─────────────

const fractions: Generator[] = [
  (r) => {
    const d = pick(r, [3, 4, 5, 6, 7, 8, 9]), a = int(r, 1, d - 1), b = int(r, 1, d - 1);
    return mcq(r, `$\\dfrac{${a}}{${d}} + \\dfrac{${b}}{${d}} = \\;?$`, frac(a + b, d), [frac(a + b, 2 * d), frac(a * b, d), frac(a + b + 1, d)],
      `Même dénominateur : on ajoute les numérateurs, $${a} + ${b} = ${a + b}$.`, () => frac(int(r, 1, 15), d + int(r, 0, 2)));
  },
  (r) => {
    const b = int(r, 2, 7), d = int(r, 2, 7), a = int(r, 1, b - 1), c = int(r, 1, d - 1);
    return mcq(r, `$\\dfrac{${a}}{${b}} \\times \\dfrac{${c}}{${d}} = \\;?$`, frac(a * c, b * d), [frac(a + c, b + d), frac(a * d, b * c), frac(a * c, b + d)],
      `On multiplie les numérateurs entre eux et les dénominateurs entre eux.`, () => frac(int(r, 1, 9), int(r, 2, 12)));
  },
  (r) => {
    const n = int(r, 3, 10);
    return numMcq(r, `$2^{${n}} = \\;?$`, 2 ** n, [2 * n, 2 ** (n - 1), 2 ** (n + 1), n ** 2], `$2^{${n}} = ${2 ** n}$.`);
  },
  (r) => {
    const a = int(r, -4, 6), b = int(r, -3, 6);
    return numMcq(r, `$10^{${a}} \\times 10^{${b}} = 10^{\\,?}$`, a + b, [a * b, a - b, b - a], `$10^a \\times 10^b = 10^{a+b}$.`);
  },
  (r) => {
    const a = int(r, 2, 5), b = int(r, 2, 4);
    return numMcq(r, `$(x^{${a}})^{${b}} = x^{\\,?}$`, a * b, [a + b, a ** b, b ** a], `$(x^a)^b = x^{a \\times b}$.`);
  },
  (r) => {
    const a = int(r, 6, 12), b = int(r, 1, 5);
    return numMcq(r, `$\\dfrac{x^{${a}}}{x^{${b}}} = x^{\\,?}$`, a - b, [a + b, a / b, a * b], `$\\dfrac{x^a}{x^b} = x^{a-b}$.`);
  },
  (r) => {
    const n = int(r, 4, 15);
    return numMcq(r, `$\\sqrt{${n * n}} = \\;?$`, n, [n * 2, n + 1, n - 1], `$${n}^2 = ${n * n}$.`);
  },
  (r) => {
    const [a, b] = pick(r, [[2, 8], [3, 12], [2, 18], [5, 20], [3, 27], [2, 32]] as const);
    const ans = Math.sqrt(a * b);
    return numMcq(r, `$\\sqrt{${a}} \\times \\sqrt{${b}} = \\;?$`, ans, [a + b, ans * 2, ans + 1, a * b], `$\\sqrt{a}\\sqrt{b} = \\sqrt{ab} = \\sqrt{${a * b}} = ${ans}$.`);
  },
  (r) => {
    const n = int(r, 2, 9), k = int(r, 2, 5);
    return mcq(r, `$${n} \\times 10^{${k}}$ s'écrit…`, String(n * 10 ** k).replace(/\B(?=(\d{3})+(?!\d))/g, " "),
      [String(n * 10 ** (k - 1)), String(n * 10 ** (k + 1)), String(n * k * 10)].map((s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, " ")),
      `On décale de ${k} rangs : ${k} zéros.`);
  },
  (r) => {
    const d = pick(r, [2, 4, 5, 10, 20, 25]);
    const n = int(r, 1, d - 1);
    return numMcq(r, `$\\dfrac{${n}}{${d}}$ en écriture décimale ?`, n / d, [d / n, n / d / 10, (n + 1) / d], `$${n} \\div ${d} = ${fr(n / d)}$.`);
  },
];

// ───────────── Fonctions express (1re / Tle) ─────────────

const DERIV_RULES: Array<[string, string, string[]]> = [
  ["e^x", "e^x", ["xe^{x-1}", "e", "\\ln x"]],
  ["\\ln x", "\\dfrac{1}{x}", ["e^x", "x\\ln x", "\\dfrac{1}{x^2}"]],
  ["\\sqrt{x}", "\\dfrac{1}{2\\sqrt{x}}", ["2\\sqrt{x}", "\\dfrac{1}{\\sqrt{x}}", "\\sqrt{x}/2"]],
  ["\\dfrac{1}{x}", "-\\dfrac{1}{x^2}", ["\\dfrac{1}{x^2}", "\\ln x", "-\\dfrac{1}{x}"]],
  ["\\cos x", "-\\sin x", ["\\sin x", "\\cos x", "-\\cos x"]],
  ["\\sin x", "\\cos x", ["-\\cos x", "-\\sin x", "\\tan x"]],
];

/** Coefficients lisibles (ni 0 ni ±1). */
const COEFS = [-7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7];

const fonctions: Generator[] = [
  (r) => {
    const a = int(r, 2, 6), b = pick(r, COEFS), c = int(r, 1, 9) * (r() < 0.5 ? -1 : 1);
    const sb = b < 0 ? `- ${-b}` : `+ ${b}`;
    return mcq(r, `Dérivée de $f(x) = ${a}x^2 ${sb}x ${c < 0 ? `- ${-c}` : `+ ${c}`}$ ?`, `$${2 * a}x ${sb}$`,
      [`$${a}x ${sb}$`, `$${2 * a}x^2 ${sb}$`, `$${2 * a}x ${sb} ${c < 0 ? `- ${-c}` : `+ ${c}`}$`, `$${a}x^2 ${sb}$`],
      `$(ax^2)' = 2ax$, $(bx)' = b$ et une constante a une dérivée nulle.`);
  },
  (r) => {
    const n = int(r, 3, 7);
    return mcq(r, `Dérivée de $x^{${n}}$ ?`, `$${n}x^{${n - 1}}$`, [`$${n}x^{${n}}$`, `$x^{${n - 1}}$`, `$${n - 1}x^{${n}}$`, `$${n + 1}x^{${n + 1}}$`],
      `$(x^n)' = n\\,x^{n-1}$.`);
  },
  (r) => {
    const [f, d, w] = pick(r, DERIV_RULES);
    return mcq(r, `Dérivée de $${f}$ ?`, `$${d}$`, w.map((x) => `$${x}$`), `À connaître par cœur : $(${f})' = ${d}$.`);
  },
  (r) => {
    const a = int(r, 1, 4), b = pick(r, COEFS), x = int(r, -3, 3);
    return numeric(`$f(x) = ${a}x^2 ${b < 0 ? `- ${-b}` : `+ ${b}`}x$. Que vaut $f'(${x})$ ?`, 2 * a * x + b, `$f'(x) = ${2 * a}x ${b < 0 ? `- ${-b}` : `+ ${b}`}$, donc $f'(${x}) = ${2 * a * x + b}$.`);
  },
  (r) => {
    // Δ choisi pour être lisible : racines entières ou pas de racine.
    const kind = int(r, 0, 2);
    const p = int(r, -5, 5), q = int(r, -5, 5);
    const [b, c] = kind === 0 ? [-(p + q), p * q] : kind === 1 ? [-2 * p, p * p] : [int(r, -2, 2) * 2, int(r, 5, 12)];
    const delta = b * b - 4 * c;
    const ans = delta > 0 ? "2 racines" : delta === 0 ? "1 racine double" : "Aucune racine réelle";
    const sb = b === 0 ? "" : b < 0 ? ` - ${-b}x` : ` + ${b}x`;
    return mcq(r, `Combien de racines réelles pour $x^2${sb}${c === 0 ? "" : c < 0 ? ` - ${-c}` : ` + ${c}`}$ ?`, ans, ["2 racines", "1 racine double", "Aucune racine réelle", "Une infinité"],
      `$\\Delta = b^2 - 4ac = ${delta}$ : ${delta > 0 ? "positif" : delta === 0 ? "nul" : "négatif"}.`);
  },
  (r) => {
    const k = int(r, 2, 9);
    return pick(r, [
      () => numMcq(r, `$\\ln(e^{${k}}) = \\;?$`, k, [Math.round(Math.exp(k)), 1, k * k], `$\\ln$ et $\\exp$ sont réciproques : $\\ln(e^{${k}}) = ${k}$.`),
      () => numMcq(r, `$e^{\\ln ${k}} = \\;?$`, k, [1, 0, k * k], `$e^{\\ln a} = a$ pour $a > 0$.`),
      () => mcq(r, `$e^{${k}} \\times e^{${k - 1}} = \\;?$`, `$e^{${2 * k - 1}}$`, [`$e^{${k * (k - 1)}}$`, `$${2}e^{${2 * k - 1}}$`, `$e^{${k}}$`], `$e^a e^b = e^{a+b}$.`),
      () => mcq(r, `$\\ln(${k}) + \\ln(${k + 1}) = \\;?$`, `$\\ln(${k * (k + 1)})$`, [`$\\ln(${2 * k + 1})$`, `$${k}\\ln(${k + 1})$`, `$\\ln(${k})\\ln(${k + 1})$`], `$\\ln a + \\ln b = \\ln(ab)$.`),
    ])();
  },
  (r) => {
    const u0 = int(r, -5, 10), d = int(r, -4, 6) || 2, n = int(r, 5, 20);
    return numMcq(r, `Suite arithmétique : $u_0 = ${u0}$, raison $${d}$. $u_{${n}} = \\;?$`, u0 + n * d, [u0 + (n - 1) * d, u0 + (n + 1) * d, u0 * n], `$u_n = u_0 + n r = ${u0} + ${n} \\times ${d < 0 ? `(${d})` : d}$.`);
  },
  (r) => {
    const u0 = int(r, 1, 3), q = pick(r, [2, 3]), n = int(r, 3, q === 2 ? 6 : 4);
    return numMcq(r, `Suite géométrique : $u_0 = ${u0}$, raison $${q}$. $u_{${n}} = \\;?$`, u0 * q ** n, [u0 + n * q, u0 * q ** (n - 1), u0 * q * n], `$u_n = u_0 \\times q^n = ${u0} \\times ${q}^{${n}}$.`);
  },
  (r) =>
    pick(r, [
      () => tf("La fonction carré est croissante sur $\\mathbb{R}$.", false, "Elle est décroissante sur $]-\\infty ; 0]$ et croissante sur $[0 ; +\\infty[$."),
      () => tf("La fonction exponentielle est strictement positive sur $\\mathbb{R}$.", true, "$e^x > 0$ pour tout réel $x$."),
      () => tf("$\\ln(x)$ est défini pour $x = 0$.", false, "$\\ln$ est définie sur $]0 ; +\\infty[$."),
      () => tf("Si $f'(x) > 0$ sur un intervalle, $f$ y est croissante.", true, "Signe de la dérivée ⇒ sens de variation."),
      () => tf("$\\ln(1) = 1$", false, "$\\ln(1) = 0$ (et $e^0 = 1$)."),
      () => tf("La fonction inverse est décroissante sur $]0 ; +\\infty[$.", true, "$(1/x)' = -1/x^2 < 0$."),
      () => tf("$\\cos^2 x + \\sin^2 x = 1$ pour tout réel $x$.", true, "C'est le théorème de Pythagore dans le cercle trigonométrique."),
    ])(),
];

// ───────────── Physique-chimie flash ─────────────

const physique: Generator[] = [
  (r) => {
    const v = pick(r, [18, 36, 54, 72, 90, 108, 126, 144]);
    return numMcq(r, `$${v}$ km/h, c'est combien en m/s ?`, v / 3.6, [v * 3.6, v / 60, v / 3.6 + 5], `On divise par $3{,}6$ : $${v} / 3{,}6 = ${v / 3.6}$ m/s.`, (s) => `${s} m/s`);
  },
  (r) => {
    const t = pick(r, [0.5, 2, 3, 4]), v = pick(r, [40, 60, 80, 90, 120]);
    return numMcq(r, `Une voiture roule ${fr(t)} h à $${v}$ km/h. Distance parcourue ?`, v * t, [v * (t + 1), v + t, v * t * 2], `$d = v \\times t = ${v} \\times ${fr(t)}$.`, (s) => `${s} km`);
  },
  (r) => {
    const R = pick(r, [10, 20, 50, 100, 200]), I = pick(r, [0.1, 0.2, 0.5, 2, 3]);
    return numMcq(r, `Loi d'Ohm : $R = ${R}\\ \\Omega$, $I = ${fr(I)}$ A. Tension $U$ ?`, R * I, [R / I, R + I, R * I * 10], `$U = R \\times I = ${fr(R * I)}$ V.`, (s) => `${s} V`);
  },
  (r) => {
    const U = pick(r, [6, 12, 230]), I = pick(r, [0.5, 2, 4, 10]);
    return numMcq(r, `$U = ${U}$ V et $I = ${fr(I)}$ A. Puissance $P$ ?`, U * I, [U / I, U + I, (U * I) / 2], `$P = U \\times I = ${fr(U * I)}$ W.`, (s) => `${s} W`);
  },
  (r) => {
    const m = pick(r, [2, 5, 8, 12, 50, 70]);
    return numMcq(r, `Poids d'un objet de $${m}$ kg (avec $g = 10$ N/kg) ?`, m * 10, [m, m / 10, m * 100], `$P = m \\times g = ${m} \\times 10$.`, (s) => `${s} N`);
  },
  (r) => {
    const P = pick(r, [0.5, 1, 2, 3]), t = pick(r, [2, 3, 4, 10]);
    return numMcq(r, `Un appareil de ${fr(P)} kW fonctionne ${t} h. Énergie consommée ?`, P * t, [P / t, P + t, P * t * 60], `$E = P \\times t = ${fr(P * t)}$ kWh.`, (s) => `${s} kWh`);
  },
  (r) => {
    const [from, to, f] = pick(r, [["g", "kg", 0.001], ["mL", "L", 0.001], ["cm", "m", 0.01], ["km", "m", 1000], ["min", "s", 60], ["h", "min", 60], ["L", "mL", 1000]] as const);
    const v = pick(r, [2, 5, 15, 250, 500, 1500]);
    return numMcq(r, `$${v}$ ${from} = ? ${to}`, v * f, [v / f, v * f * 10, v * f / 10], `1 ${from} = ${fr(f)} ${to}.`, (s) => `${s} ${to}`);
  },
  (r) => {
    const V = pick(r, [2, 4, 5, 10]), rho = pick(r, [0.8, 1, 2.5, 7.8]);
    const m = Math.round(rho * V * 10) / 10;
    return numMcq(r, `Masse volumique : $m = ${fr(m)}$ g et $V = ${V}$ mL. $\\rho$ ?`, rho, [V / m, m * V, rho * 10], `$\\rho = m / V = ${fr(rho)}$ g/mL.`, (s) => `${s} g/mL`);
  },
  (r) => {
    const items: Array<[string, string, string[]]> = [
      ["Unité de l'énergie", "le joule (J)", ["le watt (W)", "le newton (N)", "le pascal (Pa)"]],
      ["Unité de la puissance", "le watt (W)", ["le joule (J)", "le volt (V)", "l'ampère (A)"]],
      ["Unité de la force", "le newton (N)", ["le joule (J)", "le kilogramme (kg)", "le watt (W)"]],
      ["Unité de la pression", "le pascal (Pa)", ["le newton (N)", "le joule (J)", "le hertz (Hz)"]],
      ["Unité de la fréquence", "le hertz (Hz)", ["le pascal (Pa)", "la seconde (s)", "le watt (W)"]],
      ["Unité de la quantité de matière", "la mole (mol)", ["le gramme (g)", "le litre (L)", "le kelvin (K)"]],
      ["Vitesse de la lumière dans le vide", "$3 \\times 10^8$ m/s", ["$3 \\times 10^5$ m/s", "$340$ m/s", "$3 \\times 10^{6}$ m/s"]],
      ["Vitesse du son dans l'air (environ)", "$340$ m/s", ["$3 \\times 10^8$ m/s", "$34$ m/s", "$3\\,400$ m/s"]],
      ["pH d'une solution neutre à 25 °C", "7", ["0", "14", "1"]],
      ["Une solution de pH 3 est…", "acide", ["basique", "neutre", "saturée"]],
      ["Charge électrique d'un électron", "négative", ["positive", "nulle", "variable"]],
      ["Particules du noyau atomique", "protons et neutrons", ["électrons et protons", "électrons seuls", "neutrons et électrons"]],
      ["Formule de l'eau", "$\\text{H}_2\\text{O}$", ["$\\text{HO}_2$", "$\\text{H}_2\\text{O}_2$", "$\\text{OH}$"]],
      ["Formule du dioxyde de carbone", "$\\text{CO}_2$", ["$\\text{CO}$", "$\\text{C}_2\\text{O}$", "$\\text{O}_2$"]],
    ];
    const [q, a, w] = pick(r, items);
    return mcq(r, `${q} ?`, a, w, `Réponse : ${a}.`);
  },
];

// ───────────── Histoire : dates et repères ─────────────

const EVENTS: Array<[string, number]> = [
  ["Christophe Colomb atteint l'Amérique", 1492],
  ["Édit de Nantes", 1598],
  ["Déclaration d'indépendance des États-Unis", 1776],
  ["Prise de la Bastille", 1789],
  ["Proclamation de la Ire République", 1792],
  ["Sacre de Napoléon Ier", 1804],
  ["Bataille de Waterloo", 1815],
  ["Les Trois Glorieuses", 1830],
  ["Abolition définitive de l'esclavage en France", 1848],
  ["Début de la IIIe République", 1870],
  ["Loi Jules Ferry : école gratuite", 1881],
  ["Loi de séparation des Églises et de l'État", 1905],
  ["Début de la Première Guerre mondiale", 1914],
  ["Bataille de Verdun", 1916],
  ["Révolution russe d'Octobre", 1917],
  ["Armistice de la Première Guerre mondiale", 1918],
  ["Traité de Versailles", 1919],
  ["Krach de Wall Street", 1929],
  ["Hitler devient chancelier", 1933],
  ["Front populaire en France", 1936],
  ["Début de la Seconde Guerre mondiale", 1939],
  ["Appel du 18 Juin du général de Gaulle", 1940],
  ["Débarquement en Normandie", 1944],
  ["Capitulation de l'Allemagne nazie", 1945],
  ["Plan Marshall", 1947],
  ["Création de la CECA", 1951],
  ["Traité de Rome", 1957],
  ["Début de la Ve République", 1958],
  ["Construction du mur de Berlin", 1961],
  ["Accords d'Évian, fin de la guerre d'Algérie", 1962],
  ["Révolte étudiante et grève générale de mai", 1968],
  ["Premiers pas sur la Lune", 1969],
  ["Loi Veil sur l'IVG", 1975],
  ["Abolition de la peine de mort en France", 1981],
  ["Chute du mur de Berlin", 1989],
  ["Traité de Maastricht", 1992],
  ["Attentats du 11 septembre", 2001],
  ["Mise en circulation des pièces et billets en euros", 2002],
];

const histoire: Generator[] = [
  (r) => {
    const [e, y] = pick(r, EVENTS);
    return mcq(r, `En quelle année : **${e}** ?`, String(y), [y - int(r, 1, 4), y + int(r, 1, 4), y + pick(r, [-12, -10, 10, 11]), y - pick(r, [5, 6, 7])].map(String),
      `${e} : ${y}.`, () => String(y + int(r, -15, 15)));
  },
  (r) => {
    const [e, y] = pick(r, EVENTS);
    const others = shuffle(EVENTS.filter(([, yy]) => Math.abs(yy - y) >= 2), r).slice(0, 3).map(([ee]) => ee);
    return mcq(r, `Que s'est-il passé en **${y}** ?`, e, others, `${y} : ${e}.`);
  },
  (r) => {
    const four = shuffle(EVENTS.filter((x, i, all) => all.findIndex((z) => z[1] === x[1]) === i), r).slice(0, 4);
    const first = four.reduce((m, e) => (e[1] < m[1] ? e : m));
    return mcq(r, `Lequel s'est produit **en premier** ?`, first[0], four.map(([e]) => e), four.sort((a, b) => a[1] - b[1]).map(([e, y]) => `${e} (${y})`).join(" · "));
  },
];

// ───────────── Culture bac : français, philo, SVT, SES ─────────────

const WORKS: Array<[string, string]> = [
  ["Les Fleurs du mal", "Baudelaire"], ["Les Misérables", "Victor Hugo"], ["Le Rouge et le Noir", "Stendhal"],
  ["Madame Bovary", "Flaubert"], ["Germinal", "Zola"], ["Candide", "Voltaire"], ["Le Malade imaginaire", "Molière"],
  ["Phèdre", "Racine"], ["Le Cid", "Corneille"], ["Alcools", "Apollinaire"], ["L'Étranger", "Camus"],
  ["Les Liaisons dangereuses", "Laclos"], ["Bel-Ami", "Maupassant"], ["La Princesse de Clèves", "Madame de La Fayette"],
  ["Fables", "La Fontaine"], ["Gargantua", "Rabelais"], ["Essais", "Montaigne"], ["Le Père Goriot", "Balzac"],
  ["Rhinocéros", "Ionesco"], ["Juste la fin du monde", "Lagarce"], ["Cahiers de Douai", "Rimbaud"],
  ["Déclaration des droits de la femme et de la citoyenne", "Olympe de Gouges"],
];

const PHILO: Array<[string, string]> = [
  ["« Je pense, donc je suis »", "Descartes"], ["« L'homme est condamné à être libre »", "Sartre"],
  ["L'allégorie de la caverne", "Platon"], ["Critique de la raison pure", "Kant"], ["Du contrat social", "Rousseau"],
  ["Ainsi parlait Zarathoustra", "Nietzsche"], ["Léviathan", "Hobbes"], ["« L'homme est un animal politique »", "Aristote"],
  ["Lettre à Ménécée", "Épicure"], ["« Le cœur a ses raisons que la raison ne connaît point »", "Pascal"],
  ["Éthique", "Spinoza"], ["« Connais-toi toi-même » (maxime reprise par…)", "Socrate"],
];

const FACTS: Array<[string, string, string[]]> = [
  ["Où se trouve l'ADN dans une cellule animale ?", "Dans le noyau", ["Dans la membrane", "Dans les ribosomes", "Dans le sang"]],
  ["Organite de la respiration cellulaire", "La mitochondrie", ["Le chloroplaste", "Le noyau", "La vacuole"]],
  ["Organite de la photosynthèse", "Le chloroplaste", ["La mitochondrie", "Le ribosome", "Le noyau"]],
  ["Nombre de chromosomes d'une cellule humaine", "46", ["23", "44", "48"]],
  ["Base azotée absente de l'ADN", "U (uracile)", ["A (adénine)", "T (thymine)", "G (guanine)"]],
  ["La méiose produit…", "des gamètes", ["des neurones", "des globules rouges", "des cellules de peau"]],
  ["Organe qui sécrète l'insuline", "Le pancréas", ["Le foie", "L'estomac", "Les reins"]],
  ["Âge de la Terre (environ)", "4,6 milliards d'années", ["6 000 ans", "460 millions d'années", "13,8 milliards d'années"]],
  ["Une enzyme est…", "un catalyseur biologique", ["un sucre", "une hormone sexuelle", "un globule blanc"]],
  ["Que mesure le PIB ?", "La richesse produite dans un pays en un an", ["Le patrimoine des ménages", "Les exportations", "Le budget de l'État"]],
  ["L'inflation, c'est…", "une hausse générale et durable des prix", ["une baisse des prix", "une hausse des salaires", "une hausse du chômage"]],
  ["Qui fixe les taux directeurs de la zone euro ?", "La BCE", ["Le FMI", "L'OMC", "La Commission européenne"]],
  ["Le taux de chômage = chômeurs ÷ …", "population active", ["population totale", "population de plus de 15 ans", "nombre d'emplois"]],
  ["La socialisation primaire se fait surtout…", "dans la famille", ["au travail", "à l'université", "en entreprise"]],
];

const culture: Generator[] = [
  (r) => {
    const [w, a] = pick(r, WORKS);
    return mcq(r, `Qui a écrit *${w}* ?`, a, WORKS.map(([, x]) => x).filter((x) => x !== a), `*${w}* : ${a}.`, () => pick(r, WORKS)[1]);
  },
  (r) => {
    const [w, a] = pick(r, PHILO);
    return mcq(r, `${w} : quel philosophe ?`, a, PHILO.map(([, x]) => x).filter((x) => x !== a), `${w} : ${a}.`, () => pick(r, PHILO)[1]);
  },
  (r) => {
    const [q, a, w] = pick(r, FACTS);
    return mcq(r, q.endsWith("?") || q.endsWith("…") ? q : `${q} ?`, a, w, `Réponse : ${a}.`);
  },
];

// ───────────── Anglais ─────────────

const VOCAB: Array<[string, string]> = [
  ["actually", "en fait"], ["eventually", "finalement"], ["library", "bibliothèque"], ["sensible", "raisonnable"],
  ["to achieve", "accomplir"], ["to attend", "assister à"], ["currently", "actuellement"], ["however", "cependant"],
  ["although", "bien que"], ["whereas", "tandis que"], ["meanwhile", "pendant ce temps"], ["to improve", "améliorer"],
  ["to require", "exiger"], ["to threaten", "menacer"], ["to struggle", "lutter"], ["to own", "posséder"],
  ["to borrow", "emprunter"], ["to lend", "prêter"], ["to fail", "échouer"], ["to succeed", "réussir"],
  ["to warn", "avertir"], ["to grow up", "grandir"], ["to give up", "abandonner"], ["to find out", "découvrir"],
  ["skill", "compétence"], ["wealth", "richesse"], ["poverty", "pauvreté"], ["growth", "croissance"],
  ["law", "loi"], ["trial", "procès"], ["weather", "météo"], ["knowledge", "connaissance"],
  ["behaviour", "comportement"], ["to deny", "nier"], ["to rely on", "compter sur"], ["to look forward to", "avoir hâte de"],
];

const IRREGULAR: Array<[string, string]> = [
  ["bring", "brought"], ["buy", "bought"], ["catch", "caught"], ["teach", "taught"], ["think", "thought"],
  ["fight", "fought"], ["choose", "chose"], ["drive", "drove"], ["write", "wrote"], ["begin", "began"],
  ["swim", "swam"], ["drink", "drank"], ["fly", "flew"], ["grow", "grew"], ["throw", "threw"], ["lead", "led"],
  ["feel", "felt"], ["keep", "kept"], ["leave", "left"], ["lose", "lost"], ["mean", "meant"], ["sell", "sold"],
  ["tell", "told"], ["understand", "understood"], ["catch", "caught"], ["forget", "forgot"], ["break", "broke"],
];

const regular = (v: string) => (v.endsWith("e") ? `${v}d` : `${v}ed`);

const anglais: Generator[] = [
  (r) => {
    const [en, f] = pick(r, VOCAB);
    return mcq(r, `Que veut dire **${en}** ?`, f, [], `*${en}* = ${f}.`, () => pick(r, VOCAB)[1]);
  },
  (r) => {
    const [en, f] = pick(r, VOCAB);
    return mcq(r, `Comment dit-on **${f}** en anglais ?`, en, [], `${f} = *${en}*.`, () => pick(r, VOCAB)[0]);
  },
  (r) => {
    const [v, past] = pick(r, IRREGULAR);
    return mcq(r, `Prétérit de **to ${v}** ?`, past, [regular(v)], `to ${v} → ${past}.`, () => pick(r, IRREGULAR)[1]);
  },
  (r) =>
    pick(r, [
      () => mcq(r, "She ___ to London last year.", "went", ["goes", "has gone", "was going to"], "*last year* → prétérit : *went*."),
      () => mcq(r, "I have lived here ___ 2019.", "since", ["for", "during", "ago"], "*since* + point de départ."),
      () => mcq(r, "I have lived here ___ three years.", "for", ["since", "ago", "during"], "*for* + durée."),
      () => mcq(r, "If I ___ rich, I would travel.", "were", ["am", "will be", "would be"], "Conditionnel : *If + prétérit* (were)."),
      () => mcq(r, "He is ___ than his brother.", "taller", ["more tall", "tallest", "the taller"], "Adjectif court : *-er than*."),
      () => mcq(r, "There isn't ___ milk left.", "any", ["some", "no", "many"], "Phrase négative → *any*."),
      () => mcq(r, "I'm looking forward to ___ you.", "seeing", ["see", "saw", "to see"], "*look forward to* + V-ing."),
    ])(),
];

// ───────────── Thèmes ─────────────

export const DUEL_THEMES: DuelTheme[] = [
  { id: "calcul-mental", title: "Calcul mental", emoji: "🧮", subject: "maths", description: "Tables, carrés, pourcentages, priorités", generators: calcul },
  { id: "fractions-puissances", title: "Fractions & puissances", emoji: "➗", subject: "maths", description: "Fractions, puissances, racines", generators: fractions },
  { id: "fonctions-express", title: "Fonctions express", emoji: "📈", subject: "maths", description: "Dérivées, Δ, exp/ln, suites (1re–Tle)", generators: fonctions },
  { id: "physique-flash", title: "Physique flash", emoji: "⚡", subject: "physique", description: "Conversions, Ohm, puissance, unités", generators: physique },
  { id: "histoire-dates", title: "Dates clés", emoji: "🏛️", subject: "histoire", description: "Repères d'histoire de 1492 à nos jours", generators: histoire },
  { id: "culture-bac", title: "Culture bac", emoji: "🎓", subject: "francais", description: "Auteurs, philosophes, SVT, SES", generators: culture },
  { id: "anglais-flash", title: "English flash", emoji: "🇬🇧", subject: "anglais", description: "Vocabulaire, verbes irréguliers, grammaire", generators: anglais },
  {
    id: "espanol-flash",
    title: "Español flash",
    emoji: "🇪🇸",
    subject: "espagnol",
    description: "Conjugaison, ser / estar, vocabulaire, culture",
    generators: [...ESPAGNOL["es-2-presente"], ...ESPAGNOL["es-2-vocabulaire"], ...ESPAGNOL["es-2-cliches"].slice(0, 3)],
  },
  {
    id: "grand-melange",
    title: "Grand mélange",
    emoji: "🎲",
    subject: "maths",
    description: "Un peu de tout, toutes matières",
    generators: [...calcul, ...fractions, ...fonctions, ...physique, ...histoire, ...culture, ...anglais, ...ESPAGNOL["es-2-presente"]],
  },
];

export const duelThemeById = (id: string) => DUEL_THEMES.find((t) => t.id === id);

/**
 * Tire `count` questions variées : chaque générateur est utilisé au plus une
 * fois par tour (types de questions qui alternent), sans énoncé en double.
 */
export function generateDuelQuestions(theme: DuelTheme, count: number, r: Rand): Question[] {
  const out: Question[] = [];
  const prompts = new Set<string>();
  let bag: Generator[] = [];
  for (let guard = 0; out.length < count && guard < count * 20; guard++) {
    if (bag.length === 0) bag = shuffle(theme.generators, r);
    const q = bag.pop()!(r);
    // Pas deux fois la même information, même posée autrement.
    const key = q.fact ?? q.prompt;
    if (prompts.has(key) || prompts.has(q.prompt)) continue;
    prompts.add(key);
    prompts.add(q.prompt);
    out.push({ ...q, id: `${theme.id}-${out.length + 1}` } as Question);
  }
  return out;
}
