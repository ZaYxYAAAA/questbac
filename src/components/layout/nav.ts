import { BookOpen, FlaskConical, Globe, Home, type LucideIcon, Map as MapIcon, Skull, Swords, Target, Trophy, User, Users } from "lucide-react";

export interface NavPage {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  id: "accueil" | "entrainement" | "classe" | "social" | "profil";
  label: string;
  icon: LucideIcon;
  /** Pages de la section (la première est la page d'entrée). */
  pages: NavPage[];
  /** Autres préfixes d'URL rattachés à la section (pages de jeu, détails…). */
  extra?: string[];
}

/**
 * Cinq onglets : l'entraînement (tout ce qui ne compte pas pour le rang),
 * le mode classé au centre, le social et le profil.
 */
export const SECTIONS: NavSection[] = [
  { id: "accueil", label: "Accueil", icon: Home, pages: [{ href: "/", label: "Accueil", icon: Home }] },
  {
    id: "entrainement",
    label: "Entraînement",
    icon: Target,
    pages: [
      { href: "/matieres", label: "Carte", icon: MapIcon },
      { href: "/culture", label: "Culture G", icon: Globe },
      { href: "/boss", label: "Boss", icon: Skull },
      { href: "/labo", label: "Labo", icon: FlaskConical },
      { href: "/fiches", label: "Fiches", icon: BookOpen },
    ],
    extra: ["/mission"],
  },
  {
    id: "classe",
    label: "Classé",
    icon: Trophy,
    pages: [{ href: "/classement", label: "Classé", icon: Trophy }],
  },
  {
    id: "social",
    label: "Social",
    icon: Users,
    pages: [
      { href: "/amis", label: "Amis", icon: Users },
      { href: "/duels", label: "Duels", icon: Swords },
    ],
    extra: ["/invite"],
  },
  { id: "profil", label: "Profil", icon: User, pages: [{ href: "/profil", label: "Profil", icon: User }] },
];

const matches = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

export const isActive = matches;

/** Section qui contient la page affichée. */
export function sectionOf(pathname: string): NavSection | undefined {
  return SECTIONS.find((s) => [...s.pages.map((p) => p.href), ...(s.extra ?? [])].some((href) => matches(pathname, href)));
}

/** Sous-onglets à afficher : seulement sur les pages d'entrée d'une section qui en a plusieurs (pas en pleine partie). */
export function subPagesFor(pathname: string): NavPage[] | null {
  const section = sectionOf(pathname);
  if (!section || section.pages.length < 2) return null;
  return section.pages.some((p) => p.href === pathname) ? section.pages : null;
}
