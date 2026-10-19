import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { INTRO_MS, type Match, VOTE_MS, tick } from "@/lib/game/match";
import { BOARD_SIZE } from "@/lib/game/ranked";
import type { Question } from "@/lib/types";

// Stockage fichier temporaire, choisi avant le premier accès au store.
const dir = mkdtempSync(path.join(tmpdir(), "qb-match-"));
process.env.QB_DATA_DIR = dir;
afterAll(() => rmSync(dir, { recursive: true, force: true }));
afterEach(() => vi.useRealTimers());

const { RankedError, boardRows, getRank, joinQueue, pollQueue, viewFor, vote } = await import("./match");
const { getStore } = await import("./store");
const { publicPlayerId } = await import("./auth");

const withLevel = (uid: string, level: string) => getStore().set(`save:${uid}`, { save: { profile: { level } }, updatedAt: 0 });

describe("file d'attente du classé", () => {
  it("refuse une matière hors du programme du niveau", async () => {
    await withLevel("eleve-seconde", "seconde");
    const err = await joinQueue("eleve-seconde", "Seconde", "philo").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(RankedError);
    expect((err as InstanceType<typeof RankedError>).status).toBe(400);
  });

  it("une nouvelle recherche remplace la précédente (pas deux parties en même temps)", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1_000_000);
    await withLevel("eleve-a", "premiere");
    const first = await joinQueue("eleve-a", "A", "maths", 3);
    const second = await joinQueue("eleve-a", "A", "svt", 5);
    expect(first.ticket && second.ticket).toBeTruthy();
    vi.setSystemTime(1_000_000 + 3500);
    await expect(pollQueue("eleve-a", first.ticket!)).rejects.toBeInstanceOf(RankedError);
    const found = await pollQueue("eleve-a", second.ticket!);
    expect(found.matchId).toBeTruthy();
    expect((await getRank("eleve-a", "A")).active).toBe(found.matchId);
    // En partie : relancer une recherche ramène à la partie en cours.
    expect(await joinQueue("eleve-a", "A", "maths", 3)).toEqual({ matchId: found.matchId });
    // Sans aucune sauvegarde du profil public, sa fiche est retrouvée tout de suite (index, pas de parcours).
    const [indexed] = await getStore().hmget<string>("pubids", [publicPlayerId("eleve-a")]);
    expect(indexed).toBe("eleve-a");
  });

  it("ne forme pas de partie avec la recherche abandonnée d'un autre joueur", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(2_000_000);
    await withLevel("eleve-b", "terminale");
    await withLevel("eleve-c", "terminale");
    await joinQueue("eleve-b", "B", "histoire", 3); // abandonnée…
    await joinQueue("eleve-b", "B", "ses", 3); // … au profit de celle-ci
    const c = await joinQueue("eleve-c", "C", "histoire", 3);
    vi.setSystemTime(2_000_000 + 3500);
    const found = await pollQueue("eleve-c", c.ticket!);
    const m = await getStore().get<{ players: { id: string; bot: boolean }[] }>(`match:${found.matchId}`);
    expect(m!.players.filter((p) => !p.bot).map((p) => p.id)).toEqual(["eleve-c"]);
  });
});

describe("lignes des classements", () => {
  it("envoie le haut du général et celui de la semaine, plus moi et mes amis", () => {
    const n = BOARD_SIZE + 50;
    // Classement général : 0 en tête ; cette semaine, les derniers du général ont le plus progressé.
    const rows = Array.from({ length: n }, (_, i) => ({ id: i, week: i >= BOARD_SIZE ? 1000 + i : 0, isMe: i === n - 1, friend: i === BOARD_SIZE + 1 }));
    const out = boardRows(rows, (r) => r.week, (r) => r.week !== 0);
    const byId = new Map(out.map((r) => [r.id, r]));
    expect(byId.get(0)?.place).toBe(1);
    expect(byId.get(0)?.weekPlace).toBeUndefined();
    expect(byId.get(n - 1)).toMatchObject({ place: n, weekPlace: 1, isMe: true });
    expect(byId.get(BOARD_SIZE)).toMatchObject({ place: BOARD_SIZE + 1, weekPlace: 50 });
    expect(out).toHaveLength(n);
  });
});

describe("vue d'une partie", () => {
  const q: Question = { id: "mq-0", type: "mcq", prompt: "2 + 2 ?", choices: ["3", "4"], answer: 1, explanation: "4.", fact: "add" };
  const newMatch = (): Match => ({
    id: "vue",
    subject: "maths",
    level: "premiere",
    createdAt: 0,
    players: [
      { id: "u1", bot: false, pseudo: "Moi", avatar: "x", rp: 0 },
      { id: "bot-1", bot: true, pseudo: "Bot", avatar: "y", rp: 0, skill: 0.5, speed: 0.5 },
      { id: "bot-2", bot: true, pseudo: "Bot2", avatar: "z", rp: 0, skill: 0.5, speed: 0.5 },
    ],
    chapters: ["a", "b"],
    votes: {},
    chapterId: null,
    voteEnd: null,
    questions: [],
    starts: [],
    ends: [],
    answers: {},
    botPlans: {},
    away: {},
    finishedAt: null,
  });

  it("ne montre rien de la 1re question pendant le compte à rebours, puis la montre sans la réponse", () => {
    const m = newMatch();
    tick(m, VOTE_MS, () => Array.from({ length: 10 }, (_, i) => ({ ...q, id: `mq-${i}` })));
    expect(viewFor(m, "u1", VOTE_MS + 100)).toMatchObject({ phase: "intro", question: null });
    const v = viewFor(m, "u1", VOTE_MS + INTRO_MS + 100);
    expect(v.phase).toBe("question");
    expect(v.question).toMatchObject({ prompt: "2 + 2 ?", answer: -1, explanation: "" });
    expect(v.question).not.toHaveProperty("fact");
  });

  it("refuse un vote arrivé après la fin du vote", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const m = { ...newMatch(), id: "vote-tard", createdAt: 5_000_000 };
    vi.setSystemTime(m.createdAt + VOTE_MS + 1);
    expect(await vote(m, "u1", "a")).toBe(false);
    vi.setSystemTime(m.createdAt + 1000);
    expect(await vote(m, "u1", "c")).toBe(false);
    expect(await vote(m, "u1", "a")).toBe(true);
    expect(await vote(m, "u1", "b")).toBe(false);
  });
});
