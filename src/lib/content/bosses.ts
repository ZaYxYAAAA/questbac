import type { Boss, Level, Question } from "@/lib/types";
import { CHAPTERS } from "./curriculum";
import { chapterQuestions } from "./generated";

export const BOSSES: Boss[] = [
  {
    id: "sphinx-fonctions", name: "Le Sphinx des Fonctions", title: "Gardien de la Seconde", emoji: "🦁",
    subject: "maths", level: "seconde", hp: 100, secondsPerQuestion: 25, unlockChapters: 2, xpReward: 250, rpReward: 60,
    gradient: "from-amber-500 via-orange-600 to-red-700",
    intro: "Nul ne franchit mon seuil sans maîtriser images, antécédents et vecteurs.",
    taunts: ["Une énigme de trop pour toi ?", "Même un antécédent ne te sauverait pas.", "Ta courbe s'effondre !"],
    defeatLine: "Impossible... tu as résolu toutes mes énigmes.",
  },
  {
    id: "derivatus", name: "Dérivatus", title: "Seigneur des Tangentes", emoji: "🐉",
    subject: "maths", level: "premiere", hp: 120, secondsPerQuestion: 25, unlockChapters: 2, xpReward: 350, rpReward: 80,
    gradient: "from-violet-600 via-purple-700 to-fuchsia-800",
    intro: "Mes écailles ont la pente de mille tangentes. Calcule vite, ou brûle.",
    taunts: ["Ton taux d'accroissement est nul !", "Le discriminant est négatif pour toi.", "Ta suite diverge, mortel."],
    defeatLine: "Ma dérivée s'annule... je suis à mon minimum.",
  },
  {
    id: "hydre-log", name: "L'Hydre Logarithmique", title: "Terreur de la Terminale", emoji: "🐍",
    subject: "maths", level: "terminale", hp: 150, secondsPerQuestion: 22, unlockChapters: 2, xpReward: 500, rpReward: 110,
    gradient: "from-emerald-600 via-teal-700 to-cyan-900",
    intro: "Coupe une tête, deux repoussent : ln(2) fois plus vite que tes réflexes.",
    taunts: ["Croissances comparées : je gagne toujours.", "Ta limite tend vers l'échec.", "Récurrence ? Je me régénère à chaque rang n+1."],
    defeatLine: "Toutes mes têtes... intégrées.",
  },
  {
    id: "golem-atomique", name: "Le Golem Atomique", title: "Colosse de la matière", emoji: "🗿",
    subject: "physique", level: "seconde", hp: 100, secondsPerQuestion: 25, unlockChapters: 2, xpReward: 250, rpReward: 60,
    gradient: "from-cyan-600 via-sky-700 to-blue-900",
    intro: "6,02 × 10²³ atomes composent mon corps. Combien de moles de courage as-tu ?",
    taunts: ["Ta concentration est trop diluée !", "Tes neutrons te lâchent.", "Je suis inerte à tes attaques."],
    defeatLine: "Ma structure... se désagrège.",
  },
  {
    id: "elementaire-redox", name: "L'Élémentaire Redox", title: "Esprit des électrons", emoji: "⚡",
    subject: "physique", level: "premiere", hp: 120, secondsPerQuestion: 25, unlockChapters: 2, xpReward: 350, rpReward: 80,
    gradient: "from-yellow-500 via-amber-600 to-orange-800",
    intro: "Je capte tes électrons et j'oxyde tes certitudes.",
    taunts: ["Tu es le réactif limitant !", "Ton énergie mécanique se dissipe.", "Réduit à néant !"],
    defeatLine: "Mon avancement... est maximal. C'est fini.",
  },
  {
    id: "titan-newtonien", name: "Le Titan Newtonien", title: "Maître des forces", emoji: "🪐",
    subject: "physique", level: "terminale", hp: 150, secondsPerQuestion: 22, unlockChapters: 2, xpReward: 500, rpReward: 110,
    gradient: "from-indigo-600 via-blue-800 to-slate-900",
    intro: "La somme des forces est en ma faveur. Ton accélération ne suffira pas.",
    taunts: ["Ta demi-vie est écoulée.", "pH 14 : je te dissous.", "Chute libre garantie."],
    defeatLine: "La somme des forces... est nulle. Je m'immobilise.",
  },
  {
    id: "reine-cellule", name: "La Reine Cellule", title: "Souveraine du vivant", emoji: "🦠",
    subject: "svt", level: "seconde", hp: 100, secondsPerQuestion: 25, unlockChapters: 2, xpReward: 250, rpReward: 60,
    gradient: "from-lime-500 via-emerald-600 to-green-800",
    intro: "Mes organites sont mes soldats, mon ADN est ma loi.",
    taunts: ["Ta membrane est perméable aux erreurs.", "Mutation défavorable détectée !", "Mes mitochondries ne fatiguent jamais."],
    defeatLine: "Apoptose... programmée.",
  },
  {
    id: "mutant-genomique", name: "Le Mutant Génomique", title: "Erreur de réplication", emoji: "🧬",
    subject: "svt", level: "premiere", hp: 120, secondsPerQuestion: 25, unlockChapters: 2, xpReward: 350, rpReward: 80,
    gradient: "from-pink-600 via-rose-700 to-red-900",
    intro: "Chaque erreur de ta part enrichit mon génome.",
    taunts: ["Codon STOP pour toi !", "Tes anticorps ne me reconnaissent pas.", "Transcription de ta défaite en cours."],
    defeatLine: "Mon ARN... dégradé.",
  },
  {
    id: "gardien-eres", name: "Le Gardien des Ères", title: "Témoin de 4,5 milliards d'années", emoji: "🦖",
    subject: "svt", level: "terminale", hp: 150, secondsPerQuestion: 22, unlockChapters: 2, xpReward: 500, rpReward: 110,
    gradient: "from-orange-700 via-stone-700 to-stone-900",
    intro: "J'ai vu passer les dinosaures. Tu ne seras qu'une fine couche de sédiments.",
    taunts: ["Brassage raté !", "Ta demi-vie est trop courte.", "La sélection naturelle t'a éliminé."],
    defeatLine: "Une nouvelle ère commence... la tienne.",
  },
  {
    id: "chronomancien", name: "Le Chronomancien", title: "Maître des siècles", emoji: "⏳",
    subject: "histoire", level: "seconde", hp: 100, secondsPerQuestion: 25, unlockChapters: 2, xpReward: 250, rpReward: 60,
    gradient: "from-amber-600 via-yellow-700 to-amber-900",
    intro: "J'ai réécrit l'Histoire mille fois. Connais-tu ses vraies dates ?",
    taunts: ["Anachronisme !", "Tu confonds les siècles.", "Même Périclès aurait mieux répondu."],
    defeatLine: "Le sablier... s'est vidé.",
  },
  {
    id: "spectre-empire", name: "Le Spectre de l'Empire", title: "Fantôme de 1815", emoji: "👑",
    subject: "histoire", level: "premiere", hp: 120, secondsPerQuestion: 25, unlockChapters: 2, xpReward: 350, rpReward: 80,
    gradient: "from-blue-700 via-slate-700 to-red-800",
    intro: "Des tranchées aux barricades, j'ai hanté chaque révolution.",
    taunts: ["Ton Waterloo approche.", "Tu recules plus vite que le front.", "Révolution manquée !"],
    defeatLine: "Exilé... une fois de plus.",
  },
  {
    id: "colosse-guerre-froide", name: "Le Colosse de Glace", title: "Ombre de la Guerre froide", emoji: "🧊",
    subject: "histoire", level: "terminale", hp: 150, secondsPerQuestion: 22, unlockChapters: 2, xpReward: 500, rpReward: 110,
    gradient: "from-sky-600 via-slate-700 to-zinc-900",
    intro: "Le monde est coupé en deux. De quel côté du mur tomberas-tu ?",
    taunts: ["Rideau de fer sur tes chances.", "Dissuasion totale.", "Ta mémoire est gelée."],
    defeatLine: "Le mur... tombe.",
  },
  {
    id: "muse-rhetorique", name: "La Muse Rhétorique", title: "Reine des figures de style", emoji: "🎭",
    subject: "francais", level: "seconde", hp: 100, secondsPerQuestion: 25, unlockChapters: 2, xpReward: 250, rpReward: 60,
    gradient: "from-rose-600 via-pink-700 to-purple-900",
    intro: "Cette obscure clarté qui tombe des étoiles... te sera fatale.",
    taunts: ["Ta réponse est un oxymore : brillamment fausse.", "Pas un alexandrin juste !", "Litote : tu n'es pas très fort."],
    defeatLine: "Le rideau tombe sur ma tirade.",
  },
  {
    id: "oracle-lettres", name: "L'Oracle des Lettres", title: "Gardien des mouvements", emoji: "📜",
    subject: "francais", level: "premiere", hp: 110, secondsPerQuestion: 25, unlockChapters: 1, xpReward: 300, rpReward: 70,
    gradient: "from-red-700 via-rose-800 to-stone-900",
    intro: "Du classicisme au surréalisme, j'ai inspiré chaque plume.",
    taunts: ["Hors-sujet !", "Ta problématique est vide.", "Même Zola n'aurait pas été si cru."],
    defeatLine: "Fin du dernier chapitre.",
  },
  {
    id: "sophiste", name: "Le Sophiste Éternel", title: "Maître du doute", emoji: "🦉",
    subject: "philo", level: "terminale", hp: 120, secondsPerQuestion: 28, unlockChapters: 2, xpReward: 400, rpReward: 90,
    gradient: "from-fuchsia-700 via-purple-800 to-indigo-950",
    intro: "Es-tu sûr d'exister ? Prouve-le en répondant juste.",
    taunts: ["Ta liberté n'est qu'illusion.", "Cogito ? Plutôt « erro ergo sum ».", "Doute hyperbolique activé."],
    defeatLine: "Je pense... donc je perds.",
  },
  {
    id: "marchand-fou", name: "Le Marchand Fou", title: "Spéculateur des marchés", emoji: "📈",
    subject: "ses", level: "seconde", hp: 100, secondsPerQuestion: 25, unlockChapters: 2, xpReward: 250, rpReward: 60,
    gradient: "from-green-600 via-lime-700 to-emerald-900",
    intro: "Tout s'achète, même tes bonnes réponses. Quel est ton prix d'équilibre ?",
    taunts: ["Krach de tes neurones !", "Valeur ajoutée : nulle.", "Pénurie de bonnes réponses."],
    defeatLine: "Faillite... totale.",
  },
  {
    id: "grammar-kraken", name: "The Grammar Kraken", title: "Terror of the tenses", emoji: "🐙",
    subject: "anglais", level: "all", hp: 110, secondsPerQuestion: 20, unlockChapters: 2, xpReward: 300, rpReward: 70,
    gradient: "from-sky-600 via-blue-800 to-indigo-950",
    intro: "If you had studied, you would have survived. Did you?",
    taunts: ["Wrong tense, sailor!", "You mustn't fail... but you did.", "I have been waiting for this."],
    defeatLine: "I... would have won, if only...",
  },
];

export const bossById = (id: string) => BOSSES.find((b) => b.id === id);

export const bossesForLevel = (level: Level) => BOSSES.filter((b) => b.level === level || b.level === "all");

/** Chapitres comptant pour le déblocage / la réserve de questions d'un boss. */
export function bossChapters(boss: Boss, playerLevel: Level) {
  const level = boss.level === "all" ? playerLevel : boss.level;
  return CHAPTERS.filter((c) => c.subject === boss.subject && (boss.level === "all" || c.level === level));
}

/** Réserve de questions d'un combat : banque fixe + questions générées (nouvelles à chaque combat). */
export function bossQuestionPool(boss: Boss, playerLevel: Level): Question[] {
  const chapters = bossChapters(boss, playerLevel);
  const perChapter = Math.max(4, Math.ceil(40 / Math.max(1, chapters.length)));
  return chapters.flatMap((c) => chapterQuestions(c.id, perChapter));
}
