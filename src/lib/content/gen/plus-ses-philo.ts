/**
 * SES et philosophie : questions supplémentaires (notions, mécanismes,
 * auteurs, repères du programme, analyse de sujets), en complément des banques existantes.
 */
import type { Difficulty } from "@/lib/types";
import { type Card, type Claim, type Generator, type Pair, cards, claims, mcq, pairs, pick, withFact } from "./kit";

const bank = (c: Card[], v: Claim[] = []): Generator[] => (v.length ? [cards(c), claims(v)] : [cards(c)]);
/** Cartes de niveau bac : chaque carte porte sa difficulté (2 ou 3), les cartes mémoire sont conservées. */
const harder = (items: ReadonlyArray<readonly [Difficulty, ...Card]>): Generator =>
  Object.assign(
    (r: Parameters<Generator>[0]) => {
      const [d, q, a, w, e] = pick(r, items);
      return withFact(mcq(r, q, a, [...w], e, undefined, d), q);
    },
    { memo: cards(items.map(([, ...c]) => c)).memo },
  );

// ───────────── SES ─────────────

const SES: Record<string, Generator[]> = {
  "ses-2-richesses": [
    ...bank(
      [
        ["Le PIB est égal à…", "la somme des valeurs ajoutées (plus les impôts sur les produits, moins les subventions)", ["le chiffre d'affaires de toutes les entreprises", "la somme des salaires", "les exportations moins les importations"], "On évite ainsi de compter plusieurs fois les consommations intermédiaires."],
        ["Les deux grands facteurs de production sont…", "le travail et le capital", ["le travail et les consommations intermédiaires", "le capital et la valeur ajoutée", "la production et la consommation"], "On y ajoute parfois les ressources naturelles. Les consommations intermédiaires, elles, sont transformées au cours de la production."],
        ["La productivité du travail mesure…", "la production obtenue par travailleur ou par heure travaillée", ["la production obtenue par unité de capital installé", "le nombre d'heures travaillées par salarié", "le coût du travail par unité produite"], "Elle augmente surtout grâce au progrès technique. La production par unité de capital est la productivité du capital."],
        ["Les consommations intermédiaires sont…", "les biens et services détruits ou transformés pendant la production", ["les machines achetées par l'entreprise", "les salaires versés", "l'ensemble des achats de l'entreprise, machines comprises"], "Exemple : la farine pour le boulanger. Les machines, utilisées plusieurs années, relèvent du capital fixe."],
        ["Le capital fixe désigne…", "les biens de production utilisés pendant plusieurs cycles de production", ["les matières premières", "l'argent placé à la banque", "les stocks de produits finis"], "Machines, bâtiments, logiciels."],
        ["Une administration publique produit surtout…", "des services non marchands", ["des services marchands vendus à un prix couvrant leurs coûts", "des biens vendus à leur coût de production", "des biens et services destinés à l'exportation"], "Éducation, police, justice… gratuits ou quasi gratuits, financés surtout par les prélèvements obligatoires."],
        ["L'IDH (indice de développement humain) combine…", "santé (espérance de vie), éducation et revenu", ["PIB par habitant, taux de chômage et inflation", "revenu, pauvreté et inégalités", "espérance de vie, revenu et émissions de CO2"], "Créé par le PNUD en 1990."],
        ["Le PIB « en volume » (réel) est…", "corrigé de l'inflation", ["calculé aux prix de l'année en cours", "toujours plus élevé que le PIB nominal", "le PIB par habitant"], "Il mesure l'évolution des quantités produites ; le PIB aux prix courants est le PIB nominal."],
        ["L'investissement, pour une entreprise, c'est…", "l'achat de capital fixe (machines, bâtiments…)", ["l'achat de consommations intermédiaires (matières premières, énergie)", "un placement financier, comme l'achat d'actions", "le remboursement d'un crédit"], "Il permet de produire plus ou mieux (formation brute de capital fixe)."],
      ],
      [
        ["Le bénévolat est comptabilisé dans le PIB.", false, "Il n'y a pas de transaction ni de rémunération."],
        ["Une entreprise doit faire des bénéfices pour créer de la valeur ajoutée.", false, "La valeur ajoutée peut être positive même si l'entreprise est en perte."],
      ],
    ),
    harder([
      [2, "Une entreprise réalise un chiffre d'affaires de 500 k€, achète 200 k€ de consommations intermédiaires et verse 180 k€ de salaires. Sa valeur ajoutée vaut…", "300 k€", ["120 k€", "320 k€", "700 k€"], "VA = production − consommations intermédiaires = 500 − 200. Les salaires sont payés avec la valeur ajoutée : on ne les retire pas."],
      [3, "Le PIB nominal augmente de 5 % et les prix de 3 %. La croissance du PIB en volume est d'environ…", "2 %", ["8 %", "5 %", "1,7 %"], "Volume ≈ valeur − prix : 5 − 3 = 2 % (exactement 1,05 / 1,03 − 1 ≈ 1,9 %)."],
      [2, "Pourquoi additionner les chiffres d'affaires de toutes les entreprises surestimerait-il la production d'un pays ?", "les consommations intermédiaires seraient comptées plusieurs fois", ["les salaires seraient comptés deux fois", "la production non marchande serait comptée deux fois", "les exportations seraient comptées deux fois"], "La farine vendue au boulanger se retrouve dans le prix du pain : d'où le calcul par les valeurs ajoutées."],
    ]),
  ],
  "ses-2-marche": [
    ...bank(
      [
        ["Sur le marché du travail, l'offre de travail émane…", "des ménages (les travailleurs)", ["des entreprises", "de France Travail", "de l'État uniquement"], "Les entreprises demandent du travail : elles sont du côté de la demande."],
        ["Une hausse du revenu des ménages déplace en général la courbe de demande d'un bien normal…", "vers la droite", ["vers la gauche", "pas du tout : seul le prix la déplace", "le long de la courbe, sans la déplacer"], "À chaque prix, on demande davantage. Une variation du prix du bien, elle, fait glisser le long de la courbe."],
        ["Une baisse du coût des matières premières déplace…", "la courbe d'offre vers la droite", ["la courbe d'offre vers la gauche", "la courbe de demande vers la droite", "le point d'équilibre le long de la courbe d'offre, sans la déplacer"], "Produire coûte moins cher : on offre plus à chaque prix."],
        ["Laquelle n'est pas une hypothèse de la concurrence pure et parfaite ?", "la présence d'un seul vendeur", ["l'atomicité du marché", "l'homogénéité du produit", "la transparence de l'information"], "Un seul vendeur, c'est un monopole."],
        ["Un monopole, c'est…", "un marché avec un seul offreur face à de nombreux demandeurs", ["un marché avec un seul demandeur face à de nombreux offreurs", "un marché dominé par quelques offreurs", "une entente entre entreprises pour fixer les prix"], "Un seul acheteur : monopsone ; quelques offreurs : oligopole ; une entente : cartel."],
        ["Un prix plafond fixé en dessous du prix d'équilibre provoque…", "une pénurie", ["un excédent", "une baisse de la demande", "une hausse de l'offre"], "La demande dépasse alors l'offre."],
        ["Une externalité positive, par exemple…", "un apiculteur dont les abeilles pollinisent les vergers voisins", ["une usine qui pollue une rivière", "un vendeur qui baisse ses prix pour attirer des clients", "une subvention de l'État à un producteur"], "Un effet favorable sur un tiers, sans contrepartie monétaire. Une baisse de prix passe par le marché : ce n'est pas une externalité."],
        ["Une taxe sur un produit polluant vise à…", "faire payer le pollueur et réduire la pollution", ["interdire l'activité polluante", "créer un marché de quotas d'émission", "baisser le prix payé par les consommateurs"], "On « internalise » l'externalité par le prix. L'interdiction relève de la réglementation, les quotas d'un marché de droits à polluer."],
      ],
      [
        ["Le prix d'équilibre égalise quantités offertes et demandées.", true, "Le marché « s'équilibre »."],
        ["Sur un marché en concurrence parfaite, une entreprise peut fixer seule son prix.", false, "Elle est « preneuse de prix »."],
      ],
    ),
    harder([
      [2, "Le prix d'équilibre d'un bien est de 10 €. L'État impose un prix plancher de 14 €. Conséquence ?", "un excédent : les quantités offertes dépassent les quantités demandées", ["une pénurie : la demande dépasse l'offre", "aucun effet, puisque le prix plancher dépasse le prix d'équilibre", "une hausse des quantités échangées"], "Au-dessus de l'équilibre, on offre plus et on demande moins. Seules les quantités demandées sont achetées : les échanges baissent."],
      [2, "Le prix d'un bien passe de 10 € à 11 € et la quantité demandée baisse de 100 à 80 unités. L'élasticité-prix de la demande vaut…", "−2", ["−0,5", "−20", "+2"], "Élasticité = variation de la quantité (−20 %) / variation du prix (+10 %) = −2."],
      [3, "Une taxe de 1 € par paquet de cigarettes est créée. La demande de tabac étant très peu sensible au prix…", "le prix payé par les fumeurs augmente de près de 1 € et les ventes baissent peu", ["les ventes baissent fortement", "les producteurs supportent l'essentiel de la taxe", "le prix payé par les fumeurs ne change pas"], "Quand la demande est peu élastique, la taxe est surtout répercutée sur les consommateurs."],
    ]),
  ],
  "ses-2-diplome": [
    ...bank(
      [
        ["Le capital humain désigne…", "l'ensemble des connaissances et compétences d'un individu", ["le réseau de relations d'un individu", "le patrimoine financier d'un ménage", "les diplômes et les goûts culturels transmis par les parents"], "Notion développée par Gary Becker. Le réseau de relations est le capital social ; l'héritage familial, le capital culturel (Bourdieu)."],
        ["Selon le BIT, un chômeur est une personne…", "sans emploi, disponible et qui recherche activement un emploi", ["inscrite à France Travail, qu'elle cherche ou non un emploi", "sans emploi, qu'elle soit disponible ou non", "à temps partiel qui souhaite travailler davantage"], "Définition du Bureau international du travail. Le temps partiel subi relève du sous-emploi."],
        ["Le déclassement scolaire désigne…", "le fait d'occuper un emploi en dessous de son niveau de diplôme", ["le fait d'occuper un emploi précaire (CDD, intérim)", "le chômage de plus d'un an", "le redoublement d'une classe"], "Il peut naître de l'augmentation du nombre de diplômés."],
        ["En moyenne, plus le niveau de diplôme est élevé…", "plus le salaire est élevé et le chômage faible", ["plus le salaire est élevé, mais le chômage aussi", "plus le chômage est faible, sans effet sur le salaire", "plus l'insertion professionnelle est lente"], "Le diplôme protège sans tout garantir."],
        ["Le SMIC est…", "le salaire minimum légal en France", ["le salaire moyen des salariés à temps plein", "le salaire médian", "un revenu minimum versé aux personnes sans emploi"], "Il est revalorisé au moins une fois par an. Le revenu minimum des personnes sans ressources est le RSA."],
        ["Un CDD est…", "un contrat de travail à durée déterminée", ["un contrat à durée indéterminée", "une mission d'intérim conclue par une agence de travail temporaire", "un contrat de travail à temps partiel"], "Il fait partie des emplois dits « précaires »."],
      ],
      [
        ["Le taux de chômage des jeunes est plus élevé que celui des 25-49 ans.", true, "Insertion plus difficile et contrats plus courts."],
        ["Le salaire dépend uniquement du diplôme.", false, "Il dépend aussi de l'expérience, du secteur, du sexe, de la négociation…"],
      ],
    ),
    harder([
      [2, "Population active : 30 millions de personnes, dont 2,4 millions de chômeurs. Le taux de chômage est de…", "8 %", ["2,4 %", "7,4 %", "12,5 %"], "Taux de chômage = chômeurs / population active = 2,4 / 30. Les chômeurs font déjà partie des actifs (7,4 % : division par 32,4)."],
      [2, "Une personne sans emploi souhaite travailler mais n'a fait aucune démarche de recherche le mois dernier. Pour le BIT, elle est…", "inactive (dans le halo autour du chômage)", ["chômeuse", "en sous-emploi", "active occupée"], "Sans recherche active, elle ne remplit pas les critères du chômage BIT."],
      [3, "Selon la théorie du capital humain, un individu poursuit ses études tant que…", "les gains attendus (salaires futurs) dépassent les coûts (frais, salaires auxquels il renonce)", ["ses parents peuvent financer ses études", "le diplôme visé est reconnu par l'État", "le taux de chômage des jeunes reste élevé"], "Pour Becker, se former est un investissement : on compare son rendement à son coût, y compris le coût d'opportunité."],
    ]),
  ],
  "ses-2-politique": [
    ...bank(
      [
        ["Les députés sont élus au scrutin…", "majoritaire uninominal à deux tours", ["proportionnel intégral", "indirect", "proportionnel de liste par région"], "Dans 577 circonscriptions."],
        ["Les députés européens sont élus en France au scrutin…", "proportionnel", ["majoritaire uninominal à deux tours", "majoritaire uninominal à un tour", "indirect, par les députés nationaux"], "Sur des listes nationales, avec un seuil de 5 %."],
        ["Le Parlement français est composé…", "de l'Assemblée nationale et du Sénat", ["de l'Assemblée nationale et du Conseil constitutionnel", "du Sénat et du Conseil économique, social et environnemental", "du président de la République et du Gouvernement"], "Il est bicaméral."],
        ["L'abstention désigne…", "le fait de ne pas aller voter", ["le vote blanc", "le vote nul", "le refus de s'inscrire sur les listes uniquement"], "Le vote blanc est comptabilisé à part depuis 2014."],
        ["Un parti politique a pour fonction principale…", "de conquérir et d'exercer le pouvoir", ["d'influencer les décisions publiques sans se présenter aux élections", "de défendre les intérêts d'une profession", "d'informer les citoyens de façon neutre"], "Un groupe d'intérêt cherche à influencer ; un syndicat défend les intérêts des salariés d'une profession."],
        ["Un référendum permet…", "aux citoyens de se prononcer directement sur une question", ["aux citoyens d'élire leurs représentants", "aux parlementaires d'adopter une loi", "au Conseil constitutionnel de contrôler une loi"], "C'est un outil de démocratie directe."],
      ],
      [
        ["Les sénateurs sont élus au suffrage universel indirect.", true, "Par des grands électeurs, surtout des élus locaux."],
        ["En France, voter est obligatoire.", false, "C'est un droit, pas une obligation (contrairement à la Belgique)."],
      ],
    ),
    harder([
      [2, "Au scrutin proportionnel, une liste qui obtient 20 % des voix obtient…", "environ 20 % des sièges", ["aucun siège si elle n'arrive pas en tête", "la majorité absolue des sièges", "un siège par circonscription où elle arrive première"], "La proportionnelle répartit les sièges selon les voix (au-delà d'un éventuel seuil)."],
      [3, "Quel effet attribue-t-on souvent au scrutin majoritaire à deux tours ?", "il favorise des majorités stables et la bipolarisation de la vie politique", ["il assure une représentation fidèle de tous les courants", "il favorise la multiplication des petits partis", "il garantit l'élection d'un candidat soutenu par la majorité des inscrits"], "Il amplifie l'avance du parti en tête et pousse aux alliances ; la proportionnelle représente mieux la diversité des opinions."],
      [2, "Un groupe d'intérêt (lobby) se distingue d'un parti politique car il…", "cherche à influencer le pouvoir sans chercher à l'exercer", ["présente des candidats aux élections", "est entièrement financé par l'État", "est interdit en France"], "Ses moyens : expertise, rencontre des décideurs, campagnes d'opinion."],
    ]),
  ],
  "ses-1-financement": [
    ...bank(
      [
        ["L'autofinancement, c'est…", "le financement d'un investissement par ses propres ressources (épargne de l'entreprise)", ["un emprunt bancaire", "l'émission d'actions", "une subvention"], "Il évite de s'endetter."],
        ["Le financement direct (ou de marché) passe par…", "l'émission de titres (actions, obligations) sur les marchés financiers", ["un crédit bancaire", "l'épargne propre", "la création de monnaie par la banque centrale"], "Le financement indirect passe par les banques."],
        ["Une obligation est…", "un titre de créance qui rapporte un intérêt", ["un titre de propriété d'une entreprise", "un prêt accordé par une banque à une entreprise", "une part de l'épargne d'une entreprise"], "L'action, elle, est un titre de propriété qui peut rapporter un dividende."],
        ["Un agent a une capacité de financement quand…", "son épargne dépasse son investissement", ["son investissement dépasse son épargne", "il obtient un prêt bancaire", "il émet des obligations"], "Les ménages sont souvent dans ce cas, les entreprises plutôt en besoin de financement."],
        ["La BCE a pour mission principale…", "la stabilité des prix dans la zone euro", ["le plein emploi dans la zone euro", "le financement direct des déficits publics", "la fixation du taux de change de l'euro face au dollar"], "Objectif d'inflation proche de 2 %. Le financement direct des États lui est interdit."],
        ["L'inflation, c'est…", "la hausse générale et durable des prix", ["la hausse du prix d'un bien particulier", "la hausse de la quantité de monnaie en circulation", "la baisse du pouvoir d'achat des seuls salaires"], "Elle réduit le pouvoir d'achat de la monnaie."],
        ["La monnaie scripturale, c'est…", "la monnaie inscrite sur les comptes bancaires", ["les pièces", "les billets", "l'or"], "Elle représente l'essentiel de la masse monétaire."],
      ],
      [
        ["Les banques commerciales créent de la monnaie en accordant des crédits.", true, "« Les crédits font les dépôts »."],
        ["Le taux d'intérêt est le prix de l'argent emprunté.", true, "Il rémunère le prêteur."],
      ],
    ),
    harder([
      [2, "Une entreprise dégage 400 k€ d'épargne brute et investit 500 k€. Elle a…", "un besoin de financement de 100 k€", ["une capacité de financement de 100 k€", "un besoin de financement de 900 k€", "un taux d'autofinancement de 125 %"], "Épargne − investissement = −100 k€ : besoin de financement. Taux d'autofinancement = 400 / 500 = 80 %."],
      [3, "Une banque accorde un crédit de 10 000 € à un ménage en créditant son compte. Que se passe-t-il ?", "de la monnaie scripturale est créée", ["la banque prête l'épargne d'un autre client, sans création monétaire", "la BCE émet 10 000 € de billets", "la masse monétaire diminue de 10 000 €"], "« Les crédits font les dépôts » : la monnaie sera détruite au remboursement."],
      [2, "Si la BCE relève ses taux directeurs, on s'attend à…", "un crédit plus cher, qui freine la demande et l'inflation", ["une baisse des taux des crédits immobiliers", "une accélération de l'inflation", "une hausse du nombre de crédits accordés"], "Les banques se refinancent plus cher et répercutent la hausse sur leurs clients."],
    ]),
  ],
  "ses-1-socialisation": [
    ...bank(
      [
        ["La socialisation est…", "le processus par lequel on intériorise les normes et valeurs de la société", ["l'adhésion à une association ou à un parti", "l'apprentissage des seules règles juridiques", "la transmission de normes par la famille pendant l'enfance uniquement"], "Elle dure toute la vie et passe par de multiples instances."],
        ["Une norme est…", "une règle de conduite dans une société", ["un idéal abstrait", "une sanction appliquée à celui qui transgresse une règle", "une loi uniquement"], "Les valeurs sont des idéaux (liberté, égalité…) ; les normes sont formelles (lois) ou informelles (politesse)."],
        ["La socialisation anticipatrice consiste à…", "adopter les normes d'un groupe qu'on souhaite rejoindre", ["oublier ses valeurs d'enfance", "refuser toute norme", "imiter ses parents"], "Concept de Robert Merton."],
        ["La socialisation différenciée selon le genre, c'est…", "le fait que filles et garçons ne soient pas socialisés de la même manière", ["l'égalité totale des éducations", "la socialisation propre à chaque milieu social", "la socialisation à l'école uniquement"], "Jouets, attentes des parents, orientations scolaires…"],
        ["Une sanction peut être…", "positive (récompense) ou négative (punition)", ["seulement juridique", "toujours négative", "uniquement financière"], "Elle encourage le respect des normes."],
      ],
      [
        ["Les médias et les réseaux sociaux participent à la socialisation.", true, "Ce sont des instances de socialisation."],
        ["Deux enfants d'une même famille sont socialisés exactement de la même façon.", false, "Rang de naissance, sexe, pairs… varient."],
      ],
    ),
    harder([
      [2, "Avant même d'entrer en classe préparatoire, une lycéenne adopte les goûts et le langage de ses futurs camarades. C'est…", "une socialisation anticipatrice", ["une socialisation primaire", "une socialisation différenciée selon le genre", "une désocialisation"], "Elle intériorise par avance les normes du groupe qu'elle veut rejoindre (Merton)."],
      [2, "La socialisation secondaire…", "prolonge ou transforme à l'âge adulte la socialisation primaire (travail, couple…)", ["remplace entièrement la socialisation primaire", "désigne la socialisation par les pairs pendant l'enfance", "concerne seulement les enfants scolarisés au collège"], "Elle s'ajoute à la socialisation primaire, sans l'effacer."],
      [3, "Pour Durkheim, l'éducation est avant tout…", "l'action des générations adultes sur les plus jeunes pour leur transmettre les normes de la société", ["la construction libre, par chaque individu, de ses propres règles", "le résultat des interactions entre pairs", "une négociation permanente entre égaux"], "Une conception où la société s'impose à l'individu ; d'autres sociologues insistent sur le rôle actif de l'enfant."],
    ]),
  ],
  "ses-1-opinion-vote": [
    ...bank(
      [
        ["La méthode des quotas, utilisée par les sondeurs, consiste à…", "reproduire dans l'échantillon la structure de la population (âge, sexe, profession…)", ["interroger toute la population", "tirer les personnes au sort sans critère", "n'interroger que des volontaires"], "L'échantillon doit être représentatif."],
        ["Une « variable lourde » du vote est…", "un facteur durable comme la religion ou la profession", ["un débat télévisé de fin de campagne", "la conjoncture économique du moment", "la personnalité d'un candidat"], "Les facteurs de court terme (campagne, conjoncture, candidats) sont parfois appelés « variables courtes »."],
        ["Le vote sur enjeux, c'est…", "voter selon les thèmes de l'élection et les propositions des candidats", ["voter selon son appartenance de classe", "voter par fidélité durable à un parti", "voter selon sa pratique religieuse"], "Il traduit un électeur plus stratège, moins déterminé par ses appartenances."],
        ["La volatilité électorale désigne…", "le fait de changer de vote d'une élection à l'autre", ["l'attachement durable d'un électeur à un parti", "le fait de voter blanc", "l'écart entre les intentions de vote et le résultat"], "Elle a augmenté depuis les années 1980. L'attachement durable est l'identification partisane."],
        ["L'abstention intermittente, c'est…", "voter à certaines élections et pas à d'autres", ["ne jamais voter", "voter blanc à certaines élections", "ne pas être inscrit sur les listes électorales"], "C'est la forme d'abstention la plus fréquente."],
      ],
      [
        ["L'opinion publique peut être mesurée par des sondages.", true, "Avec une marge d'erreur."],
        ["Les sondages n'ont aucune influence sur les électeurs.", false, "Ils peuvent influencer (vote utile, mobilisation…)."],
      ],
    ),
    harder([
      [2, "Un sondage auprès de 1 000 personnes donne un candidat à 50 %, avec une marge d'erreur d'environ 3 points. On peut conclure que…", "son score réel est probablement compris entre 47 % et 53 %", ["il obtiendra exactement 50 %", "son élection est certaine", "son score réel est compris entre 49 % et 51 %"], "Un sondage est une estimation : la marge d'erreur s'applique de part et d'autre du résultat."],
      [3, "Pour Bourdieu, « l'opinion publique n'existe pas » notamment parce que les sondages…", "supposent que tout le monde a une opinion et que les questions posées intéressent tout le monde", ["reposent toujours sur des échantillons non représentatifs", "interrogent trop de personnes", "ne portent que sur les élections"], "Il critique les postulats des sondages : chacun aurait une opinion, toutes se vaudraient, les questions feraient consensus."],
      [2, "En France, la participation électorale est en moyenne plus faible chez…", "les jeunes et les personnes peu diplômées", ["les retraités", "les cadres", "les personnes les plus diplômées"], "Âge et diplôme sont parmi les facteurs les plus liés à l'abstention."],
    ]),
  ],
  "ses-1-risques": [
    ...bank(
      [
        ["La mutualisation des risques consiste à…", "répartir le coût des sinistres de quelques-uns sur l'ensemble des assurés", ["faire supporter à chaque assuré le coût de ses propres sinistres", "épargner individuellement pour faire face aux imprévus", "imposer une franchise pour responsabiliser les assurés"], "C'est le principe de l'assurance. L'épargne individuelle relève de la précaution, sans partage du risque."],
        ["L'aléa moral désigne…", "le fait qu'un assuré prenne plus de risques parce qu'il est couvert", ["le fait que les personnes les plus exposées s'assurent davantage", "le refus d'un assureur de couvrir un client jugé trop risqué", "un risque dont la probabilité est impossible à calculer"], "La franchise sert à le limiter. Les plus exposés qui s'assurent davantage : sélection adverse."],
        ["La sélection adverse (anti-sélection), c'est…", "le fait que les personnes les plus risquées s'assurent davantage", ["le fait qu'un assuré prenne plus de risques une fois couvert", "le refus d'assurer les jeunes conducteurs", "la baisse des primes pour les bons conducteurs"], "Elle vient d'une asymétrie d'information : l'assureur connaît mal le risque de chaque client."],
        ["La logique d'assistance consiste à…", "aider les personnes dans le besoin, sans cotisation préalable", ["verser des prestations en échange de cotisations préalables", "verser à tous la même prestation, sans condition de ressources", "inciter chacun à souscrire une assurance privée"], "Exemple : le RSA, sous condition de ressources. Une prestation versée à tous relève de l'universalité."],
        ["La CSG est…", "un impôt qui finance la protection sociale", ["une cotisation sociale prélevée sur les seuls salaires", "une prestation sociale versée sous condition de ressources", "l'impôt sur le revenu prélevé à la source"], "Contribution sociale généralisée, créée en 1990 ; elle porte sur presque tous les revenus (salaires, pensions, revenus du capital)."],
        ["Les prestations d'assurance sociale sont financées surtout par…", "les cotisations sociales", ["l'impôt sur le revenu", "la TVA", "des primes versées à des assurances privées"], "Logique « bismarckienne » : on cotise sur son salaire pour ouvrir des droits."],
      ],
      [
        ["La Sécurité sociale française couvre la maladie, la vieillesse et la famille.", true, "Ainsi que les accidents du travail."],
        ["Une assurance privée est obligatoire pour conduire une voiture.", true, "L'assurance responsabilité civile automobile est obligatoire."],
      ],
    ),
    harder([
      [2, "Une assurance automobile laisse 500 € à la charge de l'assuré à chaque sinistre (franchise). Objectif principal ?", "limiter l'aléa moral, car l'assuré supporte une partie du coût", ["limiter la sélection adverse en écartant les conducteurs risqués", "renforcer la mutualisation des risques", "remplacer la prime d'assurance"], "Payant une partie des dégâts, l'assuré reste incité à la prudence."],
      [3, "Pourquoi une assurance maladie obligatoire limite-t-elle la sélection adverse ?", "les personnes peu exposées restent assurées, ce qui maintient des primes accessibles", ["les assurés prennent moins de risques une fois couverts", "l'assureur peut refuser les personnes les plus à risque", "chacun cotise en proportion de son propre risque"], "Si seuls les plus risqués s'assuraient, les primes monteraient et feraient fuir les autres."],
      [2, "Une prestation versée à toutes les personnes concernées, sans condition de cotisation ni de ressources, relève de la logique…", "de protection universelle", ["d'assurance", "d'assistance", "de capitalisation"], "Assurance : contre cotisation ; assistance : sous condition de besoin ; universalité : pour tous."],
    ]),
  ],
  "ses-t-croissance": [
    ...bank(
      [
        ["La productivité globale des facteurs (PGF) correspond à…", "la part de la croissance qui n'est expliquée ni par le travail ni par le capital", ["le nombre d'heures travaillées", "le stock de capital", "le PIB par habitant"], "Elle reflète surtout le progrès technique (« résidu » de Solow)."],
        ["Pour Schumpeter, l'innovation provoque…", "une « destruction créatrice »", ["un équilibre stable et durable des marchés", "un état stationnaire sans croissance", "une croissance régulière, sans crise"], "De nouvelles activités remplacent les anciennes, d'où une croissance par à-coups."],
        ["La croissance endogène signifie que…", "le progrès technique est produit par l'activité économique elle-même (recherche, éducation…)", ["le progrès technique « tombe du ciel », sans lien avec l'activité économique", "la croissance vient uniquement de la hausse de la population active", "la croissance provient de la demande intérieure plutôt que des exportations"], "D'où l'importance des investissements en R&D et capital humain. Dans le modèle de Solow, le progrès technique est exogène."],
        ["Les institutions, comme les droits de propriété, favorisent la croissance car…", "elles sécurisent les investissements et les innovations", ["elles garantissent aux entreprises des profits élevés", "elles fixent les prix à la place du marché", "elles rendent les innovations libres de droits pour tous"], "Un innovateur doit pouvoir profiter de son invention (brevets)."],
        ["La soutenabilité forte considère que…", "le capital naturel ne peut pas être remplacé par d'autres capitaux", ["le capital naturel peut toujours être remplacé", "la croissance n'a aucun impact écologique", "il faut supprimer toute production"], "La soutenabilité faible admet la substituabilité."],
        ["Les rendements décroissants du capital signifient que…", "chaque unité de capital supplémentaire rapporte de moins en moins", ["plus on investit, plus chaque machine rapporte", "la production totale diminue quand on ajoute du capital", "le capital s'use de plus en plus vite"], "La production continue d'augmenter, mais de moins en moins : sans progrès technique, la croissance finit par ralentir."],
        ["Le brevet donne à l'inventeur…", "un monopole temporaire d'exploitation", ["une prime de l'État", "le droit de copier les autres", "une exonération d'impôts à vie"], "En général 20 ans."],
      ],
      [
        ["La croissance économique se mesure par le taux de variation du PIB réel.", true, "D'une année sur l'autre."],
        ["Le progrès technique peut aider à réduire certains dommages écologiques.", true, "Énergies renouvelables, efficacité énergétique… mais avec un risque d'effet rebond."],
      ],
    ),
    harder([
      [2, "Le PIB réel progresse de 2,5 %, puis de 0,8 % l'année suivante. On parle…", "d'un ralentissement de la croissance : le PIB continue d'augmenter", ["d'une récession", "d'une baisse du PIB", "d'une déflation"], "Le taux de croissance baisse mais reste positif. Une récession suppose une baisse du PIB."],
      [3, "En vingt ans, la production augmente de 30 %. La hausse du travail en explique 10 points et celle du capital 8 points. La contribution de la PGF est d'environ…", "12 points", ["18 points", "30 points", "2 points"], "PGF = croissance − contributions du travail et du capital = 30 − 10 − 8."],
      [2, "L'effet rebond désigne…", "la hausse de la consommation permise par des gains d'efficacité, qui annule une partie des économies réalisées", ["la reprise de l'activité après une récession", "la hausse des prix des matières premières après une crise", "le remplacement des anciennes activités par de nouvelles"], "Des voitures plus sobres peuvent inciter à rouler davantage."],
    ]),
  ],
  "ses-t-chomage": [
    ...bank(
      [
        ["Le taux de chômage se calcule…", "en divisant le nombre de chômeurs par la population active", ["en divisant les chômeurs par la population totale", "en divisant les chômeurs par la population en âge de travailler", "en divisant les chômeurs par les actifs occupés"], "Population active = actifs occupés + chômeurs."],
        ["Le « halo » du chômage regroupe…", "des personnes sans emploi qui souhaitent travailler mais ne remplissent pas tous les critères du BIT", ["les chômeurs de longue durée", "les salariés à temps partiel qui voudraient travailler plus", "les étudiants qui travaillent"], "Par exemple, non disponibles tout de suite. Le temps partiel subi relève du sous-emploi."],
        ["Le chômage frictionnel correspond…", "au temps nécessaire pour passer d'un emploi à un autre", ["à une insuffisance de la demande globale", "à un coût du travail supérieur à la productivité", "à une inadéquation durable des qualifications"], "Il existe même en période de plein emploi."],
        ["Pour Keynes, le chômage s'explique surtout par…", "une demande globale insuffisante", ["un coût du travail trop élevé", "les rigidités du marché du travail", "le temps de recherche entre deux emplois"], "Les entreprises anticipent de faibles ventes et embauchent peu. Le coût du travail trop élevé est l'explication classique."],
        ["Le salaire d'efficience, c'est…", "un salaire supérieur à l'équilibre, versé pour motiver et fidéliser les salariés", ["le salaire minimum fixé par l'État", "un salaire fixé au niveau d'équilibre du marché", "un salaire fixé par une convention collective de branche"], "Choisi par l'employeur lui-même, il peut contribuer au chômage."],
        ["Le chômage structurel vient notamment…", "d'un décalage entre les qualifications demandées et offertes", ["d'une baisse temporaire de la demande", "d'une récession passagère", "des changements d'emploi volontaires"], "Problème d'appariement, durable. Une baisse passagère de la demande crée du chômage conjoncturel."],
        ["Une baisse des cotisations sociales sur les bas salaires vise à…", "réduire le coût du travail peu qualifié pour favoriser l'embauche", ["relancer la consommation des ménages", "augmenter les recettes de la Sécurité sociale", "augmenter le salaire net des salariés qualifiés"], "Politique dite « de l'offre »."],
      ],
      [
        ["Un étudiant qui ne cherche pas d'emploi est compté comme chômeur.", false, "Il est inactif."],
        ["Le chômage de longue durée concerne les personnes au chômage depuis plus d'un an.", true, "Il fragilise l'employabilité."],
      ],
    ),
    harder([
      [2, "Un pays compte 28 millions d'actifs occupés et 2 millions de chômeurs. Taux de chômage ?", "environ 6,7 %", ["environ 7,1 %", "2 %", "environ 93 %"], "Population active = 28 + 2 = 30 millions ; 2 / 30 ≈ 6,7 % (7,1 % : division par les seuls actifs occupés)."],
      [3, "Pendant une récession, les entreprises réduisent leurs embauches faute de débouchés. Quel chômage augmente, et que préconiserait Keynes ?", "le chômage conjoncturel ; une relance de la demande (dépenses publiques, baisse des taux)", ["le chômage classique ; une baisse des salaires", "le chômage frictionnel ; une meilleure information sur les offres", "le chômage structurel ; une réforme de la formation"], "Le manque de débouchés est conjoncturel : il faut soutenir la demande globale."],
      [2, "Un employeur hésite à embaucher car il ne peut pas observer la productivité réelle des candidats. Ce problème relève…", "d'une asymétrie d'information", ["d'une insuffisance de la demande globale", "d'un coût du travail trop élevé", "de la destruction créatrice"], "Le diplôme sert alors de signal ; le salaire d'efficience répond à un problème voisin."],
    ]),
  ],
  "ses-t-commerce": [
    ...bank(
      [
        ["Selon Ricardo, un pays a intérêt à se spécialiser dans la production où il a…", "un avantage comparatif", ["un avantage absolu dans tous les domaines", "le plus de travailleurs", "le plus de matières premières"], "Même s'il est moins efficace partout, il gagne à l'échange."],
        ["Le modèle HOS explique la spécialisation par…", "les dotations en facteurs de production (travail, capital)", ["les écarts de productivité du travail entre pays", "la différenciation des produits et le goût pour la variété", "les économies d'échelle des grandes entreprises"], "Un pays riche en travail exporte des biens intensifs en travail. Les écarts de productivité : Ricardo ; la différenciation : commerce intra-branche."],
        ["Le commerce intra-branche, c'est…", "l'échange de produits similaires entre pays (voitures contre voitures)", ["l'échange de produits de branches différentes (vin contre machines)", "les échanges entre filiales d'une même multinationale", "l'échange de matières premières contre produits finis"], "Il s'explique par la différenciation des produits. Les échanges entre filiales forment le commerce intra-firme."],
        ["Un droit de douane est…", "une taxe sur les produits importés", ["une subvention aux exportations", "une limite en quantité", "une norme sanitaire"], "Instrument protectionniste."],
        ["Un quota d'importation est…", "une limite à la quantité de produits importés", ["une taxe sur les produits importés", "une norme technique imposée aux produits importés", "une aide publique versée aux exportateurs"], "Autre instrument protectionniste."],
        ["L'OMC a pour objectif…", "de libéraliser et réguler le commerce mondial", ["de veiller à la stabilité monétaire internationale", "de financer des projets de développement", "de défendre les droits des travailleurs"], "Créée en 1995, elle règle aussi les différends commerciaux. Les autres missions sont celles du FMI, de la Banque mondiale et de l'OIT."],
        ["Une chaîne de valeur mondiale, c'est…", "la fragmentation de la production d'un bien entre plusieurs pays", ["le commerce de produits similaires entre pays voisins", "la vente d'un même produit dans le monde entier", "la répartition des bénéfices d'une multinationale entre ses actionnaires"], "Conception ici, assemblage là-bas…"],
      ],
      [
        ["Le libre-échange a aussi des perdants dans chaque pays.", true, "Secteurs concurrencés, travailleurs peu qualifiés…"],
        ["Le protectionnisme éducateur (List) vise à protéger temporairement les industries naissantes.", true, "Le temps qu'elles deviennent compétitives."],
      ],
    ),
    harder([
      [3, "Une unité de drap demande 100 heures de travail en Angleterre et 90 au Portugal ; une unité de vin, 120 heures en Angleterre et 80 au Portugal. Selon Ricardo…", "le Portugal se spécialise dans le vin et l'Angleterre dans le drap", ["le Portugal produit les deux biens, car il a un avantage absolu partout", "l'Angleterre se spécialise dans le vin et le Portugal dans le drap", "aucun échange n'est avantageux"], "Le Portugal est relativement plus efficace dans le vin (80 / 120) que dans le drap (90 / 100) : avantage comparatif."],
      [2, "Un quota limite les importations de sucre en dessous des quantités importées en libre-échange. Effet attendu ?", "le prix intérieur du sucre augmente, au profit des producteurs nationaux", ["le prix intérieur du sucre baisse", "l'État perçoit des recettes douanières", "les quantités importées augmentent"], "L'offre disponible se raréfie : le prix monte. Contrairement au droit de douane, le quota ne rapporte pas de recettes douanières."],
      [2, "La France exporte des voitures vers l'Allemagne et en importe d'Allemagne. Ce commerce s'explique surtout par…", "la différenciation des produits et la demande de variété", ["les différences de dotations factorielles", "l'avantage absolu de chaque pays", "les différences de climat"], "C'est du commerce intra-branche, entre pays de niveau de développement proche."],
    ]),
  ],
  "ses-t-mobilite": [
    ...bank(
      [
        ["La mobilité intergénérationnelle compare…", "la position sociale des enfants à celle de leurs parents", ["deux moments de la carrière d'une même personne", "la position sociale de frères et sœurs", "la position sociale d'une personne et celle de son conjoint"], "La mobilité intragénérationnelle porte sur une même personne au cours de sa vie."],
        ["Une table de destinée se lit…", "en partant de l'origine sociale (catégorie du père ou des parents)", ["en partant de la position actuelle des fils", "en partant du diplôme des enfants", "en partant du revenu des ménages"], "Que deviennent les enfants issus de telle catégorie ?"],
        ["Une table de recrutement se lit…", "en partant de la position sociale actuelle", ["en partant de l'origine sociale", "selon le diplôme", "selon le revenu"], "D'où viennent les membres de telle catégorie ?"],
        ["La mobilité structurelle est…", "la mobilité due à l'évolution de la structure des emplois", ["la mobilité qui reflète l'égalité des chances", "la mobilité géographique", "la mobilité observée diminuée de l'effet des changements d'emplois"], "Exemple : la baisse du nombre d'agriculteurs. L'égalité des chances relève de la fluidité sociale."],
        ["Pour Bourdieu, la réussite scolaire dépend notamment…", "du capital culturel transmis par la famille", ["uniquement du talent", "de la seule motivation de l'élève", "du capital économique seulement"], "La reproduction sociale passe par l'école."],
        ["Le paradoxe d'Anderson souligne que…", "un diplôme plus élevé que celui de ses parents ne garantit pas une position sociale plus élevée", ["les diplômes n'ont aucune valeur", "tout le monde progresse socialement", "les parents réussissent mieux que leurs enfants"], "En raison de la hausse générale du niveau de diplôme."],
        ["La fluidité sociale mesure…", "l'égalité des chances d'accès aux positions sociales, indépendamment des changements de structure", ["la mobilité observée dans une table de mobilité", "la mobilité due à l'évolution de la structure des emplois", "la part des individus restés dans la catégorie de leurs parents"], "On la mesure par des rapports de chances relatives (odds ratios), qui neutralisent l'évolution de la structure des emplois."],
      ],
      [
        ["La mobilité sociale observée peut augmenter sans que l'égalité des chances progresse.", true, "Si elle vient seulement des changements de structure."],
        ["Le déclassement intergénérationnel n'existe pas.", false, "Certains enfants occupent une position inférieure à celle de leurs parents."],
      ],
    ),
    harder([
      [2, "Dans une table de destinée, on lit : « sur 100 fils d'ouvriers, 11 sont cadres ». Cela signifie que…", "11 % des fils d'ouvriers sont devenus cadres", ["11 % des cadres sont fils d'ouvriers", "les fils d'ouvriers représentent 11 % de la population", "la mobilité structurelle atteint 11 %"], "La table de destinée part de l'origine : que deviennent 100 fils d'ouvriers ?"],
      [2, "Dans une table de recrutement, on lit : « 35 % des cadres ont un père cadre ». Cela signifie que…", "sur 100 cadres, 35 sont fils de cadres", ["sur 100 fils de cadres, 35 sont devenus cadres", "35 % des fils de cadres sont devenus ouvriers", "la fluidité sociale atteint 35 %"], "La table de recrutement part de la position actuelle : d'où viennent 100 cadres ?"],
      [3, "La mobilité observée augmente, mais les rapports de chances relatives (odds ratios) restent stables. On en déduit que…", "la hausse vient des changements de structure des emplois, sans progrès de la fluidité", ["l'égalité des chances a progressé", "la reproduction sociale a disparu", "la mobilité structurelle a diminué"], "Les odds ratios mesurent la fluidité : stables, ils indiquent que les inégalités de chances n'ont pas reculé."],
    ]),
  ],
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

/** Les 17 notions du programme de philosophie de terminale (2020). */
const NOTIONS = [
  "l'art", "le bonheur", "la conscience", "le devoir", "l'État", "l'inconscient", "la justice", "le langage", "la liberté",
  "la nature", "la raison", "la religion", "la science", "la technique", "le temps", "le travail", "la vérité",
];

/**
 * Sujets de dissertation : [sujet, notion principale, autres notions directement en jeu].
 * Les notions voisines ne servent jamais de leurre (elles seraient défendables).
 */
const SUJETS: Array<readonly [string, string, readonly string[]]> = [
  ["Peut-on se connaître soi-même ?", "la conscience", ["l'inconscient", "la vérité", "la raison"]],
  ["Sommes-nous responsables de ce dont nous n'avons pas conscience ?", "l'inconscient", ["la conscience", "la liberté", "le devoir", "la justice"]],
  ["Être libre, est-ce faire ce que l'on veut ?", "la liberté", ["le devoir", "le bonheur", "la raison", "l'État"]],
  ["Le bonheur est-il le but de la vie ?", "le bonheur", ["le devoir", "la raison", "la liberté"]],
  ["Peut-on être heureux sans le savoir ?", "le bonheur", ["la conscience", "la vérité", "l'inconscient"]],
  ["Faut-il toujours dire la vérité ?", "la vérité", ["le devoir", "le langage", "la justice"]],
  ["La science peut-elle tout expliquer ?", "la science", ["la raison", "la vérité", "la religion", "la nature"]],
  ["Une œuvre d'art doit-elle être belle ?", "l'art", ["la nature", "la vérité"]],
  ["Le travail libère-t-il l'homme ?", "le travail", ["la liberté", "la technique", "le bonheur"]],
  ["La technique nous rend-elle plus libres ?", "la technique", ["la liberté", "le travail", "la nature", "la science"]],
  ["Peut-on désobéir aux lois ?", "l'État", ["la justice", "le devoir", "la liberté"]],
  ["Est-il juste d'obéir aux lois ?", "la justice", ["l'État", "le devoir", "la liberté"]],
  ["Le langage trahit-il la pensée ?", "le langage", ["la conscience", "la vérité", "la raison"]],
  ["Peut-on échapper au temps ?", "le temps", ["la liberté", "la conscience", "la religion"]],
  ["Faut-il agir par devoir ?", "le devoir", ["la liberté", "la raison", "le bonheur", "la justice"]],
  ["La raison peut-elle tout connaître ?", "la raison", ["la science", "la vérité", "la religion"]],
  ["Peut-on vivre sans religion ?", "la religion", ["le bonheur", "la raison", "la vérité"]],
  ["Que doit-on à autrui ?", "le devoir", ["la justice", "la conscience", "la liberté"]],
  ["L'État est-il l'ennemi de la liberté ?", "l'État", ["la liberté", "la justice"]],
  ["La nature est-elle un modèle ?", "la nature", ["l'art", "le devoir", "la technique", "la science"]],
  ["Le rêve a-t-il un sens ?", "l'inconscient", ["la conscience", "le langage"]],
];

/** Notion principale d'un sujet ; les leurres excluent les notions voisines du sujet. */
const sujets: Generator = Object.assign(
  (r: Parameters<Generator>[0]) => {
    const [sujet, main, near] = pick(r, SUJETS);
    const wrongs = NOTIONS.filter((n) => n !== main && !near.includes(n));
    return withFact(mcq(r, `Sujet : « ${sujet} » Notion principale en jeu ?`, main, wrongs, `« ${sujet} » porte d'abord sur ${main}${near.length ? `, en croisant ${near.slice(0, 2).join(" et ")}` : ""}.`), sujet, main);
  },
  { memo: SUJETS.map(([sujet, main]) => ({ front: `Sujet : « ${sujet} » Notion principale en jeu ?`, back: main })) },
);

const PHILO: Record<string, Generator[]> = {
  "philo-t-methode": [
    ...pairs(REPERES, {
      ask: (a) => `Repère du programme : que distingue le couple ${a} ?`,
      reverse: (b) => `Quel couple de repères oppose : ${b} ?`,
      explain: (a, b) => `${a} : ${b}.`,
    }),
    sujets,
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
      { ask: (a) => `Qui a écrit « ${a} » ?`, reverse: (b) => `Quelle œuvre a écrite ${b} ?`, claim: (a, b) => `« ${a} » est une œuvre ${/^[AEIOUÉÈ]/.test(b) ? `d'${b}` : `de ${b}`}.`, explain: (a, b) => `« ${a} » : ${b}.` },
    ),
  ],
};

export const SES_PHILO_PLUS: Record<string, Generator[]> = { ...SES, ...PHILO };
