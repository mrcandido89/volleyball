import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Player, PlayerSeasonStats } from "@/types/volleyball";

type PlayerCardProps = {
  player: Player;
  clubName: string;
  leagueName: string;
  points: number;
  stats?: PlayerSeasonStats;
};

export function PlayerCard({ player, clubName, leagueName, points, stats }: PlayerCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex-row items-center gap-3">
        <Avatar name={player.name} />
        <div className="space-y-1">
          <CardTitle className="text-base">{player.name}</CardTitle>
          <div className="text-xs text-slate-400">
            {clubName} • {player.nationality}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="position">{player.position}</Badge>
          <Badge>{player.heightCm} cm</Badge>
          <Badge>#{player.shirtNumber}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div>
            <p className="text-xs text-slate-500">Idade</p>
            <p>{player.age} anos</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Liga atual</p>
            <p>{leagueName}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div>
            <p className="text-xs text-slate-500">Pontos na temporada</p>
            <p>{points || stats?.totalPoints || "--"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Média por jogo</p>
            <p>{stats?.pointsPerMatch ? `${stats.pointsPerMatch}` : "--"}</p>
          </div>
        </div>
        <Link
          href={`/jogadoras/${player.slug}`}
          className="inline-flex text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
        >
          Ver perfil da jogadora →
        </Link>
      </CardContent>
    </Card>
  );
}
