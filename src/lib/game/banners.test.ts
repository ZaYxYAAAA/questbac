import { describe, expect, it } from "vitest";
import { BANNERS, PHOTO_BANNER, bannerById, defaultBannerId, isBannerUnlocked, unlockLabel } from "./banners";
import { activeBannerId, parseSave, publicProfileFrom } from "./save";
import { createInitialData } from "./state";

const ctx = (o: Partial<Parameters<typeof isBannerUnlocked>[1]> = {}) => ({ peakRp: 0, level: 1, bossesWon: 0, streakBest: 0, achievements: 0, ...o });

describe("bannières", () => {
  it("ont des identifiants uniques et jamais « photo »", () => {
    const ids = BANNERS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain(PHOTO_BANNER);
  });

  it("se débloquent avec le meilleur rang atteint, le niveau, les boss…", () => {
    expect(isBannerUnlocked(bannerById("nuit")!, ctx())).toBe(true);
    expect(isBannerUnlocked(bannerById("or")!, ctx({ peakRp: 799 }))).toBe(false);
    expect(isBannerUnlocked(bannerById("or")!, ctx({ peakRp: 800 }))).toBe(true);
    expect(isBannerUnlocked(bannerById("argent")!, ctx({ peakRp: 9000 }))).toBe(true);
    expect(isBannerUnlocked(bannerById("galaxie")!, ctx({ level: 24 }))).toBe(false);
    expect(isBannerUnlocked(bannerById("chasseur")!, ctx({ bossesWon: 3 }))).toBe(true);
    expect(unlockLabel(bannerById("platine")!.unlock)).toBe("Atteindre Platine");
    expect(defaultBannerId(0)).toBe("bronze");
    expect(defaultBannerId(5000)).toBe("maitre");
  });

  it("une bannière verrouillée choisie n'est pas publiée", () => {
    const save = createInitialData();
    save.profile = { pseudo: "Zoé", avatar: "🦊", level: "premiere", createdAt: 0, bannerId: "legende" };
    expect(publicProfileFrom({ publicId: "p", pseudo: "Zoé" }, save).bannerId).toBeUndefined();
    save.peakRp = 9100;
    expect(publicProfileFrom({ publicId: "p", pseudo: "Zoé" }, save).bannerId).toBe("legende");
  });

  it("l'image envoyée : seule la miniature est publique, et il faut qu'elle soit valide", () => {
    const thumb = `data:image/jpeg;base64,${"A".repeat(200)}`;
    expect(activeBannerId({ bannerId: PHOTO_BANNER }, ctx())).toBeUndefined();
    expect(activeBannerId({ bannerId: PHOTO_BANNER, bannerThumb: thumb }, ctx())).toBe(PHOTO_BANNER);
    const save = createInitialData();
    save.profile = { pseudo: "Zoé", avatar: "🦊", level: "premiere", createdAt: 0, bannerId: PHOTO_BANNER, banner: thumb, bannerThumb: thumb };
    const pub = publicProfileFrom({ publicId: "p", pseudo: "Zoé" }, save);
    expect(pub.bannerThumb).toBe(thumb);
    expect(JSON.stringify(pub)).not.toContain('"banner"');
    expect(pub.stats?.missions).toBe(0);
  });

  it("une sauvegarde avec une bannière abîmée reste valide (bannière retirée)", () => {
    const save = createInitialData();
    save.profile = { pseudo: "Zoé", avatar: "🦊", level: "premiere", createdAt: 0, banner: "pas une image" };
    const parsed = parseSave(JSON.parse(JSON.stringify(save)));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) expect(parsed.data.profile?.banner).toBeUndefined();
  });
});
