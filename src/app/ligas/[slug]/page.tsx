import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ClubCard } from "@/components/volleyball/ClubCard";
import { RecentMatchesList } from "@/components/volleyball/RecentMatchesList";
import { StandingsTable } from "@/components/volleyball/StandingsTable";
import {
  getClubById,
  getClubsByLeagueId,
  getLeagueBySlug,
  getMatchesByLeagueId,
  getStandingsByLeagueId,
} from "@/lib/volleyball-data";

type LeaguePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { slug } = await params;
  const league = getLeagueBySlug(slug);

  if (!league) {
    notFound();
  }

  const standings = getStandingsByLeagueId(league.id);
  const clubs = getClubsByLeagueId(league.id);
  const leagueMatches = getMatchesByLeagueId(league.id).slice(0, 6);
  const leader = getClubById(league.currentLeaderClubId);

  return (
    <div className="space-y-8">
      <PageHeader
        subtitle="Liga"
        title={league.name}
        description={league.description}
        rightContent={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="league">{league.country}</Badge>
            <Badge variant="secondary">{league.season}</Badge>
            <Badge variant="info">{league.currentPhase}</Badge>
            {leader ? <Badge variant="success">Líder: {leader.shortName}</Badge> : null}
          </div>
        }
      />

      <section className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoItem label="País" value={league.country} />
        <InfoItem label="Temporada" value={league.season} />
        <InfoItem label="Clubes" value={`${league.numberOfTeams}`} />
        <InfoItem label="Fase atual" value={league.currentPhase} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Classificação</h2>
          <p className="text-xs text-slate-400">Tabela atualizada da temporada regular</p>
        </div>
        <StandingsTable
          rows={standings}
          relegationSpots={league.relegationZoneSpots ?? 1}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-100">Clubes participantes</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => {
            const row = standings.find((item) => item.clubId === club.id);
            if (league.id === "league-superliga-br" && !row) {
              return null;
            }
            return (
              <ClubCard
                key={club.id}
                club={club}
                league={league}
                standing={row}
              />
            );
          })}
        </div>
      </section>

      <RecentMatchesList
        title="Últimos resultados da liga"
        matches={leagueMatches}
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/60 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}
