/**
 * SES et philosophie : questions supplémentaires (notions, mécanismes,
 * auteurs, repères du programme, analyse de sujets), en complément des banques existantes.
 */
import { type Card, type Claim, type Generator, type Pair, cards, claims, pairs } from "./kit";

const bank = (c: Card[], v: Claim[] = []): Generator[] => (v.length ? [cards(c), claims(v)] : [cards(c)]);

// ───────────── SES ─────────────

const SES: Record<string, Generator[]> = {
  "ses-2-richesses": bank(
    [
      ["Le PIB est égal à…", "la somme des valeurs ajoutées (plus les impôts sur les produits, moins les subventions)", ["le chiffre d'affaires de toutes les entreprises", "la somme des salaires", "les exportations moins les importations"], "On évite ainsi de compter plusieurs fois les consommations intermédiaires."],
      ["Les deux grands facteurs de production sont…", "le travail et le capital", ["l'offre et la demande", "les prix et les salaires", "l'épargne et l'impôt"], "On y ajoute parfois les ressources naturelles."],
      ["La productivité du travail mesure…", "la production obtenue par travailleur ou par heure travaillée", ["le nombre d'heures travaillées", "le salaire moyen", "le taux de chômage"], "Elle augmente surtout grâce au progrès technique."],
      ["Les consommations intermédiaires sont…", "les biens et services détruits ou transformés pendant la production", ["les machines achetées par l'entreprise", "les salaires versés", "les profits"], "Exemple : la farine pour le boulanger."],
      ["Le capital fixe désigne…", "les biens de production utilisés pendant plusieurs cycles de production", ["les matières premières", "l'argent placé à la banque", "les salaires"], "Machines, bâtiments, logiciels."],
      ["Une administration publique produit surtout…", "des services non marchands", ["des biens vendus à leur coût de production", "des profits", "des actions en bourse"], "Éducation, police, justice… financés par l'impôt."],
      ["L'IDH (indice de développement humain) combine…", "santé (espérance de vie), éducation et revenu", ["PIB, chômage et inflation", "exportations et importations", "pollution et biodiversité"], "Créé par le PNUD en 1990."],
      ["Le PIB « en volume » (réel) est…", "corrigé de l'inflation", ["calculé en dollars", "toujours plus élevé que le PIB nominal", "le PIB par habitant"], "Il mesure l'évolution des quantités produites."],
      ["L'investissement, pour une entreprise, c'est…", "l'achat de capital fixe (machines, bâtiments…)", ["l'achat d'actions d'une autre entreprise uniquement", "le paiement des salaires", "le remboursement d'un crédit"], "Il permet de produire plus ou mieux."],
    ],
    [
      ["Le bénévolat est comptabilisé dans le PIB.", false, "Il n'y a pas de transaction ni de rémunération."],
      ["Une entreprise doit faire des bénéfices pour créer de la valeur ajoutée.", false, "La valeur ajoutée peut être positive même si l'entreprise est en perte."],
    ],
  ),
  "ses-2-marche": bank(
    [
      ["Sur un marché, l'offre est formulée par…", "les vendeurs (producteurs)", ["les acheteurs", "l'État uniquement", "les banques"], "La demande vient des acheteurs."],
      ["Une hausse du revenu des ménages déplace en général la courbe de demande d'un bien normal…", "vers la droite", ["vers la gauche", "pas du tout", "vers le bas uniquement"], "À chaque prix, on demande davantage."],
      ["Une baisse du coût des matières premières déplace la courbe d'offre…", "vers la droite", ["vers la gauche", "pas du tout", "vers le haut"], "Produire coûte moins cher : on offre plus à chaque prix."],
      ["Laquelle n'est pas une hypothèse de la concurrence pure et parfaite ?", "la présence d'un seul vendeur", ["l'atomicité du marché", "l'homogénéité du produit", "la transparence de l'information"], "Un seul vendeur, c'est un monopole."],
      ["Un monopole, c'est…", "un marché avec un seul offreur face à de nombreux demandeurs", ["un marché avec un seul acheteur", "un marché sans prix", "un accord entre États"], "Le monopsone a un seul acheteur."],
      ["Un prix plafond fixé en dessous du prix d'équilibre provoque…", "une pénurie", ["un excédent", "aucun effet", "une hausse de l'offre"], "La demande dépasse alors l'offre."],
      ["Une externalité positive, par exemple…", "un apiculteur dont les abeilles pollinisent les vergers voisins", ["une usine qui pollue une rivière", "un bruit de chantier", "une hausse des prix"], "Un effet favorable sur un tiers, sans contrepartie monétaire."],
      ["Une taxe sur un produit polluant vise à…", "faire payer le pollueur et réduire la pollution", ["augmenter la pollution", "baisser les prix", "subventionner les producteurs"], "On « internalise » l'externalité."],
    ],
    [
      ["Le prix d'équilibre égalise quantités offertes et demandées.", true, "Le marché « s'équilibre »."],
      ["Sur un marché en concurrence parfaite, une entreprise peut fixer seule son prix.", false, "Elle est « preneuse de prix »."],
    ],
  ),
  "ses-2-diplome": bank(
    [
      ["Le capital humain désigne…", "l'ensemble des connaissances et compétences d'un individu", ["l'argent placé par un ménage", "les machines d'une entreprise", "le nombre d'enfants"], "Notion développée par Gary Becker."],
      ["Selon le BIT, un chômeur est une personne…", "sans emploi, disponible et qui recherche activement un emploi", ["sans diplôme", "inscrite à France Travail uniquement", "qui travaille à temps partiel"], "Définition du Bureau international du travail."],
      ["Le déclassement désigne…", "le fait d'occuper un emploi en dessous de son niveau de diplôme", ["une promotion", "le chômage de longue durée", "une hausse de salaire"], "Il peut naître de l'augmentation du nombre de diplômés."],
      ["En moyenne, plus le niveau de diplôme est élevé…", "plus le salaire est élevé et le chômage faible", ["plus le chômage est élevé", "plus le salaire est faible", "rien ne change"], "Le diplôme protège sans tout garantir."],
      ["Le SMIC est…", "le salaire minimum légal en France", ["le salaire moyen", "un impôt", "une allocation chômage"], "Il est revalorisé au moins une fois par an."],
      ["Un CDD est…", "un contrat de travail à durée déterminée", ["un contrat à durée indéterminée", "un diplôme", "une aide sociale"], "Il fait partie des emplois dits « précaires »."],
    ],
    [
      ["Le taux de chômage des jeunes est plus élevé que celui des 25-49 ans.", true, "Insertion plus difficile et contrats plus courts."],
      ["Le salaire dépend uniquement du diplôme.", false, "Il dépend aussi de l'expérience, du secteur, du sexe, de la négociation…"],
    ],
  ),
  "ses-2-politique": bank(
    [
      ["Les députés sont élus au scrutin…", "majoritaire uninominal à deux tours", ["proportionnel intégral", "indirect", "par tirage au sort"], "Dans 577 circonscriptions."],
      ["Les députés européens sont élus en France au scrutin…", "proportionnel", ["majoritaire à deux tours", "indirect par les maires", "à vie"], "Sur des listes nationales."],
      ["Le Parlement français est composé…", "de l'Assemblée nationale et du Sénat", ["du président et du Premier ministre", "du Conseil d'État et de la Cour des comptes", "des maires et des préfets"], "Il est bicaméral."],
      ["L'abstention désigne…", "le fait de ne pas aller voter", ["le vote blanc", "le vote nul", "le refus de s'inscrire sur les listes uniquement"], "Le vote blanc est comptabilisé à part depuis 2014."],
      ["Un parti politique a pour fonction principale…", "de conquérir et d'exercer le pouvoir", ["de produire des biens", "de défendre les intérêts d'une profession uniquement", "de rendre la justice"], "Un groupe d'intérêt cherche plutôt à influencer."],
      ["Un référendum permet…", "aux citoyens de se prononcer directement sur une question", ["d'élire le président", "de nommer les juges", "de choisir les sénateurs"], "C'est un outil de démocratie directe."],
    ],
    [
      ["Les sénateurs sont élus au suffrage universel indirect.", true, "Par des grands électeurs, surtout des élus locaux."],
      ["En France, voter est obligatoire.", false, "C'est un droit, pas une obligation (contrairement à la Belgique)."],
    ],
  ),
  "ses-1-financement": bank(
    [
      ["L'autofinancement, c'est…", "le financement d'un investissement par ses propres ressources (épargne de l'entreprise)", ["un emprunt bancaire", "l'émission d'actions", "une subvention"], "Il évite de s'endetter."],
      ["Le financement direct (ou de marché) passe par…", "l'émission de titres (actions, obligations) sur les marchés financiers", ["un crédit bancaire", "l'épargne propre", "la création de monnaie par la banque centrale"], "Le financement indirect passe par les banques."],
      ["Une obligation est…", "un titre de créance qui rapporte un intérêt", ["un titre de propriété d'une entreprise", "un billet de banque", "une taxe"], "L'action, elle, est un titre de propriété qui peut rapporter un dividende."],
      ["Un agent a une capacité de financement quand…", "son épargne dépasse son investissement", ["il emprunte plus qu'il n'épargne", "il est au chômage", "il paie des impôts"], "Les ménages sont souvent dans ce cas."],
      ["La BCE a pour mission principale…", "la stabilité des prix dans la zone euro", ["l'emploi en France", "la collecte des impôts", "le financement des entreprises"], "Objectif d'inflation proche de 2 %."],
      ["L'inflation, c'est…", "la hausse générale et durable des prix", ["la baisse du chômage", "la hausse du PIB", "la baisse des taux d'intérêt"], "Elle réduit le pouvoir d'achat de la monnaie."],
      ["La monnaie scripturale, c'est…", "la monnaie inscrite sur les comptes bancaires", ["les pièces", "les billets", "l'or"], "Elle représente l'essentiel de la masse monétaire."],
    ],
    [
      ["Les banques commerciales créent de la monnaie en accordant des crédits.", true, "« Les crédits font les dépôts »."],
      ["Le taux d'intérêt est le prix de l'argent emprunté.", true, "Il rémunère le prêteur."],
    ],
  ),
  "ses-1-socialisation": bank(
    [
      ["La socialisation est…", "le processus par lequel on intériorise les normes et valeurs de la société", ["l'adhésion à un parti politique", "la vie en entreprise", "le fait d'avoir des amis"], "Elle dure toute la vie."],
      ["Une norme est…", "une règle de conduite dans une société", ["un idéal abstrait", "un diplôme", "une loi uniquement"], "Les valeurs sont des idéaux (liberté, égalité…)."],
      ["La socialisation anticipatrice consiste à…", "adopter les normes d'un groupe qu'on souhaite rejoindre", ["oublier ses valeurs d'enfance", "refuser toute norme", "imiter ses parents"], "Concept de Robert Merton."],
      ["La socialisation différenciée selon le genre, c'est…", "le fait que filles et garçons ne soient pas socialisés de la même manière", ["l'égalité totale des éducations", "une socialisation réservée aux filles", "la socialisation à l'école uniquement"], "Jouets, attentes des parents, orientations scolaires…"],
      ["Une sanction peut être…", "positive (récompense) ou négative (punition)", ["seulement juridique", "toujours négative", "uniquement financière"], "Elle encourage le respect des normes."],
    ],
    [
      ["Les médias et les réseaux sociaux participent à la socialisation.", true, "Ce sont des instances de socialisation."],
      ["Deux enfants d'une même famille sont socialisés exactement de la même façon.", false, "Rang de naissance, sexe, pairs… varient."],
    ],
  ),
  "ses-1-opinion-vote": bank(
    [
      ["La méthode des quotas, utilisée par les sondeurs, consiste à…", "reproduire dans l'échantillon la structure de la population (âge, sexe, profession…)", ["interroger toute la population", "tirer les personnes au sort sans critère", "n'interroger que des volontaires"], "L'échantillon doit être représentatif."],
      ["Une « variable lourde » du vote est…", "un facteur durable comme la religion ou la profession", ["la météo le jour du vote", "un débat télévisé", "un slogan"], "Le vote était longtemps expliqué par ces appartenances."],
      ["Le vote sur enjeux, c'est…", "voter selon les thèmes de l'élection et les propositions des candidats", ["voter comme ses parents", "s'abstenir", "voter blanc"], "Il traduit un électeur plus stratège."],
      ["La volatilité électorale désigne…", "le fait de changer de vote d'une élection à l'autre", ["le refus de voter", "le vote obligatoire", "le vote par correspondance"], "Elle a augmenté depuis les années 1980."],
      ["L'abstention intermittente, c'est…", "voter à certaines élections et pas à d'autres", ["ne jamais voter", "voter toujours", "voter blanc systématiquement"], "C'est la forme d'abstention la plus fréquente."],
    ],
    [
      ["L'opinion publique peut être mesurée par des sondages.", true, "Avec une marge d'erreur."],
      ["Les sondages n'ont aucune influence sur les électeurs.", false, "Ils peuvent influencer (vote utile, mobilisation…)."],
    ],
  ),
  "ses-1-risques": bank(
    [
      ["La mutualisation des risques consiste à…", "répartir le coût des sinistres de quelques-uns sur l'ensemble des assurés", ["supprimer tous les risques", "faire payer uniquement les victimes", "interdire les activités risquées"], "C'est le principe de l'assurance."],
      ["L'aléa moral désigne…", "le fait qu'un assuré prenne plus de risques parce qu'il est couvert", ["un risque naturel", "une maladie grave", "une baisse de revenu"], "La franchise sert à le limiter."],
      ["La sélection adverse (anti-sélection), c'est…", "le fait que les personnes les plus risquées s'assurent davantage", ["le refus d'assurer les jeunes", "la sélection des meilleurs élèves", "un choix de la banque centrale"], "Elle vient d'une asymétrie d'information."],
      ["La logique d'assistance consiste à…", "aider les personnes dans le besoin, sans cotisation préalable", ["verser des prestations en échange de cotisations", "faire payer le risque à chacun", "interdire les aides"], "Exemple : le RSA."],
      ["La CSG est…", "un impôt qui finance la protection sociale", ["une prestation sociale", "une assurance privée", "un salaire minimum"], "Contribution sociale généralisée, créée en 1990."],
      ["Les prestations d'assurance sociale sont financées surtout par…", "les cotisations sociales", ["les dons", "les loteries", "les droits de douane"], "Logique « bismarckienne »."],
    ],
    [
      ["La Sécurité sociale française couvre la maladie, la vieillesse et la famille.", true, "Ainsi que les accidents du travail."],
      ["Une assurance privée est obligatoire pour conduire une voiture.", true, "L'assurance responsabilité civile automobile est obligatoire."],
    ],
  ),
  "ses-t-croissance": bank(
    [
      ["La productivité globale des facteurs (PGF) correspond à…", "la part de la croissance qui n'est expliquée ni par le travail ni par le capital", ["le nombre d'heures travaillées", "le stock de capital", "le PIB par habitant"], "Elle reflète surtout le progrès technique (« résidu » de Solow)."],
      ["Pour Schumpeter, l'innovation provoque…", "une « destruction créatrice »", ["la fin de la croissance", "une baisse de la productivité", "la stagnation des prix"], "De nouvelles activités remplacent les anciennes."],
      ["La croissance endogène signifie que…", "le progrès technique est produit par l'activité économique elle-même (recherche, éducation…)", ["la croissance vient de l'étranger", "la croissance est due au hasard", "l'État n'a aucun rôle"], "D'où l'importance des investissements en R&D et capital humain."],
      ["Les institutions, comme les droits de propriété, favorisent la croissance car…", "elles sécurisent les investissements et les innovations", ["elles augmentent les impôts", "elles suppriment la concurrence", "elles baissent les salaires"], "Un innovateur doit pouvoir profiter de son invention (brevets)."],
      ["La soutenabilité forte considère que…", "le capital naturel ne peut pas être remplacé par d'autres capitaux", ["le capital naturel peut toujours être remplacé", "la croissance n'a aucun impact écologique", "il faut supprimer toute production"], "La soutenabilité faible admet la substituabilité."],
      ["Les rendements décroissants du capital signifient que…", "chaque unité de capital supplémentaire rapporte de moins en moins", ["plus on investit, plus chaque machine rapporte", "le capital ne s'use jamais", "le travail est inutile"], "Sans progrès technique, la croissance finit par ralentir."],
      ["Le brevet donne à l'inventeur…", "un monopole temporaire d'exploitation", ["une prime de l'État", "le droit de copier les autres", "une exonération d'impôts à vie"], "En général 20 ans."],
    ],
    [
      ["La croissance économique se mesure par le taux de variation du PIB réel.", true, "D'une année sur l'autre."],
      ["Le progrès technique peut aider à réduire certains dommages écologiques.", true, "Énergies renouvelables, efficacité énergétique… mais avec un risque d'effet rebond."],
    ],
  ),
  "ses-t-chomage": bank(
    [
      ["Le taux de chômage se calcule…", "en divisant le nombre de chômeurs par la population active", ["en divisant les chômeurs par la population totale", "en divisant les actifs par les inactifs", "par le nombre d'offres d'emploi"], "Population active = actifs occupés + chômeurs."],
      ["Le « halo » du chômage regroupe…", "des personnes sans emploi qui souhaitent travailler mais ne remplissent pas tous les critères du BIT", ["les chômeurs de longue durée", "les retraités", "les étudiants qui travaillent"], "Par exemple, non disponibles tout de suite."],
      ["Le chômage frictionnel correspond…", "au temps nécessaire pour passer d'un emploi à un autre", ["à une crise économique", "à un salaire trop élevé", "aux délocalisations"], "Il existe même en période de plein emploi."],
      ["Pour Keynes, le chômage s'explique surtout par…", "une demande globale insuffisante", ["des salaires trop élevés", "la paresse des chômeurs", "un excès d'épargne publique"], "Les entreprises anticipent de faibles ventes et embauchent peu."],
      ["Le salaire d'efficience, c'est…", "un salaire supérieur à l'équilibre, versé pour motiver et fidéliser les salariés", ["le SMIC", "un salaire versé à la tâche", "un salaire plus bas que la productivité"], "Il peut contribuer au chômage."],
      ["Le chômage structurel vient notamment…", "d'un décalage entre les qualifications demandées et offertes", ["d'une baisse temporaire de la demande", "des vacances scolaires", "des changements d'emploi volontaires"], "Problème d'appariement."],
      ["Une baisse des cotisations sociales sur les bas salaires vise à…", "réduire le coût du travail peu qualifié pour favoriser l'embauche", ["augmenter le chômage", "financer la Sécurité sociale", "augmenter les salaires nets uniquement"], "Politique dite « de l'offre »."],
    ],
    [
      ["Un étudiant qui ne cherche pas d'emploi est compté comme chômeur.", false, "Il est inactif."],
      ["Le chômage de longue durée concerne les personnes au chômage depuis plus d'un an.", true, "Il fragilise l'employabilité."],
    ],
  ),
  "ses-t-commerce": bank(
    [
      ["Selon Ricardo, un pays a intérêt à se spécialiser dans la production où il a…", "un avantage comparatif", ["un avantage absolu dans tous les domaines", "le plus de travailleurs", "le plus de matières premières"], "Même s'il est moins efficace partout, il gagne à l'échange."],
      ["Le modèle HOS explique la spécialisation par…", "les dotations en facteurs de production (travail, capital)", ["le climat uniquement", "la taille des entreprises", "les goûts des consommateurs"], "Un pays riche en travail exporte des biens intensifs en travail."],
      ["Le commerce intra-branche, c'est…", "l'échange de produits similaires entre pays (voitures contre voitures)", ["l'échange de matières premières contre produits finis", "le commerce interne d'une entreprise", "le troc"], "Il s'explique par la différenciation des produits."],
      ["Un droit de douane est…", "une taxe sur les produits importés", ["une subvention aux exportations", "une limite en quantité", "une norme sanitaire"], "Instrument protectionniste."],
      ["Un quota d'importation est…", "une limite à la quantité de produits importés", ["une taxe", "un accord de libre-échange", "une monnaie"], "Autre instrument protectionniste."],
      ["L'OMC a pour objectif…", "de libéraliser et réguler le commerce mondial", ["de fixer les taux de change", "de financer le développement", "de lutter contre le chômage"], "Créée en 1995, elle règle aussi les différends commerciaux."],
      ["Une chaîne de valeur mondiale, c'est…", "la fragmentation de la production d'un bien entre plusieurs pays", ["un réseau de magasins", "une Bourse mondiale", "un accord douanier"], "Conception ici, assemblage là-bas…"],
    ],
    [
      ["Le libre-échange a aussi des perdants dans chaque pays.", true, "Secteurs concurrencés, travailleurs peu qualifiés…"],
      ["Le protectionnisme éducateur (List) vise à protéger temporairement les industries naissantes.", true, "Le temps qu'elles deviennent compétitives."],
    ],
  ),
  "ses-t-mobilite": bank(
    [
      ["La mobilité intergénérationnelle compare…", "la position sociale des enfants à celle de leurs parents", ["deux moments de la carrière d'une personne", "deux pays", "deux entreprises"], "La mobilité intragénérationnelle porte sur une même personne."],
      ["Une table de destinée se lit…", "en partant de l'origine sociale (catégorie du père ou des parents)", ["en partant de la position actuelle des fils", "en colonne uniquement", "de bas en haut"], "Que deviennent les enfants issus de telle catégorie ?"],
      ["Une table de recrutement se lit…", "en partant de la position sociale actuelle", ["en partant de l'origine sociale", "selon le diplôme", "selon le revenu"], "D'où viennent les membres de telle catégorie ?"],
      ["La mobilité structurelle est…", "la mobilité due à l'évolution de la structure des emplois", ["la mobilité choisie", "la mobilité géographique", "la mobilité due au hasard"], "Exemple : la baisse du nombre d'agriculteurs."],
      ["Pour Bourdieu, la réussite scolaire dépend notamment…", "du capital culturel transmis par la famille", ["uniquement du talent", "du hasard", "du capital économique seulement"], "La reproduction sociale passe par l'école."],
      ["Le paradoxe d'Anderson souligne que…", "un diplôme plus élevé que celui de ses parents ne garantit pas une position sociale plus élevée", ["les diplômes n'ont aucune valeur", "tout le monde progresse socialement", "les parents réussissent mieux que leurs enfants"], "En raison de la hausse générale du niveau de diplôme."],
      ["La fluidité sociale mesure…", "l'égalité des chances d'accès aux positions sociales, indépendamment des changements de structure", ["le nombre de déménagements", "le revenu moyen", "la mobilité géographique"], "On parle aussi de mobilité nette."],
    ],
    [
      ["La mobilité sociale observée peut augmenter sans que l'égalité des chances progresse.", true, "Si elle vient seulement des changements de structure."],
      ["Le déclassement intergénérationnel n'existe pas.", false, "Certains enfants occupent une position inférieure à celle de leurs parents."],
    ],
  ),
};

