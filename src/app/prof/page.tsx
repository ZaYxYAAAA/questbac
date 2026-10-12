import type { Level, SubjectId } from "@/lib/types";
import { SUBJECTS } from "@/lib/content/curriculum";
import { ProfStudio } from "./ProfStudio";

export default async function ProfPage({ searchParams }: { searchParams: Promise<{ niveau?: string; matiere?: string; sujet?: string }> }) {
  const sp = await searchParams;
  const subject = SUBJECTS.find((s) => s.id === sp.matiere)?.id as SubjectId | undefined;
  const level = (["seconde", "premiere", "terminale"] as const).find((l) => l === sp.niveau) as Level | undefined;
  return <ProfStudio initialSubject={subject} initialLevel={level} initialTopic={sp.sujet?.slice(0, 300)} />;
}
