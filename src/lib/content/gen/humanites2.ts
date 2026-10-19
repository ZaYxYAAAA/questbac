/** Philosophie, SES, Français et Anglais — chapitres complémentaires alignés sur les programmes. */
import { chrono } from "./histoire";
import { type Generator, type Pair, claims, int, mcq, numeric, pairs, pick, tex } from "./kit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const terms = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Que désigne « ${a} » ?`, reverse: (b) => `Quel terme désigne : ${b} ?`, claim: (a, b) => `« ${cap(a)} » désigne ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` });
const thesis = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Quel philosophe : ${a} ?`, reverse: (b) => `Quelle idée est associée à ${b} ?`, claim: (a, b) => `${b} : ${a}.`, explain: (a, b) => `${b} : ${a}.` });

// ═════════════ Philosophie (notions du programme de Terminale) ═════════════

const bonheur: Generator[] = [
  ...thesis([
    ["le bonheur comme ataraxie, absence de troubles de l'âme", "Épicure"], ["le bonheur est le souverain bien, fin de toutes nos actions", "Aristote"], ["le bonheur est « un idéal non de la raison mais de l'imagination »", "Kant"],
    ["« Il ne dépend pas de nous » : distinguer ce qui dépend de nous et ce qui n'en dépend pas", "Épictète"], ["le divertissement nous détourne de penser à notre condition", "Pascal"],
    ["« Malheur à qui n'a plus rien à désirer ! »", "Rousseau"], ["la vie oscille « comme un pendule » entre la souffrance et l'ennui", "Schopenhauer"],
  ]),
  ...terms([["ataraxie", "l'absence de trouble de l'âme"], ["hédonisme", "la doctrine qui fait du plaisir le souverain bien"], ["eudémonisme", "une morale qui vise le bonheur"], ["désir", "la tendance vers ce que l'on se représente comme source de satisfaction"], ["besoin", "une nécessité vitale"], ["divertissement", "selon Pascal, ce qui nous détourne de penser à notre condition"]]),
  claims([["Pour Épicure, le bonheur suppose de satisfaire aussi les désirs naturels non nécessaires (mets raffinés, luxe).", false, "Seuls les désirs naturels et nécessaires doivent être satisfaits ; les autres peuvent être goûtés à l'occasion, sans en dépendre."], ["Le stoïcisme invite à accepter ce qui ne dépend pas de nous.", true, "Épictète, Marc Aurèle, Sénèque."]]),
];

const etatJustice: Generator[] = [
  ...thesis([
    ["l'état de nature est une « guerre de tous contre tous »", "Hobbes"], ["le contrat social et la volonté générale", "Rousseau"], ["la séparation des pouvoirs : « le pouvoir arrête le pouvoir »", "Montesquieu"],
    ["l'État comme « monopole de la violence physique légitime »", "Max Weber"], ["l'État est un instrument de domination de classe", "Marx"], ["le Prince doit savoir « ne pas être bon »", "Machiavel"],
    ["la justice comme équité : les principes choisis sous un « voile d'ignorance »", "John Rawls"], ["l'homme est par nature un « animal politique »", "Aristote"],
  ]),
  ...terms([["légitimité", "la conformité d'un pouvoir à ce qui est jugé juste"], ["légalité", "la conformité à la loi en vigueur"], ["droit naturel", "les droits que l'homme possède du seul fait d'être homme"], ["droit positif", "l'ensemble des lois effectivement en vigueur"], ["équité", "la justice adaptée aux cas particuliers"], ["souveraineté", "le pouvoir suprême de faire les lois"], ["anarchisme", "la doctrine qui rejette toute forme d'État"]]),
  claims([["Pour Hobbes, les sujets peuvent renverser le souverain qui gouverne mal.", false, "Le pacte est irrévocable : le sujet garde seulement le droit de défendre sa propre vie."], ["Pour Rousseau, obéir à la loi qu'on s'est prescrite est liberté.", true, "Du contrat social."]]),
];

const art: Generator[] = [
  ...thesis([
    ["l'art comme imitation (mimèsis) éloignée de la vérité", "Platon"], ["le beau est « ce qui plaît universellement sans concept »", "Kant"], ["le génie est le talent qui donne ses règles à l'art", "Kant"],
    ["l'art révèle ce que la perception ordinaire nous cache", "Bergson"], ["la catharsis : purgation des passions par la tragédie", "Aristote"], ["l'œuvre d'art à l'époque de sa reproductibilité technique perd son « aura »", "Walter Benjamin"], ["« La nature imite l'art »", "Oscar Wilde"], ["« L'art est une manifestation sensible de l'Idée »", "Hegel"],
  ]),
  ...terms([["œuvre d'art", "une production humaine destinée à être contemplée"], ["artisan", "celui qui produit selon des règles pour un usage"], ["goût", "la faculté de juger du beau"], ["sublime", "ce qui dépasse toute mesure et provoque un sentiment de grandeur"], ["mimèsis", "l'imitation de la nature"], ["inspiration", "la création attribuée à une force extérieure"]]),
  claims([["Pour Kant, « à chacun son goût » vaut aussi pour le beau.", false, "Cela vaut pour l'agréable ; le jugement sur le beau prétend à l'universalité, sans concept."], ["L'art contemporain a souvent remis en cause la recherche du beau.", true, "Exemple : les ready-made de Duchamp."]]),
];

const techniqueTravail: Generator[] = [
  ...thesis([
    ["la technique doit nous rendre « comme maîtres et possesseurs de la nature »", "Descartes"], ["le travail aliéné : l'ouvrier devient étranger à son activité", "Marx"], ["la dialectique du maître et de l'esclave", "Hegel"],
    ["le principe responsabilité face aux pouvoirs de la technique", "Hans Jonas"], ["la distinction entre travail, œuvre et action", "Hannah Arendt"], ["l'homme, être inachevé, compense par la technique (mythe de Prométhée)", "Platon"], ["la main est « l'outil des outils »", "Aristote"], ["l'homme est un « homo faber » qui fabrique des outils", "Bergson"],
  ]),
  ...terms([["technique", "l'ensemble des procédés pour produire un résultat"], ["aliénation", "la perte de soi dans une activité qui nous rend étrangers à nous-mêmes"], ["division du travail", "la répartition des tâches entre travailleurs spécialisés"], ["outil", "un objet prolongeant le corps pour agir sur la matière"], ["machine", "un dispositif qui transforme l'énergie et accomplit une tâche"], ["loisir", "le temps libéré du travail"]]),
  claims([["Pour Marx, le travail aliène l'homme par nature, quelle que soit son organisation.", false, "C'est le travail salarié dans le capitalisme qui aliène ; le travail peut aussi réaliser l'homme."], ["Hans Jonas invite à anticiper les conséquences lointaines de la technique.", true, "Le Principe responsabilité (1979)."]]),
];

const scienceRaison: Generator[] = [
  ...thesis([
    ["la science progresse par « ruptures épistémologiques » contre l'opinion", "Bachelard"], ["une théorie est scientifique si elle est réfutable", "Karl Popper"], ["les révolutions scientifiques changent de paradigme", "Thomas Kuhn"],
    ["la causalité vient de l'habitude, non de la raison", "Hume"], ["« Le cœur a ses raisons que la raison ne connaît point »", "Pascal"], ["les règles de la méthode : évidence, analyse, synthèse, dénombrement", "Descartes"], ["« Rien n'est sans raison » : le principe de raison suffisante", "Leibniz"], ["la méthode expérimentale en médecine", "Claude Bernard"],
  ]),
  ...terms([["induction", "le raisonnement qui va du particulier au général"], ["déduction", "le raisonnement qui tire une conclusion nécessaire de prémisses"], ["expérimentation", "la vérification d'une hypothèse par une expérience contrôlée"], ["empirisme", "la doctrine selon laquelle toute connaissance vient de l'expérience"], ["rationalisme", "la doctrine qui fonde la connaissance sur la raison"], ["paradigme", "le cadre théorique partagé par une communauté scientifique"]]),
  claims([["Pour Popper, la psychanalyse est un modèle de théorie scientifique.", false, "Elle est pour lui irréfutable (elle explique tout), donc non scientifique."], ["La raison peut connaître ses propres limites (Kant).", true, "C'est le projet de la Critique de la raison pure."]]),
];

const langageTemps: Generator[] = [
  ...thesis([
    ["le langage distingue l'homme de l'animal (lettre au marquis de Newcastle)", "Descartes"], ["« Quand dire, c'est faire » : les énoncés performatifs", "Austin"], ["le signe linguistique est arbitraire", "Saussure"],
    ["« Qu'est-ce donc que le temps ? Si personne ne me le demande, je le sais »", "saint Augustin"], ["la durée vécue s'oppose au temps mesuré", "Bergson"], ["« Tu ne te baigneras jamais deux fois dans le même fleuve »", "Héraclite"], ["« Les limites de mon langage signifient les limites de mon monde »", "Wittgenstein"], ["les mots ne sont que des étiquettes collées sur les choses", "Bergson"],
  ]),
  ...terms([["signe", "l'union d'un signifiant et d'un signifié"], ["performatif", "un énoncé qui accomplit ce qu'il dit (« je promets »)"], ["durée", "le temps vécu de la conscience"], ["éternité", "ce qui est hors du temps"], ["finitude", "le caractère limité de l'existence humaine"], ["mémoire", "la faculté de conserver et rappeler le passé"]]),
  claims([["Pour Saussure, le lien entre le mot et la chose est naturel.", false, "Il est arbitraire."], ["Les animaux communiquent, mais leur langage diffère du langage humain articulé.", true, "Exemple : la danse des abeilles (Benveniste)."]]),
];

const auteursPhilo: Generator[] = [
  ...chrono([
    ["Mort de Socrate", -399], ["Naissance d'Aristote", -384], ["Naissance de saint Augustin", 354], ["Naissance de Machiavel", 1469], ["Naissance de Hobbes", 1588],
    ["Naissance de Montaigne", 1533], ["Naissance de Descartes", 1596], ["Naissance de Pascal", 1623], ["Naissance de Spinoza", 1632], ["Naissance de Rousseau", 1712],
    ["Naissance de Hume", 1711], ["Naissance de Kant", 1724], ["Naissance de Hegel", 1770], ["Naissance de Marx", 1818], ["Naissance de Nietzsche", 1844], ["Naissance de Freud", 1856],
    ["Naissance de Bergson", 1859], ["Naissance de Sartre", 1905], ["Naissance de Hannah Arendt", 1906], ["Naissance de Simone de Beauvoir", 1908],
  ]),
  ...pairs(
    [["Platon", "La République"], ["Aristote", "Éthique à Nicomaque"], ["Descartes", "Discours de la méthode"], ["Pascal", "Pensées"], ["Spinoza", "Éthique"], ["Rousseau", "Discours sur l'origine de l'inégalité"], ["Kant", "Fondements de la métaphysique des mœurs"], ["Nietzsche", "Le Gai Savoir"], ["Simone de Beauvoir", "Le Deuxième Sexe"], ["Hannah Arendt", "Condition de l'homme moderne"], ["Sartre", "L'existentialisme est un humanisme"], ["Bergson", "L'Évolution créatrice"]],
    { ask: (a) => `Une œuvre de ${a} ?`, reverse: (b) => `Qui a écrit *${b}* ?`, claim: (a, b) => `*${b}* a été écrit par ${a}.`, explain: (a, b) => `${a} : *${b}*.` },
  ),
];

// ═════════════ SES ═════════════

const diplome: Generator[] = [
  ...terms([["diplôme", "la certification d'un niveau de formation"], ["qualification", "l'ensemble des compétences exigées par un emploi ou détenues par un individu"], ["capital humain", "les connaissances et compétences qui augmentent la productivité"], ["salaire", "la rémunération du travail"], ["emploi", "un travail rémunéré"], ["déclassement", "le fait d'occuper un emploi en dessous de son niveau de diplôme"], ["insertion professionnelle", "l'accès à un emploi stable après les études"], ["CDI", "un contrat de travail à durée indéterminée"], ["CDD", "un contrat de travail à durée déterminée"], ["SMIC", "le salaire minimum légal en France"], ["salaire médian", "le salaire qui partage les salariés en deux moitiés"]]),
  (r) => {
    const s1 = int(r, 14, 22) * 100, s2 = s1 + int(r, 2, 15) * 100;
    return numeric(`Salaire médian sans diplôme : $${s1}$ € ; avec un diplôme du supérieur : $${s2}$ €. Écart en % (au dixième) ?`, Math.round(((s2 - s1) / s1) * 1000) / 10, `$\\dfrac{${s2} - ${s1}}{${s1}} \\times 100$.`, "%", 0.11);
  },
  claims([["Le taux de chômage des non-diplômés est plus élevé que celui des diplômés du supérieur.", true, "Le diplôme protège du chômage."], ["À diplôme égal, les femmes gagnent en moyenne autant que les hommes en France.", false, "L'écart de salaire persiste à diplôme égal (métiers, temps partiel, plafond de verre)."], ["La poursuite d'études est un investissement en capital humain.", true, "Théorie de Gary Becker."]]),
];

const politique: Generator[] = [
  ...pairs(
    [["le pouvoir législatif", "vote les lois (Parlement)"], ["le pouvoir exécutif", "applique les lois (président, gouvernement)"], ["le pouvoir judiciaire", "juge les litiges (tribunaux)"]],
    { ask: (a) => `Rôle du ${a.replace(/^le /, "")} ?`, reverse: (b) => `Quel pouvoir ${b} ?`, claim: (a, b) => `${cap(a)} ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  ...terms([["démocratie représentative", "un régime où les citoyens élisent des représentants"], ["démocratie participative", "l'association des citoyens aux décisions entre deux élections"], ["Assemblée nationale", "la chambre du Parlement élue au suffrage universel direct"], ["Sénat", "la chambre du Parlement élue au suffrage indirect"], ["parti politique", "une organisation qui cherche à conquérir et exercer le pouvoir"], ["abstention", "le fait de ne pas voter"], ["mode de scrutin", "les règles qui transforment les votes en sièges"], ["Conseil constitutionnel", "l'institution qui contrôle la conformité des lois à la Constitution"], ["référendum", "un vote direct des citoyens sur une question"], ["société civile", "les associations et groupes de citoyens hors de l'État"]]),
  (r) => {
    const ins = pick(r, [1000, 2000, 5000, 10000]), vot = Math.round(ins * pick(r, [0.4, 0.5, 0.6, 0.7, 0.8]));
    return numeric(`$${tex(ins)}$ inscrits et $${tex(vot)}$ votants. Taux d'abstention (%) ?`, Math.round(((ins - vot) / ins) * 1000) / 10, `$\\dfrac{${ins} - ${vot}}{${ins}} \\times 100$.`, "%", 0.11);
  },
];

