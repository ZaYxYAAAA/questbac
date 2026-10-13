/** Générateurs de questions — SES et Anglais. */
import { type Generator, type Pair, claims, int, mcq, numeric, pairs, pick, tex, tf } from "./kit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const terms = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Que désigne « ${a} » ?`, reverse: (b) => `Quel terme désigne : ${b} ?`, claim: (a, b) => `« ${cap(a)} » désigne ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` });

// ───────────── SES ─────────────

const richesses: Generator[] = [
  (r) => {
    const ca = int(r, 20, 200) * 10, ci = int(r, 5, Math.floor(ca / 20)) * 10;
    return numeric(`Une entreprise vend pour $${ca}$ k€ et achète pour $${ci}$ k€ de consommations intermédiaires. Valeur ajoutée (k€) ?`, ca - ci, `VA = production − consommations intermédiaires = $${ca} - ${ci}$.`, "k€");
  },
  (r) => {
    const p0 = int(r, 100, 3000), g = pick(r, [-3, -1.5, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5]);
    const p1 = Math.round(p0 * (1 + g / 100) * 10) / 10;
    return numeric(`Le PIB passe de $${p0}$ à $${tex(p1)}$ milliards. Taux de croissance (en %, au dixième) ?`, Math.round(((p1 - p0) / p0) * 1000) / 10, `$\\dfrac{${tex(p1)} - ${p0}}{${p0}} \\times 100$.`, "%", 0.11);
  },
  (r) => {
    const base = int(r, 50, 500), v = Math.round(base * pick(r, [0.8, 0.9, 1.1, 1.25, 1.5, 2]));
    return numeric(`Une grandeur vaut $${base}$ l'année de base (indice 100) et $${v}$ ensuite. Indice ?`, Math.round((v / base) * 1000) / 10, `$\\dfrac{${v}}{${base}} \\times 100$.`, undefined, 0.11);
  },
  ...terms([
    ["PIB", "la somme des valeurs ajoutées produites sur un territoire en un an"], ["valeur ajoutée", "la richesse créée par une organisation (production − consommations intermédiaires)"],
    ["consommations intermédiaires", "les biens et services détruits ou transformés pendant la production"], ["production non marchande", "des services fournis gratuitement ou presque par les administrations"],
    ["facteurs de production", "le travail et le capital utilisés pour produire"], ["productivité", "le rapport entre la production et les facteurs utilisés"], ["entreprise", "une organisation qui produit des biens et services marchands"],
    ["administration publique", "une organisation qui produit des services non marchands financés par les prélèvements obligatoires"], ["économie sociale et solidaire", "les associations, coopératives et mutuelles"],
  ]),
  claims([
    ["Le PIB mesure aussi le bien-être de la population.", false, "Il ne prend pas en compte les inégalités, le bénévolat ou l'environnement."],
    ["Le travail domestique n'est pas comptabilisé dans le PIB.", true, "Il n'est ni marchand ni produit par une administration."],
    ["Une association peut produire des richesses.", true, "Sa production est généralement non marchande."],
  ]),
];

const marche: Generator[] = [
  (r) => {
    const a = int(r, 50, 200), b = int(r, 1, 5), c = int(r, 1, 5);
    const p = Math.round((a / (b + c)) * 100) / 100;
    return numeric(`Demande : $D = ${a} - ${b}p$ ; offre : $O = ${c}p$. Prix d'équilibre (au centième) ?`, p, `$${a} - ${b}p = ${c}p \\iff p = \\dfrac{${a}}{${b + c}}$.`, undefined, 0.011);
  },
  (r) => {
    const shift = pick(r, [
      ["une hausse du revenu des consommateurs (bien normal)", "la demande augmente : le prix et la quantité d'équilibre augmentent"],
      ["une hausse du coût des matières premières", "l'offre diminue : le prix augmente, la quantité baisse"],
      ["un progrès technique qui réduit les coûts", "l'offre augmente : le prix baisse, la quantité augmente"],
      ["une baisse de la popularité du produit", "la demande baisse : le prix et la quantité baissent"],
      ["l'arrivée de nombreux nouveaux producteurs", "l'offre augmente : le prix baisse, la quantité augmente"],
    ] as const);
    const outcomes = ["la demande augmente : le prix et la quantité d'équilibre augmentent", "l'offre diminue : le prix augmente, la quantité baisse", "l'offre augmente : le prix baisse, la quantité augmente", "la demande baisse : le prix et la quantité baissent"];
    return mcq(r, `Effet de ${shift[0]} sur le marché ?`, shift[1], outcomes, `Raisonnement offre/demande : ${shift[1]}.`);
  },
  ...terms([
    ["marché", "le lieu de rencontre entre l'offre et la demande"], ["prix d'équilibre", "le prix pour lequel l'offre égale la demande"], ["concurrence parfaite", "un marché avec atomicité, homogénéité, transparence, libre entrée"],
    ["monopole", "un marché avec un seul offreur"], ["oligopole", "un marché avec quelques offreurs"], ["preneur de prix", "un agent qui ne peut pas influencer le prix"], ["surplus du consommateur", "l'écart entre le prix qu'il était prêt à payer et le prix payé"],
    ["défaillance du marché", "une situation où le marché ne conduit pas à une allocation efficace"], ["externalité", "l'effet d'une activité sur un tiers sans compensation monétaire"],
  ]),
  claims([
    ["Quand le prix augmente, la quantité demandée diminue en général.", true, "La courbe de demande est décroissante."],
    ["Quand le prix augmente, les producteurs souhaitent offrir moins.", false, "La courbe d'offre est croissante."],
    ["La pollution est un exemple d'externalité négative.", true, "Elle impose un coût aux tiers."],
  ]),
];

