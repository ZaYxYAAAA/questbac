import type { Chapter, Level, SubjectId } from "@/lib/types";

export const LEVELS: { id: Level; label: string; short: string }[] = [
  { id: "seconde", label: "Seconde", short: "2nde" },
  { id: "premiere", label: "Première", short: "1re" },
  { id: "terminale", label: "Terminale", short: "Tle" },
];

export const levelLabel = (level: Level) => LEVELS.find((l) => l.id === level)!.label;

export interface SubjectMeta {
  id: SubjectId;
  name: string;
  emoji: string;
  /** Dégradé Tailwind utilisé pour les cartes de la matière. */
  gradient: string;
  /** Couleur d'accent (hex) utilisée par les graphiques. */
  color: string;
  levels: Level[];
  /** Hors programme (Culture générale) : mêmes chapitres à tous les niveaux, à part de la carte des matières. */
  extra?: boolean;
}

export const SUBJECTS: SubjectMeta[] = [
  { id: "maths", name: "Mathématiques", emoji: "📐", gradient: "from-violet-500 to-indigo-600", color: "#8b5cf6", levels: ["seconde", "premiere", "terminale"] },
  { id: "physique", name: "Physique-Chimie", emoji: "⚗️", gradient: "from-cyan-500 to-blue-600", color: "#06b6d4", levels: ["seconde", "premiere", "terminale"] },
  { id: "svt", name: "SVT", emoji: "🧬", gradient: "from-emerald-500 to-teal-600", color: "#10b981", levels: ["seconde", "premiere", "terminale"] },
  { id: "histoire", name: "Histoire-Géo", emoji: "🏛️", gradient: "from-amber-500 to-orange-600", color: "#f59e0b", levels: ["seconde", "premiere", "terminale"] },
  { id: "francais", name: "Français", emoji: "📖", gradient: "from-rose-500 to-pink-600", color: "#f43f5e", levels: ["seconde", "premiere"] },
  { id: "philo", name: "Philosophie", emoji: "🦉", gradient: "from-fuchsia-500 to-purple-700", color: "#d946ef", levels: ["terminale"] },
  { id: "ses", name: "SES", emoji: "📊", gradient: "from-lime-500 to-green-600", color: "#84cc16", levels: ["seconde", "premiere", "terminale"] },
  { id: "anglais", name: "Anglais", emoji: "🇬🇧", gradient: "from-sky-500 to-indigo-500", color: "#0ea5e9", levels: ["seconde", "premiere", "terminale"] },
  { id: "espagnol", name: "Espagnol", emoji: "🇪🇸", gradient: "from-red-500 to-amber-500", color: "#ef4444", levels: ["seconde", "premiere", "terminale"] },
  { id: "culture", name: "Culture générale", emoji: "🌍", gradient: "from-teal-500 to-cyan-600", color: "#14b8a6", levels: ["seconde", "premiere", "terminale"], extra: true },
];

export const subjectMeta = (id: SubjectId) => SUBJECTS.find((s) => s.id === id)!;

const ch = (
  id: string,
  subject: SubjectId,
  level: Level,
  title: string,
  summary: string,
  lab?: Chapter["lab"],
): Chapter => ({ id, subject, level, title, summary, lab });

/**
 * Chapitres alignés sur les programmes officiels du lycée général.
 * Les chapitres sans banque de questions locale sont jouables via la génération IA.
 */
