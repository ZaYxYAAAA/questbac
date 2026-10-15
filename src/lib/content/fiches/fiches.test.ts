import { describe, expect, it } from "vitest";
import { CHAPTERS, subjectMeta } from "@/lib/content/curriculum";
import { chapterMemos } from "@/lib/content/generated";
import { ficheFor, ficheIds } from "./index";

describe("fiches de révision", () => {
  it("chaque chapitre du programme a son essentiel", () => {
    const missing = CHAPTERS.filter((c) => !subjectMeta(c.subject).extra && (ficheFor(c.id)?.essentiel.length ?? 0) < 3).map((c) => c.id);
    expect(missing).toEqual([]);
  });
  it("aucune fiche orpheline", () => {
    const ids = new Set(CHAPTERS.map((c) => c.id));
    expect(ficheIds().filter((id) => !ids.has(id))).toEqual([]);
  });
  it("les banques de connaissances donnent des cartes mémoire", () => {
    expect(chapterMemos("cg-capitales").length).toBeGreaterThan(80);
    expect(chapterMemos("svt-2-metabolisme").length).toBeGreaterThan(10);
    const sample = chapterMemos("cg-capitales")[0];
    expect(sample.front).toBeTruthy();
    expect(sample.back).toBeTruthy();
  });
  it("le LaTeX des fiches est équilibré", () => {
    for (const id of ficheIds()) {
      const f = ficheFor(id)!;
      for (const line of [...f.essentiel, ...f.pieges]) {
        expect((line.match(/\$/g) ?? []).length % 2, `${id} : ${line}`).toBe(0);
        expect((line.match(/\{/g) ?? []).length, `${id} : ${line}`).toBe((line.match(/\}/g) ?? []).length);
      }
    }
  });
});
