export type VolleyballPosition =
  | "Levantadora"
  | "Oposta"
  | "Ponteira"
  | "Central"
  | "Líbero";

export type MatchStatus = "Finalizado" | "Agendado" | "Ao vivo";

export type League = {
  id: string;
  slug: string;
  name: string;
  country: string;
  season: string;
  logoUrl?: string;
  description: string;
  numberOfTeams: number;
  currentLeaderClubId: string;
  currentPhase: string;
  relegationZoneSpots?: number;
};

export type Club = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  country: string;
  city: string;
  leagueId: string;
  arena: string;
  coach: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

export type Player = {
  id: string;
  slug: string;
  name: string;
  nationality: string;
  birthDate?: string;
  age: number;
  heightCm: number;
  position: VolleyballPosition;
  dominantHand: "Direita" | "Esquerda";
  shirtNumber: number;
  currentClubId: string;
  photoUrl?: string;
};

export type StandingRow = {
  leagueId: string;
  clubId: string;
  position: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  setsWon: number;
  setsLost: number;
  setRatio: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifference: number;
  lastFive: Array<"W" | "L">;
};

export type Match = {
  id: string;
  leagueId: string;
  season: string;
  round: string;
  date: string;
  homeClubId: string;
  awayClubId: string;
  homeSets: number;
  awaySets: number;
  setScores: {
    home: number;
    away: number;
  }[];
  status: MatchStatus;
};

export type ClubSeasonStats = {
  clubId: string;
  season: string;
  matches: number;
  wins: number;
  losses: number;
  points: number;
  setsWon: number;
  setsLost: number;
  attackPoints: number;
  blockPoints: number;
  servePoints: number;
  aces: number;
  serveErrors: number;
  positiveReceptionPercentage: number;
  perfectReceptionPercentage: number;
  attackEfficiencyPercentage: number;
};

export type PlayerSeasonStats = {
  playerId: string;
  season: string;
  clubId: string;
  leagueId: string;
  matches: number;
  setsPlayed: number;
  totalPoints: number;
  pointsPerMatch: number;
  attackPoints: number;
  blockPoints: number;
  servePoints: number;
  aces: number;
  attackEfficiencyPercentage: number;
  positiveReceptionPercentage?: number;
};

export type PlayerCareerEntry = {
  playerId: string;
  season: string;
  clubName: string;
  country: string;
  leagueName: string;
  notes?: string;
};

export type PlayerMatchStat = {
  playerId: string;
  matchId: string;
  points: number;
  aces: number;
  blocks: number;
};
