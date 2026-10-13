/** Générateurs de questions — Physique-Chimie (Seconde, Première, Terminale). */
import { type Generator, cards, claims, int, mcq, nonZero, numeric, oneOf, pairs, pick, tex, texMcq, tf } from "./kit";

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

function config(z: number) {
  const shells: Array<[string, number]> = [["1s", 2], ["2s", 2], ["2p", 6], ["3s", 2], ["3p", 6]];
  let left = z;
  const parts: string[] = [];
  for (const [name, cap] of shells) {
    if (left <= 0) break;
    const e = Math.min(cap, left);
    parts.push(`${name}^{${e}}`);
    left -= e;
  }
  return parts.join("\\,");
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
    const wrong = [config(z + 1), config(Math.max(1, z - 1)), right.replace(/\^\{(\d)\}$/, (_, d) => `^{${Number(d) + 1}}`)];
    return mcq(r, `Configuration électronique de $\\mathrm{${sym}}$ ($Z = ${z}$) ?`, `$${right}$`, wrong.map((w) => `$${w}$`), `On remplit $1s$, $2s$, $2p$, $3s$, $3p$ dans l'ordre avec $${z}$ électrons.`);
  },
  (r) => {
    const [sym, , z] = pick(r, ELEMENTS.filter(([, , zz]) => zz <= 18 && zz !== 2 && zz !== 10 && zz !== 18));
    const valence = z <= 2 ? z : z <= 10 ? z - 2 : z - 10;
    return numeric(`Combien d'électrons de valence pour $\\mathrm{${sym}}$ ($Z = ${z}$) ?`, valence, `Configuration $${config(z)}$ : ${valence} électron(s) sur la dernière couche.`);
  },
  pairs(
    [["proton", "positive"], ["électron", "négative"], ["neutron", "nulle"]],
    { ask: (a) => `Charge électrique d'un ${a} ?`, explain: (a, b) => `Le ${a} a une charge ${b}.` },
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
    const c = int(r, 1, 6), h = 2 * int(r, 1, 6), o = int(r, 0, 3), nN = int(r, 0, 1);
    const formula = `C_{${c}}H_{${h}}${nN ? "N" : ""}${o ? `O_{${o}}` : ""}`.replace(/_\{1\}/g, "");
    const M = c * ATOMS.C + h * ATOMS.H + o * ATOMS.O + nN * ATOMS.N;
    return numeric(`Masse molaire de $\\mathrm{${formula}}$ ? (H = 1, C = 12, N = 14, O = 16 g/mol)`, M, `$M = ${c} \\times 12 + ${h} \\times 1${nN ? " + 14" : ""}${o ? ` + ${o} \\times 16` : ""} = ${M}$ g/mol.`, "g/mol");
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
    const T = pick(r, [1, 2, 2.5, 4, 5, 10, 20]);
    return r() < 0.5
      ? numeric(`Période $T = ${tex(T)}$ ms. Fréquence (Hz) ?`, 1000 / T, `$f = \\dfrac{1}{T} = \\dfrac{1}{${tex(T / 1000)}}$.`, "Hz", 0.1)
      : numeric(`Fréquence $f = ${tex(1000 / T)}$ Hz. Période (ms) ?`, T, `$T = \\dfrac{1}{f}$, converti en millisecondes.`, "ms", 0.01);
  },
  (r) => {
    const t = pick(r, [0.2, 0.5, 1, 2, 3, 4]);
    return numeric(`Un écho revient $${tex(t)}$ s après le cri ($v = 340$ m/s). Distance de la paroi (m) ?`, (340 * t) / 2, `Aller-retour : $d = \\dfrac{v \\times t}{2} = \\dfrac{340 \\times ${tex(t)}}{2}$.`, "m", 0.5);
  },
  (r) => {
    const f = pick(r, [5, 12, 18, 25, 440, 1000, 15000, 25000, 40000, 100000]);
    const ans = f < 20 ? "infrason" : f <= 20000 ? "son audible" : "ultrason";
    return mcq(r, `Une onde sonore de $${tex(f)}$ Hz est…`, ans, ["infrason", "son audible", "ultrason", "onde lumineuse"], `L'oreille humaine perçoit de 20 Hz à 20 000 Hz environ.`);
  },
  (r) => {
    const n2 = pick(r, [1.33, 1.5, 2]);
    const i = pick(r, [[30, 0.5, "\\dfrac12"], [90, 1, "1"]] as const);
    return numeric(`Lumière passant de l'air ($n = 1$) à un milieu d'indice $${tex(n2)}$ avec $\\sin i_1 = ${i[2]}$. $\\sin i_2$ (arrondi à $0{,}01$) ?`, Math.round((i[1] / n2) * 100) / 100, `Snell-Descartes : $n_1 \\sin i_1 = n_2 \\sin i_2$, donc $\\sin i_2 = \\dfrac{${tex(i[1])}}{${tex(n2)}}$.`, undefined, 0.011);
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
    const n = pick(r, [1, 2, 3, 0.5]), x = pick(r, [0.2, 0.25, 0.5]);
    return numeric(`$\\mathrm{CH_4} + 2\\,\\mathrm{O_2} \\rightarrow \\mathrm{CO_2} + 2\\,\\mathrm{H_2O}$. Avancement $x = ${tex(x * n)}$ mol. Quantité d'eau formée ?`, 2 * x * n, `Coefficient 2 : $n(\\mathrm{H_2O}) = 2x$.`, "mol", 0.001);
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

const COUPLES: Array<[string, string, number]> = [
  ["Cu^{2+}", "Cu", 2], ["Fe^{3+}", "Fe^{2+}", 1], ["Zn^{2+}", "Zn", 2], ["Ag^+", "Ag", 1], ["H^+", "H_2", 2],
  ["I_2", "I^-", 2], ["Fe^{2+}", "Fe", 2], ["Al^{3+}", "Al", 3], ["Cl_2", "Cl^-", 2], ["MnO_4^-", "Mn^{2+}", 5],
];

const redox: Generator[] = [
  (r) => {
    const [ox, red] = pick(r, COUPLES);
    const others = COUPLES.filter(([o]) => o !== ox).flatMap(([o, rr]) => [o, rr]);
    return r() < 0.5
      ? mcq(r, `Dans le couple $\\mathrm{${ox}/${red}}$, l'oxydant est…`, `$\\mathrm{${ox}}$`, [`$\\mathrm{${red}}$`, ...others.slice(0, 2).map((o) => `$\\mathrm{${o}}$`)], `On écrit toujours le couple Ox/Red.`)
      : mcq(r, `Dans le couple $\\mathrm{${ox}/${red}}$, le réducteur est…`, `$\\mathrm{${red}}$`, [`$\\mathrm{${ox}}$`, ...others.slice(2, 4).map((o) => `$\\mathrm{${o}}$`)], `On écrit toujours le couple Ox/Red.`);
  },
  (r) => {
    const [ox, red, e] = pick(r, COUPLES);
    return numeric(`Combien d'électrons dans la demi-équation du couple $\\mathrm{${ox}/${red}}$ ?`, e, `$\\mathrm{${ox}} + ${e === 1 ? "" : e}\\,e^- = \\dots\\mathrm{${red}}$ (en équilibrant éléments et charges).`);
  },
  ...pairs(
    [["oxydant", "espèce capable de capter des électrons"], ["réducteur", "espèce capable de céder des électrons"], ["oxydation", "perte d'électrons"], ["réduction", "gain d'électrons"]],
    { ask: (a) => `Un(e) ${a}, c'est…`, reverse: (b) => `Comment appelle-t-on : ${b} ?`, explain: (a, b) => `${a} : ${b}.` },
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
    { ask: (a) => `Nombre de liaisons covalentes formées par un atome $\\mathrm{${a}}$ (règle du duet/octet) ?`, explain: (a, b) => `$\\mathrm{${a}}$ forme ${b} liaison(s).` },
  ),
  pairs(
    [["C", "0"], ["N", "1"], ["O", "2"], ["Cl", "3"], ["F", "3"], ["H", "0"]],
    { ask: (a) => `Doublets non liants autour de $\\mathrm{${a}}$ dans une molécule ?`, explain: (a, b) => `$\\mathrm{${a}}$ porte ${b} doublet(s) non liant(s).` },
  )[0],
  ...pairs(
    [["CH_4", "tétraédrique"], ["NH_3", "pyramidale"], ["H_2O", "coudée"], ["CO_2", "linéaire"]],
    { ask: (a) => `Géométrie de la molécule $\\mathrm{${a}}$ ?`, reverse: (b) => `Quelle molécule a une géométrie ${b} ?`, explain: (a, b) => `$\\mathrm{${a}}$ : ${b} (répulsion des doublets).` },
  ),
  pairs(
    [["H_2O", "polaire"], ["CO_2", "apolaire"], ["CH_4", "apolaire"], ["NH_3", "polaire"], ["HCl", "polaire"], ["O_2", "apolaire"]],
    { ask: (a) => `La molécule $\\mathrm{${a}}$ est…`, explain: (a, b) => `$\\mathrm{${a}}$ est ${b} (géométrie + électronégativités).` },
  )[0],
  (r) => {
    const [sym, , z] = pick(r, ELEMENTS.filter(([, , zz]) => zz <= 17 && ![2, 10].includes(zz)));
    const v = z <= 2 ? z : z <= 10 ? z - 2 : z - 10;
    return numeric(`Électrons de valence de $\\mathrm{${sym}}$ ($Z = ${z}$) ?`, v, `$${config(z)}$ : ${v} électron(s) de valence.`);
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
    const f = pick(r, [50, 100, 200, 250, 440, 500, 1000]), v = pick(r, [340, 1500, 5000]);
    return oneOf(r, [
      () => numeric(`Onde de fréquence $${f}$ Hz, célérité $${v}$ m/s. Longueur d'onde (m) ?`, v / f, `$\\lambda = \\dfrac{v}{f} = \\dfrac{${v}}{${f}}$.`, "m", 0.01),
      () => numeric(`$\\lambda = ${tex(v / f)}$ m et $f = ${f}$ Hz. Célérité (m/s) ?`, v, `$v = \\lambda \\times f$.`, "m/s", 0.5),
    ]);
  },
  (r) => {
    const d = pick(r, [17, 34, 68, 170, 340, 680]);
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
    const f = n === 3 ? pick(r, [4, 10, 20]) : n === 5 ? pick(r, [4, 8, 20]) : pick(r, [5, 10, 20, 15]);
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
  ...pairs(
    [["CH_3COOH/CH_3COO^-", "CH_3COOH"], ["NH_4^+/NH_3", "NH_4^+"], ["H_2O/HO^-", "H_2O"], ["H_3O^+/H_2O", "H_3O^+"], ["HCOOH/HCOO^-", "HCOOH"], ["HCl/Cl^-", "HCl"]],
    { ask: (a) => `Dans le couple $\\mathrm{${a}}$, l'acide est…`, explain: (a, b) => `Un couple s'écrit Acide/Base : l'acide est $\\mathrm{${b}}$.` },
  ).map((g) => ((r: () => number) => {
    const q = g(r);
    return q.type === "mcq" ? { ...q, choices: q.choices.map((c) => (c.startsWith("$") ? c : `$\\mathrm{${c}}$`)) } : q;
  }) as Generator),
  (r) => {
    const pKa = pick(r, [3.8, 4.2, 4.8, 9.2, 6.4, 7.5]), pH = Math.round((pKa + nonZero(r, 3)) * 10) / 10;
    return mcq(r, `Couple de $\\mathrm{p}K_a = ${tex(pKa)}$ dans une solution de pH $${tex(pH)}$ : quelle forme prédomine ?`, pH < pKa ? "la forme acide" : "la forme basique", ["la forme acide", "la forme basique", "les deux à égalité"], `pH ${pH < pKa ? "<" : ">"} p$K_a$ : la forme ${pH < pKa ? "acide" : "basique"} prédomine.`);
  },
  (r) => {
    const Cb = pick(r, [0.01, 0.02, 0.05, 0.1]), Vbe = pick(r, [8, 10, 12, 15, 20]), Va = pick(r, [10, 20, 25]);
    return numeric(`Titrage d'un acide ($V_a = ${Va}$ mL) par une base à $C_b = ${tex(Cb)}$ mol/L ; équivalence à $V_E = ${Vbe}$ mL. $C_a$ (mol/L) ?`, (Cb * Vbe) / Va, `À l'équivalence : $C_a V_a = C_b V_E$, donc $C_a = \\dfrac{${tex(Cb)} \\times ${Vbe}}{${Va}}$.`, "mol/L", 0.0005);
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
  pairs(
    [["augmenter la température", "accélère la réaction"], ["ajouter un catalyseur", "accélère la réaction sans être consommé"], ["diluer le milieu réactionnel", "ralentit la réaction"], ["refroidir brutalement (trempe)", "bloque quasiment la réaction"]],
    { ask: (a) => `Effet de : ${a} ?`, reverse: (b) => `Quel geste ${b} ?`, explain: (a, b) => `${a.charAt(0).toUpperCase() + a.slice(1)} ${b}.` },
  )[0],
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
    const t = pick(r, [1, 2, 3, 4, 5]);
    return oneOf(r, [
      () => numeric(`Chute libre sans vitesse initiale ($g = 10$). Vitesse après $${t}$ s (m/s) ?`, 10 * t, `$v = gt$.`, "m/s"),
      () => numeric(`Chute libre sans vitesse initiale ($g = 10$). Distance parcourue en $${t}$ s (m) ?`, 5 * t * t, `$z = \\frac12 g t^2 = 5 \\times ${t}^2$.`, "m"),
    ]);
  },
  (r) => {
    const v = pick(r, [2, 4, 5, 10, 20]), R = pick(r, [1, 2, 4, 5, 10, 50]);
    return numeric(`Mouvement circulaire uniforme : $v = ${v}$ m/s, $R = ${R}$ m. Accélération (m/s²) ?`, (v * v) / R, `Accélération centripète $a = \\dfrac{v^2}{R}$.`, "m/s²", 0.01);
  },
  (r) => {
    const [h, t] = pick(r, [[5, 1], [20, 2], [45, 3], [80, 4], [1.25, 0.5]] as const);
    return numeric(`Une balle lancée horizontalement depuis $${tex(h)}$ m de haut ($g = 10$). Durée de la chute (s) ?`, t, `Selon la verticale, $h = \\frac12 g t^2$ donc $t = \\sqrt{2h/g}$.`, "s", 0.01);
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
    const lam = pick(r, [400, 500, 600, 633, 800]), a = pick(r, [10, 20, 50, 100]);
    return numeric(`Diffraction : $\\lambda = ${lam}$ nm, fente de largeur $a = ${a}$ µm. Écart angulaire $\\theta = \\lambda/a$ (en mrad) ?`, (lam / 1000 / a) * 1000, `$\\theta = \\dfrac{${lam} \\times 10^{-9}}{${a} \\times 10^{-6}}$ rad.`, "mrad", 0.05);
  },
  (r) => {
    const lam = pick(r, [500, 600, 650]), D = pick(r, [1, 2]), b = pick(r, [0.2, 0.5, 1]);
    return numeric(`Fentes d'Young : $\\lambda = ${lam}$ nm, $D = ${D}$ m, $b = ${tex(b)}$ mm. Interfrange $i$ (mm) ?`, (lam * 1e-9 * D) / (b * 1e-3) * 1000, `$i = \\dfrac{\\lambda D}{b}$.`, "mm", 0.01);
  },
  (r) => {
    const lam = pick(r, [400, 500, 600]), k = int(r, 1, 4);
    const constructive = r() < 0.5;
    const delta = constructive ? k * lam : (k + 0.5) * lam;
    return tf(`Différence de marche $\\delta = ${tex(delta)}$ nm pour $\\lambda = ${lam}$ nm : les interférences sont constructives.`, constructive, constructive ? `$\\delta = ${k}\\lambda$ : multiple entier de $\\lambda$.` : `$\\delta = (${k} + \\frac12)\\lambda$ : interférences destructives.`);
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
    return numeric(`Énergie pour chauffer $${tex(m)}$ kg d'eau de $${dT}$ °C ($c = 4{,}18$ kJ·kg⁻¹·K⁻¹), en kJ ?`, 4.18 * m * dT, `$Q = mc\\Delta T = ${tex(m)} \\times 4{,}18 \\times ${dT}$.`, "kJ", 0.05);
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
    const R = pick(r, [1, 2, 5, 10, 47, 100]), C = pick(r, [1, 2, 10, 22, 100]);
    return numeric(`$R = ${R}$ kΩ et $C = ${C}$ µF. Constante de temps $\\tau$ (ms) ?`, R * C, `$\\tau = RC = ${R} \\times 10^3 \\times ${C} \\times 10^{-6}$ s $= ${R * C}$ ms.`, "ms");
  },
  (r) => {
    const E = pick(r, [5, 6, 10, 12]);
    return oneOf(r, [
      () => numeric(`Charge d'un condensateur sous $E = ${E}$ V. Tension $u_C$ à $t = \\tau$ (arrondie au dixième) ?`, Math.round(0.63 * E * 10) / 10, `$u_C(\\tau) = E(1 - e^{-1}) \\approx 0{,}63E$.`, "V", 0.15),
      () => numeric(`Charge sous $E = ${E}$ V : tension $u_C$ au bout de $5\\tau$ (environ) ?`, E, `Après $5\\tau$, le condensateur est chargé à plus de 99 %.`, "V", 0.1),
    ]);
  },
  (r) => {
    const C = pick(r, [1, 10, 47, 100]), U = pick(r, [5, 10, 12]);
    return numeric(`Condensateur de $${C}$ µF sous $${U}$ V. Charge $q$ (µC) ?`, C * U, `$q = C \\times u_C$.`, "µC");
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
    const N0 = pick(r, [1000, 8000, 1600, 64000, 1e6]), n = int(r, 1, 5);
    return numeric(`$N_0 = ${tex(N0)}$ noyaux. Combien en reste-t-il après $${n}$ demi-vies ?`, N0 / 2 ** n, `$N = \\dfrac{N_0}{2^{${n}}}$.`, undefined, 0.5);
  },
  (r) => {
    const [iso, t12, unit] = pick(r, [["carbone 14", 5730, "ans"], ["iode 131", 8, "jours"], ["cobalt 60", 5.3, "ans"], ["césium 137", 30, "ans"], ["radon 222", 3.8, "jours"]] as const);
    const n = int(r, 1, 4);
    return oneOf(r, [
      () => numeric(`Demi-vie du ${iso} : $${tex(t12)}$ ${unit}. Durée pour que l'activité soit divisée par $${2 ** n}$ (${unit}) ?`, n * t12, `$${2 ** n} = 2^{${n}}$ : il faut ${n} demi-vies.`, unit, 0.01),
      () => numeric(`Après $${tex(n * t12)}$ ${unit}, quel pourcentage de ${iso} reste-t-il ($t_{1/2} = ${tex(t12)}$ ${unit}) ?`, 100 / 2 ** n, `${n} demi-vie(s) : $\\dfrac{100}{2^{${n}}}$ %.`, "%", 0.01),
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

void texMcq;
void tf;
