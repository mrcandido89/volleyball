import { notFound } from "next/navigation";

import { ClubStatsPanel } from "@/components/volleyball/ClubStatsPanel";
import { RecentMatchesList } from "@/components/volleyball/RecentMatchesList";
import { RosterTable } from "@/components/volleyball/RosterTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  getClubBySlug,
  getClubStats,
  getCurrentStandingByClubId,
  getLeagueById,
  getMatchesByClubId,
  getPlayerStats,
  getPlayersByClubId,
} from "@/lib/volleyball-data";

type ClubPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ClubPage({ params }: ClubPageProps) {
  const { slug } = await params;
  const club = getClubBySlug(slug);

  if (!club) {
    notFound();
  }

  const league = getLeagueById(club.leagueId);
  const standing = getCurrentStandingByClubId(club.id);
  const stats = getClubStats(club.id);
  const roster = getPlayersByClubId(club.id);
  const recentMatches = getMatchesByClubId(club.id).slice(0, 6);
  const statsByPlayerId = Object.fromEntries(
    roster.map((player) => [player.id, getPlayerStats(player.id)]),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={club.name}
        subtitle={`${club.city}, ${club.country}`}
        description={`Temporada ${league?.season ?? "2025/26"} • Informações de elenco, resultados e estatísticas.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">{league?.name ?? "Liga"}</Badge>
            {standing && <Badge variant="success">{standing.position}º na classificação</Badge>}
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-400">Ginásio</p>
          <p className="mt-1 font-semibold text-slate-100">{club.arena}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-400">Técnico(a)</p>
          <p className="mt-1 font-semibold text-slate-100">{club.coach}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-400">Temporada</p>
          <p className="mt-1 font-semibold text-slate-100">{league?.season ?? "2025/26"}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-400">Aproveitamento</p>
          <p className="mt-1 font-semibold text-slate-100">N/A</p>
        </Card>
      </section>

      {stats && <ClubStatsPanel stats={stats} />}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-100">Últimos resultados</h2>
        <RecentMatchesList matches={recentMatches} perspectiveClubId={club.id} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-100">Elenco atual</h2>
        {roster.length ? (
          <RosterTable players={roster} statsByPlayerId={statsByPlayerId} />
        ) : (
          <Card className="text-sm text-slate-400">
            Elenco real ainda não integrado via scraping da CBV para este clube.
          </Card>
        )}
      </section>
    </div>
  );
}
