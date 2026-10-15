/**
 * Physique-chimie : questions supplémentaires pour chaque chapitre (calculs
 * types de contrôle, unités, méthodes, pièges), en plus de `physique.ts` et `sciences2.ts`.
 */
import { type Generator, cards, claims, int, mcq, numeric, oneOf, pick, tex, tf } from "./kit";

const sci = (m: number, e: number) => `$${tex(m)} \\times 10^{${e}}$`;
const ce = (f: string) => `$\\mathrm{${f}}$`;

// ───────────── Seconde ─────────────

const atome: Generator[] = [
  (r) => {
    const [ion, z, q] = pick(r, [["Mg^{2+}", 12, 2], ["Al^{3+}", 13, 3], ["Ca^{2+}", 20, 2], ["O^{2-}", 8, -2], ["F^-", 9, -1], ["S^{2-}", 16, -2], ["K^+", 19, 1], ["Na^+", 11, 1]] as const);
    return numeric(`Nombre d'électrons de l'ion ${ce(ion)} ($Z = ${z}$) ?`, z - q, `L'atome neutre a $${z}$ électrons ; l'ion ${q > 0 ? `en a perdu ${q}` : `en a gagné ${-q}`} : $${z - q}$.`);
  },
  (r) => {
    const a = int(r, 12, 59), m = Math.round(a * 16.7) / 100;
    return mcq(r, `Masse approchée d'un atome de $A = ${a}$ nucléons ($m_{nucléon} \\approx 1{,}67 \\times 10^{-27}$ kg) ?`, `${sci(m, -26)} kg`, [`${sci(m, -30)} kg`, `${sci(1.67, -27)} kg`, `${sci(m, -23)} kg`],
      `La masse des électrons est négligeable : $m \\approx ${a} \\times 1{,}67 \\times 10^{-27} = ${tex(a * 1.67, 2)} \\times 10^{-27} \\approx ${tex(m)} \\times 10^{-26}$ kg.`);
  },
  (r) =>
    oneOf(r, [
      () => mcq(r, "Ordre de grandeur du rayon d'un atome ?", "$10^{-10}$ m", ["$10^{-15}$ m", "$10^{-3}$ m", "$10^{-20}$ m"], "Le noyau, lui, mesure environ $10^{-15}$ m."),
      () => mcq(r, "Rapport rayon de l'atome / rayon du noyau ?", "environ $100\\,000$", ["environ $10$", "environ $1\\,000$", "environ $10^{10}$"], "$\\frac{10^{-10}}{10^{-15}} = 10^5$ : l'atome est essentiellement vide."),
      () => mcq(r, "Charge d'un neutron ?", "nulle", ["$+e$", "$-e$", "$+2e$"], "Le neutron est électriquement neutre."),
      () => mcq(r, "Particules qui composent le noyau ?", "protons et neutrons", ["protons et électrons", "électrons seulement", "neutrons et électrons"], "On les appelle les nucléons."),
    ]),
  claims([
    ["Deux isotopes ont le même nombre de neutrons.", false, "Ils ont le même nombre de protons ($Z$) mais pas le même nombre de neutrons."],
    ["Un cation est un ion chargé positivement.", true, "Il a perdu un ou plusieurs électrons."],
    ["Les gaz nobles ont une couche externe saturée.", true, "Ils sont très stables chimiquement."],
    ["L'atome est électriquement neutre.", true, "Autant de protons que d'électrons."],
  ]),
];

const mole: Generator[] = [
  (r) => {
    const [name, f, M] = pick(r, [["dioxyde de carbone", "CO_2", 44], ["chlorure de sodium", "NaCl", 58.5], ["glucose", "C_6H_{12}O_6", 180], ["éthanol", "C_2H_6O", 46], ["méthane", "CH_4", 16], ["ammoniac", "NH_3", 17]] as const);
    const n = pick(r, [0.1, 0.2, 0.5, 2, 3]);
    return oneOf(r, [
      () => numeric(`Masse de $${tex(n)}$ mol de ${name} ${ce(f)} ($M = ${tex(M)}$ g/mol) ?`, n * M, `$m = n \\times M = ${tex(n)} \\times ${tex(M)} = ${tex(n * M)}$ g.`, "g"),
      () => numeric(`Quantité de matière dans $${tex(n * M)}$ g de ${name} ($M = ${tex(M)}$ g/mol) ?`, n, `$n = \\dfrac{m}{M} = \\dfrac{${tex(n * M)}}{${tex(M)}} = ${tex(n)}$ mol.`, "mol"),
    ]);
  },
  (r) => {
    const k = pick(r, [1.204, 3.01, 6.02, 12.04, 1.806]);
    const n = k / 6.02;
    return numeric(`Combien de moles représentent $${tex(k)} \\times 10^{23}$ molécules ($N_A = 6{,}02 \\times 10^{23}$ mol⁻¹) ?`, n, `$n = \\dfrac{N}{N_A} = \\dfrac{${tex(k)} \\times 10^{23}}{6{,}02 \\times 10^{23}} = ${tex(n)}$ mol.`, "mol", 0.001);
  },
  cards([
    ["La mole est…", "une quantité de matière : un paquet de $6{,}02 \\times 10^{23}$ entités", ["une masse", "un volume", "la masse d'un atome"], "Unité : mol."],
    ["La masse molaire s'exprime en…", "g/mol", ["mol/g", "g", "mol/L"], "Masse d'une mole d'entités."],
    ["Pour passer d'une masse à une quantité de matière, on…", "divise par la masse molaire", ["multiplie par la masse molaire", "multiplie par $N_A$", "divise par le volume"], "$n = \\frac{m}{M}$."],
  ]),
];

const solutions: Generator[] = [
  (r) => {
    const n = pick(r, [0.01, 0.02, 0.05, 0.1, 0.2]), V = pick(r, [0.1, 0.25, 0.5, 1, 2]);
    return oneOf(r, [
      () => numeric(`$${tex(n)}$ mol de soluté dans $${tex(V * 1000)}$ mL de solution. Concentration (mol/L) ?`, n / V, `$C = \\dfrac{n}{V} = \\dfrac{${tex(n)}}{${tex(V)}} = ${tex(n / V)}$ mol/L (volume converti en litres).`, "mol/L", 0.001),
      () => numeric(`Solution de glucose à $${tex(n / V)}$ mol/L ($M = 180$ g/mol). Concentration en masse (g/L) ?`, (n / V) * 180, `$C_m = C \\times M = ${tex(n / V)} \\times 180 = ${tex((n / V) * 180)}$ g/L.`, "g/L", 0.01),
    ]);
  },
  (r) => {
    const V0 = pick(r, [5, 10, 20, 25]), F = pick(r, [2, 4, 5, 10]);
    return oneOf(r, [
      () => numeric(`On prélève $${V0}$ mL de solution mère et on complète à $${V0 * F}$ mL. Facteur de dilution ?`, F, `$F = \\dfrac{V_{fille}}{V_{mère}} = \\dfrac{${V0 * F}}{${V0}} = ${F}$.`),
      () => mcq(r, `Pour une dilution, on prélève la solution mère avec…`, "une pipette jaugée", ["une éprouvette graduée", "un bécher", "une fiole jaugée"], "La pipette jaugée est précise ; la fiole jaugée sert à compléter au volume final."),
    ]);
  },
  cards([
    ["Verrerie pour préparer précisément 100 mL de solution ?", "une fiole jaugée de 100 mL", ["un bécher de 100 mL", "une éprouvette de 100 mL", "un erlenmeyer"], "On complète jusqu'au trait de jauge."],
    ["Lors d'une dilution, la quantité de soluté…", "reste la même", ["augmente", "diminue", "est divisée par le facteur de dilution"], "On ajoute seulement du solvant : $C_0V_0 = C_1V_1$."],
    ["Une solution saturée est une solution qui…", "ne peut plus dissoudre de soluté", ["contient beaucoup d'eau", "est colorée", "est diluée"], "On a atteint la solubilité."],
  ]),
];

