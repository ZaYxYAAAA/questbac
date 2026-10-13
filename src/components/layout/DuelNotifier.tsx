"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Swords } from "lucide-react";
import { useCloud } from "@/lib/store/cloud-sync";
import { loadDuels, pendingCount, useDuels } from "@/lib/store/duels-store";
import { useToasts } from "@/lib/store/toast-store";

/**
 * Pastille ⚔️ dans l'en-tête quand un duel attend le joueur (son tour ou une
 * récompense), avec un rappel à l'ouverture de l'appli.
 */
export function DuelNotifier() {
  const user = useCloud((s) => s.user);
  const pathname = usePathname();
  const duels = useDuels((s) => s.duels);
  const warned = useRef(false);

  useEffect(() => {
    if (user) loadDuels();
  }, [user, pathname]);

  const count = user ? pendingCount(duels) : 0;
  const myTurn = duels.filter((d) => d.status === "your_turn").length;

  useEffect(() => {
    if (warned.current || myTurn === 0) return;
    warned.current = true;
    useToasts.getState().push({ emoji: "⚔️", title: myTurn > 1 ? `${myTurn} duels t'attendent !` : "Un duel t'attend !", body: "C'est à ton tour de jouer.", tone: "violet" });
  }, [myTurn]);

  if (count === 0) return null;
  return (
    <Link href="/duels" aria-label={`${count} duel(s) en attente`} className="relative grid h-8 w-8 place-items-center rounded-full bg-rose-500/20 text-rose-200 hover:bg-rose-500/30">
      <Swords size={16} />
      <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">{count}</span>
    </Link>
  );
}
