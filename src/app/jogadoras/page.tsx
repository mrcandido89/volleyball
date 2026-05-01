import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerCard } from "@/components/volleyball/PlayerCard";
import { getClubById, getLeagueById, getPlayers, getPlayerStats } from "@/lib/volleyball-data";

export default function JogadorasPage() {
  const players = getPlayers();
  const hasPlayers = players.length > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Jogadoras"
        subtitle="Elenco completo"
        description="Perfis individuais disponíveis quando os dados oficiais de elenco estiverem publicados."
      />

      {hasPlayers ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => {
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
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">
          Ainda não há elenco oficial das atletas disponível para exibição com dados reais.
        </div>
      )}
    </div>
  );
}
