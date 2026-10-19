/** Générateurs de questions — Physique-Chimie (Seconde, Première, Terminale). */
import { type Generator, cards, claims, int, mcq, nonZero, numeric, oneOf, pairs, pick, sample, tex, tf } from "./kit";

const oneOfNum = (r: () => number, f: Array<() => number>) => pick(r, f)();
const sci = (m: number, e: number) => `$${tex(m)} \\times 10^{${e}}$`;

// ───────────── Seconde : constitution de l'atome ─────────────

const ELEMENTS: Array<[string, string, number, number]> = [
  ["H", "hydrogène", 1, 1], ["He", "hélium", 2, 4], ["Li", "lithium", 3, 7], ["C", "carbone", 6, 12], ["N", "azote", 7, 14],
  ["O", "oxygène", 8, 16], ["F", "fluor", 9, 19], ["Ne", "néon", 10, 20], ["Na", "sodium", 11, 23], ["Mg", "magnésium", 12, 24],
  ["Al", "aluminium", 13, 27], ["Si", "silicium", 14, 28], ["P", "phosphore", 15, 31], ["S", "soufre", 16, 32], ["Cl", "chlore", 17, 35],
  ["Ar", "argon", 18, 40], ["K", "potassium", 19, 39], ["Ca", "calcium", 20, 40], ["Fe", "fer", 26, 56], ["Cu", "cuivre", 29, 63], ["Zn", "zinc", 30, 65],
];
const IONS: Array<[string, number, number]> = [["Na^+", 11, 1], ["K^+", 19, 1], ["Mg^{2+}", 12, 2], ["Ca^{2+}", 20, 2], ["Al^{3+}", 13, 3], ["Cl^-", 17, -1], ["F^-", 9, -1], ["O^{2-}", 8, -2], ["S^{2-}", 16, -2]];
const nuclide = (sym: string, z: number, a: number) => `$^{${a}}_{${z}}\\mathrm{${sym}}$`;

const SUBSHELLS: Array<[string, number]> = [["1s", 2], ["2s", 2], ["2p", 6], ["3s", 2], ["3p", 6], ["4s", 2]];
/** Remplissage des sous-couches dans l'ordre : nombre d'électrons de chacune. */
function filling(z: number) {
  let left = z;
  return SUBSHELLS.map(([, cap]) => {
    const e = Math.min(cap, Math.max(0, left));
    left -= e;
    return e;
  });
}
const written = (fill: number[]) => fill.map((e, i) => (e > 0 ? `${SUBSHELLS[i][0]}^{${e}}` : "")).filter(Boolean).join("\\,");
const config = (z: number) => written(filling(z));
/** Erreur classique : un électron placé dans la sous-couche suivante avant que la précédente soit pleine. */
function skipped(z: number) {
  const fill = filling(z);
  const last = fill.reduce((k, e, i) => (e > 0 ? i : k), 0);
  if (last === 0) return written([fill[0] - 1, 1, ...fill.slice(2)]);
  const out = [...fill];
  out[last - 1] -= 1;
  out[last] += 1;
  if (out[last] > SUBSHELLS[last][1]) return written([...fill.slice(0, last), fill[last] - 1, 1 + fill[last + 1], ...fill.slice(last + 2)]);
  return written(out);
}

const atome: Generator[] = [
  (r) => {
    const [sym, name, z, a] = pick(r, ELEMENTS);
    return oneOf(r, [
      () => numeric(`Combien de neutrons dans le noyau ${nuclide(sym, z, a)} (${name}) ?`, a - z, `$N = A - Z = ${a} - ${z} = ${a - z}$.`),
      () => numeric(`Combien de protons dans le noyau ${nuclide(sym, z, a)} ?`, z, `Le numéro atomique $Z = ${z}$ donne le nombre de protons.`),
      () => numeric(`Combien de nucléons dans ${nuclide(sym, z, a)} ?`, a, `Le nombre de masse $A = ${a}$ compte protons + neutrons.`),
    ]);
  },
  (r) => {
    const [ion, z, q] = pick(r, IONS);
    return numeric(`Combien d'électrons possède l'ion $\\mathrm{${ion}}$ ($Z = ${z}$) ?`, z - q, `${q > 0 ? `Il a perdu ${q}` : `Il a gagné ${-q}`} électron${Math.abs(q) > 1 ? "s" : ""} : $${z} ${q > 0 ? "-" : "+"} ${Math.abs(q)} = ${z - q}$.`);
  },
  (r) => {
    const [sym, , z] = pick(r, ELEMENTS.filter(([, , zz]) => zz <= 18));
    const right = config(z);
    const wrong = [config(z + 1), config(Math.max(1, z - 1)), skipped(z), right.replace(/\^\{(\d)\}$/, (_, d) => `^{${Number(d) + 1}}`)];
    return mcq(r, `Configuration électronique de $\\mathrm{${sym}}$ ($Z = ${z}$) ?`, `$${right}$`, wrong.map((w) => `$${w}$`), `On remplit $1s$, $2s$, $2p$, $3s$, $3p$ dans l'ordre avec $${z}$ électron${z > 1 ? "s" : ""}.`);
  },
  (r) => {
    const [sym, , z] = pick(r, ELEMENTS.filter(([, , zz]) => zz <= 18 && zz !== 2 && zz !== 10 && zz !== 18));
    const valence = z <= 2 ? z : z <= 10 ? z - 2 : z - 10;
    return numeric(`Combien d'électrons de valence pour $\\mathrm{${sym}}$ ($Z = ${z}$) ?`, valence, `Configuration $${config(z)}$ : ${valence} électron${valence > 1 ? "s" : ""} sur la dernière couche.`);
  },
  pairs(
    [["proton", "positive"], ["électron", "négative"], ["neutron", "nulle"]],
    { ask: (a) => `Charge électrique d'un ${a} ?`, explain: (a, b) => `Un ${a} a une charge ${b}.` },
  )[0],
  claims([
    ["Deux isotopes ont le même nombre de protons mais pas le même nombre de neutrons.", true, "Même $Z$, $A$ différent."],
    ["L'essentiel de la masse d'un atome est concentré dans son noyau.", true, "Les électrons sont ~2000 fois plus légers que les nucléons."],
    ["Un atome est électriquement neutre.", true, "Autant d'électrons que de protons."],
    ["Le noyau est beaucoup plus petit que l'atome (environ $10^5$ fois).", true, "Structure lacunaire de la matière."],
    ["Un cation a gagné des électrons.", false, "Un cation a perdu des électrons ; un anion en a gagné."],
    ["Les gaz nobles ont une couche externe saturée.", true, "D'où leur grande stabilité."],
  ]),
];

// ───────────── Seconde : quantité de matière ─────────────

const MOLECULES: Array<[string, number]> = [["H_2O", 18], ["CO_2", 44], ["O_2", 32], ["CH_4", 16], ["NH_3", 17], ["C_6H_{12}O_6", 180], ["NaCl", 58.5], ["C_2H_6O", 46], ["N_2", 28], ["Fe", 56], ["C", 12]];
const ATOMS: Record<string, number> = { H: 1, C: 12, N: 14, O: 16 };

const mole: Generator[] = [
  (r) => {
    const [f, M] = pick(r, MOLECULES);
    const n = pick(r, [0.1, 0.2, 0.5, 1, 2, 3, 0.25, 1.5]);
    return oneOf(r, [
      () => numeric(`Quantité de matière dans $${tex(n * M)}$ g de $\\mathrm{${f}}$ ($M = ${tex(M)}$ g/mol) ?`, n, `$n = \\dfrac{m}{M} = \\dfrac{${tex(n * M)}}{${tex(M)}} = ${tex(n)}$ mol.`, "mol", 0.001),
      () => numeric(`Masse de $${tex(n)}$ mol de $\\mathrm{${f}}$ ($M = ${tex(M)}$ g/mol) ?`, n * M, `$m = n \\times M = ${tex(n)} \\times ${tex(M)}$.`, "g", 0.01),
    ]);
  },
  (r) => {
    const [name, formula, c, h, nN, o] = pick(r, [
      ["l'éthanol", "C_2H_6O", 2, 6, 0, 1], ["le propane", "C_3H_8", 3, 8, 0, 0], ["le glucose", "C_6H_{12}O_6", 6, 12, 0, 6], ["le méthanol", "CH_4O", 1, 4, 0, 1],
      ["l'acide éthanoïque", "C_2H_4O_2", 2, 4, 0, 2], ["l'acétone", "C_3H_6O", 3, 6, 0, 1], ["l'urée", "CH_4N_2O", 1, 4, 2, 1], ["la glycine", "C_2H_5NO_2", 2, 5, 1, 2],
      ["le butane", "C_4H_{10}", 4, 10, 0, 0], ["l'octane", "C_8H_{18}", 8, 18, 0, 0], ["l'alanine", "C_3H_7NO_2", 3, 7, 1, 2], ["le benzène", "C_6H_6", 6, 6, 0, 0],
      ["l'acide benzoïque", "C_7H_6O_2", 7, 6, 0, 2], ["l'aspirine", "C_9H_8O_4", 9, 8, 0, 4], ["l'ammoniac", "NH_3", 0, 3, 1, 0], ["le saccharose", "C_{12}H_{22}O_{11}", 12, 22, 0, 11],
    ] as const);
    const M = c * ATOMS.C + h * ATOMS.H + o * ATOMS.O + nN * ATOMS.N;
    return numeric(`Masse molaire de ${name} $\\mathrm{${formula}}$ ? (H = 1, C = 12, N = 14, O = 16 g/mol)`, M, `$M = ${[c && `${c} \\times 12`, `${h} \\times 1`, nN && `${nN} \\times 14`, o && `${o} \\times 16`].filter(Boolean).join(" + ")} = ${M}$ g/mol.`, "g/mol");
  },
  (r) => {
    const n = pick(r, [0.5, 2, 3, 0.1, 5, 10]);
    const N = n * 6.02;
    const e = 23 + Math.floor(Math.log10(N));
    const m = N / 10 ** Math.floor(Math.log10(N));
    return mcq(r, `Nombre d'entités dans $${tex(n)}$ mol ? ($N_A = 6{,}02 \\times 10^{23}$ mol$^{-1}$)`, sci(m, e), [sci(m, e + 1), sci(m, e - 1), sci(n, 23)], `$N = n \\times N_A = ${tex(n)} \\times 6{,}02 \\times 10^{23}$.`);
  },
  claims([
    ["Une mole contient environ $6{,}02 \\times 10^{23}$ entités.", true, "C'est la constante d'Avogadro."],
    ["La masse molaire s'exprime en g/mol.", true, "Masse d'une mole d'entités."],
    ["Deux échantillons de même masse contiennent toujours la même quantité de matière.", false, "Cela dépend de la masse molaire."],
    ["$n = \\dfrac{m}{M}$", true, "Relation fondamentale."],
  ]),
];

// ───────────── Seconde : solutions ─────────────

