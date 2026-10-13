import { clientKey, rateLimit } from "@/lib/ai/rate-limit";
import { currentSession, jsonError, storageDown } from "@/lib/server/accounts";
import { sendPush } from "@/lib/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/push/test — envoie une notification d'essai à mes appareils. */
export async function POST(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi.", 401);
  const limit = rateLimit(`pushtest:${session.uid}:${clientKey(req)}`, 5, 10 * 60_000);
  if (!limit.ok) return jsonError(`Patiente ${limit.retryAfter} s avant un nouvel essai.`, 429);
  try {
    const sent = await sendPush(session.uid, { title: "🔔 Notifications activées", body: `Bravo ${session.pseudo} ! Tu seras prévenu(e) des défis et de ta série.`, url: "/", tag: "test" });
    return Response.json({ sent });
  } catch (error) {
    return storageDown(error);
  }
}
