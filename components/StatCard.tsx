import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "blue" | "green" | "cyan" | "slate" | "rose";
}) {
  const accents = {
    blue: "text-[#7db0ff] bg-[#2f6dff]/10",
    green: "text-emerald-300 bg-emerald-400/10",
    cyan: "text-sky-300 bg-sky-400/10",
    slate: "text-slate-300 bg-white/6",
    rose: "text-rose-300 bg-rose-400/10",
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <span className={cn("rounded-lg p-2", accents[accent])}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
