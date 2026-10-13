import { AI_MODEL, isAiEnabled } from "@/lib/ai/config";
import { storageKind } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/**
 * Indique au client si l'IA est réellement connectée (sinon : mode démo) et
 * où sont rangées les sauvegardes (« ephemeral » = pas de base, données perdues au redémarrage).
 */
export function GET() {
  const enabled = isAiEnabled();
  return Response.json({ ai: enabled, model: enabled ? AI_MODEL : null, storage: storageKind() });
}
