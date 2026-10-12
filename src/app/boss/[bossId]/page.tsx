import { notFound } from "next/navigation";
import { bossById } from "@/lib/content/bosses";
import { BossArena } from "./BossArena";

export default async function BossPage({ params }: { params: Promise<{ bossId: string }> }) {
  const { bossId } = await params;
  const boss = bossById(bossId);
  if (!boss) notFound();
  return <BossArena bossId={boss.id} />;
}
