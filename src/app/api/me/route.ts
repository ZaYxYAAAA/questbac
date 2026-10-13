import { currentSession, getSave, jsonError, publicUser, storageDown } from "@/lib/server/accounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/me — joueur connecté et sa sauvegarde serveur, ou 401.
 * Avec `?optional=1` (vérification au démarrage), un invité reçoit 200 `{ user: null }`
 * pour ne pas polluer la console du navigateur.
 */
export async function GET(req: Request) {
  const session = await currentSession();
  if (!session) {
    if (new URL(req.url).searchParams.has("optional")) return Response.json({ user: null, save: null, updatedAt: 0 }, { headers: { "Cache-Control": "no-store" } });
    return jsonError("Non connecté.", 401);
  }
  try {
    const stored = await getSave(session.uid);
    return Response.json(
      { user: publicUser({ id: session.uid, pseudo: session.pseudo }), save: stored?.save ?? null, updatedAt: stored?.updatedAt ?? 0 },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return storageDown(error);
  }
}
