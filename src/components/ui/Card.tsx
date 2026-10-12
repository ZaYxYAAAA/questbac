import type { ReactNode } from "react";
import clsx from "clsx";

export function Card({ children, className, glow }: { children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-xl shadow-black/20 backdrop-blur sm:p-5",
        glow && "qb-glow",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, icon, action }: { children: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-lg font-bold text-white">
        {icon}
        {children}
      </h2>
      {action}
    </div>
  );
}
