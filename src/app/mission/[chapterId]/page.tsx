import { notFound } from "next/navigation";
import { chapterById } from "@/lib/content/curriculum";
import { MissionPlayer } from "./MissionPlayer";

export default async function MissionPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const chapter = chapterById(chapterId);
  if (!chapter) notFound();
  return <MissionPlayer chapter={chapter} />;
}
