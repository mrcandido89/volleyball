import { clubs } from "@/data/clubs";
import { clubSeasonStats } from "@/data/clubStats";
import { leagues } from "@/data/leagues";
import { matches } from "@/data/matches";
import { playerCareerEntries } from "@/data/playerCareer";
import { playerMatchStats, playerSeasonStats } from "@/data/playerStats";
import { players } from "@/data/players";
import { standings } from "@/data/standings";

export const getLeagues = () => leagues;

export const getLeagueBySlug = (slug: string) =>
  leagues.find((league) => league.slug === slug);

export const getLeagueById = (id: string) =>
  leagues.find((league) => league.id === id);

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
  standings
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
  standings.find((standing) => standing.clubId === clubId);