const transformations: Generator[] = [
  (r) => {
    const items: [string, string][] = [
      ["la fonte d'un glaçon", "physique"], ["la combustion du bois", "chimique"], ["la fission de l'uranium dans une centrale", "nucléaire"], ["l'évaporation de l'eau d'une flaque", "physique"],
      ["la rouille du fer", "chimique"], ["la fusion de l'hydrogène dans le Soleil", "nucléaire"], ["la dissolution du sucre dans l'eau", "physique"], ["la cuisson d'un œuf", "chimique"],
    ];
    const [what, kind] = pick(r, items);
    return mcq(r, `Quel type de transformation est ${what} ?`, kind, ["physique", "chimique", "nucléaire"].filter((k) => k !== kind).concat("biologique"), kind === "physique" ? "Les espèces chimiques ne changent pas." : kind === "chimique" ? "De nouvelles espèces chimiques se forment." : "Les noyaux des atomes sont modifiés.");
  },
  (r) => {
    const items: [string, string][] = [["solide → liquide", "la fusion"], ["liquide → solide", "la solidification"], ["liquide → gaz", "la vaporisation"], ["gaz → liquide", "la liquéfaction"], ["solide → gaz", "la sublimation"], ["gaz → solide", "la condensation"]];
    const [ch, name] = pick(r, items);
    return mcq(r, `Nom du changement d'état ${ch} ?`, name, items.map(([, n]) => n).filter((n) => n !== name), "Fusion/solidification, vaporisation/liquéfaction, sublimation/condensation vont par paires.");
  },
  (r) => {
    const nA = int(r, 2, 8), nB = int(r, 2, 8);
    // 2 A + B → C
    const lim = nA / 2 < nB ? "A" : nA / 2 > nB ? "B" : "aucun (mélange stœchiométrique)";
    return mcq(r, `Réaction $2\\,\\mathrm{A} + \\mathrm{B} \\rightarrow \\mathrm{C}$ avec $${nA}$ mol de A et $${nB}$ mol de B. Réactif limitant ?`, lim, ["A", "B", "aucun (mélange stœchiométrique)"].filter((x) => x !== lim).concat("C"),
      `Il faudrait $2$ mol de A pour 1 mol de B : $\\frac{${nA}}{2} = ${tex(nA / 2)}$ à comparer à $${nB}$.`);
  },
  claims([
    ["La fusion de la glace est une transformation endothermique.", true, "Il faut apporter de l'énergie pour faire fondre."],
    ["Lors d'une transformation chimique, la masse totale se conserve.", true, "« Rien ne se perd, rien ne se crée » (Lavoisier)."],
    ["Lors d'une transformation nucléaire, les éléments chimiques se conservent.", false, "Les noyaux changent : de nouveaux éléments apparaissent."],
  ]),
];

const mouvement: Generator[] = [
  (r) => {
    const k = pick(r, [2, 3, 4]);
    return oneOf(r, [
      () => mcq(r, `Si la distance entre deux corps est multipliée par $${k}$, la force de gravitation est…`, `divisée par $${k * k}$`, [`divisée par $${k}$`, `multipliée par $${k * k}$`, "inchangée"], "$F$ est proportionnelle à $\\frac{1}{d^2}$."),
      () => mcq(r, `Si la masse d'un des deux corps est multipliée par $${k}$, la force de gravitation est…`, `multipliée par $${k}$`, [`multipliée par $${k * k}$`, `divisée par $${k}$`, "inchangée"], "$F$ est proportionnelle à chaque masse."),
    ]);
  },
  (r) => {
    const m = pick(r, [10, 20, 50, 60, 80]);
    return numeric(`Un astronaute de $${m}$ kg sur la Lune ($g_{Lune} = 1{,}6$ N/kg). Son poids (N) ?`, m * 1.6, `$P = m \\times g_{Lune} = ${m} \\times 1{,}6 = ${tex(m * 1.6)}$ N. Sa masse reste $${m}$ kg.`, "N");
  },
  (r) => {
    const items: [string, string][] = [
      ["points régulièrement espacés et alignés", "rectiligne uniforme"], ["points alignés de plus en plus espacés", "rectiligne accéléré"], ["points alignés de plus en plus rapprochés", "rectiligne ralenti"], ["points sur un cercle, régulièrement espacés", "circulaire uniforme"],
    ];
    const [desc, kind] = pick(r, items);
    return mcq(r, `Chronophotographie (intervalles de temps égaux) : ${desc}. Le mouvement est…`, kind, items.map(([, k]) => k).filter((k) => k !== kind), "Trajectoire (droite, cercle) + évolution de la vitesse (espacement des points).");
  },
  cards([
    ["Un référentiel, c'est…", "un objet de référence par rapport auquel on décrit le mouvement", ["une unité de vitesse", "la trajectoire d'un objet", "une force"], "Le même mouvement peut être différent selon le référentiel."],
    ["Pour étudier le mouvement d'un satellite autour de la Terre, on utilise le référentiel…", "géocentrique", ["terrestre", "héliocentrique", "du satellite"], "Centré sur la Terre, avec des axes vers des étoiles lointaines."],
    ["Selon le principe d'inertie, un objet soumis à des forces qui se compensent est…", "immobile ou en mouvement rectiligne uniforme", ["forcément immobile", "en mouvement accéléré", "en mouvement circulaire"], "Une force non compensée modifie la vitesse."],
    ["L'unité de force est…", "le newton (N)", ["le kilogramme (kg)", "le joule (J)", "le watt (W)"], "Le poids est une force."],
  ]),
];

