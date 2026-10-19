import { describe, expect, it } from "vitest";
import { choiceNumber, evaluate, formatResult, needsCalculator, significantDigits } from "./calculator";

describe("evaluate", () => {
  it("priorités, parenthèses et moins unaire", () => {
    expect(evaluate("2+3×4")).toBe(14);
    expect(evaluate("(2+3)×4")).toBe(20);
    expect(evaluate("-2^2")).toBe(-4);
    expect(evaluate("2^3^2")).toBe(512);
    expect(evaluate("10÷4")).toBe(2.5);
    expect(evaluate("4,7×21")).toBeCloseTo(98.7);
  });
  it("fonctions, constantes, notation scientifique et multiplication implicite", () => {
    expect(evaluate("√(16)")).toBe(4);
    expect(evaluate("√16+1")).toBe(5);
    expect(evaluate("2π")).toBeCloseTo(2 * Math.PI);
    expect(evaluate("3(4+1)")).toBe(15);
    expect(evaluate("ln(e)")).toBe(1);
    expect(evaluate("log(1000)")).toBe(3);
    expect(evaluate("sin(30)")).toBeCloseTo(0.5);
    expect(evaluate("sin(180)")).toBe(0);
    expect(evaluate("cos(π)", "rad")).toBe(-1);
    expect(evaluate("2×6,02E23")).toBeCloseTo(1.204e24, -20);
    expect(evaluate("50%×80")).toBe(40);
    expect(evaluate("(1+2")).toBe(3);
  });
  it("refuse les expressions invalides", () => {
    expect(() => evaluate("2+")).toThrow();
    expect(() => evaluate("1÷0")).toThrow();
    expect(() => evaluate("alert(1)")).toThrow();
    // Virgule en trop : pas de multiplication cachée (2,5 × 0,3).
    expect(() => evaluate("2,5,3")).toThrow();
    expect(() => evaluate("2E3,5")).toThrow();
  });
  it("affiche à la française", () => {
    expect(formatResult(98.7)).toBe("98,7");
    expect(formatResult(0.1 + 0.2)).toBe("0,3");
    expect(formatResult(1.204e24)).toBe("1,204E24");
  });
});

describe("needsCalculator", () => {
  const num = (prompt: string, answer: number) => ({ type: "numeric" as const, prompt, answer, explanation: "" });
  it("pas pour un calcul faisable de tête", () => {
    expect(needsCalculator(num("Force pour $2$ m/s² et $5$ kg ?", 10))).toBe(false);
    expect(needsCalculator(num("$P(A) = 0{,}3$. $P(\\bar A)$ ?", 0.7))).toBe(false);
    expect(needsCalculator(num("$6 \\times 4 = ?$", 24))).toBe(false);
    expect(needsCalculator(num("En quelle année : **Majorité à 18 ans** ?", 1974))).toBe(false);
    expect(needsCalculator({ type: "truefalse", prompt: "$2+2=4$", answer: true, explanation: "" })).toBe(false);
  });
  it("oui pour les décimaux, la notation scientifique et les grands nombres", () => {
    expect(needsCalculator(num("$7! = ?$", 5040))).toBe(true);
    expect(needsCalculator(num("Moyenne de $20;20;7;6;19$ ?", 14.4))).toBe(true);
    expect(needsCalculator(num("$P(A) = 0{,}7$, $P_A(B) = 0{,}9$. $P(A \\cap B)$ ?", 0.63))).toBe(true);
    expect(needsCalculator(num("Condensateur de $4{,}7$ µF sous $21$ V. Charge ?", 98.7))).toBe(true);
    expect(needsCalculator(num("Masse de $3 \\times 10^{-3}$ mol ?", 0.18))).toBe(true);
    expect(needsCalculator(num("$17 \\times 23 \\times 9 = ?$", 3519))).toBe(true);
    expect(needsCalculator(num("$P(X=4)$ avec $p = 0{,}9$ ?", 0.6561))).toBe(true);
    expect(needsCalculator({ type: "mcq", prompt: "$X \\sim \\mathcal{B}(4;0{,}9)$. $P(X=4)$ ?", choices: ["$0{,}59049$", "$0{,}6561$"], answer: 1, explanation: "" })).toBe(true);
    expect(needsCalculator({ type: "mcq", prompt: "Coefficient de $-x - 5y = 0$ ?", choices: ["$5$", "$-\\dfrac{1}{5}$"], answer: 1, explanation: "" })).toBe(false);
  });
  it("lit les nombres des choix", () => {
    expect(choiceNumber("$0{,}59049$")).toBeCloseTo(0.59049);
    expect(choiceNumber("$12$ cm")).toBe(12);
    expect(choiceNumber("$\\dfrac{1}{5}$")).toBeNull();
    expect(significantDigits(98.7)).toBe(3);
    expect(significantDigits(1000)).toBe(1);
  });
});
