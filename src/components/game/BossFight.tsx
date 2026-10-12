"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Flame, Heart, X, Zap } from "lucide-react";
import Link from "next/link";
import { bossDamage } from "@/lib/game/progression";
import { prepareQuestions } from "@/lib/game/session";
import type { Boss, Question, QuizResult } from "@/lib/types";
import { QuestionCard } from "./QuestionCard";

const MAX_HEARTS = 3;

export interface BossOutcome {
  won: boolean;
  result: QuizResult;
  hpLeft: number; // 0..1
}

export function BossFight({ boss, pool, onComplete }: { boss: Boss; pool: Question[]; onComplete: (o: BossOutcome) => void }) {
  const [deck, setDeck] = useState(() => prepareQuestions(pool));
  const [index, setIndex] = useState(0);
  const [hp, setHp] = useState(boss.hp);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [combo, setCombo] = useState(0);
  const [phase, setPhase] = useState<"answering" | "feedback">("answering");
  const [elapsed, setElapsed] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [hit, setHit] = useState<{ id: number; damage: number; critical: boolean } | null>(null);
  const [hurt, setHurt] = useState(0);
  const [taunt, setTaunt] = useState(boss.intro);

  const maxCombo = useRef(0);
  const answers = useRef<QuizResult["answers"]>([]);
  const startedAt = useRef(Date.now());
  const questionStart = useRef(Date.now());

  const enraged = hp <= boss.hp / 2;
  const limit = boss.secondsPerQuestion * (enraged ? 0.7 : 1) * 1000;
  const q = deck[index];

  // Chronomètre
  useEffect(() => {
    if (phase !== "answering") return;
    const id = setInterval(() => {
      const e = Date.now() - questionStart.current;
      setElapsed(e);
      if (e >= limit) {
        clearInterval(id);
        setTimedOut(true);
        resolve(false);
      }
    }, 100);
    return () => clearInterval(id);
    // resolve est stable dans le cycle de vie d'une question
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, limit]);

  function resolve(correct: boolean) {
    if (phase !== "answering") return;
    setPhase("feedback");
    const timeMs = Date.now() - questionStart.current;
    answers.current.push({ questionId: q.id, correct, timeMs });
    if (correct) {
      const h = bossDamage({ combo, timeRatio: timeMs / limit, difficulty: q.difficulty });
      setHp((v) => Math.max(0, v - h.damage));
      setHit({ id: Date.now(), ...h });
      const next = combo + 1;
      setCombo(next);
      maxCombo.current = Math.max(maxCombo.current, next);
      setTaunt(h.critical ? "Argh ! Coup critique…" : "Tu ne fais que m'égratigner !");
    } else {
      setHearts((v) => v - 1);
      setHurt(Date.now());
      setCombo(0);
      setTaunt(boss.taunts[Math.floor(Math.random() * boss.taunts.length)]);
    }
  }

  const finish = (won: boolean) => {
    const list = answers.current;
    onComplete({
      won,
      hpLeft: hp / boss.hp,
      result: {
        correct: list.filter((a) => a.correct).length,
        total: list.length,
        maxCombo: maxCombo.current,
        durationMs: Date.now() - startedAt.current,
        answers: list,
      },
    });
  };

  const next = () => {
    if (hp <= 0) return finish(true);
    if (hearts <= 0) return finish(false);
    if (index + 1 >= deck.length) {
      setDeck(prepareQuestions(pool));
      setIndex(0);
    } else {
      setIndex((i) => i + 1);
    }
    setTimedOut(false);
    setElapsed(0);
    setPhase("answering");
    questionStart.current = Date.now();
  };

  const timeLeft = Math.max(0, 1 - elapsed / limit);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/boss" aria-label="Fuir le combat" className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white">
          <X size={22} />
        </Link>
        <div className="flex items-center gap-1" aria-label={`${hearts} cœurs restants`}>
          {Array.from({ length: MAX_HEARTS }, (_, i) => (
            <Heart key={i} size={24} className={clsx("transition", i < hearts ? "fill-rose-500 text-rose-500" : "text-slate-700", i === hearts && hurt ? "qb-shake" : "")} />
          ))}
        </div>
      </div>

      {/* Arène */}
      <div className={clsx("relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br p-5 shadow-2xl", boss.gradient, enraged && "qb-enraged")}>
        <div className="absolute inset-0 bg-slate-950/55" />
        {hurt > 0 && <div key={hurt} className="qb-flash pointer-events-none absolute inset-0 bg-rose-600/40" />}
        <div className="relative flex items-center gap-4">
          <div key={hit?.id} className={clsx("relative grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-black/30 text-6xl sm:h-28 sm:w-28 sm:text-7xl", hit && "qb-hit", hp <= 0 && "qb-defeated")}>
            {boss.emoji}
            {hit && (
              <span className={clsx("qb-damage absolute -top-3 left-1/2 -translate-x-1/2 font-black", hit.critical ? "text-3xl text-amber-300" : "text-2xl text-white")}>
                -{hit.damage}{hit.critical && "!"}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-xl font-black text-white">{boss.name}</h2>
              {enraged && hp > 0 && <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-black uppercase text-white">Enragé</span>}
            </div>
            <p className="text-xs text-slate-300">{boss.title}</p>
            <div className="mt-2 h-4 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/20">
              <div
                className={clsx("h-full rounded-full transition-[width] duration-500", enraged ? "bg-gradient-to-r from-red-600 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-lime-400")}
                style={{ width: `${(hp / boss.hp) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-right font-mono text-xs text-slate-300">{hp} / {boss.hp} PV</p>
          </div>
        </div>
        <p className="relative mt-3 rounded-xl bg-black/40 px-3 py-2 text-sm italic text-slate-100">« {taunt} »</p>
      </div>

      {/* Combo & chrono */}
      <div className="flex items-center gap-3">
        <div className={clsx("flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold", combo >= 2 ? "qb-combo bg-orange-500/20 text-orange-300" : "bg-slate-800 text-slate-400")}>
          <Flame size={15} /> ×{combo}
        </div>
        <div className="flex-1">
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className={clsx("h-full rounded-full", timeLeft > 0.5 ? "bg-cyan-400" : timeLeft > 0.25 ? "bg-amber-400" : "bg-rose-500")}
              style={{ width: `${timeLeft * 100}%`, transition: "width 100ms linear" }}
            />
          </div>
        </div>
        <span className="flex w-14 items-center justify-end gap-1 font-mono text-sm text-slate-300">
          <Zap size={14} className={timeLeft < 0.35 ? "text-amber-300" : "text-slate-500"} />
          {Math.ceil((limit - elapsed) / 1000)}s
        </span>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-7">
        <QuestionCard
          key={`${q.id}-${index}-${deck.length}`}
          question={q}
          timedOut={timedOut}
          onAnswered={resolve}
          onNext={next}
          nextLabel={hp <= 0 ? "Achever le boss !" : hearts <= 0 ? "Voir le résultat" : "Attaque suivante"}
        />
      </div>
      <p className="text-center text-xs text-slate-500">Réponds vite (dans le premier tiers du temps) pour un coup critique ×1,5. Le combo augmente tes dégâts.</p>
    </div>
  );
}