const opinionVote: Generator[] = [
  ...terms([["opinion publique", "l'ensemble des opinions dominantes dans une société"], ["sondage", "une enquête auprès d'un échantillon représentatif"], ["méthode des quotas", "un échantillon construit selon la structure de la population"], ["marge d'erreur", "l'intervalle d'incertitude d'un sondage"], ["vote sur enjeu", "un vote déterminé par les questions du moment"], ["vote de classe", "un vote déterminé par l'appartenance sociale"], ["volatilité électorale", "le changement de choix d'une élection à l'autre"], ["abstention", "le fait de ne pas voter"], ["échantillon représentatif", "un groupe qui reproduit les caractéristiques de la population"], ["vote blanc", "un bulletin sans nom de candidat, compté à part"], ["leader d'opinion", "une personne qui influence les opinions de son entourage"]]),
  (r) => {
    const n = pick(r, [100, 225, 400, 625, 900, 1000, 1225, 1600, 2025, 2500, 3600, 4900, 10000]);
    const marge = Math.round((1 / Math.sqrt(n)) * 1000) / 10;
    return numeric(`Sondage auprès de $${n}$ personnes : marge d'erreur approximative $\\dfrac{1}{\\sqrt{n}}$ (en points de %, au dixième) ?`, marge, `$\\dfrac{1}{\\sqrt{${n}}} \\approx ${tex(1 / Math.sqrt(n), 3)}$.`, "pts", 0.11);
  },
  claims([["La méthode des quotas consiste à tirer au sort les personnes interrogées.", false, "C'est la méthode aléatoire ; les quotas reproduisent la structure de la population (âge, sexe, PCS…)."], ["Les jeunes votent en moyenne moins que les plus âgés.", true, "L'abstention est plus forte chez les jeunes."], ["La participation électorale augmente avec le niveau de diplôme.", true, "Variable sociologique majeure."]]),
];

