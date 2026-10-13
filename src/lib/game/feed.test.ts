import { describe, expect, it } from "vitest";
import { buildFeed, describeEvent, rivalEvents, timeAgo } from "./feed";
import { MAX_FEED, pushFeed } from "./state";

const now = new Date(2026, 9, 12, 18, 30);

describe("fil d'actualité", () => {
  it("génère des exploits de rivaux déterministes et passés", () => {
    const a = rivalEvents(now, 6);
    expect(a).toHaveLength(6);
    expect(rivalEvents(now, 6)).toEqual(a);
    for (const e of a) expect(e.at).toBeLessThanOrEqual(now.getTime());
    for (let i = 1; i < a.length; i++) expect(a[i].at).toBeLessThanOrEqual(a[i - 1].at);
  });

  it("met en scène les rivaux demandés", () => {
    for (const e of rivalEvents(now, 5, ["Lina_Maths"])) expect(e.who).toBe("Lina_Maths");
  });

  it("mêle les événements du joueur, les plus récents d'abord", () => {
    const feed = buildFeed([{ at: now.getTime() - 1000, kind: "boss", ref: "derivatus" }], "🦊", now, 5);
    expect(feed[0]).toMatchObject({ mine: true, text: "Tu as terrassé Dérivatus !" });
    expect(feed).toHaveLength(5);
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
