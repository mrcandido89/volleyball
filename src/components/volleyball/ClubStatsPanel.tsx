import type { ClubSeasonStats } from "@/types/volleyball";
import { StatCard } from "@/components/ui/StatCard";

type ClubStatsPanelProps = {
  stats: ClubSeasonStats;
  averagePointsPerMatch?: string;
};

export function ClubStatsPanel({ stats, averagePointsPerMatch }: ClubStatsPanelProps) {
  const winRate = (stats.wins / stats.matches) * 100;
  const pointsPerMatch = (stats.attackPoints + stats.blockPoints + stats.servePoints) / stats.matches;

  const items = [
    { label: "Jogos", value: String(stats.matches) },
    { label: "Vitórias", value: String(stats.wins) },
    { label: "Derrotas", value: String(stats.losses) },
    { label: "Pontos na classificação", value: String(stats.points) },
    { label: "Sets vencidos", value: String(stats.setsWon) },
    { label: "Sets perdidos", value: String(stats.setsLost) },
    { label: "Aproveitamento", value: `${winRate.toFixed(1)}%` },
    { label: "Média de pontos/jogo", value: averagePointsPerMatch ?? pointsPerMatch.toFixed(1) },
    { label: "Aces", value: String(stats.aces) },
    { label: "Bloqueios", value: String(stats.blockPoints) },
    { label: "Pontos de ataque", value: String(stats.attackPoints) },
    { label: "Pontos de saque", value: String(stats.servePoints) },
    { label: "Erros de saque", value: String(stats.serveErrors) },
    { label: "Recepção positiva", value: `${stats.positiveReceptionPercentage.toFixed(1)}%` },
    { label: "Recepção perfeita", value: `${stats.perfectReceptionPercentage.toFixed(1)}%` },
    { label: "Eficiência de ataque", value: `${stats.attackEfficiencyPercentage.toFixed(1)}%` },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}
