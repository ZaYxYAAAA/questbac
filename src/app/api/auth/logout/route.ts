import { closeSession } from "@/lib/server/accounts";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout — supprime le cookie de session. */
export async function POST() {
  await closeSession();
  return Response.json({ ok: true });
}
