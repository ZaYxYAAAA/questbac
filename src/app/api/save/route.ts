import { MAX_SAVE_BYTES, parseSave } from "@/lib/game/save";
import { currentSession, getSave, jsonError, putSave, readJson, storageDown } from "@/lib/server/accounts";
import { rankForSave } from "@/lib/server/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PUT /api/save — enregistre la progression. Le dernier écrit gagne : une
 * sauvegarde plus ancienne que celle du serveur est refusée (409) et le
 * serveur renvoie la sienne pour que le client la reprenne.
 */
export async function PUT(req: Request) {
  const session = await currentSession();
  if (!session) return jsonError("Session expirée : reconnecte-toi.", 401);

  const read = await readJson(req, MAX_SAVE_BYTES);
  if (!read.ok) return read.response;
  const parsed = parseSave((read.body as { save?: unknown } | null)?.save);
  if (!parsed.ok) return jsonError(parsed.error, 400);
  const save = parsed.data;
  // Horloge d'appareil très en avance : on ramène la date à maintenant pour ne pas bloquer les envois suivants.
  save.updatedAt = Math.min(save.updatedAt, Date.now() + 5 * 60_000);

  try {
    const stored = await getSave(session.uid);
    if (stored && stored.updatedAt > save.updatedAt) {
      return Response.json({ error: "Une sauvegarde plus récente existe.", save: stored.save, updatedAt: stored.updatedAt }, { status: 409 });
    }
    // Le pseudo du compte fait foi (il sert à se connecter et au classement).
    if (save.profile) save.profile = { ...save.profile, pseudo: session.pseudo };
    // Le rang affiché partout est le rang Général du mode classé, tenu par le serveur.
    Object.assign(save, await rankForSave(session.uid));
    await putSave({ id: session.uid, pseudo: session.pseudo }, save);
    return Response.json({ ok: true, updatedAt: save.updatedAt });
  } catch (error) {
    return storageDown(error);
  }
}
