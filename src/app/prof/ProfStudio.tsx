"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Copy, Hammer, Loader2, Printer, Sparkles, Square, Trash2 } from "lucide-react";
import { AiBadge } from "@/components/game/AiBadge";
import { Button } from "@/components/ui/Button";
import { Markdown } from "@/components/ui/Markdown";
import { generateMission, streamFiche } from "@/lib/ai/client-api";
import { LEVELS, chaptersFor, levelLabel, subjectMeta, subjectsForLevel } from "@/lib/content/curriculum";
import { useGame } from "@/lib/store/game-store";
import { announce, useToasts } from "@/lib/store/toast-store";
import type { Level, SavedFiche, SubjectId } from "@/lib/types";

type Format = "complete" | "express" | "methode";

const FORMATS: { value: Format; label: string; hint: string }[] = [
  { value: "complete", label: "📚 Fiche complète", hint: "Cours, méthodes, exemple corrigé, pièges, auto-test" },
  { value: "express", label: "⚡ Fiche express", hint: "L'essentiel sur une page" },
  { value: "methode", label: "🛠️ Méthodes & exercices", hint: "Savoir-faire et exercices corrigés" },
];

const LOADING_LINES = ["Le Prof Atlas ouvre ses manuels…", "Il vérifie le programme officiel…", "Il prépare un exemple corrigé…", "Il traque les pièges classiques…"];

