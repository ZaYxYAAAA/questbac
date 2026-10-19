/** Générateurs de questions — SVT (Seconde, Première, Terminale). */
import { type Generator, cards, claims, int, mcq, numeric, pairs, pick, sample, tex, tf } from "./kit";
import { shuffle } from "@/lib/game/quests";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** « que » élidé devant une voyelle : « qu'un engrais », « que l'humus ». */
const que = (s: string) => (/^[aeiouyéèêâîôh]/i.test(s) ? `qu'${s}` : `que ${s}`);
/** Accord du verbe avec un libellé au pluriel (« les décomposeurs désignent… »). */
const agree = (a: string, singular: string, plural: string) => (/^(les|des) /i.test(a) ? plural : singular);
const COMPLEMENT: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };
const strand = (r: () => number, n: number) => Array.from({ length: n }, () => pick(r, ["A", "T", "G", "C"])).join("");

// ───────────── Seconde : la cellule ─────────────

const cellule: Generator[] = [
  ...pairs(
    [
      ["le noyau", "contient l'ADN (l'information génétique)"], ["la mitochondrie", "réalise la respiration cellulaire"], ["le chloroplaste", "réalise la photosynthèse"],
      ["la membrane plasmique", "délimite la cellule et contrôle les échanges"], ["la paroi", "rigidifie la cellule végétale"], ["la vacuole", "stocke l'eau et des réserves"],
      ["le ribosome", "fabrique les protéines"], ["l'appareil de Golgi", "modifie et exporte les protéines"], ["le cytosquelette", "organise l'intérieur de la cellule grâce à un réseau de filaments protéiques"],
      ["le flagelle", "permet au spermatozoïde de se déplacer"], ["le réticulum endoplasmique", "transporte les protéines en cours de fabrication"],
    ],
    { ask: (a) => `Rôle principal de ${a} ?`, reverse: (b) => `Quelle structure ${b} ?`, claim: (a, b) => `${cap(a)} ${b}.`, explain: (a, b) => `${cap(a)} ${b}.` },
  ),
  ...pairs(
    [["une bactérie", "procaryote (sans noyau)"], ["une cellule de feuille", "eucaryote végétale (avec chloroplastes et paroi)"], ["un neurone", "eucaryote animale (sans paroi)"], ["une levure", "eucaryote d'un champignon unicellulaire"]],
    { ask: (a) => `Type de cellule : ${a} ?`, reverse: (b) => `Quel exemple correspond à une cellule ${b} ?`, explain: (a, b) => `${cap(a)} : cellule ${b}.` },
  ),
  (r) => {
    const obj = pick(r, [4, 10, 40, 100]), ocu = pick(r, [5, 10, 15, 20]);
    return r() < 0.5
      ? numeric(`Microscope : objectif ×${obj}, oculaire ×${ocu}. Grossissement total ?`, obj * ocu, `On multiplie : $${obj} \\times ${ocu}$.`)
      : (() => {
          const g = obj * ocu, real = pick(r, [2, 5, 8, 10, 20, 25, 50]);
          return numeric(`Au grossissement ×${g}, une cellule mesure $${tex((real * g) / 1000)}$ mm sur l'image. Taille réelle (µm) ?`, real, `Taille réelle $= \\dfrac{${tex((real * g) / 1000)} \\text{ mm}}{${g}} = ${tex(real / 1000, 4)}$ mm $= ${real}$ µm.`, "µm", 0.01);
        })();
  },
  claims([
    ["Tous les êtres vivants sont constitués de cellules.", true, "La cellule est l'unité du vivant."],
    ["Les cellules animales possèdent une paroi.", false, "La paroi caractérise les cellules végétales, bactériennes et fongiques."],
    ["Une bactérie possède un noyau.", false, "C'est une cellule procaryote : son ADN est libre dans le cytoplasme."],
    ["Une cellule humaine mesure en général entre 10 et 100 µm.", true, "Il faut un microscope pour la voir."],
    ["Les mitochondries sont présentes dans les cellules animales et végétales.", true, "Toutes deux respirent."],
  ]),
];

// ───────────── Seconde : ADN et biodiversité ─────────────

