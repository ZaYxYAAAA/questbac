import { createECDH, randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import webpush from "web-push";
import { isSubscription, vapidKeys } from "./push";

describe("notifications push", () => {
  it("dérive des clés VAPID valides et stables", () => {
    const a = vapidKeys();
    expect(vapidKeys()).toEqual(a);
    expect(Buffer.from(a.publicKey, "base64url")).toHaveLength(65);
    expect(Buffer.from(a.privateKey, "base64url")).toHaveLength(32);
    expect(() => webpush.setVapidDetails("https://questbac.vercel.app", a.publicKey, a.privateKey)).not.toThrow();
  });

  it("chiffre une notification pour un abonnement", () => {
    const client = createECDH("prime256v1");
    client.generateKeys();
    const sub = { endpoint: "https://fcm.googleapis.com/fcm/send/abc", keys: { p256dh: client.getPublicKey().toString("base64url"), auth: randomBytes(16).toString("base64url") } };
    const { publicKey, privateKey } = vapidKeys();
    const req = webpush.generateRequestDetails(sub, JSON.stringify({ title: "Test", body: "Bonjour", url: "/" }), {
      vapidDetails: { subject: "https://questbac.vercel.app", publicKey, privateKey },
    });
    expect(req.endpoint).toBe(sub.endpoint);
    expect(String(req.headers.Authorization)).toMatch(/^vapid t=/);
    expect(req.headers["Content-Encoding"]).toBe("aes128gcm");
  });

  it("valide les abonnements reçus", () => {
    expect(isSubscription({ endpoint: "https://fcm.googleapis.com/x", keys: { p256dh: "abc", auth: "def" } })).toBe(true);
    expect(isSubscription({ endpoint: "http://evil", keys: { p256dh: "abc", auth: "def" } })).toBe(false);
    expect(isSubscription({ endpoint: "https://x" })).toBe(false);
    expect(isSubscription(null)).toBe(false);
  });
});