export function ProfStudio({ initialSubject, initialLevel, initialTopic }: { initialSubject?: SubjectId; initialLevel?: Level; initialTopic?: string }) {
  const router = useRouter();
  const game = useGame();
  const { recordActivity, deleteFiche } = game;
  const [level, setLevel] = useState<Level>(initialLevel ?? game.profile!.level);
  const [subject, setSubject] = useState<SubjectId>(initialSubject ?? "maths");
  const [topic, setTopic] = useState(initialTopic ?? "");
  const [format, setFormat] = useState<Format>("complete");
  const [content, setContent] = useState("");
  const [viewing, setViewing] = useState<SavedFiche | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [forging, setForging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const abort = useRef<AbortController | null>(null);

  const subjects = subjectsForLevel(level);
  useEffect(() => {
    if (!subjects.some((s) => s.id === subject)) setSubject(subjects[0].id);
  }, [level, subject, subjects]);

  useEffect(() => {
    if (!streaming || content) return;
    const id = setInterval(() => setLineIndex((i) => (i + 1) % LOADING_LINES.length), 1800);
    return () => clearInterval(id);
  }, [streaming, content]);

  const generate = async () => {
    if (topic.trim().length < 2) return setError("Indique la notion à réviser.");
    setError(null);
    setViewing(null);
    setContent("");
    setStreaming(true);
    abort.current = new AbortController();
    try {
      const { text, demo } = await streamFiche({ level, subject, topic: topic.trim(), format }, setContent, abort.current.signal);
      if (text.trim().length > 80) {
        const fiche: SavedFiche = {
          id: `fiche-${Date.now().toString(36)}`,
          title: topic.trim(),
          subject,
          level,
          content: text,
          createdAt: Date.now(),
          demo,
        };
        setViewing(fiche);
        announce(recordActivity({ kind: "fiche", fiche }));
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(e instanceof Error ? e.message : "Erreur inattendue.");
    } finally {
      setStreaming(false);
    }
  };

  const shown = viewing?.content ?? content;

  const forgeFromFiche = async () => {
    if (!viewing) return;
    setForging(true);
    setError(null);
    try {
      const m = await generateMission({ level: viewing.level, subject: viewing.subject, mode: "fiche", text: viewing.content, topic: viewing.title, count: 8, difficulty: "mixte" });
      const mission = {
        id: `mission-${Date.now().toString(36)}`,
        title: m.title,
        subject: viewing.subject,
        level: viewing.level,
        summary: m.summary,
        fiche: viewing.content,
        questions: m.questions,
        createdAt: Date.now(),
        source: "fiche" as const,
        demo: m.demo,
      };
      announce(recordActivity({ kind: "forge", mission }));
      router.push(`/forge/${mission.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de créer le QCM.");
      setForging(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-5">
        <div className="qb-no-print flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-white">🎓 Prof IA</h1>
            <p className="text-slate-400">Le Professeur Atlas rédige une fiche claire et précise sur la notion de ton choix.</p>
          </div>
          <AiBadge />
        </div>

        <form
          className="qb-no-print space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            generate();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-300">Classe</span>
              <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white">
                {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-semibold text-slate-300">Matière</span>
              <select value={subject} onChange={(e) => setSubject(e.target.value as SubjectId)} className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-white">
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-300">Notion à réviser</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={300}
              placeholder="ex. Le théorème des valeurs intermédiaires, la mitose, la guerre froide…"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-400"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {chaptersFor(subject, level).slice(0, 8).map((c) => (
              <button key={c.id} type="button" onClick={() => setTopic(c.title)} className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-violet-600 hover:text-white">
                {c.title}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFormat(f.value)}
                className={clsx("rounded-xl border p-3 text-left transition", format === f.value ? "border-violet-400 bg-violet-600/20" : "border-white/10 bg-slate-800/50 hover:border-white/25")}
              >
                <span className="block text-sm font-bold text-white">{f.label}</span>
                <span className="text-xs text-slate-400">{f.hint}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={streaming} className="flex-1 py-3">
              {streaming ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {streaming ? "Rédaction en cours…" : "Générer la fiche"}
            </Button>
            {streaming && (
              <Button variant="secondary" onClick={() => abort.current?.abort()} aria-label="Arrêter">
                <Square size={14} /> Stop
              </Button>
            )}
          </div>
          {error && <p className="rounded-xl bg-rose-500/15 p-3 text-sm text-rose-300">{error}</p>}
        </form>

        {(shown || streaming) && (
          <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-8">
            {viewing && (
              <div className="qb-no-print mb-5 flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
                <span className="mr-auto text-xs text-slate-500">
                  {subjectMeta(viewing.subject).emoji} {subjectMeta(viewing.subject).name} · {levelLabel(viewing.level)}
                </span>
                <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(viewing.content); useToasts.getState().push({ emoji: "📋", title: "Fiche copiée", tone: "emerald" }); }}>
                  <Copy size={14} /> Copier
                </Button>
                <Button variant="secondary" onClick={() => window.print()}>
                  <Printer size={14} /> Imprimer / PDF
                </Button>
                <Button variant="gold" onClick={forgeFromFiche} disabled={forging}>
                  {forging ? <Loader2 size={14} className="animate-spin" /> : <Hammer size={14} />} Créer un QCM
                </Button>
              </div>
            )}
            {shown ? <Markdown>{shown}</Markdown> : <p className="animate-pulse text-slate-400">{LOADING_LINES[lineIndex]}</p>}
            {streaming && shown && <span className="ml-1 inline-block h-5 w-2 animate-pulse bg-violet-400 align-middle" />}
          </article>
        )}
      </div>

      <aside className="qb-no-print space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Mes fiches ({game.fiches.length})</h2>
        {game.fiches.length === 0 && <p className="text-sm text-slate-500">Tes fiches générées apparaîtront ici.</p>}
        <div className="space-y-2">
          {game.fiches.map((f) => (
            <div key={f.id} className={clsx("group flex items-center gap-2 rounded-xl border p-2.5", viewing?.id === f.id ? "border-violet-400 bg-violet-600/15" : "border-white/10 bg-slate-900/60")}>
              <button type="button" onClick={() => { setViewing(f); setContent(""); }} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-semibold text-white">{subjectMeta(f.subject).emoji} {f.title}</span>
                <span className="text-xs text-slate-500">{levelLabel(f.level)} · {new Date(f.createdAt).toLocaleDateString("fr-FR")}{f.demo ? " · démo" : ""}</span>
              </button>
              <button type="button" aria-label="Supprimer la fiche" onClick={() => { deleteFiche(f.id); if (viewing?.id === f.id) setViewing(null); }} className="text-slate-600 transition hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