const risques: Generator[] = [
  ...terms([["risque", "un danger éventuel plus ou moins prévisible"], ["assurance", "un mécanisme de mutualisation des risques contre une prime"], ["mutualisation", "la répartition du coût des sinistres sur l'ensemble des assurés"], ["aléa moral", "la tendance à prendre plus de risques quand on est assuré"], ["sélection adverse", "le fait que les plus risqués s'assurent davantage"], ["protection sociale", "l'ensemble des dispositifs collectifs contre les risques sociaux"], ["Sécurité sociale", "le système public d'assurance maladie, retraite, famille, accidents du travail"]]),
  ...pairs(
    [["la maladie", "assurance maladie"], ["la vieillesse", "retraites"], ["les charges de famille", "allocations familiales"], ["la perte d'emploi", "assurance chômage"]],
    { ask: (a) => `Quelle branche couvre le risque lié à ${a} ?`, claim: (a, b) => `Le risque lié à ${a} est couvert par : ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` },
  ),
  (r) => {
    const n = pick(r, [1000, 5000, 10000]), p = pick(r, [0.01, 0.02, 0.05]), cost = pick(r, [2000, 5000, 10000]);
    return numeric(`$${tex(n)}$ assurés, probabilité de sinistre $${tex(p)}$, coût d'un sinistre $${tex(cost)}$ €. Prime pure par assuré (€) ?`, p * cost, `Coût total attendu $${tex(n * p * cost)}$ € réparti sur $${tex(n)}$ assurés.`, "€", 0.5);
  },
];

