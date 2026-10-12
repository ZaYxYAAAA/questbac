import clsx from "clsx";

export function ProgressBar({
  value,
  className,
  barClassName = "bg-gradient-to-r from-violet-500 to-fuchsia-500",
  height = "h-2.5",
}: {
  value: number; // 0..1
  className?: string;
  barClassName?: string;
  height?: string;
}) {
  return (
    <div className={clsx("w-full overflow-hidden rounded-full bg-slate-800", height, className)}>
      <div
        className={clsx("h-full rounded-full transition-[width] duration-700 ease-out", barClassName)}
        style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
      />
    </div>
  );
}
