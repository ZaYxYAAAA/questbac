"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { normalizeFriendCode } from "@/lib/friend-code";
import { useCloud } from "@/lib/store/cloud-sync";

/**
 * Invitation d'un ami. L'ajout lui-même est fait par <PendingInvite /> dès que le
 * joueur est connecté ; cette page explique quoi faire sinon.
 */
export default function InvitePage() {
  const params = useParams<{ code: string }>();
  const code = normalizeFriendCode(decodeURIComponent(params.code ?? ""));
  const { user, checked } = useCloud();

  return (
    <div className="mx-auto max-w-md space-y-4 py-10 text-center">
      <p className="text-6xl">🤝</p>
      <h1 className="text-2xl font-black text-white">Invitation d&apos;un ami</h1>
      {!code ? (
        <p className="text-slate-400">Ce lien d&apos;invitation n&apos;est pas valide.</p>
      ) : !checked || user ? (
        <p className="text-slate-400">Ajout de l&apos;ami <b className="font-mono text-white">{code}</b>…</p>
      ) : (
        <>
          <p className="text-slate-300">
            Pour devenir ami avec <b className="font-mono text-white">{code}</b>, il te faut un compte QuestBac. Crée-le (ou connecte-toi) depuis ton profil :
            l&apos;ami sera ajouté automatiquement.
          </p>
          <Link href="/profil" className="inline-block rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-500">
            Créer mon compte / me connecter
          </Link>
        </>
      )}
    </div>
  );
}
