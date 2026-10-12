import { describe, expect, it } from "vitest";
import { MissionRequest, normalizeQuestions } from "./schemas";

const base = { prompt: "Question ?", explanation: "Parce que.", difficulty: 2, choices: [], answer_index: null, answer_bool: null, answer_number: null, tolerance: null, unit: null };

describe("normalizeQuestions", () => {
  it("garde les questions valides et écarte les incohérentes", () => {
    const out = normalizeQuestions(
      [
        { ...base, type: "mcq", choices: ["a", "b", "c", "d"], answer_index: 1 },
        { ...base, type: "mcq", choices: ["a", "b"], answer_index: 5 },
        { ...base, type: "truefalse", answer_bool: false },
        { ...base, type: "truefalse" },
        { ...base, type: "numeric", answer_number: 42, unit: "J" },
      ],
      "t",
    );
    expect(out.map((q) => q.type)).toEqual(["mcq", "truefalse", "numeric"]);
    const n = out[2];
    if (n.type !== "numeric") throw new Error();
    expect(n.tolerance).toBeCloseTo(0.42);
    expect(n.unit).toBe("J");
  });
});

describe("MissionRequest", () => {
  it("exige une photo en mode photo", () => {
    expect(MissionRequest.safeParse({ level: "premiere", subject: "maths", mode: "photo", count: 5 }).success).toBe(false);
    expect(MissionRequest.safeParse({ level: "premiere", subject: "maths", mode: "sujet", topic: "Suites", count: 5 }).success).toBe(true);
  });
});
