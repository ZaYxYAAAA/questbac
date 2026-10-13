import { z } from "zod";
import type { Difficulty, Question } from "@/lib/types";

const level = z.enum(["seconde", "premiere", "terminale"]);
const subject = z.enum(["maths", "physique", "svt", "histoire", "francais", "philo", "ses", "anglais", "espagnol"]);

// ───────────── Requêtes ─────────────

export const FicheRequest = z.object({
  level,
  subject,
  topic: z.string().trim().min(2, "Indique une notion à réviser").max(300),
  format: z.enum(["complete", "express", "methode"]).default("complete"),
});

/** ~4,8 Mo décodés par image : sous la limite de 5 Mo par image de l'API. */
const MAX_IMAGE_B64 = 6_500_000;

export const MissionRequest = z
  .object({
    level,
    subject,
    mode: z.enum(["photo", "texte", "sujet", "fiche"]),
    topic: z.string().trim().max(300).optional(),
    text: z.string().max(60_000).optional(),
    images: z
      .array(
        z.object({
          mediaType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
          data: z.string().min(100).max(MAX_IMAGE_B64),
        }),
      )
      .max(6)
      .optional(),
    count: z.number().int().min(3).max(20).default(8),
    difficulty: z.enum(["facile", "moyen", "difficile", "mixte"]).default("mixte"),
  })
  .superRefine((v, ctx) => {
    if (v.mode === "photo" && !v.images?.length) ctx.addIssue({ code: "custom", message: "Ajoute au moins une photo de ton cours." });
    if ((v.mode === "texte" || v.mode === "fiche") && (v.text?.trim().length ?? 0) < 30)
      ctx.addIssue({ code: "custom", message: "Le texte du cours est trop court (30 caractères minimum)." });
    if (v.mode === "sujet" && (v.topic?.trim().length ?? 0) < 2) ctx.addIssue({ code: "custom", message: "Indique le sujet de la mission." });
    const total = v.images?.reduce((n, i) => n + i.data.length, 0) ?? 0;
    if (total > 20_000_000) ctx.addIssue({ code: "custom", message: "Photos trop lourdes : réduis leur nombre ou leur taille." });
  });

export type MissionRequestInput = z.infer<typeof MissionRequest>;

// ───────────── Sortie structurée du modèle ─────────────

/**
 * Schéma « à plat » (champs nullables plutôt qu'une union) : plus robuste
 * pour la génération contrainte, puis normalisé en `Question`.
 */
export const GeneratedQuestion = z.object({
  type: z.enum(["mcq", "truefalse", "numeric"]),
  prompt: z.string(),
  choices: z.array(z.string()),
  answer_index: z.number().int().nullable(),
  answer_bool: z.boolean().nullable(),
  answer_number: z.number().nullable(),
  tolerance: z.number().nullable(),
  unit: z.string().nullable(),
  explanation: z.string(),
  difficulty: z.number().int(),
});

export const GeneratedMission = z.object({
  problem: z.string().nullable(),
  title: z.string(),
  summary: z.string(),
  fiche: z.string(),
  questions: z.array(GeneratedQuestion),
});

export type GeneratedMissionOutput = z.infer<typeof GeneratedMission>;

/** Convertit et filtre les questions générées ; les questions incohérentes sont écartées. */
export function normalizeQuestions(raw: z.infer<typeof GeneratedQuestion>[], idPrefix: string): Question[] {
  const out: Question[] = [];
  raw.forEach((q, i) => {
    const base = {
      id: `${idPrefix}-${i}`,
      prompt: q.prompt.trim(),
      explanation: q.explanation.trim(),
      difficulty: Math.min(3, Math.max(1, Math.round(q.difficulty || 1))) as Difficulty,
    };
    if (!base.prompt) return;
    if (q.type === "mcq") {
      const choices = q.choices.map((c) => c.trim()).filter(Boolean);
      if (choices.length < 2 || choices.length > 6) return;
      if (q.answer_index === null || q.answer_index < 0 || q.answer_index >= choices.length) return;
      if (new Set(choices).size !== choices.length) return;
      out.push({ ...base, type: "mcq", choices, answer: q.answer_index });
    } else if (q.type === "truefalse") {
      if (q.answer_bool === null) return;
      out.push({ ...base, type: "truefalse", answer: q.answer_bool });
    } else {
      if (q.answer_number === null || !Number.isFinite(q.answer_number)) return;
      out.push({
        ...base,
        type: "numeric",
        answer: q.answer_number,
        tolerance: q.tolerance !== null && q.tolerance >= 0 ? q.tolerance : Math.max(0.01, Math.abs(q.answer_number) * 0.01),
        unit: q.unit?.trim() || undefined,
      });
    }
  });
  return out;
}
