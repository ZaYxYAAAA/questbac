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
  ch("maths-2-nombres", "maths", "seconde", "Nombres et calculs", "Ensembles de nombres, puissances, racines carrées, fractions."),
  ch("maths-2-equations", "maths", "seconde", "Équations et inéquations", "Calcul littéral, identités remarquables, tableaux de signes."),
  ch("maths-2-fonctions", "maths", "seconde", "Généralités sur les fonctions", "Image, antécédent, courbe, variations, extremums.", "traceur"),
  ch("maths-2-affines", "maths", "seconde", "Fonctions affines", "Coefficient directeur, ordonnée à l'origine, signe.", "affine"),
  ch("maths-2-reference", "maths", "seconde", "Fonctions de référence", "Carré, inverse, racine carrée, cube.", "traceur"),
  ch("maths-2-vecteurs", "maths", "seconde", "Vecteurs et repérage", "Coordonnées, somme, colinéarité, milieu, distance.", "vecteurs"),
  ch("maths-2-droites", "maths", "seconde", "Équations de droites", "Équation réduite, cartésienne, systèmes.", "affine"),
  ch("maths-2-stats", "maths", "seconde", "Statistiques", "Moyenne, médiane, quartiles, écart-type."),
  ch("maths-2-probas", "maths", "seconde", "Probabilités", "Univers, événements, loi équirépartie, arbres."),

  ch("maths-1-second-degre", "maths", "premiere", "Second degré", "Forme canonique, discriminant, racines, signe.", "second-degre"),
  ch("maths-1-suites", "maths", "premiere", "Suites numériques", "Suites arithmétiques, géométriques, sens de variation.", "suites"),
  ch("maths-1-derivation", "maths", "premiere", "Dérivation", "Nombre dérivé, tangente, fonctions dérivées.", "tangente"),
  ch("maths-1-variations", "maths", "premiere", "Variations et extremums", "Signe de la dérivée, tableaux de variations.", "tangente"),
  ch("maths-1-exponentielle", "maths", "premiere", "Fonction exponentielle", "Définition, propriétés algébriques, dérivée.", "exp-ln"),
  ch("maths-1-trigo", "maths", "premiere", "Trigonométrie", "Cercle trigonométrique, radian, cosinus et sinus.", "trigo"),
  ch("maths-1-produit-scalaire", "maths", "premiere", "Produit scalaire", "Définitions, Al-Kashi, orthogonalité.", "vecteurs"),
  ch("maths-1-probas-cond", "maths", "premiere", "Probabilités conditionnelles", "Arbres pondérés, indépendance, formule des probabilités totales."),
  ch("maths-1-va", "maths", "premiere", "Variables aléatoires", "Loi, espérance, variance, écart-type."),

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

  ch("pc-1-avancement", "physique", "premiere", "Suivi d'une transformation", "Tableau d'avancement, réactif limitant."),
  ch("pc-1-redox", "physique", "premiere", "Oxydoréduction", "Oxydants, réducteurs, demi-équations."),
  ch("pc-1-lewis", "physique", "premiere", "Structure des entités", "Schémas de Lewis, géométrie, polarité."),
  ch("pc-1-energie", "physique", "premiere", "Énergie mécanique", "Énergies cinétique et potentielle, travail d'une force."),
  ch("pc-1-ondes", "physique", "premiere", "Ondes mécaniques", "Célérité, périodicités spatiale et temporelle."),
  ch("pc-1-lentilles", "physique", "premiere", "Lentilles et images", "Relation de conjugaison, grandissement."),

  ch("pc-t-acides-bases", "physique", "terminale", "Acides, bases et pH", "Couples acide/base, pKa, titrages."),
  ch("pc-t-cinetique", "physique", "terminale", "Cinétique chimique", "Vitesse de réaction, facteurs cinétiques, temps de demi-réaction."),
  ch("pc-t-newton", "physique", "terminale", "Lois de Newton", "Deuxième loi, mouvements dans un champ uniforme."),
  ch("pc-t-ondes", "physique", "terminale", "Diffraction et interférences", "Diffraction, interférences, effet Doppler."),
  ch("pc-t-thermo", "physique", "terminale", "Thermodynamique", "Premier principe, transferts thermiques."),
  ch("pc-t-rc", "physique", "terminale", "Circuit RC", "Charge d'un condensateur, constante de temps."),
  ch("pc-t-radioactivite", "physique", "terminale", "Décroissance radioactive", "Loi de décroissance, demi-vie, datation."),

  // ───────────── SVT ─────────────
  ch("svt-2-cellule", "svt", "seconde", "La cellule, unité du vivant", "Organisation cellulaire, membrane, organites."),
  ch("svt-2-adn", "svt", "seconde", "ADN et biodiversité", "Structure de l'ADN, universalité, mutations."),
  ch("svt-2-metabolisme", "svt", "seconde", "Métabolisme", "Photosynthèse, respiration, enzymes."),
  ch("svt-2-sols", "svt", "seconde", "Agrosystèmes et sols", "Formation des sols, gestion durable."),
  ch("svt-2-procreation", "svt", "seconde", "Procréation et sexualité", "Appareils reproducteurs, régulation hormonale."),

  ch("svt-1-replication", "svt", "premiere", "Réplication et mutations", "Cycle cellulaire, mitose, réplication semi-conservative."),
  ch("svt-1-expression", "svt", "premiere", "Expression du génome", "Transcription, traduction, code génétique."),
  ch("svt-1-tectonique", "svt", "premiere", "Dynamique de la lithosphère", "Structure du globe, tectonique des plaques."),
  ch("svt-1-ecosystemes", "svt", "premiere", "Écosystèmes", "Interactions, services écosystémiques."),
  ch("svt-1-immunite", "svt", "premiere", "Immunité", "Immunité innée et adaptative, vaccination."),

  ch("svt-t-brassage", "svt", "terminale", "Génétique et évolution", "Méiose, brassages, sélection naturelle."),
  ch("svt-t-datation", "svt", "terminale", "Histoire de la Terre", "Datation relative et absolue."),
  ch("svt-t-climat", "svt", "terminale", "Climats de la Terre", "Effet de serre, paléoclimats, cycle du carbone."),
  ch("svt-t-nerveux", "svt", "terminale", "Système nerveux et muscles", "Réflexe myotatique, synapse, motricité volontaire."),
  ch("svt-t-plantes", "svt", "terminale", "Plantes et domestication", "Vie fixée, reproduction des plantes."),

  // ───────────── Histoire-Géographie ─────────────
  ch("hg-2-antiquite", "histoire", "seconde", "La Méditerranée antique", "Athènes, Rome, citoyenneté."),
  ch("hg-2-moyen-age", "histoire", "seconde", "La Méditerranée médiévale", "Chrétientés, Islam, échanges."),
  ch("hg-2-renaissance", "histoire", "seconde", "Renaissance et Humanisme", "Grandes découvertes, imprimerie, Réformes."),
  ch("hg-2-lumieres", "histoire", "seconde", "Lumières et révolutions", "Philosophes, révolutions anglaise et américaine."),
  ch("hg-2-environnement", "histoire", "seconde", "Sociétés et environnements", "Ressources, risques, transition."),

  ch("hg-1-revolution", "histoire", "premiere", "Révolution française et Empire", "1789-1815, nouvel ordre politique."),
  ch("hg-1-industrie", "histoire", "premiere", "L'industrialisation au XIXe", "Révolution industrielle, transformations sociales."),
  ch("hg-1-ww1", "histoire", "premiere", "La Première Guerre mondiale", "Guerre totale, sortie de guerre."),
  ch("hg-1-metropoles", "histoire", "premiere", "La métropolisation", "Villes mondiales, recompositions urbaines."),

  ch("hg-t-totalitarismes", "histoire", "terminale", "Crise et totalitarismes", "Crise de 1929, régimes totalitaires."),
  ch("hg-t-ww2", "histoire", "terminale", "La Seconde Guerre mondiale", "Guerre d'anéantissement, génocides."),
  ch("hg-t-guerre-froide", "histoire", "terminale", "La Guerre froide", "Bipolarisation, crises, fin de l'URSS."),
  ch("hg-t-ve-republique", "histoire", "terminale", "La Ve République", "Institutions, alternances, évolutions."),
  ch("hg-t-mers", "histoire", "terminale", "Mers et océans", "Mondialisation maritime, enjeux géopolitiques."),

  // ───────────── Français ─────────────
  ch("fr-2-figures", "francais", "seconde", "Figures de style", "Métaphore, comparaison, hyperbole, anaphore..."),
  ch("fr-2-poesie", "francais", "seconde", "La poésie", "Versification, formes poétiques."),
  ch("fr-2-theatre", "francais", "seconde", "Le théâtre", "Genres, double énonciation, registres."),
  ch("fr-2-roman", "francais", "seconde", "Le roman et le récit", "Narrateur, focalisation, schéma narratif."),
  ch("fr-1-mouvements", "francais", "premiere", "Mouvements littéraires", "Humanisme, classicisme, romantisme, réalisme..."),
  ch("fr-1-commentaire", "francais", "premiere", "Le commentaire de texte", "Méthode, axes de lecture, rédaction."),
  ch("fr-1-dissertation", "francais", "premiere", "La dissertation", "Problématique, plan, argumentation."),
  ch("fr-1-grammaire", "francais", "premiere", "Grammaire du bac", "Propositions subordonnées, interrogation, négation."),

  // ───────────── Philosophie ─────────────
  ch("philo-t-conscience", "philo", "terminale", "La conscience", "Descartes, inconscient freudien."),
  ch("philo-t-liberte", "philo", "terminale", "La liberté", "Libre arbitre, déterminisme, Sartre, Spinoza."),
  ch("philo-t-verite", "philo", "terminale", "La vérité", "Opinion, savoir, démonstration."),
  ch("philo-t-devoir", "philo", "terminale", "Le devoir", "Morale, Kant, impératif catégorique."),
  ch("philo-t-methode", "philo", "terminale", "Méthode de la dissertation", "Analyse du sujet, problématisation, plan."),

  // ───────────── SES ─────────────
  ch("ses-2-richesses", "ses", "seconde", "Comment crée-t-on des richesses ?", "Production, PIB, valeur ajoutée."),
  ch("ses-2-marche", "ses", "seconde", "Le marché", "Offre, demande, prix d'équilibre."),
  ch("ses-1-financement", "ses", "premiere", "Le financement de l'économie", "Épargne, crédit, monnaie."),
  ch("ses-1-socialisation", "ses", "premiere", "La socialisation", "Instances, socialisation primaire et secondaire."),
  ch("ses-t-croissance", "ses", "terminale", "La croissance économique", "Facteurs de production, progrès technique."),
  ch("ses-t-chomage", "ses", "terminale", "Le chômage", "Mesure, causes, politiques de l'emploi."),

  // ───────────── Anglais ─────────────
  ch("en-2-past", "anglais", "seconde", "Past simple & present perfect", "Choisir le bon temps du passé."),
  ch("en-2-vocab", "anglais", "seconde", "Vocabulaire essentiel", "Faux amis, expressions courantes."),
  ch("en-1-modals", "anglais", "premiere", "Les modaux", "Can, must, should, might..."),
  ch("en-1-passive", "anglais", "premiere", "Voix passive & discours indirect", "Transformations grammaticales."),
  ch("en-t-conditionals", "anglais", "terminale", "Conditionnels", "If-clauses, wish, regrets."),
  ch("en-t-essay", "anglais", "terminale", "Rédiger un essay", "Connecteurs logiques, structure argumentative."),
];

export const chapterById = (id: string) => CHAPTERS.find((c) => c.id === id);

export const chaptersFor = (subject: SubjectId, level: Level) =>
  CHAPTERS.filter((c) => c.subject === subject && c.level === level);

export const subjectsForLevel = (level: Level) => SUBJECTS.filter((s) => s.levels.includes(level));
