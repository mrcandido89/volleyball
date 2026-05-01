import type { PlayerCareerEntry } from "@/types/volleyball";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

type PlayerCareerTableProps = {
  entries: PlayerCareerEntry[];
};

export function PlayerCareerTable({ entries }: PlayerCareerTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Temporada</TableHead>
            <TableHead>Clube</TableHead>
            <TableHead>País</TableHead>
            <TableHead>Liga</TableHead>
            <TableHead>Observações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={`${entry.playerId}-${entry.season}-${entry.clubName}`}>
              <TableCell>{entry.season}</TableCell>
              <TableCell>{entry.clubName}</TableCell>
              <TableCell>{entry.country}</TableCell>
              <TableCell>{entry.leagueName}</TableCell>
              <TableCell>{entry.notes ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
