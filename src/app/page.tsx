import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClubCard } from "@/components/volleyball/ClubCard";
import { LeagueCard } from "@/components/volleyball/LeagueCard";
import { MatchResultCard } from "@/components/volleyball/MatchResultCard";
import { PlayerCard } from "@/components/volleyball/PlayerCard";
import {
  getClubById,
  getCurrentStandingByClubId,
  getLeagueById,
  getLeagues,
  getPlayerStats,
  getPlayers,
  getRecentMatches,
} from "@/lib/volleyball-data";

export default function HomePage() {
  const leagues = getLeagues();
  const recentMatches = getRecentMatches(6);

  const featuredClubIds = [
    "club-praia-clube",
    "club-minas",
    "club-osasco",
    "club-sesc-flamengo",
    "club-fluminense",
    "club-barueri",
  ];
  const featuredPlayerIds = [
    "player-ana-cristina",
    "player-paola-egonu",
    "player-tijana-boskovic",
    "player-gabi-guimaraes",
    "player-joanna-wolosz",
    "player-isabelle-haak",
  ];

  const featuredPlayers = getPlayers().filter((player) => featuredPlayerIds.includes(player.id));

  const featuredClubs = featuredClubIds
    .map((clubId) => {
      const club = getClubById(clubId);
      if (!club) return null;
      const league = getLeagueById(club.leagueId);
      const standing = getCurrentStandingByClubId(club.id);
      return league ? { club, league, standing } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <Container className="space-y-10 py-10">
      <section className="rounded-2xl border border-slate-800/70 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 shadow-2xl">
        <p className="mb-3 inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
          VolleyStats Women
        </p>
        <h1 className="max-w-3xl text-3xl font-bold text-white md:text-4xl">
          Resultados, clubes e estatísticas das principais ligas de voleibol feminino.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-slate-300 md:text-base">
          Acompanhe classificações, elencos e desempenho das atletas em uma experiência esportiva
          moderna, com foco total em dados reais da Superliga A Feminina do Brasil.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/ligas"
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
          >
            Explorar ligas
          </Link>
          <Link
            href="/clubes"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/60"
          >
            Ver clubes
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <PageHeader
          title="Ligas principais"
          description="Competição disponível com dados reais no momento."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {leagues.map((league) => {
            const leader = getClubById(league.currentLeaderClubId);
            return <LeagueCard key={league.id} league={league} leader={leader} />;
          })}
        </div>
      </section>

      <section className="space-y-5">
        <PageHeader
          title="Últimos resultados"
          description="Partidas finalizadas recentemente nas ligas monitoradas."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {recentMatches.map((match) => (
            <MatchResultCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <PageHeader
          title="Clubes em destaque"
          description="Times com forte campanha nas competições atuais."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredClubs.map(({ club, league, standing }) => (
            <ClubCard key={club.id} club={club} league={league} standing={standing} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <PageHeader
          title="Jogadoras em destaque"
          description="Atletas com impacto ofensivo e consistência na temporada."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredPlayers.map((player) => {
            const stats = getPlayerStats(player.id);
            const club = getClubById(player.currentClubId);
            const league = club ? getLeagueById(club.leagueId) : undefined;
            return (
              <PlayerCard
                key={player.id}
                player={player}
                stats={stats}
                clubName={club?.shortName ?? "Sem clube"}
                leagueName={league?.name ?? "Liga indefinida"}
                points={stats?.totalPoints ?? 0}
              />
            );
          })}
        </div>
      </section>
    </Container>
  );
}
