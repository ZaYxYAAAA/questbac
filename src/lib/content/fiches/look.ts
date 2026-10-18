/**
 * Personnalisation des fiches imprimables : jeu de couleurs, écriture et papier.
 * Le choix est gardé sur l'appareil (localStorage).
 */

export type ThemeId = "matiere" | "encre" | "pastel" | "surligneur" | "foret" | "corail" | "mono";
export type FontId = "moderne" | "cahier" | "stylo" | "feutre" | "classique";
export type PaperId = "blanc" | "seyes" | "carreaux" | "points";

export interface PaperLook {
  theme: ThemeId;
  font: FontId;
  paper: PaperId;
}

export const DEFAULT_LOOK: PaperLook = { theme: "matiere", font: "moderne", paper: "blanc" };

export interface Theme {
  name: string;
  /** Couleur principale (null : celle de la matière). */
  accent: string | null;
  /** Seconde couleur (bandeau du haut). */
  accent2: string;
  /** Encre des titres et du texte principal. */
  ink: string;
  /** Texte posé sur la couleur principale (numéros). */
  onAccent: string;
  /** Titre souligné au surligneur. */
  marker?: boolean;
}

export const THEMES: Record<ThemeId, Theme> = {
  matiere: { name: "Matière", accent: null, accent2: "#6C47FF", ink: "#0F172A", onAccent: "#FFFFFF" },
  encre: { name: "Encre bleue", accent: "#1D4ED8", accent2: "#1E3A8A", ink: "#1E3A8A", onAccent: "#FFFFFF" },
  pastel: { name: "Pastel", accent: "#DB6A9C", accent2: "#5EC4B0", ink: "#334155", onAccent: "#FFFFFF" },
  surligneur: { name: "Surligneur", accent: "#FACC15", accent2: "#FB923C", ink: "#111827", onAccent: "#111827", marker: true },
  foret: { name: "Forêt", accent: "#15803D", accent2: "#65A30D", ink: "#14321F", onAccent: "#FFFFFF" },
  corail: { name: "Corail", accent: "#EA580C", accent2: "#E11D48", ink: "#3B1D12", onAccent: "#FFFFFF" },
  mono: { name: "Encre noire", accent: "#1F2937", accent2: "#9CA3AF", ink: "#111827", onAccent: "#FFFFFF" },
};

export interface PaperFont {
  name: string;
  title: string;
  body: string;
  /** Les écritures manuscrites paraissent plus petites : on grossit un peu. */
  scale: number;
}

const SANS = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

export const FONTS: Record<FontId, PaperFont> = {
  moderne: { name: "Moderne", title: SANS, body: SANS, scale: 1 },
  cahier: { name: "Cahier", title: "'Caveat', cursive", body: "'Patrick Hand', cursive", scale: 1.12 },
  stylo: { name: "Stylo", title: "'Kalam', cursive", body: "'Kalam', cursive", scale: 1.04 },
  feutre: { name: "Feutre", title: "'Permanent Marker', cursive", body: "'Patrick Hand', cursive", scale: 1.1 },
  classique: { name: "Classique", title: "'Lora', serif", body: "'Lora', serif", scale: 1 },
};

/** Polices manuscrites et à empattements (Google Fonts), chargées par la page d'impression. */
export const PAPER_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Kalam:wght@400;700&family=Lora:wght@400;600;700&family=Patrick+Hand&family=Permanent+Marker&display=swap";

export const PAPERS: Record<PaperId, { name: string }> = {
  blanc: { name: "Blanc" },
  seyes: { name: "Seyès" },
  carreaux: { name: "Petits carreaux" },
  points: { name: "Pointillés" },
};

const isId = <T extends string>(v: unknown, list: Record<T, unknown>): v is T => typeof v === "string" && v in list;

/** Relit un choix enregistré, en revenant aux valeurs par défaut pour ce qui est inconnu. */
export function parseLook(raw: unknown): PaperLook {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    theme: isId(o.theme, THEMES) ? o.theme : DEFAULT_LOOK.theme,
    font: isId(o.font, FONTS) ? o.font : DEFAULT_LOOK.font,
    paper: isId(o.paper, PAPERS) ? o.paper : DEFAULT_LOOK.paper,
  };
}
