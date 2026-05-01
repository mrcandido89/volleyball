import { notFound } from "next/navigation";
import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { PlayerCareerTable } from "@/components/volleyball/PlayerCareerTable";
import { PlayerSeasonStatsTable } from "@/components/volleyball/PlayerSeasonStatsTable";
import { PlayerStatsPanel } from "@/components/volleyball/PlayerStatsPanel";
import {
  getClubById,
  getLeagueById,
  getMatchById,
  getMatchesByClubId,
  getPlayerBySlug,
  getPlayerCareer,
  getPlayerRecentMatchStats,
  getPlayerSeasonStats,
  getPlayerStats,
} from "@/lib/volleyball-data";
import { formatDate } from "@/lib/utils";

type PlayerPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const player = getPlayerBySlug(slug);

  if (!player) {
    notFound();
  }

  const club = getClubById(player.currentClubId);
  const league = club ? getLeagueById(club.leagueId) : undefined;
  const stats = getPlayerStats(player.id);
  const seasonEntries = getPlayerSeasonStats(player.id);
  const careerEntries = getPlayerCareer(player.id);
  const matchEntries = getPlayerRecentMatchStats(player.id).slice(0, 5);
  const clubMatches = getMatchesByClubId(player.currentClubId).slice(0, 5);
  const seasonRows = seasonEntries.length
    ? seasonEntries
    : stats
      ? [stats]
      : [];
  const playerRecentMatches = matchEntries.flatMap((entry) => {
    const match = getMatchById(entry.matchId);
    if (!match) return [];
    const isHome = match.homeClubId === player.currentClubId;
    const opponentClub = getClubById(isHome ? match.awayClubId : match.homeClubId);
    return [{ match, playerStat: entry, opponentClub }];
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={player.name}
        subtitle={
          league
            ? `${player.position} • ${club?.name ?? "Clube indefinido"} • ${league.name}`
            : `${player.position} • ${club?.name ?? "Clube indefinido"}`
        }
        description="Perfil individual com estatísticas da temporada, histórico de clubes e partidas recentes."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="info">{player.nationality}</Badge>
          <Badge>{player.dominantHand}</Badge>
          <Badge variant="success">Camisa {player.shirtNumber}</Badge>
        </div>
      </PageHeader>

      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={player.name} size="xl" />
            <div>
              <h2 className="text-2xl font-semibold text-slate-100">{player.name}</h2>
              <p className="text-sm text-slate-300">{player.position}</p>
              {club ? (
                <Link href={`/clubes/${club.slug}`} className="text-sm text-cyan-300 hover:text-cyan-200">
                  {club.name}
                </Link>
              ) : null}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <dt className="text-slate-400">Idade</dt>
              <dd className="font-semibold text-slate-100">{player.age}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Altura</dt>
              <dd className="font-semibold text-slate-100">{player.heightCm} cm</dd>
            </div>
            <div>
              <dt className="text-slate-400">Nacionalidade</dt>
              <dd className="font-semibold text-slate-100">{player.nationality}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Mão dominante</dt>
              <dd className="font-semibold text-slate-100">{player.dominantHand}</dd>
            </div>
          </dl>
        </div>
      </Card>

      {stats ? <PlayerStatsPanel stats={stats} /> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PlayerSeasonStatsTable rows={seasonRows} />
        </div>
        <div>
          <PlayerCareerTable entries={careerEntries} />
        </div>
      </div>

      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">Últimos jogos da jogadora</h3>
          <span className="text-xs uppercase tracking-wide text-slate-400">Com participação registrada</span>
        </div>
        <div className="space-y-3">
          {playerRecentMatches.length ? (
            playerRecentMatches.map(({ match, playerStat, opponentClub }) => {
              return (
                <div
                  key={match.id}
                  className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-slate-100">
                      vs {opponentClub?.shortName ?? "Adversário"} — {match.homeSets} x{" "}
                      {match.awaySets}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(match.date)}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Pontos</span>
                      <p className="font-semibold text-slate-100">{playerStat?.points ?? 0}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Aces</span>
                      <p className="font-semibold text-slate-100">{playerStat?.aces ?? 0}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Bloqueios</span>
                      <p className="font-semibold text-slate-100">{playerStat?.blocks ?? 0}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-400">Sem jogos recentes disponíveis para esta jogadora.</p>
          )}
        </div>
      </Card>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-100">Últimos resultados do clube atual</h3>
        <div className="space-y-3">
          {clubMatches.map((match) => {
            const home = getClubById(match.homeClubId);
            const away = getClubById(match.awayClubId);
            return (
              <Card key={match.id} className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-100">
                    {home?.shortName ?? "Casa"} {match.homeSets} x {match.awaySets}{" "}
                    {away?.shortName ?? "Visitante"}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(match.date)}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {match.round} • Sets:{" "}
                  {match.setScores.map((set) => `${set.home}/${set.away}`).join(", ")}
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
