"use client";

import { create } from "zustand";

/**
 * Notifications push côté navigateur : enregistrement du service worker,
 * abonnement / désabonnement et état affiché dans l'interface.
 */

export type PushState =
  | "checking"
  | "unsupported" // navigateur sans Web Push
  | "ios-install" // iPhone / iPad : il faut d'abord ajouter l'appli à l'écran d'accueil
  | "denied" // refusé dans les réglages
  | "off"
  | "on";

export const usePush = create<{ state: PushState; busy: boolean; error: string | null }>(() => ({ state: "checking", busy: false, error: null }));

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;

function keyBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration() {
  return navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
}

/** Détermine l'état au démarrage (et enregistre le service worker). */
export async function initPush() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    usePush.setState({ state: isIos() && !isStandalone() ? "ios-install" : "unsupported" });
    return;
  }
  try {
    const reg = await registration();
    if (Notification.permission === "denied") return usePush.setState({ state: "denied" });
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return usePush.setState({ state: "off" });
    // Abonné sur cet appareil : on vérifie que le serveur le connaît pour ce compte.
    const res = await fetch(`/api/push?endpoint=${encodeURIComponent(sub.endpoint)}`, { cache: "no-store" });
    const json = res.ok ? ((await res.json()) as { subscribed: boolean }) : { subscribed: false };
    usePush.setState({ state: json.subscribed ? "on" : "off" });
  } catch {
    usePush.setState({ state: "unsupported" });
  }
}

export async function enablePush(): Promise<boolean> {
  usePush.setState({ busy: true, error: null });
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      usePush.setState({ state: permission === "denied" ? "denied" : "off", busy: false });
      return false;
    }
    const reg = await registration();
    await navigator.serviceWorker.ready;
    const { publicKey } = (await (await fetch("/api/push", { cache: "no-store" })).json()) as { publicKey: string };
    let sub = await reg.pushManager.getSubscription();
    // Clé du serveur changée : on repart d'un abonnement neuf.
    if (sub && sub.options.applicationServerKey) {
      const current = new Uint8Array(sub.options.applicationServerKey);
      const wanted = keyBytes(publicKey);
      if (current.length !== wanted.length || current.some((b, i) => b !== wanted[i])) {
        await sub.unsubscribe();
        sub = null;
      }
    }
    sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(publicKey) });
    const res = await fetch("/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub.toJSON() }) });
    if (!res.ok) throw new Error(((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? `Erreur ${res.status}`);
    usePush.setState({ state: "on", busy: false });
    void fetch("/api/push/test", { method: "POST" });
    return true;
  } catch (e) {
    const name = e instanceof DOMException ? e.name : "";
    const message =
      name === "NotAllowedError" || name === "AbortError"
        ? "Le navigateur a refusé l'abonnement aux notifications. Vérifie qu'elles sont autorisées pour QuestBac, puis réessaie."
        : e instanceof Error && /[àéèç]/.test(e.message)
          ? e.message
          : "Activation impossible pour le moment. Réessaie plus tard.";
    usePush.setState({ busy: false, error: message });
    return false;
  }
}

export async function disablePush() {
  usePush.setState({ busy: true, error: null });
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      await sub.unsubscribe();
    }
    usePush.setState({ state: "off", busy: false });
  } catch (e) {
    usePush.setState({ busy: false, error: e instanceof Error ? e.message : "Erreur" });
  }
}
