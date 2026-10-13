import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: { default: "QuestBac — Révise en jouant", template: "%s · QuestBac" },
  description:
    "Application de révision gamifiée pour la Seconde, la Première et la Terminale : missions, boss, classements, labos de maths interactifs et Prof IA.",
  applicationName: "QuestBac",
  appleWebApp: { capable: true, title: "QuestBac", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