const adn: Generator[] = [
  (r) => {
    const s = strand(r, int(r, 6, 9));
    const comp = [...s].map((b) => COMPLEMENT[b]).join("");
    const wrong = [[...s].reverse().join(""), s, [...comp].map((b, i) => (i === 1 ? COMPLEMENT[b] : b)).join("")];
    return mcq(r, `Brin d'ADN : ${s}. Brin complémentaire ?`, comp, wrong, `A s'apparie avec T, et G avec C.`, () => {
      const i = int(r, 0, comp.length - 1);
      return comp.slice(0, i) + pick(r, ["A", "T", "G", "C"].filter((b) => b !== comp[i])) + comp.slice(i + 1);
    });
  },
  (r) => {
    const a = int(r, 10, 40);
    const g = (100 - 2 * a) / 2;
    return r() < 0.5
      ? numeric(`Un ADN contient $${a}\\,\\%$ d'adénine (A). Pourcentage de thymine (T) ?`, a, `A s'apparie avec T : autant de A que de T.`, "%")
      : numeric(`Un ADN contient $${a}\\,\\%$ d'adénine (A). Pourcentage de guanine (G) ?`, g, `$\\%T = ${a}$, donc $\\%G = \\%C = \\dfrac{100 - ${2 * a}}{2} = ${tex(g)}$.`, "%", 0.01);
  },
  ...pairs(
    [["A (adénine)", "T (thymine)"], ["T (thymine)", "A (adénine)"], ["G (guanine)", "C (cytosine)"], ["C (cytosine)", "G (guanine)"]],
    { ask: (a) => `Dans l'ADN, ${a} s'apparie avec…`, explain: (a, b) => `${a} est complémentaire de ${b}.` },
  ),
  ...pairs(
    [["une substitution", "un nucléotide est remplacé par un autre"], ["une délétion", "un ou plusieurs nucléotides sont perdus"], ["une insertion", "un ou plusieurs nucléotides sont ajoutés"]],
    { ask: (a) => `Lors d'une mutation par ${a.replace(/^une /, "")}…`, reverse: (b) => `Quelle mutation : ${b} ?`, claim: (a, b) => `Lors d'${a}, ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  claims([
    ["La molécule d'ADN est formée de deux brins enroulés en double hélice.", true, "Modèle de Watson et Crick (1953)."],
    ["L'ADN est universel : on le retrouve chez tous les êtres vivants.", true, "C'est un argument de la parenté du vivant."],
    ["Une mutation est toujours défavorable.", false, "Elle peut être neutre, défavorable ou favorable."],
    ["La biodiversité concerne la diversité des écosystèmes, des espèces et des gènes.", true, "Trois échelles de biodiversité."],
    ["Un nucléotide est formé d'un sucre, d'un phosphate et d'une base azotée.", true, "Le sucre de l'ADN est le désoxyribose."],
    ["Les mutations surviennent seulement sous l'effet d'agents mutagènes.", false, "Elles surviennent aussi spontanément (erreurs de réplication)."],
  ]),
];

// ───────────── Seconde : métabolisme ─────────────

const metabolisme: Generator[] = [
  ...pairs(
    [["l'amylase", "l'amidon"], ["la lipase", "les lipides"], ["la pepsine (une protéase)", "les protéines"], ["la lactase", "le lactose"], ["la catalase", "le peroxyde d'hydrogène (eau oxygénée)"], ["la saccharase", "le saccharose"]],
    { ask: (a) => `Substrat de ${a} ?`, reverse: (b) => `Quelle enzyme dégrade ${b} ?`, claim: (a, b) => `${cap(a)} agit sur ${b}.`, explain: (a, b) => `${cap(a)} catalyse la transformation de ${b}.` },
  ),
  (r) => {
    const [org, auto] = pick(r, [["une plante verte", true], ["une cyanobactérie", true], ["un champignon", false], ["l'être humain", false], ["une levure", false], ["une algue verte", true], ["une vache", false], ["un chêne", true], ["un ver de terre", false], ["une mousse", true]] as const);
    return tf(`${cap(org)} est autotrophe.`, auto, `${cap(org)} est ${auto ? "autotrophe : produit sa matière organique à partir de matière minérale (photosynthèse)" : "hétérotrophe : consomme de la matière organique"}.`);
  },
  (r) => {
    const t = pick(r, [5, 10, 15, 20]), d = pick(r, [10, 20, 30, 40, 60, 90]);
    const net = pick(r, [1.5, 2, 2.5, 3, 4]), resp = pick(r, [0.5, 0.8, 1, 1.2]);
    return pick(r, [
      () => numeric(`Une plante éclairée dégage $${d}$ µmol de $\\mathrm{O_2}$ en $${t}$ min. Vitesse moyenne de production (µmol/min) ?`, d / t, `$v = \\dfrac{${d}}{${t}}$.`, "µmol/min", 0.01),
      () => numeric(`À la lumière, une suspension d'algues rejette $${tex(net)}$ µmol de $\\mathrm{O_2}$ par minute ; à l'obscurité, elle en consomme $${tex(resp)}$ µmol par minute. Production réelle de $\\mathrm{O_2}$ par la photosynthèse à la lumière (µmol/min) ?`, net + resp,
        `À la lumière, la respiration continue : le dégagement mesuré est la différence photosynthèse − respiration. Photosynthèse $= ${tex(net)} + ${tex(resp)} = ${tex(net + resp)}$ µmol/min.`, "µmol/min", 0.01, 2),
    ])();
  },
  ...pairs(
    [["la photosynthèse", "dioxyde de carbone + eau + lumière → glucose + dioxygène"], ["la respiration", "glucose + dioxygène → dioxyde de carbone + eau + énergie"], ["la fermentation alcoolique", "glucose → éthanol + dioxyde de carbone + un peu d'énergie"]],
    { ask: (a) => `Bilan de ${a} ?`, reverse: (b) => `Quel métabolisme a pour bilan : ${b} ?`, claim: (a, b) => `Bilan de ${a} : ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  claims([
    ["Une enzyme est un catalyseur biologique de nature protéique.", true, "Elle accélère une réaction sans être consommée."],
    ["Une enzyme fonctionne de façon optimale à une température et un pH précis.", true, "Au-delà, elle peut être dénaturée."],
    ["La photosynthèse a lieu dans les mitochondries.", false, "Elle a lieu dans les chloroplastes."],
    ["Les cellules végétales respirent aussi.", true, "Jour et nuit, dans leurs mitochondries."],
    ["Une enzyme est spécifique de son substrat.", true, "Modèle clé-serrure."],
    ["La fermentation produit plus d'énergie que la respiration.", false, "Elle en produit beaucoup moins."],
  ]),
];

// ───────────── Seconde : agrosystèmes et sols ─────────────

const sols: Generator[] = [
  ...pairs(
    [
      ["l'humus", "la matière organique décomposée du sol"], ["la roche mère", "la roche à l'origine de la fraction minérale du sol"], ["l'altération", "la dégradation de la roche par l'eau et le climat"],
      ["les décomposeurs", "les êtres vivants qui recyclent la matière organique"], ["un agrosystème", "un écosystème géré par l'humain pour produire"], ["l'érosion", "l'arrachement et le transport des particules du sol"],
      ["le complexe argilo-humique", "l'association argile + humus qui retient les ions minéraux"], ["un engrais", "un apport d'éléments minéraux (N, P, K) aux cultures"],
    ],
    { ask: (a) => `Qu'est-ce ${que(a)} ?`, reverse: (b) => `Comment appelle-t-on ${b} ?`, claim: (a, b) => `${cap(a)} ${agree(a, "désigne", "désignent")} ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...pairs(
    [["l'argile", "moins de 2 µm"], ["le limon", "entre 2 et 50 µm"], ["le sable", "entre 50 µm et 2 mm"], ["les graviers", "plus de 2 mm"]],
    { ask: (a) => `Taille des particules de ${a} ?`, reverse: (b) => `Quelles particules mesurent ${b} ?`, claim: (a, b) => `Les particules de ${a.replace(/^l'|^le |^les /, "")} mesurent ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  (r) => {
    // Vitesses réalistes de formation d'un sol : de l'ordre de 1 cm par siècle à 1 cm par millénaire.
    const [cm, t] = pick(r, [[1, 100], [1, 250], [1, 500], [1, 1000], [2, 500], [0.5, 100]] as const);
    const depth = pick(r, [20, 30, 50, 80]), lost = pick(r, [1, 2, 5]);
    const years = (depth / cm) * t;
    return pick(r, [
      () => numeric(`Un sol se forme à raison d'environ $${tex(cm)}$ cm par ${t === 100 ? "siècle" : `$${t}$ ans`}. Combien d'années pour former un sol de $${depth}$ cm d'épaisseur ?`, years, `$\\dfrac{${depth}}{${tex(cm)}} \\times ${t} = ${tex(years)}$ ans : à l'échelle humaine, le sol est une ressource non renouvelable.`, "ans", 1),
      () => numeric(`Une parcelle laissée à nu perd $${lost}$ cm de sol en un seul orage. Le sol se reforme à raison d'environ $${tex(cm)}$ cm par ${t === 100 ? "siècle" : `$${t}$ ans`}. Combien d'années pour reconstituer cette perte ?`, (lost / cm) * t, `$\\dfrac{${lost}}{${tex(cm)}} \\times ${t} = ${tex((lost / cm) * t)}$ ans : l'érosion est bien plus rapide que la formation du sol.`, "ans", 1),
    ])();
  },
  claims([
    ["Le sol est une ressource non renouvelable à l'échelle humaine.", true, "Il se forme très lentement."],
    ["Les vers de terre améliorent la structure et l'aération du sol.", true, "Ils mélangent et creusent des galeries."],
    ["Dans un agrosystème, une partie de la biomasse est exportée par les récoltes.", true, "Il faut compenser par des apports."],
    ["Laisser un sol nu limite son érosion.", false, "Un couvert végétal protège le sol de l'érosion."],
    ["L'excès d'engrais azotés peut polluer les nappes phréatiques.", true, "Lessivage des nitrates."],
  ]),
];

// ───────────── Seconde : procréation ─────────────

const procreation: Generator[] = [
  ...pairs(
    [["la testostérone", "les testicules"], ["les œstrogènes et la progestérone", "les ovaires"], ["la FSH et la LH", "l'hypophyse"], ["la GnRH", "l'hypothalamus"]],
    { ask: (a) => `Quel organe sécrète ${a} ?`, reverse: (b) => `Sécrétion hormonale de ${b} ?`, claim: (a, b) => `Organe qui sécrète ${a} : ${b}.`, explain: (a, b) => `${cap(a)} : sécrétion par ${b}.` },
  ),
  ...pairs(
    [
      ["les ovaires", "produire les ovocytes"], ["l'utérus", "accueillir l'embryon (nidation)"], ["les trompes", "être le lieu de la fécondation"], ["les testicules", "produire les spermatozoïdes"],
      ["l'épididyme", "assurer la maturation des spermatozoïdes"], ["la prostate", "produire une partie du liquide séminal"], ["le col de l'utérus", "sécréter la glaire cervicale"],
    ],
    { ask: (a) => `Rôle de ${a} ?`, reverse: (b) => `Quel organe a pour rôle de ${b} ?`, claim: (a, b) => `Le rôle de ${a} est de ${b}.`, explain: (a, b) => `Le rôle de ${a} est de ${b}.` },
  ),
  (r) => {
    const L = int(r, 24, 35);
    return numeric(`Cycle menstruel régulier de $${L}$ jours : jour approximatif de l'ovulation ?`, L - 14, `L'ovulation a lieu environ 14 jours avant les règles suivantes : $${L} - 14$.`, undefined, 0.5);
  },
  claims([
    ["La pilule contraceptive bloque l'ovulation grâce à des hormones de synthèse.", true, "Elle exerce un rétrocontrôle sur le complexe hypothalamo-hypophysaire."],
    ["Le préservatif est le seul contraceptif qui protège aussi des IST.", true, "Il fait barrière aux micro-organismes."],
    ["Chez l'homme, la production de spermatozoïdes s'arrête vers 40 ans.", false, "Elle est continue de la puberté jusqu'à la fin de la vie."],
    ["Le sexe génétique est déterminé par les chromosomes XX ou XY.", true, "Le gène SRY du chromosome Y oriente vers le sexe masculin."],
    ["L'identité de genre et l'orientation sexuelle sont déterminées uniquement par les hormones.", false, "Elles relèvent aussi de facteurs personnels, sociaux et culturels."],
  ]),
];

// ───────────── Première : réplication et mitose ─────────────

const replication: Generator[] = [
  ...pairs(
    [
      ["la prophase", "les chromosomes se condensent"], ["la métaphase", "les chromosomes s'alignent sur la plaque équatoriale"], ["l'anaphase", "les chromatides sœurs se séparent"],
      ["la télophase", "deux noyaux se reforment"], ["la phase S", "l'ADN est répliqué"], ["la phase G1", "la cellule croît avant la réplication"],
    ],
    { ask: (a) => `Que se passe-t-il pendant ${a} ?`, reverse: (b) => `À quelle étape ${b} ?`, claim: (a, b) => `Pendant ${a}, ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  (r) => {
    const n = pick(r, [2, 4, 6, 8, 12, 23, 39]), stage = pick(r, ["G1", "G2", "métaphase", "fin de télophase (chaque cellule fille)"] as const);
    const chromatids = stage === "G1" || stage.startsWith("fin") ? 2 * n : 4 * n;
    return numeric(`Cellule à $2n = ${2 * n}$ chromosomes. Nombre de chromatides en ${stage} ?`, chromatids, stage === "G1" || stage.startsWith("fin") ? `Chromosomes à une chromatide : $${2 * n}$.` : `Après la phase S, chaque chromosome a deux chromatides : $2 \\times ${2 * n}$.`);
  },
  (r) => {
    const total = pick(r, [12, 16, 20, 24, 30]), pct = pick(r, [25, 30, 40, 50]);
    return numeric(`Un cycle cellulaire dure $${total}$ h ; la phase S en occupe $${pct}\\,\\%$. Durée de la phase S (h) ?`, (total * pct) / 100, `$${total} \\times ${tex(pct / 100)}$.`, "h", 0.01);
  },
  (r) => {
    const q = pick(r, [6, 7, 8, 10, 12]);
    return numeric(`Une cellule contient $${q}$ pg d'ADN en G1. Quantité d'ADN en G2 (pg) ?`, 2 * q, `La réplication (phase S) double la quantité d'ADN.`, "pg");
  },
  (r) => {
    const g = int(r, 1, 5);
    return numeric(`Expérience de Meselson et Stahl : après $${g}$ génération${g > 1 ? "s" : ""} en milieu léger, pourcentage de molécules d'ADN hybrides ?`, (100 * 2) / 2 ** g, `Réplication semi-conservative : 2 molécules hybrides sur $2^{${g}}$.`, "%", 0.01);
  },
  claims([
    ["La réplication de l'ADN est semi-conservative.", true, "Chaque nouvelle molécule garde un brin ancien."],
    ["La mitose produit deux cellules génétiquement identiques.", true, "Même information génétique que la cellule mère."],
    ["L'ADN polymérase ne fait jamais d'erreur.", false, "Des erreurs rares sont à l'origine de mutations."],
    ["Les mutations qui touchent les cellules germinales peuvent être transmises à la descendance.", true, "Contrairement aux mutations somatiques."],
    ["Un cancer peut résulter de mutations dans des gènes contrôlant la division cellulaire.", true, "Prolifération incontrôlée."],
  ]),
];

// ───────────── Première : expression du génome ─────────────

const CODONS: Array<[string, string]> = [
  ["AUG", "Met (méthionine, début)"], ["UUU", "Phe (phénylalanine)"], ["GGC", "Gly (glycine)"], ["GCU", "Ala (alanine)"], ["UGG", "Trp (tryptophane)"],
  ["AAA", "Lys (lysine)"], ["GAA", "Glu (acide glutamique)"], ["CAU", "His (histidine)"], ["UGU", "Cys (cystéine)"], ["CCC", "Pro (proline)"], ["UAA", "STOP"],
];
const DNA_TO_RNA: Record<string, string> = { A: "U", T: "A", G: "C", C: "G" };

const expression: Generator[] = [
  (r) => {
    const s = strand(r, int(r, 6, 9));
    const rna = [...s].map((b) => DNA_TO_RNA[b]).join("");
    return mcq(r, `Brin transcrit de l'ADN : ${s}. ARN messager obtenu ?`, rna, [[...s].map((b) => COMPLEMENT[b]).join(""), s.replace(/T/g, "U"), [...rna].reverse().join("")], `Complémentarité, avec U (uracile) à la place de T face à A.`, () => {
      const i = int(r, 0, rna.length - 1);
      return rna.slice(0, i) + pick(r, ["A", "U", "G", "C"].filter((b) => b !== rna[i])) + rna.slice(i + 1);
    });
  },
  (r) => {
    // Traduction d'un ARNm à l'aide d'un extrait du code génétique (fourni, comme dans les sujets : il ne s'apprend pas par cœur).
    const sense = CODONS.filter(([c]) => c !== "AUG" && c !== "UAA");
    const body = sample(r, sense, int(r, 3, 4));
    const short = (aa: string) => aa.split(" ")[0];
    const rna = ["AUG", ...body.map(([c]) => c), "UAA"].join("");
    const right = ["Met", ...body.map(([, aa]) => short(aa))];
    const table = [...new Map([CODONS[0], ...body, ...sample(r, sense.filter((x) => !body.includes(x)), 2), CODONS[CODONS.length - 1]]).entries()]
      .map(([c, aa]) => `${c} = ${short(aa)}`).join(" ; ");
    const show = (p: string[]) => p.join("-");
    const wrongs = [
      show([...right, "STOP"]),
      show(["Met", ...[...right.slice(1)].reverse()]),
      show(right.slice(1)),
      show(right.map((aa, i) => (i === 1 ? short(pick(r, sense.filter(([, x]) => short(x) !== aa))[1]) : aa))),
    ];
    return mcq(r, `ARNm : ${rna}. Extrait du code génétique : ${table}. Séquence du peptide obtenu ?`, show(right), wrongs,
      `On lit l'ARNm codon par codon à partir de AUG (Met) ; le codon STOP (UAA) arrête la traduction sans coder d'acide aminé.`, undefined, 2);
  },
  (r) => {
    // Mutation non-sens : un codon devient STOP, la protéine est tronquée.
    const n = int(r, 120, 480), k = int(r, 20, n - 10);
    const [from, to] = pick(r, [["UGG (Trp)", "UAG"], ["UAU (Tyr)", "UAA"], ["CAA (Gln)", "UAA"], ["UGG (Trp)", "UGA"], ["AAA (Lys)", "UAA"]] as const);
    return numeric(`Une protéine compte $${n}$ acides aminés. Une substitution transforme le codon n° $${k}$ de l'ARNm, ${from}, en ${to}, un codon STOP. Combien d'acides aminés compte la protéine mutée ?`, k - 1,
      `La traduction s'arrête au codon n° $${k}$ : seuls les $${k - 1}$ premiers codons sont traduits. C'est une mutation non-sens (protéine tronquée, en général non fonctionnelle).`, undefined, undefined, 2);
  },
  (r) => {
    const n = int(r, 10, 300);
    return numeric(`Un ARNm a une phase codante de $${3 * n}$ nucléotides (codon STOP compris). Nombre d'acides aminés de la protéine ?`, n - 1, `$${3 * n} / 3 = ${n}$ codons, dont un STOP qui ne code aucun acide aminé.`);
  },
  // Lieux et acteurs de l'expression génétique : leurres tous faux (pas de mitochondrie, qui transcrit et traduit son propre ADN).
  cards([
    ["Où se déroule la transcription dans une cellule eucaryote ?", "dans le noyau", ["dans le cytoplasme, sur les ribosomes", "dans l'appareil de Golgi", "dans la vacuole"], "L'ADN ne sort pas du noyau : il y est transcrit en ARN pré-messager."],
    ["Où se déroule la traduction des ARNm dans une cellule eucaryote ?", "dans le cytoplasme, sur les ribosomes", ["dans le noyau", "dans l'appareil de Golgi", "dans la vacuole"], "L'ARNm quitte le noyau par les pores nucléaires ; il est traduit par les ribosomes du cytoplasme."],
    ["Où se déroule la maturation (épissage) des ARN pré-messagers ?", "dans le noyau", ["dans le cytoplasme, sur les ribosomes", "dans l'appareil de Golgi", "dans la vacuole"], "L'épissage a lieu dans le noyau, avant l'export de l'ARNm mature vers le cytoplasme."],
    ["Que fait l'épissage d'un ARN pré-messager ?", "il retire les introns et raccorde les exons", ["il retire les exons et raccorde les introns", "il ajoute le codon STOP en fin d'ARN", "il remplace la thymine par l'uracile"], "Les introns sont éliminés ; l'épissage alternatif (choix des exons conservés) permet plusieurs protéines à partir d'un même gène."],
    ["Quelle enzyme réalise la transcription ?", "l'ARN polymérase", ["l'ADN polymérase", "le ribosome", "l'ARN de transfert"], "L'ARN polymérase assemble des nucléotides d'ARN complémentaires du brin transcrit de l'ADN ; l'ADN polymérase sert à la réplication."],
  ]),
  claims([
    ["Le code génétique est redondant : plusieurs codons peuvent coder le même acide aminé.", true, "64 codons pour 20 acides aminés."],
    ["Le code génétique est quasi universel.", true, "Les mêmes codons codent les mêmes acides aminés chez presque tous les êtres vivants."],
    ["Un gène code toujours une seule protéine.", false, "L'épissage alternatif permet plusieurs protéines à partir d'un gène."],
    ["L'ARN contient de la thymine.", false, "L'ARN contient de l'uracile à la place de la thymine."],
    ["Le phénotype dépend des gènes et de l'environnement.", true, "Exemple : le bronzage."],
  ]),
];

// ───────────── Première : tectonique ─────────────

const tectonique: Generator[] = [
  ...pairs(
    [
      ["une dorsale océanique", "deux plaques s'écartent et créent de la lithosphère océanique"], ["une zone de subduction", "une plaque océanique plonge sous une autre plaque"],
      ["une chaîne de collision", "deux lithosphères continentales s'affrontent"], ["un rift continental", "un continent commence à se déchirer"],
      ["un point chaud", "un panache mantellique perce la plaque (volcanisme intraplaque)"], ["une faille transformante", "deux plaques coulissent l'une contre l'autre"],
    ],
    { ask: (a) => `Que se passe-t-il au niveau d'${a} ?`, reverse: (b) => `Quelle structure : ${b} ?`, claim: (a, b) => `Au niveau d'${a}, ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...pairs(
    // L'Islande (dorsale ET point chaud) rendait « un point chaud » juste comme leurre : remplacée.
    [["l'Himalaya", "une chaîne de collision"], ["les Alpes", "une chaîne de collision"], ["la fosse des Mariannes", "une zone de subduction"], ["la cordillère des Andes", "une zone de subduction"], ["Hawaï", "un point chaud"], ["l'île de La Réunion", "un point chaud"], ["la vallée du Grand Rift (Afrique de l'Est)", "un rift continental"], ["la faille de San Andreas", "une faille transformante"]],
    { ask: (a) => `${cap(a)} ${agree(a, "correspond", "correspondent")} à…`, reverse: (b) => `Quel lieu correspond à ${b} ?`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  (r) => {
    const v = pick(r, [1, 2, 2.5, 3, 4, 5, 8, 10]), age = pick(r, [2, 5, 10, 20, 40, 60, 100]);
    const km = v * age * 10; // cm/an × Ma → km
    return r() < 0.5
      ? numeric(`Un basalte de $${age}$ Ma se trouve à $${tex(km)}$ km de l'axe de la dorsale. Demi-vitesse d'expansion (cm/an) ?`, v, `$v = \\dfrac{${tex(km)} \\times 10^5 \\text{ cm}}{${age} \\times 10^6 \\text{ ans}} = ${tex(v)}$ cm/an.`, "cm/an", 0.01)
      : numeric(`Demi-vitesse d'expansion $${tex(v)}$ cm/an. Âge du plancher à $${tex(km)}$ km de la dorsale (Ma) ?`, age, `$t = \\dfrac{d}{v}$ : $\\dfrac{${tex(km)} \\times 10^5}{${tex(v)}}$ ans $= ${age}$ Ma.`, "Ma", 0.01);
  },
  ...pairs(
    // L'asthénosphère est elle-même du manteau (péridotite solide) : libellés exclusifs pour éviter un leurre juste.
    [["la croûte", "l'enveloppe la plus superficielle (océanique ou continentale)"], ["le manteau", "la couche de péridotite comprise entre la croûte et le noyau"], ["le noyau externe", "la couche de fer liquide"], ["le noyau interne (graine)", "la partie centrale en fer solide"], ["l'asthénosphère", "la partie ductile du manteau supérieur, sous les plaques lithosphériques"]],
    { ask: (a) => `Qu'est-ce ${que(a)} ?`, reverse: (b) => `Quelle enveloppe : ${b} ?`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  claims([
    ["La lithosphère océanique vieillit et s'épaissit en s'éloignant de la dorsale.", true, "Elle se refroidit et devient plus dense."],
    ["Les plaques se déplacent de plusieurs mètres par an.", false, "Quelques centimètres par an (vitesse de pousse des ongles)."],
    ["Le magnétisme fossile des roches océaniques forme des bandes symétriques de part et d'autre de la dorsale.", true, "Argument de l'expansion océanique."],
    ["La croûte océanique est surtout faite de granite.", false, "Elle est faite de basalte et de gabbro ; le granite est continental."],
    ["Les séismes de subduction peuvent être très profonds (jusqu'à 700 km).", true, "Plan de Wadati-Benioff."],
  ]),
];

// ───────────── Première : écosystèmes ─────────────

const ecosystemes: Generator[] = [
  ...pairs(
    [
      ["le mutualisme", "les deux espèces tirent un bénéfice, sans dépendre obligatoirement l'une de l'autre"], ["le parasitisme", "une espèce vit aux dépens d'une autre"], ["la compétition", "deux espèces exploitent la même ressource"],
      ["la prédation", "une espèce en tue une autre pour s'en nourrir"], ["le commensalisme", "une espèce profite d'une autre sans lui nuire"], ["la symbiose", "une association durable et obligatoire à bénéfice réciproque"],
    ],
    { ask: (a) => `Définition de ${a} ?`, reverse: (b) => `Quelle relation : ${b} ?`, claim: (a, b) => `Dans ${a}, ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...pairs(
    [["l'abeille et la fleur", "mutualisme"], ["l'algue et le champignon d'un lichen", "symbiose"], ["la tique et le chien", "parasitisme"], ["le renard et le lapin", "prédation"], ["deux arbres voisins pour la lumière", "compétition"], ["le poisson-pilote et le requin", "commensalisme"]],
    { ask: (a) => `Relation entre ${a} ?`, reverse: (b) => `Quel exemple illustre une relation de type « ${b} » ?`, claim: (a, b) => `Entre ${a}, la relation est de type « ${b} ».`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  (r) => {
    const e0 = pick(r, [1000, 5000, 10000, 20000, 100000]), n = int(r, 1, 3);
    return numeric(`Les producteurs fixent $${tex(e0)}$ kJ. Avec un rendement de 10 % par niveau, énergie disponible au niveau trophique $${n + 1}$ (kJ) ?`, e0 / 10 ** n, `On divise par 10 à chaque niveau : $${tex(e0)} \\times 0{,}1^{${n}}$.`, "kJ", 0.01);
  },
  ...pairs(
    [["la pollinisation des cultures", "service de régulation"], ["la production de bois", "service d'approvisionnement"], ["l'épuration de l'eau par les zones humides", "service de régulation"], ["les loisirs en forêt", "service culturel"], ["la pêche", "service d'approvisionnement"], ["la fixation du carbone par les forêts", "service de régulation"]],
    { ask: (a) => `Quel type de service écosystémique : ${a} ?`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ).slice(0, 1),
  (r) => {
    // Échantillonnage par quadrats : on estime une densité moyenne, puis l'effectif total.
    const counts = Array.from({ length: 5 }, () => int(r, 2, 14));
    const sum = counts.reduce((a, b) => a + b, 0), side = pick(r, [0.5, 1]), area = pick(r, [200, 500, 1000, 2500]);
    const density = sum / 5 / (side * side);
    return numeric(`Cinq quadrats de $${tex(side)}$ m × $${tex(side)}$ m contiennent respectivement $${counts.join("$, $")}$ pieds d'une espèce. Estimation de l'effectif sur une prairie de $${area}$ m² ?`, density * area,
      `Moyenne : $\\dfrac{${sum}}{5} = ${tex(sum / 5)}$ pieds par quadrat de $${tex(side * side)}$ m², soit $${tex(density)}$ pieds/m² ; $${tex(density)} \\times ${area} = ${tex(density * area)}$.`, undefined, 0.5);
  },
  claims([
    ["Un écosystème comprend une biocénose et un biotope.", true, "Les êtres vivants et leur milieu."],
    ["La biodiversité d'un écosystème est figée dans le temps.", false, "Les écosystèmes évoluent sans cesse."],
    ["Les décomposeurs recyclent la matière organique en matière minérale.", true, "Bouclage des cycles de la matière."],
    ["La fragmentation des habitats menace la biodiversité.", true, "Elle isole les populations."],
  ]),
];

// ───────────── Première : immunité ─────────────

const immunite: Generator[] = [
  ...pairs(
    [
      ["le macrophage", "phagocyte les éléments étrangers"], ["le lymphocyte B (plasmocyte)", "produit les anticorps"], ["le lymphocyte T CD8 (cytotoxique)", "détruit les cellules infectées"],
      ["le lymphocyte T CD4 (auxiliaire)", "coordonne la réponse adaptative"], ["le mastocyte", "libère des médiateurs de l'inflammation"], ["la cellule dendritique", "présente l'antigène aux lymphocytes"],
      ["le lymphocyte mémoire", "permet une réponse plus rapide lors d'un second contact"],
    ],
    { ask: (a) => `Rôle de ${a} ?`, reverse: (b) => `Quelle cellule ${b} ?`, claim: (a, b) => `${cap(a)} ${b}.`, explain: (a, b) => `${cap(a)} ${b}.` },
  ),
  ...pairs(
    // Rougeur et chaleur ont la même origine : les séparer rendait l'une juste comme leurre de l'autre.
    [["la rougeur et la chaleur", "la vasodilatation, qui augmente l'afflux de sang"], ["le gonflement (œdème)", "la sortie de plasma des vaisseaux vers les tissus"], ["la douleur", "la stimulation des terminaisons nerveuses par des médiateurs chimiques"]],
    { ask: (a) => `Réaction inflammatoire : origine de ${a.replace(" et ", " et de ")} ?`, claim: (a, b) => `Dans l'inflammation, ${a} s'explique${a.includes(" et ") ? "nt" : ""} par ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  claims([
    ["L'immunité innée est présente dès la naissance et agit rapidement.", true, "Elle ne nécessite pas d'apprentissage."],
    ["L'immunité adaptative est spécifique d'un antigène.", true, "Elle reconnaît précisément l'élément étranger."],
    ["Un vaccin contient des anticorps prêts à l'emploi.", false, "Il contient des antigènes inoffensifs qui déclenchent la production de cellules mémoire."],
    ["Le VIH infecte les lymphocytes T CD4.", true, "D'où l'effondrement de l'immunité adaptative (SIDA)."],
    ["Les antibiotiques sont efficaces contre les virus.", false, "Ils agissent sur les bactéries seulement."],
    ["Un anticorps se fixe spécifiquement sur un antigène.", true, "Formation d'un complexe immun."],
    ["La réponse secondaire est plus lente que la réponse primaire.", false, "Elle est plus rapide et plus intense grâce à la mémoire."],
  ]),
  (r) => {
    // Sélection puis amplification clonale : un lymphocyte activé se divise par mitoses successives.
    const h = pick(r, [8, 12, 24]), days = pick(r, [2, 3, 4, 5]);
    const n = (days * 24) / h, mem = int(r, 8, 13);
    return pick(r, [
      () => numeric(`Un lymphocyte B sélectionné par un antigène se divise toutes les $${h}$ h pendant $${days}$ jours. Combien de cellules compte alors le clone ?`, 2 ** n, `$${days * 24}$ h / $${h}$ h $= ${n}$ mitoses : $2^{${n}} = ${tex(2 ** n)}$ cellules, qui se différencient en plasmocytes et cellules mémoire.`),
      () => numeric(`Lors d'un second contact, le clone mémoire compte déjà $${tex(2 ** mem)}$ lymphocytes spécifiques, contre $1$ seul lors du premier contact. Lors du premier contact, combien d'heures faut-il à ce lymphocyte unique, qui se divise toutes les $${h}$ h, pour atteindre cet effectif ?`, mem * h, `$2^{${mem}} = ${tex(2 ** mem)}$ : il faut $${mem}$ divisions, soit $${mem} \\times ${h} = ${mem * h}$ h gagnées lors de la réponse secondaire, qui part d'un effectif déjà amplifié.`, "h", undefined, 2),
    ])();
  },
];

// ───────────── Terminale : génétique et évolution ─────────────

const brassage: Generator[] = [
  (r) => {
    const n = int(r, 2, 23);
    return numeric(`Espèce à $2n = ${2 * n}$ chromosomes. Nombre de gamètes différents possibles par le seul brassage interchromosomique ?`, 2 ** n, `$2^n$ avec $n = ${n}$ paires : $2^{${n}} = ${tex(2 ** n)}$.`);
  },
  (r) => {
    const n = int(r, 2, 40) * 100;
    const linked = r() < 0.5;
    const rec = linked ? pick(r, [0.1, 0.2, 0.3]) : 0.5;
    const each = (n * rec) / 2;
    return numeric(`Test-cross portant sur deux gènes : $${n}$ descendants${linked ? `, dont ${tex(rec * 100)} % de phénotypes recombinés` : ", gènes indépendants"}. Nombre attendu pour UN des deux phénotypes recombinés ?`, each, linked ? `Gènes liés : $${n} \\times ${tex(rec)} / 2$.` : `Gènes indépendants : 4 phénotypes à 25 % chacun.`);
  },
  ...pairs(
    [["la méiose", "deux divisions successives donnant 4 cellules haploïdes"], ["la mitose", "une division donnant 2 cellules diploïdes identiques"], ["la fécondation", "la fusion de deux gamètes qui rétablit la diploïdie"], ["le crossing-over", "un échange de portions entre chromatides homologues"]],
    { ask: (a) => `${cap(a)}, c'est…`, reverse: (b) => `Comment s'appelle ${b} ?`, claim: (a, b) => `${cap(a)} correspond à ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...pairs(
    [["la sélection naturelle", "une meilleure reproduction des individus les mieux adaptés au milieu"], ["la dérive génétique", "une variation aléatoire des fréquences alléliques, d'autant plus forte que la population est petite"], ["la mutation", "l'apparition de nouveaux allèles"], ["la migration", "l'apport d'allèles venus d'autres populations"]],
    { ask: (a) => `En biologie de l'évolution, ${a} se traduit par…`, reverse: (b) => `Quel mécanisme de l'évolution se traduit par ${b} ?`, claim: (a, b) => `${cap(a)} se traduit par ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  claims([
    ["La dérive génétique a plus d'effet dans les petites populations.", true, "Le hasard pèse davantage."],
    ["Le brassage interchromosomique a lieu en anaphase I de méiose.", true, "Répartition aléatoire des homologues."],
    ["La méiose produit des cellules génétiquement identiques.", false, "Les brassages créent des gamètes tous différents."],
    ["Une espèce peut se définir comme un ensemble d'individus interféconds.", true, "Définition biologique de l'espèce."],
  ]),
];

// ───────────── Terminale : histoire de la Terre ─────────────

const datation: Generator[] = [
  (r) => {
    const n = int(r, 1, 6);
    return r() < 0.5
      ? numeric(`Un fossile contient $${tex(100 / 2 ** n, 4)}\\,\\%$ du carbone 14 initial ($t_{1/2} = 5\\,730$ ans). Âge (ans) ?`, n * 5730, `${n} demi-vie${n > 1 ? "s" : ""} : $${n} \\times 5\\,730$.`, "ans", 1)
      : numeric(`Après $${tex(n * 5730)}$ ans, quel pourcentage de carbone 14 reste-t-il ($t_{1/2} = 5\\,730$ ans) ?`, 100 / 2 ** n, `$\\dfrac{100}{2^{${n}}}$ %.`, "%", 0.01);
  },
  ...pairs(
    [
      ["le principe de superposition", "une couche est plus récente que celle qu'elle recouvre"], ["le principe de recoupement", "une structure qui en recoupe une autre est plus récente"],
      ["le principe d'inclusion", "un élément inclus est plus ancien que la roche qui le contient"], ["le principe de continuité", "une même couche a le même âge sur toute son étendue"],
      ["le principe d'identité paléontologique", "deux couches contenant les mêmes fossiles stratigraphiques ont le même âge"],
    ],
    { ask: (a) => `Que dit ${a} ?`, reverse: (b) => `Quel principe : ${b} ?`, claim: (a, b) => `Selon ${a}, ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...pairs(
    [["le carbone 14", "des restes organiques de moins de 50 000 ans"], ["le couple potassium-argon", "des roches volcaniques (l'argon formé s'échappe de la lave à l'éruption)"], ["le couple rubidium-strontium", "des roches magmatiques anciennes, par la méthode de l'isochrone"], ["le couple uranium-plomb", "les plus vieux minéraux de la Terre (zircons de plus de 4 Ga)"]],
    { ask: (a) => `${cap(a)} sert à dater…`, reverse: (b) => `Quel chronomètre pour dater ${b} ?`, claim: (a, b) => `${cap(a)} sert à dater ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  (r) => {
    // Chronologie relative : superposition + recoupement (une faille ou un filon recoupe certaines couches seulement).
    const order = shuffle(["A", "B", "C", "D", "E", "F"], r).slice(0, 5); // de bas en haut
    const k = int(r, 1, 3); // la structure recoupe order[0..k] et est recouverte par order[k + 1]
    const what = pick(r, ["une faille", "un filon de basalte"]);
    const answer = `après ${order[k]} et avant ${order[k + 1]}`;
    const wrongs = [`avant ${order[0]}`, `après ${order[k + 1]}`, `après ${order[k - 1]} et avant ${order[k]}`, `après ${order[4]}`];
    return mcq(r, `Couches sédimentaires de bas en haut : ${order.join(", ")}. ${cap(what)} recoupe les couches ${order.slice(0, k + 1).join(", ")} mais est recouvert${what === "une faille" ? "e" : ""} par la couche ${order[k + 1]}. Quand s'est-${what === "une faille" ? "elle" : "il"} formé${what === "une faille" ? "e" : ""} ?`, answer, wrongs,
      `Principe de recoupement : ${what} est plus récent${what === "une faille" ? "e" : ""} que les couches qu'${what === "une faille" ? "elle" : "il"} recoupe (jusqu'à ${order[k]}) ; superposition : plus ancien${what === "une faille" ? "ne" : ""} que ${order[k + 1]} qui ${what === "une faille" ? "la" : "le"} recouvre.`);
  },
  (r) => {
    // Nombre de demi-vies limité pour rester sous l'âge de la Terre (4,6 Ga).
    const [iso, t12, max] = pick(r, [["du potassium 40", 1.25, 3], ["de l'uranium 235", 0.704, 6], ["de l'uranium 238", 4.47, 1]] as const);
    const n = int(r, 1, max);
    return numeric(`Il reste $${tex(100 / 2 ** n, 4)}\\,\\%$ ${iso} initial ($t_{1/2} = ${tex(t12)}$ Ga). Âge du minéral (Ga) ?`, n * t12, `$${tex(100 / 2 ** n, 4)}\\,\\% = \\dfrac{100\\,\\%}{2^{${n}}}$ : ${n} demi-vie${n > 1 ? "s" : ""}, soit $${n} \\times ${tex(t12)} = ${tex(n * t12)}$ Ga.`, "Ga", 0.01);
  },
  (r) => {
    // Cas général : t = (t½ / ln 2) × ln(N0 / N), quand le pourcentage restant n'est pas une puissance de 1/2.
    const [iso, t12, unit] = pick(r, [["du carbone 14", 5730, "ans"], ["de l'uranium 238", 4.47, "Ga"], ["du potassium 40", 1.25, "Ga"], ["du rubidium 87", 48.8, "Ga"]] as const);
    const pct = iso.includes("rubidium") ? pick(r, [95, 96, 97, 98]) : iso.includes("uranium") ? pick(r, [55, 60, 70, 80, 90]) : pick(r, [10, 20, 30, 40, 60, 70, 80, 90]);
    const t = (t12 / Math.LN2) * Math.log(100 / pct);
    const digits = unit === "ans" ? 0 : 2;
    const ans = Math.round(t * 10 ** digits) / 10 ** digits;
    return numeric(`Un échantillon contient encore $${pct}\\,\\%$ ${iso} initial ($t_{1/2} = ${tex(t12)}$ ${unit}). Âge (${unit}, ${unit === "ans" ? "à la centaine près" : "au centième"}) ? ($N = N_0\\,e^{-\\lambda t}$, $\\lambda = \\frac{\\ln 2}{t_{1/2}}$)`, ans,
      `$t = \\dfrac{t_{1/2}}{\\ln 2}\\,\\ln\\dfrac{N_0}{N} = \\dfrac{${tex(t12)}}{\\ln 2} \\times \\ln\\dfrac{100}{${pct}} \\approx ${tex(ans, digits)}$ ${unit}.`, unit, unit === "ans" ? 60 : 0.02, 3);
  },
  claims([
    ["Un bon fossile stratigraphique a vécu peu de temps et sur une large zone.", true, "Il permet des corrélations précises."],
    ["La datation relative donne un âge en années.", false, "Elle ordonne les événements ; la datation absolue donne un âge chiffré."],
    ["La Terre est âgée d'environ 4,6 milliards d'années.", true, "Datation des météorites."],
    ["La crise Crétacé-Paléogène date d'environ 66 millions d'années.", true, "Disparition des dinosaures non aviens."],
  ]),
];

// ───────────── Terminale : climats ─────────────

const climat: Generator[] = [
  ...pairs(
    [["le dioxyde de carbone", "$\\mathrm{CO_2}$"], ["le méthane", "$\\mathrm{CH_4}$"], ["la vapeur d'eau", "$\\mathrm{H_2O}$"], ["le protoxyde d'azote", "$\\mathrm{N_2O}$"], ["l'ozone", "$\\mathrm{O_3}$"]],
    { ask: (a) => `Formule de ${a} (gaz à effet de serre) ?`, reverse: (b) => `Quel gaz à effet de serre a pour formule ${b} ?`, claim: (a, b) => `La formule ${a.startsWith("l'") ? "de " + a : "du " + a.replace(/^le /, "").replace(/^la /, "")} est ${b}.`.replace("du vapeur", "de la vapeur").replace("du ozone", "de l'ozone"), explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...pairs(
    [["le rapport isotopique δ¹⁸O des glaces", "la température passée"], ["l'air piégé dans les bulles de glace", "la composition de l'atmosphère passée"], ["le pollen fossile", "la végétation, donc le climat passé"], ["la position des moraines glaciaires", "l'ancienne extension des glaciers"]],
    { ask: (a) => `${cap(a)} renseigne sur…`, reverse: (b) => `Quel indice renseigne sur ${b} ?`, claim: (a, b) => `${cap(a)} renseigne sur ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  (r) => {
    const now = int(r, 380, 430), pre = 280;
    return numeric(`La concentration en $\\mathrm{CO_2}$ est passée de $${pre}$ ppm (ère préindustrielle) à $${now}$ ppm. Augmentation en % (arrondie à l'unité) ?`, Math.round(((now - pre) / pre) * 100), `$\\dfrac{${now} - ${pre}}{${pre}} \\times 100 \\approx ${Math.round(((now - pre) / pre) * 100)}\\,\\%$.`, "%", 0.6);
  },
  claims([
    ["Sans effet de serre naturel, la température moyenne de la Terre serait d'environ −18 °C.", true, "Contre environ +15 °C aujourd'hui."],
    ["Les océans absorbent une partie du $\\mathrm{CO_2}$ émis par les activités humaines.", true, "Ce qui les acidifie."],
    ["Le réchauffement actuel est principalement dû à des causes naturelles.", false, "Il est principalement dû aux émissions humaines de gaz à effet de serre (GIEC)."],
    ["La fonte des glaces de mer augmente l'albédo de la Terre.", false, "Elle le diminue : l'océan sombre absorbe plus d'énergie."],
    ["Les variations orbitales de la Terre expliquent l'alternance glaciaire-interglaciaire du Quaternaire.", true, "Cycles de Milankovitch."],
  ]),
];

// ───────────── Terminale : système nerveux ─────────────

const nerveux: Generator[] = [
  ...pairs(
    [
      // Libellés homogènes (groupes nominaux) : l'ancien claim « La moelle épinière : conduit le message vers la moelle épinière. » était bancal.
      ["le fuseau neuromusculaire", "le récepteur sensible à l'étirement du muscle"], ["le neurone sensoriel", "le neurone qui conduit le message du fuseau neuromusculaire à la moelle épinière"],
      ["le motoneurone", "le neurone qui conduit le message de la moelle épinière au muscle"], ["la synapse", "la zone de communication entre un neurone et une autre cellule"],
      ["l'acétylcholine", "le neurotransmetteur libéré à la jonction neuromusculaire"], ["la moelle épinière", "le centre nerveux du réflexe myotatique"],
      ["le cortex moteur", "l'aire cérébrale qui commande les mouvements volontaires"],
    ],
    { ask: (a) => `Qu'est-ce ${que(a)} ?`, reverse: (b) => `Quel élément est ${b} ?`, claim: (a, b) => `${cap(a)} est ${b}.`, explain: (a, b) => `${cap(a)} est ${b}.` },
  ),
  (r) => {
    // Vitesses de conduction réalistes : environ 1 à 120 m/s selon le diamètre et la myélinisation des fibres.
    const v = pick(r, [2, 5, 10, 25, 40, 50, 60, 80, 100, 120]), d = pick(r, [0.4, 0.5, 0.8, 1, 1.2]);
    const dt = (d / v) * 1000;
    return r() < 0.5
      ? numeric(`Un message nerveux parcourt $${tex(d)}$ m en $${tex(dt)}$ ms. Vitesse de conduction (m/s) ?`, v, `$v = \\dfrac{${tex(d)}}{${tex(dt / 1000, 5)}} = ${v}$ m/s (durée convertie en secondes).`, "m/s", 0.5)
      : numeric(`Deux électrodes distantes de $${tex(d * 10)}$ cm enregistrent le même potentiel d'action à $${tex(dt / 10)}$ ms d'intervalle. Vitesse de conduction (m/s) ?`, v, `$v = \\dfrac{${tex(d / 10)} \\text{ m}}{${tex(dt / 10000, 6)} \\text{ s}} = ${v}$ m/s.`, "m/s", 0.5);
  },
  claims([
    ["Le message nerveux est codé en fréquence de potentiels d'action.", true, "Plus le stimulus est intense, plus la fréquence est élevée."],
    ["Au niveau d'une synapse, le message devient chimique.", true, "Libération de neurotransmetteurs."],
    ["Le réflexe myotatique fait intervenir le cerveau.", false, "C'est un réflexe médullaire (moelle épinière)."],
    ["La plasticité cérébrale permet au cerveau de se remodeler toute la vie.", true, "Apprentissages, récupération après lésion."],
    ["Le potentiel d'action a une amplitude qui dépend de l'intensité du stimulus.", false, "Son amplitude est constante (loi du tout ou rien)."],
  ]),
];

// ───────────── Terminale : plantes ─────────────

const plantes: Generator[] = [
  ...pairs(
    [
      ["les racines", "absorber l'eau et les ions minéraux"], ["les feuilles", "réaliser l'essentiel de la photosynthèse"], ["les stomates", "permettre les échanges gazeux"],
      ["le xylème", "transporter la sève brute"], ["le phloème", "transporter la sève élaborée"], ["la fleur", "assurer la reproduction sexuée"], ["le fruit", "protéger et disperser les graines"],
      ["les mycorhizes", "augmenter la surface d'absorption des racines"],
    ],
    { ask: (a) => `Rôle de ${a} ?`, reverse: (b) => `Quelle structure a pour rôle de ${b} ?`, claim: (a, b) => `Le rôle de ${a} est de ${b}.`, explain: (a, b) => `Le rôle de ${a} est de ${b}.` },
  ),
  ...pairs(
    [["le maïs", "la téosinte"], ["le blé tendre", "des graminées sauvages du Croissant fertile"], ["le chou", "le chou sauvage (Brassica oleracea)"], ["la tomate", "une tomate sauvage d'Amérique du Sud"]],
    { ask: (a) => `Ancêtre sauvage de ${a} ?`, reverse: (b) => `Quelle plante cultivée descend de ${b} ?`, claim: (a, b) => `${cap(a)} descend de ${b}.`, explain: (a, b) => `${cap(a)} : plante domestiquée à partir de ${b}.` },
  ),
  (r) => {
    const l = pick(r, [2, 5, 10, 20]), n = pick(r, [50, 100, 150, 200, 300]);
    return numeric(`Une feuille de $${l}$ cm² porte en moyenne $${n}$ stomates par mm². Nombre total de stomates ?`, l * 100 * n, `$${l}$ cm² $= ${l * 100}$ mm², donc $${l * 100} \\times ${n}$.`);
  },
  claims([
    ["Une plante est un organisme fixé qui a de grandes surfaces d'échange avec son milieu.", true, "Racines et feuilles très développées."],
    ["La pollinisation peut être assurée par le vent ou par des animaux.", true, "Anémogamie ou zoogamie."],
    ["Les plantes produisent des molécules de défense contre les prédateurs.", true, "Exemple : tanins, alcaloïdes."],
    ["La sève élaborée circule uniquement des racines vers les feuilles.", false, "Elle va des organes producteurs (feuilles) vers les organes consommateurs."],
  ]),
];

export const SVT: Record<string, Generator[]> = {
  "svt-2-cellule": cellule,
  "svt-2-adn": adn,
  "svt-2-metabolisme": metabolisme,
  "svt-2-sols": sols,
  "svt-2-procreation": procreation,
  "svt-1-replication": replication,
  "svt-1-expression": expression,
  "svt-1-tectonique": tectonique,
  "svt-1-ecosystemes": ecosystemes,
  "svt-1-immunite": immunite,
  "svt-t-brassage": brassage,
  "svt-t-datation": datation,
  "svt-t-climat": climat,
  "svt-t-nerveux": nerveux,
  "svt-t-plantes": plantes,
};