const solutions: Generator[] = [
  (r) => {
    const V = pick(r, [50, 100, 200, 250, 500]), m = pick(r, [0.5, 1, 2, 2.5, 5, 10]);
    return numeric(`On dissout $${tex(m)}$ g de sucre dans $${V}$ mL de solution. Concentration en masse (g/L) ?`, m / (V / 1000), `$C_m = \\dfrac{m}{V} = \\dfrac{${tex(m)}}{${tex(V / 1000)}} = ${tex(m / (V / 1000))}$ g/L.`, "g/L", 0.01);
  },
  (r) => {
    const C1 = pick(r, [10, 20, 50, 100]), F = pick(r, [2, 4, 5, 10]), V2 = pick(r, [50, 100, 200, 250]);
    return oneOf(r, [
      () => numeric(`On dilue $${F}$ fois une solution à $${C1}$ g/L. Nouvelle concentration ?`, C1 / F, `Facteur de dilution $F = ${F}$ : $C_2 = C_1 / F$.`, "g/L", 0.01),
      () => numeric(`Volume de solution mère à $${C1}$ g/L pour préparer $${V2}$ mL à $${tex(C1 / F)}$ g/L ?`, V2 / F, `$C_1V_1 = C_2V_2 \\Rightarrow V_1 = \\dfrac{${tex(C1 / F)} \\times ${V2}}{${C1}} = ${tex(V2 / F)}$ mL.`, "mL", 0.01),
    ]);
  },
  (r) => {
    const C = pick(r, [5, 9, 20, 40, 50]), V = pick(r, [100, 200, 250, 500]);
    return numeric(`Masse de soluté pour $${V}$ mL de solution à $${C}$ g/L ?`, (C * V) / 1000, `$m = C_m \\times V = ${C} \\times ${tex(V / 1000)}$.`, "g", 0.01);
  },
  cards([
    ["Dans l'eau salée, le sel est…", "le soluté", ["le solvant", "la solution", "le précipité"], "Le soluté est l'espèce dissoute."],
    ["Une solution saturée…", "ne peut plus dissoudre de soluté", ["contient uniquement du solvant", "est toujours colorée", "a une concentration nulle"], "On a atteint la solubilité maximale."],
    ["Une solution aqueuse a pour solvant…", "l'eau", ["l'éthanol", "le soluté", "l'air"], "Aqueuse = dans l'eau."],
    ["Lors d'une dilution, la masse de soluté…", "reste la même", ["augmente", "diminue", "devient nulle"], "On ajoute seulement du solvant."],
  ]),
  claims([
    ["Diluer une solution diminue sa concentration.", true, "Même quantité de soluté dans un volume plus grand."],
    ["La concentration en masse s'exprime en g/L.", true, "$C_m = m / V$."],
    ["On peut dissoudre une quantité illimitée de sel dans l'eau.", false, "Il existe une solubilité maximale."],
  ]),
];

// ───────────── Seconde : transformations ─────────────

const REACTIONS: Array<[string[], number[], string[], number[]]> = [
  [["CH_4", "O_2"], [1, 2], ["CO_2", "H_2O"], [1, 2]],
  [["H_2", "O_2"], [2, 1], ["H_2O"], [2]],
  [["C_3H_8", "O_2"], [1, 5], ["CO_2", "H_2O"], [3, 4]],
  [["Fe", "O_2"], [4, 3], ["Fe_2O_3"], [2]],
  [["N_2", "H_2"], [1, 3], ["NH_3"], [2]],
  [["Na", "Cl_2"], [2, 1], ["NaCl"], [2]],
  [["Mg", "O_2"], [2, 1], ["MgO"], [2]],
  [["C_2H_6O", "O_2"], [1, 3], ["CO_2", "H_2O"], [2, 3]],
  [["Al", "O_2"], [4, 3], ["Al_2O_3"], [2]],
  [["Cu^{2+}", "HO^-"], [1, 2], ["Cu(OH)_2"], [1]],
];
const side = (sp: string[], co: number[], hide: number, offset: number) =>
  sp.map((s, i) => `${i + offset === hide ? "\\,?\\," : co[i] === 1 ? "" : co[i]}\\,\\mathrm{${s}}`).join(" + ");

const transformations: Generator[] = [
  (r) => {
    const [re, rc, pr, pc] = pick(r, REACTIONS);
    const all = [...rc, ...pc];
    const hide = int(r, 0, all.length - 1);
    const eq = `${side(re, rc, hide, 0)} \\rightarrow ${side(pr, pc, hide, re.length)}`;
    return numeric(`Équilibre l'équation : $${eq}$. Coefficient manquant ?`, all[hide], `Conservation des éléments (et des charges) : le coefficient est $${all[hide]}$.`);
  },
  pairs(
    [
      ["la fusion de la glace", "physique"], ["la combustion du bois", "chimique"], ["la fission de l'uranium 235", "nucléaire"],
      ["la dissolution du sucre dans l'eau", "physique"], ["la formation de la rouille", "chimique"], ["la fusion de l'hydrogène dans le Soleil", "nucléaire"],
      ["la cuisson d'un œuf", "chimique"], ["l'évaporation d'une flaque", "physique"], ["la désintégration du carbone 14", "nucléaire"],
      ["la digestion de l'amidon", "chimique"], ["la solidification de la cire", "physique"],
    ],
    { ask: (a) => `De quel type de transformation s'agit-il : ${a} ?`, explain: (a, b) => `${a.charAt(0).toUpperCase() + a.slice(1)} : transformation ${b}.` },
  )[0],
  ...pairs(
    [["solide → liquide", "fusion"], ["liquide → gaz", "vaporisation"], ["gaz → liquide", "liquéfaction"], ["liquide → solide", "solidification"], ["solide → gaz", "sublimation"], ["gaz → solide", "condensation"]],
    { ask: (a) => `Nom du changement d'état ${a} ?`, reverse: (b) => `La ${b} correspond au passage…`, explain: (a, b) => `${a} : ${b}.` },
  ),
  (r) => {
    const [sym, z, a] = pick(r, [["U", 92, 238], ["Ra", 88, 226], ["Po", 84, 210], ["Th", 90, 232], ["Rn", 86, 222], ["Pu", 94, 239]] as const);
    return mcq(r, `Désintégration $\\alpha$ : ${nuclide(sym, z, a)} $\\rightarrow\\ ^{4}_{2}\\mathrm{He} + {}^{A}_{Z}\\mathrm{Y}$. $(A\\,;\\,Z) = \\;?$`, `$(${a - 4}\\,;\\,${z - 2})$`, [`$(${a - 2}\\,;\\,${z - 4})$`, `$(${a - 4}\\,;\\,${z})$`, `$(${a}\\,;\\,${z - 2})$`], `Conservation du nombre de masse et du numéro atomique.`);
  },
  (r) => {
    const [reac, prod, ratio] = pick(r, [["de carbone", "de dioxyde de carbone", 44 / 12], ["de magnésium", "d'oxyde de magnésium", 40 / 24], ["de fer", "d'oxyde de fer", 160 / 112]] as const);
    const m1 = pick(r, [1.2, 2.4, 3.6, 4.8, 6, 12]);
    const m2 = Math.round(m1 * (ratio - 1) * 100) / 100;
    return numeric(`On fait réagir entièrement $${tex(m1)}$ g ${reac} avec $${tex(m2)}$ g de dioxygène. Masse ${prod} formée (g) ?`, m1 + m2, `Conservation de la masse : $${tex(m1)} + ${tex(m2)} = ${tex(m1 + m2)}$ g.`, "g", 0.02);
  },
  (r) => {
    const [what, L] = pick(r, [["faire fondre de la glace", 334], ["vaporiser de l'eau", 2260], ["faire fondre de l'aluminium", 397]] as const);
    const m = pick(r, [0.1, 0.2, 0.5, 1, 2, 5]);
    return numeric(`Énergie pour ${what} : $m = ${tex(m)}$ kg, $L = ${L}$ kJ/kg. $Q$ (kJ) ?`, m * L, `$Q = m \\times L = ${tex(m)} \\times ${L}$.`, "kJ", 0.5);
  },
  claims([
    ["Lors d'une transformation chimique, les éléments chimiques sont conservés.", true, "Lavoisier : rien ne se perd, rien ne se crée."],
    ["Une transformation exothermique libère de l'énergie thermique.", true, "Le milieu extérieur se réchauffe."],
    ["La fusion de la glace est exothermique.", false, "Elle absorbe de l'énergie : endothermique."],
    ["Une transformation nucléaire modifie les noyaux des atomes.", true, "Les éléments chimiques changent."],
    ["Dans une transformation physique, de nouvelles espèces chimiques apparaissent.", false, "Les espèces restent les mêmes, seul l'état change."],
  ]),
];

// ───────────── Seconde : mouvement et interactions ─────────────

const mouvement: Generator[] = [
  (r) => {
    const d = pick(r, [100, 200, 400, 800, 1500, 3000]), t = pick(r, [10, 20, 25, 40, 50, 100, 200]);
    return numeric(`Un mobile parcourt $${d}$ m en $${t}$ s. Vitesse moyenne (m/s) ?`, d / t, `$v = \\dfrac{d}{t} = \\dfrac{${d}}{${t}}$.`, "m/s", 0.01);
  },
  (r) => {
    const v = pick(r, [10, 15, 20, 25, 30, 5]);
    return r() < 0.5
      ? numeric(`$${v}$ m/s, c'est combien en km/h ?`, v * 3.6, `On multiplie par $3{,}6$.`, "km/h", 0.01)
      : numeric(`$${tex(v * 3.6)}$ km/h, c'est combien en m/s ?`, v, `On divise par $3{,}6$.`, "m/s", 0.01);
  },
  (r) => {
    const v = pick(r, [30, 45, 50, 60, 72, 80, 90, 110, 120, 130]), t = pick(r, [10, 15, 20, 30, 40, 45, 90]);
    return r() < 0.5
      ? numeric(`Une voiture roule à $${v}$ km/h pendant $${t}$ min. Distance parcourue (km) ?`, (v * t) / 60, `$d = v \\times t = ${v} \\times \\dfrac{${t}}{60}$ h.`, "km", 0.01)
      : numeric(`Durée pour parcourir $${tex((v * t) / 60)}$ km à $${v}$ km/h (en min) ?`, t, `$t = \\dfrac{d}{v}$ en heures, puis $\\times 60$.`, "min", 0.1);
  },
  (r) => {
    const m = pick(r, [0.5, 2, 5, 10, 60, 75]);
    const [where, g] = pick(r, [["sur Terre", 9.8], ["sur la Lune", 1.6], ["sur Mars", 3.7]] as const);
    return numeric(`Poids d'une masse de $${tex(m)}$ kg ${where} ($g = ${tex(g)}$ N/kg) ?`, m * g, `$P = m \\times g = ${tex(m)} \\times ${tex(g)}$.`, "N", 0.01);
  },
  pairs(
    [
      ["trajectoire droite, vitesse constante", "rectiligne uniforme"], ["trajectoire droite, vitesse qui augmente", "rectiligne accéléré"],
      ["trajectoire droite, vitesse qui diminue", "rectiligne ralenti"], ["trajectoire en cercle, vitesse constante", "circulaire uniforme"],
    ],
    { ask: (a) => `Mouvement avec ${a} ?`, reverse: (b) => `Un mouvement ${b} a une…`, explain: (a, b) => `${a} : mouvement ${b}.` },
  )[0],
  claims([
    ["Selon le principe d'inertie, un objet soumis à des forces qui se compensent est immobile ou en mouvement rectiligne uniforme.", true, "Principe d'inertie (1re loi de Newton)."],
    ["Le mouvement d'un objet dépend du référentiel choisi.", true, "Un passager est immobile dans le train, en mouvement par rapport au quai."],
    ["La masse d'un objet change quand on va sur la Lune.", false, "La masse est la même ; c'est le poids qui change."],
    ["Si $A$ exerce une force sur $B$, $B$ exerce sur $A$ une force opposée.", true, "Principe des actions réciproques."],
    ["La force gravitationnelle diminue quand la distance augmente.", true, "Elle varie en $1/d^2$."],
  ]),
  cards([
    ["Unité de la force ?", "le newton (N)", ["le kilogramme (kg)", "le joule (J)", "le watt (W)"], "La force se mesure en newtons."],
    ["Expression de la force gravitationnelle ?", "$F = G\\dfrac{m_A m_B}{d^2}$", ["$F = G\\dfrac{m_A m_B}{d}$", "$F = m g d$", "$F = G m_A m_B d^2$"], "Loi de la gravitation universelle."],
  ]),
];

// ───────────── Seconde : signaux sonores et lumineux ─────────────

