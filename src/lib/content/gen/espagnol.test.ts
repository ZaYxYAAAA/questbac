import { describe, expect, it } from "vitest";
import { seededRandom } from "@/lib/game/quests";
import { ESPAGNOL } from "./espagnol";

describe("espagnol", () => {
  it("les phrases espagnoles ne subissent pas l'élision française (« de octubre », « de acuerdo »)", () => {
    for (const [id, gens] of Object.entries(ESPAGNOL)) {
      gens.forEach((g, i) => {
        for (let s = 0; s < 60; s++) {
          const text = JSON.stringify(g(seededRandom(s * 31 + i)));
          expect(text, `${id}#${i}`).not.toMatch(/d'(octubre|acuerdo)/);
        }
      });
    }
  });
});
