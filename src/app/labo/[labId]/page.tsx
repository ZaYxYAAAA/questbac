import { notFound } from "next/navigation";
import { labById } from "@/lib/content/labs";
import { LabView } from "./LabView";

export default async function LabPage({ params }: { params: Promise<{ labId: string }> }) {
  const { labId } = await params;
  const lab = labById(labId);
  if (!lab) notFound();
  return <LabView labId={lab.id} />;
}
