import { notFound } from "next/navigation";
import { SUBJECTS } from "@/lib/content/curriculum";
import type { Level, SubjectId } from "@/lib/types";
import { SubjectMap } from "./SubjectMap";

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ niveau?: string }>;
}) {
  const { subject } = await params;
  const { niveau } = await searchParams;
  const meta = SUBJECTS.find((s) => s.id === subject);
  if (!meta) notFound();
  const level = meta.levels.includes(niveau as Level) ? (niveau as Level) : null;
  return <SubjectMap subject={subject as SubjectId} initialLevel={level} />;
}
