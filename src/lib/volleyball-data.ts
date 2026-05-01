import "server-only";

import { clubs } from "@/data/clubs";
import { clubSeasonStats } from "@/data/clubStats";
import { leagues } from "@/data/leagues";
import { matches } from "@/data/matches";
import { playerCareerEntries } from "@/data/playerCareer";
import { playerMatchStats, playerSeasonStats } from "@/data/playerStats";
import { players } from "@/data/players";
import { standings } from "@/data/standings";
import type { League, StandingRow } from "@/types/volleyball";

const API_BASE_URL = process.env.VOLLEY_API_BASE_URL?.replace(/\/$/, "");
const API_TIMEOUT_MS = Number(process.env.VOLLEY_API_TIMEOUT_MS ?? "3500");
const LEAGUES_ENDPOINT = process.env.VOLLEY_API_LEAGUES_ENDPOINT ?? "/leagues";
const STANDINGS_ENDPOINT = process.env.VOLLEY_API_STANDINGS_ENDPOINT ?? "/standings";
const API_ENABLED = Boolean(API_BASE_URL);

const resolveCollection = <T>(payload: unknown): T[] | null => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const envelope = payload as {
    data?: unknown;
    items?: unknown;
    results?: unknown;
  };
  const candidateCollections = [envelope.data, envelope.items, envelope.results];
  const collection = candidateCollections.find(Array.isArray);

  return collection ?? null;
};

const fetchRemoteCollection = async <T>(endpoint: string): Promise<T[] | null> => {
  if (!API_ENABLED || !API_BASE_URL) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const endpointPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${endpointPath}`;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    return resolveCollection<T>(payload);
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

const [remoteLeagues, remoteStandings] = await Promise.all([
  fetchRemoteCollection<League>(LEAGUES_ENDPOINT),
  fetchRemoteCollection<StandingRow>(STANDINGS_ENDPOINT),
]);

const leaguesData = remoteLeagues ?? leagues;
const standingsData = remoteStandings ?? standings;

export const getLeagues = () => leaguesData;

export const getLeagueBySlug = (slug: string) =>
  leaguesData.find((league) => league.slug === slug);

export const getLeagueById = (id: string) =>
  leaguesData.find((league) => league.id === id);

export const getClubs = () => clubs;

export const getClubBySlug = (slug: string) =>
  clubs.find((club) => club.slug === slug);

export const getClubById = (id: string) => clubs.find((club) => club.id === id);

export const getClubsByLeagueId = (leagueId: string) =>
  clubs.filter((club) => club.leagueId === leagueId);

export const getPlayers = () => players;

export const getPlayerBySlug = (slug: string) =>
  players.find((player) => player.slug === slug);

export const getPlayerById = (id: string) =>
  players.find((player) => player.id === id);

export const getPlayersByClubId = (clubId: string) =>
  players.filter((player) => player.currentClubId === clubId);

export const getStandingsByLeagueId = (leagueId: string) =>
  standingsData
    .filter((row) => row.leagueId === leagueId)
    .sort((a, b) => a.position - b.position);

export const getMatchesByLeagueId = (leagueId: string) =>
  matches
    .filter((match) => match.leagueId === leagueId)
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));

export const getMatchesByClubId = (clubId: string) =>
  matches
    .filter((match) => match.homeClubId === clubId || match.awayClubId === clubId)
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));

export const getMatchById = (id: string) => matches.find((match) => match.id === id);

export const getRecentMatches = (limit = 8) =>
  [...matches]
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
    .slice(0, limit);

export const getClubStats = (clubId: string) =>
  clubSeasonStats.find((stats) => stats.clubId === clubId);

export const getPlayerStats = (playerId: string) =>
  playerSeasonStats.find((stats) => stats.playerId === playerId);

export const getPlayerSeasonStats = (playerId: string) =>
  playerSeasonStats.filter((stats) => stats.playerId === playerId);

export const getPlayerCareer = (playerId: string) =>
  playerCareerEntries.filter((entry) => entry.playerId === playerId);

export const getPlayerRecentMatchStats = (playerId: string) =>
  playerMatchStats.filter((entry) => entry.playerId === playerId);

export const getCurrentStandingByClubId = (clubId: string) =>
  standingsData.find((standing) => standing.clubId === clubId);
