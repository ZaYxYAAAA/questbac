// Types partagés par tout le domaine (contenu, jeu, IA).

export type Level = "seconde" | "premiere" | "terminale";

export type SubjectId =
  | "maths"
  | "physique"
  | "svt"
  | "histoire"
  | "francais"
  | "philo"
  | "ses"
  | "anglais"
  | "espagnol";

export type Difficulty = 1 | 2 | 3;

interface QuestionBase {
  id: string;
  prompt: string; // Markdown + LaTeX ($...$)
  explanation: string;
  difficulty?: Difficulty;
  /**
   * Empreinte de l'information testée : la même pour la question directe, la
   * question inverse et le vrai/faux sur une même notion (pas de répétition déguisée).
   */
  fact?: string;
  /** Calcul pas faisable de tête : la calculatrice est proposée. */
  calc?: boolean;
}

export interface McqQuestion extends QuestionBase {
  type: "mcq";
  choices: string[];
  answer: number; // index dans choices
}

export interface TrueFalseQuestion extends QuestionBase {
  type: "truefalse";
  answer: boolean;
}

export interface NumericQuestion extends QuestionBase {
  type: "numeric";
  answer: number;
  tolerance?: number; // écart absolu accepté
  unit?: string;
}

export type Question = McqQuestion | TrueFalseQuestion | NumericQuestion;

export type LabId =
  | "traceur"
  | "affine"
  | "vecteurs"
  | "second-degre"
  | "tangente"
  | "trigo"
  | "suites"
  | "exp-ln"
  | "integrale"
  | "binomiale";

export interface Chapter {
  id: string;
  subject: SubjectId;
  level: Level;
  title: string;
  summary: string;
  lab?: LabId;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  emoji: string;
  subject: SubjectId;
  level: Level | "all";
  hp: number;
  secondsPerQuestion: number;
  /** Nombre de chapitres réussis (≥ 1 étoile) dans la matière/niveau pour débloquer. */
  unlockChapters: number;
  xpReward: number;
  rpReward: number;
  gradient: string; // classes Tailwind
  intro: string;
  taunts: string[];
  defeatLine: string;
}

/** Mission créée par l'élève (Forge) ou générée par l'IA. */
export interface CustomMission {
  id: string;
  title: string;
  subject: SubjectId;
  level: Level;
  summary: string;
  fiche: string; // Markdown
  questions: Question[];
  createdAt: number;
  source: "photo" | "texte" | "sujet" | "manuel" | "fiche";
  demo?: boolean;
  bestScore?: number;
  plays?: number;
}

export interface SavedFiche {
  id: string;
  title: string;
  subject: SubjectId;
  level: Level;
  content: string;
  createdAt: number;
  demo?: boolean;
}

/** Résultat brut d'une session de questions, avant calcul des récompenses. */
export interface QuizResult {
  correct: number;
  total: number;
  maxCombo: number;
  durationMs: number;
  answers: { questionId: string; correct: boolean; timeMs: number; given?: number | boolean | string }[];
}
