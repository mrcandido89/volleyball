import type { PlayerSeasonStats } from "@/types/volleyball";

import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { getClubById, getLeagueById } from "@/lib/volleyball-data";
import { formatPercentage } from "@/lib/utils";

type PlayerSeasonStatsTableProps = {
  rows: PlayerSeasonStats[];
};

export function PlayerSeasonStatsTable({ rows }: PlayerSeasonStatsTableProps) {
  if (!rows.length) {
    return (
      <Card>
        <p className="text-sm text-slate-400">Sem estatísticas por temporada para exibir.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Temporada</TableHead>
            <TableHead>Clube</TableHead>
            <TableHead>Liga</TableHead>
            <TableHead className="text-right">J</TableHead>
            <TableHead className="text-right">Sets</TableHead>
            <TableHead className="text-right">Pts</TableHead>
            <TableHead className="text-right">Ataque</TableHead>
            <TableHead className="text-right">Bloqueio</TableHead>
            <TableHead className="text-right">Aces</TableHead>
            <TableHead className="text-right">Ef. Ataque</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const club = getClubById(row.clubId);
            const league = getLeagueById(row.leagueId);

            return (
              <TableRow key={`${row.playerId}-${row.season}`}>
                <TableCell>{row.season}</TableCell>
                <TableCell>{club?.shortName ?? row.clubId}</TableCell>
                <TableCell>{league?.name ?? row.leagueId}</TableCell>
                <TableCell className="text-right">{row.matches}</TableCell>
                <TableCell className="text-right">{row.setsPlayed}</TableCell>
                <TableCell className="text-right font-semibold text-slate-100">{row.totalPoints}</TableCell>
                <TableCell className="text-right">{row.attackPoints}</TableCell>
                <TableCell className="text-right">{row.blockPoints}</TableCell>
                <TableCell className="text-right">{row.aces}</TableCell>
                <TableCell className="text-right">
                  {formatPercentage(row.attackEfficiencyPercentage)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
