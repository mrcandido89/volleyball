import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { MainNav } from "@/components/layout/MainNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-300">
            VS
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">VolleyStats Women</p>
            <p className="text-xs text-slate-400">Clubes e estatísticas</p>
          </div>
        </Link>

        <MainNav />

        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-300">
            <Search className="h-4 w-4 text-slate-400" />
            <span>Buscar liga, clube ou jogadora</span>
          </div>
          <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            Dark
          </div>
        </div>
      </Container>
    </header>
  );
}
