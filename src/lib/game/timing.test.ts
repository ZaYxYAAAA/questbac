import { describe, expect, it } from "vitest";
import { needsCalculator } from "./calculator";
import { questionTimeMs } from "./timing";

const mcq = (prompt: string, choices: string[], difficulty: 1 | 2 | 3 = 1) => ({ type: "mcq" as const, prompt, choices, answer: 0, explanation: "", difficulty });

describe("temps adapté à la question", () => {
  it("court pour une question de cours", () => {
    expect(questionTimeMs({ type: "truefalse", prompt: "Le Soleil est une étoile.", difficulty: 1 })).toBe(10_000);
    expect(questionTimeMs(mcq("Capitale du Pérou ?", ["Lima", "Quito", "Bogota", "Caracas"]))).toBe(12_000);
  });
  it("un choix sans calcul garde peu de temps, même difficile ; un calcul garde le sien", () => {
    expect(questionTimeMs(mcq("Capitale du Bhoutan ?", ["Thimphou", "Katmandou"], 3))).toBe(16_000);
    expect(questionTimeMs(mcq("$2^5 = ?$", ["$32$", "$10$"]))).toBeGreaterThanOrEqual(28_000);
  });
  it("plus long pour un calcul, encore plus en plusieurs étapes", () => {
    const racines = questionTimeMs(mcq("Les racines de $x^2 - 5x + 6$ sont :", ["$2$ et $3$", "$1$ et $6$"], 2));
    expect(racines).toBeGreaterThanOrEqual(40_000);
    const trigo = mcq("$x \\in [0 ; \\frac{\\pi}{2}]$ et $\\cos x = \\frac{8}{17}$. $\\sin x = ?$", ["$\\frac{15}{17}$", "$\\frac{9}{17}$"]);
    const withCalc = { ...trigo, calc: needsCalculator(trigo) };
    expect(withCalc.calc).toBe(true);
    expect(questionTimeMs(withCalc)).toBeGreaterThanOrEqual(45_000);
  });
  it("reste entre 10 et 60 secondes", () => {
    const long = { type: "numeric" as const, prompt: `${"Un long énoncé de physique. ".repeat(20)} $\\frac{12}{35}$`, difficulty: 3 as const, calc: true };
    expect(questionTimeMs(long)).toBe(60_000);
  });
});
