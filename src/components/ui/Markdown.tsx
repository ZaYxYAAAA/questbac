"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

/**
 * Markdown + LaTeX ($...$ et $$...$$), utilisé pour les énoncés, les fiches
 * du Prof IA et les explications.
 */
export function Markdown({ children, compact = false }: { children: string; compact?: boolean }) {
  return (
    <div className={compact ? "qb-md qb-md-compact" : "qb-md"}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: "ignore" }]]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
