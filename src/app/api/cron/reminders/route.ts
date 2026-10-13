import { duelState } from "@/lib/game/duel";
import { getSave } from "@/lib/server/accounts";
import { listDuels, sideOf } from "@/lib/server/duels";
import { settleIfNeeded } from "@/lib/server/ranked";
import { sendPush, subscribedAccounts } from "@/lib/server/push";
import { getStore } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Date du jour (AAAA-MM-JJ) à Paris, décalée de `offset` jours. */
function parisDay(offset = 0, now = Date.now()) {
  return new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now + offset * 86_400_000));
}

/**
 * GET /api/cron/reminders — appelé chaque soir par Vercel Cron (voir vercel.json).
 * Prévient les joueurs abonnés dont la série va se perdre ou qui ont des duels en attente.
 * Un seul rappel par joueur et par jour.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const fromVercel = (req.headers.get("user-agent") ?? "").startsWith("vercel-cron");
  if (secret ? auth !== `Bearer ${secret}` : !fromVercel) return new Response("Forbidden", { status: 403 });

  // Promotions de la semaine classée (au cas où personne n'a ouvert l'appli depuis lundi).
  await settleIfNeeded().catch((e) => console.error("[classé] clôture de semaine", e));

  const today = parisDay(), yesterday = parisDay(-1);
  const store = getStore();
  let sent = 0;
  for (const uid of await subscribedAccounts()) {
    try {
      if ((await store.get<string>(`reminded:${uid}`)) === today) continue;
      const stored = await getSave(uid);
      const streak = stored?.save.streak;
      const atRisk = streak && streak.count > 0 && streak.lastDay === yesterday;
      const duels = await listDuels(uid);
      const waiting = duels.filter((d) => {
        const i = sideOf(d, uid);
        return i >= 0 && duelState(d.sides[i].play, d.sides[1 - i].play, d.expiresAt).status === "your_turn";
      }).length;

      let message: Parameters<typeof sendPush>[1] | null = null;
      if (atRisk) {
        message = {
          title: `🔥 Ta série de ${streak.count} jour${streak.count > 1 ? "s" : ""} va se perdre !`,
          body: waiting ? `Fais une mission avant minuit… et ${waiting} duel${waiting > 1 ? "s t'attendent" : " t'attend"} !` : "Une petite mission de 2 minutes suffit pour la garder.",
          url: "/",
          tag: "streak",
        };
      } else if (waiting) {
        message = { title: `⚔️ ${waiting} duel${waiting > 1 ? "s" : ""} en attente`, body: "Tes amis attendent ta réponse. À toi de jouer !", url: "/duels", tag: "duels" };
      }
      if (!message) continue;
      sent += await sendPush(uid, message);
      await store.set(`reminded:${uid}`, today);
    } catch {
      // un joueur en erreur ne bloque pas les autres
    }
  }
  return Response.json({ sent });
}