const financement: Generator[] = [
  (r) => {
    const c = int(r, 1, 50) * 1000, t = pick(r, [1, 2, 3, 4, 5]), n = int(r, 1, 5);
    return numeric(`Un prêt de $${tex(c)}$ € à $${t}\\,\\%$ d'intérêts simples sur $${n}$ an(s). Intérêts totaux (€) ?`, (c * t * n) / 100, `$${tex(c)} \\times ${tex(t / 100)} \\times ${n}$.`, "€", 0.5);
  },
  (r) => {
    const rev = int(r, 15, 60) * 100, s = pick(r, [5, 10, 12, 15, 20, 25]);
    return numeric(`Un ménage gagne $${tex(rev)}$ € et épargne $${s}\\,\\%$ de son revenu disponible. Épargne (€) ?`, (rev * s) / 100, `$${tex(rev)} \\times ${tex(s / 100)}$.`, "€", 0.5);
  },
  ...terms([
    ["épargne", "la part du revenu disponible qui n'est pas consommée"], ["financement direct", "le financement par émission de titres sur les marchés financiers"], ["financement indirect", "le financement par crédit bancaire"],
    ["autofinancement", "le financement d'un investissement par ses propres ressources"], ["taux d'intérêt", "le prix de l'argent emprunté"], ["monnaie scripturale", "la monnaie inscrite sur des comptes bancaires"],
    ["création monétaire", "la création de monnaie par les banques lorsqu'elles accordent des crédits"], ["action", "un titre de propriété d'une part du capital d'une entreprise"], ["obligation", "un titre de créance rémunéré par des intérêts"],
    ["Banque centrale européenne", "l'institution qui conduit la politique monétaire de la zone euro"],
  ]),
  claims([
    ["« Les crédits font les dépôts. »", true, "Une banque crée de la monnaie en accordant un crédit."],
    ["Un actionnaire est un créancier de l'entreprise.", false, "Il en est copropriétaire ; l'obligataire est créancier."],
    ["Une hausse des taux directeurs vise en général à freiner l'inflation.", true, "Elle renchérit le crédit."],
  ]),
];

