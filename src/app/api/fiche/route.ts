import Anthropic from "@anthropic-ai/sdk";
import { AI_EFFORT, AI_MODEL, FALLBACK_PARAMS, getClient, isAiEnabled } from "@/lib/ai/config";
import { demoFiche } from "@/lib/ai/demo";
import { ficheSystemPrompt, ficheUserPrompt } from "@/lib/ai/prompts";
import { clientKey, rateLimit } from "@/lib/ai/rate-limit";
import { FicheRequest } from "@/lib/ai/schemas";

export const runtime = "nodejs";
export const maxDuration = 300;

const encoder = new TextEncoder();

function textStream(chunks: AsyncIterable<string>, onCancel?: () => void) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      } catch (error) {
        console.error("[fiche] erreur de streaming", error);
        controller.enqueue(encoder.encode("\n\n> ⚠️ La génération a été interrompue. Réessaie dans un instant."));
      } finally {
        controller.close();
      }
    },
    cancel: onCancel,
  });
}

async function* demoChunks(text: string) {
  for (const word of text.split(/(?<=\s)/)) {
    yield word;
    await new Promise((r) => setTimeout(r, 8));
  }
}

/**
 * POST /api/fiche — génère une fiche de révision en streaming (texte Markdown brut).
 */
export async function POST(req: Request) {
  const parsed = FicheRequest.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Requête invalide" }, { status: 400 });
  }
  const input = parsed.data;
  const headers = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };

  if (!isAiEnabled()) {
    return new Response(textStream(demoChunks(demoFiche(input.level, input.subject, input.topic))), {
      headers: { ...headers, "X-QB-Demo": "1" },
    });
  }

  const limit = rateLimit(`fiche:${clientKey(req)}`, 10, 10 * 60_000);
  if (!limit.ok) {
    return Response.json(
      { error: `Doucement ! Réessaie dans ${limit.retryAfter} s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const stream = getClient().beta.messages.stream({
    model: AI_MODEL,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    output_config: { effort: AI_EFFORT },
    system: ficheSystemPrompt(),
    messages: [{ role: "user", content: ficheUserPrompt(input) }],
    ...FALLBACK_PARAMS,
  });

  async function* chunks() {
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      yield "\n\n> ⚠️ Le Prof IA ne peut pas traiter cette demande. Essaie de reformuler ton sujet.";
    } else if (final.stop_reason === "max_tokens") {
      yield "\n\n> ✂️ Fiche tronquée : demande une notion plus précise ou le format « express ».";
    }
  }

  try {
    return new Response(textStream(chunks(), () => stream.abort()), { headers: { ...headers, "X-QB-Demo": "0" } });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return Response.json({ error: "Le Prof IA est indisponible pour le moment." }, { status: 502 });
    }
    throw error;
  }
}
