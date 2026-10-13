// Codes d'ami (« QB-7KX4MP »), partagés par le client et le serveur.

/** Sans 0/O ni 1/I pour éviter les confusions à la lecture. */
export const FRIEND_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

/** Code lisible à partir d'octets (empreinte de l'identifiant du compte). */
export function codeFromBytes(bytes: Uint8Array): string {
  let body = "";
  for (let i = 0; i < CODE_LENGTH; i++) body += FRIEND_CODE_ALPHABET[bytes[i] % FRIEND_CODE_ALPHABET.length];
  return `QB-${body}`;
}

/** Accepte « qb-7kx4mp », « QB 7KX4MP » ou « 7KX4MP » ; renvoie null si le code est invalide. */
export function normalizeFriendCode(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const body = s.length === CODE_LENGTH + 2 && s.startsWith("QB") ? s.slice(2) : s;
  if (body.length !== CODE_LENGTH || [...body].some((c) => !FRIEND_CODE_ALPHABET.includes(c))) return null;
  return `QB-${body}`;
}