const ondes2: Generator[] = [
  (r) => {
    const d = pick(r, [1500, 3000, 4500, 7500]);
    return numeric(`Un sonar émet un son dans l'eau ($v = 1\\,500$ m/s). L'écho revient au bout de $${tex((2 * d) / 1500)}$ s. Profondeur du fond (m) ?`, d, `Aller-retour : $2d = v \\times t = 1\\,500 \\times ${tex((2 * d) / 1500)}$, donc $d = ${d}$ m.`, "m");
  },
  (r) => {
    const [lam, dom] = pick(r, [[300, "les ultraviolets"], [450, "le visible (bleu)"], [650, "le visible (rouge)"], [900, "les infrarouges"], [550, "le visible (vert)"]] as const);
    return mcq(r, `Une radiation de $${lam}$ nm appartient à…`, dom, ["les ultraviolets", "les infrarouges", "le visible (rouge)", "le visible (bleu)", "les rayons X"].filter((x) => x !== dom), "Visible : environ 400 nm (violet) à 800 nm (rouge).");
  },
  cards([
    ["La hauteur d'un son est liée à…", "sa fréquence", ["son amplitude", "sa vitesse", "sa durée"], "Grave : basse fréquence ; aigu : haute fréquence."],
    ["Le niveau sonore se mesure en…", "décibels (dB)", ["hertz (Hz)", "watts (W)", "pascals (Pa)"], "Au-delà de 85 dB, il y a un risque pour l'audition."],
    ["Le son se propage plus vite…", "dans les solides que dans l'air", ["dans le vide", "dans l'air que dans l'eau", "à la même vitesse partout"], "Air ≈ 340 m/s, eau ≈ 1 500 m/s, acier ≈ 5 000 m/s."],
    ["Un spectre de raies d'émission est produit par…", "un gaz chaud sous faible pression", ["un corps solide chauffé", "le Soleil vu à l'œil nu", "une lampe à incandescence"], "Chaque élément a ses raies (signature)."],
    ["Lors d'une réflexion, l'angle de réflexion est…", "égal à l'angle d'incidence", ["deux fois l'angle d'incidence", "toujours de 90°", "nul"], "Loi de Snell-Descartes pour la réflexion."],
  ]),
];

const electricite: Generator[] = [
  (r) => {
    const U = pick(r, [6, 12, 230]), I = pick(r, [0.5, 1, 2, 5]);
    return oneOf(r, [
      () => numeric(`Un appareil fonctionne sous $${U}$ V et est traversé par $${tex(I)}$ A. Puissance (W) ?`, U * I, `$P = U \\times I = ${U} \\times ${tex(I)} = ${tex(U * I)}$ W.`, "W"),
      () => numeric(`Un radiateur de $${tex(U * I)}$ W fonctionne pendant $3$ h. Énergie consommée (kWh) ?`, (U * I * 3) / 1000, `$E = P \\times t = ${tex((U * I) / 1000)}$ kW $\\times 3$ h $= ${tex((U * I * 3) / 1000)}$ kWh.`, "kWh", 0.001),
    ]);
  },
  (r) => {
    const I = pick(r, [0.5, 1.2, 2, 3]), I1 = pick(r, [0.1, 0.2, 0.3]);
    return numeric(`Deux lampes en dérivation. Le courant principal vaut $${tex(I)}$ A et la première lampe est traversée par $${tex(I1)}$ A. Intensité dans la seconde (A) ?`, I - I1, `Loi des nœuds : $I = I_1 + I_2$, donc $I_2 = ${tex(I)} - ${tex(I1)} = ${tex(I - I1)}$ A.`, "A", 0.001);
  },
  cards([
    ["La caractéristique d'un conducteur ohmique est…", "une droite passant par l'origine", ["une parabole", "une droite horizontale", "une courbe exponentielle"], "$U = RI$ : proportionnalité."],
    ["Un capteur de température dont la résistance varie est…", "une thermistance", ["une photorésistance", "une diode", "un interrupteur"], "La photorésistance réagit à la lumière."],
    ["On mesure une tension avec…", "un voltmètre branché en dérivation", ["un ampèremètre en série", "un voltmètre en série", "un ohmmètre en série"], "La tension se mesure entre deux points."],
  ]),
];

// ───────────── Première ─────────────

const avancement: Generator[] = [
  (r) => {
    const a = pick(r, [1, 2, 3]), b = pick(r, [1, 2, 3]), nA = a * int(r, 1, 6), nB = b * int(r, 1, 6);
    const xmax = Math.min(nA / a, nB / b);
    return oneOf(r, [
      () => numeric(`$${a === 1 ? "" : a}\\,\\mathrm{A} + ${b === 1 ? "" : b}\\,\\mathrm{B} \\rightarrow \\mathrm{C}$ avec $n_A = ${nA}$ mol et $n_B = ${nB}$ mol. Avancement maximal (mol) ?`, xmax, `$\\frac{${nA}}{${a}} = ${tex(nA / a)}$ et $\\frac{${nB}}{${b}} = ${tex(nB / b)}$ : on garde la plus petite valeur.`, "mol", 0.01),
      () => numeric(`$${a === 1 ? "" : a}\\,\\mathrm{A} + ${b === 1 ? "" : b}\\,\\mathrm{B} \\rightarrow \\mathrm{C}$ avec $n_A = ${nA}$ mol et $n_B = ${nB}$ mol, réaction totale. Quantité de C formée (mol) ?`, xmax, `Il se forme $1 \\times x_{max} = ${tex(xmax)}$ mol de C.`, "mol", 0.01),
      () => numeric(`$${a === 1 ? "" : a}\\,\\mathrm{A} + ${b === 1 ? "" : b}\\,\\mathrm{B} \\rightarrow \\mathrm{C}$ avec $n_A = ${nA}$ mol et $n_B = ${nB}$ mol, réaction totale. Quantité totale de réactifs restant (mol) ?`, nA - a * xmax + nB - b * xmax, `$x_{max} = ${tex(xmax)}$ : il reste $${tex(nA - a * xmax)}$ mol de A et $${tex(nB - b * xmax)}$ mol de B.`, "mol", 0.01),
    ]);
  },
  cards([
    ["L'avancement $x$ d'une réaction s'exprime en…", "mol", ["g", "mol/L", "sans unité"], "C'est une quantité de matière."],
    ["Le réactif limitant est celui qui…", "est entièrement consommé en premier", ["est introduit en plus petite masse", "a le plus petit coefficient", "reste à la fin"], "Il fixe $x_{max}$."],
  ]),
];

const redox: Generator[] = [
  (r) => {
    const items: [string, string, string][] = [
      ["\\mathrm{Fe} \\rightarrow \\mathrm{Fe^{2+}} + 2e^-", "une oxydation", "Le fer perd des électrons."],
      ["\\mathrm{Cu^{2+}} + 2e^- \\rightarrow \\mathrm{Cu}", "une réduction", "L'ion cuivre gagne des électrons."],
      ["\\mathrm{Ag^+} + e^- \\rightarrow \\mathrm{Ag}", "une réduction", "Gain d'un électron."],
      ["\\mathrm{Zn} \\rightarrow \\mathrm{Zn^{2+}} + 2e^-", "une oxydation", "Perte de deux électrons."],
      ["2\\mathrm{I^-} \\rightarrow \\mathrm{I_2} + 2e^-", "une oxydation", "Les ions iodure perdent des électrons."],
    ];
    const [eq, kind, e] = pick(r, items);
    return mcq(r, `La transformation $${eq}$ est…`, kind, ["une oxydation", "une réduction", "une neutralisation", "une dissolution"].filter((x) => x !== kind), e);
  },
  cards([
    ["Un oxydant est une espèce capable de…", "capter des électrons", ["céder des électrons", "céder un proton", "capter un proton"], "Moyen mnémotechnique : l'oxydant est « gourmand » en électrons."],
    ["Dans une pile, l'oxydation a lieu…", "à l'anode", ["à la cathode", "dans le pont salin", "dans les fils"], "Anode et oxydation commencent par une voyelle."],
    ["La rouille résulte de…", "l'oxydation du fer par le dioxygène de l'air (en présence d'eau)", ["la réduction du fer", "la dissolution du fer", "une réaction acide-base"], "Le fer est un réducteur."],
  ]),
];