const ondes2: Generator[] = [
  (r) => {
    const T = pick(r, [0.1, 0.125, 0.2, 0.25, 0.5, 1, 2, 2.5, 4, 5, 8, 10, 12.5, 16, 20, 25, 40, 50]);
    return r() < 0.5
      ? numeric(`Période $T = ${tex(T)}$ ms. Fréquence (Hz) ?`, 1000 / T, `$f = \\dfrac{1}{T} = \\dfrac{1}{${tex(T / 1000, 6)}\\text{ s}} = ${tex(1000 / T)}$ Hz (période convertie en secondes).`, "Hz", 0.1)
      : numeric(`Fréquence $f = ${tex(1000 / T)}$ Hz. Période (ms) ?`, T, `$T = \\dfrac{1}{f} = \\dfrac{1}{${tex(1000 / T)}} = ${tex(T / 1000, 6)}$ s $= ${tex(T)}$ ms.`, "ms", 0.01);
  },
  (r) => {
    const t = int(r, 1, 40) / 10;
    return numeric(`Un écho revient $${tex(t)}$ s après le cri ($v = 340$ m/s). Distance de la paroi (m) ?`, (340 * t) / 2, `Aller-retour : $d = \\dfrac{v \\times t}{2} = \\dfrac{340 \\times ${tex(t)}}{2}$.`, "m", 0.5);
  },
  (r) => {
    const f = oneOfNum(r, [() => int(r, 1, 19), () => int(r, 2, 200) * 100, () => int(r, 21, 200) * 1000]);
    const ans = f < 20 ? "infrason" : f <= 20000 ? "son audible" : "ultrason";
    return mcq(r, `Une onde sonore de $${tex(f)}$ Hz est…`, ans, ["infrason", "son audible", "ultrason"], `L'oreille humaine perçoit de 20 Hz à 20 000 Hz environ.`);
  },
  (r) => {
    const n2 = pick(r, [1.33, 1.5, 2]);
    const i = pick(r, [[30, 0.5, "\\dfrac12"], [90, 1, "1"]] as const);
    return numeric(`Lumière passant de l'air ($n = 1$) à un milieu d'indice $${tex(n2)}$ avec $\\sin i_1 = ${i[2]}$. $\\sin i_2$ (arrondi à $0{,}01$) ?`, Math.round((i[1] / n2) * 100) / 100, `Snell-Descartes : $n_1 \\sin i_1 = n_2 \\sin i_2$, donc $\\sin i_2 = \\dfrac{${tex(i[1])}}{${tex(n2)}}$.`, undefined, 0.011);
  },
  (r) => {
    // Réfraction avec calcul d'angle (en degrés), dans les deux sens de calcul.
    const [milieu, n2] = pick(r, [["l'eau", 1.33], ["le verre", 1.5], ["le plexiglas", 1.49], ["le diamant", 2.42]] as const);
    const i1 = pick(r, [20, 30, 40, 45, 50, 60, 70]);
    const deg = (x: number) => (x * 180) / Math.PI, rad = (x: number) => (x * Math.PI) / 180;
    const i2 = deg(Math.asin(Math.sin(rad(i1)) / n2));
    const r2 = Math.round(i2 * 10) / 10;
    return oneOf(r, [
      () => numeric(`Un rayon passe de l'air ($n_1 = 1{,}00$) dans ${milieu} ($n_2 = ${tex(n2)}$) avec un angle d'incidence de $${i1}°$. Angle de réfraction (en degrés, au dixième) ?`, r2,
        `$\\sin i_2 = \\dfrac{n_1 \\sin i_1}{n_2} = \\dfrac{\\sin ${i1}°}{${tex(n2)}} \\approx ${tex(Math.sin(rad(i1)) / n2, 3)}$, donc $i_2 \\approx ${tex(r2, 1)}°$ : le rayon se rapproche de la normale.`, "°", 0.3, 2),
      () => numeric(`Un rayon passe de l'air ($n_1 = 1{,}00$) dans un milieu transparent : angle d'incidence $${i1}°$, angle de réfraction $${tex(r2, 1)}°$. Indice du milieu (au centième) ?`, n2,
        `$n_2 = \\dfrac{n_1 \\sin i_1}{\\sin i_2} = \\dfrac{\\sin ${i1}°}{\\sin ${tex(r2, 1)}°} \\approx ${tex(n2, 2)}$.`, undefined, 0.02, 2),
    ]);
  },
  (r) => {
    const t = int(r, 1, 20);
    return numeric(`On entend le tonnerre $${t}$ s après l'éclair. Distance de l'orage (m) ? ($v_{son} = 340$ m/s)`, 340 * t, `La lumière arrive quasi instantanément : $d = 340 \\times ${t}$.`, "m", 1);
  },
  (r) => {
    const [obj, d] = pick(r, [["de la Lune", 384000], ["du Soleil", 1.5e8], ["de Mars (au plus près)", 5.6e7], ["d'un satellite GPS", 20200]] as const);
    return numeric(`Durée mise par la lumière pour venir ${obj} ($d = ${tex(d)}$ km, $c = 3 \\times 10^5$ km/s), en s ?`, d / 3e5, `$t = \\dfrac{d}{c} = \\dfrac{${tex(d)}}{300\\,000} \\approx ${tex(d / 3e5)}$ s.`, "s", Math.max(0.001, (d / 3e5) * 0.003));
  },
  claims([
    ["Le son ne se propage pas dans le vide.", true, "Il lui faut un milieu matériel."],
    ["La lumière se propage dans le vide à environ $3 \\times 10^8$ m/s.", true, "C'est la célérité de la lumière $c$."],
    ["Le son va plus vite que la lumière.", false, "La lumière est près d'un million de fois plus rapide."],
    ["Un spectre de raies d'émission permet d'identifier un élément chimique.", true, "Chaque élément a ses raies caractéristiques."],
    ["Une lumière blanche donne un spectre continu.", true, "Toutes les couleurs sont présentes."],
    ["Plus une source chaude est chaude, plus son spectre s'enrichit vers le violet.", true, "Loi de Wien qualitative."],
  ]),
];

// ───────────── Première : suivi d'une transformation ─────────────

const avancement: Generator[] = [
  (r) => {
    const [names, a, b] = pick(r, [[["H_2", "O_2"], 2, 1], [["CH_4", "O_2"], 1, 2], [["N_2", "H_2"], 1, 3], [["Fe", "O_2"], 4, 3], [["Al", "S"], 2, 3]] as const);
    const nA = pick(r, [1, 2, 3, 4, 6, 8, 12]), nB = pick(r, [1, 2, 3, 4, 6, 9]);
    const xA = nA / a, xB = nB / b;
    const xmax = Math.min(xA, xB);
    const limit = xA < xB ? names[0] : xB < xA ? names[1] : "aucun (mélange stœchiométrique)";
    return oneOf(r, [
      () => numeric(`$${a === 1 ? "" : a}\\,\\mathrm{${names[0]}} + ${b === 1 ? "" : b}\\,\\mathrm{${names[1]}} \\rightarrow \\dots$ avec $${nA}$ mol et $${nB}$ mol. $x_{max}$ (mol) ?`, xmax, `$x_{max} = \\min\\left(\\dfrac{${nA}}{${a}}\\,;\\,\\dfrac{${nB}}{${b}}\\right) = ${tex(xmax)}$ mol.`, "mol", 0.01),
      () => mcq(r, `$${a === 1 ? "" : a}\\,\\mathrm{${names[0]}} + ${b === 1 ? "" : b}\\,\\mathrm{${names[1]}} \\rightarrow \\dots$ avec $${nA}$ mol et $${nB}$ mol. Réactif limitant ?`, limit.startsWith("aucun") ? limit : `$\\mathrm{${limit}}$`, [`$\\mathrm{${names[0]}}$`, `$\\mathrm{${names[1]}}$`, "aucun (mélange stœchiométrique)", "les deux"], `On compare $\\dfrac{${nA}}{${a}} = ${tex(xA)}$ et $\\dfrac{${nB}}{${b}} = ${tex(xB)}$.`),
    ]);
  },
  (r) => {
    // Tableau d'avancement complet : CH4 + 2 O2 → CO2 + 2 H2O, état final d'une transformation totale.
    const nC = pick(r, [0.5, 1, 1.5, 2, 3]), nO = pick(r, [0.6, 1, 1.5, 2, 3, 5, 8]);
    const x = Math.min(nC, nO / 2);
    const eq = `$\\mathrm{CH_4} + 2\\,\\mathrm{O_2} \\rightarrow \\mathrm{CO_2} + 2\\,\\mathrm{H_2O}$, avec $${tex(nC)}$ mol de $\\mathrm{CH_4}$ et $${tex(nO)}$ mol de $\\mathrm{O_2}$ (transformation totale).`;
    const why = `$x_{max} = \\min\\left(${tex(nC)}\\,;\\,\\dfrac{${tex(nO)}}{2}\\right) = ${tex(x)}$ mol.`;
    return oneOf(r, [
      () => numeric(`${eq} Quantité d'eau à l'état final (mol) ?`, 2 * x, `${why} $n(\\mathrm{H_2O}) = 2x_{max} = ${tex(2 * x)}$ mol.`, "mol", 0.001, 2),
      () => numeric(`${eq} Quantité de $\\mathrm{O_2}$ restante à l'état final (mol) ?`, nO - 2 * x, `${why} $n(\\mathrm{O_2}) = ${tex(nO)} - 2x_{max} = ${tex(nO - 2 * x)}$ mol.`, "mol", 0.001, 2),
      () => numeric(`${eq} Quantité de $\\mathrm{CH_4}$ restante à l'état final (mol) ?`, nC - x, `${why} $n(\\mathrm{CH_4}) = ${tex(nC)} - x_{max} = ${tex(nC - x)}$ mol.`, "mol", 0.001, 2),
    ]);
  },
  claims([
    ["Le réactif limitant est entièrement consommé à l'état final (transformation totale).", true, "C'est lui qui fixe $x_{max}$."],
    ["Dans un mélange stœchiométrique, il reste toujours un réactif en excès.", false, "Les deux réactifs sont épuisés en même temps."],
    ["L'avancement s'exprime en mol.", true, "C'est une quantité de matière."],
  ]),
  cards([
    ["Un mélange est stœchiométrique quand…", "les réactifs sont dans les proportions des coefficients", ["il y a autant de moles de chaque réactif", "la réaction est lente", "les produits sont gazeux"], "Ils sont alors tous épuisés ensemble."],
  ]),
];

// ───────────── Première : oxydoréduction ─────────────

// [oxydant, réducteur, électrons échangés, potentiel standard E° (V)] : le potentiel sert seulement
// à ne proposer que des réactions qui ont réellement lieu (oxydant le plus fort sur réducteur le plus fort).
const COUPLES: Array<[string, string, number, number]> = [
  ["Cu^{2+}", "Cu", 2, 0.34], ["Fe^{3+}", "Fe^{2+}", 1, 0.77], ["Zn^{2+}", "Zn", 2, -0.76], ["Ag^+", "Ag", 1, 0.8], ["H^+", "H_2", 2, 0],
  ["I_2", "I^-", 2, 0.54], ["Fe^{2+}", "Fe", 2, -0.44], ["Al^{3+}", "Al", 3, -1.66], ["Cl_2", "Cl^-", 2, 1.36], ["MnO_4^-", "Mn^{2+}", 5, 1.51],
];

