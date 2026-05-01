import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted"
  | "playoff"
  | "position"
  | "league"
  | "accent"
  | "neutral"
  | "secondary"
  | "primary";

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-700/60 text-slate-100 border-slate-600/70",
  success: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  warning: "bg-amber-500/20 text-amber-200 border-amber-400/40",
  danger: "bg-rose-500/20 text-rose-200 border-rose-400/40",
  info: "bg-sky-500/20 text-sky-200 border-sky-400/40",
  muted: "bg-slate-800/80 text-slate-300 border-slate-700/80",
  playoff: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  position: "bg-violet-500/20 text-violet-200 border-violet-400/40",
  league: "bg-cyan-500/20 text-cyan-200 border-cyan-400/40",
  accent: "bg-blue-500/20 text-blue-200 border-blue-400/40",
  neutral: "bg-zinc-700/60 text-zinc-200 border-zinc-600/70",
  secondary: "bg-indigo-500/20 text-indigo-200 border-indigo-400/40",
  primary: "bg-slate-700/60 text-slate-100 border-slate-600/70",
};

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
