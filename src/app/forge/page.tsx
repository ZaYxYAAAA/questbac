"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Camera, ImagePlus, Loader2, PenLine, Play, Trash2, X } from "lucide-react";
import { AiBadge } from "@/components/game/AiBadge";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { compressImage, generateMission, type MissionPayload } from "@/lib/ai/client-api";
import { LEVELS, levelLabel, subjectMeta, subjectsForLevel } from "@/lib/content/curriculum";
import { useGame } from "@/lib/store/game-store";
import { announce } from "@/lib/store/toast-store";
import type { CustomMission, Level, SubjectId } from "@/lib/types";

type Source = "photo" | "texte" | "sujet" | "manuel";
type Photo = { id: number; mediaType: "image/jpeg"; data: string; preview: string };

const SOURCES: { value: Source; emoji: string; label: string; hint: string }[] = [
  { value: "photo", emoji: "📸", label: "Photos du cours", hint: "Cahier, manuel, polycopié" },
  { value: "texte", emoji: "📝", label: "Texte collé", hint: "Copie ton cours" },
  { value: "sujet", emoji: "💡", label: "Un sujet", hint: "L'IA s'appuie sur le programme" },
  { value: "manuel", emoji: "✍️", label: "Mes questions", hint: "Écris toi-même ta mission" },
];

const FORGE_LINES = [
  "Le Prof Atlas déchiffre ton écriture…",
  "Il repère les notions clés…",
  "Il rédige ta fiche de révision…",
  "Il forge des pièges redoutables…",
  "Il polit les explications…",
];

const MAX_PHOTOS = 6;
let photoId = 0;

