import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TableProps = {
  children: ReactNode;
  className?: string;
};

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn("px-3 py-3 font-semibold", className)}>{children}</th>;
}

export function TableCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={cn("px-3 py-3 text-slate-200", className)}>{children}</td>;
}

export function TableHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <thead
      className={cn(
        "bg-slate-900/90 text-left text-xs uppercase tracking-wide text-slate-400",
        className
      )}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tbody className={cn("divide-y divide-slate-800 bg-slate-950/60", className)}>{children}</tbody>;
}

export function TableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tr className={cn("transition-colors hover:bg-slate-900/60", className)}>{children}</tr>;
}

// Aliases para manter consistência de nomenclatura entre componentes
export const THead = TableHeader;
export const TBody = TableBody;
export const TH = TableHead;
export const TD = TableCell;
export const TR = TableRow;
export const Th = TableHead;
export const Td = TableCell;

export const TableHeaderCell = TableHead;
