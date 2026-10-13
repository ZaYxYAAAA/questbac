import { storageKind } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** Où sont rangées les sauvegardes (« ephemeral » = pas de base, données perdues au redémarrage). */
export function GET() {
  return Response.json({ storage: storageKind() });
}
