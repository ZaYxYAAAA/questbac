import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { DUEL_THEMES } from "@/lib/game/duel";

// Stockage fichier temporaire, choisi avant le premier accès au store.
const dir = mkdtempSync(path.join(tmpdir(), "qb-duels-"));
process.env.QB_DATA_DIR = dir;
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const { createDuel, getDuel, listDuels, saveDuel, withDuel } = await import("./duels");

const play = { correct: 5, timeMs: 30_000, results: [], playedAt: 0 };

describe("duels", () => {
  it("les deux joueurs qui jouent en même temps gardent chacun leur tour", async () => {
    const duel = await createDuel({ uid: "a", pseudo: "A" }, { uid: "b", pseudo: "B" }, DUEL_THEMES[0].id);
    await Promise.all(
      [0, 1].map((i) =>
        withDuel(duel.id, async (d) => {
          d!.sides[i].play = { ...play, correct: i };
          await saveDuel(d!);
        }),
      ),
    );
    const stored = await getDuel(duel.id);
    expect(stored!.sides.map((s) => s.play?.correct)).toEqual([0, 1]);
  });

  it("deux défis lancés en même temps restent dans la liste", async () => {
    const [d1, d2] = await Promise.all([
      createDuel({ uid: "c", pseudo: "C" }, { uid: "d", pseudo: "D" }, DUEL_THEMES[0].id),
      createDuel({ uid: "e", pseudo: "E" }, { uid: "d", pseudo: "D" }, DUEL_THEMES[0].id),
    ]);
    expect((await listDuels("d")).map((x) => x.id).sort()).toEqual([d1.id, d2.id].sort());
  });
});
