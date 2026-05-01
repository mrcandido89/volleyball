import { load } from "cheerio";

import type { Club, League, StandingRow } from "@/types/volleyball";

const CBV_SUPERLIGA_URL =
  process.env.CBV_SUPERLIGA_URL ?? "https://cbv.com.br/volei-de-quadra/superliga-a-feminina";
const LEAGUE_ID = "league-superliga-br";
const LEAGUE_SLUG = "superliga-feminina-brasil";
const DEFAULT_TIMEOUT_MS = Number(process.env.CBV_SUPERLIGA_FETCH_TIMEOUT_MS ?? "10000");

const legacySlugToClubId: Record<string, string> = {
  "dentil-praia-clube": "club-praia-clube",
  "gerdau-minas": "club-minas",
  "osasco-sao-cristovao-saude": "club-osasco",
  "sesc-rj-flamengo": "club-sesc-flamengo",
  fluminense: "club-fluminense",
  "paulistano-barueri": "club-barueri",
};

type ParsedClub = {
  cbvClubId: string;
  clubSlug: string;
  pageUrl: string;
  name: string;
  logoUrl?: string;
};

export type CbvSuperligaSnapshot = {
  league: League;
  clubs: Club[];
  standings: StandingRow[];
  sourceUrl: string;
  scrapedAt: string;
};

let cachedSnapshot: CbvSuperligaSnapshot | null | undefined;

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeNameKey = (value: string) =>
  normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();

