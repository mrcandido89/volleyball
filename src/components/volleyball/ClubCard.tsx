import Link from "next/link";

import type { Club, League, StandingRow } from "@/types/volleyball";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getStandingCategory } from "@/components/volleyball/StandingsTable";
import { formatPercentage } from "@/lib/utils";

type ClubCardProps = {
  club: Club;
  league: League;
  standing?: StandingRow;
};

export function ClubCard({ club, league, standing }: ClubCardProps) {
  const winRate =
    standing && standing.matchesPlayed > 0
      ? (standing.wins / standing.matchesPlayed) * 100
      : 0;
  const standingCategory = standing
    ? getStandingCategory(standing.position, league.numberOfTeams)
    : "mid";
  const standingBadgeVariant =
    standingCategory === "playoff"
      ? "success"
      : standingCategory === "relegation"
        ? "danger"
        : "neutral";

  return (
    <Card className="h-full p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-slate-900 font-bold text-slate-100">
          {club.shortName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{club.name}</h3>
          <p className="text-sm text-slate-400">
            {club.city}, {club.country}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="primary">{league.name}</Badge>
        {standing && (
          <Badge variant={standingBadgeVariant}>
            {standing.position}º lugar
          </Badge>
        )}
      </div>

      {standing && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-400">Jogos</p>
            <p className="font-medium text-slate-100">{standing.matchesPlayed}</p>
          </div>
          <div>
            <p className="text-slate-400">Pontos</p>
            <p className="font-medium text-slate-100">{standing.points}</p>
          </div>
          <div>
            <p className="text-slate-400">Vitórias</p>
            <p className="font-medium text-slate-100">{standing.wins}</p>
          </div>
          <div>
            <p className="text-slate-400">Aproveitamento</p>
            <p className="font-medium text-emerald-300">{formatPercentage(winRate)}</p>
          </div>
        </div>
      )}

      <Link
        href={`/clubes/${club.slug}`}
        className="mt-5 inline-flex rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-blue-400 hover:text-blue-300"
      >
        Ver clube
      </Link>
    </Card>
  );
}
