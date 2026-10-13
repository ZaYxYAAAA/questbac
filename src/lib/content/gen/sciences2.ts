/** SVT et Physique-Chimie — thèmes complémentaires des programmes de lycée (2019). */
import { type Generator, type Pair, claims, int, mcq, numeric, pairs, pick, tex } from "./kit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const terms = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Que désigne « ${a} » ?`, reverse: (b) => `Quel terme désigne : ${b} ?`, claim: (a, b) => `« ${cap(a)} » désigne ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` });

// ═════════════ SVT ═════════════

// Seconde — Géosciences et dynamique des paysages
const paysages: Generator[] = [
  ...terms([
    ["altération", "la transformation des roches au contact de l'eau et de l'atmosphère"], ["érosion", "l'enlèvement des particules issues de l'altération"], ["sédimentation", "le dépôt des particules transportées"],
    ["roche sédimentaire", "une roche formée par l'accumulation et la compaction de sédiments"], ["roche magmatique", "une roche formée par le refroidissement d'un magma"], ["méandre", "une sinuosité du lit d'une rivière"],
    ["bassin versant", "le territoire dont les eaux s'écoulent vers un même cours d'eau"], ["delta", "l'accumulation de sédiments à l'embouchure d'un fleuve"], ["glacier", "une masse de glace qui érode et transporte des roches"],
  ]),
  ...pairs(
    [["le granite", "magmatique (plutonique)"], ["le basalte", "magmatique (volcanique)"], ["le calcaire", "sédimentaire"], ["le grès", "sédimentaire (sable cimenté)"], ["l'argile", "sédimentaire (particules très fines)"], ["le marbre", "métamorphique"]],
    { ask: (a) => `Type de roche : ${a} ?`, claim: (a, b) => `${cap(a)} est une roche ${b}.`, explain: (a, b) => `${cap(a)} : roche ${b}.` },
  ),
  (r) => {
    const mm = pick(r, [0.1, 0.2, 0.5, 1, 2]), m = pick(r, [1, 2, 5, 10, 50]);
    return numeric(`Un relief s'abaisse de $${tex(mm)}$ mm par an. Combien d'années pour perdre $${m}$ m ?`, (m * 1000) / mm, `$\\dfrac{${m} \\times 1000 \\text{ mm}}{${tex(mm)} \\text{ mm/an}}$.`, "ans", 1);
  },
  claims([
    ["Le granite s'altère en libérant du sable (arène granitique).", true, "Les feldspaths s'altèrent en argiles, le quartz résiste."],
    ["L'eau est le principal agent d'altération et de transport.", true, "Elle agit chimiquement et mécaniquement."],
    ["Les activités humaines n'ont aucun effet sur l'érosion des sols.", false, "La déforestation et l'agriculture intensive l'accélèrent."],
    ["Plus une particule est grosse, plus il faut un courant rapide pour la transporter.", true, "Les galets se déposent avant les argiles."],
  ]),
];

