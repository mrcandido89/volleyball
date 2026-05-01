import type { PlayerSeasonStats } from "@/types/volleyball";
import { StatCard } from "@/components/ui/StatCard";
import { formatPercentage } from "@/lib/utils";

type PlayerStatsPanelProps = {
  stats: PlayerSeasonStats;
};

export function PlayerStatsPanel({ stats }: PlayerStatsPanelProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Jogos" value={stats.matches} />
      <StatCard label="Sets jogados" value={stats.setsPlayed} />
      <StatCard label="Pontos totais" value={stats.totalPoints} />
      <StatCard label="Média por jogo" value={stats.pointsPerMatch} />
      <StatCard label="Pontos de ataque" value={stats.attackPoints} />
      <StatCard label="Pontos de bloqueio" value={stats.blockPoints} />
      <StatCard label="Pontos de saque" value={stats.servePoints} />
      <StatCard label="Aces" value={stats.aces} />
      <StatCard
        label="Eficiência de ataque"
        value={formatPercentage(stats.attackEfficiencyPercentage)}
      />
      {typeof stats.positiveReceptionPercentage === "number" && (
        <StatCard
          label="Recepção positiva"
          value={formatPercentage(stats.positiveReceptionPercentage)}
        />
      )}
    </div>
  );
}
