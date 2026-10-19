import { describe, expect, it } from "vitest";
import { publicLeaderboardRow } from "./leaderboard";
import { leagueRivals } from "./league";
import type { PublicProfile } from "./save";

const full: PublicProfile = {
  id: "pub1",
  pseudo: "Lina",
  avatar: "🐼",
  photoThumb: "data:image/jpeg;base64,PHOTO",
  titleId: "or",
  frameId: "argent",
  bannerId: "photo",
  bannerThumb: "data:image/jpeg;base64,BANNIERE",
  level: "premiere",
  playerLevel: 7,
  rp: 640,
  xp: 5200,
  weeklyXp: 300,
  week: "2026-W42",
  stats: { missions: 12, answered: 140, accuracy: 81 } as PublicProfile["stats"],
  updatedAt: 123,
};

describe("classement public (GET /api/leaderboard)", () => {
  it("ne publie ni photo, ni bannière, ni statistiques", () => {
    const row = publicLeaderboardRow(full);
    expect(row).toEqual({ id: "pub1", pseudo: "Lina", avatar: "🐼", titleId: "or", frameId: "argent", level: "premiere", playerLevel: 7, rp: 640, xp: 5200, weeklyXp: 300, week: "2026-W42" });
    const json = JSON.stringify(row);
    expect(json).not.toContain("PHOTO");
    expect(json).not.toContain("BANNIERE");
    expect(json).not.toContain("photo");
  });

  it("omet titre et cadre absents, et la ligue des invités reste calculable", () => {
    const { titleId: _t, frameId: _f, ...bare } = full;
    const row = publicLeaderboardRow(bare);
    expect("titleId" in row || "frameId" in row).toBe(false);
    const rivals = leagueRivals([row as PublicProfile], null, 600, new Date(2026, 9, 14, 12));
    expect(rivals).toEqual([{ id: "real-pub1", pseudo: "Lina", avatar: "🐼", weeklyXp: 300 }]);
  });
});