const lewis: Generator[] = [
  (r) => {
    const items: [string, string][] = [["CH_4", "tétraédrique"], ["NH_3", "pyramidale"], ["H_2O", "coudée"], ["CO_2", "linéaire"]];
    const [mol, g] = pick(r, items);
    return mcq(r, `Géométrie de la molécule ${ce(mol)} ?`, g, items.map(([, x]) => x).filter((x) => x !== g), "Les doublets (liants et non liants) autour de l'atome central s'écartent au maximum.");
  },
  (r) => {
    const items: [string, number][] = [["H", 1], ["O", 2], ["N", 3], ["C", 4], ["Cl", 1]];
    const [at, n] = pick(r, items);
    return numeric(`Combien de liaisons covalentes forme habituellement un atome de ${ce(at)} ?`, n, `Il lui manque $${n}$ électron${n > 1 ? "s" : ""} pour satisfaire la règle ${at === "H" ? "du duet" : "de l'octet"}.`);
  },
  cards([
    ["La cohésion de l'eau liquide est en grande partie due…", "aux liaisons hydrogène", ["aux liaisons ioniques", "à la gravitation", "aux liaisons métalliques"], "Entre un H lié à O et un O d'une autre molécule."],
    ["Un solvant polaire dissout bien…", "les espèces polaires ou ioniques", ["les graisses", "les espèces apolaires", "aucune espèce"], "« Qui se ressemble s'assemble »."],
    ["L'atome le plus électronégatif parmi C, H, O, N ?", "O", ["C", "H", "N"], "L'électronégativité augmente vers la droite et le haut du tableau périodique."],
  ]),
];

const energie: Generator[] = [
  (r) => {
    const h = pick(r, [5, 20, 45, 80, 125]);
    return numeric(`Un objet est lâché sans vitesse de $${h}$ m de haut ($g = 10$ N/kg, sans frottement). Vitesse à l'arrivée au sol (m/s) ?`, Math.sqrt(2 * 10 * h), `Conservation de l'énergie mécanique : $mgh = \\frac12 mv^2$, donc $v = \\sqrt{2gh} = \\sqrt{${20 * h}} = ${tex(Math.sqrt(20 * h))}$ m/s.`, "m/s", 0.05);
  },
  (r) => {
    const m = pick(r, [0.5, 1, 2, 5, 10]), h = pick(r, [2, 3, 5, 10]);
    return oneOf(r, [
      () => numeric(`Travail du poids d'un objet de $${tex(m)}$ kg qui descend de $${h}$ m ($g = 10$ N/kg) ?`, m * 10 * h, `$W(\\vec P) = mg(z_A - z_B) = ${tex(m)} \\times 10 \\times ${h} = ${tex(m * 10 * h)}$ J : travail moteur.`, "J"),
      () => numeric(`Travail du poids d'un objet de $${tex(m)}$ kg qui monte de $${h}$ m ($g = 10$ N/kg) ?`, -m * 10 * h, `En montée, le poids s'oppose au déplacement : $W = -${tex(m * 10 * h)}$ J (travail résistant).`, "J"),
    ]);
  },
  (r) => {
    const m = pick(r, [1000, 1200, 1500]), v = pick(r, [10, 20, 30]);
    return oneOf(r, [
      () => numeric(`Une voiture de $${m}$ kg roulant à $${v}$ m/s freine jusqu'à l'arrêt. Travail total des forces de freinage (kJ) ?`, (-0.5 * m * v * v) / 1000, `Théorème de l'énergie cinétique : $W = \\Delta E_c = 0 - \\frac12 \\times ${m} \\times ${v}^2 = ${tex(-0.5 * m * v * v)}$ J.`, "kJ", 0.1),
      () => mcq(r, `Si la vitesse d'une voiture double, son énergie cinétique est…`, "multipliée par 4", ["multipliée par 2", "inchangée", "divisée par 2"], "$E_c = \\frac12 mv^2$ dépend du carré de la vitesse."),
    ]);
  },
  claims([
    ["Avec des frottements, l'énergie mécanique diminue.", true, "Une partie est convertie en énergie thermique."],
    ["Le travail d'une force perpendiculaire au déplacement est nul.", true, "$\\cos 90° = 0$."],
    ["L'énergie potentielle de pesanteur dépend de la vitesse.", false, "Elle dépend de l'altitude : $E_{pp} = mgz$."],
  ]),
];

const ondes1: Generator[] = [
  (r) => {
    const lam = pick(r, [0.5, 1, 2, 4]), n = int(r, 2, 6);
    return oneOf(r, [
      () => numeric(`Sur une corde, ${n + 1} crêtes successives sont réparties sur $${tex(n * lam)}$ m. Longueur d'onde (m) ?`, lam, `Entre ${n + 1} crêtes, il y a ${n} longueurs d'onde : $\\lambda = \\dfrac{${tex(n * lam)}}{${n}}$.`, "m"),
      () => numeric(`Une vague de longueur d'onde $${tex(lam)}$ m a une période de $${tex(lam / 2)}$ s. Célérité (m/s) ?`, 2, `$v = \\dfrac{\\lambda}{T} = \\dfrac{${tex(lam)}}{${tex(lam / 2)}} = 2$ m/s.`, "m/s"),
    ]);
  },
  cards([
    ["Une onde transversale est une onde où…", "la perturbation est perpendiculaire à la direction de propagation", ["la perturbation est parallèle à la propagation", "rien ne bouge", "la matière se déplace avec l'onde"], "Exemple : une onde le long d'une corde. Le son est longitudinal."],
    ["Une onde mécanique transporte…", "de l'énergie, sans transport de matière", ["de la matière", "de l'énergie et de la matière", "uniquement de la lumière"], "Les points du milieu oscillent autour de leur position."],
    ["La période spatiale d'une onde s'appelle…", "la longueur d'onde", ["la fréquence", "la période", "la célérité"], "Notée $\\lambda$, en mètres."],
  ]),
];

