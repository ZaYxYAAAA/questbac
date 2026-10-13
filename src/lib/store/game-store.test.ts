import { describe, expect, it } from "vitest";
import { serverSaveWins, toGameData } from "@/lib/game/save";
import { createInitialData } from "@/lib/game/state";
import { dayKey } from "@/lib/game/progression";
import { useGame } from "./game-store";

// Données d'un appareil resté fermé depuis la veille.
const yesterday = new Date(Date.now() - 36 * 3600 * 1000);
const profile = { pseudo: "Lina", avatar: "🦊", level: "premiere" as const, createdAt: 1 };
const staleLocal = { ...createInitialData(yesterday), profile, xp: 60, updatedAt: yesterday.getTime() };

describe("passage de jour / semaine (refresh)", () => {
  it("remet les quêtes au jour sans modifier updatedAt", () => {
    useGame.setState(staleLocal);
    useGame.getState().refresh();
    const s = useGame.getState();
    expect(s.quests.day).toBe(dayKey(new Date()));
    expect(s.updatedAt).toBe(staleLocal.updatedAt);
    expect(s.xp).toBe(60);
  });

  it("replaceAll garde updatedAt et met les quêtes d'une vieille sauvegarde au jour", () => {
    useGame.getState().replaceAll({ ...staleLocal, updatedAt: 1234 });
    expect(useGame.getState().updatedAt).toBe(1234);
    expect(useGame.getState().quests.day).toBe(dayKey(new Date()));
  });
});

describe("démarrage d'un appareil aux données anciennes", () => {
  it("la sauvegarde serveur plus récente gagne et n'est jamais écrasée", () => {
    // Un autre appareil a progressé : le serveur a 80 XP, plus récent.
    const serverData = { ...toGameData(staleLocal), xp: 80, updatedAt: Date.now() - 3600 * 1000 };
    const server = { save: serverData, updatedAt: serverData.updatedAt };

    // L'appareil A se rouvre : AppShell appelle refresh() avant la réponse de /api/me.
    useGame.setState(staleLocal);
    useGame.getState().refresh();
    const local = toGameData(useGame.getState());

    expect(local.updatedAt).toBeLessThan(server.updatedAt);
    expect(serverSaveWins(local, server)).toBe(true);
    useGame.getState().replaceAll(serverData);
    expect(useGame.getState().xp).toBe(80);
    // Rien de « plus récent » à renvoyer au serveur : pushNow() n'écrit pas.
    expect(useGame.getState().updatedAt > server.updatedAt).toBe(false);
  });

  it("une vraie action du joueur reste prioritaire", () => {
    useGame.setState(staleLocal);
    useGame.getState().recordActivity({ kind: "lab", labId: "test" });
    const local = toGameData(useGame.getState());
    expect(serverSaveWins(local, { save: {}, updatedAt: staleLocal.updatedAt + 1 })).toBe(false);
  });

  it("adopte la sauvegarde serveur si l'appareil n'a pas de profil", () => {
    expect(serverSaveWins({ ...createInitialData(), updatedAt: Date.now() }, { save: {}, updatedAt: 1 })).toBe(true);
    expect(serverSaveWins(staleLocal, { save: null, updatedAt: Date.now() })).toBe(false);
  });
});

describe("ligue et coffre quotidien dans le store", () => {
  it("change de semaine au refresh sans modifier updatedAt", () => {
    const lastWeek = new Date(Date.now() - 8 * 86_400_000);
    const old = { ...createInitialData(lastWeek), profile, rp: 100, peakRp: 100, updatedAt: lastWeek.getTime() };
    useGame.setState({ ...old, weekly: { ...old.weekly, xp: 5000 } });
    useGame.getState().refresh();
    const s = useGame.getState();
    expect(s.weekly.xp).toBe(0);
    expect(s.league.week).not.toBe(old.league.week);
    expect(s.updatedAt).toBe(old.updatedAt);
  });

  it("recopie le rang Général du classé sans toucher à updatedAt", () => {
    useGame.setState({ ...createInitialData(), profile, rp: 0, peakRp: 0, updatedAt: 5 });
    useGame.getState().syncRankedStep(6);
    expect(useGame.getState().rp).toBe(800);
    expect(useGame.getState().peakRp).toBe(800);
    expect(useGame.getState().updatedAt).toBe(5);
  });

  it("le coffre du jour ne s'ouvre qu'une fois", () => {
    useGame.setState({ ...createInitialData(), profile });
    expect(useGame.getState().claimDaily()?.reward.day).toBe(1);
    expect(useGame.getState().claimDaily()).toBeNull();
    expect(useGame.getState().xp).toBe(30);
  });
});
