import { describe, expect, it } from "vitest";
import { buildFeed, describeEvent, timeAgo } from "./feed";
import { MAX_FEED, pushFeed } from "./state";

const now = new Date(2026, 9, 12, 18, 30);

describe("fil d'actualité", () => {
  it("liste les événements du joueur, les plus récents d'abord", () => {
    const feed = buildFeed([{ at: now.getTime() - 5000, kind: "level", ref: "3" }, { at: now.getTime() - 1000, kind: "boss", ref: "derivatus" }], 5);
    expect(feed[0]).toMatchObject({ text: "Tu as terrassé Dérivatus !" });
    expect(feed).toHaveLength(2);
    expect(buildFeed([], 5)).toEqual([]);
  });

  it("décrit chaque type d'événement", () => {
    expect(describeEvent({ at: 0, kind: "league", ref: "2:or" }).text).toBe("Tu as fini 2e de ta Ligue Or.");
    expect(describeEvent({ at: 0, kind: "league", ref: "1:bronze" }).text).toContain("1er");
    expect(describeEvent({ at: 0, kind: "rank", ref: "Argent III" }).text).toContain("Argent III");
    expect(describeEvent({ at: 0, kind: "achievement", ref: "combo-5" }).text).toContain("En feu");
  });

  it("garde un nombre limité d'événements", () => {
    let feed = pushFeed([], []);
    for (let i = 0; i < MAX_FEED + 5; i++) feed = pushFeed(feed, [{ at: i, kind: "level", ref: String(i) }]);
    expect(feed).toHaveLength(MAX_FEED);
    expect(feed[0].at).toBe(MAX_FEED + 4);
    expect(timeAgo(now.getTime() - 5 * 60_000, now.getTime())).toBe("il y a 5 min");
  });
});