const lentilles: Generator[] = [
  (r) =>
    oneOf(r, [
      () => mcq(r, "Un objet placé entre le foyer objet et une lentille convergente donne…", "une image virtuelle, droite et agrandie (effet loupe)", ["une image réelle renversée", "aucune image", "une image réelle plus petite"], "C'est le principe de la loupe."),
      () => mcq(r, "Un objet très éloigné d'une lentille convergente donne une image…", "dans le plan focal image", ["au centre optique", "à l'infini", "au foyer objet"], "Les rayons arrivent parallèles et convergent vers le plan focal image."),
      () => mcq(r, "Une image réelle…", "peut être observée sur un écran", ["ne peut jamais être vue", "est toujours droite", "est toujours plus grande"], "Une image virtuelle ne s'observe qu'à travers la lentille."),
      () => mcq(r, "Dans l'œil, l'image se forme sur…", "la rétine", ["le cristallin", "la pupille", "l'iris"], "Le cristallin joue le rôle de lentille."),
    ]),
  (r) => {
    const g = pick(r, [-0.5, -2, -1, -3, 2]), AB = pick(r, [1, 2, 3, 4]);
    return mcq(r, `Grandissement $\\gamma = ${tex(g)}$. L'image est…`, `${g < 0 ? "renversée" : "droite"} et ${Math.abs(g) > 1 ? "agrandie" : Math.abs(g) === 1 ? "de même taille" : "réduite"}`, ["renversée et réduite", "droite et agrandie", "renversée et agrandie", "droite et réduite", "renversée et de même taille"].filter((x) => x !== `${g < 0 ? "renversée" : "droite"} et ${Math.abs(g) > 1 ? "agrandie" : Math.abs(g) === 1 ? "de même taille" : "réduite"}`),
      `$\\gamma < 0$ : renversée ; $|\\gamma| > 1$ : agrandie. Un objet de $${AB}$ cm donne une image de $${tex(Math.abs(g) * AB)}$ cm.`);
  },
];

const organique: Generator[] = [
  (r) => {
    const items: [string, string][] = [
      ["CH_3-CH_2-OH", "éthanol"], ["CH_3-OH", "méthanol"], ["CH_3-CH_2-CH_2-OH", "propan-1-ol"], ["CH_3-CO-CH_3", "propanone"], ["CH_3-COOH", "acide éthanoïque"], ["H-CHO", "méthanal"], ["CH_3-CHO", "éthanal"], ["CH_3-CH_2-COOH", "acide propanoïque"],
    ];
    const [f, name] = pick(r, items);
    return mcq(r, `Nom de la molécule ${ce(f)} ?`, name, items.map(([, n]) => n).filter((n) => n !== name), "Préfixe selon le nombre de C (méth-, éth-, prop-) et suffixe selon la famille (-ol, -al, -one, acide …-oïque).");
  },
  cards([
    ["Deux isomères ont…", "la même formule brute mais des formules développées différentes", ["la même formule développée", "des masses molaires différentes", "le même nom"], "Exemple : propan-1-ol et propan-2-ol."],
    ["Le groupe caractéristique d'une cétone est…", "un carbonyle $\\mathrm{C{=}O}$ entre deux carbones", ["un hydroxyle $-\\mathrm{OH}$", "un carboxyle $-\\mathrm{COOH}$", "un groupe amine"], "Suffixe -one."],
    ["En formule topologique, chaque extrémité ou sommet de la ligne brisée représente…", "un atome de carbone", ["un atome d'hydrogène", "un atome d'oxygène", "une liaison double"], "Les H liés aux C ne sont pas écrits."],
  ]),
];

const spectro: Generator[] = [
  (r) => {
    const items: [string, string][] = [["rouge", "bleu-vert (cyan)"], ["bleu", "jaune"], ["vert", "magenta"], ["jaune", "bleu"], ["cyan", "rouge"], ["magenta", "vert"]];
    const [abs, seen] = pick(r, items);
    return mcq(r, `Une solution absorbe principalement le ${abs}. Elle apparaît…`, seen, items.map(([, s]) => s).filter((s) => s !== seen), "On voit la couleur complémentaire de la couleur absorbée (diamétralement opposée sur le cercle chromatique).");
  },
  (r) => {
    const k = pick(r, [200, 500, 1000, 250]), A1 = pick(r, [0.2, 0.4, 0.5, 0.8]), f = pick(r, [2, 0.5, 3]);
    return numeric(`Une solution a une absorbance $A = ${tex(A1)}$. On prépare une solution ${f > 1 ? `${f} fois plus concentrée` : "deux fois moins concentrée"}. Nouvelle absorbance (Beer-Lambert) ?`, A1 * f, `$A$ est proportionnelle à $C$ : $${tex(A1)} \\times ${tex(f)} = ${tex(A1 * f)}$. (Coefficient $k = ${k}$ L/mol sans importance ici.)`, undefined, 0.001);
  },
  cards([
    ["Un spectrophotomètre mesure…", "l'absorbance d'une solution", ["la masse d'une solution", "le pH", "la température"], "À une longueur d'onde choisie."],
    ["La loi de Beer-Lambert indique que l'absorbance est…", "proportionnelle à la concentration", ["inversement proportionnelle à la concentration", "indépendante de la concentration", "proportionnelle au volume"], "Valable pour des solutions diluées."],
  ]),
];

const photon: Generator[] = [
  (r) => {
    const [E1, E2] = pick(r, [[-13.6, -3.4], [-3.4, -1.51], [-13.6, -1.51], [-5.14, -3.03], [-3.4, -0.85]] as const);
    const dE = E2 - E1;
    return oneOf(r, [
      () => numeric(`Un atome passe du niveau $${tex(E2)}$ eV au niveau $${tex(E1)}$ eV. Énergie du photon émis (eV) ?`, dE, `$\\Delta E = E_{haut} - E_{bas} = ${tex(E2)} - (${tex(E1)}) = ${tex(dE)}$ eV.`, "eV", 0.01),
      () => numeric(`Transition de $${tex(E2)}$ eV à $${tex(E1)}$ eV. Longueur d'onde du photon émis (nm, à 10 nm près) ? ($\\lambda \\approx \\frac{1240}{\\Delta E}$)`, Math.round(1240 / dE), `$\\lambda = \\dfrac{1240}{${tex(dE)}} \\approx ${Math.round(1240 / dE)}$ nm.`, "nm", 10),
    ]);
  },
  cards([
    ["Quand un atome absorbe un photon, il…", "passe à un niveau d'énergie supérieur", ["perd un électron à coup sûr", "émet de la lumière blanche", "descend d'un niveau"], "Seuls les photons d'énergie exactement égale à un écart de niveaux sont absorbés."],
    ["L'énergie d'un photon est proportionnelle à…", "sa fréquence", ["sa longueur d'onde", "sa vitesse", "sa masse"], "$E = h\\nu$."],
    ["Quel photon est le plus énergétique ?", "un photon ultraviolet", ["un photon infrarouge", "un photon rouge", "un photon micro-onde"], "Plus la longueur d'onde est courte, plus l'énergie est grande."],
  ]),
];

