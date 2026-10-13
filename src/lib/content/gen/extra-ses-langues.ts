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
const facts = (items: readonly Pair[]) =>
  pairs(items, { ask: (a) => `${a} ?`, claim: (a, b) => `${a} : ${b}.`, explain: (a, b) => `${a} : ${b}.` });

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
  "ses-t-croissance": ses(
    [["croissance économique", "l'augmentation durable de la production d'un pays"], ["PIB", "la somme des valeurs ajoutées produites sur un territoire en un an"], ["productivité globale des facteurs", "la part de la croissance non expliquée par la hausse du capital et du travail"],
     ["progrès technique", "l'ensemble des innovations qui améliorent la production"], ["innovation de procédé", "une nouvelle façon de produire"], ["innovation de produit", "la mise sur le marché d'un bien ou service nouveau"],
     ["destruction créatrice", "selon Schumpeter, le remplacement d'activités anciennes par des innovations"], ["capital humain", "l'ensemble des savoirs et compétences d'un individu"], ["croissance endogène", "une croissance auto-entretenue par l'innovation et le capital humain"],
     ["soutenabilité forte", "l'idée que le capital naturel n'est pas substituable"]],
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
  "en-2-axes": vocab(
    [["to commute", "faire la navette (domicile-travail)"], ["a household", "un foyer"], ["a landmark", "un monument, un lieu emblématique"], ["to fit in", "s'intégrer"], ["a sibling", "un frère ou une sœur"],
     ["a breakthrough", "une avancée majeure"], ["to raise awareness", "sensibiliser"], ["a role model", "un modèle (à suivre)"], ["a hardship", "une épreuve, une difficulté"], ["to cope with", "faire face à"],
     ["a skill", "une compétence"], ["to bully", "harceler"], ["a heritage", "un patrimoine, un héritage"], ["a wildlife reserve", "une réserve naturelle"], ["a newcomer", "un nouvel arrivant"]],
    "anglais",
  ),
  "en-1-civilisation": facts(
    [["Capitale de l'Australie", "Canberra"], ["Capitale du Canada", "Ottawa"], ["Première femme Premier ministre britannique", "Margaret Thatcher"], ["Président américain de l'abolition de l'esclavage", "Abraham Lincoln"],
     ["Auteur du discours « I have a dream »", "Martin Luther King"], ["Année de la Déclaration d'indépendance américaine", "1776"], ["Fête américaine du quatrième jeudi de novembre", "Thanksgiving"], ["Militante du boycott des bus de Montgomery", "Rosa Parks"],
     ["Premier président noir des États-Unis", "Barack Obama"], ["Pays dont la capitale est Dublin", "l'Irlande"], ["Nom du Parlement britannique", "Westminster"], ["Nom du système de santé public britannique", "le NHS"],
     ["Assemblée qui avec le Sénat forme le Congrès américain", "la Chambre des représentants"], ["Nation du Royaume-Uni dont la capitale est Cardiff", "le pays de Galles"], ["Dramaturge auteur de Hamlet", "Shakespeare"]],
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
    [["Capitale de l'Argentine", "Buenos Aires"], ["Capitale du Pérou", "Lima"], ["Capitale de la Colombie", "Bogotá"], ["Capitale du Chili", "Santiago"], ["Capitale de Cuba", "La Havane"],
     ["Pays où se trouve le Machu Picchu", "le Pérou"], ["Peintre mexicaine connue pour ses autoportraits", "Frida Kahlo"], ["Auteur colombien de Cent ans de solitude", "Gabriel García Márquez"],
     ["Révolutionnaire argentin devenu figure de la révolution cubaine", "Che Guevara"], ["Pays le plus peuplé du monde hispanophone", "le Mexique"], ["Langue officielle du Brésil (pays non hispanophone)", "le portugais"], ["Fête mexicaine des morts", "el Día de Muertos"]],
  ),
  "es-t-memoire": [
    ...vocab(
      [["la memoria histórica", "la mémoire historique"], ["el exilio", "l'exil"], ["la dictadura", "la dictature"], ["los desaparecidos", "les disparus"], ["la fosa común", "la fosse commune"],
       ["la Transición", "le passage de la dictature à la démocratie en Espagne"], ["el golpe de Estado", "le coup d'État"], ["la represión", "la répression"], ["la amnistía", "l'amnistie"], ["el olvido", "l'oubli"]],
      "espagnol",
    ),
    ...facts(
      [["Début de la guerre civile espagnole", "1936"], ["Mort de Franco", "1975"], ["Adoption de la Constitution démocratique espagnole", "1978"], ["Tableau de Picasso sur le bombardement d'une ville basque", "Guernica"],
       ["Dictateur chilien arrivé au pouvoir en 1973", "Augusto Pinochet"], ["Mères qui manifestent à Buenos Aires pour leurs enfants disparus", "les Mères de la place de Mai"], ["Loi espagnole de 2007 sur les victimes de la guerre et du franquisme", "la loi de mémoire historique"]],
    ),
  ],
};
