import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/types";
import {
  INTRO_MS,
  type Match,
  REVEAL_MS,
  VOTE_MS,
  botVotes,
  makeBot,
  markAway,
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
