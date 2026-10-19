/** Générateurs de questions — Français et Philosophie. */
import { type Generator, type Pair, type PairOptions, claims, int, mcq, numeric, pairs, pick, tf, withFact } from "./kit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const terms = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Que désigne « ${a} » ?`, reverse: (b) => `Quel terme désigne : ${b} ?`, claim: (a, b) => `« ${cap(a)} » désigne ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` });

const works = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Qui a écrit *${a}* ?`, reverse: (b) => `Quelle œuvre a été écrite par ${b} ?`, claim: (a, b) => `*${a}* a été écrit par ${b}.`, explain: (a, b) => `*${a}* : ${b}.` });

// ───────────── Figures de style ─────────────

const FIGURE_EXAMPLES: Pair[] = [
  ["« Cette faucille d'or dans le champ des étoiles » (Hugo)", "métaphore"], ["« L'homme n'est qu'un roseau, le plus faible de la nature » (Pascal)", "métaphore"], ["« La Terre est bleue comme une orange » (Éluard)", "comparaison"],
  ["« Il est fort comme un bœuf »", "comparaison"], ["« Je meurs de soif »", "hyperbole"], ["« Je te l'ai dit mille fois »", "hyperbole"], ["« Il n'est pas bête » (pour dire qu'il est intelligent)", "litote"],
  ["« Va, je ne te hais point » (Corneille)", "litote"], ["« Il nous a quittés » (pour dire qu'il est mort)", "euphémisme"], ["« Heureux ceux qui sont morts pour la terre charnelle […] Heureux ceux qui sont morts dans une juste guerre » (Péguy)", "anaphore"],
  ["« Cette obscure clarté qui tombe des étoiles » (Corneille)", "oxymore"], ["« Un silence assourdissant »", "oxymore"], ["« Boire un verre »", "métonymie"], ["« Une voile à l'horizon » (pour un bateau)", "synecdoque"],
  ["« Le vent hurle dans la nuit »", "personnification"], ["« Pour qui sont ces serpents qui sifflent sur vos têtes ? » (Racine)", "allitération"], ["« Tout m'afflige et me nuit et conspire à me nuire » (Racine)", "assonance"],
  ["« Un souffle, une ombre, un rien, tout lui donnait la fièvre » (La Fontaine)", "gradation"], ["« Va, cours, vole, et nous venge » (Corneille)", "gradation"], ["« Bravo, quelle réussite ! » (après un échec)", "antiphrase"],
  ["« Ô temps ! suspends ton vol » (Lamartine)", "apostrophe"], ["« Il faut manger pour vivre et non pas vivre pour manger » (Molière)", "chiasme"], ["« Je vis, je meurs ; je me brûle et me noie » (Louise Labé)", "antithèse"],
];

/**
 * Figures qu'on ne propose jamais l'une contre l'autre : la personnification est une
 * métaphore, la synecdoque une forme de métonymie, l'oxymore une antithèse resserrée,
 * et l'apostrophe à une chose la personnifie (« Ô temps ! suspends ton vol »).
 */
export const NEAR_FIGURES = [["personnification", "métaphore"], ["synecdoque", "métonymie"], ["oxymore", "antithèse"], ["apostrophe", "personnification"]];
const nearFigure = (a: string, b: string) => NEAR_FIGURES.some((g) => g.some((f) => a.includes(f)) && g.some((f) => b.includes(f)));

const figures: Generator[] = [
  (r) => {
    const [ex, fig] = pick(r, FIGURE_EXAMPLES);
    return mcq(r, `Quelle figure de style : ${ex} ?`, fig, [...new Set(FIGURE_EXAMPLES.map(([, f]) => f))].filter((f) => f !== fig && !nearFigure(f, fig)), `Figure de style : ${fig}.`);
  },
  ...terms([
    ["métaphore", "un rapprochement entre deux éléments sans outil de comparaison"], ["comparaison", "un rapprochement avec un outil (comme, tel, pareil à…)"], ["hyperbole", "une exagération"],
    ["litote", "dire moins pour suggérer plus"], ["euphémisme", "l'atténuation d'une réalité pénible"], ["anaphore", "la répétition d'un mot en début de vers ou de phrase"],
    ["oxymore", "l'alliance, dans un même groupe de mots, de deux termes de sens contraires"], ["personnification", "l'attribution de caractéristiques humaines à une chose ou un animal"], ["allitération", "la répétition d'un même son consonne"],
    ["assonance", "la répétition d'un même son voyelle"], ["gradation", "une suite de termes d'intensité croissante ou décroissante"], ["antiphrase", "dire le contraire de ce que l'on pense, par ironie"],
    ["chiasme", "la construction en miroir ABBA"], ["antithèse", "la mise en parallèle de deux idées ou réalités opposées, dans deux segments distincts"], ["métonymie", "désigner une chose par un élément qui lui est lié"],
  ]),
];

// ───────────── Poésie ─────────────

const poesie: Generator[] = [
  ...pairs(
    [["un alexandrin", "12"], ["un décasyllabe", "10"], ["un octosyllabe", "8"], ["un hexasyllabe", "6"], ["un heptasyllabe", "7"], ["un ennéasyllabe", "9"], ["un hendécasyllabe", "11"]],
    { ask: (a) => `Combien de syllabes compte ${a} ?`, reverse: (b) => `Comment appelle-t-on un vers de ${b} syllabes ?`, claim: (a, b) => `${cap(a)} compte ${b} syllabes.`, explain: (a, b) => `${cap(a)} : ${b} syllabes.` },
  ),
  ...pairs(
    [["un distique", "2"], ["un tercet", "3"], ["un quatrain", "4"], ["un quintil", "5"], ["un sizain", "6"]],
    { ask: (a) => `Combien de vers compte ${a} ?`, reverse: (b) => `Comment appelle-t-on une strophe de ${b} vers ?`, claim: (a, b) => `${cap(a)} compte ${b} vers.`, explain: (a, b) => `${cap(a)} : strophe de ${b} vers.` },
  ),
  ...pairs(
    [["rimes suivies (plates)", "AABB"], ["rimes croisées", "ABAB"], ["rimes embrassées", "ABBA"], ["tierces rimes (terza rima)", "ABA BCB CDC…"]],
    { ask: (a) => `Schéma des ${a} ?`, reverse: (b) => `Le schéma ${b} correspond à des…`, claim: (a, b) => `Les ${a} suivent le schéma ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...terms([
    ["sonnet", "un poème de 14 vers : deux quatrains et deux tercets"], ["enjambement", "le débordement de la phrase sur le vers suivant"], ["rejet", "un élément bref rejeté au début du vers suivant"],
    ["césure", "la pause à l'intérieur d'un vers"], ["hémistiche", "chacune des deux moitiés d'un alexandrin"], ["diérèse", "la prononciation en deux syllabes de deux voyelles voisines"],
    ["rime riche", "une rime de trois sons communs ou plus"], ["vers libre", "un vers sans mètre ni rime réguliers"], ["poème en prose", "un texte poétique sans vers"], ["e muet", "le « e » final compté devant consonne, élidé devant voyelle"],
  ]),
  ...works([["Les Fleurs du mal", "Baudelaire"], ["Les Contemplations", "Victor Hugo"], ["Alcools", "Apollinaire"], ["Cahier de Douai", "Rimbaud"], ["Poèmes saturniens", "Verlaine"], ["Méditations poétiques", "Lamartine"], ["Les Regrets", "Du Bellay"], ["Le Parti pris des choses", "Francis Ponge"]]),
];

