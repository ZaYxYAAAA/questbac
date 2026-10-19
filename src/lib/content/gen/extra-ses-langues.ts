/**
 * SES, anglais et espagnol — notions, vocabulaire et repères supplémentaires.
 */
import { type Claim, type Generator, type Pair, claims, pairs } from "./kit";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const terms = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `Que désigne « ${a} » ?`, reverse: (b) => `Quel terme désigne : ${b} ?`, claim: (a, b) => `« ${cap(a)} » désigne ${b}.`, explain: (a, b) => `${cap(a)} : ${b}.` });
const ses = (t: readonly Pair[], c: readonly Claim[]): Generator[] => [...terms(t), claims(c)];
const vocab = (items: readonly Pair[], lang: "anglais" | "espagnol") =>
  pairs(items, {
    ask: (a) => `Que signifie « ${a} » ?`,
    reverse: (b) => `Comment dit-on « ${b} » en ${lang} ?`,
    claim: (a, b) => `« ${a} » signifie « ${b} ».`,
    explain: (a, b) => `${a} = ${b}.`,
  });
/**
 * Repères rangés par familles homogènes (lieux, personnes, dates…) : les leurres
 * d'une question viennent de sa famille (pas de nom propre pour une date).
 */
const facts = (...groups: (readonly Pair[])[]) =>
  groups.flatMap((items) => pairs(items, { ask: (a) => `${a} ?`, claim: (a, b) => `${a} : ${b}.`, explain: (a, b) => `${a} : ${b}.` }));