// ───────────── Philosophie ─────────────

/** Repères du programme de philosophie (distinctions conceptuelles). */
const REPERES: Pair[] = [
  ["« en fait » / « en droit »", "ce qui est réellement / ce qui doit être ou est légitime"],
  ["« légal » / « légitime »", "conforme à la loi / conforme à ce qui est juste"],
  ["« persuader » / « convaincre »", "faire adhérer par les sentiments / faire adhérer par des raisons"],
  ["« croire » / « savoir »", "tenir pour vrai sans preuve suffisante / connaître de façon justifiée"],
  ["« objectif » / « subjectif »", "qui vaut indépendamment du sujet / qui dépend du point de vue du sujet"],
  ["« contingent » / « nécessaire »", "qui pourrait être autrement / qui ne peut pas être autrement"],
  ["« expliquer » / « comprendre »", "rendre compte par des causes / saisir le sens, les intentions"],
  ["« origine » / « fondement »", "ce d'où une chose vient dans le temps / ce qui la justifie en droit"],
  ["« universel » / « particulier »", "qui vaut pour tous sans exception / qui ne vaut que pour certains"],
  ["« absolu » / « relatif »", "qui ne dépend de rien d'autre / qui dépend d'autre chose"],
  ["« obligation » / « contrainte »", "ce qui s'impose à la conscience / ce qui s'impose par la force"],
  ["« immédiat » / « médiat »", "sans intermédiaire / par l'intermédiaire d'autre chose"],
  ["« transcendant » / « immanent »", "qui dépasse et se situe au-delà / qui est contenu à l'intérieur"],
  ["« abstrait » / « concret »", "séparé par la pensée du réel / perçu dans le réel"],
  ["« exemple » / « preuve »", "un cas qui illustre / ce qui établit la vérité"],
  ["« intuitif » / « discursif »", "saisi d'un seul regard / atteint par un raisonnement en étapes"],
  ["« public » / « privé »", "qui concerne tous / qui concerne l'individu"],
  ["« idéal » / « réel »", "ce qui est conçu comme parfait / ce qui existe effectivement"],
  ["« en acte » / « en puissance »", "réalisé effectivement / seulement possible, virtuel"],
  ["« principe » / « conséquence »", "ce dont on part / ce qui en découle"],
];