const redox: Generator[] = [
  (r) => {
    const [ox, red] = pick(r, COUPLES);
    const others = sample(r, COUPLES.filter(([o]) => o !== ox).flatMap(([o, rr]) => [o, rr]).filter((x) => x !== red), 2);
    return r() < 0.5
      ? mcq(r, `Dans le couple $\\mathrm{${ox}/${red}}$, l'oxydant est…`, `$\\mathrm{${ox}}$`, [`$\\mathrm{${red}}$`, ...others.map((o) => `$\\mathrm{${o}}$`)], `On écrit toujours le couple Ox/Red.`)
      : mcq(r, `Dans le couple $\\mathrm{${ox}/${red}}$, le réducteur est…`, `$\\mathrm{${red}}$`, [`$\\mathrm{${ox}}$`, ...others.map((o) => `$\\mathrm{${o}}$`)], `On écrit toujours le couple Ox/Red.`);
  },
  (r) => {
    // Espèce conjuguée, sans que le couple soit écrit (le fer, engagé dans deux couples, est écarté pour éviter l'ambiguïté).
    const pool = COUPLES.filter(([o]) => !o.startsWith("Fe"));
    const [ox, red, e] = pick(r, pool);
    const m = (x: string) => `$\\mathrm{${x}}$`;
    const why = `Couple $\\mathrm{${ox}/${red}}$ : $\\mathrm{${ox}} + ${e === 1 ? "" : e}\\,e^- = \\dots\\mathrm{${red}}$.`;
    return r() < 0.5
      ? mcq(r, `Réducteur conjugué de l'oxydant ${m(ox)} ?`, m(red), pool.filter(([o]) => o !== ox).map(([, rr]) => m(rr)), why)
      : mcq(r, `Oxydant conjugué du réducteur ${m(red)} ?`, m(ox), pool.filter(([o]) => o !== ox).map(([o]) => m(o)), why);
  },
  (r) => {
    const [ox, red, e] = pick(r, COUPLES);
    return numeric(`Combien d'électrons dans la demi-équation du couple $\\mathrm{${ox}/${red}}$ ?`, e, `$\\mathrm{${ox}} + ${e === 1 ? "" : e}\\,e^- = \\dots\\mathrm{${red}}$ (en équilibrant éléments et charges).`);
  },
  (r) => {
    const simple = COUPLES.filter(([o]) => o !== "MnO_4^-");
    // Réaction spontanée : l'oxydant o1 doit être plus fort que l'oxydant o2 du couple du réducteur r2.
    const reacts = (a: (typeof simple)[number], b: (typeof simple)[number]) => a[3] > b[3] + 0.1 && b[0] !== a[0] && b[1] !== a[0];
    const [o1, , e1, E1] = pick(r, simple.filter((a) => simple.some((b) => reacts(a, b))));
    const [o2, r2, e2] = pick(r, simple.filter((b) => reacts([o1, "", e1, E1], b)));
    const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
    const l = (e1 * e2) / g(e1, e2);
    return r() < 0.5
      ? numeric(`Réaction entre $\\mathrm{${o1}}$ et $\\mathrm{${r2}}$ (couple $\\mathrm{${o2}/${r2}}$). Nombre d'électrons échangés dans l'équation bilan ?`, l, `On multiplie les demi-équations pour avoir autant d'électrons cédés que captés : $\\mathrm{ppcm}(${e1}, ${e2}) = ${l}$.`)
      : numeric(`Réaction entre $\\mathrm{${o1}}$ et $\\mathrm{${r2}}$. Coefficient de $\\mathrm{${r2}}$ dans l'équation bilan (le plus petit entier) ?`, l / e2 * (r2 === "I^-" || r2 === "Cl^-" ? 2 : 1), `Il faut ${l} électrons de chaque côté : on multiplie la demi-équation de $\\mathrm{${o2}/${r2}}$ par $${l / e2}$${r2 === "I^-" || r2 === "Cl^-" ? ", et elle contient déjà 2 ions" : ""}.`);
  },
  ...pairs(
    [["un oxydant", "une espèce capable de capter des électrons"], ["un réducteur", "une espèce capable de céder des électrons"], ["une oxydation", "une perte d'électrons"], ["une réduction", "un gain d'électrons"]],
    { ask: (a) => `${a.charAt(0).toUpperCase() + a.slice(1)}, c'est…`, reverse: (b) => `Comment appelle-t-on ${b} ?`, explain: (a, b) => `${a.charAt(0).toUpperCase() + a.slice(1)} : ${b}.` },
  ),
  claims([
    ["Dans une réaction d'oxydoréduction, l'oxydant d'un couple réagit avec le réducteur d'un autre couple.", true, "Il y a transfert d'électrons du réducteur vers l'oxydant."],
    ["Les électrons apparaissent dans l'équation bilan d'une oxydoréduction.", false, "Ils s'éliminent : autant de cédés que de captés."],
    ["Un métal comme le zinc est un réducteur.", true, "Il cède des électrons : $\\mathrm{Zn} \\to \\mathrm{Zn^{2+}} + 2e^-$."],
  ]),
];

// ───────────── Première : structure des entités ─────────────

const lewis: Generator[] = [
  ...pairs(
    [["H", "1"], ["C", "4"], ["N", "3"], ["O", "2"], ["Cl", "1"], ["F", "1"], ["S", "2"]],
    { ask: (a) => `Nombre de liaisons covalentes formées par un atome $\\mathrm{${a}}$ (règle du duet/octet) ?`, explain: (a, b) => `$\\mathrm{${a}}$ forme ${b} liaison${Number(b) > 1 ? "s" : ""}.` },
  ),
  pairs(
    [["C", "0"], ["N", "1"], ["O", "2"], ["Cl", "3"], ["F", "3"], ["H", "0"]],
    { ask: (a) => `Doublets non liants autour de $\\mathrm{${a}}$ dans une molécule ?`, explain: (a, b) => `$\\mathrm{${a}}$ porte ${b} doublet${Number(b) > 1 ? "s" : ""} non liant${Number(b) > 1 ? "s" : ""}.` },
  )[0],
  ...pairs(
    [["$\\mathrm{CH_4}$", "tétraédrique"], ["$\\mathrm{NH_3}$", "pyramidale"], ["$\\mathrm{H_2O}$", "coudée"], ["$\\mathrm{CO_2}$", "linéaire"]],
    { ask: (a) => `Géométrie de la molécule ${a} ?`, reverse: (b) => `Quelle molécule a une géométrie ${b} ?`, explain: (a, b) => `${a} : ${b} (répulsion des doublets).` },
  ),
  (r) => {
    const [mol, polar, why] = pick(r, [
      ["H_2O", true, "molécule coudée : les polarités des liaisons O–H ne se compensent pas"],
      ["CO_2", false, "molécule linéaire : les deux liaisons C=O se compensent"],
      ["CH_4", false, "molécule tétraédrique symétrique (et liaisons C–H peu polarisées)"],
      ["NH_3", true, "molécule pyramidale : les polarités N–H ne se compensent pas"],
      ["HCl", true, "liaison H–Cl polarisée, chlore plus électronégatif"],
      ["O_2", false, "deux atomes identiques : liaison non polarisée"],
      ["CCl_4", false, "molécule tétraédrique symétrique : les polarités se compensent"],
      ["HF", true, "liaison très polarisée, le fluor est très électronégatif"],
    ] as const);
    return tf(`La molécule $\\mathrm{${mol}}$ est polaire.`, polar, `$\\mathrm{${mol}}$ est ${polar ? "polaire" : "apolaire"} : ${why}.`);
  },
  (r) => {
    const [sym, , z] = pick(r, ELEMENTS.filter(([, , zz]) => zz <= 17 && ![2, 10].includes(zz)));
    const v = z <= 2 ? z : z <= 10 ? z - 2 : z - 10;
    return numeric(`Électrons de valence de $\\mathrm{${sym}}$ ($Z = ${z}$) ?`, v, `$${config(z)}$ : ${v} électron${v > 1 ? "s" : ""} de valence.`);
  },
  (r) => {
    const [mol, ve] = pick(r, [["H_2O", 8], ["CO_2", 16], ["CH_4", 8], ["NH_3", 8], ["HCl", 8], ["C_2H_6", 14], ["C_2H_4", 12], ["HCN", 10], ["CH_3OH", 14], ["H_2O_2", 14], ["N_2", 10], ["O_2", 12], ["CH_2O", 12], ["Cl_2", 14]] as const);
    return r() < 0.5
      ? numeric(`Nombre total d'électrons de valence dans $\\mathrm{${mol}}$ ?`, ve, `On additionne les électrons de valence de chaque atome (H : 1, C : 4, N : 5, O : 6, Cl : 7).`)
      : numeric(`Nombre de doublets (liants + non liants) dans le schéma de Lewis de $\\mathrm{${mol}}$ ?`, ve / 2, `$${ve}$ électrons de valence, soit $${ve / 2}$ doublets.`);
  },
  (r) => {
    const [mol, nl] = pick(r, [["H_2O", 2], ["NH_3", 1], ["CH_4", 0], ["CO_2", 4], ["HCl", 3], ["N_2", 2], ["O_2", 4], ["HCN", 1], ["Cl_2", 6], ["CH_3OH", 2], ["H_2O_2", 4], ["CH_2O", 2]] as const);
    return numeric(`Nombre total de doublets non liants dans le schéma de Lewis de $\\mathrm{${mol}}$ ?`, nl, `On compte ceux de chaque atome (O : 2, N : 1, Cl : 3, C et H : 0).`);
  },
  (r) => {
    const order = ["H", "C", "N", "O", "F"];
    const i = int(r, 0, 4), j = (i + int(r, 1, 4)) % 5;
    return tf(`$\\mathrm{${order[i]}}$ est plus électronégatif que $\\mathrm{${order[j]}}$.`, i > j, `Électronégativité : F > O > N > C > H.`);
  },
  claims([
    ["Le fluor est l'élément le plus électronégatif.", true, "Il attire le plus les électrons d'une liaison."],
    ["Une molécule avec des liaisons polarisées est forcément polaire.", false, "$\\mathrm{CO_2}$ a des liaisons polarisées mais est apolaire (symétrie)."],
    ["Un doublet liant est une paire d'électrons partagée entre deux atomes.", true, "C'est une liaison covalente."],
  ]),
];

// ───────────── Première : énergie mécanique ─────────────

const FALLS = [[5, 10], [20, 20], [45, 30], [1.8, 6], [3.2, 8], [0.8, 4], [80, 40], [0.2, 2]] as const;

const energie: Generator[] = [
  (r) => {
    const m = pick(r, [0.5, 1, 2, 4, 10, 50, 1000]), v = pick(r, [2, 3, 4, 5, 10, 20]);
    return numeric(`Énergie cinétique d'un objet de $${tex(m)}$ kg à $${v}$ m/s ?`, 0.5 * m * v * v, `$E_c = \\dfrac12 m v^2 = 0{,}5 \\times ${tex(m)} \\times ${v}^2$.`, "J", 0.01);
  },
  (r) => {
    const m = pick(r, [0.5, 1, 2, 5, 60, 70]), h = pick(r, [2, 3, 5, 10, 20, 100]);
    return numeric(`Énergie potentielle de pesanteur de $${tex(m)}$ kg à $${h}$ m ($g = 10$ N/kg, origine au sol) ?`, m * 10 * h, `$E_{pp} = mgh = ${tex(m)} \\times 10 \\times ${h}$.`, "J", 0.01);
  },
  (r) => {
    const [h, v] = pick(r, FALLS);
    return numeric(`Un objet tombe sans frottement d'une hauteur de $${tex(h)}$ m, sans vitesse initiale ($g = 10$). Vitesse au sol (m/s) ?`, v, `Conservation de $E_m$ : $\\frac12 v^2 = gh$ donc $v = \\sqrt{2gh} = \\sqrt{${tex(2 * 10 * h)}} = ${v}$ m/s.`, "m/s", 0.05);
  },
  (r) => {
    const F = pick(r, [10, 20, 50, 100, 200]), d = pick(r, [2, 5, 10, 20]);
    const [deg, cos, c] = pick(r, [[0, 1, "1"], [60, 0.5, "\\frac12"], [90, 0, "0"], [180, -1, "-1"]] as const);
    return numeric(`Travail d'une force de $${F}$ N sur $${d}$ m, angle $${deg}°$ avec le déplacement ?`, F * d * cos, `$W = F \\times d \\times \\cos\\alpha = ${F} \\times ${d} \\times ${c}$.`, "J", 0.01);
  },
  claims([
    ["L'énergie mécanique se conserve en l'absence de frottements.", true, "$E_m = E_c + E_{pp}$ est constante."],
    ["Les frottements augmentent l'énergie mécanique.", false, "Ils la font diminuer (dissipation thermique)."],
    ["La variation d'énergie cinétique est égale à la somme des travaux des forces.", true, "Théorème de l'énergie cinétique."],
    ["Le travail du poids ne dépend que de la variation d'altitude.", true, "Le poids est une force conservative."],
    ["Si la vitesse double, l'énergie cinétique double.", false, "Elle est multipliée par 4 ($v^2$)."],
  ]),
];

// ───────────── Première : ondes mécaniques ─────────────

