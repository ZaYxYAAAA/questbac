import { describe, expect, it } from "vitest";
import { compile, derivative, fmt, integrate, tryCompile } from "./parser";

const ev = (src: string, scope: Record<string, number> = {}) => compile(src).evaluate(scope);

describe("parser", () => {
  it("respecte les priorités", () => {
    expect(ev("1+2*3")).toBe(7);
    expect(ev("2^3^2")).toBe(512); // associatif à droite
    expect(ev("-x^2", { x: 3 })).toBe(-9);
    expect(ev("(1+2)*3")).toBe(9);
    expect(ev("2^-1")).toBe(0.5);
  });

  it("gère la multiplication implicite et les paramètres", () => {
    expect(ev("2x", { x: 4 })).toBe(8);
    expect(ev("3(x+1)", { x: 1 })).toBe(6);
    expect(ev("ax+b", { a: 2, b: 1, x: 3 })).toBe(7);
    expect(ev("x(x-1)", { x: 3 })).toBe(6);
    expect(compile("a*sin(b*x+c)").params).toEqual(["a", "b", "c"]);
  });

  it("connaît fonctions et constantes", () => {
    expect(ev("sin(pi/2)")).toBeCloseTo(1);
    expect(ev("e^x", { x: 1 })).toBeCloseTo(Math.E);
    expect(ev("ln(e)")).toBeCloseTo(1);
    expect(ev("sqrt(16)")).toBe(4);
    expect(ev("sinx", { x: Math.PI / 2 })).toBeCloseTo(1);
    expect(ev("sin(x)^2", { x: 1 })).toBeCloseTo(Math.sin(1) ** 2);
    expect(ev("abs(-3)")).toBe(3);
  });

  it("accepte les notations françaises", () => {
    expect(ev("2,5×2")).toBe(5);
    expect(ev("x²", { x: 3 })).toBe(9);
    expect(ev("√9")).toBe(3);
    expect(ev("2π")).toBeCloseTo(2 * Math.PI);
  });

  it("calcule les racines cubiques de négatifs", () => {
    expect(ev("(-8)^(1/3)")).toBeCloseTo(-2);
  });

  it("signale les erreurs en français", () => {
    const r = tryCompile("2*(x+1");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Parenthèse/);
    expect(tryCompile("").ok).toBe(false);
    expect(tryCompile("2+*3").ok).toBe(false);
  });

  it("dérive et intègre numériquement", () => {
    expect(derivative((x) => x ** 3, 2)).toBeCloseTo(12, 4);
    expect(integrate((x) => 3 * x * x, 0, 2)).toBeCloseTo(8, 6);
  });

  it("formate à la française", () => {
    expect(fmt(3.5)).toBe("3,5");
    expect(fmt(-2)).toBe("−2");
    expect(fmt(2.0)).toBe("2");
  });
});
