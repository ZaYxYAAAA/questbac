import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "QuestBac — Révise en jouant",
    short_name: "QuestBac",
    description: "Révisions gamifiées du lycée : missions, boss, duels entre amis et classements.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#050816",
    theme_color: "#050816",
    lang: "fr",
    icons: [
      // ?v=2 : nouvelle icône (le téléphone garde l'ancienne en cache sinon).
      { src: "/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable.png?v=2", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