const ondes1: Generator[] = [
  (r) => {
    const f = int(r, 1, 40) * 50, v = pick(r, [340, 1500, 5000, 1450]);
    return oneOf(r, [
      () => numeric(`Onde de fréquence $${f}$ Hz, célérité $${v}$ m/s. Longueur d'onde (m) ?`, v / f, `$\\lambda = \\dfrac{v}{f} = \\dfrac{${v}}{${f}}$.`, "m", 0.01),
      () => {
        const lam = Number((v / f).toPrecision(3)), c = Math.round(lam * f * 100) / 100;
        return numeric(`$\\lambda = ${tex(lam)}$ m et $f = ${f}$ Hz. Célérité (m/s) ?`, c, `$v = \\lambda \\times f = ${tex(lam)} \\times ${f} = ${tex(c)}$ m/s.`, "m/s", Math.max(0.5, c * 0.005));
      },
    ]);
  },
  (r) => {
    const d = int(r, 1, 40) * 17;
    return numeric(`Retard d'un son entre deux micros distants de $${d}$ m ($v = 340$ m/s) ?`, d / 340, `$\\tau = \\dfrac{d}{v} = \\dfrac{${d}}{340}$ s.`, "s", 0.001);
  },
  cards([
    ["Célérité du son dans l'eau (environ) ?", "$1\\,500$ m/s", ["$340$ m/s", "$3 \\times 10^8$ m/s", "$15$ m/s"], "Le son va plus vite dans les liquides."],
    ["Une onde progressive transporte…", "de l'énergie, sans transport de matière", ["de la matière", "de la matière et de l'énergie", "uniquement de la chaleur"], "Définition d'une onde mécanique."],
    ["La période spatiale d'une onde s'appelle…", "la longueur d'onde", ["la fréquence", "la période", "l'amplitude"], "Notée $\\lambda$."],
    ["Une onde transversale…", "déforme le milieu perpendiculairement à sa propagation", ["déforme le milieu dans le sens de propagation", "ne se propage que dans le vide", "n'a pas de fréquence"], "Exemple : la corde ; le son est longitudinal."],
  ]),
  claims([
    ["Le son est une onde mécanique longitudinale.", true, "Compression et dilatation de l'air dans le sens de propagation."],
    ["La fréquence d'une onde change quand elle passe dans un autre milieu.", false, "La fréquence reste la même ; la célérité et $\\lambda$ changent."],
    ["$\\lambda = v \\times T$", true, "Équivalent à $\\lambda = v/f$."],
  ]),
];

// ───────────── Première : lentilles ─────────────

const lentilles: Generator[] = [
  (r) => {
    const n = pick(r, [2, 3, 1.5, 5]);
    const f = n === 3 ? 2 * int(r, 1, 15) : n === 5 ? 4 * int(r, 1, 8) : int(r, 2, 30);
    const oa = -n * f, oap = (n * f) / (n - 1);
    return oneOf(r, [
      () => numeric(`Lentille convergente $f' = ${f}$ cm, objet à $\\overline{OA} = ${tex(oa)}$ cm. Position de l'image $\\overline{OA'}$ (cm) ?`, oap, `$\\dfrac{1}{\\overline{OA'}} = \\dfrac{1}{f'} + \\dfrac{1}{\\overline{OA}} = \\dfrac{1}{${f}} - \\dfrac{1}{${tex(-oa)}}$, donc $\\overline{OA'} = ${tex(oap)}$ cm.`, "cm", 0.05),
      () => numeric(`$\\overline{OA} = ${tex(oa)}$ cm et $\\overline{OA'} = ${tex(oap)}$ cm. Grandissement $\\gamma$ ?`, oap / oa, `$\\gamma = \\dfrac{\\overline{OA'}}{\\overline{OA}} = ${tex(oap / oa)}$ : image renversée.`, undefined, 0.01),
    ]);
  },
  (r) => {
    const [fcm, C] = pick(r, [[50, 2], [20, 5], [25, 4], [10, 10], [12.5, 8], [100, 1], [5, 20]] as const);
    return r() < 0.5
      ? numeric(`Vergence d'une lentille de distance focale $${tex(fcm)}$ cm (en dioptries) ?`, C, `$C = \\dfrac{1}{f'}$ avec $f'$ en mètres : $\\dfrac{1}{${tex(fcm / 100)}}$.`, "δ")
      : numeric(`Distance focale d'une lentille de $${C}$ δ (en cm) ?`, fcm, `$f' = \\dfrac{1}{C} = ${tex(1 / C)}$ m.`, "cm", 0.01);
  },
  (r) => {
    const AB = pick(r, [1, 2, 3, 4, 5]), g = pick(r, [-3, -2, -1, -0.5, 2, 3]);
    return numeric(`Objet de $${AB}$ cm, grandissement $\\gamma = ${tex(g)}$. Taille algébrique de l'image $\\overline{A'B'}$ (cm) ?`, g * AB, `$\\overline{A'B'} = \\gamma \\times \\overline{AB} = ${tex(g)} \\times ${AB}$.`, "cm", 0.01);
  },
  claims([
    ["Un objet placé au-delà du foyer d'une lentille convergente donne une image réelle et renversée.", true, "L'image se forme de l'autre côté de la lentille."],
    ["Un objet placé entre le foyer et la lentille donne une image réelle.", false, "L'image est virtuelle et droite : c'est la loupe."],
    ["Un rayon passant par le centre optique n'est pas dévié.", true, "Règle de construction."],
    ["L'œil peut être modélisé par une lentille convergente et un écran (la rétine).", true, "Modèle de l'œil réduit."],
    ["Un grandissement négatif signifie une image renversée.", true, "Le signe donne le sens."],
  ]),
];

// ───────────── Terminale : acides, bases, pH ─────────────

const acidesBases: Generator[] = [
  (r) => {
    const k = int(r, 1, 13);
    return oneOf(r, [
      () => numeric(`$[\\mathrm{H_3O^+}] = 10^{-${k}}$ mol/L. pH ?`, k, `$\\mathrm{pH} = -\\log[\\mathrm{H_3O^+}] = ${k}$.`),
      () => mcq(r, `pH $= ${k}$. $[\\mathrm{H_3O^+}] = \\;?$`, `$10^{-${k}}$ mol/L`, [`$10^{${k}}$ mol/L`, `$${k}$ mol/L`, `$10^{-${14 - k}}$ mol/L`], `$[\\mathrm{H_3O^+}] = 10^{-\\mathrm{pH}}$.`),
      () => mcq(r, `Une solution de pH $${k}$ à 25 °C est…`, k < 7 ? "acide" : k > 7 ? "basique" : "neutre", ["acide", "basique", "neutre"], `Neutre à pH 7, acide en dessous, basique au-dessus.`),
    ]);
  },
  (r) => {
    // [acide, base, leurres pour la base conjuguée, leurres pour l'acide conjugué]
    const [acid, base, wrongBases, wrongAcids] = pick(r, [
      ["CH_3COOH", "CH_3COO^-", ["CH_3COOH_2^+", "CH_3CO^+", "HO^-"], ["CH_3COO^{2-}", "CH_3COOH_2^+", "H_3O^+"]],
      ["NH_4^+", "NH_3", ["NH_2^-", "NH_5^{2+}", "H_2O"], ["NH_2^-", "NH_4", "H_3O^+"]],
      ["H_2O", "HO^-", ["H_3O^+", "O^{2-}", "H_2"], ["H_3O^+", "O^{2-}", "H_2O_2"]],
      ["H_3O^+", "H_2O", ["HO^-", "H_2O^+", "H_4O^{2+}"], ["HO^-", "H_4O^{2+}", "H_2O_2"]],
      ["HCOOH", "HCOO^-", ["HCOOH_2^+", "COOH^-", "HO^-"], ["HCOO^{2-}", "HCOOH_2^+", "H_3O^+"]],
      ["H_2CO_3", "HCO_3^-", ["CO_3^{2-}", "H_3CO_3^+", "CO_2"], ["CO_3^{2-}", "H_3CO_3^+", "H_3O^+"]],
      ["HCO_3^-", "CO_3^{2-}", ["H_2CO_3", "HCO_3^{2-}", "CO_2"], ["H_2CO_3", "HCO_3", "CO_3^{2-}"]],
      ["C_6H_5COOH", "C_6H_5COO^-", ["C_6H_5COOH_2^+", "C_6H_5^-", "HO^-"], ["C_6H_5COO^{2-}", "C_6H_5COOH_2^+", "H_3O^+"]],
    ] as const);
    const m = (x: string) => `$\\mathrm{${x}}$`;
    const right = r() < 0.5;
    return oneOf(r, [
      () => mcq(r, `Base conjuguée de l'acide ${m(acid)} ?`, m(base), wrongBases.map(m), `L'acide cède un proton $\\mathrm{H^+}$ : couple $\\mathrm{${acid}/${base}}$.`),
      () => mcq(r, `Acide conjugué de la base ${m(base)} ?`, m(acid), wrongAcids.map(m), `La base capte un proton $\\mathrm{H^+}$ : couple $\\mathrm{${acid}/${base}}$.`),
      () => tf(`Le couple $\\mathrm{${right ? `${acid}/${base}` : `${base}/${acid}`}}$ est écrit dans le bon ordre (acide/base).`, right, `Un couple s'écrit Acide/Base ; l'acide est l'espèce qui possède un $\\mathrm{H^+}$ de plus : $\\mathrm{${acid}/${base}}$.`),
    ]);
  },
  (r) => {
    const pKa = pick(r, [3.8, 4.2, 4.8, 9.2, 6.4, 7.5]), pH = Math.round((pKa + nonZero(r, 3)) * 10) / 10;
    return mcq(r, `Couple de $\\mathrm{p}K_a = ${tex(pKa)}$ dans une solution de pH $${tex(pH)}$ : quelle forme prédomine ?`, pH < pKa ? "la forme acide" : "la forme basique", ["la forme acide", "la forme basique", "les deux à égalité"], `pH ${pH < pKa ? "<" : ">"} p$K_a$ : la forme ${pH < pKa ? "acide" : "basique"} prédomine.`);
  },
  (r) => {
    const Cb = pick(r, [0.01, 0.02, 0.05, 0.1]), Vbe = pick(r, [8, 10, 12, 15, 20]), Va = pick(r, [10, 20, 25]);
    return numeric(`Titrage d'un acide ($V_a = ${Va}$ mL) par une base à $C_b = ${tex(Cb)}$ mol/L, l'acide et la base réagissant mole à mole ; équivalence à $V_E = ${Vbe}$ mL. $C_a$ (mol/L) ?`, (Cb * Vbe) / Va, `À l'équivalence : $C_a V_a = C_b V_E$, donc $C_a = \\dfrac{${tex(Cb)} \\times ${Vbe}}{${Va}}$.`, "mol/L", 0.0005);
  },
  (r) => {
    const m = pick(r, [1.5, 2, 2.5, 3, 4, 5, 6, 8]), e = int(r, 2, 4);
    const C = m * 10 ** -e;
    const Cs = `${tex(m)} \\times 10^{-${e}}`;
    const pHa = Math.round(-Math.log10(C) * 100) / 100;
    const pKa = pick(r, [3.8, 4.2, 4.8, 9.2, 6.4]), ratio = pick(r, [2, 5, 0.5, 0.2, 3, 4]);
    const pHb = Math.round((pKa + Math.log10(ratio)) * 100) / 100;
    return oneOf(r, [
      () => numeric(`Solution d'acide fort (réaction totale avec l'eau) à $C = ${Cs}$ mol/L. pH (au centième) ?`, pHa, `$[\\mathrm{H_3O^+}] = C$, donc $\\mathrm{pH} = -\\log(${Cs}) \\approx ${tex(pHa, 2)}$.`, undefined, 0.02, 2),
      () => numeric(`Solution de base forte (hydroxyde de sodium) à $C = ${Cs}$ mol/L, à 25 °C. pH (au centième) ?`, Math.round((14 + Math.log10(C)) * 100) / 100, `$[\\mathrm{HO^-}] = C$ et $[\\mathrm{H_3O^+}] = \\dfrac{K_e}{C}$, donc $\\mathrm{pH} = 14 + \\log(${Cs}) \\approx ${tex(14 + Math.log10(C), 2)}$.`, undefined, 0.02, 2),
      () => numeric(`Couple $\\mathrm{AH/A^-}$ de $\\mathrm{p}K_a = ${tex(pKa)}$. Une solution contient $[\\mathrm{A^-}] = ${tex(ratio)} \\times [\\mathrm{AH}]$. pH (au centième) ?`, pHb, `$\\mathrm{pH} = \\mathrm{p}K_a + \\log\\dfrac{[\\mathrm{A^-}]}{[\\mathrm{AH}]} = ${tex(pKa)} + \\log ${tex(ratio)} \\approx ${tex(pHb, 2)}$.`, undefined, 0.02, 2),
      () => numeric(`Constante d'acidité $K_a = ${Cs}$. $\\mathrm{p}K_a$ (au centième) ?`, pHa, `$\\mathrm{p}K_a = -\\log K_a = -\\log(${Cs}) \\approx ${tex(pHa, 2)}$.`, undefined, 0.02, 2),
    ]);
  },
  claims([
    ["Un acide selon Brønsted est une espèce capable de céder un proton $\\mathrm{H^+}$.", true, "Définition de Brønsted."],
    ["Diluer 10 fois un acide fort augmente son pH d'une unité.", true, "$[\\mathrm{H_3O^+}]$ est divisée par 10."],
    ["L'eau est une espèce amphotère.", true, "Elle est acide dans $\\mathrm{H_2O/HO^-}$ et base dans $\\mathrm{H_3O^+/H_2O}$."],
    ["À pH = p$K_a$, la forme acide prédomine nettement.", false, "Les deux formes sont en concentrations égales."],
  ]),
];

