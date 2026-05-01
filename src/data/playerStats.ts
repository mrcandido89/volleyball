import { players } from "@/data/players";
import type { PlayerSeasonStats } from "@/types/volleyball";

const leagueIdByClubId: Record<string, string> = {
  "club-praia-clube": "league-superliga-br",
  "club-minas": "league-superliga-br",
  "club-osasco": "league-superliga-br",
  "club-sesc-flamengo": "league-superliga-br",
  "club-fluminense": "league-superliga-br",
  "club-barueri": "league-superliga-br",
  "club-conegliano": "league-serie-a1-it",
  "club-milano": "league-serie-a1-it",
  "club-scandicci": "league-serie-a1-it",
  "club-novara": "league-serie-a1-it",
  "club-busto-arsizio": "league-serie-a1-it",
  "club-chieri": "league-serie-a1-it",
  "club-vakifbank": "league-sultanlar-tr",
  "club-eczacibasi": "league-sultanlar-tr",
  "club-fenerbahce": "league-sultanlar-tr",
  "club-galatasaray": "league-sultanlar-tr",
  "club-thy": "league-sultanlar-tr",
  "club-nilufer": "league-sultanlar-tr",
};

export const playerSeasonStats: PlayerSeasonStats[] = players.map((player, index) => {
  const matches = 18 + (index % 7);
  const setsPlayed = matches * 3 + (index % 9);
  const attackPoints = 120 + ((index * 17) % 220);
  const blockPoints = 15 + ((index * 5) % 55);
  const servePoints = 8 + ((index * 3) % 36);
  const totalPoints = attackPoints + blockPoints + servePoints;

  return {
    playerId: player.id,
    season: "2025/26",
    clubId: player.currentClubId,
    leagueId: leagueIdByClubId[player.currentClubId] ?? "league-superliga-br",
    matches,
    setsPlayed,
    totalPoints,
    pointsPerMatch: Number((totalPoints / matches).toFixed(2)),
    attackPoints,
    blockPoints,
    servePoints,
    aces: servePoints,
    attackEfficiencyPercentage: Number((31 + (index % 19) * 1.4).toFixed(1)),
    positiveReceptionPercentage:
      player.position === "Líbero" || player.position === "Ponteira"
        ? Number((53 + (index % 22) * 1.3).toFixed(1))
        : undefined,
  };
});

export const playerMatchStats = players.flatMap((player, index) => {
  const leaguePrefix = player.currentClubId.includes("club-")
    ? player.currentClubId.includes("conegliano") ||
      player.currentClubId.includes("milano") ||
      player.currentClubId.includes("scandicci") ||
      player.currentClubId.includes("novara") ||
      player.currentClubId.includes("busto") ||
      player.currentClubId.includes("chieri")
      ? "it"
      : player.currentClubId.includes("vakifbank") ||
          player.currentClubId.includes("eczacibasi") ||
          player.currentClubId.includes("fenerbahce") ||
          player.currentClubId.includes("galatasaray") ||
          player.currentClubId.includes("thy") ||
          player.currentClubId.includes("nilufer")
        ? "tr"
        : "br"
    : "br";

  return Array.from({ length: 5 }).map((_, offset) => ({
    playerId: player.id,
    matchId: `match-${leaguePrefix}-0${offset + 1}`,
    points: 8 + ((index * 3 + offset * 4) % 22),
    aces: (index + offset) % 5,
    blocks: (index * 2 + offset) % 4,
  }));
});