/** Sujets de dissertation et notion principale du programme. */
const SUJETS: Pair[] = [
  ["Peut-on se connaître soi-même ?", "la conscience"], ["Sommes-nous responsables de ce dont nous n'avons pas conscience ?", "l'inconscient"],
  ["Être libre, est-ce faire ce que l'on veut ?", "la liberté"], ["Le bonheur est-il le but de la vie ?", "le bonheur"],
  ["Peut-on être heureux sans le savoir ?", "le bonheur"], ["Faut-il toujours dire la vérité ?", "la vérité"],
  ["La science peut-elle tout expliquer ?", "la science"], ["Une œuvre d'art doit-elle être belle ?", "l'art"],
  ["Le travail libère-t-il l'homme ?", "le travail"], ["La technique nous rend-elle plus libres ?", "la technique"],
  ["Peut-on désobéir aux lois ?", "l'État"], ["Est-il juste d'obéir aux lois ?", "la justice"],
  ["Le langage trahit-il la pensée ?", "le langage"], ["Peut-on échapper au temps ?", "le temps"],
  ["Faut-il agir par devoir ?", "le devoir"], ["La raison peut-elle tout connaître ?", "la raison"],
  ["Peut-on vivre sans religion ?", "la religion"], ["Que doit-on à autrui ?", "le devoir"],
  ["L'histoire a-t-elle un sens ?", "l'histoire"], ["La nature est-elle un modèle ?", "la nature"],
];