export const EXTRA_SES_LANGUES: Record<string, Generator[]> = {
  // ───────────── SES ─────────────
  "ses-2-politique": ses(
    [["démocratie représentative", "un régime où les citoyens élisent des représentants"], ["démocratie participative", "l'association directe des citoyens aux décisions"], ["parti politique", "une organisation qui cherche à conquérir et exercer le pouvoir"],
     ["abstention", "le fait de ne pas voter alors qu'on est inscrit"], ["vote blanc", "un bulletin vide ou sans nom de candidat"], ["scrutin majoritaire", "un mode d'élection où le candidat arrivé en tête l'emporte"],
     ["scrutin proportionnel", "un mode d'élection qui répartit les sièges selon les voix obtenues"], ["société civile", "l'ensemble des associations et organisations hors de l'État"], ["lobby", "un groupe de pression qui cherche à influencer les décisions publiques"],
     ["séparation des pouvoirs", "la répartition des pouvoirs entre institutions distinctes"]],
    [["En France, le droit de vote est accordé à 18 ans.", true, "Depuis 1974."], ["Le Sénat est élu au suffrage universel direct.", false, "Au suffrage indirect, par des grands électeurs."], ["Les élections législatives désignent les députés.", true, "Pour cinq ans."]],
  ),
  "ses-1-opinion-vote": ses(
    [["opinion publique", "l'ensemble des opinions partagées dans une population sur un sujet"], ["sondage", "une enquête auprès d'un échantillon représentatif"], ["échantillon représentatif", "un sous-groupe qui reproduit les caractéristiques de la population"],
     ["méthode des quotas", "la construction d'un échantillon selon la structure de la population"], ["volatilité électorale", "le changement de vote d'une élection à l'autre"], ["vote sur enjeux", "un vote déterminé par les propositions sur des thèmes précis"],
     ["identification partisane", "l'attachement durable d'un électeur à un parti"], ["variable lourde", "un facteur social qui influence durablement le vote (religion, âge…)"], ["marge d'erreur", "l'écart possible entre un résultat de sondage et la réalité"],
     ["agenda politique", "la liste des sujets dont les responsables se saisissent"]],
    [["Un sondage donne une estimation, pas une certitude.", true, "Il y a une marge d'erreur."], ["La pratique religieuse est une variable qui peut influencer le vote.", true, "Variable lourde classique."], ["L'abstention touche toutes les catégories sociales de la même façon.", false, "Elle varie selon l'âge, le diplôme…"]],
  ),
  "ses-1-risques": ses(
    [["risque", "un événement incertain pouvant causer un dommage"], ["assurance", "un mécanisme qui mutualise les risques contre une prime"], ["mutualisation", "la répartition du coût des risques sur un grand nombre de personnes"],
     ["aléa moral", "le changement de comportement d'un assuré qui prend plus de risques"], ["sélection adverse", "le fait que les plus exposés au risque s'assurent davantage"], ["Sécurité sociale", "le système public qui protège contre les risques sociaux"],
     ["cotisation sociale", "un prélèvement sur les salaires qui finance la protection sociale"], ["prestation sociale", "un revenu versé pour couvrir un risque social"], ["épargne de précaution", "une épargne constituée pour faire face aux imprévus"],
     ["principe d'assistance", "une protection fondée sur le besoin, sans cotisation préalable"]],
    [["La Sécurité sociale a été créée en 1945.", true, "Ordonnances d'octobre 1945."], ["Le RSA relève de la logique d'assurance.", false, "Il relève de l'assistance."], ["Une franchise vise à limiter l'aléa moral.", true, "L'assuré supporte une partie du coût."]],
  ),
  // Notions complémentaires de celles de « ses-anglais » (pas de doublon de définitions).
  "ses-t-croissance": ses(
    [["PIB par habitant", "le PIB divisé par la population, indicateur du niveau de vie moyen"], ["rendements décroissants", "la baisse du supplément de production obtenu en ajoutant un facteur, l'autre restant fixe"],
     ["gains de productivité", "la hausse de la production obtenue avec la même quantité de facteurs"], ["brevet", "un titre qui réserve temporairement à l'inventeur l'exploitation de son innovation"],
     ["grappes d'innovations", "selon Schumpeter, l'apparition groupée d'innovations qui relance la croissance"], ["innovation de rupture", "une innovation qui transforme radicalement un marché ou une technique"],
     ["capital naturel", "l'ensemble des ressources fournies par la nature (sols, eau, biodiversité…)"], ["soutenabilité faible", "l'idée que le capital naturel peut être remplacé par du capital produit"],
     ["soutenabilité forte", "l'idée que le capital naturel n'est pas substituable"], ["empreinte écologique", "la surface nécessaire pour produire ce qu'une population consomme et absorber ses déchets"]],
    [["Le PIB mesure parfaitement le bien-être d'une population.", false, "Il ignore inégalités, environnement, travail domestique…"], ["Les institutions et le droit de propriété favorisent la croissance.", true, "Ils incitent à investir et à innover."], ["Schumpeter associe l'innovation à l'entrepreneur.", true, "L'entrepreneur innovateur."]],
  ),
  "ses-t-mobilite": ses(
    [["mobilité sociale", "le changement de position sociale d'un individu"], ["mobilité intergénérationnelle", "le changement de position entre parents et enfants"], ["mobilité intragénérationnelle", "le changement de position au cours de la vie"],
     ["table de mobilité", "un tableau croisant la position des enfants et celle des parents"], ["table de destinée", "la répartition des fils d'une catégorie selon leur position"], ["table de recrutement", "l'origine sociale des membres d'une catégorie"],
     ["mobilité structurelle", "la mobilité due à l'évolution de la structure des emplois"], ["déclassement", "une mobilité descendante"], ["reproduction sociale", "le maintien des positions d'une génération à l'autre"],
     ["capital culturel", "selon Bourdieu, les savoirs et diplômes transmis par la famille"]],
    [["La diagonale d'une table de mobilité indique l'immobilité sociale.", true, "Même position que le père."], ["La mobilité observée est toujours ascendante.", false, "Il existe aussi du déclassement."], ["Le paradoxe d'Anderson : un diplôme plus élevé que ses parents ne garantit pas une position plus élevée.", true, "Inflation des diplômes."]],
  ),
  // ───────────── Anglais ─────────────
  // Verbes et noms séparés : leurres de même nature que la réponse.
  "en-2-axes": [
    ...vocab(
      [["to commute", "faire la navette (domicile-travail)"], ["to fit in", "s'intégrer"], ["to raise awareness", "sensibiliser"], ["to cope with", "faire face à"], ["to bully", "harceler"],
       ["to settle", "s'installer"], ["to thrive", "prospérer, s'épanouir"], ["to look up to", "admirer (quelqu'un)"]],
      "anglais",
    ),
    ...vocab(
      [["a household", "un foyer"], ["a landmark", "un monument, un lieu emblématique"], ["a sibling", "un frère ou une sœur"], ["a breakthrough", "une avancée majeure"], ["a role model", "un modèle (à suivre)"],
       ["a hardship", "une épreuve, une difficulté"], ["a skill", "une compétence"], ["heritage", "le patrimoine"], ["a wildlife reserve", "une réserve naturelle"], ["a newcomer", "un nouvel arrivant"],
       ["a melting pot", "un creuset (mélange de populations)"], ["a peer", "un pair (personne de même âge ou statut)"]],
      "anglais",
    ),
  ],
  "en-1-civilisation": facts(
    [["Capitale de l'Australie", "Canberra"], ["Capitale du Canada", "Ottawa"], ["Capitale de la Nouvelle-Zélande", "Wellington"], ["Capitale de l'Écosse", "Édimbourg"], ["Capitale de l'Irlande", "Dublin"]],
    [["Pays dont la capitale est Dublin", "l'Irlande"], ["Nation du Royaume-Uni dont la capitale est Cardiff", "le pays de Galles"], ["Nation du Royaume-Uni dont la capitale est Édimbourg", "l'Écosse"], ["Nation du Royaume-Uni dont la capitale est Belfast", "l'Irlande du Nord"]],
    [["Première femme Premier ministre britannique", "Margaret Thatcher"], ["Président américain de l'abolition de l'esclavage", "Abraham Lincoln"], ["Auteur du discours « I have a dream »", "Martin Luther King"],
     ["Militante du boycott des bus de Montgomery", "Rosa Parks"], ["Premier président noir des États-Unis", "Barack Obama"], ["Premier ministre britannique pendant la Seconde Guerre mondiale", "Winston Churchill"]],
    [["Lieu où siège le Parlement britannique", "Westminster"], ["Système de santé public britannique", "le NHS"], ["Assemblée qui avec le Sénat forme le Congrès américain", "la Chambre des représentants"],
     ["Plus haute juridiction des États-Unis", "la Cour suprême"], ["Résidence du Premier ministre britannique", "10 Downing Street"]],
    [["Auteur de « Hamlet »", "William Shakespeare"], ["Auteur d'« Oliver Twist »", "Charles Dickens"], ["Auteur de « Nineteen Eighty-Four » (1984)", "George Orwell"],
     ["Auteur de « Pride and Prejudice »", "Jane Austen"], ["Auteur de « Beloved »", "Toni Morrison"], ["Auteur de « The Adventures of Tom Sawyer »", "Mark Twain"]],
    [["Fête américaine du quatrième jeudi de novembre", "Thanksgiving"], ["Fête nationale américaine du 4 juillet", "Independence Day"], ["Fête nationale irlandaise du 17 mars", "Saint Patrick's Day"], ["Fête britannique du 5 novembre, avec feux de joie", "Guy Fawkes Night (Bonfire Night)"]],
    [["Année de la Déclaration d'indépendance américaine", "1776"], ["Année de l'abolition de l'esclavage aux États-Unis (13e amendement)", "1865"], ["Année du référendum sur le Brexit", "2016"], ["Année de l'élection de Barack Obama", "2008"], ["Année du Civil Rights Act aux États-Unis", "1964"]],
  ),
  "en-1-modals": vocab(
    [["You must wear a helmet", "Tu dois porter un casque (obligation)"], ["You mustn't smoke here", "Tu ne dois pas fumer ici (interdiction)"], ["You don't have to come", "Tu n'es pas obligé de venir"],
     ["You should rest", "Tu devrais te reposer (conseil)"], ["She can swim", "Elle sait nager (capacité)"], ["It may rain", "Il se peut qu'il pleuve"], ["He might be late", "Il se pourrait qu'il soit en retard"],
     ["You could have told me", "Tu aurais pu me le dire"], ["He must be tired", "Il doit être fatigué (déduction)"], ["He can't be serious", "Il ne peut pas être sérieux (déduction négative)"], ["I'd rather stay home", "Je préférerais rester à la maison"],
     ["You'd better hurry", "Tu ferais mieux de te dépêcher"]],
    "anglais",
  ),
  // ───────────── Espagnol ─────────────
  "es-2-cliches": vocab(
    [["la siesta", "la sieste"], ["la corrida", "la course de taureaux"], ["el tablao", "le cabaret de flamenco"], ["la paella", "le plat de riz valencien"], ["las tapas", "les petites portions servies avec une boisson"],
     ["la feria", "la fête populaire andalouse"], ["el botellón", "le rassemblement de jeunes buvant dans la rue"], ["la movida", "le mouvement culturel madrilène des années 1980"], ["la sobremesa", "le temps passé à table après le repas"],
     ["el turismo masivo", "le tourisme de masse"], ["la España vaciada", "l'Espagne rurale qui se dépeuple"], ["la Semana Santa", "la semaine sainte"]],
    "espagnol",
  ),
  "es-1-monde-hispanique": facts(
    [["Capitale de l'Argentine", "Buenos Aires"], ["Capitale du Pérou", "Lima"], ["Capitale de la Colombie", "Bogotá"], ["Capitale du Chili", "Santiago"], ["Capitale de Cuba", "La Havane"]],
    [["Pays où se trouve le Machu Picchu", "le Pérou"], ["Pays le plus peuplé du monde hispanophone", "le Mexique"], ["Pays où se trouve le désert d'Atacama", "le Chili"], ["Pays d'Amérique centrale doté d'un canal interocéanique", "le Panama"], ["Pays dont dépendent les îles Galápagos", "l'Équateur"]],
    [["Peintre mexicaine connue pour ses autoportraits", "Frida Kahlo"], ["Auteur colombien de Cent ans de solitude", "Gabriel García Márquez"], ["Révolutionnaire argentin devenu figure de la révolution cubaine", "Che Guevara"],
     ["Poète chilien, auteur du Canto general", "Pablo Neruda"], ["« Libertador » de plusieurs pays d'Amérique du Sud au XIXe siècle", "Simón Bolívar"]],
    [["Langue officielle du Brésil (pays non hispanophone)", "le portugais"], ["Langue amérindienne co-officielle au Paraguay", "le guarani"], ["Langue des Incas, encore parlée dans les Andes", "le quechua"], ["Langue co-officielle en Catalogne", "le catalan"]],
    [["Fête mexicaine des morts", "el Día de Muertos"], ["Fête nationale espagnole du 12 octobre", "el Día de la Hispanidad"], ["Fête de Pampelune en juillet, avec lâchers de taureaux", "los Sanfermines"], ["Fête valencienne de mars où l'on brûle des statues", "las Fallas"], ["Bataille de tomates à Buñol", "la Tomatina"]],
  ),
  "es-t-memoire": [
    ...vocab(
      [["la memoria histórica", "la mémoire historique"], ["el exilio", "l'exil"], ["la dictadura", "la dictature"], ["los desaparecidos", "les disparus"], ["la fosa común", "la fosse commune"],
       ["la Transición", "le passage de la dictature à la démocratie en Espagne"], ["el golpe de Estado", "le coup d'État"], ["la represión", "la répression"], ["la amnistía", "l'amnistie"], ["el olvido", "l'oubli"]],
      "espagnol",
    ),
    ...facts(
      [["Début de la guerre civile espagnole", "1936"], ["Fin de la guerre civile espagnole", "1939"], ["Mort de Franco", "1975"], ["Adoption de la Constitution démocratique espagnole", "1978"], ["Tentative de coup d'État du 23-F en Espagne", "1981"]],
      [["Dictateur chilien arrivé au pouvoir en 1973", "Augusto Pinochet"], ["Dictateur espagnol de 1939 à 1975", "Francisco Franco"], ["Général à la tête de la junte argentine en 1976", "Jorge Rafael Videla"],
       ["Roi qui a accompagné la Transition espagnole", "Juan Carlos Ier"], ["Président du gouvernement espagnol pendant la Transition (1976-1981)", "Adolfo Suárez"]],
      [["Loi espagnole de 2007 sur les victimes de la guerre et du franquisme", "la loi de mémoire historique"], ["Loi espagnole de 2022 qui remplace celle de 2007", "la loi de mémoire démocratique"],
       ["Loi espagnole de 1977 qui amnistie les crimes politiques", "la loi d'amnistie"], ["Texte de 1978 qui fonde la monarchie parlementaire espagnole", "la Constitution"]],
    ),
    claims([
      ["« Guernica » de Picasso représente le bombardement d'une ville basque en 1937.", true, "Bombardée par l'aviation allemande et italienne alliée de Franco."],
      ["Les Mères de la place de Mai manifestent à Buenos Aires pour leurs enfants disparus.", true, "Disparus de la dictature argentine (1976-1983)."],
      ["La dépouille de Franco repose toujours au Valle de los Caídos.", false, "Elle a été exhumée en 2019 et transférée dans un cimetière madrilène."],
      ["La loi d'amnistie de 1977 a permis de juger les crimes du franquisme.", false, "Elle les a au contraire amnistiés : c'est le « pacte de l'oubli »."],
    ]),
  ],
};
