import { z } from "zod";
import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { addSubscription, hasSubscription, isSubscription, removeSubscription, vapidKeys } from "@/lib/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

/** GET /api/push?endpoint=… — clé publique VAPID et état de l'abonnement de cet appareil. */
export async function GET(req: Request) {
  const session = await currentSession();
  const endpoint = new URL(req.url).searchParams.get("endpoint") ?? undefined;
  try {
    return Response.json(
      { publicKey: vapidKeys().publicKey, subscribed: session && endpoint ? await hasSubscription(session.uid, endpoint) : false },
      { headers: NO_STORE },
    );
  } catch (error) {
    return storageDown(error);
  }
}

/** POST /api/push { subscription } — abonne cet appareil aux notifications. */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour activer les notifications.", 401);
  const read = await readJson(req, 4_000);
  if (!read.ok) return read.response;
  const sub = (read.body as { subscription?: unknown })?.subscription;
  if (!isSubscription(sub)) return jsonError("Abonnement invalide.", 400);
  try {
    await addSubscription(session.uid, sub);
    return Response.json({ ok: true }, { headers: NO_STORE });
  } catch (error) {
    return storageDown(error);
  }
}

const RemoveBody = z.object({ endpoint: z.string().max(1000) });

/** DELETE /api/push { endpoint } — désabonne cet appareil. */
export async function DELETE(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi.", 401);
  const read = await readJson(req, 2_000);
  if (!read.ok) return read.response;
  const parsed = RemoveBody.safeParse(read.body);
  if (!parsed.success) return jsonError("Requête invalide.", 400);
  try {
    await removeSubscription(session.uid, parsed.data.endpoint);
    return Response.json({ ok: true }, { headers: NO_STORE });
  } catch (error) {
    return storageDown(error);
  }
}