// ───────────── Terminale : cinétique ─────────────

const cinetique: Generator[] = [
  (r) => {
    const c1 = pick(r, [0.5, 0.8, 1, 2]), dc = pick(r, [0.1, 0.2, 0.25]), dt = pick(r, [10, 20, 50, 100]);
    return numeric(`La concentration d'un réactif passe de $${tex(c1)}$ à $${tex(c1 - dc)}$ mol/L en $${dt}$ s. Vitesse moyenne de disparition (mol·L⁻¹·s⁻¹) ?`, dc / dt, `$v = -\\dfrac{\\Delta[A]}{\\Delta t} = \\dfrac{${tex(dc)}}{${dt}}$.`, undefined, 0.00005);
  },
  (r) => {
    const c0 = pick(r, [0.8, 1, 1.6, 2, 4]), n = int(r, 1, 4), t12 = pick(r, [5, 10, 20, 30]);
    return oneOf(r, [
      () => numeric(`Réaction d'ordre 1, $[A]_0 = ${tex(c0)}$ mol/L, $t_{1/2} = ${t12}$ min. $[A]$ après $${n * t12}$ min ?`, c0 / 2 ** n, `${n} temps de demi-réaction : $[A] = \\dfrac{${tex(c0)}}{2^{${n}}}$.`, "mol/L", 0.001),
      () => numeric(`Constante de vitesse $k = ${tex(0.693 / t12, 4)}$ min⁻¹ (ordre 1). Temps de demi-réaction (min, arrondi) ?`, t12, `$t_{1/2} = \\dfrac{\\ln 2}{k} \\approx \\dfrac{0{,}693}{k}$.`, "min", 0.5),
    ]);
  },
  // Facteurs cinétiques (leurres choisis pour qu'aucun ne soit juste : « accélère la réaction » l'était aussi pour le catalyseur).
  cards([
    ["Effet d'une élévation de température sur la vitesse d'une réaction ?", "elle l'augmente en général", ["elle la diminue", "elle ne la modifie pas", "elle augmente la quantité finale de produit"], "Les chocs entre entités sont plus nombreux et plus efficaces."],
    ["Effet d'un catalyseur sur une transformation ?", "il l'accélère sans modifier l'état final", ["il augmente l'avancement final", "il est consommé comme un réactif", "il ralentit la transformation"], "Il est régénéré en fin de réaction."],
    ["Effet d'une dilution du milieu réactionnel sur la vitesse de réaction ?", "elle la diminue", ["elle l'augmente", "elle ne la modifie pas", "elle modifie l'état final"], "La concentration des réactifs est un facteur cinétique."],
    ["Une trempe (refroidissement brutal, souvent avec dilution) sert à…", "bloquer quasiment l'évolution du système", ["accélérer la réaction", "modifier l'état final", "catalyser la réaction"], "On fige le système pour analyser sa composition à un instant donné."],
  ]),
  claims([
    ["Le temps de demi-réaction est la durée pour atteindre la moitié de l'avancement final.", true, "Définition."],
    ["Un catalyseur modifie l'état final du système.", false, "Il ne change que la vitesse, pas l'état final."],
    ["Pour une réaction d'ordre 1, la vitesse est proportionnelle à la concentration du réactif.", true, "$v = k[A]$."],
    ["La concentration des réactifs est un facteur cinétique.", true, "Plus de chocs efficaces."],
  ]),
];

// ───────────── Terminale : lois de Newton ─────────────

const newton: Generator[] = [
  (r) => {
    const m = pick(r, [0.5, 2, 5, 10, 1000, 1200]), a = pick(r, [0.5, 1, 2, 3, 5]);
    return r() < 0.5
      ? numeric(`Masse $${tex(m)}$ kg, accélération $${tex(a)}$ m/s². Résultante des forces (N) ?`, m * a, `Deuxième loi de Newton : $\\sum \\vec{F} = m\\vec{a}$.`, "N", 0.01)
      : numeric(`Force résultante $${tex(m * a)}$ N sur une masse de $${tex(m)}$ kg. Accélération (m/s²) ?`, a, `$a = \\dfrac{F}{m}$.`, "m/s²", 0.01);
  },
  (r) => {
    // Deuxième loi de Newton avec plusieurs forces : frottements, plan incliné, accélération d'un véhicule.
    const m = pick(r, [2, 5, 10, 20]), F = pick(r, [30, 40, 50, 80, 100]), f = pick(r, [5, 10, 15, 20]);
    const [alpha, sinA] = pick(r, [[30, 0.5], [10, 0.174], [20, 0.342], [45, 0.707]] as const);
    const mv = pick(r, [1000, 1200, 1500]), [vkmh, dt] = pick(r, [[100, 10], [90, 12], [72, 8], [50, 5]] as const);
    const aCar = vkmh / 3.6 / dt;
    return oneOf(r, [
      () => numeric(`Un solide de $${m}$ kg est tiré horizontalement par une force de $${F}$ N ; les frottements valent $${f}$ N. Accélération (m/s²) ?`, (F - f) / m,
        `Projection de $m\\vec a = \\vec F + \\vec f + \\vec P + \\vec R$ sur l'axe du mouvement ($\\vec P$ et $\\vec R$ se compensent) : $a = \\dfrac{${F} - ${f}}{${m}} = ${tex((F - f) / m)}$ m/s².`, "m/s²", 0.01, 2),
      () => numeric(`Un palet glisse sans frottement sur un plan incliné de $${alpha}°$ ($\\sin ${alpha}° \\approx ${tex(sinA)}$, $g = 10$ m/s²). Accélération le long de la pente (m/s²) ?`, 10 * sinA,
        `Seule la composante du poids parallèle à la pente agit : $ma = mg\\sin\\alpha$, donc $a = g\\sin\\alpha = ${tex(10 * sinA)}$ m/s² (indépendant de la masse).`, "m/s²", 0.02, 2),
      () => numeric(`Une voiture de $${mv}$ kg passe de 0 à $${vkmh}$ km/h en $${dt}$ s. Force résultante moyenne (N, à l'unité) ?`, Math.round(mv * aCar),
        `$a = \\dfrac{\\Delta v}{\\Delta t} = \\dfrac{${vkmh} / 3{,}6}{${dt}} \\approx ${tex(aCar, 3)}$ m/s², puis $F = ma \\approx ${tex(Math.round(mv * aCar))}$ N.`, "N", Math.max(2, mv * aCar * 0.005), 2),
    ]);
  },
  (r) => {
    // Lancer vertical vers le haut : v(t) = v0 - g t, z(t) = v0 t - g t²/2 (g = 10 m/s², axe vers le haut).
    const v0 = pick(r, [8, 12, 15, 18, 25]), t = pick(r, [0.4, 0.5, 0.8, 1, 1.2]);
    const z = v0 * t - 5 * t * t, v = v0 - 10 * t;
    return oneOf(r, [
      () => numeric(`Une balle est lancée verticalement vers le haut à $${v0}$ m/s depuis le sol ($g = 10$ m/s², sans frottement). Altitude atteinte à $t = ${tex(t)}$ s (m) ?`, z, `$z(t) = v_0 t - \\frac12 g t^2 = ${v0} \\times ${tex(t)} - 5 \\times ${tex(t)}^2 = ${tex(z)}$ m.`, "m", 0.01, 2),
      () => numeric(`Une balle est lancée verticalement vers le haut à $${v0}$ m/s ($g = 10$ m/s², sans frottement). Vitesse verticale (algébrique, axe vers le haut) à $t = ${tex(t)}$ s (m/s) ?`, v, `$v_z(t) = v_0 - g t = ${v0} - 10 \\times ${tex(t)} = ${tex(v)}$ m/s.`, "m/s", 0.01, 2),
      () => numeric(`Une balle est lancée verticalement vers le haut à $${v0}$ m/s depuis le sol ($g = 10$ m/s²). Durée totale avant de retomber au sol (s) ?`, v0 / 5, `$z(t) = t\\left(v_0 - \\frac{g t}{2}\\right) = 0$ pour $t = \\dfrac{2v_0}{g} = ${tex(v0 / 5)}$ s.`, "s", 0.01, 2),
    ]);
  },
  (r) => {
    const v = pick(r, [2, 4, 5, 10, 20]), R = pick(r, [1, 2, 4, 5, 10, 50]);
    return numeric(`Mouvement circulaire uniforme : $v = ${v}$ m/s, $R = ${R}$ m. Accélération (m/s²) ?`, (v * v) / R, `Accélération centripète $a = \\dfrac{v^2}{R}$.`, "m/s²", 0.01);
  },
  (r) => {
    const [h, t] = pick(r, [[5, 1], [20, 2], [45, 3], [80, 4], [1.25, 0.5], [1.8, 0.6], [3.2, 0.8]] as const);
    const v0 = pick(r, [2, 3, 5, 8, 10, 15]);
    return oneOf(r, [
      () => numeric(`Une balle lancée horizontalement depuis $${tex(h)}$ m de haut ($g = 10$). Durée de la chute (s) ?`, t, `Selon la verticale, $h = \\frac12 g t^2$ donc $t = \\sqrt{2h/g}$.`, "s", 0.01),
      () => numeric(`Une balle est lancée horizontalement à $${v0}$ m/s depuis $${tex(h)}$ m de haut ($g = 10$ m/s², sans frottement). À quelle distance horizontale touche-t-elle le sol (m) ?`, v0 * t, `Durée de chute $t = \\sqrt{\\dfrac{2h}{g}} = ${tex(t)}$ s ; horizontalement le mouvement est uniforme : $x = v_0 t = ${v0} \\times ${tex(t)} = ${tex(v0 * t)}$ m.`, "m", 0.01, 2),
    ]);
  },
  (r) => {
    // Satellite en orbite circulaire autour de la Terre : v = √(GM/r), T = 2πr/v.
    const [what, h] = pick(r, [["la Station spatiale internationale", 400], ["un satellite d'observation", 800], ["un satellite Galileo", 23200], ["un satellite géostationnaire", 35800]] as const);
    const rr = (6370 + h) * 1e3, GM = 3.99e14;
    const v = Math.sqrt(GM / rr), T = (2 * Math.PI * rr) / v;
    return oneOf(r, [
      () => numeric(`Vitesse de ${what} (orbite circulaire à $${tex(h)}$ km d'altitude ; $R_T = 6\\,370$ km, $GM_T = 3{,}99 \\times 10^{14}$ m³/s²), en km/s (au dixième) ?`, Math.round(v / 100) / 10, `$v = \\sqrt{\\dfrac{GM_T}{R_T + h}} = \\sqrt{\\dfrac{3{,}99 \\times 10^{14}}{${tex(rr / 1e6, 2)} \\times 10^{6}}} \\approx ${tex(v / 1000, 1)}$ km/s.`, "km/s", 0.1, 3),
      () => numeric(`Période de révolution de ${what} (orbite circulaire à $${tex(h)}$ km d'altitude ; $R_T = 6\\,370$ km, $GM_T = 3{,}99 \\times 10^{14}$ m³/s²), en heures (au dixième) ?`, Math.round(T / 360) / 10, `$v = \\sqrt{\\dfrac{GM_T}{r}} \\approx ${tex(v / 1000, 2)}$ km/s puis $T = \\dfrac{2\\pi r}{v} \\approx ${tex(T, 0)}$ s $\\approx ${tex(T / 3600, 1)}$ h.`, "h", 0.15, 3),
    ]);
  },
  (r) => {
    // Particule chargée dans un champ électrique uniforme : a = qE/m.
    const E = pick(r, [1, 2, 4, 5]) * 1e4;
    const [who, q, mass, mStr] = pick(r, [["un électron", 1.6e-19, 9.11e-31, "9{,}11 \\times 10^{-31}"], ["un proton", 1.6e-19, 1.67e-27, "1{,}67 \\times 10^{-27}"]] as const);
    const a = (q * E) / mass;
    // Mantisse à 2 chiffres significatifs, décimale toujours affichée (« 7,0 » et non « 7 »).
    const e = Math.floor(Math.log10(a)), mant = (a / 10 ** e).toFixed(1).replace(".", "{,}");
    const show = (mm: string, ee: number) => `$${mm} \\times 10^{${ee}}$ m/s²`;
    return mcq(r, `Valeur de l'accélération d'${who} dans un champ électrique uniforme $E = ${tex(E / 1e4)} \\times 10^{4}$ V/m (poids négligé ; $e = 1{,}6 \\times 10^{-19}$ C, $m = ${mStr}$ kg) ?`, show(mant, e),
      [show(mant, e - 1), show(mant, e + 1), show(mant, e - 4)],
      `Deuxième loi de Newton : $m\\vec a = q\\vec E$, donc $a = \\dfrac{eE}{m} \\approx ${mant} \\times 10^{${e}}$ m/s².`, undefined, 3);
  },
  claims([
    ["Dans un champ de pesanteur uniforme, la trajectoire d'un projectile lancé obliquement est une parabole.", true, "Mouvement uniforme horizontalement, accéléré verticalement."],
    ["La masse d'un objet en chute libre influence son accélération.", false, "Sans frottements, $a = g$ pour tous les objets."],
    ["Pour un satellite en orbite circulaire, $T^2 / a^3$ est constant (3e loi de Kepler).", true, "Pour un même astre attracteur."],
    ["La 2e loi de Newton s'applique dans un référentiel galiléen.", true, "Hypothèse indispensable."],
  ]),
];

