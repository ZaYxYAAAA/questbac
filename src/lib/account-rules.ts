// Règles des comptes, partagées par les formulaires et le serveur.

/** Renvoie un message d'erreur, ou null si le pseudo est valide. */
export function pseudoError(pseudo: string): string | null {
  const p = pseudo.trim();
  if (p.length < 2) return "Ton pseudo doit faire au moins 2 caractères.";
  if (p.length > 20) return "Ton pseudo doit faire au plus 20 caractères.";
  if (!/^[\p{L}\p{N}_.\-]+$/u.test(p)) return "Ton pseudo ne peut contenir que des lettres, des chiffres, « _ », « . » et « - ».";
  return null;
}

export function passwordError(password: string): string | null {
  if (password.length < 6) return "Ton mot de passe doit faire au moins 6 caractères.";
  if (password.length > 200) return "Ton mot de passe est trop long.";
  return null;
}
