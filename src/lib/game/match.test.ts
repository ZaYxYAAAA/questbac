import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/types";
import { REST_MS, isFreshSubject, subjectOfDay, subjectRestUntil } from "./ranked";
import {
  INTRO_MS,
  type Match,
  REVEAL_MS,
  VOTE_MS,
  botVotes,
  makeBot,
  markAway,
  matchXp,
  placeOutcome,
  phaseAt,
  planBotAnswer,
  questionMs,
  rpDelta,
  standings,
  submitAnswer,
  tick,
} from "./match";
import { seededRandom } from "./quests";

const q = (i: number): Question => ({ id: `q${i}`, type: "mcq", prompt: `Question numéro ${i} : quelle est la bonne réponse parmi ces choix ?`, choices: ["A", "B", "C", "D"], answer: 0, explanation: "" });
const make = () => Array.from({ length: 10 }, (_, i) => q(i));

function newMatch(): Match {
  const r = seededRandom(1);
  const human = { id: "u1", bot: false, pseudo: "Moi", avatar: "🦊", rp: 400 };
  const players = [human, makeBot(400, r, ["Moi"]), makeBot(400, r, ["Moi"])];
  const m: Match = {
    id: "m1", subject: "maths", level: "premiere", createdAt: 0, players, chapters: ["a", "b"], votes: {}, chapterId: null, voteEnd: null,
    questions: [], starts: [], ends: [], answers: {}, botPlans: {}, away: {}, finishedAt: null,
  };
  m.votes = botVotes(m);
  return m;
}

describe("partie classée", () => {
  it("les bots ont un niveau proche du joueur et des noms différents", () => {
    const r = seededRandom(3);
    const a = makeBot(100, r), b = makeBot(9500, r);
    expect(a.skill!).toBeLessThan(b.skill!);
    expect(a.bot).toBe(true);
  });

  it("temps de réponse des bots variés et plausibles", () => {
    const r = seededRandom(9);
    const bot = makeBot(900, r);
    const times = Array.from({ length: 200 }, () => planBotAnswer(bot, q(1), r).ms).filter((t): t is number => t !== null);
    expect(Math.min(...times)).toBeGreaterThanOrEqual(1200);
    expect(Math.max(...times)).toBeLessThanOrEqual(questionMs(q(1)));
    expect(new Set(times.map((t) => Math.round(t / 500))).size).toBeGreaterThan(8);
  });

  it("vote, 10 questions synchronisées puis classement", () => {
    const m = newMatch();
    expect(phaseAt(m, 0).phase).toBe("vote");
    m.votes.u1 = { chapter: "a", at: 500 };
    tick(m, VOTE_MS, make);
    expect(m.chapterId).not.toBeNull();
    expect(m.questions).toHaveLength(10);
    const start0 = m.voteEnd! + INTRO_MS;
    expect(phaseAt(m, start0 - 1).phase).toBe("intro");
    // Le joueur répond juste à chaque question au bout de 2 s.
    let now = start0;
    for (let i = 0; i < 10; i++) {
      now = m.starts[i] + 2000;
      tick(m, now, make);
      expect(phaseAt(m, now)).toEqual({ phase: "question", index: i });
      expect(submitAnswer(m, "u1", i, 0, true, now)).toBe("ok");
      expect(submitAnswer(m, "u1", i, 0, true, now)).toBe("already");
      now = m.starts[i] + questionMs(m.questions[i]) + 1;
      tick(m, now, make);
      expect(m.ends.length).toBe(i + 1);
    }
    tick(m, now + REVEAL_MS + 10, make);
    expect(phaseAt(m, now + REVEAL_MS + 10).phase).toBe("done");
    const s = standings(m);
    expect(s[0].playerId).toBe("u1");
    expect(s[0]).toMatchObject({ correct: 10, place: 1 });
  });

  it("refuse une réponse hors délai et compte une sortie de l'appli", () => {
    const m = newMatch();
    tick(m, VOTE_MS, make);
    const start = m.starts[0];
    tick(m, start + 100, make);
    expect(markAway(m, "u1", start + 100)).toBe(true);
    expect(submitAnswer(m, "u1", 0, 0, true, start + 200)).toBe("away");
    tick(m, start + 60_000, make);
    expect(submitAnswer(m, "u1", 0, 0, true, start + 60_000)).not.toBe("ok");
  });

  it("classe d'abord aux bonnes réponses, puis au temps", () => {
    const m = newMatch();
    m.votes.u1 = { chapter: "a", at: 500 };
    tick(m, VOTE_MS, make);
    const s = standings(m);
    expect(s.map((x) => x.place)).toEqual([1, 2, 3]);
  });

  it("points de rang : on gagne en finissant 1er, on perd en finissant 3e", () => {
    expect(rpDelta(1, 0, 7, 10)).toBeGreaterThan(rpDelta(2, 0, 7, 10));
    expect(rpDelta(3, 0, 2, 10)).toBeLessThan(0);
    expect(rpDelta(3, 9500, 2, 10)).toBeLessThan(rpDelta(3, 0, 2, 10));
    expect(rpDelta(1, 0, 10, 10)).toBe(rpDelta(1, 0, 9, 10) + 5);
  });
});