const commerce: Generator[] = [
  ...terms([["avantage comparatif", "la spécialisation dans la production où l'on est relativement le plus efficace (Ricardo)"], ["dotation factorielle", "l'abondance relative de travail, de capital ou de ressources d'un pays"], ["chaîne de valeur mondiale", "la fragmentation de la production entre plusieurs pays"], ["firme multinationale", "une entreprise qui produit dans plusieurs pays"], ["protectionnisme", "les mesures qui protègent la production nationale"], ["libre-échange", "la suppression des obstacles aux échanges"], ["dumping", "la vente à l'étranger en dessous du prix normal"], ["balance commerciale", "la différence entre exportations et importations de biens"]]),
  (r) => {
    const x = int(r, 400, 800), m = int(r, 400, 800);
    return numeric(`Exportations $${x}$ Md€, importations $${m}$ Md€. Solde commercial (Md€) ?`, x - m, `Solde = X − M = $${x} - ${m}$.`, "Md€");
  },
  (r) => {
    const x = int(r, 400, 800), m = int(r, 400, 800);
    return numeric(`Exportations $${x}$, importations $${m}$. Taux de couverture (%, au dixième) ?`, Math.round((x / m) * 1000) / 10, `$\\dfrac{X}{M} \\times 100$.`, "%", 0.11);
  },
  claims([["Selon Ricardo, un pays a intérêt à échanger même s'il est moins productif partout.", true, "Grâce aux avantages comparatifs."], ["L'OMC a pour mission de favoriser le libre-échange.", true, "Organisation mondiale du commerce, créée en 1995."], ["Selon Ricardo, un pays doit se spécialiser là où il a un avantage absolu sur ses partenaires.", false, "L'avantage absolu est l'idée d'Adam Smith ; Ricardo montre qu'un avantage comparatif suffit."]]),
];

