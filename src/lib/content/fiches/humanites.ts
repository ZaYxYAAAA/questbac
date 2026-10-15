/**
 * Fiches de révision — histoire-géo, français, philosophie, SES, anglais, espagnol.
 * Format : « @id-du-chapitre », puis « - » pour l'essentiel et « ! » pour les pièges.
 */
export const HUMANITES = String.raw`
@hg-2-antiquite
- Athènes (Ve s. av. J.-C.) : démocratie directe (Clisthène, Périclès) ; citoyens = hommes libres nés de parents athéniens.
- Exclus de la citoyenneté : femmes, esclaves, métèques (étrangers).
- Rome : République (509 av. J.-C.) puis Empire avec Auguste (27 av. J.-C.).
- Édit de Caracalla (212) : citoyenneté romaine pour tous les hommes libres de l'Empire.
- Méditerranée, « mare nostrum » : routes, échanges, romanisation.
! La démocratie athénienne excluait la majorité des habitants.

@hg-2-moyen-age
- Trois civilisations : Occident chrétien latin, Empire byzantin (grec, orthodoxe), monde musulman.
- Schisme de 1054 entre catholiques et orthodoxes.
- Croisades à partir de 1095 ; Reconquista en Espagne jusqu'en 1492.
- Échanges commerciaux (Venise, Gênes) et culturels (traductions des savoirs antiques).
- Société d'ordres et féodalité.
! Le monde musulman médiéval a transmis une grande partie des savoirs antiques.

@hg-2-renaissance
- Grandes découvertes : Colomb (1492), Vasco de Gama (1498), Magellan (1519-1522).
- Imprimerie de Gutenberg (vers 1450) : diffusion rapide des idées.
- Humanisme : retour aux textes antiques, l'homme au centre (Érasme, Rabelais, Montaigne).
- Réforme : Luther (1517), Calvin ; Réforme catholique (concile de Trente).
- Renaissance artistique : Léonard de Vinci, Michel-Ange, perspective.
! Les « grandes découvertes » ont été une catastrophe pour les peuples amérindiens.

@hg-2-lumieres
- Lumières (XVIIIe) : raison, liberté, tolérance (Voltaire, Montesquieu, Rousseau, Diderot).
- L'Encyclopédie (Diderot et d'Alembert).
- Montesquieu : séparation des pouvoirs (De l'esprit des lois, 1748).
- Angleterre : Bill of Rights (1689), monarchie parlementaire.
- États-Unis : Déclaration d'indépendance (1776), Constitution (1787).
! Beaucoup de philosophes des Lumières préféraient un « despote éclairé » à la démocratie.

@hg-2-etat-moderne
- Renforcement de l'État : impôts, armée permanente, administration (intendants).
- Absolutisme de droit divin : Louis XIV (règne personnel 1661-1715), Versailles.
- Angleterre : pouvoir croissant du Parlement, monarchie parlementaire après 1688-1689.
- Édit de Nantes (1598) puis révocation (1685).
! Même absolu, le roi devait respecter les lois fondamentales du royaume.

@hg-2-environnement
- Ressources (eau, sols, énergies) inégalement réparties.
- Risque = aléa × vulnérabilité.
- Changement climatique : montée des eaux, événements extrêmes.
- Développement durable : économique, social, environnemental.
- Transitions énergétique et écologique.
! Un aléa ne devient un risque que s'il menace une société.

@hg-2-mobilites
- Environ 280 millions de migrants internationaux.
- Facteurs économiques, politiques, climatiques ; flux Sud-Nord et Sud-Sud.
- Réfugiés : protégés par la convention de Genève (1951).
- Tourisme international : plus de 1,4 milliard d'arrivées par an ; la France est la 1re destination.
! Les migrations Sud-Sud sont aussi importantes que les migrations Sud-Nord.

@hg-2-afrique-australe
- Afrique du Sud : apartheid (1948-1991), ségrégation raciale institutionnalisée.
- Nelson Mandela : 27 ans de prison, président en 1994.
- Région riche en ressources (or, diamants, platine) mais très inégalitaire.
- Défis : pauvreté, sida, accès à l'eau, townships.
- Pays émergent, membre des BRICS.
! La fin de l'apartheid n'a pas effacé les inégalités socio-économiques.

@hg-1-revolution
- 1789 : États généraux, serment du Jeu de paume, prise de la Bastille (14 juillet), abolition des privilèges (4 août), DDHC (26 août).
- 1792 : République ; 1793 : exécution de Louis XVI, Terreur.
- 1799 : coup d'État de Bonaparte ; Code civil (1804).
- 1804 : Napoléon empereur ; Waterloo (1815).
- Héritage : souveraineté nationale, égalité devant la loi.
! La DDHC exclut les femmes (Olympe de Gouges réplique en 1791).

@hg-1-nationalites
- 1848 : printemps des peuples ; IIe République, suffrage universel masculin, abolition de l'esclavage.
- 1851-1852 : coup d'État de Louis-Napoléon Bonaparte, Second Empire.
- Unité italienne (Cavour, Garibaldi, 1861) ; unité allemande (Bismarck, 1871).
- Nationalisme et droit des peuples.
! L'Empire allemand est proclamé dans la galerie des Glaces de Versailles (1871).

@hg-1-troisieme-republique
- IIIe République (1870-1940), enracinée après la Commune (1871).
- Lois Ferry (1881-1882) : école gratuite, laïque et obligatoire.
- Libertés : réunion et presse (1881), syndicats (1884), associations (1901).
- Affaire Dreyfus (1894-1906), « J'accuse » de Zola (1898).
- Séparation des Églises et de l'État (1905) ; expansion coloniale.
! Les femmes ne votent pas sous la IIIe République.

@hg-1-industrie
- Révolution industrielle : charbon, vapeur, chemin de fer, puis électricité et pétrole.
- Exode rural, urbanisation, naissance du monde ouvrier.
- Conditions de travail dures ; syndicalisme, socialisme (Marx).
- Bourgeoisie industrielle, capitalisme.
! L'industrialisation a avancé à des rythmes très différents selon les pays.

@hg-1-ww1
- 1914-1918 : guerre totale (économie, société, propagande mobilisées).
- Guerre de mouvement puis de tranchées ; Verdun et la Somme (1916).
- Génocide des Arméniens (1915).
- 1917 : révolution russe, entrée en guerre des États-Unis.
- Armistice du 11 novembre 1918 ; traité de Versailles (1919).
! Environ 10 millions de soldats tués, dont 1,4 million de Français.

@hg-1-metropoles
- Métropolisation : concentration des populations, activités et pouvoirs dans les grandes villes.
- Villes mondiales (New York, Londres, Tokyo, Paris) : fonctions de commandement.
- Plus de la moitié de l'humanité vit en ville.
- Étalement urbain, gentrification, fragmentation.
! Métropole : rayonnement ; mégapole : taille (plus de 10 millions d'habitants).

@hg-t-totalitarismes
- Krach de Wall Street (octobre 1929) : crise mondiale, chômage de masse.
- Totalitarisme : parti unique, chef, idéologie, terreur, propagande, embrigadement.
- URSS de Staline : collectivisation, goulag, purges.
- Allemagne nazie : Hitler chancelier (1933), lois de Nuremberg (1935).
- Italie fasciste : Mussolini (1922).
! Hitler accède au pouvoir légalement avant d'établir la dictature.

@hg-t-ww2
- 1939-1945 : guerre d'anéantissement ; invasion de la Pologne le 1er septembre 1939.
- Génocides : Shoah (6 millions de Juifs), Tsiganes ; centres de mise à mort (Auschwitz-Birkenau).
- France : défaite de 1940, Vichy (collaboration), Résistance (de Gaulle, Jean Moulin).
- Tournants : Stalingrad (1942-1943), débarquement du 6 juin 1944.
- 8 mai 1945 : capitulation allemande ; août 1945 : Hiroshima et Nagasaki.
! Environ 60 millions de morts, en majorité des civils.

@hg-t-guerre-froide
- 1947-1991 : affrontement indirect États-Unis / URSS.
- Doctrine Truman, plan Marshall ; OTAN (1949), pacte de Varsovie (1955).
- Crises : Berlin (1948-1949, mur en 1961), Corée (1950-1953), Cuba (1962), Viêt Nam.
- Fin : chute du mur (1989), fin de l'URSS (1991).
! « Froide » : pas d'affrontement militaire direct entre les deux Grands.

@hg-t-decolonisation
- Indépendances en Asie (Inde, 1947) puis en Afrique (années 1960).
- Guerre d'Indochine (1946-1954) ; guerre d'Algérie (1954-1962, accords d'Évian).
- Conférence de Bandung (1955) : naissance du Tiers-Monde, non-alignement.
- Droit des peuples à disposer d'eux-mêmes (ONU).
! Indépendances négociées ou arrachées par la guerre selon les cas.

@hg-t-ve-republique
- Constitution de 1958 ; président élu au suffrage universel direct depuis 1962.
- De Gaulle (1959-1969), Mai 68.
- Alternance en 1981 (Mitterrand) ; cohabitations (1986, 1993, 1997).
- Quinquennat depuis 2002 ; révision constitutionnelle de 2008.
- Majorité à 18 ans (1974), loi Veil (1975), abolition de la peine de mort (1981), parité (2000).
! En cohabitation, le Premier ministre n'appartient pas au camp du président.

@hg-t-europe
- CECA (1951), traité de Rome (1957) : la CEE à 6.
- Parlement européen élu au suffrage universel depuis 1979.
- Acte unique (1986), traité de Maastricht (1992) : Union européenne, citoyenneté européenne.
- Euro (2002), espace Schengen.
- Brexit (2020) : 27 États membres.
! Tous les pays de l'UE n'ont pas adopté l'euro.

@hg-t-monde-1990
- Fin de la bipolarité : hyperpuissance américaine puis monde multipolaire.
- Terrorisme (11 septembre 2001), guerres en Irak, Afghanistan, Syrie, Ukraine.
- Gouvernance mondiale : ONU, G7, G20, OMC ; accord de Paris sur le climat (2015).
- Puissances émergentes : Chine, Inde, BRICS.
! Le multilatéralisme est concurrencé par les rapports de force.

@hg-t-mers
- 80 à 90 % du commerce mondial passe par la mer ; conteneurisation.
- Passages stratégiques : Suez, Panama, Malacca, Ormuz, Gibraltar.
- ZEE de 200 milles marins (Montego Bay, 1982) ; la France a la 2e ZEE du monde.
- Enjeux : ressources, câbles sous-marins, piraterie, pollution, rivalités en mer de Chine.
- Grands ports : Shanghai, Singapour, Rotterdam.
! 1 mille marin = 1 852 m.

@fr-2-figures
- Comparaison (avec un outil : comme, tel…) et métaphore (sans outil).
- Personnification ; allégorie (idée abstraite incarnée).
- Hyperbole (exagération), litote (dire moins pour suggérer plus), euphémisme (atténuer).
- Anaphore, gradation, énumération.
- Antithèse, oxymore (termes contraires accolés), chiasme (ABBA).
- Métonymie : « boire un verre » (le contenant pour le contenu).
! Nommer la figure ne suffit pas : il faut analyser son effet.

@fr-2-poesie
- Alexandrin (12 syllabes), décasyllabe (10), octosyllabe (8).
- Rimes plates (AABB), croisées (ABAB), embrassées (ABBA) ; pauvres, suffisantes, riches.
- Sonnet : deux quatrains et deux tercets (14 vers).
- Césure, enjambement, rejet, contre-rejet.
- Poème en prose, vers libre.
! Le « e » muet se compte devant une consonne et s'élide devant une voyelle.

@fr-2-theatre
- Tragédie, comédie, drame romantique, théâtre de l'absurde.
- Double énonciation : le personnage parle aux autres personnages et au public.
- Didascalies ; réplique, tirade, monologue, aparté, stichomythie.
- Exposition, nœud, péripéties, dénouement.
- Classicisme : règle des trois unités, bienséance, vraisemblance.
! L'aparté n'est entendu que du public.

@fr-2-roman
- Narrateur ≠ auteur ; narrateur interne (« je ») ou externe.
- Focalisation zéro (omnisciente), interne, externe.
- Schéma narratif : situation initiale, élément perturbateur, péripéties, résolution, situation finale.
- Passé simple (premier plan) et imparfait (arrière-plan, description).
- Discours direct, indirect, indirect libre.
! Le « je » du narrateur n'est pas forcément l'auteur.

@fr-2-litterature-idees
- Argumentation directe (essai, discours, article) ou indirecte (fable, conte philosophique, utopie).
- Thèse, arguments, exemples ; convaincre (raison) ou persuader (émotions).
- Registres polémique, satirique, ironique.
- Pamphlet : texte court et violent contre une cible.
- Presse : éditorial, chronique ; loi sur la liberté de la presse (1881).
! L'ironie dit le contraire de ce qu'elle pense pour dénoncer.

@fr-1-mouvements
- Humanisme (XVIe) : Rabelais, Montaigne, Ronsard.
- Baroque puis classicisme (XVIIe) : Molière, Racine, Corneille, La Fontaine.
- Lumières (XVIIIe) : Voltaire, Rousseau, Diderot, Montesquieu.
- Romantisme (Hugo, Lamartine, Musset) ; réalisme et naturalisme (Balzac, Flaubert, Zola).
- Symbolisme (Baudelaire, Rimbaud, Verlaine) ; surréalisme (Breton, Éluard).
! Baudelaire fait le lien entre romantisme et symbolisme.

@fr-1-commentaire
- Introduction : amorce, présentation du texte, problématique, annonce du plan.
- Deux ou trois axes de lecture, avec des sous-parties.
- Chaque idée : affirmation, citation, procédé, interprétation.
- Conclusion : bilan, réponse à la problématique, ouverture.
- Repérer genre, registre, énonciation, champs lexicaux, figures, rythme.
! Ne pas paraphraser : expliquer comment le texte produit du sens.

@fr-1-dissertation
- Analyser le sujet : mots-clés, présupposés, reformulation.
- Problématique : une question qui révèle une tension.
- Plans : dialectique, thématique, analytique.
- Paragraphe : idée, argument, exemple précis de l'œuvre, mini-conclusion.
- S'appuyer sur l'œuvre au programme et son parcours.
! Répondre au sujet posé, pas réciter le cours.

@fr-1-grammaire
- Subordonnées relatives (complètent un nom), complétives (souvent COD, introduites par « que »), circonstancielles (temps, cause, but, condition…).
- Interrogation totale (oui/non) ou partielle (mot interrogatif) ; directe ou indirecte.
- Négation totale (ne… pas), partielle (ne… jamais, plus, rien, personne).
- Propositions indépendantes, juxtaposées, coordonnées.
! « Ne… que » n'est pas une négation : c'est une restriction.

@fr-1-oeuvres-bac
- Chaque œuvre est liée à un parcours : en connaître l'auteur, la date, le genre et les enjeux.
- Préparer des citations courtes et des passages clés.
- Relier l'œuvre à son mouvement et à son contexte.
- Oral : explication linéaire d'un extrait, puis entretien sur l'œuvre choisie.
! À l'écrit, chaque argument s'appuie sur un exemple précis.

@philo-t-conscience
- Descartes : « Je pense, donc je suis » (cogito), première certitude.
- Conscience de soi, conscience morale, conscience réfléchie.
- Freud : l'inconscient (refoulement, lapsus, rêves) ; « le moi n'est pas maître dans sa propre maison ».
- Husserl : « toute conscience est conscience de quelque chose ».
- Sartre refuse l'inconscient : la mauvaise foi.
! L'inconscient freudien n'est pas un simple manque d'attention.

@philo-t-liberte
- Libre arbitre : pouvoir de choisir (Descartes).
- Spinoza : « les hommes se croient libres parce qu'ils ignorent les causes qui les déterminent ».
- Sartre : « l'homme est condamné à être libre » ; l'existence précède l'essence.
- Rousseau : « l'obéissance à la loi qu'on s'est prescrite est liberté ».
- Liberté et responsabilité.
! Faire ce que l'on veut n'est pas forcément être libre.

@philo-t-verite
- Vérité : accord de la pensée avec le réel, ou cohérence logique.
- Opinion vs savoir ; allégorie de la caverne (Platon).
- Démonstration (mathématiques), expérience (sciences de la nature).
- Doute méthodique (Descartes).
- Nietzsche critique la valeur absolue de la vérité.
! Croire n'est pas savoir : la vérité demande une justification.

@philo-t-devoir
- Devoir : obligation morale, différente de la contrainte.
- Kant : impératif catégorique ; agir selon une maxime qu'on peut vouloir universelle.
- Agir par devoir ≠ agir conformément au devoir.
- Traiter l'humanité toujours comme une fin, jamais seulement comme un moyen.
- Utilitarisme (Bentham, Mill) : le plus grand bonheur du plus grand nombre.
! Kant juge l'intention ; l'utilitarisme juge les conséquences.

@philo-t-bonheur
- Épicure : plaisirs naturels et nécessaires, ataraxie.
- Stoïciens (Épictète, Sénèque) : distinguer ce qui dépend de nous et ce qui n'en dépend pas.
- Aristote : le bonheur, fin ultime, activité conforme à la vertu.
- Kant : le bonheur, idéal de l'imagination.
- Schopenhauer : la vie oscille entre souffrance et ennui.
! L'épicurisme n'est pas la recherche de tous les plaisirs.

@philo-t-etat-justice
- Hobbes : l'état de nature est une guerre de tous contre tous ; le Léviathan.
- Locke : droits naturels, pouvoir limité.
- Rousseau : contrat social et volonté générale.
- Weber : l'État a le monopole de la violence physique légitime.
- Justice : Aristote (commutative, distributive), Rawls (principe de différence).
! Légal ne veut pas dire légitime.

@philo-t-art
- Kant : « est beau ce qui plaît universellement sans concept » ; jugement désintéressé.
- Platon : l'art imite les apparences, loin du vrai.
- Aristote : la catharsis, purification des passions.
- Le génie donne ses règles à l'art (Kant).
- Hegel : le beau artistique est supérieur au beau naturel.
! L'agréable est personnel ; le beau prétend à l'universel.

@philo-t-technique-travail
- Descartes : nous rendre « comme maîtres et possesseurs de la nature ».
- Marx : le travail aliéné.
- Hegel : dialectique du maître et de l'esclave ; le travail forme.
- Arendt : travail, œuvre, action.
- Hans Jonas : principe responsabilité.
! La technique n'est pas neutre : elle transforme aussi l'homme.

@philo-t-science-raison
- Rationalisme (Descartes) / empirisme (Locke, Hume).
- Hume : problème de l'induction.
- Popper : une théorie scientifique doit être réfutable.
- Bachelard : obstacle épistémologique ; « l'opinion pense mal ».
- Kant : l'esprit structure l'expérience.
! Une théorie irréfutable n'est pas scientifique.

@philo-t-langage-temps
- Saussure : signe = signifiant + signifié, arbitraire.
- Austin : énoncés performatifs (dire, c'est faire).
- Benveniste : langage humain vs communication animale.
- Saint Augustin : « Si personne ne me le demande, je le sais » ; le temps dans l'esprit.
- Bergson : la durée vécue contre le temps mesuré.
! Le temps vécu n'est pas le temps des horloges.

@philo-t-auteurs
- Antiquité : Platon, Aristote, Épicure, Épictète, Lucrèce.
- Moyen Âge : saint Augustin, Thomas d'Aquin.
- XVIIe : Descartes, Pascal, Spinoza, Hobbes, Locke.
- XVIIIe : Rousseau, Hume, Kant, Montesquieu.
- XIXe-XXe : Hegel, Marx, Nietzsche, Freud, Bergson, Sartre, Arendt, Popper.
! Situer un auteur aide à comprendre à qui il répond.

@philo-t-methode
- Définir les termes, repérer le présupposé et la tension du sujet.
- Problématique : montrer que la réponse n'est pas évidente.
- Plan progressif en trois parties.
- Arguments, exemples, références expliquées.
- Introduction (accroche, problème, annonce) et conclusion (réponse nuancée).
! Chaque référence doit servir l'argument.

@ses-2-richesses
- Production marchande et non marchande (services publics gratuits ou quasi gratuits).
- Valeur ajoutée = production − consommations intermédiaires.
- PIB = somme des valeurs ajoutées.
- Productivité = production / quantité de facteurs utilisés.
- Limites du PIB : bien-être, inégalités, environnement.
! Le PIB additionne des valeurs ajoutées, pas des chiffres d'affaires.

@ses-2-marche
- Demande décroissante et offre croissante avec le prix.
- Prix d'équilibre à l'intersection de l'offre et de la demande.
- Excès d'offre : le prix baisse ; excès de demande : il monte.
- Revenus, goûts, coûts déplacent les courbes.
- Concurrence pure et parfaite : atomicité, homogénéité, transparence, libre entrée.
! Une variation du prix fait bouger le long de la courbe ; un autre facteur la déplace.

@ses-2-diplome
- Capital humain : connaissances et compétences accumulées (Becker).
- Plus de diplôme : moins de chômage et un salaire plus élevé en moyenne.
- Déclassement : emploi en dessous de sa qualification.
- Le diplôme est un signal pour l'employeur.
! Le diplôme protège du chômage sans garantir un emploi.

@ses-2-politique
- Démocratie : souveraineté du peuple, séparation des pouvoirs.
- Partis, élections, abstention.
- Participation conventionnelle (vote) et non conventionnelle (manifestation, pétition).
- Ve République : Président, gouvernement, Assemblée nationale, Sénat.
! Le Sénat est élu au suffrage indirect.

@ses-1-financement
- Taux d'épargne = épargne / revenu disponible.
- Autofinancement ou financement externe (crédit, actions, obligations).
- Action : part du capital (dividende) ; obligation : titre de dette (intérêts).
- Monnaie : unité de compte, intermédiaire des échanges, réserve de valeur ; créée par le crédit bancaire.
- La banque centrale fixe des taux directeurs.
! « Les crédits font les dépôts » : prêter crée de la monnaie.

@ses-1-socialisation
- Apprentissage des normes et des valeurs d'une société.
- Socialisation primaire (famille, école) et secondaire (travail, couple).
- Instances : famille, école, pairs, médias.
- Socialisation différenciée selon le genre et le milieu social.
! L'individu n'est pas passif : il participe à sa socialisation.

@ses-1-opinion-vote
- Sondage : échantillon représentatif (quotas), marge d'erreur.
- Rôle des médias et des réseaux sociaux.
- Abstention variable selon l'âge, le diplôme, l'intérêt pour la politique.
- Vote sur enjeux en hausse, vote de classe en déclin ; volatilité.
! Un sondage est une estimation, pas une prédiction.

@ses-1-risques
- Assurance : mutualisation des risques contre une prime.
- Aléa moral (après le contrat) et sélection adverse (avant).
- Protection sociale : assurance (cotisations) et assistance (solidarité).
- Sécurité sociale (1945) : santé, retraite, famille, accidents du travail.
- Prime pure = probabilité du sinistre × coût.
! Assurance ≠ assistance : l'une suppose des cotisations, pas l'autre.

@ses-t-croissance
- Croissance : hausse durable du PIB réel.
- Facteurs : travail, capital, progrès technique (productivité globale des facteurs).
- Schumpeter : innovation, destruction créatrice.
- Rôle des institutions (droits de propriété, État de droit).
- Soutenabilité faible ou forte.
! La croissance ne réduit pas automatiquement les inégalités.

@ses-t-chomage
- Chômeur (BIT) : sans emploi, disponible, en recherche active.
- Taux de chômage = chômeurs / population active.
- Chômage keynésien, classique, structurel, frictionnel.
- Politiques : relance, coût du travail, formation, flexibilité.
! Un inactif n'est pas un chômeur.

@ses-t-commerce
- Ricardo : avantages comparatifs.
- Dotations factorielles ; chaînes de valeur mondiales ; firmes multinationales.
- Taux de couverture = exportations / importations × 100.
- Protectionnisme (droits de douane, quotas, normes) ou libre-échange (OMC).
! On peut gagner à l'échange sans aucun avantage absolu.

@ses-t-mobilite
- Mobilité intergénérationnelle ou intragénérationnelle.
- Table de destinée (en ligne) et de recrutement (en colonne).
- Mobilité observée = structurelle + nette.
- Bourdieu : capital culturel, reproduction sociale.
! Ne pas inverser les lectures d'une table de destinée et de recrutement.

@en-2-past
- Past simple : action terminée datée (yesterday, last year, in 2010, ago).
- Present perfect (have + participe passé) : lien avec le présent (since, for, already, never, just, yet).
- Irréguliers : go/went/gone, see/saw/seen, take/took/taken…
- Since + point de départ ; for + durée.
! « I have seen him yesterday » est faux : « yesterday » impose le past simple.

@en-2-vocab
- Faux amis : actually = en fait, eventually = finalement, library = bibliothèque, sensible = raisonnable.
- Current = actuel ; to attend = assister à ; deception = tromperie.
- It's up to you, to be fed up with, I can't help it.
! « Actually » ne veut jamais dire « actuellement ».

@en-2-axes
- Axes : identités et échanges, espace privé et public, art et pouvoir, citoyenneté et mondes virtuels, fictions et réalités, innovations scientifiques, diversité et inclusion, territoire et mémoire.
- Générations : generation gap, peer pressure, role model.
- Défis : climate change, sustainability, inequality.
! Réutiliser le vocabulaire de l'axe à l'écrit.

@en-1-modals
- Can/could : capacité, permission ; must : obligation (de soi) ; have to : obligation extérieure.
- Should : conseil ; may/might : éventualité.
- Modal + base verbale, sans « to » ni « s ».
- Reproche : should have + participe passé.
! « You mustn't » = interdit ; « you don't have to » = pas obligé.

@en-1-passive
- Passif : be + participe passé (+ by).
- Is made, was made, has been made, will be made.
- Discours indirect : recul des temps (am → was, will → would), today → that day.
- Say (sans complément de personne) / tell (+ quelqu'un).
! « I am tired » devient « he said he was tired ».

@en-1-grammar
- Comparatif -er than / more … than ; superlatif the -est / the most …
- Who (personne), which (chose), that, whose, where.
- Gérondif après enjoy, avoid, mind, look forward to ; infinitif après want, decide, hope.
- Question tags : « You're French, aren't you? »
! Good / better / the best et bad / worse / the worst sont irréguliers.

@en-1-civilisation
- Royaume-Uni : monarchie constitutionnelle, Communes et Lords, Premier ministre ; quatre nations.
- États-Unis : république fédérale, président, Congrès, Cour suprême.
- Magna Carta (1215), indépendance (1776), guerre de Sécession (1861-1865), droits civiques (années 1960).
- Commonwealth.
! Le Royaume-Uni n'a pas de constitution écrite en un seul texte.

@en-t-conditionals
- If + present, will + base : condition réalisable.
- If + past, would + base : irréel du présent (if I were…).
- If + past perfect, would have + participe passé : irréel du passé.
- I wish + past (souhait) ; I wish + past perfect (regret).
! Jamais de « would » après « if ».

@en-t-essay
- Introduction (problématique), paragraphes, conclusion.
- Firstly, moreover, however, on the other hand, therefore, to conclude.
- In my opinion, I believe that, it seems to me that.
- For instance, such as.
! Un paragraphe = une idée.

@es-2-presente
- Présent : -ar (hablo), -er (como), -ir (vivo).
- Diphtongues e → ie (quiero), o → ue (puedo) ; verbes en -go (tengo, hago, salgo).
- Ser : identité, caractère, origine ; estar : état, lieu, situation passagère.
- Me gusta + singulier, me gustan + pluriel.
! Le lieu se dit avec estar : « estoy en Madrid ».

@es-2-vocabulaire
- Faux amis : embarazada = enceinte, constipado = enrhumé, exquisito = délicieux, largo = long.
- Lunes, martes, miércoles, jueves, viernes, sábado, domingo.
- Enero, febrero, marzo… ; uno, dos, tres… cien.
! « Estar constipado » veut dire être enrhumé.

@es-2-cliches
- 17 communautés autonomes ; catalan, basque et galicien co-officiels.
- Fêtes : Sanfermines, Feria de Abril, Tomatina, Semana Santa.
- Paella (Valence), tapas, gazpacho, tortilla.
- Velázquez, Goya, Picasso, Dalí, Almodóvar.
! L'Espagne ne se résume pas au flamenco.

@es-1-passe
- Indefinido : action ponctuelle terminée (ayer, el año pasado) : hablé, comí, viví.
- Imperfecto : description, habitude (antes, siempre) : hablaba, comía.
- Irréguliers : fui (ser/ir), tuve, hice, estuve.
- De repente, un día (indefinido) ; cada día, de niño (imperfecto).
! Ser et ir ont le même indefinido : fui.

@es-1-subjonctif
- Subjonctif présent : -ar → -e (hable), -er/-ir → -a (coma, viva).
- Après quiero que, espero que, es necesario que, para que, cuando + futur.
- Impératif (habla, comed) ; défense : no + subjonctif (no hables).
- Conditionnel : infinitif + -ía (hablaría).
! « Cuando llegues » : subjonctif pour une action future.

@es-1-monde-hispanique
- 20 pays ont l'espagnol pour langue officielle (près de 500 millions de natifs).
- Mexico, Buenos Aires, Bogota, Lima, Santiago, Caracas, La Havane…
- García Márquez, Neruda, Borges, Vargas Llosa ; Frida Kahlo, Diego Rivera.
! Au Brésil, on parle portugais.

@es-t-memoire
- Conquête : Cortés (Aztèques), Pizarro (Incas).
- Guerre civile (1936-1939) ; Guernica (1937).
- Franquisme (1939-1975).
- Transition : Constitution de 1978, Juan Carlos ; tentative de coup d'État du 23-F (1981).
- Dictatures latino-américaines : Pinochet (Chili, 1973), Argentine ; mémoire des disparus.
! Lois de mémoire historique (2007) puis démocratique (2022).

@es-t-argumenter
- Creo que + indicatif ; no creo que + subjonctif ; en mi opinión.
- Además, sin embargo, por lo tanto, en cambio, por fin.
- Futur (hablaré), conditionnel (hablaría).
- Si + présent → futur ; si + subjonctif imparfait → conditionnel.
! « No creo que sea » : subjonctif après une opinion négative.
`;
