import { describe, expect, it } from "vitest";
import { CHAPTERS, subjectMeta } from "@/lib/content/curriculum";
import { chapterMemos } from "@/lib/content/generated";
import { ficheFor, ficheIds, ficheTexts, parseFiches } from "./index";
import { notationsIn } from "./notations";

describe("fiches de révision", () => {
  it("chaque chapitre du programme a son essentiel", () => {
    const missing = CHAPTERS.filter((c) => !subjectMeta(c.subject).extra && (ficheFor(c.id)?.essentiel.length ?? 0) < 3).map((c) => c.id);
    expect(missing).toEqual([]);
  });
  it("aucune fiche orpheline", () => {
    const ids = new Set(CHAPTERS.map((c) => c.id));
    expect(ficheIds().filter((id) => !ids.has(id))).toEqual([]);
  });
  it("les maths et la physique-chimie sont expliquées, avec des exemples corrigés", () => {
    const sci = CHAPTERS.filter((c) => c.subject === "maths" || c.subject === "physique");
    expect(sci.length).toBeGreaterThan(50);
    for (const c of sci) {
      const f = ficheFor(c.id)!;
      const explained = f.essentiel.filter((p) => p.explain).length;
      expect(explained, c.id).toBeGreaterThanOrEqual(f.essentiel.length - 1);
      expect(f.exemples.length, c.id).toBeGreaterThan(0);
      for (const ex of f.exemples) expect(ex.steps.length, `${c.id} : ${ex.question}`).toBeGreaterThan(0);
    }
  });
  it("le format relie explications et étapes au bon élément", () => {
    const f = parseFiches("@x\n- A\n> clair\n> suite\n? Q\n= s1\n= s2\n! piège\n")["x"];
    expect(f.essentiel).toEqual([{ text: "A", explain: "clair suite" }]);
    expect(f.exemples).toEqual([{ question: "Q", steps: ["s1", "s2"] }]);
    expect(f.pieges).toEqual(["piège"]);
  });
  it("le lexique ne montre que les symboles utilisés", () => {
    const trigo = notationsIn(ficheTexts(ficheFor("maths-1-trigo")!)).map((n) => n.meaning);
    expect(trigo.some((m) => m.startsWith("racine carrée"))).toBe(true);
    expect(trigo.some((m) => m.includes("intégrale"))).toBe(false);
    const redox = notationsIn(ficheTexts(ficheFor("pc-1-redox")!)).map((n) => n.symbol);
    expect(redox).not.toContain("e^x");
    const fluides = notationsIn(ficheTexts(ficheFor("pc-1-fluides")!)).map((n) => n.symbol);
    expect(fluides).not.toContain("P_A(B)");
    expect(notationsIn(ficheTexts(ficheFor("maths-2-probas-cond")!)).map((n) => n.symbol)).toContain("P_A(B)");
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
      for (const line of ficheTexts(ficheFor(id)!)) {
        expect((line.match(/\$/g) ?? []).length % 2, `${id} : ${line}`).toBe(0);
        expect((line.match(/\{/g) ?? []).length, `${id} : ${line}`).toBe((line.match(/\}/g) ?? []).length);
        expect((line.match(/\\left[^a-z]/g) ?? []).length, `${id} : ${line}`).toBe((line.match(/\\right[^a-z]/g) ?? []).length);
      }
    }
  });
});

describe("formules des fiches", () => {
  it("chaque formule se compile avec KaTeX", async () => {
    const katex = (await import("katex")).default;
    const errors: string[] = [];
    const symbols = new Set<string>();
    for (const id of ficheIds()) {
      const texts = ficheTexts(ficheFor(id)!);
      for (const n of notationsIn(texts)) symbols.add(n.symbol);
      for (const line of texts) {
        for (const m of line.matchAll(/\$([^$]+)\$/g)) {
          try {
            katex.renderToString(m[1], { throwOnError: true, strict: "ignore" });
          } catch (e) {
            errors.push(`${id} : ${m[1]} → ${(e as Error).message}`);
          }
        }
      }
    }
    for (const s of symbols) {
      try {
        katex.renderToString(s, { throwOnError: true, strict: "ignore" });
      } catch (e) {
        errors.push(`lexique : ${s} → ${(e as Error).message}`);
      }
    }
    expect(errors).toEqual([]);
  });
});