const fluides: Generator[] = [
  (r) => {
    const P = pick(r, [1, 2, 3]) * 1e5, S = pick(r, [0.01, 0.02, 0.05, 0.1]);
    return numeric(`Force pressante exercée par une pression de $${tex(P / 1e5)}$ bar sur une surface de $${tex(S)}$ m² (en N) ?`, P * S, `$F = P \\times S = ${tex(P)} \\times ${tex(S)} = ${tex(P * S)}$ N.`, "N");
  },
  (r) => {
    const h = pick(r, [10, 20, 30, 40]);
    return numeric(`Pression absolue (en bar) à $${h}$ m de profondeur dans l'eau, avec $1$ bar à la surface ?`, 1 + h / 10, `Environ +1 bar tous les 10 m : $1 + ${h / 10} = ${1 + h / 10}$ bar.`, "bar");
  },
  cards([
    ["Un baromètre mesure…", "la pression atmosphérique", ["la température", "la vitesse du vent", "l'humidité"], "Environ 1 013 hPa au niveau de la mer."],
    ["À l'échelle microscopique, la pression d'un gaz est due…", "aux chocs des molécules sur les parois", ["au poids des molécules", "à la couleur du gaz", "aux liaisons chimiques"], "Plus les chocs sont nombreux et violents, plus la pression est grande."],
    ["Si on chauffe un gaz enfermé dans un volume constant, sa pression…", "augmente", ["diminue", "reste constante", "s'annule"], "$PV = nRT$ : à $V$ constant, $P$ est proportionnelle à $T$."],
  ]),
];

// ───────────── Terminale ─────────────

const acidesBases: Generator[] = [
  (r) => {
    const k = int(r, 1, 4), f = pick(r, [10, 100]);
    return oneOf(r, [
      () => numeric(`Solution d'acide fort (totalement dissocié) à $10^{-${k}}$ mol/L. pH ?`, k, `$[\\mathrm{H_3O^+}] = C = 10^{-${k}}$ mol/L, donc pH $= ${k}$.`),
      () => numeric(`Une solution d'acide fort de pH $${k}$ est diluée $${f}$ fois. Nouveau pH ?`, k + Math.log10(f), `$[\\mathrm{H_3O^+}]$ est divisée par $${f}$ : le pH augmente de $${Math.log10(f)}$.`),
    ]);
  },
  (r) => {
    const pH = int(r, 2, 12);
    return numeric(`À 25 °C, une solution a un pH de $${pH}$. Concentration en ions $\\mathrm{HO^-}$ : $10^{n}$ mol/L. Valeur de $n$ ?`, pH - 14, `$[\\mathrm{HO^-}] = \\dfrac{K_e}{[\\mathrm{H_3O^+}]} = \\dfrac{10^{-14}}{10^{-${pH}}} = 10^{${pH - 14}}$ mol/L.`);
  },
  (r) => {
    const pKa = pick(r, [4.8, 9.2, 3.8, 6.4]), d = pick(r, [-2, -1, 1, 2]);
    const pH = Math.round((pKa + d) * 10) / 10;
    return mcq(r, `Couple $\\mathrm{AH/A^-}$ de $\\mathrm{p}K_a = ${tex(pKa)}$. À pH $= ${tex(pH)}$, quel est le rapport $\\dfrac{[\\mathrm{A^-}]}{[\\mathrm{AH}]}$ ?`, `$10^{${d}}$`, [`$10^{${-d}}$`, `$${d}$`, "$1$"],
      `$\\mathrm{pH} = \\mathrm{p}K_a + \\log\\dfrac{[\\mathrm{A^-}]}{[\\mathrm{AH}]}$, donc $\\log(\\ldots) = ${d}$.`);
  },
  cards([
    ["Une solution tampon est une solution dont le pH…", "varie peu par ajout modéré d'acide, de base ou par dilution", ["vaut toujours 7", "est très acide", "varie beaucoup"], "Mélange d'un acide faible et de sa base conjuguée en quantités proches (le sang par exemple)."],
    ["Un indicateur coloré convient pour un titrage si…", "sa zone de virage contient le pH à l'équivalence", ["il est incolore", "il est rouge", "son $\\mathrm{p}K_a$ vaut 7"], "Exemple : la phénolphtaléine pour un titrage acide faible / base forte."],
    ["Un acide fort dans l'eau est…", "totalement dissocié", ["peu dissocié", "toujours concentré", "sans effet sur le pH"], "Sa réaction avec l'eau est totale."],
  ]),
];

const cinetique: Generator[] = [
  (r) => {
    const t12 = pick(r, [5, 10, 20, 30]), n = int(r, 1, 3);
    return numeric(`Réaction d'ordre 1, temps de demi-réaction $${t12}$ min, $[\\mathrm{A}]_0 = 0{,}8$ mol/L. Concentration de A après $${n * t12}$ min (mol/L) ?`, 0.8 / 2 ** n, `Pour l'ordre 1, $t_{1/2}$ est constant : la concentration est divisée par 2 toutes les $${t12}$ min, soit par $2^{${n}}$.`, "mol/L", 0.001);
  },
  cards([
    ["Un catalyseur…", "accélère une réaction sans être consommé", ["augmente la quantité de produit final", "est un réactif", "ralentit la réaction"], "Il ne modifie pas l'état final."],
    ["Quand on augmente la température, la vitesse d'une réaction…", "augmente en général", ["diminue", "ne change pas", "s'annule"], "Les chocs entre molécules sont plus nombreux et plus efficaces."],
    ["La trempe d'un mélange réactionnel consiste à…", "le refroidir brutalement pour stopper la réaction", ["le chauffer", "ajouter un catalyseur", "le filtrer"], "Utile pour faire un dosage à un instant donné."],
    ["Pour une réaction d'ordre 1, la vitesse volumique est…", "proportionnelle à la concentration du réactif", ["constante", "proportionnelle au temps", "nulle au départ"], "$v = k[\\mathrm{A}]$."],
  ]),
];

