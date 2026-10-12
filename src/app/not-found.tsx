import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <p className="text-7xl">🧭</p>
      <h1 className="text-3xl font-black text-white">Zone inexplorée</h1>
      <p className="text-slate-400">Cette page n&apos;existe pas… pas encore.</p>
      <LinkButton href="/">Retour au QG</LinkButton>
    </div>
  );
}