const mobilite: Generator[] = [
  ...terms([["mobilité sociale", "le changement de position sociale d'un individu"], ["mobilité intergénérationnelle", "la comparaison de la position sociale des enfants et de leurs parents"], ["table de destinée", "la répartition des fils selon leur position, pour une origine donnée"], ["table de recrutement", "l'origine sociale des individus d'une catégorie donnée"], ["mobilité structurelle", "la mobilité due à l'évolution de la structure des emplois"], ["reproduction sociale", "la transmission des positions sociales d'une génération à l'autre"], ["capital culturel", "les ressources culturelles (diplômes, savoirs) transmises par la famille (Bourdieu)"], ["PCS", "les professions et catégories socioprofessionnelles de l'INSEE"], ["paradoxe d'Anderson", "le fait qu'un diplôme supérieur à celui des parents ne garantit pas une position supérieure"], ["déclassement", "le fait d'occuper une position inférieure à celle de ses parents"]]),
  (r) => {
    const tot = pick(r, [200, 400, 500, 1000]), same = Math.round(tot * pick(r, [0.2, 0.3, 0.35, 0.4, 0.5]));
    return numeric(`Sur $${tot}$ fils d'ouvriers, $${same}$ sont ouvriers. Part de l'immobilité (%) ?`, Math.round((same / tot) * 1000) / 10, `$\\dfrac{${same}}{${tot}} \\times 100$ (lecture d'une table de destinée).`, "%", 0.11);
  },
  claims([["La mobilité sociale ascendante signifie occuper une position supérieure à celle de ses parents.", true, "Par opposition au déclassement."], ["Une table de destinée indique l'origine sociale des membres d'une catégorie.", false, "C'est une table de recrutement ; la table de destinée indique ce que deviennent les enfants d'une origine donnée."]]),
];

// ═════════════ Français ═════════════

