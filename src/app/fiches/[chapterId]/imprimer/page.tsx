import { notFound } from "next/navigation";
import { chapterById } from "@/lib/content/curriculum";
import { PrintView } from "./PrintView";

export default async function FichePrintPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const chapter = chapterById(chapterId);
  if (!chapter) notFound();
  return <PrintView chapter={chapter} />;
}