// Seconde — Microorganismes et santé
const microbes: Generator[] = [
  ...terms([
    ["microbiote", "l'ensemble des micro-organismes vivant dans ou sur notre corps"], ["bactérie", "un être vivant unicellulaire procaryote"], ["virus", "un agent infectieux qui ne se reproduit qu'en infectant une cellule"],
    ["antibiotique", "une molécule qui tue les bactéries ou bloque leur multiplication"], ["antibiorésistance", "la capacité de bactéries à survivre aux antibiotiques"], ["pathogène", "un agent capable de provoquer une maladie"],
    ["IST", "une infection sexuellement transmissible"], ["vaccination", "l'injection d'un antigène inoffensif pour créer une mémoire immunitaire"], ["asepsie", "l'ensemble des mesures empêchant l'introduction de microbes"],
  ]),
  ...pairs(
    [["la grippe", "un virus"], ["la tuberculose", "une bactérie"], ["le sida", "un virus (VIH)"], ["la chlamydiose", "une bactérie"], ["le paludisme", "un parasite (Plasmodium)"], ["la mycose", "un champignon"], ["le Covid-19", "un virus (SARS-CoV-2)"], ["la syphilis", "une bactérie"]],
    { ask: (a) => `Agent responsable de ${a} ?`, claim: (a, b) => `${cap(a)} est causé(e) par ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  (r) => {
    const n0 = pick(r, [1, 10, 100]), t = pick(r, [20, 30]), h = pick(r, [1, 2, 3]);
    const gen = (h * 60) / t;
    return numeric(`Une bactérie se divise toutes les $${t}$ min. Partant de $${n0}$ bactérie(s), combien après $${h}$ h ?`, n0 * 2 ** gen, `$${(h * 60) / t}$ divisions : $${n0} \\times 2^{${gen}}$.`);
  },
  claims([
    ["Les antibiotiques sont efficaces contre les virus.", false, "Ils n'agissent que sur les bactéries."],
    ["Le microbiote intestinal participe à la digestion et à la défense de l'organisme.", true, "Il compte des milliards de bactéries."],
    ["Le préservatif protège des IST.", true, "C'est le seul contraceptif qui le fait."],
    ["Le vaccin contre les papillomavirus (HPV) prévient certains cancers.", true, "Notamment celui du col de l'utérus."],
  ]),
];

// Première — Variation génétique et santé
const genetiqueSante: Generator[] = [
  (r) => {
    const cas = pick(r, ["hétérozygotes", "un homozygote malade et un hétérozygote", "un hétérozygote et un homozygote sain"] as const);
    const p = cas === "hétérozygotes" ? [1, 4] : cas === "un homozygote malade et un hétérozygote" ? [1, 2] : [0, 1];
    return mcq(r, `Maladie autosomique récessive (comme la mucoviscidose). Parents : ${cas}. Probabilité d'un enfant malade ?`, p[0] === 0 ? "0" : `1/${p[1]}`, ["0", "1/4", "1/2", "3/4", "1"], `Échiquier de croisement : il faut recevoir deux allèles malades.`);
  },
  ...terms([
    ["mucoviscidose", "une maladie génétique récessive due à une mutation du gène CFTR"], ["allèle récessif", "une version d'un gène qui ne s'exprime qu'en double exemplaire"], ["agent mutagène", "un facteur qui augmente la fréquence des mutations (UV, tabac…)"],
    ["oncogène", "un gène dont la mutation favorise la prolifération cellulaire"], ["thérapie génique", "le traitement par introduction d'un gène fonctionnel"], ["hétérozygote", "un individu porteur de deux allèles différents d'un gène"],
    ["arbre généalogique", "la représentation de la transmission d'un caractère dans une famille"], ["mutation somatique", "une mutation qui touche une cellule non reproductrice"],
  ]),
  ...pairs(
    [["la mucoviscidose", "autosomique récessive"], ["la drépanocytose", "autosomique récessive"], ["la phénylcétonurie", "autosomique récessive"], ["la chorée de Huntington", "autosomique dominante"], ["l'hémophilie A", "récessive liée au chromosome X"], ["le daltonisme", "récessive liée au chromosome X"], ["la myopathie de Duchenne", "récessive liée au chromosome X"]],
    { ask: (a) => `Mode de transmission de ${a} ?`, claim: (a, b) => `La transmission de ${a} est ${b}.`, explain: (a, b) => `${cap(a)} : transmission ${b}.` },
  ),
  claims([
    ["Un cancer résulte de l'accumulation de mutations dans une lignée cellulaire.", true, "Prolifération incontrôlée."],
    ["Le tabac et les UV sont des agents mutagènes.", true, "Ils augmentent le risque de cancer."],
    ["L'usage excessif des antibiotiques favorise la sélection de bactéries résistantes.", true, "Sélection naturelle accélérée."],
    ["Une maladie récessive peut toucher un enfant dont les deux parents sont sains.", true, "S'ils sont tous deux porteurs (hétérozygotes)."],
  ]),
];

// Terminale — Produire le mouvement
const muscle: Generator[] = [
  ...terms([
    ["ATP", "la molécule qui fournit directement l'énergie à la contraction"], ["actine et myosine", "les protéines dont le glissement raccourcit le sarcomère"], ["sarcomère", "l'unité contractile de la fibre musculaire"],
    ["ions calcium", "les ions libérés par le réticulum qui déclenchent la contraction"], ["fermentation lactique", "la voie qui produit peu d'ATP sans dioxygène"], ["respiration cellulaire", "la voie qui produit beaucoup d'ATP grâce au dioxygène"],
    ["glycogène", "la réserve de glucose stockée dans le muscle et le foie"], ["jonction neuromusculaire", "la synapse entre motoneurone et fibre musculaire"],
  ]),
  (r) => {
    const atpResp = 36, atpFerm = 2, n = int(r, 1, 40);
    return r() < 0.5
      ? numeric(`Respiration : environ $${atpResp}$ ATP par glucose. Combien d'ATP pour $${n}$ glucoses ?`, atpResp * n, `$${atpResp} \\times ${n}$.`)
      : numeric(`Combien de fois plus d'ATP produit la respiration (≈ ${atpResp}) que la fermentation (${atpFerm}) par glucose ?`, atpResp / atpFerm, `$${atpResp} / ${atpFerm}$.`);
  },
  ...pairs(
    [["un sprint de 100 m", "la phosphocréatine et la fermentation lactique"], ["un marathon", "la respiration cellulaire (glucose et lipides)"], ["un 400 m", "surtout la fermentation lactique"], ["une marche lente", "la respiration cellulaire"]],
    { ask: (a) => `Voie principale de production d'ATP pour ${a} ?`, claim: (a, b) => `Pour ${a}, l'ATP vient surtout de ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  claims([
    ["La contraction musculaire consomme de l'ATP.", true, "Pour le cycle actine-myosine."],
    ["La fermentation lactique a lieu dans les mitochondries.", false, "Elle a lieu dans le cytoplasme."],
    ["Les fibres musculaires sont des cellules plurinucléées.", true, "Elles résultent de la fusion de cellules."],
    ["Lors d'un effort bref et intense, la fermentation lactique fournit rapidement de l'ATP.", true, "Sans attendre l'apport de dioxygène."],
  ]),
];

// Terminale — Comportements et stress
const stress: Generator[] = [
  ...pairs(
    [["l'adrénaline", "la médullosurrénale"], ["le cortisol", "la corticosurrénale"], ["la CRH", "l'hypothalamus"], ["l'ACTH", "l'hypophyse"]],
    { ask: (a) => `Où est produit(e) ${a} ?`, reverse: (b) => `Quelle hormone de stress est produite par ${b} ?`, claim: (a, b) => `${cap(a)} est produit(e) par ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...terms([
    ["stress aigu", "une réponse brève et adaptative face à un danger"], ["stress chronique", "un stress prolongé qui dérègle l'organisme"], ["axe corticotrope", "l'axe hypothalamus-hypophyse-glandes surrénales"],
    ["rétrocontrôle négatif", "la régulation par laquelle le cortisol freine sa propre production"], ["résilience", "la capacité à surmonter un stress"], ["plasticité cérébrale", "la capacité du cerveau à se remodeler"], ["glandes surrénales", "les glandes situées au-dessus des reins qui produisent adrénaline et cortisol"], ["anxiolytique", "un médicament qui diminue l'anxiété"], ["agent stresseur", "une situation qui déclenche la réponse de stress"],
  ]),
  ...pairs(
    [["le rythme cardiaque", "augmente"], ["les bronches", "se dilatent"], ["les pupilles", "se dilatent"], ["la glycémie", "augmente"], ["la digestion", "ralentit"], ["la vigilance", "augmente"]],
    { ask: (a) => `Effet de l'adrénaline sur ${a} ?`, claim: (a, b) => `Sous l'effet de l'adrénaline, ${a} ${b}.`, explain: (a, b) => `Adrénaline : ${a} ${b}.` },
  ),
  claims([
    ["L'adrénaline augmente le rythme cardiaque.", true, "Elle prépare l'organisme à l'action."],
    ["Le cortisol augmente la glycémie.", true, "Il mobilise les réserves d'énergie."],
    ["Un stress chronique peut altérer certains neurones de l'hippocampe.", true, "Il a des effets délétères sur le cerveau."],
    ["Le stress est toujours néfaste.", false, "Le stress aigu est une réponse adaptative utile."],
  ]),
];

// ═════════════ Physique-Chimie ═════════════

// Seconde — Signaux électriques
const electricite: Generator[] = [
  (r) => {
    const i1 = int(r, 1, 9) / 10, i2 = int(r, 1, 9) / 10;
    return numeric(`Nœud : $I_1 = ${tex(i1)}$ A et $I_2 = ${tex(i2)}$ A entrent, $I_3$ sort. $I_3$ (A) ?`, i1 + i2, `Loi des nœuds : somme des courants entrants = somme des courants sortants.`, "A", 0.001);
  },
  (r) => {
    const E = pick(r, [6, 9, 12, 24]), u1 = int(r, 1, E - 1);
    return numeric(`Circuit en série : générateur $${E}$ V, une lampe a $${u1}$ V à ses bornes. Tension aux bornes de l'autre dipôle (V) ?`, E - u1, `Loi des mailles : $${E} = ${u1} + U_2$.`, "V");
  },
  (r) => {
    const R1 = pick(r, [10, 22, 47, 100, 220]), R2 = pick(r, [10, 33, 68, 100, 330]);
    return numeric(`Résistances $${R1}\\ \\Omega$ et $${R2}\\ \\Omega$ en série. Résistance équivalente ($\\Omega$) ?`, R1 + R2, `En série, les résistances s'additionnent.`, "Ω");
  },
  (r) => {
    const U = pick(r, [3, 4.5, 6, 9, 12]), R = pick(r, [10, 20, 30, 60, 100]);
    return numeric(`Loi d'Ohm : $U = ${tex(U)}$ V et $R = ${R}\\ \\Omega$. Intensité (A) ?`, U / R, `$I = \\dfrac{U}{R}$.`, "A", 0.001);
  },
  claims([
    ["Un ampèremètre se branche en série.", true, "Il mesure le courant qui le traverse."],
    ["Un voltmètre se branche en série.", false, "Il se branche en dérivation, aux bornes du dipôle."],
    ["Une thermistance est un capteur dont la résistance dépend de la température.", true, "Exemple de capteur résistif."],
    ["Dans un circuit en dérivation, la tension est la même aux bornes des branches.", true, "Loi d'unicité des tensions en dérivation."],
  ]),
];

// Première — Chimie organique
const ORGANIC: Array<[string, string, string]> = [
  ["alcool", "hydroxyle", "$-\\mathrm{OH}$"], ["aldéhyde", "carbonyle en bout de chaîne", "$-\\mathrm{CHO}$"], ["cétone", "carbonyle en milieu de chaîne", "$-\\mathrm{CO}-$"],
  ["acide carboxylique", "carboxyle", "$-\\mathrm{COOH}$"], ["ester", "ester", "$-\\mathrm{COO}-$"], ["amine", "amine", "$-\\mathrm{NH_2}$"],
];
const formula = (c: number, h: number) => `$\\mathrm{C${c === 1 ? "" : `_{${c}}`}H_{${h}}}$`;
const ALKANES = ["méthane", "éthane", "propane", "butane", "pentane", "hexane", "heptane", "octane", "nonane", "décane"];

const organique: Generator[] = [
  ...pairs(ORGANIC.map(([f, , g]) => [f, g] as const), { ask: (a) => `Groupe caractéristique d'un(e) ${a} ?`, reverse: (b) => `Quelle famille possède le groupe ${b} ?`, claim: (a, b) => `La famille ${a} possède le groupe ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` }),
  (r) => {
    const n = int(r, 1, 10);
    return r() < 0.5
      ? mcq(r, `Formule brute du ${ALKANES[n - 1]} ?`, formula(n, 2 * n + 2), [formula(n, 2 * n), formula(n, 2 * n + 1), formula(n + 1, 2 * n + 2)], `Alcane : $\\mathrm{C_nH_{2n+2}}$.`)
      : mcq(r, `Combien d'atomes de carbone dans le ${ALKANES[n - 1]} ?`, String(n), ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].filter((x) => x !== String(n)), `Préfixes : méth (1), éth (2), prop (3), but (4), pent (5), hex (6), hept (7), oct (8), non (9), déc (10).`);
  },
  (r) => {
    const [stem, n] = pick(r, [["méthan", 1], ["éthan", 2], ["propan", 3], ["butan", 4], ["pentan", 5]] as const);
    const [suffix, fam] = pick(r, [["ol", "alcool"], ["al", "aldéhyde"], ["oïque (acide …)", "acide carboxylique"]] as const);
    const name = fam === "acide carboxylique" ? `acide ${stem}oïque` : `${stem}${suffix}`;
    return mcq(r, `Famille de la molécule « ${name} » (${n} C) ?`, fam, ORGANIC.map(([f]) => f), `Suffixe ${fam === "alcool" ? "-ol" : fam === "aldéhyde" ? "-al" : "-oïque"} → ${fam}.`);
  },
  ...pairs(
    [["l'éthanol", "alcool"], ["la propanone", "cétone"], ["l'éthanal", "aldéhyde"], ["l'acide éthanoïque", "acide carboxylique"], ["l'éthanoate d'éthyle", "ester"], ["la méthylamine", "amine"], ["le butan-1-ol", "alcool"], ["la butanone", "cétone"], ["le pentanal", "aldéhyde"], ["l'acide méthanoïque", "acide carboxylique"]],
    { ask: (a) => `Famille chimique de ${a} ?`, claim: (a, b) => `${cap(a)} appartient à la famille : ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  claims([
    ["Le suffixe « -one » désigne une cétone.", true, "Exemple : la propanone (acétone)."],
    ["L'éthanol appartient à la famille des aldéhydes.", false, "C'est un alcool (suffixe -ol)."],
    ["Un spectre infrarouge permet d'identifier des groupes caractéristiques.", true, "Chaque liaison absorbe à des nombres d'onde caractéristiques."],
  ]),
];

// Première — Dosage par spectrophotométrie, couleurs
const spectro: Generator[] = [
  (r) => {
    const k = int(r, 2, 30) * 10, C = int(r, 1, 9) / 1000;
    return r() < 0.5
      ? numeric(`Loi de Beer-Lambert $A = k \\times C$ avec $k = ${k}$ L/mol et $C = ${tex(C)}$ mol/L. Absorbance ?`, k * C, `$A = ${k} \\times ${tex(C)}$.`, undefined, 0.001)
      : numeric(`$A = ${tex(k * C)}$ et $k = ${k}$ L/mol. Concentration (mol/L) ?`, C, `$C = \\dfrac{A}{k}$.`, "mol/L", 0.00001);
  },
  ...pairs(
    [["rouge", "cyan"], ["vert", "magenta"], ["bleu", "jaune"], ["cyan", "rouge"], ["magenta", "vert"], ["jaune", "bleu"]],
    { ask: (a) => `Une solution qui absorbe le ${a} paraît de quelle couleur ?`, claim: (a, b) => `Une solution qui absorbe le ${a} paraît ${b}.`, explain: (a, b) => `Couleur perçue = couleur complémentaire de celle absorbée : ${a} → ${b}.` },
  ),
  claims([
    ["Pour un dosage par étalonnage, on trace la droite A = f(C) avec des solutions de concentration connue.", true, "On lit ensuite la concentration inconnue."],
    ["La loi de Beer-Lambert est valable pour toutes les concentrations.", false, "Elle n'est valable que pour des solutions diluées."],
    ["On règle le spectrophotomètre à la longueur d'onde du maximum d'absorption.", true, "Pour une meilleure précision."],
  ]),
];

// Première — Lumière : ondes et particules
const photon: Generator[] = [
  (r) => {
    const lam = int(r, 40, 80) * 10;
    return numeric(`Énergie d'un photon de longueur d'onde $${lam}$ nm, en eV (au centième) ? ($E = \\dfrac{hc}{\\lambda}$, $hc \\approx 1240$ eV·nm)`, Math.round((1240 / lam) * 100) / 100, `$E = \\dfrac{1240}{${lam}} \\approx ${tex(1240 / lam, 2)}$ eV.`, "eV", 0.02);
  },
  (r) => {
    const lam = int(r, 38, 82) * 10;
    const zone = lam < 400 ? "ultraviolet" : lam > 800 ? "infrarouge" : "visible";
    return mcq(r, `Une radiation de $${lam}$ nm appartient au domaine…`, zone, ["ultraviolet", "visible", "infrarouge", "rayons X"], `Le visible s'étend d'environ 400 à 800 nm.`);
  },
  ...pairs(
    [["violet", "environ 400 nm"], ["bleu", "environ 470 nm"], ["vert", "environ 530 nm"], ["jaune", "environ 580 nm"], ["rouge", "environ 700 nm"]],
    { ask: (a) => `Longueur d'onde approximative du ${a} ?`, reverse: (b) => `Quelle couleur correspond à ${b} ?`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  (r) => {
    const E = pick(r, [1.5, 2, 2.5, 3, 3.1, 1.8, 2.2]);
    return numeric(`Un photon a une énergie de $${tex(E)}$ eV. Longueur d'onde (nm, à l'unité) ? ($hc \\approx 1240$ eV·nm)`, Math.round(1240 / E), `$\\lambda = \\dfrac{1240}{${tex(E)}}$.`, "nm", 1);
  },
  claims([
    ["La lumière se comporte à la fois comme une onde et comme un ensemble de particules (photons).", true, "Dualité onde-particule."],
    ["Plus la longueur d'onde est courte, plus le photon est énergétique.", true, "$E = hc/\\lambda$."],
    ["Un atome peut absorber un photon de n'importe quelle énergie.", false, "Seulement des énergies égales à l'écart entre deux niveaux."],
  ]),
];

// Première — Fluides au repos
const fluides: Generator[] = [
  (r) => {
    const F = int(r, 1, 50) * 20, S = pick(r, [0.01, 0.02, 0.04, 0.05, 0.1, 0.2, 0.25, 0.5]);
    return numeric(`Force $${F}$ N répartie sur $${tex(S)}$ m². Pression (Pa) ?`, F / S, `$P = \\dfrac{F}{S}$.`, "Pa", 0.5);
  },
  (r) => {
    const h = int(r, 1, 60);
    return numeric(`Différence de pression entre la surface et $${h}$ m de profondeur dans l'eau ($\\rho = 1000$ kg/m³, $g = 10$) en Pa ?`, 1000 * 10 * h, `Loi fondamentale de la statique des fluides : $\\Delta P = \\rho g h$.`, "Pa", 1);
  },
  (r) => {
    const P1 = pick(r, [1, 1.5, 2, 2.5, 3]) * 1e5, V1 = int(r, 1, 12), k = pick(r, [2, 3, 4, 5]);
    return numeric(`Loi de Mariotte : un gaz à $${tex(P1 / 1e5)} \\times 10^5$ Pa occupe $${V1}$ L. On divise son volume par $${k}$ (température constante). Nouvelle pression (×10⁵ Pa) ?`, (P1 * k) / 1e5, `$PV = \\text{cste}$ : la pression est multipliée par $${k}$.`, undefined, 0.01);
  },
  claims([
    ["La pression atmosphérique au niveau de la mer vaut environ $10^5$ Pa.", true, "Soit environ 1 bar."],
    ["La pression dans un liquide diminue avec la profondeur.", false, "Elle augmente avec la profondeur."],
    ["Un corps immergé subit une poussée verticale vers le haut (Archimède).", true, "Égale au poids du fluide déplacé."],
  ]),
];

// Terminale — Sens d'évolution, piles
const equilibre: Generator[] = [
  (r) => {
    const K = pick(r, [1e-5, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 1e4, 1e6]), Q = pick(r, [1e-4, 0.002, 0.05, 0.5, 2, 5, 50, 500, 5000, 1e5]);
    const sens = Q < K ? "dans le sens direct" : Q > K ? "dans le sens inverse" : "n'évolue pas";
    return mcq(r, `$Q_r = ${tex(Q)}$ et $K = ${tex(K)}$. Le système évolue…`, sens, ["dans le sens direct", "dans le sens inverse", "n'évolue pas"], `On compare $Q_r$ à $K$ : ${Q < K ? "Q < K" : Q > K ? "Q > K" : "Q = K"}.`);
  },
  ...terms([
    ["pile", "un dispositif qui convertit de l'énergie chimique en énergie électrique"], ["anode", "l'électrode où se produit l'oxydation"], ["cathode", "l'électrode où se produit la réduction"],
    ["pont salin", "la jonction qui assure la neutralité électrique des solutions"], ["capacité d'une pile", "la quantité maximale d'électricité qu'elle peut débiter"], ["quotient de réaction", "le rapport des activités des produits et des réactifs"],
  ]),
  (r) => {
    const I = int(r, 1, 20) / 10, t = pick(r, [60, 300, 600, 1200, 1800, 3600, 7200]);
    return numeric(`Une pile débite $${tex(I)}$ A pendant $${t}$ s. Charge électrique $Q$ (C) ?`, I * t, `$Q = I \\times \\Delta t$.`, "C", 0.5);
  },
  claims([
    ["Une pile usée est un système qui a atteint l'équilibre.", true, "Alors $Q_r = K$ et le courant est nul."],
    ["Les électrons circulent dans le pont salin.", false, "Ce sont les ions qui y circulent ; les électrons passent par le circuit extérieur."],
    ["À l'anode, il se produit une réduction.", false, "Anode = oxydation, cathode = réduction."],
  ]),
];

export const SCIENCES2: Record<string, Generator[]> = {
  "svt-2-paysages": paysages,
  "svt-2-microorganismes": microbes,
  "svt-1-genetique-sante": genetiqueSante,
  "svt-t-muscle": muscle,
  "svt-t-stress": stress,
  "pc-2-electricite": electricite,
  "pc-1-organique": organique,
  "pc-1-spectro": spectro,
  "pc-1-photon": photon,
  "pc-1-fluides": fluides,
  "pc-t-equilibre": equilibre,
};

