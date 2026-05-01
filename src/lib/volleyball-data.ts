import "server-only";

import {
  getCbvSuperligaClubs,
  getCbvSuperligaLeague,
  getCbvSuperligaStandings,
} from "@/lib/cbv-superliga";
import { leagues } from "@/data/leagues";
import { standings } from "@/data/standings";
import type {
  Club,
  ClubSeasonStats,
  PlayerCareerEntry,
  PlayerMatchStat,
  PlayerSeasonStats,
} from "@/types/volleyball";

const fallbackBrazilLeague = leagues.find((league) => league.id === "league-superliga-br");
const fallbackBrazilClubs: Club[] = [];
const fallbackBrazilStandings = standings.filter((row) => row.leagueId === "league-superliga-br");

const cbvLeague = await getCbvSuperligaLeague();
const cbvClubs = await getCbvSuperligaClubs();
const cbvStandings = await getCbvSuperligaStandings();

const resolvedBrazilLeague = cbvLeague ?? fallbackBrazilLeague;
const resolvedBrazilClubs = cbvClubs.length ? cbvClubs : fallbackBrazilClubs;
const resolvedBrazilStandings = cbvStandings.length ? cbvStandings : fallbackBrazilStandings;

const leaguesData = resolvedBrazilLeague ? [resolvedBrazilLeague] : [];
const standingsData = resolvedBrazilStandings;
const clubsData = resolvedBrazilClubs;

const clubById = new Map<string, Club>(clubsData.map((club) => [club.id, club]));
const playersData: typeof import("@/data/players").players = [];
const matchesData: typeof import("@/data/matches").matches = [];

export const getLeagues = () => leaguesData;

export const getLeagueBySlug = (slug: string) =>
  leaguesData.find((league) => league.slug === slug);

export const getLeagueById = (id: string) =>
  leaguesData.find((league) => league.id === id);

export const getClubs = () => clubsData;

export const getClubBySlug = (slug: string) =>
  clubsData.find((club) => club.slug === slug);

export const getClubById = (id: string) => clubById.get(id);

export const getClubsByLeagueId = (leagueId: string) =>
  clubsData.filter((club) => club.leagueId === leagueId);

export const getPlayers = () => playersData;

export const getPlayerBySlug = (slug: string) =>
  playersData.find((player) => player.slug === slug);

export const getPlayerById = (id: string) =>
  playersData.find((player) => player.id === id);

export const getPlayersByClubId = (clubId: string) =>
  playersData.filter((player) => player.currentClubId === clubId);

export const getStandingsByLeagueId = (leagueId: string) =>
  standingsData
    .filter((row) => row.leagueId === leagueId)
    .sort((a, b) => a.position - b.position);

export const getMatchesByLeagueId = (leagueId: string) =>
  matchesData
    .filter((match) => match.leagueId === leagueId)
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));

export const getMatchesByClubId = (clubId: string) =>
  matchesData
    .filter((match) => match.homeClubId === clubId || match.awayClubId === clubId)
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));

export const getMatchById = (id: string) => matchesData.find((match) => match.id === id);

export const getRecentMatches = (limit = 8) =>
  [...matchesData]
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
    .slice(0, limit);

export const getClubStats = (clubId: string): ClubSeasonStats | undefined => {
  void clubId;
  return undefined;
};

export const getPlayerStats = (playerId: string): PlayerSeasonStats | undefined => {
  void playerId;
  return undefined;
};

export const getPlayerSeasonStats = (playerId: string): PlayerSeasonStats[] => {
  void playerId;
  return [];
};

export const getPlayerCareer = (playerId: string): PlayerCareerEntry[] => {
  void playerId;
  return [];
};

export const getPlayerRecentMatchStats = (playerId: string): PlayerMatchStat[] => {
  void playerId;
  return [];
};

export const getCurrentStandingByClubId = (clubId: string) =>
  standingsData.find((standing) => standing.clubId === clubId);