const oeuvresBac: Generator[] = [
  ...pairs(
    [
      ["Cahier de Douai", "Rimbaud"], ["La rage de l'expression", "Francis Ponge"], ["Mes forêts", "Hélène Dorion"], ["Discours de la servitude volontaire", "La Boétie"], ["Entretiens sur la pluralité des mondes", "Fontenelle"],
      ["Lettres d'une Péruvienne", "Françoise de Graffigny"], ["Le Menteur", "Corneille"], ["On ne badine pas avec l'amour", "Musset"], ["Pour un oui ou pour un non", "Nathalie Sarraute"],
      ["Le Chevalier de la charrette", "Chrétien de Troyes"], ["Pot-Bouille", "Zola"], ["Pluie et vent sur Télumée Miracle", "Simone Schwarz-Bart"],
    ],
    { ask: (a) => `Auteur de *${a}* (programme du bac de français) ?`, reverse: (b) => `Quelle œuvre au programme a été écrite par ${b} ?`, claim: (a, b) => `*${a}* a été écrit par ${b}.`, explain: (a, b) => `*${a}* : ${b}.` },
  ),
  ...pairs(
    [
      ["Cahier de Douai", "Émancipations créatrices"], ["La rage de l'expression", "Dans l'atelier du poète"], ["Mes forêts", "La poésie, la nature, l'intime"], ["Discours de la servitude volontaire", "« Défendre » et « entretenir » la liberté"],
      ["Entretiens sur la pluralité des mondes", "Le goût de la science"], ["Lettres d'une Péruvienne", "« Un nouvel univers s'est offert à mes yeux »"], ["Le Menteur", "Mensonge et comédie"], ["On ne badine pas avec l'amour", "Les jeux du cœur et de la parole"],
      ["Pour un oui ou pour un non", "Théâtre et dispute"], ["Le Chevalier de la charrette", "Le roman et l'invention de l'amour"], ["Pot-Bouille", "Dévoiler les rouages de la société"], ["Pluie et vent sur Télumée Miracle", "Tisser les mémoires, habiter le monde"],
    ],
    { ask: (a) => `Parcours associé à *${a}* ?`, reverse: (b) => `Quelle œuvre est associée au parcours « ${b} » ?`, claim: (a, b) => `*${a}* est associé au parcours « ${b} ».`, explain: (a, b) => `*${a}* → « ${b} ».` },
  ),
  (r) => {
    const [w, obj] = pick(r, [["Cahier de Douai", "la poésie du XIXe au XXIe siècle"], ["Mes forêts", "la poésie du XIXe au XXIe siècle"], ["Le Menteur", "le théâtre du XVIIe au XXIe siècle"], ["Pour un oui ou pour un non", "le théâtre du XVIIe au XXIe siècle"], ["Lettres d'une Péruvienne", "la littérature d'idées du XVIe au XVIIIe siècle"], ["Discours de la servitude volontaire", "la littérature d'idées du XVIe au XVIIIe siècle"], ["Pot-Bouille", "le roman et le récit du Moyen Âge au XXIe siècle"], ["Le Chevalier de la charrette", "le roman et le récit du Moyen Âge au XXIe siècle"]] as const);
    return mcq(r, `Objet d'étude de *${w}* ?`, obj, ["la poésie du XIXe au XXIe siècle", "le théâtre du XVIIe au XXIe siècle", "la littérature d'idées du XVIe au XVIIIe siècle", "le roman et le récit du Moyen Âge au XXIe siècle"], `*${w}* : ${obj}.`);
  },
  claims([
    ["Pour le bac, le professeur choisit une œuvre par objet d'étude parmi les trois proposées.", true, "Soit quatre œuvres étudiées dans l'année."],
    ["*Pot-Bouille* fait partie des Rougon-Macquart.", true, "C'est le 10e roman du cycle de Zola."],
    ["*Le Chevalier de la charrette* raconte les aventures de Lancelot.", true, "Roman de chevalerie du XIIe siècle."],
    ["*Lettres d'une Péruvienne* est un roman épistolaire.", true, "Publié en 1747."],
  ]),
];

const litteratureIdees: Generator[] = [
  ...terms([["essai", "un texte argumentatif en prose où l'auteur expose sa réflexion"], ["apologue", "un récit qui illustre une leçon morale (fable, conte philosophique)"], ["pamphlet", "un texte court et violent qui attaque une personne ou une institution"], ["éditorial", "l'article qui exprime la position du journal"], ["tribune", "un article d'opinion signé par une personnalité extérieure"], ["fait divers", "un événement de la vie quotidienne rapporté par la presse"], ["argument", "une idée qui soutient une thèse"], ["thèse", "la position défendue"], ["réquisitoire", "à l'origine, le discours du procureur ; par extension, une accusation méthodique"], ["plaidoyer", "à l'origine, le discours de l'avocat ; par extension, la défense argumentée d'une cause"]]),
  ...pairs(
    [["« J'accuse… ! »", "Zola"], ["Discours sur la misère", "Victor Hugo"], ["Les Châtiments", "Victor Hugo"], ["Réflexions sur la question juive", "Sartre"], ["Le Deuxième Sexe", "Simone de Beauvoir"], ["Indignez-vous !", "Stéphane Hessel"], ["Lettres persanes", "Montesquieu"], ["Traité sur la tolérance", "Voltaire"]],
    { ask: (a) => `Auteur de ${a.startsWith("«") ? a : `*${a}*`} ?`, reverse: (b) => `Quel texte engagé a été écrit par ${b} ?`, explain: (a, b) => `${a} : ${b}.` },
  ),
  claims([["Un texte qui convainc fait appel à la raison ; un texte qui persuade fait appel aux émotions.", true, "Convaincre / persuader."], ["Un éditorial est signé par un lecteur du journal.", false, "Il est écrit par la rédaction (souvent le rédacteur en chef)."]]),
];

// ═════════════ Anglais ═════════════

