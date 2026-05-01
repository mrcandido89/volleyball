import Link from "next/link";

import { cn } from "@/lib/utils";

type MainNavProps = {
  className?: string;
};

const navItems = [
  { href: "/", label: "Início" },
  { href: "/ligas", label: "Ligas" },
  { href: "/clubes", label: "Clubes" },
  { href: "/jogadoras", label: "Jogadoras" },
];

export function MainNav({ className }: MainNavProps) {
  return (
    <nav className={cn("flex items-center gap-2", className)}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
