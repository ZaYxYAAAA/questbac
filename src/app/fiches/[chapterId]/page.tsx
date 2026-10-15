import { notFound } from "next/navigation";
import { chapterById } from "@/lib/content/curriculum";
import { FicheView } from "./FicheView";

export default async function FichePage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const chapter = chapterById(chapterId);
  if (!chapter) notFound();
  return <FicheView chapter={chapter} />;
}
