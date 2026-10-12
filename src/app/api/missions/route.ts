import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { AI_EFFORT, AI_MODEL, FALLBACK_PARAMS, getClient, isAiEnabled } from "@/lib/ai/config";
import { demoMission } from "@/lib/ai/demo";
import { missionSystemPrompt, missionUserPrompt } from "@/lib/ai/prompts";
import { clientKey, rateLimit } from "@/lib/ai/rate-limit";
import { GeneratedQuestion, MissionRequest, normalizeQuestions } from "@/lib/ai/schemas";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Schéma JSON imposé au modèle (sortie structurée). */
const MISSION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["problem", "title", "summary", "fiche", "questions"],
  properties: {
    problem: { type: ["string", "null"] },
    title: { type: "string" },
    summary: { type: "string" },
    fiche: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type", "prompt", "choices", "answer_index", "answer_bool", "answer_number", "tolerance", "unit", "explanation", "difficulty"],
        properties: {
          type: { type: "string", enum: ["mcq", "truefalse", "numeric"] },
          prompt: { type: "string" },
          choices: { type: "array", items: { type: "string" } },
          answer_index: { type: ["integer", "null"] },
          answer_bool: { type: ["boolean", "null"] },
          answer_number: { type: ["number", "null"] },
          tolerance: { type: ["number", "null"] },
          unit: { type: ["string", "null"] },
          explanation: { type: "string" },
          difficulty: { type: "integer", enum: [1, 2, 3] },
        },
      },
    },
  },
} as const;

/** Validation tolérante : une question mal formée est ignorée, pas toute la mission. */
const Envelope = z.object({
  problem: z.string().nullable(),
  title: z.string(),
  summary: z.string(),
  fiche: z.string(),
  questions: z.array(z.unknown()),
});

function error(message: string, status: number, extra?: HeadersInit) {
  return Response.json({ error: message }, { status, headers: extra });
}

/**
 * POST /api/missions — transforme un cours (photos, texte, fiche ou sujet)
 * en mission jouable : titre, fiche de révision et questions.
 */
export async function POST(req: Request) {
  const parsed = MissionRequest.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Requête invalide", 400);
  const input = parsed.data;

  if (!isAiEnabled()) {
    return Response.json({ ...demoMission(input.level, input.subject, input.count, input.topic), demo: true });
  }

  const limit = rateLimit(`mission:${clientKey(req)}`, 6, 10 * 60_000);
  if (!limit.ok) return error(`Doucement ! Réessaie dans ${limit.retryAfter} s.`, 429, { "Retry-After": String(limit.retryAfter) });

  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  for (const image of input.images ?? []) {
    content.push({ type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } });
  }
  content.push({
    type: "text",
    text: missionUserPrompt({ ...input, imageCount: input.images?.length ?? 0 }),
  });

  try {
    const message = await getClient()
      .beta.messages.stream({
        model: AI_MODEL,
        max_tokens: 32000,
        thinking: { type: "adaptive" },
        output_config: { effort: AI_EFFORT, format: { type: "json_schema", schema: MISSION_JSON_SCHEMA } },
        system: missionSystemPrompt(),
        messages: [{ role: "user", content }],
        ...FALLBACK_PARAMS,
      })
      .finalMessage();

    if (message.stop_reason === "refusal") {
      return error("Le Prof IA ne peut pas traiter ce contenu. Vérifie qu'il s'agit bien d'un cours.", 422);
    }
    if (message.stop_reason === "max_tokens") {
      return error("Le cours est trop long pour une seule mission : essaie avec moins de pages ou de questions.", 422);
    }

    const text = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const envelope = Envelope.safeParse(JSON.parse(text));
    if (!envelope.success) return error("Réponse inattendue du Prof IA, réessaie.", 502);

    const valid = envelope.data.questions.flatMap((q) => {
      const r = GeneratedQuestion.safeParse(q);
      return r.success ? [r.data] : [];
    });
    const questions = normalizeQuestions(valid, `ai-${Date.now().toString(36)}`);

    if (questions.length === 0) {
      return error(envelope.data.problem || "Impossible de créer des questions à partir de ce contenu.", 422);
    }

    return Response.json({
      title: envelope.data.title.trim() || "Mission sans titre",
      summary: envelope.data.summary.trim(),
      fiche: envelope.data.fiche,
      questions,
      demo: false,
    });
  } catch (e) {
    if (e instanceof SyntaxError) return error("Réponse illisible du Prof IA, réessaie.", 502);
    if (e instanceof Anthropic.RateLimitError) return error("Le Prof IA est très sollicité, réessaie dans une minute.", 503);
    if (e instanceof Anthropic.BadRequestError) {
      console.error("[missions] requête refusée", e.message);
      return error("Contenu refusé (image trop lourde ou format non pris en charge ?).", 400);
    }
    if (e instanceof Anthropic.APIError) {
      console.error("[missions] erreur API", e.status, e.message);
      return error("Le Prof IA est indisponible pour le moment.", 502);
    }
    throw e;
  }
}
