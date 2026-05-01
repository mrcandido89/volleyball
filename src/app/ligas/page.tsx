import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { LeagueCard } from "@/components/volleyball/LeagueCard";
import { getClubById, getLeagues } from "@/lib/volleyball-data";

export default function LeaguesPage() {
  const leagues = getLeagues();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Competições"
        title="Ligas femininas de clubes"
        description="Acompanhe classificação, resultados e estatísticas em dados reais da Superliga A Feminina."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {leagues.map((league) => (
          <LeagueCard
            key={league.id}
            league={league}
            leader={getClubById(league.currentLeaderClubId)}
          />
        ))}
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        Dica: clique em uma liga para ver a classificação completa, clubes participantes e os
        resultados recentes.
      </div>
      <div className="text-sm text-slate-400">
        Deseja navegar direto para um clube? Acesse{" "}
        <Link href="/clubes" className="text-cyan-300 hover:text-cyan-200">
          a página de clubes
        </Link>
        .
      </div>
    </div>
  );
}
