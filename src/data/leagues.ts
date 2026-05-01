import type { League } from "@/types/volleyball";

export const leagues: League[] = [
  {
    id: "league-superliga-br",
    slug: "superliga-feminina-brasil",
    name: "Superliga Feminina Brasil",
    country: "Brasil",
    season: "2025/26",
    description:
      "Principal competição nacional de clubes femininos do Brasil, com alto nível técnico e tradição em playoffs intensos.",
    numberOfTeams: 6,
    currentLeaderClubId: "club-praia-clube",
    currentPhase: "Temporada Regular - 2º turno",
    relegationZoneSpots: 1,
  },
  {
    id: "league-serie-a1-it",
    slug: "liga-italiana-feminina",
    name: "Liga Italiana Feminina",
    country: "Itália",
    season: "2025/26",
    description:
      "Liga nacional italiana com forte presença internacional e equilíbrio entre os clubes do topo da classificação.",
    numberOfTeams: 6,
    currentLeaderClubId: "club-conegliano",
    currentPhase: "Temporada Regular - 18ª rodada",
    relegationZoneSpots: 1,
  },
  {
    id: "league-sultanlar-tr",
    slug: "liga-turca-feminina",
    name: "Liga Turca Feminina",
    country: "Turquia",
    season: "2025/26",
    description:
      "Competição turca de elite marcada por jogos de alto volume ofensivo e clubes com elencos estrelados.",
    numberOfTeams: 6,
    currentLeaderClubId: "club-vakifbank",
    currentPhase: "Temporada Regular - 16ª rodada",
    relegationZoneSpots: 1,
  },
];
