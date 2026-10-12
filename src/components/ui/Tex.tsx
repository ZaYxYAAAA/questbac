"use client";

import katex from "katex";
import { useMemo } from "react";

/** Rendu KaTeX d'une formule (sans Markdown autour). */
export function Tex({ children, display = false, className = "" }: { children: string; display?: boolean; className?: string }) {
  const html = useMemo(
    () => katex.renderToString(children, { throwOnError: false, displayMode: display, strict: "ignore" }),
    [children, display],
  );
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