const socialisation: Generator[] = [
  ...pairs(
    [["la famille", "socialisation primaire"], ["l'école", "socialisation primaire"], ["le groupe de pairs", "socialisation primaire et secondaire"], ["l'entreprise", "socialisation secondaire"], ["le syndicat", "socialisation secondaire"], ["le couple", "socialisation secondaire"]],
    { ask: (a) => `${cap(a)} est surtout une instance de…`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ).slice(0, 1),
  ...terms([
    ["socialisation", "le processus d'apprentissage des normes et valeurs d'une société"], ["norme", "une règle de conduite dans une situation donnée"], ["valeur", "un idéal collectif qui oriente les comportements"],
    ["socialisation primaire", "la socialisation de l'enfance"], ["socialisation secondaire", "la socialisation à l'âge adulte"], ["socialisation anticipatrice", "l'intériorisation des normes d'un groupe que l'on souhaite rejoindre"],
    ["socialisation différenciée", "une socialisation qui varie selon le genre ou le milieu social"], ["habitus", "un ensemble de dispositions durables acquises (Bourdieu)"], ["pairs", "les individus de même âge ou de même statut"],
    ["déviance", "la transgression d'une norme"],
  ]),
  claims([
    ["La socialisation s'arrête à la fin de l'enfance.", false, "Elle se poursuit toute la vie (socialisation secondaire)."],
    ["Les jouets peuvent participer à une socialisation différenciée selon le genre.", true, "Ils transmettent des rôles sexués."],
    ["L'individu est passif dans sa socialisation.", false, "Il participe activement et peut réinterpréter les normes."],
  ]),
  (r) => {
    const n = int(r, 5, 40) * 10, k = int(r, 1, Math.floor(n / 10)) * 5;
    return numeric(`Sur $${n}$ enfants interrogés, $${k}$ pratiquent la même activité que leurs parents. Proportion (%) ?`, Math.round((k / n) * 1000) / 10, `$\\dfrac{${k}}{${n}} \\times 100$.`, "%", 0.11);
  },
];

const croissance: Generator[] = [
  (r) => {
    const g = pick(r, [1, 2, 3, 4, 5, 7, 10]), n = pick(r, [5, 10, 20]);
    return numeric(`Une économie croît de $${g}\\,\\%$ par an pendant $${n}$ ans. Coefficient multiplicateur global (au centième) ?`, Math.round((1 + g / 100) ** n * 100) / 100, `$(1 + ${tex(g / 100)})^{${n}}$.`, undefined, 0.011);
  },
  (r) => {
    const g = pick(r, [1, 2, 3.5, 5, 7, 10, 14]);
    return numeric(`Avec une croissance annuelle de $${tex(g)}\\,\\%$, en combien d'années environ le PIB double-t-il ? (règle de 70)`, Math.round((70 / g) * 10) / 10, `$70 / ${tex(g)} \\approx ${tex(70 / g, 1)}$ ans.`, "ans", 0.11);
  },
  ...terms([
    ["croissance économique", "l'augmentation durable de la production d'un pays"], ["productivité globale des facteurs", "la part de la croissance non expliquée par la quantité de travail et de capital"],
    ["progrès technique", "l'ensemble des innovations qui améliorent la production"], ["innovation de produit", "la création d'un bien ou service nouveau"], ["innovation de procédé", "une nouvelle manière de produire"],
    ["destruction créatrice", "le remplacement d'activités anciennes par des activités innovantes (Schumpeter)"], ["capital humain", "les compétences et connaissances accumulées par un individu"],
    ["institutions", "les règles qui encadrent l'activité économique (droits de propriété…)"], ["croissance endogène", "une croissance entretenue par le progrès technique issu de l'activité économique"],
  ]),
  claims([
    ["La croissance économique se mesure par la variation du PIB réel.", true, "Corrigé de l'inflation."],
    ["La croissance est toujours compatible avec la préservation de l'environnement.", false, "Elle peut épuiser les ressources et polluer : c'est un enjeu de soutenabilité."],
    ["Les droits de propriété favorisent l'investissement et l'innovation.", true, "Ils sécurisent les gains."],
  ]),
];

const chomage: Generator[] = [
  (r) => {
    const act = int(r, 20, 35) * 1000, ch = int(r, 5, 12) * act / 100;
    return numeric(`$${tex(ch)}$ chômeurs pour $${tex(act)}$ actifs. Taux de chômage (%) ?`, Math.round((ch / act) * 1000) / 10, `Chômeurs / population active $\\times 100$.`, "%", 0.11);
  },
  (r) => {
    const emp = int(r, 20, 30), ch = int(r, 2, 4);
    return numeric(`$${emp}$ millions d'actifs occupés et $${ch}$ millions de chômeurs. Population active (millions) ?`, emp + ch, `Population active = actifs occupés + chômeurs.`, "M");
  },
  ...terms([
    ["chômeur au sens du BIT", "une personne sans emploi, disponible et qui cherche activement un emploi"], ["population active", "les actifs occupés et les chômeurs"], ["halo du chômage", "les personnes proches du chômage sans en remplir tous les critères"],
    ["chômage structurel", "un chômage durable lié au fonctionnement du marché du travail"], ["chômage conjoncturel", "un chômage lié à un ralentissement de l'activité"], ["sous-emploi", "les personnes qui travaillent moins qu'elles ne le souhaitent"],
    ["appariement", "la mise en relation des offres et des demandes d'emploi"], ["salaire minimum", "le salaire plancher fixé par la loi (SMIC)"], ["flexibilité", "la capacité d'adapter l'emploi ou les salaires à l'activité"],
  ]),
  claims([
    ["Une personne qui ne cherche pas d'emploi est comptée comme chômeuse au sens du BIT.", false, "Il faut rechercher activement un emploi."],
    ["Les politiques de relance de la demande visent surtout le chômage conjoncturel.", true, "Elles soutiennent l'activité."],
    ["La formation peut réduire le chômage lié aux problèmes d'appariement.", true, "Elle adapte les qualifications aux emplois."],
  ]),
];

// ───────────── Anglais ─────────────

const IRREG: Array<[string, string, string, string]> = [
  ["go", "went", "gone", "aller"], ["see", "saw", "seen", "voir"], ["take", "took", "taken", "prendre"], ["write", "wrote", "written", "écrire"], ["eat", "ate", "eaten", "manger"],
  ["drink", "drank", "drunk", "boire"], ["begin", "began", "begun", "commencer"], ["buy", "bought", "bought", "acheter"], ["bring", "brought", "brought", "apporter"], ["think", "thought", "thought", "penser"],
  ["teach", "taught", "taught", "enseigner"], ["catch", "caught", "caught", "attraper"], ["know", "knew", "known", "savoir"], ["give", "gave", "given", "donner"], ["speak", "spoke", "spoken", "parler"],
  ["break", "broke", "broken", "casser"], ["choose", "chose", "chosen", "choisir"], ["drive", "drove", "driven", "conduire"], ["fly", "flew", "flown", "voler"], ["forget", "forgot", "forgotten", "oublier"],
  ["leave", "left", "left", "partir"], ["lose", "lost", "lost", "perdre"], ["meet", "met", "met", "rencontrer"], ["sell", "sold", "sold", "vendre"], ["tell", "told", "told", "dire, raconter"],
  ["understand", "understood", "understood", "comprendre"], ["swim", "swam", "swum", "nager"], ["sing", "sang", "sung", "chanter"], ["steal", "stole", "stolen", "voler (dérober)"], ["wear", "wore", "worn", "porter (un vêtement)"],
];
const SUBJECTS = ["I", "You", "She", "He", "We", "They", "My brother", "Our teacher"];
const third = (s: string) => ["She", "He", "My brother", "Our teacher"].includes(s);

const past: Generator[] = [
  (r) => {
    const [base, pret] = pick(r, IRREG);
    const s = pick(r, SUBJECTS), when = pick(r, ["yesterday", "last week", "two days ago", "in 2019", "last summer", "when I was ten"]);
    return mcq(r, `${s} ___ (${base}) ${when}.`, pret, [`${third(s) ? "has" : "have"} ${IRREG.find(([b]) => b === base)![2]}`, base, `${base}ed`.replace("eed", "ed")], `Marqueur de temps passé et daté (*${when}*) → prétérit : *${pret}*.`);
  },
  (r) => {
    const [base, , pp] = pick(r, IRREG);
    const s = pick(r, SUBJECTS), marker = pick(r, ["already", "never", "just", "ever"]);
    const aux = third(s) ? "has" : "have";
    const sentence = marker === "ever" ? `${aux === "has" ? "Has" : "Have"} ${s === "I" ? "you" : s.toLowerCase().replace(/^my/, "my").replace(/^our/, "our")} ever ___ (${base}) …?` : `${s} ${aux} ${marker} ___ (${base}) …`;
    return mcq(r, sentence, pp, [IRREG.find(([b]) => b === base)![1] === pp ? `${base}ed` : IRREG.find(([b]) => b === base)![1], base, `${base.replace(/e$/, "")}ing`], `*${aux} + participe passé* (present perfect) : *${pp}*.`);
  },
  (r) => {
    const [base, pret, pp, fr] = pick(r, IRREG);
    return pick(r, [
      () => mcq(r, `Prétérit de **to ${base}** (${fr}) ?`, pret, [pp === pret ? `${base}ed` : pp, `${base}ed`, base, pick(r, IRREG)[1]], `to ${base} – ${pret} – ${pp}.`),
      () => mcq(r, `Participe passé de **to ${base}** (${fr}) ?`, pp, [pret === pp ? `${base}ed` : pret, `${base}ed`, base, pick(r, IRREG)[2]], `to ${base} – ${pret} – ${pp}.`),
      () => mcq(r, `Que veut dire **to ${base}** ?`, fr, [pick(r, IRREG)[3], pick(r, IRREG)[3], pick(r, IRREG)[3]], `to ${base} = ${fr}.`, () => pick(r, IRREG)[3]),
    ])();
  },
  (r) => {
    const n = int(r, 2, 15), unit = pick(r, ["years", "months", "weeks", "days"]);
    const y = pick(r, [2005, 2010, 2015, 2018, 2020, 2022]);
    return r() < 0.5
      ? mcq(r, `I have lived here ___ ${n} ${unit}.`, "for", ["since", "ago", "during"], `*for* + durée.`)
      : mcq(r, `I have lived here ___ ${y}.`, "since", ["for", "ago", "during"], `*since* + point de départ.`);
  },
  claims([
    ["Le present perfect s'emploie avec un moment passé précis (yesterday, in 2010).", false, "Avec un moment daté, on emploie le prétérit."],
    ["« I have just finished » signifie « je viens de finir ».", true, "*have just + participe passé*."],
    ["« ago » se place après la durée : « three years ago ».", true, "Il signifie « il y a »."],
  ]),
];

const VOCAB: Pair[] = [
  ["actually", "en fait"], ["eventually", "finalement"], ["library", "bibliothèque"], ["sensible", "raisonnable"], ["to achieve", "accomplir"], ["to attend", "assister à"], ["currently", "actuellement"],
  ["however", "cependant"], ["although", "bien que"], ["whereas", "tandis que"], ["meanwhile", "pendant ce temps"], ["to improve", "améliorer"], ["to require", "exiger"], ["to threaten", "menacer"],
  ["to struggle", "lutter"], ["to own", "posséder"], ["to borrow", "emprunter"], ["to lend", "prêter"], ["to fail", "échouer"], ["to succeed", "réussir"], ["to warn", "avertir"], ["to grow up", "grandir"],
  ["to give up", "abandonner"], ["to find out", "découvrir"], ["skill", "compétence"], ["wealth", "richesse"], ["poverty", "pauvreté"], ["growth", "croissance"], ["law", "loi"], ["trial", "procès"],
  ["weather", "météo"], ["knowledge", "connaissance"], ["behaviour", "comportement"], ["to deny", "nier"], ["to rely on", "compter sur"], ["to look forward to", "avoir hâte de"], ["to be aware of", "avoir conscience de"],
  ["a journey", "un voyage"], ["a novel", "un roman"], ["a lecture", "un cours magistral"], ["a grade", "une note"], ["to pretend", "faire semblant"], ["a coin", "une pièce de monnaie"], ["the countryside", "la campagne"],
];
const FALSE_FRIENDS: Pair[] = [["actually", "actuellement"], ["eventually", "éventuellement"], ["library", "librairie"], ["sensible", "sensible"], ["to attend", "attendre"], ["a lecture", "une lecture"], ["a journey", "une journée"], ["a novel", "une nouvelle"], ["to pretend", "prétendre"], ["a coin", "un coin"]];

const vocab: Generator[] = [
  ...pairs(VOCAB, { ask: (a) => `Que veut dire **${a}** ?`, reverse: (b) => `Comment dit-on **${b}** en anglais ?`, claim: (a, b) => `**${a}** signifie « ${b} ».`, explain: (a, b) => `*${a}* = ${b}.` }),
  (r) => {
    const [en, trap] = pick(r, FALSE_FRIENDS);
    const right = VOCAB.find(([a]) => a === en)![1];
    return tf(`**${en}** veut dire « ${trap} ».`, false, `Faux ami ! *${en}* = ${right}.`);
  },
];

const MODALS: Pair[] = [
  ["You must wear a helmet.", "obligation"], ["You mustn't smoke here.", "interdiction"], ["You should see a doctor.", "conseil"], ["She can speak three languages.", "capacité"],
  ["It might rain tomorrow.", "faible probabilité"], ["He must be tired after that run.", "forte probabilité (déduction)"], ["You don't have to come.", "absence d'obligation"], ["Can I open the window?", "demande de permission"],
  ["You'd better leave now.", "conseil"], ["I could swim when I was five.", "capacité"], ["They may be late.", "probabilité moyenne"], ["You needn't worry.", "absence d'obligation"],
];

const modals: Generator[] = [
  (r) => {
    const [s, m] = pick(r, MODALS);
    return mcq(r, `Que exprime le modal dans « ${s} » ?`.replace("Que exprime", "Qu'exprime"), m, [...new Set(MODALS.map(([, x]) => x))].filter((x) => x !== m), `« ${s} » : ${m}.`);
  },
  ...pairs(
    [["must", "obligation ou forte probabilité"], ["should", "conseil"], ["can", "capacité ou permission"], ["might", "faible probabilité"], ["mustn't", "interdiction"], ["needn't", "absence de nécessité"], ["would", "conditionnel ou habitude passée"]],
    { ask: (a) => `Valeur principale de **${a}** ?`, reverse: (b) => `Quel modal exprime : ${b} ?`, claim: (a, b) => `**${a}** exprime : ${b}.`, explain: (a, b) => `*${a}* : ${b}.` },
  ),
  (r) => {
    const s = pick(r, SUBJECTS), v = pick(r, ["go", "work", "study", "leave", "call"]);
    return mcq(r, `${s} ${pick(r, ["must", "can", "should", "might"])} ___ now.`, v, [`to ${v}`, `${v}s`, `${v}ing`], `Après un modal : base verbale sans *to* ni *-s*.`);
  },
];

const PASSIVES: Array<[string, string, string, string]> = [
  ["Shakespeare", "write", "Hamlet", "Hamlet was written by Shakespeare."], ["The police", "arrest", "the thief", "The thief was arrested by the police."], ["Millions of people", "watch", "the match", "The match was watched by millions of people."],
  ["A famous architect", "build", "this bridge", "This bridge was built by a famous architect."], ["The teacher", "correct", "the tests", "The tests were corrected by the teacher."], ["Fleming", "discover", "penicillin", "Penicillin was discovered by Fleming."],
  ["The storm", "destroy", "the houses", "The houses were destroyed by the storm."], ["Our neighbours", "sell", "the car", "The car was sold by our neighbours."],
];
const PAST_FORM: Record<string, string> = { write: "wrote", arrest: "arrested", watch: "watched", build: "built", correct: "corrected", discover: "discovered", destroy: "destroyed", sell: "sold" };

const AGENTS = ["the children", "my mother", "the workers", "a robot", "the students", "the company", "our neighbours", "the chef"];
const PLURAL_AGENTS = new Set(["the children", "the workers", "the students", "our neighbours"]);
const P_VERBS: Array<[string, string, string, Array<[string, boolean]>]> = [
  ["cleans", "cleaned", "cleaned", [["the room", false], ["the windows", true], ["the kitchen", false]]],
  ["paints", "painted", "painted", [["the walls", true], ["the fence", false], ["the door", false]]],
  ["builds", "built", "built", [["the house", false], ["the bridges", true], ["a new school", false]]],
  ["writes", "wrote", "written", [["the letter", false], ["the reports", true], ["a poem", false]]],
  ["cooks", "cooked", "cooked", [["the dinner", false], ["the vegetables", true], ["a cake", false]]],
  ["repairs", "repaired", "repaired", [["the bike", false], ["the computers", true], ["the roof", false]]],
  ["sells", "sold", "sold", [["the car", false], ["the tickets", true], ["fresh bread", false]]],
  ["delivers", "delivered", "delivered", [["the parcels", true], ["the pizza", false], ["the newspapers", true]]],
  ["takes", "took", "taken", [["the pictures", true], ["the decision", false], ["the photos", true]]],
  ["washes", "washed", "washed", [["the dishes", true], ["the car", false], ["the clothes", true]]],
];

const passive: Generator[] = [
  (r) => {
    const agent = pick(r, AGENTS), [pres, pret, pp, objs] = pick(r, P_VERBS), [obj, plural] = pick(r, objs), past = r() < 0.5;
    const base = pres.replace(/es$/, (m) => (/(sh|ch|x|s)es$/.test(pres) ? "" : m)).replace(/s$/, "");
    const verb = past ? pret : PLURAL_AGENTS.has(agent) ? base : pres;
    const be = past ? (plural ? "were" : "was") : plural ? "are" : "is";
    const wrongBe = past ? (plural ? "are" : "is") : plural ? "were" : "was";
    const O = cap(obj);
    return mcq(r, `Mets à la voix passive : « ${cap(agent)} ${verb} ${obj}. »`, `${O} ${be} ${pp} by ${agent}.`, [`${O} ${wrongBe} ${pp} by ${agent}.`, `${O} ${be} ${base.replace(/e$/, "")}ing by ${agent}.`, `${cap(agent)} ${be} ${pp} by ${obj}.`], `*be* au ${past ? "prétérit" : "présent"} (${be}) + participe passé (*${pp}*) + *by*.`);
  },
  (r) => {
    const [subj, v, obj, ans] = pick(r, PASSIVES);
    const wrongs = [ans.replace(/ (was|were) /, " is "), ans.replace(/ (was|were) (\w+)/, (_m, a) => ` ${a} ${v}ed`.replace("eed", "ed")), `${cap(obj)} ${PAST_FORM[v]} ${subj.toLowerCase()}.`];
    return mcq(r, `Mets à la voix passive : « ${subj} ${PAST_FORM[v]} ${obj}. »`, ans, wrongs, `Passif : *be* au temps de la phrase active + participe passé (+ *by* complément d'agent).`);
  },
  (r) => {
    const [direct, ans, w1, w2] = pick(r, [
      ["« I am tired », she said.", "She said (that) she was tired.", "She said (that) she is tired.", "She said (that) I was tired."],
      ["« I like pizza », he said.", "He said (that) he liked pizza.", "He said (that) he likes pizza.", "He said (that) I liked pizza."],
      ["« We will come », they said.", "They said (that) they would come.", "They said (that) they will come.", "They said (that) we would come."],
      ["« I can swim », Tom said.", "Tom said (that) he could swim.", "Tom said (that) he can swim.", "Tom said (that) I could swim."],
      ["« I have finished », she said.", "She said (that) she had finished.", "She said (that) she has finished.", "She said (that) I had finished."],
      ["« I am working », he said.", "He said (that) he was working.", "He said (that) he is working.", "He said (that) I was working."],
    ] as const);
    return mcq(r, `Discours indirect de ${direct}`, ans, [w1, w2], `Concordance des temps : on recule d'un temps et on adapte les pronoms.`);
  },
  ...pairs(
    [["present simple", "am / is / are + participe passé"], ["prétérit", "was / were + participe passé"], ["present perfect", "has / have been + participe passé"], ["futur avec will", "will be + participe passé"]],
    { ask: (a) => `Passif au ${a} ?`, reverse: (b) => `À quel temps est le passif « ${b} » ?`, claim: (a, b) => `Le passif au ${a} se forme avec ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
];

const COND: Array<[string, string, string[], string]> = [
  ["If it rains tomorrow, we ___ at home.", "will stay", ["would stay", "stayed", "would have stayed"], "If + présent → will + base (réel/probable)."],
  ["If you heat ice, it ___.", "melts", ["would melt", "melted", "will have melted"], "Vérité générale : if + présent → présent."],
  ["If I ___ rich, I would travel the world.", "were", ["am", "will be", "would be"], "If + prétérit (were) → would + base (hypothèse irréelle)."],
  ["If she had more time, she ___ a novel.", "would write", ["will write", "writes", "would have written"], "If + prétérit → would + base."],
  ["If I had studied, I ___ the exam.", "would have passed", ["will pass", "would pass", "had passed"], "If + past perfect → would have + participe passé (regret)."],
  ["If they ___ earlier, they would have caught the train.", "had left", ["left", "would leave", "have left"], "If + past perfect pour un passé irréel."],
  ["I wish I ___ taller.", "were", ["am", "will be", "would have been"], "*wish* + prétérit : souhait irréel au présent."],
  ["I wish I ___ harder last year.", "had worked", ["worked", "would work", "have worked"], "*wish* + past perfect : regret sur le passé."],
  ["Unless you hurry, you ___ the bus.", "will miss", ["would miss", "missed", "would have missed"], "*unless* = *if… not* : type 1."],
  ["If only I ___ the answer now!", "knew", ["know", "will know", "would know"], "*if only* + prétérit : souhait irréel présent."],
];

const conditionals: Generator[] = [
  (r) => {
    const s = pick(r, ["I", "we", "they", "you"]), [v, pp, rest] = pick(r, [["call", "called", "you"], ["go", "gone", "to the beach"], ["buy", "bought", "a new phone"], ["win", "won", "the match"], ["help", "helped", "them"], ["leave", "left", "earlier"]] as const);
    const type = int(r, 1, 3);
    const sentence = type === 1 ? `If ${s} have time, ${s} will ${v} ${rest}.` : type === 2 ? `If ${s} had time, ${s} would ${v} ${rest}.` : `If ${s} had had time, ${s} would have ${pp} ${rest}.`;
    const label = ["", "Type 1 (réel, probable)", "Type 2 (hypothèse irréelle au présent)", "Type 3 (irréel du passé, regret)"];
    return mcq(r, `Quel type de conditionnel : « ${sentence} » ?`, label[type], label.slice(1).concat(["Ce n'est pas un conditionnel"]), `${label[type]}.`);
  },
  (r) => {
    const [q, a, w, e] = pick(r, COND);
    return mcq(r, q, a, w, e);
  },
  (r) => {
    const s = pick(r, ["I", "she", "we", "they", "he", "you"]), v = pick(r, [["buy", "bought", "a house"], ["learn", "learned", "Chinese"], ["visit", "visited", "Japan"], ["help", "helped", "the poor"], ["travel", "travelled", "around the world"], ["stop", "stopped", "working"], ["open", "opened", "a restaurant"], ["give", "given", "money to charity"], ["build", "built", "a school"], ["move", "moved", "to Canada"]] as const);
    const type = int(r, 1, 3);
    const ifc = type === 1 ? `If ${s} ${s === "she" || s === "he" ? "wins" : "win"} the lottery` : type === 2 ? `If ${s} won the lottery` : `If ${s} had won the lottery`;
    const main = type === 1 ? `will ${v[0]}` : type === 2 ? `would ${v[0]}` : `would have ${v[1]}`;
    return mcq(r, `${ifc}, ${s} ___ ${v[2]}.`, main, [`will ${v[0]}`, `would ${v[0]}`, `would have ${v[1]}`, v[1]].filter((x) => x !== main), `Type ${type} : ${["", "if + présent → will", "if + prétérit → would", "if + past perfect → would have + participe passé"][type]}.`);
  },
  claims([
    ["Dans une phrase en « if », on met « will » dans la subordonnée.", false, "Jamais *will* après *if* (sauf cas très particuliers)."],
    ["« If I were you » s'emploie pour donner un conseil.", true, "*were* à toutes les personnes au conditionnel irréel."],
    ["« I wish I had known » exprime un regret sur le passé.", true, "*wish* + past perfect."],
  ]),
];

const CONNECT: Pair[] = [
  ["however", "opposition"], ["nevertheless", "opposition"], ["whereas", "contraste"], ["therefore", "conséquence"], ["thus", "conséquence"], ["as a result", "conséquence"], ["because of", "cause"], ["since", "cause"],
  ["moreover", "addition"], ["furthermore", "addition"], ["for instance", "exemple"], ["such as", "exemple"], ["although", "concession"], ["even though", "concession"], ["to sum up", "conclusion"], ["in conclusion", "conclusion"], ["firstly", "énumération"],
];

const essay: Generator[] = [
  (r) => {
    const [c, rel] = pick(r, CONNECT);
    return mcq(r, `Quelle relation exprime **${c}** ?`, rel, [...new Set(CONNECT.map(([, x]) => x))].filter((x) => x !== rel), `*${c}* : ${rel}.`);
  },
  (r) => {
    const [c, rel] = pick(r, CONNECT);
    const right = r() < 0.5;
    const shown = right ? rel : pick(r, [...new Set(CONNECT.map(([, x]) => x))].filter((x) => x !== rel));
    return tf(`**${cap(c)}** introduit : ${shown}.`, right, `*${c}* : ${rel}.`);
  },
  ...pairs(
    [["the introduction", "présente le sujet et annonce la problématique"], ["the body", "développe les arguments en paragraphes"], ["the conclusion", "résume et donne un avis ou une ouverture"], ["a topic sentence", "annonce l'idée principale d'un paragraphe"]],
    { ask: (a) => `Dans un essay, ${a}…`, reverse: (b) => `Quel élément d'un essay ${b} ?`, claim: (a, b) => `Dans un essay, ${a} ${b}.`, explain: (a, b) => `${cap(a)} ${b}.` },
  ),
  (r) => {
    const words = pick(r, [180, 200, 250, 300]), paras = pick(r, [4, 5]);
    return numeric(`Un essay de $${words}$ mots en $${paras}$ paragraphes de longueur égale : combien de mots par paragraphe ?`, words / paras, `$${words} / ${paras}$.`, undefined, 0.5);
  },
];

export const SES_ANGLAIS: Record<string, Generator[]> = {
  "ses-2-richesses": richesses,
  "ses-2-marche": marche,
  "ses-1-financement": financement,
  "ses-1-socialisation": socialisation,
  "ses-t-croissance": croissance,
  "ses-t-chomage": chomage,
  "en-2-past": past,
  "en-2-vocab": vocab,
  "en-1-modals": modals,
  "en-1-passive": passive,
  "en-t-conditionals": conditionals,
  "en-t-essay": essay,
};