// ───────────── Terminale : diffraction, interférences, Doppler ─────────────

const ondesT: Generator[] = [
  (r) => {
    const lam = int(r, 40, 80) * 10, a = pick(r, [5, 10, 20, 25, 40, 50, 100]);
    return numeric(`Diffraction : $\\lambda = ${lam}$ nm, fente de largeur $a = ${a}$ µm. Écart angulaire $\\theta = \\lambda/a$ (en mrad) ?`, (lam / 1000 / a) * 1000, `$\\theta = \\dfrac{${lam} \\times 10^{-9}}{${a} \\times 10^{-6}}$ rad.`, "mrad", 0.05);
  },
  (r) => {
    const lam = int(r, 40, 80) * 10, D = pick(r, [1, 1.5, 2, 3]), b = pick(r, [0.1, 0.2, 0.25, 0.5, 1]);
    return numeric(`Fentes d'Young : $\\lambda = ${lam}$ nm, $D = ${tex(D)}$ m, $b = ${tex(b)}$ mm. Interfrange $i$ (mm) ?`, (lam * 1e-9 * D) / (b * 1e-3) * 1000, `$i = \\dfrac{\\lambda D}{b}$.`, "mm", 0.01);
  },
  (r) => {
    const lam = pick(r, [400, 500, 600]), k = int(r, 1, 4);
    const constructive = r() < 0.5;
    const delta = constructive ? k * lam : (k + 0.5) * lam;
    return tf(`Différence de marche $\\delta = ${tex(delta)}$ nm pour $\\lambda = ${lam}$ nm : les interférences sont constructives.`, constructive, constructive ? `$\\delta = ${k}\\lambda$ : multiple entier de $\\lambda$.` : `$\\delta = (${k} + \\frac12)\\lambda$ : interférences destructives.`);
  },
  (r) => {
    // Effet Doppler pour v << c : |Δf| = f·v/c (son : c = 340 m/s).
    const f = pick(r, [440, 500, 680, 800, 1000]), v = pick(r, [10, 17, 20, 25, 34]);
    const df = (f * v) / 340;
    const approach = r() < 0.5;
    return oneOf(r, [
      () => numeric(`Une sirène émet un son de $${f}$ Hz et ${approach ? "s'approche" : "s'éloigne"} d'un observateur immobile à $${v}$ m/s. Fréquence perçue (Hz, à l'unité) ? (On admet $|\\Delta f| = f\\,\\dfrac{v}{c}$, $c = 340$ m/s.)`, Math.round(approach ? f + df : f - df),
        `$|\\Delta f| = ${f} \\times \\dfrac{${v}}{340} \\approx ${tex(df, 1)}$ Hz ; la source ${approach ? "s'approche : le son perçu est plus aigu" : "s'éloigne : le son perçu est plus grave"}, $f_R \\approx ${Math.round(approach ? f + df : f - df)}$ Hz.`, "Hz", 1, 2),
      () => numeric(`Un véhicule émet un son de $${f}$ Hz ; un observateur immobile perçoit $${tex(f + df, 1)}$ Hz à son approche. Vitesse du véhicule (m/s) ? (On admet $\\Delta f = f\\,\\dfrac{v}{c}$, $c = 340$ m/s.)`, v,
        `$v = c\\,\\dfrac{\\Delta f}{f} = 340 \\times \\dfrac{${tex(df, 1)}}{${f}} \\approx ${v}$ m/s.`, "m/s", 0.3, 2),
    ]);
  },
  claims([
    ["Quand une source sonore s'approche, la fréquence perçue est plus élevée.", true, "Effet Doppler : son plus aigu."],
    ["La diffraction est d'autant plus marquée que l'ouverture est petite.", true, "$\\theta = \\lambda / a$."],
    ["Deux ondes de fréquences différentes peuvent produire des interférences stables.", false, "Il faut des sources cohérentes (même fréquence)."],
    ["L'effet Doppler permet de mesurer la vitesse d'une voiture (radar).", true, "Décalage de fréquence de l'onde réfléchie."],
    ["Le décalage vers le rouge des galaxies indique qu'elles s'éloignent.", true, "Effet Doppler-Fizeau."],
  ]),
];

// ───────────── Terminale : thermodynamique ─────────────

const thermo: Generator[] = [
  (r) => {
    const m = pick(r, [0.5, 1, 2, 5]), dT = pick(r, [10, 20, 25, 50, 80]);
    return numeric(`Énergie pour élever de $${dT}$ °C la température de $${tex(m)}$ kg d'eau ($c = 4{,}18$ kJ·kg⁻¹·K⁻¹), en kJ ?`, 4.18 * m * dT, `$Q = mc\\Delta T = ${tex(m)} \\times 4{,}18 \\times ${dT}$.`, "kJ", 0.05);
  },
  (r) => {
    const W = int(r, -50, 50) * 10, Q = int(r, -50, 50) * 10;
    return numeric(`Un système reçoit un travail $W = ${W}$ J et un transfert thermique $Q = ${Q}$ J. $\\Delta U$ (J) ?`, W + Q, `Premier principe : $\\Delta U = W + Q$.`, "J");
  },
  (r) => {
    const c = int(r, -40, 120);
    return r() < 0.5 ? numeric(`$${c}$ °C en kelvins ?`, c + 273.15, `$T(\\mathrm{K}) = \\theta(°\\mathrm{C}) + 273{,}15$.`, "K", 0.2) : numeric(`$${tex(c + 273.15)}$ K en °C ?`, c, `On retire $273{,}15$.`, "°C", 0.2);
  },
  (r) => {
    const dT = pick(r, [10, 15, 20, 25]), R = pick(r, [0.01, 0.02, 0.05, 0.1]);
    return numeric(`Paroi de résistance thermique $R_{th} = ${tex(R)}$ K/W, écart de température $${dT}$ K. Flux thermique (W) ?`, dT / R, `$\\Phi = \\dfrac{\\Delta T}{R_{th}}$.`, "W", 0.5);
  },
  (r) => {
    // Mélange de deux masses d'eau dans un calorimètre parfaitement isolé : m1(θf - θ1) + m2(θf - θ2) = 0.
    const m1 = pick(r, [100, 150, 200, 250, 300]), m2 = pick(r, [100, 200, 300, 400, 500]);
    const t1 = pick(r, [60, 70, 80, 90]), t2 = pick(r, [10, 15, 20, 25]);
    const final = (m1 * t1 + m2 * t2) / (m1 + m2);
    return numeric(`On mélange $${m1}$ g d'eau à $${t1}$ °C et $${m2}$ g d'eau à $${t2}$ °C dans un calorimètre parfaitement isolé. Température finale (°C, au dixième) ?`, Math.round(final * 10) / 10,
      `L'énergie cédée par l'eau chaude est reçue par l'eau froide : $m_1 c(\\theta_f - ${t1}) + m_2 c(\\theta_f - ${t2}) = 0$, donc $\\theta_f = \\dfrac{${m1} \\times ${t1} + ${m2} \\times ${t2}}{${m1 + m2}} \\approx ${tex(final, 1)}$ °C.`, "°C", 0.1, 2);
  },
  (r) => {
    // Loi phénoménologique de Newton : θ(t) = θext + (θ0 − θext)·e^(−t/τ).
    const [what, th0, fem] = pick(r, [["Une tasse de thé", 80, true], ["Un café", 90, false], ["Une canette sortie du réfrigérateur", 5, true], ["Un plat sorti du four", 180, false]] as const);
    const placed = fem ? "placée" : "placé";
    const ext = 20, tau = pick(r, [5, 10, 15, 20, 30]), k = pick(r, [0.5, 1, 2, 3]);
    const t = k * tau, th = ext + (th0 - ext) * Math.exp(-k);
    // Pour retrouver τ, on évite t = 3τ : l'écart à θext, arrondi au dixième, deviendrait trop imprécis.
    const k2 = Math.min(k, 2), t2 = k2 * tau, th2 = ext + (th0 - ext) * Math.exp(-k2);
    return oneOf(r, [
      () => numeric(`${what} à $${th0}$ °C est ${placed} dans une pièce à $${ext}$ °C. On admet $\\theta(t) = \\theta_{ext} + (\\theta_0 - \\theta_{ext})\\,e^{-t/\\tau}$ avec $\\tau = ${tau}$ min. Température au bout de $${tex(t)}$ min (°C, au dixième) ?`, Math.round(th * 10) / 10,
        `$\\theta = ${ext} + (${th0} - ${ext})\\,e^{-${tex(t)}/${tau}} = ${ext} ${th0 > ext ? "+" : "-"} ${Math.abs(th0 - ext)} \\times e^{-${tex(k)}} \\approx ${tex(th, 1)}$ °C.`, "°C", 0.15, 3),
      () => numeric(`${what} à $${th0}$ °C est ${placed} dans une pièce à $${ext}$ °C ; on admet $\\theta(t) = \\theta_{ext} + (\\theta_0 - \\theta_{ext})\\,e^{-t/\\tau}$. Au bout de $${tex(t2)}$ min, sa température vaut $${tex(th2, 1)}$ °C. Constante de temps $\\tau$ (min, à l'unité) ?`, tau,
        `$e^{-t/\\tau} = \\dfrac{\\theta - \\theta_{ext}}{\\theta_0 - \\theta_{ext}} = \\dfrac{${tex(Math.round(th2 * 10) / 10 - ext, 1)}}{${th0 - ext}}$, donc $\\tau = \\dfrac{-t}{\\ln\\left(\\frac{${tex(Math.round(th2 * 10) / 10 - ext, 1)}}{${th0 - ext}}\\right)} \\approx ${tau}$ min.`, "min", 0.6, 3),
    ]);
  },
  pairs(
    [["la chaleur qui traverse un mur", "conduction"], ["l'air chaud qui monte au-dessus d'un radiateur", "convection"], ["la chaleur du Soleil qui nous atteint", "rayonnement"], ["une cuillère qui chauffe dans un thé", "conduction"], ["l'eau qui circule dans une casserole chauffée", "convection"], ["la chaleur ressentie devant un feu de cheminée", "rayonnement"]],
    { ask: (a) => `Mode de transfert thermique : ${a} ?`, explain: (a, b) => `${a.charAt(0).toUpperCase() + a.slice(1)} : ${b}.` },
  )[0],
  claims([
    ["Le transfert thermique spontané se fait du corps chaud vers le corps froid.", true, "Deuxième principe (qualitatif)."],
    ["Le rayonnement nécessite un milieu matériel.", false, "Il se propage aussi dans le vide."],
    ["L'énergie interne d'un système isolé est constante.", true, "Ni travail ni transfert thermique échangés."],
  ]),
];

