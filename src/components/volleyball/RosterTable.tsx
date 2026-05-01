import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import type { Player, PlayerSeasonStats } from "@/types/volleyball";

type RosterTableProps = {
  players: Player[];
  statsByPlayerId: Record<string, PlayerSeasonStats | undefined>;
};

export function RosterTable({ players, statsByPlayerId }: RosterTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="text-left text-xs uppercase tracking-wide text-slate-500">
          <TableHead>Jogadora</TableHead>
          <TableHead>Nacionalidade</TableHead>
          <TableHead>Posição</TableHead>
          <TableHead>Idade</TableHead>
          <TableHead>Altura</TableHead>
          <TableHead>Camisa</TableHead>
          <TableHead>Pontos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => {
          const stats = statsByPlayerId[player.id];
          return (
            <TableRow
              key={player.id}
              className="border-b border-slate-900/60"
            >
              <TableCell>
                <Link href={`/jogadoras/${player.slug}`} className="flex items-center gap-3">
                  <Avatar name={player.name} className="h-8 w-8 text-xs" />
                  <div>
                    <div className="font-semibold text-slate-100">{player.name}</div>
                    <div className="text-xs text-slate-500">{player.dominantHand}</div>
                  </div>
                </Link>
              </TableCell>
              <TableCell>{player.nationality}</TableCell>
              <TableCell>
                <Badge variant="position">{player.position}</Badge>
              </TableCell>
              <TableCell>{player.age}</TableCell>
              <TableCell>{player.heightCm} cm</TableCell>
              <TableCell>#{player.shirtNumber}</TableCell>
              <TableCell>{stats?.totalPoints ?? "-"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
