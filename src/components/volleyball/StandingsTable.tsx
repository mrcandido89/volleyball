import Link from "next/link";

import { getClubById } from "@/lib/volleyball-data";
import { formatPercentage } from "@/lib/utils";
import type { StandingRow } from "@/types/volleyball";

import { Badge } from "../ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";

type StandingsTableProps = {
  rows: StandingRow[];
  relegationSpots?: number;
};

const getZoneClass = (position: number, total: number, relegationSpots = 0) => {
  if (position <= 4) return "bg-emerald-500/10";
  if (position > total - relegationSpots) return "bg-rose-500/10";
  return "";
};

export const getStandingCategory = (position: number, total: number, relegationSpots = 1) => {
  if (position <= 4) return "playoff";
  if (position > total - relegationSpots) return "relegation";
  return "mid";
};

export function StandingsTable({ rows, relegationSpots = 1 }: StandingsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
        <Badge variant="playoff">Playoffs</Badge>
        <Badge variant="neutral">Meio da tabela</Badge>
        <Badge variant="danger">Zona inferior</Badge>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pos</TableHead>
              <TableHead>Clube</TableHead>
              <TableHead>J</TableHead>
              <TableHead>V</TableHead>
              <TableHead>D</TableHead>
              <TableHead>Pts</TableHead>
              <TableHead>SV</TableHead>
              <TableHead>SP</TableHead>
              <TableHead>Saldo S</TableHead>
              <TableHead>P+</TableHead>
              <TableHead>P-</TableHead>
              <TableHead>Saldo P</TableHead>
              <TableHead>Últimos 5</TableHead>
              <TableHead>Aproveitamento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const club = getClubById(row.clubId);
              const percentage = row.matchesPlayed
                ? (row.wins / row.matchesPlayed) * 100
                : 0;

              return (
                <TableRow
                  key={row.clubId}
                  className={getZoneClass(row.position, rows.length, relegationSpots)}
                >
                  <TableCell className="font-semibold">{row.position}</TableCell>
                  <TableCell>
                    {club ? (
                      <Link
                        className="font-medium text-slate-100 hover:text-cyan-300"
                        href={`/clubes/${club.slug}`}
                      >
                        {club.shortName}
                      </Link>
                    ) : (
                      row.clubId
                    )}
                  </TableCell>
                  <TableCell>{row.matchesPlayed}</TableCell>
                  <TableCell>{row.wins}</TableCell>
                  <TableCell>{row.losses}</TableCell>
                  <TableCell className="font-semibold text-cyan-300">{row.points}</TableCell>
                  <TableCell>{row.setsWon}</TableCell>
                  <TableCell>{row.setsLost}</TableCell>
                  <TableCell>{row.setRatio.toFixed(2)}</TableCell>
                  <TableCell>{row.pointsFor}</TableCell>
                  <TableCell>{row.pointsAgainst}</TableCell>
                  <TableCell
                    className={row.pointDifference >= 0 ? "text-emerald-300" : "text-rose-300"}
                  >
                    {row.pointDifference >= 0 ? `+${row.pointDifference}` : row.pointDifference}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {row.lastFive.map((result, index) => (
                        <span
                          key={`${row.clubId}-${index}-${result}`}
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                            result === "W"
                              ? "bg-emerald-500/25 text-emerald-200"
                              : "bg-rose-500/25 text-rose-200"
                          }`}
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatPercentage(percentage)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
