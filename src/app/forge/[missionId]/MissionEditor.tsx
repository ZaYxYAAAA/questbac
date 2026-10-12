"use client";

import { useState } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, Eye, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Markdown } from "@/components/ui/Markdown";
import { useGame } from "@/lib/store/game-store";
import { useToasts } from "@/lib/store/toast-store";
import type { CustomMission, Question } from "@/lib/types";

const input = "w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-400";

const blank = (type: Question["type"]): Question => {
  const base = { id: `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, prompt: "", explanation: "", difficulty: 1 as const };
  if (type === "mcq") return { ...base, type, choices: ["", "", "", ""], answer: 0 };
  if (type === "truefalse") return { ...base, type, answer: true };
  return { ...base, type, answer: 0, tolerance: 0.01 };
};

/** Vérifie qu'une question est jouable ; renvoie le problème sinon. */
function problemOf(q: Question): string | null {
  if (!q.prompt.trim()) return "énoncé vide";
  if (q.type === "mcq") {
    const filled = q.choices.filter((c) => c.trim());
    if (filled.length < 2) return "au moins 2 choix";
    if (!q.choices[q.answer]?.trim()) return "la bonne réponse est vide";
  }
  if (q.type === "numeric" && !Number.isFinite(q.answer)) return "réponse numérique invalide";
  return null;
}

/** Retire les choix vides d'un QCM en conservant la bonne réponse. */
function clean(q: Question): Question {
  if (q.type !== "mcq") return q;
  const kept = q.choices.map((c, i) => ({ c: c.trim(), i })).filter((x) => x.c);
  return { ...q, choices: kept.map((x) => x.c), answer: kept.findIndex((x) => x.i === q.answer) };
}

export function MissionEditor({ mission, onSaved }: { mission: CustomMission; onSaved: () => void }) {
  const updateMission = useGame((s) => s.updateMission);
  const [title, setTitle] = useState(mission.title);
  const [fiche, setFiche] = useState(mission.fiche);
  const [previewFiche, setPreviewFiche] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(mission.questions);

  const patch = (i: number, next: Question) => setQuestions((qs) => qs.map((q, j) => (j === i ? next : q)));
  const move = (i: number, d: -1 | 1) =>
    setQuestions((qs) => {
      const j = i + d;
      if (j < 0 || j >= qs.length) return qs;
      const copy = [...qs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const problems = questions.map(problemOf);
  const valid = problems.every((p) => p === null) && title.trim().length >= 2;

  const save = () => {
    updateMission({ ...mission, title: title.trim(), fiche, questions: questions.map(clean) });
    useToasts.getState().push({ emoji: "💾", title: "Mission enregistrée", tone: "emerald" });
    onSaved();
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/70 p-5">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-300">Titre</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className={input} />
        </label>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">Fiche de révision (Markdown, LaTeX entre $…$)</span>
            <button type="button" onClick={() => setPreviewFiche((p) => !p)} className="flex items-center gap-1 text-xs text-violet-300">
              <Eye size={14} /> {previewFiche ? "Modifier" : "Aperçu"}
            </button>
          </div>
          {previewFiche ? (
            <div className="rounded-xl border border-white/10 bg-slate-950 p-4"><Markdown>{fiche || "_Fiche vide_"}</Markdown></div>
          ) : (
            <textarea value={fiche} onChange={(e) => setFiche(e.target.value)} rows={6} className={clsx(input, "font-mono")} placeholder="## L'essentiel&#10;- …" />
          )}
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={q.id} className={clsx("space-y-3 rounded-2xl border bg-slate-900/70 p-4", problems[i] ? "border-amber-500/40" : "border-white/10")}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-600 text-xs font-black text-white">{i + 1}</span>
              <select
                value={q.type}
                onChange={(e) => patch(i, { ...blank(e.target.value as Question["type"]), id: q.id, prompt: q.prompt, explanation: q.explanation })}
                className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-sm text-white"
                aria-label="Type de question"
              >
                <option value="mcq">QCM</option>
                <option value="truefalse">Vrai / Faux</option>
                <option value="numeric">Réponse numérique</option>
              </select>
              <select
                value={q.difficulty ?? 1}
                onChange={(e) => patch(i, { ...q, difficulty: Number(e.target.value) as 1 | 2 | 3 })}
                className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-sm text-white"
                aria-label="Difficulté"
              >
                <option value={1}>★ Facile</option>
                <option value={2}>★★ Moyen</option>
                <option value={3}>★★★ Difficile</option>
              </select>
              {problems[i] && <span className="text-xs text-amber-300">⚠ {problems[i]}</span>}
              <div className="ml-auto flex gap-1">
                <button type="button" aria-label="Monter" onClick={() => move(i, -1)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5"><ArrowUp size={15} /></button>
                <button type="button" aria-label="Descendre" onClick={() => move(i, 1)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5"><ArrowDown size={15} /></button>
                <button type="button" aria-label="Supprimer" onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-600 hover:text-white"><Trash2 size={15} /></button>
              </div>
            </div>
            <textarea value={q.prompt} onChange={(e) => patch(i, { ...q, prompt: e.target.value })} rows={2} placeholder="Énoncé de la question" className={input} />

            {q.type === "mcq" && (
              <div className="grid gap-2 sm:grid-cols-2">
                {q.choices.map((c, k) => (
                  <label key={k} className={clsx("flex items-center gap-2 rounded-lg border p-1.5 pl-2", q.answer === k ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/10")}>
                    <input type="radio" name={`ans-${q.id}`} checked={q.answer === k} onChange={() => patch(i, { ...q, answer: k })} aria-label={`Choix ${k + 1} correct`} />
                    <input
                      value={c}
                      onChange={(e) => patch(i, { ...q, choices: q.choices.map((x, j) => (j === k ? e.target.value : x)) })}
                      placeholder={`Choix ${k + 1}`}
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
                    />
                  </label>
                ))}
              </div>
            )}
            {q.type === "truefalse" && (
              <div className="flex gap-2">
                {[true, false].map((v) => (
                  <button key={String(v)} type="button" onClick={() => patch(i, { ...q, answer: v })} className={clsx("flex-1 rounded-lg py-2 text-sm font-semibold", q.answer === v ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300")}>
                    {v ? "Vrai" : "Faux"}
                  </button>
                ))}
              </div>
            )}
            {q.type === "numeric" && (
              <div className="grid grid-cols-3 gap-2">
                <input type="number" step="any" value={Number.isFinite(q.answer) ? q.answer : ""} onChange={(e) => patch(i, { ...q, answer: parseFloat(e.target.value) })} placeholder="Réponse" className={input} aria-label="Réponse" />
                <input type="number" step="any" min={0} value={q.tolerance ?? 0.01} onChange={(e) => patch(i, { ...q, tolerance: Math.abs(parseFloat(e.target.value) || 0) })} placeholder="Tolérance" className={input} aria-label="Tolérance" />
                <input value={q.unit ?? ""} onChange={(e) => patch(i, { ...q, unit: e.target.value || undefined })} placeholder="Unité" className={input} aria-label="Unité" />
              </div>
            )}
            <textarea value={q.explanation} onChange={(e) => patch(i, { ...q, explanation: e.target.value })} rows={2} placeholder="Explication affichée après la réponse" className={input} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setQuestions((qs) => [...qs, blank("mcq")])}><Plus size={15} /> QCM</Button>
        <Button variant="secondary" onClick={() => setQuestions((qs) => [...qs, blank("truefalse")])}><Plus size={15} /> Vrai / Faux</Button>
        <Button variant="secondary" onClick={() => setQuestions((qs) => [...qs, blank("numeric")])}><Plus size={15} /> Numérique</Button>
        <Button className="ml-auto" onClick={save} disabled={!valid}><Save size={15} /> Enregistrer</Button>
      </div>
    </div>
  );
}
