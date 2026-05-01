import Link from "next/link";

import { getClubById, getLeagueById } from "@/lib/volleyball-data";
import type { Match } from "@/types/volleyball";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

type MatchResultCardProps = {
  match: Match;
  perspectiveClubId?: string;
};

export function MatchResultCard({ match, perspectiveClubId }: MatchResultCardProps) {
  const league = getLeagueById(match.leagueId);
  const homeClub = getClubById(match.homeClubId);
  const awayClub = getClubById(match.awayClubId);
  const sets = match.setScores.map((set) => `${set.home}/${set.away}`).join(", ");
  const isPerspectiveClubWinner =
    perspectiveClubId === match.homeClubId
      ? match.homeSets > match.awaySets
      : perspectiveClubId === match.awayClubId
        ? match.awaySets > match.homeSets
        : undefined;

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {league ? <Badge variant="accent">{league.name}</Badge> : null}
        <Badge variant="neutral">{match.round}</Badge>
        <Badge variant="success">{match.status}</Badge>
        {typeof isPerspectiveClubWinner === "boolean" ? (
          <Badge variant={isPerspectiveClubWinner ? "success" : "danger"}>
            {isPerspectiveClubWinner ? "Vitória" : "Derrota"}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2">
          {homeClub ? (
            <Link href={`/clubes/${homeClub.slug}`} className="font-medium text-slate-100 hover:text-cyan-300">
              {homeClub.shortName}
            </Link>
          ) : (
            <span className="font-medium text-slate-100">{match.homeClubId}</span>
          )}
          <span className="text-xl font-bold text-emerald-300">{match.homeSets}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2">
          {awayClub ? (
            <Link href={`/clubes/${awayClub.slug}`} className="font-medium text-slate-100 hover:text-cyan-300">
              {awayClub.shortName}
            </Link>
          ) : (
            <span className="font-medium text-slate-100">{match.awayClubId}</span>
          )}
          <span className="text-xl font-bold text-emerald-300">{match.awaySets}</span>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-300">Sets: {sets}</p>
      <p className="mt-2 text-xs text-slate-500">{formatDate(match.date)}</p>
    </Card>
  );
}
