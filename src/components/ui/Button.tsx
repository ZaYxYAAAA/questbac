import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import clsx from "clsx";
import { play } from "@/lib/sound";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/40 hover:brightness-110",
  secondary: "border border-white/10 bg-slate-800 text-slate-100 hover:bg-slate-700",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
  gold: "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-900/40 hover:brightness-110",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export function Button({ variant = "primary", className, onClick, ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={clsx(base, VARIANTS[variant], className)}
      onClick={(e) => {
        play("tap");
        onClick?.(e);
      }}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={clsx(base, VARIANTS[variant], className)}>
      {children}
    </Link>
  );
}
