import { after } from "next/server";
import { z } from "zod";
import { gradeDuel } from "@/lib/game/duel";
import { currentSession, jsonError, readJson, storageDown } from "@/lib/server/accounts";
import { opponentProfiles, saveDuel, sideOf, viewDuel, withDuel } from "@/lib/server/duels";
import { sendPush } from "@/lib/server/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PlayBody = z.object({
  answers: z.array(z.union([z.number(), z.boolean(), z.string().max(100)])).max(20),
  times: z.array(z.number()).max(20),
});

/** POST /api/duels/:id/play { answers, times } — enregistre mon tour ; le score est recalculé ici. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await currentSession();
  if (!session) return jsonError("Connecte-toi pour jouer en duel.", 401);
  const { id } = await params;
  const read = await readJson(req, 10_000);
  if (!read.ok) return read.response;
  const parsed = PlayBody.safeParse(read.body);
  if (!parsed.success) return jsonError("Réponses invalides.", 400);

  try {
    return await withDuel(id, async (duel) => {
      const i = duel ? sideOf(duel, session.uid) : -1;
      if (!duel || i < 0) return jsonError("Duel introuvable.", 404);
      if (duel.sides[i].play) return jsonError("Tu as déjà joué ce duel.", 409);
      if (Date.now() > duel.expiresAt) return jsonError("Ce duel a expiré.", 410);
      const play = gradeDuel(duel.questions, parsed.data.answers, parsed.data.times);
      if (!play) return jsonError("Réponses incomplètes.", 400);
      duel.sides[i].play = play;
      await saveDuel(duel);
      const other = duel.sides[1 - i];
      after(() =>
        sendPush(
          other.uid,
          other.play
            ? { title: "🏁 Résultat du duel disponible", body: `${session.pseudo} a joué : ${play.correct}/${play.results.length}. Découvre qui a gagné !`, url: `/duels/${duel.id}`, tag: `duel-${duel.id}` }
            : { title: "⚔️ À toi de jouer !", body: `${session.pseudo} a joué son tour de votre duel. Feras-tu mieux ?`, url: `/duels/${duel.id}`, tag: `duel-${duel.id}` },
        ),
      );
      return Response.json({ duel: viewDuel(duel, session.uid, await opponentProfiles([duel], session.uid)) }, { headers: { "Cache-Control": "no-store" } });
    });
  } catch (error) {
    return storageDown(error);
  }
}