const newton: Generator[] = [
  (r) => {
    const v0 = pick(r, [10, 20, 30]);
    return oneOf(r, [
      () => numeric(`Une balle est lancée verticalement vers le haut à $${v0}$ m/s ($g = 10$ m/s², sans frottement). Hauteur maximale atteinte (m) ?`, (v0 * v0) / 20, `En haut, $v = 0$ : $h = \\dfrac{v_0^2}{2g} = \\dfrac{${v0 * v0}}{20} = ${tex((v0 * v0) / 20)}$ m.`, "m"),
      () => numeric(`Une balle est lancée verticalement vers le haut à $${v0}$ m/s ($g = 10$ m/s²). Durée de la montée (s) ?`, v0 / 10, `$v(t) = v_0 - gt = 0 \\iff t = \\dfrac{${v0}}{10}$ s.`, "s"),
    ]);
  },
  (r) => {
    const U = pick(r, [100, 200, 500, 1000]), d = pick(r, [0.01, 0.02, 0.05]);
    return oneOf(r, [
      () => numeric(`Deux plaques parallèles distantes de $${tex(d * 100)}$ cm sont soumises à $${U}$ V. Champ électrique (V/m) ?`, U / d, `$E = \\dfrac{U}{d} = \\dfrac{${U}}{${tex(d)}} = ${tex(U / d)}$ V/m (distance en mètres).`, "V/m"),
      () => mcq(r, "Un électron dans un champ électrique uniforme $\\vec E$ subit une force…", "de sens opposé à $\\vec E$", ["de même sens que $\\vec E$", "nulle", "perpendiculaire à $\\vec E$"], "$\\vec F = q\\vec E$ avec $q = -e < 0$."),
    ]);
  },
  (r) => {
    const k = pick(r, [4, 9]);
    return mcq(r, `Une planète tourne sur une orbite $${Math.sqrt(k)}$ fois plus grande qu'une autre (même étoile). Sa période est multipliée par…`, `$${tex(Math.sqrt(k) ** 1.5, 2)}$`, [`$${Math.sqrt(k)}$`, `$${k}$`, `$${tex(Math.sqrt(Math.sqrt(k)), 2)}$`],
      `Troisième loi de Kepler : $\\frac{T^2}{a^3}$ constant, donc $T$ est multipliée par $${Math.sqrt(k)}^{3/2}$.`);
  },
  cards([
    ["Un référentiel galiléen est un référentiel où…", "le principe d'inertie est vérifié", ["tout est immobile", "il n'y a pas de gravité", "la vitesse est constante"], "Le référentiel terrestre l'est approximativement pour des expériences courtes."],
    ["Dans un mouvement circulaire uniforme, l'accélération est…", "dirigée vers le centre", ["nulle", "tangente à la trajectoire", "dirigée vers l'extérieur"], "Accélération centripète $a = \\frac{v^2}{R}$."],
    ["La trajectoire d'un projectile lancé obliquement (sans frottement) est…", "une parabole", ["une droite", "un cercle", "une hyperbole"], "Mouvement uniforme à l'horizontale, uniformément accéléré à la verticale."],
  ]),
];

const ondesT: Generator[] = [
  (r) => {
    const n = int(r, 3, 9);
    return oneOf(r, [
      () => numeric(`Intensité sonore $I = 10^{-${n}}$ W/m² ($I_0 = 10^{-12}$ W/m²). Niveau sonore $L = 10\\log\\frac{I}{I_0}$ (dB) ?`, 10 * (12 - n), `$L = 10\\log(10^{${12 - n}}) = ${10 * (12 - n)}$ dB.`, "dB"),
      () => mcq(r, "Si l'intensité sonore est multipliée par 2, le niveau sonore…", "augmente d'environ 3 dB", ["double", "augmente de 2 dB", "augmente de 10 dB"], "$10\\log 2 \\approx 3$."),
      () => mcq(r, "Si l'intensité sonore est multipliée par 10, le niveau sonore…", "augmente de 10 dB", ["est multiplié par 10", "augmente de 3 dB", "augmente de 1 dB"], "$10\\log 10 = 10$."),
    ]);
  },
  cards([
    ["Effet Doppler : une source s'approche de l'observateur. La fréquence perçue est…", "plus élevée que la fréquence émise", ["plus basse", "identique", "nulle"], "Le son paraît plus aigu."],
    ["Deux ondes interfèrent de façon constructive quand elles arrivent…", "en phase", ["en opposition de phase", "avec des fréquences différentes", "à angle droit"], "Leurs amplitudes s'ajoutent."],
    ["Les interférences lumineuses nécessitent deux sources…", "cohérentes (même fréquence, déphasage constant)", ["de couleurs différentes", "très puissantes", "placées loin l'une de l'autre"], "D'où l'utilisation de fentes éclairées par un même laser."],
  ]),
];

const thermo: Generator[] = [
  (r) => {
    const m = pick(r, [0.2, 0.5, 1, 2]), c = pick(r, [450, 900, 4180]), dT = pick(r, [10, 20, 50]);
    const mat = c === 4180 ? "d'eau" : c === 900 ? "d'aluminium" : "de fer";
    return numeric(`Énergie (J) pour élever de $${dT}$ °C la température de $${tex(m)}$ kg ${mat} ($c = ${c}$ J·kg⁻¹·K⁻¹) ?`, m * c * dT, `$Q = mc\\Delta T = ${tex(m)} \\times ${c} \\times ${dT} = ${tex(m * c * dT)}$ J.`, "J");
  },
  (r) => {
    const R = pick(r, [0.5, 1, 2, 4]), dT = pick(r, [10, 15, 20]);
    return numeric(`Un mur a une résistance thermique de $${tex(R)}$ K/W ; l'écart de température est $${dT}$ °C. Flux thermique (W) ?`, dT / R, `$\\Phi = \\dfrac{\\Delta T}{R_{th}} = \\dfrac{${dT}}{${tex(R)}} = ${tex(dT / R)}$ W.`, "W");
  },
  cards([
    ["Le transfert thermique par mouvement de matière (fluide) s'appelle…", "la convection", ["la conduction", "le rayonnement", "l'évaporation"], "Exemple : l'air chaud qui monte au-dessus d'un radiateur."],
    ["Un bon isolant thermique a…", "une grande résistance thermique", ["une petite résistance thermique", "une grande conductivité", "une masse élevée"], "Il limite le flux thermique."],
    ["Le transfert thermique se fait spontanément…", "du corps chaud vers le corps froid", ["du corps froid vers le corps chaud", "dans les deux sens également", "seulement dans le vide"], "Jusqu'à l'équilibre thermique."],
  ]),
];

const rc: Generator[] = [
  (r) => {
    const C = pick(r, [10, 47, 100, 220]), U = pick(r, [5, 10, 12]);
    return numeric(`Énergie stockée dans un condensateur de $${C}$ µF chargé sous $${U}$ V (en mJ, au centième) ?`, (0.5 * C * 1e-6 * U * U) * 1000, `$\\mathcal{E} = \\frac12 CU^2 = \\frac12 \\times ${C} \\times 10^{-6} \\times ${U * U} = ${tex(0.5 * C * 1e-6 * U * U * 1000, 3)}$ mJ.`, "mJ", 0.01);
  },
  (r) => {
    const E = pick(r, [5, 10, 12]);
    return oneOf(r, [
      () => numeric(`Charge d'un condensateur sous $${E}$ V. Tension $u_C$ à $t = 2\\tau$ (au dixième de volt) ? ($e^{-2} \\approx 0{,}135$)`, Math.round(E * (1 - Math.exp(-2)) * 10) / 10, `$u_C = E(1 - e^{-2}) \\approx ${E} \\times 0{,}865$.`, "V", 0.1),
      () => mcq(r, "Lors de la charge d'un condensateur, l'intensité du courant…", "diminue jusqu'à s'annuler", ["augmente jusqu'à une valeur maximale", "reste constante", "change de signe"], "$i = C\\frac{du_C}{dt}$ et $u_C$ varie de moins en moins vite."),
    ]);
  },
  cards([
    ["La constante de temps $\\tau = RC$ s'exprime en…", "secondes", ["ohms", "farads", "volts"], "Ω × F = s."],
    ["Pour charger plus vite un condensateur, on peut…", "diminuer la résistance $R$", ["augmenter $R$", "augmenter $C$", "augmenter la tension"], "$\\tau = RC$ diminue."],
  ]),
];

