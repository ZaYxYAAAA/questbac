"use client";

import { useEffect, useState } from "react";
import type { Level, Question, SubjectId } from "@/lib/types";

export interface GeneratedMissionResponse {
  title: string;
  summary: string;
  fiche: string;
  questions: Question[];
  demo: boolean;
}

export interface MissionPayload {
  level: Level;
  subject: SubjectId;
  mode: "photo" | "texte" | "sujet" | "fiche";
  topic?: string;
  text?: string;
  images?: { mediaType: string; data: string }[];
  count: number;
  difficulty: "facile" | "moyen" | "difficile" | "mixte";
}

async function readError(res: Response) {
  try {
    const body = await res.json();
    return typeof body?.error === "string" ? body.error : `Erreur ${res.status}`;
  } catch {
    return `Erreur ${res.status}`;
  }
}

export async function generateMission(payload: MissionPayload, signal?: AbortSignal): Promise<GeneratedMissionResponse> {
  const res = await fetch("/api/missions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

/** Lance la génération d'une fiche et transmet le Markdown au fil de l'eau. */
export async function streamFiche(
  payload: { level: Level; subject: SubjectId; topic: string; format: "complete" | "express" | "methode" },
  onText: (fullText: string) => void,
  signal?: AbortSignal,
): Promise<{ text: string; demo: boolean }> {
  const res = await fetch("/api/fiche", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(await readError(res));
  const demo = res.headers.get("X-QB-Demo") === "1";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  text += decoder.decode();
  onText(text);
  return { text, demo };
}

/** État de connexion de l'IA (pour afficher le badge « mode démo »). */
export function useAiStatus() {
  const [status, setStatus] = useState<{ ai: boolean; model: string | null } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/status")
      .then((r) => r.json())
      .then((s) => alive && setStatus(s))
      .catch(() => alive && setStatus({ ai: false, model: null }));
    return () => {
      alive = false;
    };
  }, []);
  return status;
}

/** Réduit une photo (max 1600 px, JPEG) avant envoi : plus rapide et sous les limites de l'API. */
export async function compressImage(file: File, maxSide = 1600, quality = 0.85): Promise<{ mediaType: "image/jpeg"; data: string; preview: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { mediaType: "image/jpeg", data: dataUrl.split(",")[1], preview: dataUrl };
}