// ───────────── Terminale : circuit RC ─────────────

const rc: Generator[] = [
  (r) => {
    const R = pick(r, [1, 2, 3.3, 4.7, 5, 10, 15, 22, 33, 47, 68, 100]), C = pick(r, [1, 2.2, 4.7, 10, 22, 47, 100, 220]);
    return numeric(`$R = ${tex(R)}$ kΩ et $C = ${tex(C)}$ µF. Constante de temps $\\tau$ (ms) ?`, R * C, `$\\tau = RC = ${tex(R)} \\times 10^3 \\times ${tex(C)} \\times 10^{-6}$ s $= ${tex(R * C)}$ ms.`, "ms", 0.01);
  },
  (r) => {
    const E = int(r, 3, 24);
    return oneOf(r, [
      () => numeric(`Décharge d'un condensateur initialement à $${E}$ V. Tension à $t = \\tau$ (arrondie au dixième) ?`, Math.round(0.37 * E * 10) / 10, `$u_C(\\tau) = E\\,e^{-1} \\approx 0{,}37E$.`, "V", 0.15),
      () => numeric(`Charge d'un condensateur sous $E = ${E}$ V. Tension $u_C$ à $t = \\tau$ (arrondie au dixième) ?`, Math.round(0.63 * E * 10) / 10, `$u_C(\\tau) = E(1 - e^{-1}) \\approx 0{,}63E$.`, "V", 0.15),
      () => numeric(`Charge sous $E = ${E}$ V : tension $u_C$ au bout de $5\\tau$ (environ) ?`, E, `Après $5\\tau$, le condensateur est chargé à plus de 99 %.`, "V", 0.1),
    ]);
  },
  (r) => {
    const C = pick(r, [1, 2.2, 4.7, 10, 47, 100, 220]), U = int(r, 3, 24);
    return numeric(`Condensateur de $${tex(C)}$ µF sous $${U}$ V. Charge $q$ (µC) ?`, C * U, `$q = C \\times u_C$.`, "µC");
  },
  claims([
    ["L'intensité dans un condensateur est $i = C\\dfrac{du_C}{dt}$.", true, "Relation caractéristique."],
    ["La tension aux bornes d'un condensateur peut varier brusquement.", false, "Elle est continue : $u_C$ ne subit pas de saut."],
    ["Plus $\\tau$ est grand, plus la charge est lente.", true, "$\\tau = RC$ caractérise la durée du régime transitoire."],
    ["En régime permanent (condensateur chargé), le courant est nul.", true, "$u_C$ constante donc $i = 0$."],
  ]),
];

// ───────────── Terminale : radioactivité ─────────────

const radioactivite: Generator[] = [
  (r) => {
    const N0 = pick(r, [1000, 2000, 4000, 8000, 1600, 3200, 6400, 12800, 64000, 1e6, 5e5, 2.4e4]);
    // Nombre de demi-vies tel que le nombre de noyaux restant soit entier.
    const n = int(r, 1, Math.max(1, Math.min(6, [1, 2, 3, 4, 5, 6].filter((k) => Number.isInteger(N0 / 2 ** k)).length)));
    return numeric(`$N_0 = ${tex(N0)}$ noyaux. Combien en reste-t-il après $${n}$ demi-vie${n > 1 ? "s" : ""} ?`, N0 / 2 ** n, `$N = \\dfrac{N_0}{2^{${n}}} = \\dfrac{${tex(N0)}}{${2 ** n}}$.`, undefined, 0.5);
  },
  (r) => {
    const [iso, t12, unit] = pick(r, [["le carbone 14", 5730, "ans"], ["l'iode 131", 8, "jours"], ["le cobalt 60", 5.3, "ans"], ["le césium 137", 30, "ans"], ["le radon 222", 3.8, "jours"]] as const);
    const n = int(r, 1, 4);
    return oneOf(r, [
      () => numeric(`Demi-vie de ${iso} : $${tex(t12)}$ ${unit}. Durée pour que l'activité soit divisée par $${2 ** n}$ (${unit}) ?`, n * t12, `$${2 ** n} = 2^{${n}}$ : il faut ${n} demi-vie${n > 1 ? "s" : ""}.`, unit, 0.01),
      () => numeric(`Après $${tex(n * t12)}$ ${unit}, quel pourcentage de ${iso} reste-t-il ($t_{1/2} = ${tex(t12)}$ ${unit}) ?`, 100 / 2 ** n, `${n} demi-vie${n > 1 ? "s" : ""} : $\\dfrac{100}{2^{${n}}}$ %.`, "%", 0.01),
    ]);
  },
  (r) => {
    // Loi de décroissance N(t) = N0·e^(−λt), activité A = λN, pour des durées qui ne sont pas des multiples de t½.
    const [iso, t12, unit, perS] = pick(r, [["l'iode 131", 8.02, "jours", 8.02 * 86400], ["le technétium 99m", 6.01, "heures", 6.01 * 3600], ["le fluor 18", 110, "minutes", 110 * 60], ["le phosphore 32", 14.3, "jours", 14.3 * 86400]] as const);
    const t = Math.round(pick(r, [0.3, 0.7, 1.5, 2.5, 3.2]) * t12 * 10) / 10, A0 = pick(r, [2, 4, 5, 8]) * 1e6;
    const frac = Math.exp((-Math.LN2 * t) / t12), lam = Math.LN2 / perS;
    /** Écriture scientifique à 3 chiffres significatifs (mantisse entre 1 et 10). */
    const sciT = (x: number, shift = 0) => {
      const [m, ex] = x.toExponential(2).split("e");
      return `$${m.replace(".", "{,}")} \\times 10^{${Number(ex) + shift}}$ s⁻¹`;
    };
    return oneOf(r, [
      () => numeric(`Pour ${iso} ($t_{1/2} = ${tex(t12)}$ ${unit}), quel pourcentage des noyaux reste-t-il au bout de $${tex(t)}$ ${unit} ? (au dixième ; $N = N_0\\,e^{-\\lambda t}$)`, Math.round(frac * 1000) / 10,
        `$\\lambda t = \\dfrac{\\ln 2}{t_{1/2}}\\,t = \\dfrac{\\ln 2 \\times ${tex(t)}}{${tex(t12)}} \\approx ${tex((Math.LN2 * t) / t12, 3)}$, donc $\\dfrac{N}{N_0} = e^{-${tex((Math.LN2 * t) / t12, 3)}} \\approx ${tex(frac * 100, 1)}\\,\\%$.`, "%", 0.2, 3),
      () => numeric(`Un échantillon de ${iso.replace(/^l'|^le /, "")} ($t_{1/2} = ${tex(t12)}$ ${unit}) a une activité initiale de $${tex(A0 / 1e6)}$ MBq ($1$ MBq $= 10^{6}$ Bq). Activité au bout de $${tex(t)}$ ${unit} (MBq, au centième) ?`, Math.round((A0 / 1e6) * frac * 100) / 100,
        `$A = A_0\\,e^{-\\lambda t}$ avec $\\lambda t \\approx ${tex((Math.LN2 * t) / t12, 3)}$ : $A \\approx ${tex(A0 / 1e6)} \\times ${tex(frac, 3)} \\approx ${tex((A0 / 1e6) * frac, 2)}$ MBq.`, "MBq", 0.02, 3),
      () => mcq(r, `Constante radioactive $\\lambda$ de ${iso} ($t_{1/2} = ${tex(t12)}$ ${unit}), en s⁻¹ ?`, sciT(lam), [sciT(lam, 1), sciT(perS / Math.LN2), sciT(Math.LN2 / t12)],
        `$\\lambda = \\dfrac{\\ln 2}{t_{1/2}}$ avec $t_{1/2}$ en secondes : $t_{1/2} = ${tex(perS, 0)}$ s, donc $\\lambda \\approx$ ${sciT(lam)}.`, undefined, 3),
    ]);
  },
  pairs(
    [["α", "un noyau d'hélium"], ["β⁻", "un électron"], ["β⁺", "un positon"], ["γ", "un rayonnement électromagnétique"]],
    { ask: (a) => `Une désintégration ${a} émet…`, reverse: (b) => `Quel type de radioactivité émet ${b} ?`, explain: (a, b) => `Radioactivité ${a} : émission d'${b.replace(/^un /, "un ")}.` },
  )[0],
  (r) => {
    const [sym, z, a, daughter] = pick(r, [["C", 6, 14, "N"], ["Co", 27, 60, "Ni"], ["Sr", 38, 90, "Y"], ["I", 53, 131, "Xe"]] as const);
    return mcq(r, `Désintégration $\\beta^-$ : ${nuclide(sym, z, a)} $\\rightarrow {}^{A}_{Z}\\mathrm{${daughter}} + {}^{\\;\\,0}_{-1}e$. $(A\\,;\\,Z) = \\;?$`, `$(${a}\\,;\\,${z + 1})$`, [`$(${a}\\,;\\,${z - 1})$`, `$(${a - 1}\\,;\\,${z + 1})$`, `$(${a - 4}\\,;\\,${z - 2})$`], `Conservation : $A$ inchangé, $Z$ augmente de 1.`);
  },
  claims([
    ["La désintégration d'un noyau donné est un phénomène aléatoire.", true, "On ne peut prédire que des comportements statistiques."],
    ["La demi-vie dépend de la quantité initiale de noyaux.", false, "Elle est caractéristique de l'isotope."],
    ["L'activité d'un échantillon s'exprime en becquerels (Bq).", true, "1 Bq = 1 désintégration par seconde."],
    ["$\\lambda = \\dfrac{\\ln 2}{t_{1/2}}$", true, "Lien entre constante radioactive et demi-vie."],
  ]),
];

export const PHYSIQUE: Record<string, Generator[]> = {
  "pc-2-atome": atome,
  "pc-2-mole": mole,
  "pc-2-solutions": solutions,
  "pc-2-transformations": transformations,
  "pc-2-mouvement": mouvement,
  "pc-2-ondes": ondes2,
  "pc-1-avancement": avancement,
  "pc-1-redox": redox,
  "pc-1-lewis": lewis,
  "pc-1-energie": energie,
  "pc-1-ondes": ondes1,
  "pc-1-lentilles": lentilles,
  "pc-t-acides-bases": acidesBases,
  "pc-t-cinetique": cinetique,
  "pc-t-newton": newton,
  "pc-t-ondes": ondesT,
  "pc-t-thermo": thermo,
  "pc-t-rc": rc,
  "pc-t-radioactivite": radioactivite,
};