describe("variété des matières en classé", () => {
  const now = 1_000_000_000;
  const h = (...subjects: string[]) => subjects.map((subject, i) => ({ subject, at: now - 60_000 * (i + 1) }));
  it("3 parties d'affilée au plus ; une partie ailleurs ou 15 min libèrent la matière", () => {
    expect(subjectRestUntil(h("histoire", "histoire"), "histoire", now)).toBe(0);
    expect(subjectRestUntil(h("histoire", "histoire", "histoire"), "histoire", now)).toBe(now - 60_000 + REST_MS);
    expect(subjectRestUntil(h("maths", "histoire", "histoire", "histoire"), "histoire", now)).toBe(0);
    expect(subjectRestUntil(h("histoire", "histoire", "svt", "histoire"), "histoire", now)).toBe(0);
    expect(subjectRestUntil(h("histoire", "histoire", "histoire"), "histoire", now + REST_MS)).toBe(0);
    expect(subjectRestUntil(h("histoire", "histoire", "histoire"), "maths", now)).toBe(0);
  });
  it("bonus de fraîcheur pour une matière pas jouée récemment", () => {
    expect(isFreshSubject(h("maths", "svt"), "histoire")).toBe(false);
    expect(isFreshSubject(h("maths", "svt", "ses"), "histoire")).toBe(true);
    expect(isFreshSubject(h("maths", "svt", "ses", "histoire"), "histoire")).toBe(false);
  });
  it("matière du jour stable sur la journée", () => {
    const list = ["maths", "svt", "histoire"];
    expect(subjectOfDay(list, new Date("2026-10-14T08:00:00Z"))).toBe(subjectOfDay(list, new Date("2026-10-14T20:00:00Z")));
  });
});

describe("parties à 5 et à 7", () => {
  it("à 3, rien ne change (mêmes points, même XP)", () => {
    expect([1, 2, 3].map((p) => rpDelta(p, 0, 7, 10, 3))).toEqual([30, 9, -6]);
    expect([1, 2, 3].map((p) => matchXp(p, 0, 3))).toEqual([80, 40, 15]);
  });

  it("la victoire rapporte plus, la dernière place coûte plus", () => {
    for (const rp of [0, 2000, 9500]) {
      expect(rpDelta(1, rp, 7, 10, 5)).toBeGreaterThan(rpDelta(1, rp, 7, 10, 3));
      expect(rpDelta(1, rp, 7, 10, 7)).toBeGreaterThan(rpDelta(1, rp, 7, 10, 5));
      expect(rpDelta(5, rp, 3, 10, 5)).toBeLessThan(rpDelta(3, rp, 3, 10, 3));
      expect(rpDelta(7, rp, 3, 10, 7)).toBeLessThan(rpDelta(5, rp, 3, 10, 5));
    }
    expect(matchXp(1, 7, 5)).toBeGreaterThan(matchXp(1, 7, 3));
  });

  it("les points baissent place après place ; le milieu gagne un peu, la moitié basse perd", () => {
    for (const size of [5, 7]) {
      const d = Array.from({ length: size }, (_, i) => rpDelta(i + 1, 1000, 6, 10, size));
      for (let i = 1; i < size; i++) expect(d[i]).toBeLessThan(d[i - 1]);
      const mid = (size - 1) / 2;
      expect(d[mid]).toBeGreaterThan(0);
      expect(d[mid + 1]).toBeLessThan(0);
      expect(placeOutcome(1, size)).toBe("win");
      expect(placeOutcome(mid + 1, size)).toBe("middle");
      expect(placeOutcome(size, size)).toBe("loss");
    }
    expect(Array.from({ length: 5 }, (_, i) => matchXp(i + 1, 0, 5)).every((x) => x >= 15)).toBe(true);
  });

  it("une partie à 5 se joue entièrement (classement de 5 joueurs)", () => {
    const r = seededRandom(7);
    const players = Array.from({ length: 5 }, () => makeBot(1000, r));
    const m = {
      id: "m5", subject: "maths", level: "premiere", createdAt: 0, players, chapters: ["a", "b"], votes: {}, chapterId: null, voteEnd: null,
      questions: [], starts: [], ends: [], answers: {}, botPlans: {}, away: {}, finishedAt: null,
    } as unknown as Match;
    m.votes = botVotes(m);
    const make = () => Array.from({ length: 10 }, (_, i) => ({ id: `q${i}`, type: "truefalse", prompt: `Question ${i}`, answer: true, explanation: "" }) as unknown as Question);
    tick(m, 10 ** 9, make);
    expect(m.finishedAt).not.toBeNull();
    expect(standings(m).map((s) => s.place)).toEqual([1, 2, 3, 4, 5]);
  });
});