// ───────────── Théâtre ─────────────

const theatre: Generator[] = [
  ...terms([
    ["didascalie", "une indication scénique destinée au metteur en scène et aux acteurs"], ["aparté", "une réplique dite à part, que les autres personnages n'entendent pas"], ["monologue", "un personnage seul en scène qui parle"],
    ["tirade", "une longue réplique ininterrompue"], ["stichomythie", "un échange rapide de répliques très courtes"], ["double énonciation", "le fait que les répliques s'adressent aux personnages et au public"],
    ["quiproquo", "un malentendu où un personnage est pris pour un autre"], ["coup de théâtre", "un événement inattendu qui change le cours de l'action"], ["scène d'exposition", "la scène qui présente les personnages et la situation"],
    ["dénouement", "la résolution finale de l'intrigue"], ["catharsis", "la purgation des passions du spectateur par la tragédie"], ["règle des trois unités", "une seule action, en un seul lieu, en une seule journée"],
  ]),
  ...works([["Le Cid", "Corneille"], ["Phèdre", "Racine"], ["Le Malade imaginaire", "Molière"], ["Tartuffe", "Molière"], ["Hernani", "Victor Hugo"], ["Lorenzaccio", "Musset"], ["Rhinocéros", "Ionesco"], ["En attendant Godot", "Beckett"], ["Juste la fin du monde", "Lagarce"], ["Le Jeu de l'amour et du hasard", "Marivaux"], ["Antigone (1944)", "Anouilh"]]),
  ...pairs(
    [["la tragédie", "des héros de haut rang écrasés par la fatalité, dans un style uniformément noble"], ["la comédie", "des personnages ordinaires et une fin heureuse, pour faire rire et corriger les mœurs"], ["le drame romantique", "le mélange du sublime et du grotesque, en rupture avec les règles classiques"], ["le théâtre de l'absurde", "des situations qui révèlent le non-sens de l'existence"]],
    { ask: (a) => `Ce qui caractérise ${a} ?`, reverse: (b) => `Quel genre théâtral met en scène ${b} ?`, claim: (a, b) => `${cap(a)} met en scène ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
];

// ───────────── Roman ─────────────

const roman: Generator[] = [
  ...terms([
    ["focalisation interne", "un récit à travers le regard d'un personnage"], ["focalisation externe", "un récit d'un point de vue extérieur, comme une caméra"], ["focalisation zéro", "un narrateur omniscient qui sait tout"],
    ["analepse", "un retour en arrière dans le récit"], ["prolepse", "une anticipation d'événements futurs"], ["ellipse", "un passage sous silence d'une période"], ["sommaire", "le résumé rapide d'une longue période"],
    ["pause", "l'arrêt de l'action pour une description ou un commentaire"], ["incipit", "le début d'un roman"], ["excipit", "la fin d'un roman"], ["discours indirect libre", "les paroles rapportées sans guillemets ni verbe introducteur"],
    ["élément perturbateur", "l'événement qui rompt la situation initiale"],
  ]),
  ...works([["Madame Bovary", "Flaubert"], ["Le Rouge et le Noir", "Stendhal"], ["Germinal", "Zola"], ["Le Père Goriot", "Balzac"], ["Bel-Ami", "Maupassant"], ["L'Étranger", "Camus"], ["La Princesse de Clèves", "Madame de La Fayette"], ["Les Misérables", "Victor Hugo"], ["Candide", "Voltaire"], ["Voyage au bout de la nuit", "Céline"], ["Mémoires d'Hadrien", "Marguerite Yourcenar"]]),
  (r) => {
    const steps = ["situation initiale", "élément perturbateur", "péripéties", "élément de résolution", "situation finale"];
    const i = int(r, 0, 3);
    return mcq(r, `Dans le schéma narratif, quelle étape suit « ${steps[i]} » ?`, steps[i + 1], steps.filter((_, j) => j !== i + 1 && j !== i), `Ordre : ${steps.join(" → ")}.`);
  },
];

// ───────────── Mouvements littéraires ─────────────

/**
 * Comme pairs(), mais sans jamais opposer deux lignes « voisines » : un mouvement et
 * le courant qui l'englobe (la Pléiade dans l'humanisme) ou qu'il prolonge (le
 * naturalisme après le réalisme). Sinon « Ronsard est un humaniste » serait compté faux.
 * Les groupes voisins peuvent porter sur l'une ou l'autre colonne (et sont cherchés
 * dans le texte : « une synecdoque » est voisine de « métonymie »).
 */
export function apart(items: readonly Pair[], close: readonly (readonly string[])[], o: Required<Pick<PairOptions, "ask" | "reverse" | "claim" | "explain">>): Generator[] {
  const inGroup = (g: readonly string[], s: string) => g.some((k) => s === k || s.includes(k));
  const near = (u: string, v: string) => close.some((g) => inGroup(g, u) && inGroup(g, v));
  const others = (a: string, b: string) => items.filter(([x, y]) => x !== a && y !== b && !near(a, x) && !near(b, y));
  const direct: Generator = (r) => {
    const [a, b] = pick(r, items);
    return withFact(mcq(r, o.ask(a), b, others(a, b).map(([, y]) => y), o.explain(a, b)), a, b);
  };
  return [
    Object.assign(direct, { memo: items.map(([a, b]) => ({ front: o.ask(a), back: b })) }),
    (r) => {
      const [a, b] = pick(r, items);
      return withFact(mcq(r, o.reverse(b), a, others(a, b).map(([x]) => x), o.explain(a, b)), a, b);
    },
    (r) => {
      const [a, b] = pick(r, items);
      if (r() < 0.5) return withFact(tf(o.claim(a, b), true, o.explain(a, b)), a, b);
      const [, wrong] = pick(r, others(a, b));
      return withFact(tf(o.claim(a, wrong), false, o.explain(a, b)), a, b);
    },
  ];
}

const NEAR_MOVEMENTS = [["l'humanisme", "la Pléiade"], ["le réalisme", "le naturalisme"]];

const MOVEMENTS: Array<[string, string, string]> = [
  ["l'humanisme", "XVIe siècle", "Rabelais"], ["la Pléiade", "XVIe siècle", "Ronsard"], ["le baroque", "fin XVIe – début XVIIe siècle", "Agrippa d'Aubigné"], ["le classicisme", "XVIIe siècle", "Racine"],
  ["les Lumières", "XVIIIe siècle", "Diderot"], ["le romantisme", "première moitié du XIXe siècle", "Victor Hugo"], ["le réalisme", "milieu du XIXe siècle", "Flaubert"], ["le naturalisme", "fin du XIXe siècle", "Zola"],
  ["le symbolisme", "fin du XIXe siècle", "Mallarmé"], ["le surréalisme", "années 1920-1930", "André Breton"], ["le Nouveau Roman", "années 1950-1960", "Alain Robbe-Grillet"],
];

const mouvements: Generator[] = [
  ...apart(MOVEMENTS.map(([m, , a]) => [m, a] as const), NEAR_MOVEMENTS, { ask: (a) => `Auteur représentatif de ${a} ?`, reverse: (b) => `À quel mouvement rattache-t-on ${b} ?`, claim: (a, b) => `${b} est un représentant de ${a}.`, explain: (a, b) => `${b} : ${a}.` }),
  (r) => {
    const [m, period] = pick(r, MOVEMENTS);
    return mcq(r, `Époque de ${m} ?`, period, [...new Set(MOVEMENTS.map(([, p]) => p))].filter((p) => p !== period), `${cap(m)} : ${period}.`);
  },
  ...apart(
    [["l'humanisme", "la confiance en l'homme et la redécouverte des textes antiques"], ["le classicisme", "l'ordre, la mesure et le respect des règles (bienséance, vraisemblance)"], ["le romantisme", "l'expression du moi, des sentiments et de la nature"], ["le réalisme", "la représentation fidèle de la réalité sociale"], ["le naturalisme", "l'étude quasi scientifique de l'hérédité et du milieu"], ["le surréalisme", "l'exploration de l'inconscient, du rêve et de l'écriture automatique"], ["les Lumières", "la raison critique contre les préjugés et l'absolutisme"]],
    NEAR_MOVEMENTS,
    { ask: (a) => `Ce qui caractérise ${a} ?`, reverse: (b) => `Quel mouvement privilégie ${b} ?`, claim: (a, b) => `${cap(a)} privilégie ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
];

// ───────────── Commentaire ─────────────

const commentaire: Generator[] = [
  ...pairs(
    [["lyrique", "l'expression des sentiments personnels"], ["pathétique", "la volonté d'émouvoir, de susciter la pitié"], ["tragique", "le sentiment d'un destin inéluctable"], ["comique", "la volonté de faire rire"], ["épique", "l'exaltation d'exploits héroïques"], ["satirique", "la critique moqueuse d'une société ou de personnes"], ["fantastique", "l'hésitation entre une explication rationnelle et surnaturelle"], ["polémique", "un discours de combat contre un adversaire"], ["didactique", "la volonté d'enseigner"], ["ironique", "le décalage entre ce qui est dit et ce qui est pensé"]],
    { ask: (a) => `Le registre ${a} se caractérise par…`, reverse: (b) => `Quel registre se caractérise par ${b} ?`, claim: (a, b) => `Le registre ${a} se caractérise par ${b}.`, explain: (a, b) => `Registre ${a} : ${b}.` },
  ),
  claims([
    ["Un commentaire écrit doit suivre l'ordre du texte, ligne par ligne.", false, "Il s'organise en axes de lecture ; c'est l'explication linéaire de l'oral qui suit le texte mouvement par mouvement."],
    ["Chaque analyse de procédé doit être reliée à un effet de sens.", true, "Repérer → analyser → interpréter."],
    ["L'introduction d'un commentaire annonce le projet de lecture et le plan.", true, "Après l'amorce et la présentation du texte."],
    ["Une citation doit être placée entre guillemets et commentée.", true, "Une citation seule ne prouve rien."],
    ["Le commentaire se rédige à la première personne du singulier (« je »).", false, "On privilégie un ton impersonnel ou le « nous »."],
  ]),
  ...terms([["problématique", "la question qui guide l'analyse du texte"], ["axe de lecture", "une grande partie thématique du commentaire"], ["champ lexical", "l'ensemble des mots qui se rapportent à un même thème"], ["procédé", "un moyen d'écriture repérable (figure, rythme, temps…)"], ["paraphrase", "le défaut qui consiste à répéter le texte sans l'analyser"], ["ouverture", "l'élargissement final de la conclusion"]]),
];

// ───────────── Dissertation ─────────────

const CONNECTORS: Pair[] = [
  ["cependant", "opposition"], ["en revanche", "opposition"], ["néanmoins", "opposition"], ["donc", "conséquence"], ["par conséquent", "conséquence"], ["c'est pourquoi", "conséquence"],
  ["car", "cause"], ["puisque", "cause"], ["en effet", "cause"], ["de plus", "addition"], ["en outre", "addition"], ["par exemple", "illustration"], ["bien que", "concession"], ["certes", "concession"], ["en définitive", "conclusion"], ["en somme", "conclusion"],
];

const dissertation: Generator[] = [
  (r) => {
    const [c, rel] = pick(r, CONNECTORS);
    return mcq(r, `Quelle relation logique exprime « ${c} » ?`, rel, [...new Set(CONNECTORS.map(([, x]) => x))].filter((x) => x !== rel), `« ${cap(c)} » exprime ${/^[aeiouyéh]/.test(rel) ? "l'" : "la "}${rel}.`);
  },
  (r) => {
    const [c, rel] = pick(r, CONNECTORS);
    const right = r() < 0.5;
    const shown = right ? rel : pick(r, [...new Set(CONNECTORS.map(([, x]) => x))].filter((x) => x !== rel));
    return tf(`« ${cap(c)} » est un connecteur ${/^[aeiouyéh]/.test(shown) ? "d'" : "de "}${shown}.`, right, `« ${cap(c)} » exprime : ${rel}.`);
  },
  ...pairs(
    [["le plan dialectique", "thèse, antithèse, synthèse"], ["le plan thématique", "plusieurs aspects successifs d'une même idée"], ["le plan analytique", "constat, causes, conséquences"], ["le plan concessif", "thèse admise en partie, puis nuancée ou réfutée"]],
    { ask: (a) => `Organisation de ${a} ?`, reverse: (b) => `Quel plan suit l'ordre : ${b} ?`, claim: (a, b) => `${cap(a)} suit l'ordre : ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...terms([["problématique", "la question qui révèle l'enjeu du sujet"], ["argument", "une idée qui soutient une thèse"], ["exemple", "un cas précis qui illustre un argument"], ["transition", "le passage qui relie deux parties"], ["thèse", "la position défendue"], ["concession", "le fait d'admettre une partie de l'argument adverse"], ["accroche", "la première phrase de l'introduction, qui capte l'attention"]]),
  claims([
    ["Une dissertation doit s'appuyer sur des exemples précis tirés des œuvres.", true, "Pas d'argument sans exemple."],
    ["On peut traiter un sujet voisin si on le connaît mieux.", false, "Le hors-sujet est la faute la plus grave."],
    ["La conclusion doit répondre à la problématique.", true, "Avant une éventuelle ouverture."],
  ]),
];

// ───────────── Grammaire ─────────────

const SUBORDINATES: Pair[] = [
  ["« Le livre que tu m'as prêté est passionnant. »", "relative"], ["« La ville où je suis né est au bord de la mer. »", "relative"], ["« Je pense qu'il viendra demain. »", "conjonctive complétive"],
  ["« Elle souhaite que tu réussisses. »", "conjonctive complétive"], ["« Je me demande s'il viendra. »", "interrogative indirecte"], ["« Dis-moi pourquoi tu pleures. »", "interrogative indirecte"],
  ["« Quand il pleut, je reste chez moi. »", "circonstancielle de temps"], ["« Il est absent parce qu'il est malade. »", "circonstancielle de cause"], ["« Je travaille pour que tu sois fier. »", "circonstancielle de but"],
  ["« Bien qu'il soit fatigué, il continue. »", "circonstancielle de concession"], ["« Si tu viens, nous irons au cinéma. »", "circonstancielle de condition"], ["« Il a tant couru qu'il est épuisé. »", "circonstancielle de conséquence"],
  // Pièges : le même mot introducteur pour des subordonnées de natures différentes.
  ["« L'idée qu'il a eue est excellente. »", "relative"], ["« L'idée qu'il parte me chagrine. »", "conjonctive complétive"], ["« Je sais qui a fait cela. »", "interrogative indirecte"],
  ["« Je me demande quand il viendra. »", "interrogative indirecte"], ["« Comme il pleuvait, nous sommes rentrés. »", "circonstancielle de cause"], ["« Il est si las qu'il dort debout. »", "circonstancielle de conséquence"],
  ["« Nous partirons à moins qu'il ne pleuve. »", "circonstancielle de condition"], ["« Qui dort dîne. »", "relative"],
];

const NEGATIONS: Pair[] = [
  ["« Je ne viendrai pas. »", "totale"], ["« Il ne mange jamais de viande. »", "partielle"], ["« Personne n'est venu. »", "partielle"], ["« Je ne vois rien. »", "partielle"], ["« Elle ne sort pas ce soir. »", "totale"], ["« Il n'a plus faim. »", "partielle"],
  ["« Je n'ai vu personne. »", "partielle"], ["« Nul ne l'ignore. »", "partielle"], ["« Ne fais point cela. »", "totale"],
];

const INTERROGATIONS: Pair[] = [
  ["« Viens-tu ce soir ? »", "totale"], ["« Où vas-tu ? »", "partielle"], ["« Est-ce que tu as fini ? »", "totale"], ["« Qui a appelé ? »", "partielle"], ["« Pourquoi pleures-tu ? »", "partielle"], ["« As-tu faim ? »", "totale"],
  ["« Tu viens ? »", "totale"], ["« Ton frère vient-il ? »", "totale"], ["« Avec qui pars-tu ? »", "partielle"], ["« Combien coûte ce livre ? »", "partielle"],
];

const VERBS = ["chanter", "parler", "marcher", "aimer", "danser", "jouer", "regarder", "écouter", "donner", "porter", "arriver", "travailler"];
const PERSONS = ["je", "tu", "il", "nous", "vous", "ils"];
const TENSES: Array<[string, string[]]> = [
  ["présent de l'indicatif", ["e", "es", "e", "ons", "ez", "ent"]],
  ["imparfait de l'indicatif", ["ais", "ais", "ait", "ions", "iez", "aient"]],
  ["futur simple", ["erai", "eras", "era", "erons", "erez", "eront"]],
  ["conditionnel présent", ["erais", "erais", "erait", "erions", "eriez", "eraient"]],
  ["passé simple", ["ai", "as", "a", "âmes", "âtes", "èrent"]],
  ["subjonctif présent", ["e", "es", "e", "ions", "iez", "ent"]],
];
const conjugate = (verb: string, p: number, t: number) => {
  const stem = verb.slice(0, -2);
  const form = stem + TENSES[t][1][p];
  const subject = p === 0 && /^[aeiouéh]/.test(form) ? "j'" : `${PERSONS[p]} `;
  const que = TENSES[t][0].startsWith("subjonctif") ? (p === 2 || p === 5 ? "qu'" : "que ") : "";
  return `${que}${subject}${form}`;
};

const grammaire: Generator[] = [
  (r) => {
    const v = pick(r, VERBS), p = int(r, 0, 5), t = int(r, 0, 5);
    return mcq(r, `À quel temps est conjugué « ${conjugate(v, p, t)} » ?`, TENSES[t][0], TENSES.map(([n]) => n), `« ${conjugate(v, p, t)} » : ${TENSES[t][0]} du verbe ${v}.`);
  },
  (r) => {
    const [ex, kind] = pick(r, SUBORDINATES);
    return mcq(r, `Nature de la proposition subordonnée : ${ex}`, `subordonnée ${kind}`, [...new Set(SUBORDINATES.map(([, k]) => `subordonnée ${k}`))].filter((k) => k !== `subordonnée ${kind}`), `C'est une subordonnée ${kind}.`, undefined, 2);
  },
  (r) => {
    const [ex, kind] = pick(r, NEGATIONS);
    return tf(`${ex} est une négation totale.`, kind === "totale", kind === "totale" ? "« ne… pas » porte sur toute la phrase : négation totale." : "La négation porte sur un élément (jamais, personne, rien, plus…) : négation partielle.");
  },
  (r) => {
    const [ex, kind] = pick(r, INTERROGATIONS);
    return tf(`${ex} est une interrogation totale.`, kind === "totale", kind === "totale" ? "On peut y répondre par oui ou non : interrogation totale." : "Elle porte sur un élément (mot interrogatif) : interrogation partielle.");
  },
  ...terms([["proposition indépendante", "une proposition qui ne dépend d'aucune autre et dont aucune ne dépend"], ["proposition principale", "une proposition dont dépend au moins une subordonnée"], ["antécédent", "le nom que reprend le pronom relatif"], ["conjonction de subordination", "un mot qui introduit une subordonnée conjonctive (que, quand, si…)"], ["juxtaposition", "des propositions reliées par une simple ponctuation"], ["coordination", "des propositions reliées par une conjonction de coordination"]]),
  (r) => {
    const n = int(r, 1, 4);
    const sentences = ["« Il pleut. »", "« Il pleut et je reste chez moi. »", "« Quand il pleut, je reste chez moi car j'ai froid. »", "« Je pense que, quand il pleut, il faut rester là où l'on est bien. »"];
    const counts = [1, 2, 3, 4];
    return numeric(`Combien de propositions dans ${sentences[n - 1]} ?`, counts[n - 1], `Une proposition par verbe conjugué.`);
  },
];

// ───────────── Philosophie ─────────────

const thesis = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Quel philosophe : ${a} ?`, reverse: (b) => `Quelle idée est associée à ${b} ?`, claim: (a, b) => `${b} : ${a}.`.replace(/^./, (c) => c.toUpperCase()), explain: (a, b) => `${b} : ${a}.` });

const conscience: Generator[] = [
  ...thesis(([
    ["« Je pense, donc je suis »", "Descartes"], ["l'inconscient psychique révélé par les rêves et les lapsus", "Freud"], ["« Toute conscience est conscience de quelque chose »", "Husserl"],
    ["le moi n'est qu'un « faisceau de perceptions »", "Hume"], ["l'homme est un « roseau pensant »", "Pascal"], ["la mauvaise foi : se mentir à soi-même pour fuir sa liberté", "Sartre"],
    ["la conscience est liée à la mémoire : « toute conscience est mémoire »", "Bergson"], ["les petites perceptions inconscientes", "Leibniz"], ["« Le moi n'est pas maître dans sa propre maison »", "Freud"],
  ] as Pair[]).filter(([, b], i, all) => all.findIndex(([, c]) => c === b) === i)),
  ...terms([["cogito", "la certitude de son existence comme être pensant"], ["introspection", "l'observation de soi par soi"], ["refoulement", "le rejet dans l'inconscient de désirs inacceptables"], ["lapsus", "un mot dit à la place d'un autre, révélateur de l'inconscient"], ["conscience morale", "la capacité de juger le bien et le mal de ses actes"], ["mauvaise foi", "le fait de se mentir à soi-même pour fuir sa liberté (Sartre)"], ["doute méthodique", "la démarche de Descartes qui rejette tout ce qui n'est pas certain"]]),
  claims([
    ["Pour Freud, la plupart de nos pensées sont conscientes.", false, "L'inconscient est une part essentielle du psychisme."],
    ["Le doute de Descartes est méthodique et provisoire.", true, "Il vise à trouver une vérité certaine."],
    ["Avoir conscience de soi permet de se juger moralement.", true, "Conscience psychologique et conscience morale sont liées."],
  ]),
];

const liberte: Generator[] = [
  ...thesis([
    ["« L'homme est condamné à être libre »", "Sartre"], ["les hommes se croient libres car ils ignorent les causes qui les déterminent", "Spinoza"], ["« L'obéissance à la loi qu'on s'est prescrite est liberté »", "Rousseau"],
    ["la liberté comme autonomie de la volonté raisonnable", "Kant"], ["le libre arbitre, infini comme la volonté divine", "Descartes"], ["la liberté comme absence d'obstacles extérieurs au mouvement", "Hobbes"],
    ["certaines choses dépendent de nous, d'autres non", "Épictète"], ["le désir mimétique : nous désirons ce que désire autrui", "René Girard"],
  ]),
  ...terms([["libre arbitre", "la capacité de choisir sans être déterminé"], ["déterminisme", "l'idée que tout événement a une cause nécessaire"], ["autonomie", "le fait de se donner à soi-même sa propre loi"], ["hétéronomie", "le fait de recevoir sa loi de l'extérieur"], ["fatalisme", "la croyance que tout est écrit d'avance, quoi qu'on fasse"], ["aliénation", "la perte de sa liberté, le fait de devenir étranger à soi"], ["contrainte", "ce qui oblige de l'extérieur"]]),
  claims([
    ["Pour Sartre, nos actes découlent d'un caractère que nous n'avons pas choisi.", false, "Il n'y a pas de nature humaine donnée : l'homme est ce qu'il se fait, et invoquer son caractère relève de la mauvaise foi."],
    ["Pour Sartre, « l'existence précède l'essence ».", true, "L'homme se définit par ses choix."],
    ["Pour Épictète, la sagesse consiste à chercher à maîtriser ce qui ne dépend pas de nous.", false, "Il faut au contraire distinguer ce qui dépend de nous (nos jugements, nos désirs) de ce qui n'en dépend pas, et accepter ce dernier."],
  ]),
];

const verite: Generator[] = [
  ...thesis([
    ["l'allégorie de la caverne", "Platon"], ["la vérité comme adéquation de la chose et de l'intellect", "Thomas d'Aquin"], ["la falsifiabilité comme critère de scientificité", "Karl Popper"],
    ["« Il n'y a pas de faits, seulement des interprétations »", "Nietzsche"], ["le doute hyperbolique et le « malin génie »", "Descartes"], ["« L'opinion pense mal ; elle ne pense pas »", "Bachelard"],
    ["« Je sais que je ne sais rien »", "Socrate"], ["l'homme est la mesure de toute chose", "Protagoras"], ["la connaissance commence avec l'expérience", "Kant"],
  ]),
  ...terms([["opinion", "une croyance non fondée rationnellement"], ["démonstration", "un raisonnement qui établit une vérité à partir de prémisses"], ["certitude", "l'état d'esprit de celui qui ne doute pas"], ["scepticisme", "la doctrine selon laquelle on doit suspendre son jugement"], ["relativisme", "l'idée que la vérité dépend du point de vue"], ["évidence", "ce qui s'impose immédiatement à l'esprit"], ["hypothèse", "une proposition provisoire à vérifier"]]),
  claims([
    ["Une théorie scientifique est, selon Popper, définitivement vérifiée.", false, "Elle reste falsifiable et provisoire."],
    ["La vérité formelle porte sur la cohérence du raisonnement.", true, "Comme en logique et en mathématiques."],
    ["Pour Platon, l'opinion vraie vaut la science, puisqu'elle dit vrai.", false, "Dans le Ménon, l'opinion droite reste instable tant qu'elle n'est pas « enchaînée » par le raisonnement qui en donne la cause."],
  ]),
];

const devoir: Generator[] = [
  ...thesis([
    ["l'impératif catégorique", "Kant"], ["l'utilitarisme qualitatif : certains plaisirs sont supérieurs à d'autres", "John Stuart Mill"], ["la morale par provision", "Descartes"],
    ["la pitié, sentiment naturel antérieur à la raison", "Rousseau"], ["la généalogie de la morale et la critique de la morale des esclaves", "Nietzsche"], ["l'éthique de la vertu et le juste milieu", "Aristote"],
    ["le visage d'autrui m'oblige", "Levinas"], ["la désobéissance civile", "Henry David Thoreau"],
  ]),
  ...terms([["devoir", "ce que l'on doit faire par obligation morale"], ["impératif hypothétique", "un commandement conditionnel (si tu veux… fais…)"], ["impératif catégorique", "un commandement inconditionnel de la raison"], ["vertu", "une disposition durable à bien agir"], ["morale", "l'ensemble des règles du bien et du mal"], ["légalité", "la conformité à la loi"], ["légitimité", "la conformité à ce qui est juste"]]),
  claims([
    ["Pour John Stuart Mill, tous les plaisirs se valent : seule compte leur quantité.", false, "Mill distingue des plaisirs supérieurs (de l'esprit) et inférieurs : c'est son utilitarisme qualitatif, contre Bentham."],
    ["Pour Thoreau, il faut obéir à une loi injuste tant qu'elle n'a pas été abrogée.", false, "Il défend la désobéissance civile : refuser publiquement d'obéir à une loi injuste (il refuse l'impôt qui finance l'esclavage et la guerre)."],
    ["Pour Kant, il faut traiter autrui toujours comme une fin, jamais simplement comme un moyen.", true, "Une formulation de l'impératif catégorique."],
  ]),
];

const methodePhilo: Generator[] = [
  ...terms([
    ["problématique", "la question qui révèle la difficulté du sujet"], ["paradoxe", "une affirmation qui va contre l'opinion commune"], ["présupposé", "ce que le sujet suppose sans le dire"],
    ["concept", "une idée générale définie avec précision"], ["thèse", "la position défendue par un auteur"], ["argument", "une raison qui soutient une thèse"], ["objection", "un argument qui s'oppose à une thèse"],
    ["distinction conceptuelle", "la différence établie entre deux notions voisines"], ["analyse du sujet", "le travail de définition des termes et de repérage des enjeux"],
  ]),
  ...pairs(
    [["« Peut-on… ? »", "s'interroger sur la possibilité et la légitimité"], ["« Doit-on… ? »", "s'interroger sur l'obligation morale ou la nécessité"], ["« Faut-il… ? »", "s'interroger sur la nécessité et la valeur"], ["« Qu'est-ce que… ? »", "chercher une définition et l'essence d'une notion"]],
    { ask: (a) => `Un sujet en ${a} invite à…`, reverse: (b) => `Quelle formulation de sujet invite à ${b} ?`, claim: (a, b) => `Un sujet en ${a} invite à ${b}.`, explain: (a, b) => `${a} : ${b}.` },
  ),
  claims([
    ["Une dissertation de philosophie doit partir d'un problème, pas d'un catalogue d'auteurs.", true, "Les auteurs servent l'argumentation."],
    ["Il faut définir les termes du sujet dès l'introduction.", true, "C'est le point de départ de la problématisation."],
    ["Une citation d'auteur suffit à prouver une thèse.", false, "Elle doit être expliquée et discutée."],
    ["L'explication de texte consiste à résumer le texte.", false, "Il faut en dégager la thèse, le problème et analyser l'argumentation."],
  ]),
];

export const LETTRES: Record<string, Generator[]> = {
  "fr-2-figures": figures,
  "fr-2-poesie": poesie,
  "fr-2-theatre": theatre,
  "fr-2-roman": roman,
  "fr-1-mouvements": mouvements,
  "fr-1-commentaire": commentaire,
  "fr-1-dissertation": dissertation,
  "fr-1-grammaire": grammaire,
  "philo-t-conscience": conscience,
  "philo-t-liberte": liberte,
  "philo-t-verite": verite,
  "philo-t-devoir": devoir,
  "philo-t-methode": methodePhilo,
};