const civilisation: Generator[] = [
  ...pairs(
    [["the House of Commons", "la chambre élue du Parlement britannique"], ["the House of Lords", "la chambre haute non élue du Parlement britannique"], ["Congress", "le Parlement américain (Sénat + Chambre des représentants)"], ["the Supreme Court", "la plus haute juridiction américaine"], ["the Prime Minister", "le chef du gouvernement britannique"], ["the White House", "la résidence du président américain"], ["the Commonwealth", "l'organisation des anciennes colonies britanniques"], ["the Bill of Rights (1791)", "les dix premiers amendements de la Constitution américaine"]],
    { ask: (a) => `Que désigne **${a}** ?`, reverse: (b) => `Comment s'appelle ${b} ?`, claim: (a, b) => `**${a}** désigne ${b}.`, explain: (a, b) => `${a} : ${b}.` },
  ),
  ...chrono([
    ["Magna Carta", 1215], ["Declaration of Independence", 1776], ["Lee's surrender at Appomattox (end of the Civil War)", 1865], ["Ratification of the 19th Amendment (women's suffrage in the US)", 1920],
    ["Martin Luther King's « I Have a Dream » speech", 1963], ["Civil Rights Act", 1964], ["Election of Barack Obama", 2008], ["Brexit referendum", 2016], ["Death of Queen Elizabeth II", 2022],
  ]),
  ...pairs(
    [["England", "London"], ["Scotland", "Edinburgh"], ["Wales", "Cardiff"], ["Northern Ireland", "Belfast"], ["Ireland", "Dublin"], ["Canada", "Ottawa"], ["Australia", "Canberra"], ["New Zealand", "Wellington"], ["India", "New Delhi"], ["South Africa", "Pretoria"]],
    { ask: (a) => `Capital of ${a}?`, reverse: (b) => `${b} is the capital of…`, claim: (a, b) => `The capital of ${a} is ${b}.`, explain: (a, b) => `${a}: ${b}.` },
  ),
];

const grammar: Generator[] = [
  (r) => {
    const [adj, comp, sup] = pick(r, [["tall", "taller", "the tallest"], ["big", "bigger", "the biggest"], ["happy", "happier", "the happiest"], ["good", "better", "the best"], ["bad", "worse", "the worst"], ["expensive", "more expensive", "the most expensive"], ["interesting", "more interesting", "the most interesting"], ["far", "further", "the furthest"], ["easy", "easier", "the easiest"]] as const);
    return r() < 0.5
      ? mcq(r, `Comparatif de **${adj}** ?`, comp, [`more ${adj}`, `${adj}er`, sup, `most ${adj}`], `${adj} → ${comp} than…`)
      : mcq(r, `Superlatif de **${adj}** ?`, sup, [`the most ${adj}`, `the ${adj}est`, comp, `the more ${adj}`], `${adj} → ${sup}.`);
  },
  (r) => {
    const [s, a, w] = pick(r, [
      ["The man ___ lives next door is a doctor.", "who", ["which", "whose", "where"]], ["The book ___ I bought is great.", "which", ["who", "whose", "where"]], ["The girl ___ father is a pilot is my friend.", "whose", ["who", "which", "whom"]],
      ["This is the town ___ I was born.", "where", ["which", "who", "whose"]], ["I remember the day ___ we met.", "when", ["where", "which", "who"]],
    ] as const);
    return mcq(r, s, a, [...w], `Pronom relatif : *${a}*.`);
  },
  (r) => {
    const [s, a, w] = pick(r, [
      ["I enjoy ___ (read).", "reading", ["to read", "read", "reads"]], ["She decided ___ (leave).", "to leave", ["leaving", "leave", "left"]], ["They stopped ___ (smoke) last year.", "smoking", ["to smoke", "smoke", "smoked"]],
      ["I want ___ (travel) abroad.", "to travel", ["travelling", "travel", "travelled"]], ["He avoids ___ (eat) meat.", "eating", ["to eat", "eat", "ate"]], ["We hope ___ (see) you soon.", "to see", ["seeing", "see", "saw"]],
      ["She is used to ___ (work) at night.", "working", ["work", "to work", "worked"]], ["Would you mind ___ (open) the window?", "opening", ["to open", "open", "opened"]],
    ] as const);
    return mcq(r, s, a, [...w], `Après ce verbe : ${a.startsWith("to ") ? "to + base verbale" : "V-ing (gérondif)"}.`);
  },
  (r) => {
    const [s, a, w] = pick(r, [["She's coming, ___?", "isn't she", ["doesn't she", "is she", "won't she"]], ["You don't like coffee, ___?", "do you", ["don't you", "are you", "did you"]], ["They have finished, ___?", "haven't they", ["didn't they", "have they", "don't they"]], ["He can swim, ___?", "can't he", ["can he", "doesn't he", "won't he"]], ["It was raining, ___?", "wasn't it", ["didn't it", "was it", "isn't it"]]] as const);
    return mcq(r, `Question tag : « ${s} »`, a, [...w], `Auxiliaire repris, polarité inversée : *${a}*.`);
  },
  (r) => {
    const [noun, count] = pick(r, [["water", false], ["books", true], ["money", false], ["friends", true], ["time", false], ["people", true], ["information", false], ["cars", true], ["advice", false], ["students", true], ["homework", false], ["apples", true]] as const);
    const q = pick(r, ["How ___ ?", count ? "There aren't ___ left." : "There isn't ___ left.", "She has too ___."]);
    const ans = count ? "many" : "much";
    // Pas de « few » ni « little » : « too few friends » ou « too little water » seraient corrects.
    return mcq(r, `${q.replace("___", `___ ${noun}`)}`, ans, [count ? "much" : "many", "a lot", count ? "a little" : "a few"], `*${noun}* est ${count ? "dénombrable → many" : "indénombrable → much"}.`);
  },
  (r) => {
    const [subj, verb, obj] = [pick(r, ["She", "He", "My sister", "Tom", "The teacher"]), pick(r, [["play", "plays"], ["watch", "watches"], ["study", "studies"], ["go", "goes"], ["have", "has"], ["do", "does"], ["fly", "flies"], ["fix", "fixes"]] as const), pick(r, ["every day", "on Sundays", "after school", "every morning"])];
    return mcq(r, `${subj} ___ (${verb[0]}) ${obj}.`, verb[1], [verb[0], verb[1] === `${verb[0]}s` ? `${verb[0]}es` : `${verb[0]}s`, `is ${verb[0].replace(/e$/, "")}ing`], `3e personne du singulier au présent simple : *${verb[1]}*.`);
  },
  claims([["« Much » s'emploie avec les indénombrables, « many » avec les dénombrables.", true, "much water, many books."], ["On dit « the most tall ».", false, "On dit « the tallest » (adjectif court)."], ["« Whose » exprime la possession.", true, "The boy whose bike was stolen…"]]),
];