export const CHAPTERS: Chapter[] = [
  // ───────────── Mathématiques ─────────────
  ch("maths-2-nombres", "maths", "seconde", "Nombres et calculs", "Ensembles de nombres, puissances, racines, multiples et diviseurs, valeur absolue."),
  ch("maths-2-equations", "maths", "seconde", "Équations et inéquations", "Calcul littéral, identités remarquables, tableaux de signes."),
  ch("maths-2-fonctions", "maths", "seconde", "Généralités sur les fonctions", "Image, antécédent, courbe, variations, extremums.", "traceur"),
  ch("maths-2-affines", "maths", "seconde", "Fonctions affines", "Coefficient directeur, ordonnée à l'origine, signe.", "affine"),
  ch("maths-2-reference", "maths", "seconde", "Fonctions de référence", "Carré, inverse, racine carrée, cube.", "traceur"),
  ch("maths-2-vecteurs", "maths", "seconde", "Vecteurs et repérage", "Coordonnées, somme, colinéarité, milieu, distance.", "vecteurs"),
  ch("maths-2-droites", "maths", "seconde", "Équations de droites", "Équation réduite, cartésienne, systèmes.", "affine"),
  ch("maths-2-stats", "maths", "seconde", "Statistiques", "Moyenne, médiane, quartiles, écart-type, regroupement en classes."),
  ch("maths-2-probas", "maths", "seconde", "Probabilités", "Univers, événements, loi équirépartie, arbres."),
  ch("maths-2-probas-cond", "maths", "seconde", "Probabilités conditionnelles et tableaux croisés", "Fréquences conditionnelles, arbres pondérés (programme 2026)."),
  ch("maths-2-automatismes", "maths", "seconde", "Automatismes", "Calculs rapides sans calculatrice : pourcentages, fractions, équations (programme 2026)."),

  ch("maths-1-second-degre", "maths", "premiere", "Second degré", "Forme canonique, discriminant, racines, signe.", "second-degre"),
  ch("maths-1-suites", "maths", "premiere", "Suites numériques", "Suites arithmétiques, géométriques, sens de variation.", "suites"),
  ch("maths-1-derivation", "maths", "premiere", "Dérivation", "Nombre dérivé, tangente, fonctions dérivées.", "tangente"),
  ch("maths-1-variations", "maths", "premiere", "Variations et extremums", "Signe de la dérivée, tableaux de variations.", "tangente"),
  ch("maths-1-exponentielle", "maths", "premiere", "Fonction exponentielle", "Définition, propriétés algébriques, dérivée.", "exp-ln"),
  ch("maths-1-trigo", "maths", "premiere", "Trigonométrie", "Cercle trigonométrique, radian, cosinus et sinus.", "trigo"),
  ch("maths-1-produit-scalaire", "maths", "premiere", "Produit scalaire", "Définitions, Al-Kashi, orthogonalité.", "vecteurs"),
  ch("maths-1-probas-cond", "maths", "premiere", "Probabilités conditionnelles", "Arbres pondérés, indépendance, formule des probabilités totales."),
  ch("maths-1-va", "maths", "premiere", "Variables aléatoires", "Loi, espérance, variance, écart-type."),
  ch("maths-1-automatismes", "maths", "premiere", "Automatismes · épreuve anticipée", "QCM sans calculatrice de l'épreuve anticipée de maths de fin de Première."),

  ch("maths-t-recurrence", "maths", "terminale", "Suites et récurrence", "Raisonnement par récurrence, limites de suites.", "suites"),
  ch("maths-t-limites", "maths", "terminale", "Limites de fonctions", "Asymptotes, formes indéterminées, croissances comparées.", "traceur"),
  ch("maths-t-continuite", "maths", "terminale", "Continuité et TVI", "Théorème des valeurs intermédiaires, dichotomie.", "traceur"),
  ch("maths-t-convexite", "maths", "terminale", "Dérivation et convexité", "Dérivée seconde, points d'inflexion, composées.", "tangente"),
  ch("maths-t-ln", "maths", "terminale", "Logarithme népérien", "Définition, propriétés, dérivée, limites.", "exp-ln"),
  ch("maths-t-primitives", "maths", "terminale", "Primitives et équations différentielles", "Primitives usuelles, y' = ay + b."),
  ch("maths-t-integrale", "maths", "terminale", "Calcul intégral", "Aire sous la courbe, linéarité, valeur moyenne.", "integrale"),
  ch("maths-t-binomiale", "maths", "terminale", "Loi binomiale", "Schéma de Bernoulli, coefficients binomiaux, espérance.", "binomiale"),
  ch("maths-t-denombrement", "maths", "terminale", "Dénombrement", "Listes, arrangements, permutations, combinaisons."),
  ch("maths-t-espace", "maths", "terminale", "Géométrie dans l'espace", "Vecteurs, droites et plans, représentations paramétriques."),

  // ───────────── Physique-Chimie ─────────────
  ch("pc-2-atome", "physique", "seconde", "Constitution de l'atome", "Noyau, électrons, numéro atomique, isotopes."),
  ch("pc-2-mole", "physique", "seconde", "Quantité de matière", "La mole, masse molaire, nombre d'Avogadro."),
  ch("pc-2-solutions", "physique", "seconde", "Solutions aqueuses", "Concentration en masse, dilution, dissolution."),
  ch("pc-2-transformations", "physique", "seconde", "Transformations de la matière", "Physiques, chimiques, nucléaires ; équations de réaction."),
  ch("pc-2-mouvement", "physique", "seconde", "Mouvement et interactions", "Référentiel, vitesse, forces, principe d'inertie."),
  ch("pc-2-ondes", "physique", "seconde", "Signaux sonores et lumineux", "Fréquence, période, réfraction, spectres."),
  ch("pc-2-electricite", "physique", "seconde", "Signaux électriques", "Lois des nœuds et des mailles, loi d'Ohm, capteurs."),

  ch("pc-1-avancement", "physique", "premiere", "Suivi d'une transformation", "Tableau d'avancement, réactif limitant."),
  ch("pc-1-redox", "physique", "premiere", "Oxydoréduction", "Oxydants, réducteurs, demi-équations."),
  ch("pc-1-lewis", "physique", "premiere", "Structure des entités", "Schémas de Lewis, géométrie, polarité."),
  ch("pc-1-energie", "physique", "premiere", "Énergie mécanique", "Énergies cinétique et potentielle, travail d'une force."),
  ch("pc-1-ondes", "physique", "premiere", "Ondes mécaniques", "Célérité, périodicités spatiale et temporelle."),
  ch("pc-1-lentilles", "physique", "premiere", "Lentilles et images", "Relation de conjugaison, grandissement."),
  ch("pc-1-organique", "physique", "premiere", "Chimie organique", "Familles, groupes caractéristiques, nomenclature."),
  ch("pc-1-spectro", "physique", "premiere", "Dosages et couleurs", "Loi de Beer-Lambert, couleurs complémentaires."),
  ch("pc-1-photon", "physique", "premiere", "Lumière : ondes et photons", "Énergie d'un photon, spectre, dualité onde-particule."),
  ch("pc-1-fluides", "physique", "premiere", "Fluides au repos", "Pression, loi de Mariotte, statique des fluides."),

  ch("pc-t-acides-bases", "physique", "terminale", "Acides, bases et pH", "Couples acide/base, pKa, titrages."),
  ch("pc-t-cinetique", "physique", "terminale", "Cinétique chimique", "Vitesse de réaction, facteurs cinétiques, temps de demi-réaction."),
  ch("pc-t-newton", "physique", "terminale", "Lois de Newton", "Deuxième loi, mouvements dans un champ uniforme."),
  ch("pc-t-ondes", "physique", "terminale", "Diffraction et interférences", "Diffraction, interférences, effet Doppler."),
  ch("pc-t-thermo", "physique", "terminale", "Thermodynamique", "Premier principe, transferts thermiques."),
  ch("pc-t-rc", "physique", "terminale", "Circuit RC", "Charge d'un condensateur, constante de temps."),
  ch("pc-t-radioactivite", "physique", "terminale", "Décroissance radioactive", "Loi de décroissance, demi-vie, datation."),
  ch("pc-t-equilibre", "physique", "terminale", "Sens d'évolution et piles", "Quotient de réaction, constante d'équilibre, piles."),

  // ───────────── SVT ─────────────
  ch("svt-2-cellule", "svt", "seconde", "La cellule, unité du vivant", "Organisation cellulaire, membrane, organites."),
  ch("svt-2-adn", "svt", "seconde", "ADN et biodiversité", "Structure de l'ADN, universalité, mutations."),
  ch("svt-2-metabolisme", "svt", "seconde", "Métabolisme", "Photosynthèse, respiration, enzymes."),
  ch("svt-2-sols", "svt", "seconde", "Agrosystèmes et sols", "Formation des sols, gestion durable."),
  ch("svt-2-procreation", "svt", "seconde", "Procréation et sexualité", "Appareils reproducteurs, régulation hormonale."),
  ch("svt-2-paysages", "svt", "seconde", "Géosciences et paysages", "Altération, érosion, sédimentation, roches."),
  ch("svt-2-microorganismes", "svt", "seconde", "Micro-organismes et santé", "Microbiote, bactéries, virus, antibiotiques, IST."),

  ch("svt-1-replication", "svt", "premiere", "Réplication et mutations", "Cycle cellulaire, mitose, réplication semi-conservative."),
  ch("svt-1-expression", "svt", "premiere", "Expression du génome", "Transcription, traduction, code génétique."),
  ch("svt-1-tectonique", "svt", "premiere", "Dynamique de la lithosphère", "Structure du globe, tectonique des plaques."),
  ch("svt-1-ecosystemes", "svt", "premiere", "Écosystèmes", "Interactions, services écosystémiques."),
  ch("svt-1-immunite", "svt", "premiere", "Immunité", "Immunité innée et adaptative, vaccination."),
  ch("svt-1-genetique-sante", "svt", "premiere", "Variation génétique et santé", "Mucoviscidose, cancers, antibiorésistance."),

  ch("svt-t-brassage", "svt", "terminale", "Génétique et évolution", "Méiose, brassages, sélection naturelle."),
  ch("svt-t-datation", "svt", "terminale", "Histoire de la Terre", "Datation relative et absolue."),
  ch("svt-t-climat", "svt", "terminale", "Climats de la Terre", "Effet de serre, paléoclimats, cycle du carbone."),
  ch("svt-t-nerveux", "svt", "terminale", "Système nerveux et muscles", "Réflexe myotatique, synapse, motricité volontaire."),
  ch("svt-t-plantes", "svt", "terminale", "Plantes et domestication", "Vie fixée, reproduction des plantes."),
  ch("svt-t-muscle", "svt", "terminale", "Produire le mouvement", "Contraction musculaire, ATP, fermentation et respiration."),
  ch("svt-t-stress", "svt", "terminale", "Comportements et stress", "Adrénaline, cortisol, axe corticotrope."),

  // ───────────── Histoire-Géographie ─────────────
  ch("hg-2-antiquite", "histoire", "seconde", "La Méditerranée antique", "Athènes, Rome, citoyenneté."),
  ch("hg-2-moyen-age", "histoire", "seconde", "La Méditerranée médiévale", "Chrétientés, Islam, échanges."),
  ch("hg-2-renaissance", "histoire", "seconde", "Renaissance et Humanisme", "Grandes découvertes, imprimerie, Réformes."),
  ch("hg-2-lumieres", "histoire", "seconde", "Lumières et révolutions", "Philosophes, révolutions anglaise et américaine."),
  ch("hg-2-etat-moderne", "histoire", "seconde", "L'État à l'époque moderne", "France et Angleterre, absolutisme, Louis XIV."),
  ch("hg-2-environnement", "histoire", "seconde", "Sociétés et environnements", "Ressources, risques, transition."),
  ch("hg-2-mobilites", "histoire", "seconde", "Des mobilités généralisées", "Migrations internationales, tourisme (géographie)."),
  ch("hg-2-afrique-australe", "histoire", "seconde", "L'Afrique australe", "Apartheid, développement, ressources (géographie)."),

  ch("hg-1-revolution", "histoire", "premiere", "Révolution française et Empire", "1789-1815, nouvel ordre politique."),
  ch("hg-1-nationalites", "histoire", "premiere", "L'Europe des nationalités (1848-1871)", "IIe République, Second Empire, unités italienne et allemande."),
  ch("hg-1-troisieme-republique", "histoire", "premiere", "La IIIe République avant 1914", "Lois républicaines, affaire Dreyfus, empire colonial."),
  ch("hg-1-industrie", "histoire", "premiere", "L'industrialisation au XIXe", "Révolution industrielle, transformations sociales."),
  ch("hg-1-ww1", "histoire", "premiere", "La Première Guerre mondiale", "Guerre totale, sortie de guerre."),
  ch("hg-1-metropoles", "histoire", "premiere", "La métropolisation", "Villes mondiales, recompositions urbaines."),

  ch("hg-t-totalitarismes", "histoire", "terminale", "Crise et totalitarismes", "Crise de 1929, régimes totalitaires."),
  ch("hg-t-ww2", "histoire", "terminale", "La Seconde Guerre mondiale", "Guerre d'anéantissement, génocides."),
  ch("hg-t-guerre-froide", "histoire", "terminale", "La Guerre froide", "Bipolarisation, crises, fin de l'URSS."),
  ch("hg-t-decolonisation", "histoire", "terminale", "Décolonisation et Tiers-Monde", "Indépendances, Bandung, guerre d'Algérie."),
  ch("hg-t-ve-republique", "histoire", "terminale", "La Ve République", "Institutions, alternances, évolutions."),
  ch("hg-t-europe", "histoire", "terminale", "La construction européenne", "De la CECA à l'Union européenne, institutions."),
  ch("hg-t-monde-1990", "histoire", "terminale", "Le monde depuis 1990", "Nouvelles conflictualités, gouvernance mondiale."),
  ch("hg-t-mers", "histoire", "terminale", "Mers et océans", "Mondialisation maritime, enjeux géopolitiques."),

  // ───────────── Français ─────────────
  ch("fr-2-figures", "francais", "seconde", "Figures de style", "Métaphore, comparaison, hyperbole, anaphore..."),
  ch("fr-2-poesie", "francais", "seconde", "La poésie", "Versification, formes poétiques."),
  ch("fr-2-theatre", "francais", "seconde", "Le théâtre", "Genres, double énonciation, registres."),
  ch("fr-2-roman", "francais", "seconde", "Le roman et le récit", "Narrateur, focalisation, schéma narratif."),
  ch("fr-2-litterature-idees", "francais", "seconde", "Littérature d'idées et presse", "Essai, apologue, pamphlet, presse (XIXe-XXIe)."),
  ch("fr-1-mouvements", "francais", "premiere", "Mouvements littéraires", "Humanisme, classicisme, romantisme, réalisme..."),
  ch("fr-1-commentaire", "francais", "premiere", "Le commentaire de texte", "Méthode, axes de lecture, rédaction."),
  ch("fr-1-dissertation", "francais", "premiere", "La dissertation", "Problématique, plan, argumentation."),
  ch("fr-1-grammaire", "francais", "premiere", "Grammaire du bac", "Propositions subordonnées, interrogation, négation."),
  ch("fr-1-oeuvres-bac", "francais", "premiere", "Œuvres du bac 2027", "Les 12 œuvres au programme et leurs parcours."),

  // ───────────── Philosophie ─────────────
  ch("philo-t-conscience", "philo", "terminale", "La conscience", "Descartes, inconscient freudien."),
  ch("philo-t-liberte", "philo", "terminale", "La liberté", "Libre arbitre, déterminisme, Sartre, Spinoza."),
  ch("philo-t-verite", "philo", "terminale", "La vérité", "Opinion, savoir, démonstration."),
  ch("philo-t-devoir", "philo", "terminale", "Le devoir", "Morale, Kant, impératif catégorique."),
  ch("philo-t-bonheur", "philo", "terminale", "Le bonheur", "Désir, plaisir, ataraxie, stoïcisme."),
  ch("philo-t-etat-justice", "philo", "terminale", "L'État et la justice", "Contrat social, légitimité, droit."),
  ch("philo-t-art", "philo", "terminale", "L'art", "Beau, génie, imitation, création."),
  ch("philo-t-technique-travail", "philo", "terminale", "La technique et le travail", "Aliénation, responsabilité, outil."),
  ch("philo-t-science-raison", "philo", "terminale", "La science et la raison", "Induction, réfutabilité, empirisme."),
  ch("philo-t-langage-temps", "philo", "terminale", "Le langage et le temps", "Signe, performatif, durée."),
  ch("philo-t-auteurs", "philo", "terminale", "Les auteurs du programme", "Repères chronologiques et œuvres majeures."),
  ch("philo-t-methode", "philo", "terminale", "Méthode de la dissertation", "Analyse du sujet, problématisation, plan."),

  // ───────────── SES ─────────────
  ch("ses-2-richesses", "ses", "seconde", "Comment crée-t-on des richesses ?", "Production, PIB, valeur ajoutée."),
  ch("ses-2-marche", "ses", "seconde", "Le marché", "Offre, demande, prix d'équilibre."),
  ch("ses-2-diplome", "ses", "seconde", "Diplôme, emploi et salaire", "Capital humain, insertion, déclassement."),
  ch("ses-2-politique", "ses", "seconde", "La vie politique", "Pouvoirs, institutions, partis, participation."),
  ch("ses-1-financement", "ses", "premiere", "Le financement de l'économie", "Épargne, crédit, monnaie."),
  ch("ses-1-socialisation", "ses", "premiere", "La socialisation", "Instances, socialisation primaire et secondaire."),
  ch("ses-1-opinion-vote", "ses", "premiere", "Opinion publique et vote", "Sondages, participation, comportements électoraux."),
  ch("ses-1-risques", "ses", "premiere", "Assurance et protection sociale", "Mutualisation, aléa moral, Sécurité sociale."),
  ch("ses-t-croissance", "ses", "terminale", "La croissance économique", "Facteurs de production, progrès technique."),
  ch("ses-t-chomage", "ses", "terminale", "Le chômage", "Mesure, causes, politiques de l'emploi."),
  ch("ses-t-commerce", "ses", "terminale", "Le commerce international", "Avantages comparatifs, chaînes de valeur, protectionnisme."),
  ch("ses-t-mobilite", "ses", "terminale", "La mobilité sociale", "Tables de mobilité, reproduction, capital culturel."),

  // ───────────── Anglais ─────────────
  ch("en-2-past", "anglais", "seconde", "Past simple & present perfect", "Choisir le bon temps du passé."),
  ch("en-2-vocab", "anglais", "seconde", "Vocabulaire essentiel", "Faux amis, expressions courantes."),
  ch("en-2-axes", "anglais", "seconde", "Vocabulaire des axes culturels", "Générations, défis, mémoire, création (programme 2025)."),
  ch("en-1-modals", "anglais", "premiere", "Les modaux", "Can, must, should, might..."),
  ch("en-1-passive", "anglais", "premiere", "Voix passive & discours indirect", "Transformations grammaticales."),
  ch("en-1-grammar", "anglais", "premiere", "Grammaire essentielle", "Comparatifs, relatifs, gérondif / infinitif, question tags."),
  ch("en-1-civilisation", "anglais", "premiere", "Civilisation anglophone", "Institutions britanniques et américaines, repères historiques."),
  ch("en-t-conditionals", "anglais", "terminale", "Conditionnels", "If-clauses, wish, regrets."),
  ch("en-t-essay", "anglais", "terminale", "Rédiger un essay", "Connecteurs logiques, structure argumentative."),

  // ───────────── Espagnol (axes culturels des programmes 2025) ─────────────
  ch("es-2-presente", "espagnol", "seconde", "Présent, ser et estar", "Conjugaison au présent, verbes irréguliers, ser / estar, gustar."),
  ch("es-2-vocabulaire", "espagnol", "seconde", "Vocabulaire et faux amis", "Mots essentiels, faux amis, nombres, jours et mois."),
  ch("es-2-cliches", "espagnol", "seconde", "L'Espagne au-delà des clichés", "Régions, langues, fêtes, gastronomie, artistes (axe 6)."),
  ch("es-1-passe", "espagnol", "premiere", "Raconter au passé", "Pretérito indefinido, imperfecto, marqueurs de temps."),
  ch("es-1-subjonctif", "espagnol", "premiere", "Subjonctif, ordres et conditionnel", "Emplois du subjonctif, impératif, hypothèses."),
  ch("es-1-monde-hispanique", "espagnol", "premiere", "Le monde hispanique", "Pays, capitales, auteurs et artistes d'Amérique latine."),
  ch("es-t-memoire", "espagnol", "terminale", "Mémoire et histoire", "Conquête, guerre civile, franquisme, transition, dictatures."),
  ch("es-t-argumenter", "espagnol", "terminale", "Argumenter en espagnol", "Connecteurs, opinion, futur, conditionnel, phrases en si."),

  // ───────────── Culture générale (hors programme, tous niveaux) ─────────────
  ch("cg-capitales", "culture", "seconde", "Capitales du monde", "120 pays sur 3 niveaux : des grandes capitales aux plus pointues, et les pièges classiques."),
  ch("cg-geo-monde", "culture", "seconde", "Géographie du monde", "Records, océans, montagnes, fleuves, détroits et monnaies."),
  ch("cg-france", "culture", "seconde", "France : régions et départements", "Chefs-lieux, numéros de départements, fleuves, villes et sommets."),
  ch("cg-histoire", "culture", "seconde", "Grandes dates et personnages", "Les dates à connaître de l'Antiquité à nos jours, et qui a fait quoi."),
  ch("cg-arts", "culture", "seconde", "Arts et monuments", "Tableaux célèbres, sculptures, courants artistiques, monuments et architectes."),
  ch("cg-litterature", "culture", "seconde", "Livres et auteurs", "Grands romans, pièces et poèmes, leurs auteurs et leurs personnages."),
  ch("cg-musique", "culture", "seconde", "Musique", "Compositeurs, tubes de la chanson, instruments et styles."),
  ch("cg-cinema", "culture", "seconde", "Cinéma", "Films cultes, réalisateurs, festivals et récompenses."),
  ch("cg-sport", "culture", "seconde", "Sport", "Règles, vocabulaire, Jeux olympiques, Coupes du monde et records."),
  ch("cg-sciences", "culture", "seconde", "Inventions et découvertes", "Savants, inventions, éléments chimiques et corps humain."),
  ch("cg-espace", "culture", "seconde", "Espace et astronomie", "Planètes, étoiles, missions spatiales et astronautes."),
  ch("cg-nature", "culture", "seconde", "Animaux et nature", "Records animaliers, petits et cris des animaux, curiosités du vivant."),
  ch("cg-mythologie", "culture", "seconde", "Mythologie", "Dieux grecs et romains, héros, créatures, mythes nordiques et égyptiens."),
  ch("cg-langue", "culture", "seconde", "Expressions et langue française", "Expressions imagées, orthographe, pluriels et figures de style."),
  ch("cg-institutions", "culture", "seconde", "Institutions et sigles", "République française, Union européenne, ONU et sigles du quotidien."),
  ch("cg-gastronomie", "culture", "seconde", "Gastronomie", "Spécialités du monde et des régions françaises, produits du terroir."),
];

export const chapterById = (id: string) => CHAPTERS.find((c) => c.id === id);

/** Chapitres d'une matière pour un niveau (la Culture générale est la même à tous les niveaux). */
export const chaptersFor = (subject: SubjectId, level: Level) =>
  CHAPTERS.filter((c) => c.subject === subject && (c.level === level || subjectMeta(subject).extra));

/** Matières du programme d'un niveau (sans la Culture générale, qui a sa propre page). */
export const schoolSubjects = (level: Level) => subjectsForLevel(level).filter((s) => !s.extra);

export const subjectsForLevel = (level: Level) => SUBJECTS.filter((s) => s.levels.includes(level));