export default function ForgePage() {
  const router = useRouter();
  const game = useGame();
  const { recordActivity, deleteMission } = game;
  const [source, setSource] = useState<Source>("photo");
  const [level, setLevel] = useState<Level>(game.profile!.level);
  const [subject, setSubject] = useState<SubjectId>("maths");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [count, setCount] = useState(8);
  const [difficulty, setDifficulty] = useState<MissionPayload["difficulty"]>("mixte");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [line, setLine] = useState(0);
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const subjects = subjectsForLevel(level);
  useEffect(() => {
    if (!subjects.some((s) => s.id === subject)) setSubject(subjects[0].id);
  }, [level, subject, subjects]);

  useEffect(() => {
    if (!busy) return;
    const id = setInterval(() => setLine((l) => (l + 1) % FORGE_LINES.length), 2200);
    return () => clearInterval(id);
  }, [busy]);

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    setError(null);
    const room = MAX_PHOTOS - photos.length;
    const list = [...files].filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (files.length > room) setError(`${MAX_PHOTOS} photos maximum par mission.`);
    try {
      const compressed = await Promise.all(list.map((f) => compressImage(f)));
      setPhotos((p) => [...p, ...compressed.map((c) => ({ ...c, id: ++photoId }))]);
    } catch {
      setError("Impossible de lire une des images (format non pris en charge ?).");
    }
  };

  const save = (mission: CustomMission) => {
    announce(recordActivity({ kind: "forge", mission }));
    router.push(`/forge/${mission.id}${mission.source === "manuel" ? "?onglet=editer" : ""}`);
  };

  const forge = async () => {
    setError(null);
    if (source === "manuel") {
      if (title.trim().length < 2) return setError("Donne un titre à ta mission.");
      return save({
        id: `mission-${Date.now().toString(36)}`,
        title: title.trim(),
        subject,
        level,
        summary: "",
        fiche: "",
        questions: [],
        createdAt: Date.now(),
        source: "manuel",
      });
    }
    if (source === "photo" && photos.length === 0) return setError("Ajoute au moins une photo de ton cours.");
    if (source === "texte" && text.trim().length < 30) return setError("Colle un cours un peu plus long (30 caractères minimum).");
    if (source === "sujet" && topic.trim().length < 2) return setError("Indique le sujet de la mission.");

    setBusy(true);
    try {
      const m = await generateMission({
        level,
        subject,
        mode: source,
        topic: topic.trim() || undefined,
        text: source === "texte" ? text : undefined,
        images: source === "photo" ? photos.map(({ mediaType, data }) => ({ mediaType, data })) : undefined,
        count,
        difficulty,
      });
      save({
        id: `mission-${Date.now().toString(36)}`,
        title: m.title,
        subject,
        level,
        summary: m.summary,
        fiche: m.fiche,
        questions: m.questions,
        createdAt: Date.now(),
        source,
        demo: m.demo,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "La forge a échoué, réessaie.");
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">⚒️ Forge</h1>
          <p className="text-sm text-slate-400">Ton cours en photo ou en texte → une fiche + un QCM.</p>
        </div>
        <AiBadge />
      </div>

      <div className="relative space-y-5 rounded-3xl border border-white/10 bg-slate-900/70 p-5 sm:p-6">
        {busy && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-3xl bg-slate-950/90 backdrop-blur">
            <div className="text-center">
              <div className="qb-bob text-7xl">⚒️</div>
              <p className="mt-4 text-lg font-bold text-white">{FORGE_LINES[line]}</p>
              <p className="mt-1 text-sm text-slate-400">Cela peut prendre jusqu&apos;à une minute.</p>
              <Loader2 className="mx-auto mt-4 animate-spin text-violet-400" />
            </div>
          </div>
        )}

        {/* 1. Source */}
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">1 · D&apos;où vient ta mission ?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SOURCES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSource(s.value)}
                className={clsx("rounded-2xl border p-3 text-left transition", source === s.value ? "border-violet-400 bg-violet-600/20" : "border-white/10 bg-slate-800/50 hover:border-white/25")}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="mt-1 block text-sm font-bold text-white">{s.label}</span>
                <span className="text-xs text-slate-400">{s.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Contenu */}
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">2 · Ton contenu</p>
          {source === "photo" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                <input ref={fileInput} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                <Button variant="secondary" onClick={() => cameraInput.current?.click()} disabled={photos.length >= MAX_PHOTOS}>
                  <Camera size={16} /> Prendre une photo
                </Button>
                <Button variant="secondary" onClick={() => fileInput.current?.click()} disabled={photos.length >= MAX_PHOTOS}>
                  <ImagePlus size={16} /> Importer des images
                </Button>
                <span className="self-center text-xs text-slate-500">{photos.length}/{MAX_PHOTOS} · dans l&apos;ordre des pages</span>
              </div>
              {photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {photos.map((p, i) => (
                    <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.preview} alt={`Page ${i + 1}`} className="h-full w-full object-cover" />
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-xs font-bold text-white">{i + 1}</span>
                      <button type="button" aria-label="Retirer la photo" onClick={() => setPhotos((ps) => ps.filter((x) => x.id !== p.id))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white hover:bg-rose-600">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                  className="grid w-full place-items-center rounded-2xl border-2 border-dashed border-white/15 py-10 text-slate-400 transition hover:border-violet-400 hover:text-violet-200"
                >
                  <ImagePlus size={32} />
                  <span className="mt-2 text-sm">Glisse tes photos ici ou clique pour les choisir</span>
                  <span className="text-xs text-slate-500">Astuce : photo bien éclairée, page entière, à plat.</span>
                </button>
              )}
            </div>
          )}
          {source === "texte" && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              maxLength={60000}
              placeholder="Colle ici le texte de ton cours…"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
            />
          )}
          {source === "manuel" ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder="Titre de ta mission (ex. Les dates de la Révolution)"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-400"
            />
          ) : (
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={300}
              placeholder={source === "sujet" ? "Sujet de la mission (ex. Les lois de Newton)" : "Indication facultative (ex. insiste sur les définitions)"}
              className="mt-3 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-400"
            />
          )}
        </div>

        {/* 3. Réglages */}
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">3 · Réglages</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid grid-cols-2 gap-3">
              <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white" aria-label="Classe">
                {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
              <select value={subject} onChange={(e) => setSubject(e.target.value as SubjectId)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white" aria-label="Matière">
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
              </select>
            </div>
            {source !== "manuel" && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {(["facile", "moyen", "difficile", "mixte"] as const).map((d) => (
                    <button key={d} type="button" onClick={() => setDifficulty(d)} className={clsx("flex-1 rounded-xl px-3 py-2 text-sm font-semibold capitalize", difficulty === d ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-300")}>
                      {d}
                    </button>
                  ))}
                </div>
                <div className="sm:col-span-2">
                  <Slider label="Nombre de questions" value={count} min={3} max={20} step={1} onChange={setCount} format={(v) => String(v)} />
                </div>
              </>
            )}
          </div>
        </div>

        {error && <p className="rounded-xl bg-rose-500/15 p-3 text-sm text-rose-300">{error}</p>}
        <Button variant="gold" onClick={forge} disabled={busy} className="w-full py-3.5 text-base">
          {source === "manuel" ? <><PenLine size={18} /> Créer et écrire mes questions</> : <>⚒️ Forger la mission</>}
        </Button>
      </div>

      {/* Mes missions */}
      <section>
        <h2 className="mb-3 text-xl font-black text-white">Mes missions ({game.missions.length})</h2>
        {game.missions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-500">Aucune mission forgée pour l&apos;instant.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {game.missions.map((m) => {
              const meta = subjectMeta(m.subject);
              return (
                <div key={m.id} className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div className="flex items-start gap-3">
                    <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xl", meta.gradient)}>{meta.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <Link href={`/forge/${m.id}`} className="block truncate font-bold text-white hover:text-violet-200">{m.title}</Link>
                      <p className="text-xs text-slate-500">
                        {levelLabel(m.level)} · {m.questions.length} questions{m.demo ? " · démo" : ""}
                        {m.bestScore !== undefined && ` · record ${Math.round(m.bestScore * 100)} %`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link href={`/forge/${m.id}`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500">
                      <Play size={14} /> Ouvrir
                    </Link>
                    <button type="button" aria-label="Supprimer la mission" onClick={() => confirm(`Supprimer « ${m.title} » ?`) && deleteMission(m.id)} className="rounded-xl bg-slate-800 px-3 text-slate-400 hover:bg-rose-600 hover:text-white">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