const PHILO: Record<string, Generator[]> = {
  "philo-t-methode": [
    ...pairs(REPERES, {
      ask: (a) => `Repère du programme : que distingue le couple ${a} ?`,
      reverse: (b) => `Quel couple de repères oppose : ${b} ?`,
      explain: (a, b) => `${a} : ${b}.`,
    }),
    ...pairs(SUJETS, {
      ask: (a) => `Sujet : « ${a} » Notion principale en jeu ?`,
      explain: (a, b) => `« ${a} » porte d'abord sur ${b}, même s'il croise d'autres notions.`,
    }),
    cards([
      ["Une problématique de dissertation, c'est…", "la question qui fait apparaître la difficulté (le paradoxe) cachée dans le sujet", ["le résumé du plan", "la définition d'un mot", "la conclusion"], "Elle justifie que le sujet mérite d'être traité."],
      ["Dans une dissertation, un exemple sert à…", "illustrer et appuyer un argument, puis être analysé", ["remplacer l'argument", "raconter une anecdote personnelle", "allonger la copie"], "Un exemple seul ne prouve rien."],
      ["Dans l'explication de texte, il faut d'abord dégager…", "la thèse de l'auteur et le problème auquel il répond", ["la biographie de l'auteur", "toutes les fautes du texte", "son avis personnel"], "Puis suivre le mouvement de l'argumentation."],
      ["Une citation d'auteur dans une copie doit…", "être expliquée et mise au service de l'argument", ["remplacer le raisonnement", "être la plus longue possible", "être placée en conclusion uniquement"], "Ce n'est pas un argument d'autorité."],
    ]),
  ],
  "philo-t-conscience": bank([
    ["L'exemple du lapsus est souvent utilisé pour montrer…", "qu'une part de notre vie psychique échappe à la conscience", ["que nous maîtrisons parfaitement nos paroles", "que le langage est inutile", "que les rêves n'ont pas de sens"], "Freud, Psychopathologie de la vie quotidienne."],
    ["Pour Sartre, invoquer l'inconscient pour excuser ses actes relève…", "de la mauvaise foi", ["de la lucidité", "de la sagesse", "du devoir"], "Nous restons responsables de ce que nous faisons."],
    ["Dire que la conscience est « intentionnelle » signifie qu'elle est…", "toujours tournée vers un objet", ["toujours morale", "toujours inconsciente", "toujours volontaire"], "Husserl : toute conscience est conscience de quelque chose."],
    ["Un argument classique contre la transparence de la conscience à elle-même est…", "que nous pouvons nous tromper sur nos propres motifs", ["que nous pensons tout le temps", "que les animaux pensent", "que la conscience est éternelle"], "On peut croire agir par générosité et agir par vanité."],
  ]),
  "philo-t-liberte": bank([
    ["L'exemple de la pierre qui croirait tomber librement est donné par Spinoza pour montrer…", "que l'illusion du libre arbitre vient de l'ignorance des causes", ["que les pierres pensent", "que la liberté est totale", "que la gravité n'existe pas"], "Lettre à Schuller."],
    ["Pour Kant, être libre, c'est…", "obéir à la loi morale que la raison se donne (autonomie)", ["faire tout ce qu'on désire", "obéir à ses passions", "n'avoir aucune règle"], "L'hétéronomie, c'est obéir à une loi venue de l'extérieur."],
    ["Pour Sartre, l'homme ne peut pas…", "ne pas choisir", ["choisir", "être responsable", "exister avant son essence"], "Même ne pas choisir est un choix."],
    ["La liberté politique, selon Montesquieu, consiste à…", "pouvoir faire ce que les lois permettent", ["faire tout ce que l'on veut", "désobéir aux lois", "ne pas payer d'impôts"], "Elle suppose des lois et des pouvoirs séparés."],
  ]),
  "philo-t-verite": bank([
    ["Le « malin génie » de Descartes est une hypothèse destinée à…", "pousser le doute jusqu'à son extrême", ["prouver l'existence du diable", "expliquer les rêves", "définir la morale"], "Même les mathématiques pourraient être fausses s'il me trompait."],
    ["Une vérité « de raison » (Leibniz) est…", "nécessaire, son contraire est impossible", ["contingente", "fondée sur l'expérience", "une simple opinion"], "Exemple : 2 + 2 = 4. Les vérités de fait sont contingentes."],
    ["Dans l'allégorie de la caverne, sortir de la caverne représente…", "l'accès à la connaissance vraie par la philosophie", ["le passage de la vie à la mort", "un voyage géographique", "l'entrée dans la politique"], "Platon, République, livre VII."],
    ["Le scepticisme antique propose de…", "suspendre son jugement (épochè)", ["tout croire", "affirmer des dogmes", "faire confiance aux sens"], "Pyrrhon."],
  ]),
  "philo-t-devoir": bank([
    ["Pour Kant, mentir est interdit même pour sauver un ami car…", "la maxime du mensonge ne peut pas devenir une loi universelle", ["le mensonge est puni par la loi", "l'ami ne le mérite pas", "cela rapporte moins"], "Débat avec Benjamin Constant (1797)."],
    ["Une action « conforme au devoir » mais faite par intérêt a, selon Kant…", "une valeur légale mais pas morale", ["une valeur morale supérieure", "aucune conséquence", "plus de mérite"], "L'exemple du marchand honnête par intérêt."],
    ["L'utilitarisme juge une action…", "à ses conséquences sur le bonheur du plus grand nombre", ["à l'intention de l'agent", "à la tradition", "au plaisir de celui qui agit seul"], "Bentham, Mill."],
    ["Antigone, qui enterre son frère malgré l'interdit de Créon, illustre…", "le conflit entre loi des hommes et loi morale (ou divine)", ["l'obéissance absolue", "le bonheur", "le progrès technique"], "Tragédie de Sophocle."],
  ]),
  "philo-t-bonheur": bank([
    ["Pour Épicure, les désirs naturels et nécessaires sont…", "ceux qu'il faut satisfaire (manger, boire, s'abriter)", ["ceux qu'il faut supprimer", "les désirs de gloire", "les désirs de richesse"], "Les désirs vains (gloire, richesse) doivent être écartés."],
    ["Pour les stoïciens, le bonheur passe par…", "l'acceptation de ce qui ne dépend pas de nous", ["la recherche de tous les plaisirs", "la richesse", "la célébrité"], "Épictète, Manuel."],
    ["Pour Pascal, le « divertissement » consiste à…", "nous détourner de penser à notre condition mortelle", ["être heureux en pensant à soi", "travailler beaucoup", "philosopher"], "Pensées."],
    ["Pour Aristote, le bonheur (eudaimonia) est…", "une activité de l'âme conforme à la vertu, sur toute une vie", ["un plaisir passager", "un état reçu par hasard", "la richesse"], "Éthique à Nicomaque."],
  ]),
  "philo-t-etat-justice": bank([
    ["Pour Hobbes, les hommes sortent de l'état de nature…", "par un contrat qui confie le pouvoir à un souverain absolu", ["par la révolution", "en supprimant l'État", "par la religion"], "Léviathan (1651)."],
    ["Le « voile d'ignorance » de Rawls sert à…", "choisir des principes de justice sans connaître sa future place dans la société", ["cacher les lois", "ignorer la morale", "tirer les juges au sort"], "Théorie de la justice (1971)."],
    ["Pour Aristote, la justice distributive répartit les biens…", "selon le mérite (égalité proportionnelle)", ["de façon strictement égale", "au hasard", "selon la force"], "La justice commutative, elle, vise l'égalité stricte dans les échanges."],
    ["L'exemple de Rosa Parks (1955) illustre…", "la désobéissance civile face à une loi injuste", ["le respect absolu de la loi", "la violence révolutionnaire", "l'état de nature"], "Elle refuse de céder sa place dans un bus de Montgomery."],
  ]),
  "philo-t-art": bank([
    ["Pour Kant, le jugement de goût prétend à l'universalité car…", "on attend des autres qu'ils partagent notre jugement sur le beau", ["le beau est défini par une règle", "tout le monde a les mêmes goûts", "l'art est utile"], "« Le beau est ce qui plaît universellement sans concept »."],
    ["La différence classique entre l'artiste et l'artisan tient au fait que l'artiste…", "crée une œuvre singulière sans règle fixée d'avance", ["fabrique des objets utiles en série", "suit un mode d'emploi", "ne pense jamais"], "L'artisan produit selon des règles pour un usage."],
    ["La catharsis chez Aristote désigne…", "la purgation des passions par la tragédie", ["l'imitation de la nature", "le génie", "le sublime"], "Le spectateur ressent terreur et pitié et en est purifié."],
    ["L'exemple de « Fontaine » de Duchamp (1917) pose la question…", "de ce qui fait qu'un objet est une œuvre d'art", ["de la beauté naturelle", "de l'utilité de l'art", "de la technique de la peinture"], "Un urinoir signé et exposé."],
  ]),
  "philo-t-technique-travail": bank([
    ["Dans le mythe de Prométhée (Protagoras de Platon), l'homme reçoit…", "le feu et les arts pour compenser sa faiblesse naturelle", ["des griffes et des ailes", "l'immortalité", "la richesse"], "Épiméthée avait tout distribué aux animaux."],
    ["Pour Marx, le travail aliéné rend l'ouvrier étranger…", "au produit de son travail, à son activité et à lui-même", ["à sa famille seulement", "à son pays", "à l'argent"], "Manuscrits de 1844."],
    ["Pour Hegel, dans la dialectique du maître et de l'esclave, c'est…", "l'esclave qui accède à la conscience de soi par le travail", ["le maître qui travaille", "l'esclave qui devient paresseux", "le maître qui se libère par la guerre"], "Le maître dépend du travail de l'esclave."],
    ["Le « principe responsabilité » de Hans Jonas demande…", "de penser aux conséquences de la technique pour les générations futures", ["d'arrêter toute technique", "d'accélérer le progrès sans limite", "de ne penser qu'au présent"], "Une éthique tournée vers l'avenir."],
  ]),
  "philo-t-science-raison": bank([
    ["L'induction consiste à…", "généraliser à partir de cas particuliers observés", ["déduire une conclusion nécessaire de prémisses", "deviner au hasard", "réfuter une théorie"], "Le problème de l'induction est soulevé par Hume."],
    ["La déduction consiste à…", "tirer une conclusion nécessaire de prémisses", ["généraliser à partir d'observations", "faire une expérience", "imaginer une hypothèse"], "Exemple : le syllogisme."],
    ["Pour Popper, une théorie scientifique doit être…", "réfutable par l'expérience", ["définitivement vérifiée", "acceptée par tous", "infalsifiable"], "La psychanalyse et le marxisme lui semblaient infalsifiables."],
    ["L'exemple du cygne noir illustre…", "qu'aucune accumulation d'observations ne prouve définitivement une loi universelle", ["que tous les cygnes sont blancs", "que l'observation est inutile", "que la science est fausse"], "« Tous les cygnes sont blancs » tombe dès qu'on voit un cygne noir."],
  ]),
  "philo-t-langage-temps": bank([
    ["Un énoncé performatif (Austin) est un énoncé qui…", "réalise une action par le fait même d'être dit", ["décrit le monde", "pose une question", "exprime une émotion"], "« Je vous déclare unis par les liens du mariage »."],
    ["Pour Saussure, le signe linguistique est arbitraire car…", "il n'y a pas de lien naturel entre le mot et ce qu'il désigne", ["les mots changent tous les jours", "chacun invente sa langue", "il imite les sons de la nature"], "« Arbre », « tree », « Baum »…"],
    ["Pour saint Augustin, le temps…", "existe dans l'esprit : mémoire du passé, attention au présent, attente du futur", ["n'existe que dans les horloges", "est une illusion totale", "est un objet mesurable comme l'espace"], "Confessions, livre XI : « Qu'est-ce donc que le temps ? »"],
    ["Bergson distingue le temps mesuré des horloges et…", "la durée vécue par la conscience", ["le temps des étoiles", "l'éternité", "le temps des machines"], "La durée est qualitative, le temps mesuré quantitatif."],
  ]),
  "philo-t-auteurs": [
    ...pairs(
      [
        ["Le Banquet", "Platon"], ["Éthique à Nicomaque", "Aristote"], ["Lettre à Ménécée", "Épicure"], ["Manuel", "Épictète"], ["Confessions", "saint Augustin"],
        ["Le Prince", "Machiavel"], ["Méditations métaphysiques", "Descartes"], ["Léviathan", "Hobbes"], ["Pensées", "Pascal"], ["Éthique", "Spinoza"],
        ["Discours sur l'origine de l'inégalité", "Rousseau"], ["Critique de la raison pure", "Kant"], ["La Généalogie de la morale", "Nietzsche"], ["L'Évolution créatrice", "Bergson"],
        ["L'existentialisme est un humanisme", "Sartre"], ["Condition de l'homme moderne", "Hannah Arendt"], ["Le Mythe de Sisyphe", "Camus"], ["La Formation de l'esprit scientifique", "Bachelard"],
      ],
      { ask: (a) => `Qui a écrit « ${a} » ?`, reverse: (b) => `Quelle œuvre a écrite ${b} ?`, claim: (a, b) => `« ${a} » est une œuvre de ${b}.`, explain: (a, b) => `« ${a} » : ${b}.` },
    ),
  ],
};

export const SES_PHILO_PLUS: Record<string, Generator[]> = { ...SES, ...PHILO };