const AXES_VOCAB: Pair[] = [
  ["the generation gap", "le fossé entre les générations"], ["to grow old", "vieillir"], ["the elderly", "les personnes âgées"], ["a role model", "un modèle"], ["self-esteem", "l'estime de soi"], ["peer pressure", "la pression des pairs"],
  ["heritage", "le patrimoine"], ["a landmark", "un monument, un repère"], ["climate change", "le changement climatique"], ["renewable energy", "les énergies renouvelables"], ["a challenge", "un défi"], ["to tackle", "s'attaquer à (un problème)"],
  ["artificial intelligence", "l'intelligence artificielle"], ["social media", "les réseaux sociaux"], ["a masterpiece", "un chef-d'œuvre"], ["to remake", "refaire, adapter"], ["inequality", "l'inégalité"], ["to fight for", "se battre pour"],
  ["a stereotype", "un stéréotype"], ["a melting pot", "un creuset (mélange des cultures)"], ["to raise awareness", "sensibiliser"], ["a breakthrough", "une avancée majeure"], ["a citizen", "un citoyen"], ["freedom of speech", "la liberté d'expression"],
];

const vocabAxes: Generator[] = [
  ...pairs(AXES_VOCAB, { ask: (a) => `Que veut dire **${a}** ?`, reverse: (b) => `Comment dit-on **${b}** en anglais ?`, claim: (a, b) => `**${a}** signifie « ${b} ».`, explain: (a, b) => `*${a}* = ${b}.` }),
  (r) => {
    const [word, axis] = pick(r, [["the generation gap", "Vivre entre générations"], ["self-esteem", "Représentation de soi et rapport à autrui"], ["heritage", "Le passé dans le présent"], ["climate change", "Défis et transitions"], ["a masterpiece", "Créer et recréer"], ["peer pressure", "Représentation de soi et rapport à autrui"], ["renewable energy", "Défis et transitions"], ["to remake", "Créer et recréer"], ["a landmark", "Le passé dans le présent"], ["the elderly", "Vivre entre générations"]] as const);
    return mcq(r, `À quel axe du programme de Seconde rattacher **${word}** ?`, axis, ["Représentation de soi et rapport à autrui", "Vivre entre générations", "Le passé dans le présent", "Défis et transitions", "Créer et recréer"], `*${word}* → axe « ${axis} ».`);
  },
];

export const HUMANITES2: Record<string, Generator[]> = {
  "philo-t-bonheur": bonheur,
  "philo-t-etat-justice": etatJustice,
  "philo-t-art": art,
  "philo-t-technique-travail": techniqueTravail,
  "philo-t-science-raison": scienceRaison,
  "philo-t-langage-temps": langageTemps,
  "philo-t-auteurs": auteursPhilo,
  "ses-2-diplome": diplome,
  "ses-2-politique": politique,
  "ses-1-opinion-vote": opinionVote,
  "ses-1-risques": risques,
  "ses-t-commerce": commerce,
  "ses-t-mobilite": mobilite,
  "fr-1-oeuvres-bac": oeuvresBac,
  "fr-2-litterature-idees": litteratureIdees,
  "en-1-civilisation": civilisation,
  "en-1-grammar": grammar,
  "en-2-axes": vocabAxes,
};