const parseIntLoose = (value: string | null | undefined) => {
  const normalized = normalizeText(value).replace(/[^\d-]/g, "");
  if (!normalized) return null;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseFloatLoose = (value: string | null | undefined) => {
  let normalized = normalizeText(value).replace(/\s+/g, "");
  if (!normalized) return null;

  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    if (normalized.lastIndexOf(",") > normalized.lastIndexOf(".")) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (hasComma) {
    normalized = normalized.replace(",", ".");
  }

  normalized = normalized.replace(/[^\d.-]/g, "");
  if (!normalized) return null;

  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

const detectSeason = (values: string[]) => {
  const combined = values.join(" ");
  const match = combined.match(/\b(\d{2}\/\d{2})\b/);
  return match ? match[1] : "25/26";
};

const getClubId = (cbvClubId: string, clubSlug: string) =>
  legacySlugToClubId[clubSlug] ?? `club-cbv-${cbvClubId}`;

const getClubShortName = (name: string) => {
  const normalized = normalizeText(name);
  if (!normalized) return "Clube";
  const words = normalized.split(" ").filter(Boolean);
  return words.length > 1 ? words.slice(0, 2).join(" ") : normalized;
};

export const fetchCbvSuperligaSnapshot = async (): Promise<CbvSuperligaSnapshot | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(CBV_SUPERLIGA_URL, {
      signal: controller.signal,
      next: { revalidate: 600 },
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; VolleyStatsBot/1.0)",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const $ = load(html);

    const headingValues = $("h1, h2")
      .toArray()
      .map((el) => normalizeText($(el).text()))
      .filter(Boolean);
    const season = detectSeason(headingValues);
    const description =
      normalizeText($('meta[name="description"]').attr("content")) ||
      "Principal competição nacional de clubes femininos do Brasil.";

    const parsedClubsByCbvId = new Map<string, ParsedClub>();
    const parsedClubsByNameKey = new Map<string, ParsedClub>();

    const clubAnchors = $('a[href*="/volei-de-quadra/superliga-a-feminina/clubes/"]');
    clubAnchors.each((_, anchor) => {
      const href = $(anchor).attr("href");
      if (!href) return;

      const url = new URL(href, CBV_SUPERLIGA_URL).toString();
      const match = url.match(/\/clubes\/(\d+)\/([^/?#]+)/i);
      if (!match) return;

      const [, cbvClubId, clubSlug] = match;
      const linkText = normalizeText($(anchor).text());
      const imageUrl =
        $(anchor).find("img").attr("src") ||
        $(anchor).closest("figure").find("img").attr("src") ||
        undefined;
      const logoUrl = imageUrl ? new URL(imageUrl, CBV_SUPERLIGA_URL).toString() : undefined;

      const previous = parsedClubsByCbvId.get(cbvClubId);
      const nextClub: ParsedClub = {
        cbvClubId,
        clubSlug,
        pageUrl: url,
        name: linkText || previous?.name || clubSlug.replace(/-/g, " "),
        logoUrl: previous?.logoUrl ?? logoUrl,
      };

      parsedClubsByCbvId.set(cbvClubId, nextClub);
      parsedClubsByNameKey.set(normalizeNameKey(nextClub.name), nextClub);
    });

    const standingsTable = $("table")
      .toArray()
      .find((table) => {
        const headers = $(table)
          .find("th")
          .toArray()
          .map((th) => normalizeText($(th).text()).toLowerCase());
        return headers.includes("pos") && headers.includes("clube") && headers.includes("pts");
      });

    if (!standingsTable) {
      return null;
    }

    const headers = $(standingsTable)
      .find("th")
      .toArray()
      .map((th) => normalizeText($(th).text()));
    const headerIndex = Object.fromEntries(
      headers.map((header, index) => [header.toLowerCase(), index]),
    );

    const standingsRows: StandingRow[] = [];

    $(standingsTable)
      .find("tbody tr")
      .each((_, row) => {
        const cells = $(row).find("td").toArray();
        if (cells.length < 2) return;

        const values = cells.map((cell) => normalizeText($(cell).text()));
        const clubName = values[headerIndex.clube ?? 1];
        if (!clubName) return;

        const clubAnchor = $(cells[headerIndex.clube ?? 1]).find("a").attr("href");
        const clubMatch = clubAnchor?.match(/\/clubes\/(\d+)\/([^/?#]+)/i);
        let cbvClubId = clubMatch?.[1] ?? null;
        let clubSlug = clubMatch?.[2] ?? null;

        if (!cbvClubId) {
          const parsedClub = parsedClubsByNameKey.get(normalizeNameKey(clubName));
          if (parsedClub) {
            cbvClubId = parsedClub.cbvClubId;
            clubSlug = parsedClub.clubSlug;
          }
        }

        if (!cbvClubId || !clubSlug) return;

        const existingClub = parsedClubsByCbvId.get(cbvClubId);
        if (existingClub) {
          existingClub.name = clubName.length >= existingClub.name.length ? clubName : existingClub.name;
        } else {
          parsedClubsByCbvId.set(cbvClubId, {
            cbvClubId,
            clubSlug,
            pageUrl: new URL(
              `/volei-de-quadra/superliga-a-feminina/clubes/${cbvClubId}/${clubSlug}`,
              CBV_SUPERLIGA_URL,
            ).toString(),
            name: clubName,
          });
        }

        standingsRows.push({
          leagueId: LEAGUE_ID,
          clubId: getClubId(cbvClubId, clubSlug),
          position: parseIntLoose(values[headerIndex.pos ?? 0]) ?? 0,
          matchesPlayed: parseIntLoose(values[headerIndex.j ?? 3]) ?? 0,
          wins: parseIntLoose(values[headerIndex.v ?? 4]) ?? 0,
          losses: parseIntLoose(values[headerIndex.d ?? 5]) ?? 0,
          points: parseIntLoose(values[headerIndex.pts ?? 2]) ?? 0,
          setsWon: 0,
          setsLost: 0,
          setRatio: parseFloatLoose(values[headerIndex.ms ?? 6]) ?? 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointDifference: 0,
          lastFive: [],
        });
      });

    const clubs: Club[] = [...parsedClubsByCbvId.values()]
      .map((club) => ({
        id: getClubId(club.cbvClubId, club.clubSlug),
        slug: club.clubSlug,
        name: club.name,
        shortName: getClubShortName(club.name),
        country: "Brasil",
        city: "Brasil",
        leagueId: LEAGUE_ID,
        arena: "Não informado",
        coach: "Não informado",
        logoUrl: club.logoUrl,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    const leaderClubId = standingsRows.find((row) => row.position === 1)?.clubId ?? clubs[0]?.id;
    if (!leaderClubId || !clubs.length) {
      return null;
    }

    const league: League = {
      id: LEAGUE_ID,
      slug: LEAGUE_SLUG,
      name: "Superliga A Feminina",
      country: "Brasil",
      season,
      description,
      numberOfTeams: clubs.length,
      currentLeaderClubId: leaderClubId,
      currentPhase: "Temporada regular",
      relegationZoneSpots: 2,
    };

    const sortedStandings = standingsRows
      .filter((row) => row.position > 0)
      .sort((a, b) => a.position - b.position);

    return {
      league,
      clubs,
      standings: sortedStandings,
      sourceUrl: CBV_SUPERLIGA_URL,
      scrapedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

const getSnapshot = async () => {
  if (cachedSnapshot !== undefined) {
    return cachedSnapshot;
  }

  cachedSnapshot = await fetchCbvSuperligaSnapshot();
  return cachedSnapshot;
};

export const getCbvSuperligaLeague = async () => {
  const snapshot = await getSnapshot();
  return snapshot?.league ?? null;
};

export const getCbvSuperligaClubs = async () => {
  const snapshot = await getSnapshot();
  return snapshot?.clubs ?? [];
};

export const getCbvSuperligaStandings = async () => {
  const snapshot = await getSnapshot();
  return snapshot?.standings ?? [];
};
