import { AI_MODEL, isAiEnabled } from "@/lib/ai/config";

export const dynamic = "force-dynamic";

/** Indique au client si l'IA est réellement connectée (sinon : mode démo). */
export function GET() {
  const enabled = isAiEnabled();
  return Response.json({ ai: enabled, model: enabled ? AI_MODEL : null });
}
