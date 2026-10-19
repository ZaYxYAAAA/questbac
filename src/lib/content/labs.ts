import type { LabId, Level } from "@/lib/types";

export interface LabMeta {
  id: LabId;
  title: string;
  emoji: string;
  levels: Level[];
  description: string;
  /** Ce que l'élève peut manipuler, affiché sur la carte. */
  interactions: string[];
}

export const LABS: LabMeta[] = [
  {
    id: "traceur", title: "Traceur universel", emoji: "📈", levels: ["seconde", "premiere", "terminale"],
    description: "Tape n'importe quelle fonction, ajoute des paramètres et observe la courbe se transformer en direct.",
    interactions: ["Plusieurs courbes", "Paramètres animables", "Dérivée en un clic", "Zoom & déplacement"],
  },
  {
    id: "affine", title: "Fonctions affines", emoji: "📏", levels: ["seconde"],
    description: "Déplace deux points : la droite, son coefficient directeur et son équation se mettent à jour.",
    interactions: ["Points déplaçables", "Triangle de pente", "Équation réduite"],
  },
  {
    id: "vecteurs", title: "Vecteurs & produit scalaire", emoji: "🧭", levels: ["seconde", "premiere"],
    description: "Somme, différence, colinéarité et produit scalaire de deux vecteurs que tu manipules.",
    interactions: ["Règle du parallélogramme", "Colinéarité", "Angle & produit scalaire"],
  },
  {
    id: "second-degre", title: "Second degré", emoji: "🎯", levels: ["premiere"],
    description: "Fais varier a, b, c ou attrape le sommet : discriminant, racines et forme canonique en direct.",
    interactions: ["Sommet déplaçable", "Discriminant", "Racines & signe"],
  },
  {
    id: "tangente", title: "Dérivée & tangente", emoji: "🎢", levels: ["premiere", "terminale"],
    description: "Fais glisser un point sur la courbe et regarde la sécante devenir tangente quand h → 0.",
    interactions: ["Sécante → tangente", "Nombre dérivé", "Courbe de f'"],
  },
  {
    id: "trigo", title: "Cercle trigonométrique", emoji: "🌀", levels: ["premiere", "terminale"],
    description: "Fais tourner un point sur le cercle et vois naître les courbes du cosinus et du sinus.",
    interactions: ["Angle déplaçable", "Angles remarquables", "Animation"],
  },
  {
    id: "suites", title: "Suites numériques", emoji: "🪜", levels: ["premiere", "terminale"],
    description: "Suites arithmétiques, géométriques ou récurrentes, avec diagramme en toile d'araignée.",
    interactions: ["Termes & sommes", "Toile d'araignée", "Convergence"],
  },
  {
    id: "exp-ln", title: "Exponentielle & logarithme", emoji: "🌋", levels: ["premiere", "terminale"],
    description: "Deux courbes symétriques par rapport à y = x : déplace un point et compare les tangentes.",
    interactions: ["Symétrie y = x", "Tangentes", "Fonctions bˣ"],
  },
  {
    id: "integrale", title: "Intégrales & aires", emoji: "🟪", levels: ["terminale"],
    description: "Rectangles, trapèzes et aire exacte : regarde la somme de Riemann converger.",
    interactions: ["Bornes déplaçables", "n rectangles", "4 méthodes"],
  },
  {
    id: "binomiale", title: "Loi binomiale", emoji: "🎲", levels: ["terminale"],
    description: "Règle n et p et observe la forme de la loi, son espérance et ses probabilités cumulées.",
    interactions: ["Histogramme dynamique", "P(X = k), P(X ≤ k)", "Espérance & écart-type"],
  },
];

export const labById = (id: string) => LABS.find((l) => l.id === id);
