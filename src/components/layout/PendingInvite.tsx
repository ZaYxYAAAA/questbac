"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCloud } from "@/lib/store/cloud-sync";
import { addFriend, rememberInvite, takeInvite } from "@/lib/store/friends-store";
import { useToasts } from "@/lib/store/toast-store";

/**
 * Lien d'invitation (/invite/CODE) : le code est mémorisé tout de suite (même
 * pendant l'inscription), puis l'ami est ajouté dès que le joueur est connecté.
 */
export function PendingInvite() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCloud((s) => s.user);

  useEffect(() => {
    const match = pathname.match(/^\/invite\/([^/]+)/);
    if (match) rememberInvite(decodeURIComponent(match[1]));
  }, [pathname]);

  useEffect(() => {
    if (!user) return;
    const code = takeInvite();
    if (!code) return;
    const push = useToasts.getState().push;
    addFriend(code)
      .then(({ result, friend }) => {
        push(
          result === "added"
            ? { emoji: "🤝", title: friend ? `Toi et ${friend.pseudo} êtes amis !` : "Nouvel ami ajouté !", tone: "emerald" }
            : { emoji: "👥", title: "Vous êtes déjà amis.", tone: "violet" },
        );
        router.replace("/amis");
      })
      .catch((e) => {
        push({ emoji: "⚠️", title: "Invitation impossible", body: e instanceof Error ? e.message : undefined, tone: "rose" });
        // Sinon la page d'invitation affiche « Ajout de l'ami… » indéfiniment.
        router.replace("/amis");
      });
  }, [user, router]);

  return null;
}
