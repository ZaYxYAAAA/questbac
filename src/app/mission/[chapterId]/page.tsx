import { notFound } from "next/navigation";
import { chapterById } from "@/lib/content/curriculum";
import { MissionPlayer } from "./MissionPlayer";

export default async function MissionPage({ params, searchParams }: { params: Promise<{ chapterId: string }>; searchParams: Promise<{ melange?: string }> }) {
  const { chapterId } = await params;
  const { melange } = await searchParams;
  const chapter = chapterById(chapterId);
  if (!chapter) notFound();
  return <MissionPlayer key={melange ? "mix" : "chapter"} chapter={chapter} autoMix={melange === "1"} />;
}
