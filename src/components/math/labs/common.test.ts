import { describe, expect, it } from "vitest";
import { binomialPmf } from "./BinomialLab";
import { compileX, polyTex, texNum } from "./common";

describe("outils des labos", () => {
  it("écrit les polynômes sans termes nuls ni coefficients 1 parasites", () => {
    expect(polyTex([1, -2, -3])).toBe("x^{2} - 2x - 3");
    expect(polyTex([-1, 0, 0])).toBe("- x^{2}");
    expect(polyTex([0.5, 0])).toBe("0{,}5x");
    expect(polyTex([0, 0])).toBe("0");
    // À l'arrondi près : 0,999 s'affiche « x », 0,001 disparaît.
    expect(polyTex([0.999, 0.001])).toBe("x");
  });

  it("écrit les nombres décimaux à la française en LaTeX", () => {
    expect(texNum(-2.5)).toBe("-2{,}5");
    expect(texNum(3)).toBe("3");
  });

  it("refuse les paramètres là où seule x est permise", () => {
    expect(compileX("x^2 + 1").ok).toBe(true);
    const r = compileX("a*x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain("a");
  });

  it("la loi binomiale somme à 1, y compris aux bords p = 0 et p = 1", () => {
    for (const [n, p] of [[20, 0.35], [60, 0.5], [1, 0], [10, 1]] as const) {
      const pmf = binomialPmf(n, p);
      expect(pmf).toHaveLength(n + 1);
      expect(pmf.reduce((s, v) => s + v, 0)).toBeCloseTo(1, 10);
    }
    expect(binomialPmf(4, 0.5)[2]).toBeCloseTo(0.375, 12);
  });
});
