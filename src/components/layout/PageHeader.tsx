import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: string;
  actions?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export function PageHeader({
  title,
  description,
  subtitle,
  eyebrow,
  badge,
  actions,
  rightContent,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7",
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          {badge ? <Badge variant="info">{badge}</Badge> : null}
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-300">{eyebrow}</p>
          ) : null}
          {subtitle ? (
            <p className="text-xs font-medium uppercase tracking-widest text-sky-300">
              {subtitle}
            </p>
          ) : null}
          <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl">{title}</h1>
          {description ? (
            <p className="max-w-3xl text-sm text-slate-400 sm:text-base">{description}</p>
          ) : null}
          {children ? <div className="flex flex-wrap gap-2 pt-2">{children}</div> : null}
        </div>
        {actions ?? rightContent ? <div className="shrink-0">{actions ?? rightContent}</div> : null}
      </div>
    </div>
  );
}
