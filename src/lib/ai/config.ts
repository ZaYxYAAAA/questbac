import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

const EFFORTS: Effort[] = ["low", "medium", "high", "xhigh", "max"];
export const AI_EFFORT: Effort = EFFORTS.includes(process.env.ANTHROPIC_EFFORT as Effort)
  ? (process.env.ANTHROPIC_EFFORT as Effort)
  : "medium";

/**
 * L'IA est active si une clé (ou un jeton) Anthropic est configurée et que
 * le mode démo n'est pas forcé. Sinon les routes renvoient du contenu de démonstration.
 */
export function isAiEnabled() {
  if (process.env.AI_DEMO_MODE === "1") return false;
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

let client: Anthropic | null = null;
export function getClient() {
  client ??= new Anthropic({ maxRetries: 2 });
  return client;
}

/** Repli serveur automatique si le modèle principal décline une requête. */
export const FALLBACK_PARAMS: Pick<Anthropic.Beta.MessageCreateParams, "betas" | "fallbacks"> = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
};
