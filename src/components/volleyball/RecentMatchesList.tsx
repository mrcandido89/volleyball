import type { Match } from "@/types/volleyball";

import { MatchResultCard } from "@/components/volleyball/MatchResultCard";
import { Card } from "@/components/ui/Card";

type RecentMatchesListProps = {
  title?: string;
  matches: Match[];
  perspectiveClubId?: string;
};

export function RecentMatchesList({ title, matches, perspectiveClubId }: RecentMatchesListProps) {
  return (
    <section className="space-y-4">
      {title ? <h3 className="text-xl font-semibold text-slate-100">{title}</h3> : null}
      {matches.length ? (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchResultCard
              key={match.id}
              match={match}
              perspectiveClubId={perspectiveClubId}
            />
          ))}
        </div>
      ) : (
        <Card className="text-sm text-slate-400">Nenhuma partida recente registrada.</Card>
      )}
    </section>
  );
}