const radioactivite: Generator[] = [
  (r) => {
    const pct = pick(r, [50, 25, 12.5]);
    const n = pct === 50 ? 1 : pct === 25 ? 2 : 3;
    return numeric(`Un os contient $${tex(pct)}\\,\\%$ du carbone 14 d'un organisme vivant ($t_{1/2} = 5\\,730$ ans). Âge de l'os (ans) ?`, n * 5730, `$${tex(pct)}\\,\\% = \\frac{1}{2^{${n}}}$ : ${n} demi-vie${n > 1 ? "s" : ""}, soit $${n} \\times 5\\,730 = ${tex(n * 5730)}$ ans.`, "ans");
  },
  (r) => {
    const items: [string, string, string, string][] = [
      ["^{14}_{6}\\mathrm{C}", "\\beta^-", "^{14}_{7}\\mathrm{N}", "Un neutron devient un proton : $Z$ augmente de 1."],
      ["^{226}_{88}\\mathrm{Ra}", "\\alpha", "^{222}_{86}\\mathrm{Rn}", "Perte d'un noyau d'hélium $^4_2\\mathrm{He}$."],
      ["^{60}_{27}\\mathrm{Co}", "\\beta^-", "^{60}_{28}\\mathrm{Ni}", "$A$ conservé, $Z$ + 1."],
      ["^{210}_{84}\\mathrm{Po}", "\\alpha", "^{206}_{82}\\mathrm{Pb}", "$A - 4$, $Z - 2$."],
    ];
    const [x, t, y, e] = pick(r, items);
    return mcq(r, `Noyau obtenu par désintégration $${t}$ de $${x}$ ?`, `$${y}$`, items.filter(([, , yy]) => yy !== y).map(([, , yy]) => `$${yy}$`), e);
  },
  cards([
    ["L'activité d'un échantillon radioactif se mesure en…", "becquerels (Bq)", ["grays (Gy)", "sieverts (Sv)", "joules (J)"], "1 Bq = 1 désintégration par seconde."],
    ["Le rayonnement le moins pénétrant est…", "le rayonnement $\\alpha$", ["le rayonnement $\\gamma$", "le rayonnement $\\beta$", "les rayons X"], "Une feuille de papier arrête les particules $\\alpha$."],
    ["La demi-vie d'un noyau radioactif dépend…", "uniquement du type de noyau", ["de la température", "de la quantité de noyaux", "de la pression"], "Elle est caractéristique du nucléide."],
  ]),
];

const equilibre: Generator[] = [
  (r) => {
    const I = pick(r, [0.1, 0.2, 0.5, 1]), h = pick(r, [1, 2, 5]);
    const Q = I * h * 3600;
    return oneOf(r, [
      () => numeric(`Une pile débite $${tex(I)}$ A pendant $${h}$ h. Charge électrique (C) ?`, Q, `$Q = I \\times \\Delta t = ${tex(I)} \\times ${h * 3600} = ${tex(Q)}$ C (durée en secondes).`, "C"),
      () => numeric(`Une pile débite $${tex(I)}$ A pendant $${h}$ h. Quantité d'électrons échangés (mol, au millième) ? ($F = 96\\,500$ C/mol)`, Math.round((Q / 96500) * 1000) / 1000, `$n(e^-) = \\dfrac{Q}{F} = \\dfrac{${tex(Q)}}{96\\,500} \\approx ${tex(Q / 96500, 3)}$ mol.`, "mol", 0.002),
    ]);
  },
  (r) =>
    oneOf(r, [
      () => mcq(r, "Quotient de réaction de $\\mathrm{CH_3COOH} + \\mathrm{H_2O} \\rightleftharpoons \\mathrm{CH_3COO^-} + \\mathrm{H_3O^+}$ ?", "$Q_r = \\dfrac{[\\mathrm{CH_3COO^-}][\\mathrm{H_3O^+}]}{[\\mathrm{CH_3COOH}]}$", ["$Q_r = \\dfrac{[\\mathrm{CH_3COOH}]}{[\\mathrm{CH_3COO^-}][\\mathrm{H_3O^+}]}$", "$Q_r = \\dfrac{[\\mathrm{CH_3COO^-}][\\mathrm{H_3O^+}]}{[\\mathrm{CH_3COOH}][\\mathrm{H_2O}]}$", "$Q_r = [\\mathrm{CH_3COO^-}] + [\\mathrm{H_3O^+}]$"], "Produits en haut, réactifs en bas ; l'eau (solvant) n'apparaît pas."),
      () => mcq(r, "Quotient de réaction de $\\mathrm{Cu^{2+}} + \\mathrm{Zn_{(s)}} \\rightleftharpoons \\mathrm{Cu_{(s)}} + \\mathrm{Zn^{2+}}$ ?", "$Q_r = \\dfrac{[\\mathrm{Zn^{2+}}]}{[\\mathrm{Cu^{2+}}]}$", ["$Q_r = \\dfrac{[\\mathrm{Cu^{2+}}]}{[\\mathrm{Zn^{2+}}]}$", "$Q_r = \\dfrac{[\\mathrm{Cu}][\\mathrm{Zn^{2+}}]}{[\\mathrm{Cu^{2+}}][\\mathrm{Zn}]}$", "$Q_r = 1$"], "Les solides n'apparaissent pas dans $Q_r$."),
    ]),
  cards([
    ["Dans une pile, les électrons circulent dans les fils…", "de l'anode (−) vers la cathode (+)", ["de la cathode vers l'anode", "dans le pont salin", "dans les deux sens"], "Le pont salin, lui, assure le passage du courant par des ions."],
    ["Une pile cesse de débiter quand…", "le système atteint l'équilibre ($Q_r = K$)", ["la cathode est pleine", "le pont salin est vide", "la tension augmente"], "Plus aucune évolution spontanée."],
    ["La constante d'équilibre $K$ dépend…", "uniquement de la température", ["des concentrations initiales", "du volume", "de la présence d'un catalyseur"], "Pour une réaction donnée."],
  ]),
];

export const PHYSIQUE_PLUS: Record<string, Generator[]> = {
  "pc-2-atome": atome,
  "pc-2-mole": mole,
  "pc-2-solutions": solutions,
  "pc-2-transformations": transformations,
  "pc-2-mouvement": mouvement,
  "pc-2-ondes": ondes2,
  "pc-2-electricite": electricite,
  "pc-1-avancement": avancement,
  "pc-1-redox": redox,
  "pc-1-lewis": lewis,
  "pc-1-energie": energie,
  "pc-1-ondes": ondes1,
  "pc-1-lentilles": lentilles,
  "pc-1-organique": organique,
  "pc-1-spectro": spectro,
  "pc-1-photon": photon,
  "pc-1-fluides": fluides,
  "pc-t-acides-bases": acidesBases,
  "pc-t-cinetique": cinetique,
  "pc-t-newton": newton,
  "pc-t-ondes": ondesT,
  "pc-t-thermo": thermo,
  "pc-t-rc": rc,
  "pc-t-radioactivite": radioactivite,
  "pc-t-equilibre": equilibre,
};
