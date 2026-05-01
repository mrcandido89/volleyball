import Link from "next/link";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Club, League } from "@/types/volleyball";

type LeagueCardProps = {
  league: League;
  leader?: Club;
};

export function LeagueCard({ league, leader }: LeagueCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{league.name}</CardTitle>
            <p className="mt-1 text-sm text-slate-400">{league.country}</p>
          </div>
          <Badge variant="info">{league.season}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-300">
        <p>{league.description}</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-slate-800/80 bg-slate-900/50 p-2">
            <p className="text-xs text-slate-400">Clubes</p>
            <p className="text-base font-semibold text-slate-100">{league.numberOfTeams}</p>
          </div>
          <div className="rounded-md border border-slate-800/80 bg-slate-900/50 p-2">
            <p className="text-xs text-slate-400">Líder</p>
            <p className="truncate text-base font-semibold text-slate-100">
              {leader?.shortName ?? "—"}
            </p>
          </div>
        </div>
        <div className="rounded-md border border-slate-800/80 bg-slate-900/40 p-2">
          <p className="text-xs text-slate-400">Fase</p>
          <p className="text-sm font-medium text-slate-200">{league.currentPhase}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Link
          href={`/ligas/${league.slug}`}
          className="inline-flex items-center rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:border-cyan-300 hover:text-cyan-200"
        >
          Ver liga
        </Link>
      </CardFooter>
    </Card>
  );
}
