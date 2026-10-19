import { describe, expect, it } from "vitest";
import { isCorrect } from "@/lib/game/session";
import { seededRandom } from "@/lib/game/quests";
import { CHAPTERS } from "./curriculum";
import { CHAPTER_GENERATORS, chapterQuestions, factKey, generatorsForTopic, mixedTierQuestions, questionKey, templateKey } from "./generated";
import { CULTURE_TIERS } from "./gen/culture";

const BAD = /NaN|undefined|Infinity|\[object/;

describe("questions générées", () => {
  it("couvrent chaque chapitre du programme", () => {
    for (const c of CHAPTERS) expect(CHAPTER_GENERATORS[c.id]?.length ?? 0, c.id).toBeGreaterThanOrEqual(4);
  });

  it("sont bien formées sur de nombreux tirages", () => {
    for (const [id, gens] of Object.entries(CHAPTER_GENERATORS)) {
      const r = seededRandom(42);
      gens.forEach((g, gi) => {
        for (let i = 0; i < 80; i++) {
          const q = g(r);
          const where = `${id}#${gi}: ${q.prompt}`;
          expect(q.prompt, where).not.toMatch(BAD);
          expect(q.explanation, where).not.toMatch(BAD);
          expect(q.prompt.length, where).toBeGreaterThan(5);
          if (q.type === "mcq") {
            expect(q.choices.length, where).toBeGreaterThanOrEqual(3);
            expect(new Set(q.choices).size, `${where} → ${q.choices.join(" | ")}`).toBe(q.choices.length);
            expect(q.answer, where).toBeGreaterThanOrEqual(0);
            for (const c of q.choices) expect(c, where).not.toMatch(BAD);
          }
          if (q.type === "numeric") {
            expect(Number.isFinite(q.answer), where).toBe(true);
            expect(isCorrect({ ...q, id: "x" }, String(q.answer).replace(".", ",")), where).toBe(true);
          }
        }
      });
    }
  }, 60_000);

  it("ont des formules LaTeX qui s'affichent sans erreur", async () => {
    const katex = (await import("katex")).default;
    const errors: string[] = [];
    for (const [id, gens] of Object.entries(CHAPTER_GENERATORS)) {
      const r = seededRandom(5);
      gens.forEach((g, gi) => {
        for (let i = 0; i < 15; i++) {
          const q = g(r);
          const texts = [q.prompt, q.explanation, ...(q.type === "mcq" ? q.choices : [])];
          for (const t of texts) {
            for (const m of t.replace(/\$\$[^$]*\$\$/g, "").matchAll(/\$([^$]+)\$/g)) {
              try {
                katex.renderToString(m[1], { throwOnError: true, strict: "ignore" });
              } catch (e) {
                errors.push(`${id}#${gi} : ${m[1]} → ${(e as Error).message.slice(0, 80)}`);
              }
            }
          }
        }
      });
    }
    expect([...new Set(errors)].slice(0, 30)).toEqual([]);
  }, 120_000);

  it("ne reposent pas une information (même sous une autre forme) avant d'avoir épuisé le chapitre", () => {
    const bad: string[] = [];
    for (const id of Object.keys(CHAPTER_GENERATORS)) {
      const seen: string[] = [];
      const r = seededRandom(7);
      // 4 missions de 8 questions d'affilée : une information n'est reposée que s'il ne reste
      // que des variantes chiffrées de calculs déjà posés au moins deux fois dans la mission.
      for (let m = 0; m < 4; m++) {
        const qs = chapterQuestions(id, 8, r, seen);
        const uses = new Map<string, number>();
        for (const q of qs) uses.set(templateKey(q), (uses.get(templateKey(q)) ?? 0) + 1);
        const repeated = qs.filter((q) => seen.includes(factKey(q)));
        if (repeated.length > 0 && Math.max(...uses.values()) < 2) bad.push(`${id} (mission ${m + 1}) : ${repeated[0].prompt}`);
        for (const q of qs) seen.push(factKey(q));
      }
      if (id === "philo-t-liberte" && new Set(seen).size < 32) bad.push(`${id} (${new Set(seen).size})`);
    }
    expect(bad).toEqual([]);
  });

  it("ne remplissent pas une mission avec le même calcul aux nombres près", () => {
    const bad: string[] = [];
    for (const id of Object.keys(CHAPTER_GENERATORS)) {
      const seen: string[] = [];
      const r = seededRandom(13);
      // Même une fois les banques du chapitre épuisées (12 missions d'affilée).
      for (let m = 0; m < 12; m++) {
        const qs = chapterQuestions(id, 6, r, seen);
        const uses = new Map<string, number>();
        for (const q of qs) uses.set(templateKey(q), (uses.get(templateKey(q)) ?? 0) + 1);
        const worst = Math.max(...uses.values());
        if (worst > 3) bad.push(`${id} (mission ${m + 1}) : ${worst} fois le même gabarit`);
        for (const q of qs) seen.push(factKey(q));
      }
    }
    expect(bad).toEqual([]);
  });

  it("reposent d'abord les informations vues il y a le plus longtemps", () => {
    for (const id of ["philo-t-liberte", "hg-t-mers", "fr-1-commentaire"]) {
      const seen: string[] = [];
      const last = new Map<string, number>();
      let pos = 0;
      let minGap = Infinity;
      const r = seededRandom(21);
      for (let m = 0; m < 25; m++) {
        for (const q of chapterQuestions(id, 6, r, seen)) {
          const k = factKey(q);
          if (last.has(k)) minGap = Math.min(minGap, pos - last.get(k)!);
          last.set(k, pos++);
          const i = seen.indexOf(k);
          if (i >= 0) seen.splice(i, 1);
          seen.push(k);
        }
      }
      // Banque épuisée plusieurs fois : une information revient au plus tôt après presque toutes les autres.
      expect(minGap, id).toBeGreaterThanOrEqual(last.size - 12);
    }
  });

  it("ne posent jamais deux fois le même énoncé dans une partie de Culture générale à niveaux mélangés", () => {
    for (const id of Object.keys(CULTURE_TIERS)) {
      const r = seededRandom(5);
      const seen: string[] = [];
      for (let m = 0; m < 30; m++) {
        const qs = mixedTierQuestions(id, 10, r, seen);
        expect(qs.length, id).toBe(10);
        expect(new Set(qs.map(questionKey)).size, `${id} : ${qs.map((q) => q.prompt).join(" | ")}`).toBe(10);
        expect(new Set(qs.map(factKey)).size, id).toBe(10);
        seen.push(...qs.map(factKey));
      }
    }
  });

  it("ne posent jamais deux fois la même information dans une mission", () => {
    for (const id of Object.keys(CHAPTER_GENERATORS)) {
      const qs = chapterQuestions(id, 10, seededRandom(11));
      expect(new Set(qs.map(factKey)).size, id).toBe(qs.length);
    }
  });

  it("trouvent des générateurs pour un sujet libre", () => {
    expect(generatorsForTopic("maths", "premiere", "les suites géométriques").generators.length).toBeGreaterThan(0);
    expect(generatorsForTopic("maths", "seconde", "zzz").generators.length).toBeGreaterThan(0);
  });
});
