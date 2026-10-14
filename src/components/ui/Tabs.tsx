"use client";

import { useLayoutEffect, useRef, useState } from "react";
import clsx from "clsx";

/** Onglets : la pastille de l'onglet actif glisse de l'un à l'autre. */
export function Tabs<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const el = box.current?.querySelector<HTMLElement>('[aria-selected="true"]');
      if (el) setPill({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [value, options.length]);

  // Pas d'animation au premier affichage : la pastille est directement en place.
  useLayoutEffect(() => {
    if (pill && !animate) requestAnimationFrame(() => setAnimate(true));
  }, [pill, animate]);

  return (
    <div ref={box} role="tablist" className={clsx("relative inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-slate-900/80 p-1", className)}>
      {pill && (
        <span
          aria-hidden
          className={clsx("absolute left-0 top-0 rounded-lg bg-violet-600 shadow", animate && "transition-[transform,width,height] duration-300 [transition-timing-function:var(--qb-ease)]")}
          style={{ width: pill.w, height: pill.h, transform: `translate(${pill.x}px, ${pill.y}px)` }}
        />
      )}
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            "relative z-10 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200",
            value === o.value ? "text-white" : "text-slate-400 hover:text-white",
            !pill && value === o.value && "bg-violet-600",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
