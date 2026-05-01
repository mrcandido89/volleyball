#!/usr/bin/env node

import dotenv from "dotenv";
import puppeteer from "puppeteer";
import pg from "pg";

dotenv.config();

const { Client } = pg;

const DEFAULT_CBV_URL = "https://cbv.com.br/volei-de-quadra/superliga-a-feminina";
const COMPETITION_SLUG = "superliga-a-feminina";
const DEFAULT_TIMEOUT_MS = Number(process.env.CBV_PUPPETEER_TIMEOUT_MS ?? "120000");

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseIntLoose(value) {
  const normalized = normalizeText(value).replace(/[^\d-]/g, "");
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseFloatLoose(value) {
  let normalized = normalizeText(value).replace(/\s+/g, "");
  if (!normalized) {
    return null;
  }

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

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

function detectSeason(values) {
  const haystack = values.join(" ");
  const match = haystack.match(/\b(\d{2}\/\d{2})\b/);
  return match ? match[1] : null;
}

async function scrapePage(url, headlessMode) {
  const browser = await puppeteer.launch({
    headless: headlessMode,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: DEFAULT_TIMEOUT_MS });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return await page.evaluate(
      ({ pageUrl }) => {
        const normalize = (value) =>
          String(value ?? "")
            .replace(/\s+/g, " ")
            .trim();

        const toAbsoluteUrl = (href) => {
          if (!href) {
            return null;
          }

          try {
            return new URL(href, pageUrl).toString();
          } catch {
            return null;
          }
        };

        const toKey = (value) => normalize(value).toLowerCase();
        const toNameKey = (value) =>
          normalize(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/gi, " ")
            .trim()
            .toLowerCase();

        const h1 = [...document.querySelectorAll("h1")]
          .map((el) => normalize(el.textContent))
          .filter(Boolean);
        const h2 = [...document.querySelectorAll("h2")]
          .map((el) => normalize(el.textContent))
          .filter(Boolean);

        const clubMap = new Map();
        const clubLinks = [
          ...document.querySelectorAll('a[href*="/volei-de-quadra/superliga-a-feminina/clubes/"]'),
        ];

        for (const link of clubLinks) {
          const href = link.getAttribute("href");
          if (!href) {
            continue;
          }

          const match = href.match(/\/clubes\/(\d+)\/([^/?#]+)/i);
          if (!match) {
            continue;
          }

          const [, clubId, clubSlug] = match;
          const candidateName = normalize(link.textContent) || normalize(link.getAttribute("aria-label"));
          const image =
            link.querySelector("img") ||
            link.parentElement?.querySelector("img") ||
            link.closest("figure")?.querySelector("img");

          const logoUrl = image
            ? image.getAttribute("src") || image.getAttribute("data-src") || image.getAttribute("srcset")
            : null;

          const previous = clubMap.get(clubId);
          if (!previous) {
            clubMap.set(clubId, {
              cbvClubId: clubId,
              clubSlug,
              name: candidateName || clubSlug.replace(/-/g, " "),
              pageUrl: toAbsoluteUrl(href),
              logoUrl: toAbsoluteUrl(logoUrl),
            });
            continue;
          }

          const bestName =
            candidateName.length > previous.name.length ? candidateName : previous.name;
          if (bestName !== previous.name) {
            previous.name = bestName;
          }
          if (!previous.logoUrl && logoUrl) {
            previous.logoUrl = toAbsoluteUrl(logoUrl);
          }
          if (!previous.pageUrl && href) {
            previous.pageUrl = toAbsoluteUrl(href);
          }
        }

        const clubNameIndex = new Map();
        for (const club of clubMap.values()) {
          const nameKey = toNameKey(club.name);
          if (nameKey && !clubNameIndex.has(nameKey)) {
            clubNameIndex.set(nameKey, club);
          }
          const slugKey = toNameKey(club.clubSlug.replace(/-/g, " "));
          if (slugKey && !clubNameIndex.has(slugKey)) {
            clubNameIndex.set(slugKey, club);
          }
        }

        const tables = [...document.querySelectorAll("table")];
        const standingsTable = tables.find((table) => {
          const headerKeys = [...table.querySelectorAll("th")].map((th) =>
            toKey(th.textContent)
          );
          return (
            headerKeys.includes("pos") &&
            headerKeys.includes("clube") &&
            headerKeys.includes("pts")
          );
        });

        const standings = [];
        if (standingsTable) {
          const headers = [...standingsTable.querySelectorAll("th")].map((th) =>
            normalize(th.textContent)
          );
          const rows = [...standingsTable.querySelectorAll("tbody tr")];
          const headerIndex = Object.fromEntries(headers.map((label, index) => [toKey(label), index]));

          for (const row of rows) {
            const cells = [...row.querySelectorAll("td")];
            if (cells.length < 2) {
              continue;
            }

            const rowValues = cells.map((cell) => normalize(cell.textContent));
            const clubCell = cells[headerIndex.clube ?? 1];
            const clubAnchor = clubCell?.querySelector('a[href*="/clubes/"]');
            const clubMatch = clubAnchor?.getAttribute("href")?.match(/\/clubes\/(\d+)\//i);
            const clubName = rowValues[headerIndex.clube ?? 1] ?? null;
            const clubNameKey = toNameKey(clubName);
            const indexedClub = clubNameKey ? clubNameIndex.get(clubNameKey) : null;
            let mappedClubId = clubMatch ? clubMatch[1] : indexedClub?.cbvClubId ?? null;
            if (!mappedClubId && clubNameKey) {
              for (const [key, club] of clubNameIndex.entries()) {
                if (key.includes(clubNameKey) || clubNameKey.includes(key)) {
                  mappedClubId = club.cbvClubId;
                  break;
                }
              }
            }

            const raw = {};
            for (const [index, label] of headers.entries()) {
              raw[label || `col_${index}`] = rowValues[index] ?? null;
            }

            standings.push({
              positionText: rowValues[headerIndex.pos ?? 0] ?? null,
              clubName,
              pointsText: rowValues[headerIndex.pts ?? 2] ?? null,
              matchesPlayedText: rowValues[headerIndex.j ?? 3] ?? null,
              winsText: rowValues[headerIndex.v ?? 4] ?? null,
              lossesText: rowValues[headerIndex.d ?? 5] ?? null,
              msText: rowValues[headerIndex.ms ?? 6] ?? null,
              mpText: rowValues[headerIndex.mp ?? 7] ?? null,
              cbvClubId: mappedClubId,
              raw,
            });
          }
        }

        const newsMap = new Map();
        const newsAnchors = [...document.querySelectorAll('a[href*="/noticias/"]')];
        for (const anchor of newsAnchors) {
          const href = anchor.getAttribute("href");
          const absoluteUrl = toAbsoluteUrl(href);
          if (!absoluteUrl) {
            continue;
          }

          const title = normalize(anchor.textContent);
          if (!title) {
            continue;
          }

          const dateMatch = absoluteUrl.match(/\/(\d{4}-\d{2}-\d{2})\//);
          newsMap.set(absoluteUrl, {
            url: absoluteUrl,
            title,
            publishedOn: dateMatch ? dateMatch[1] : null,
          });
        }

        const videoMap = new Map();
        const videoAnchors = [
          ...document.querySelectorAll('a[href*="youtube.com/watch"]'),
          ...document.querySelectorAll('a[href*="youtu.be/"]'),
          ...document.querySelectorAll('a[href*="links.vb.tv"]'),
        ];
        for (const anchor of videoAnchors) {
          const href = anchor.getAttribute("href");
          const absoluteUrl = toAbsoluteUrl(href);
          if (!absoluteUrl) {
            continue;
          }

          const title = normalize(anchor.textContent) || absoluteUrl;
          const platform = absoluteUrl.includes("youtube") ? "youtube" : "vb.tv";
          videoMap.set(absoluteUrl, { url: absoluteUrl, title, platform });
        }

        return {
          sourceUrl: pageUrl,
          scrapedAt: new Date().toISOString(),
          title: normalize(document.title),
          metaDescription: normalize(
            document.querySelector('meta[name="description"]')?.getAttribute("content")
          ),
          h1,
          h2,
          clubs: [...clubMap.values()],
          standings,
          news: [...newsMap.values()],
          videos: [...videoMap.values()],
        };
      },
      { pageUrl: url }
    );
  } finally {
    await browser.close();
  }
}

async function ensureSchema(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS cbv_competitions (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      season TEXT,
      source_url TEXT NOT NULL,
      summary TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cbv_clubs (
      competition_slug TEXT NOT NULL REFERENCES cbv_competitions(slug) ON DELETE CASCADE,
      cbv_club_id TEXT NOT NULL,
      club_slug TEXT,
      name TEXT NOT NULL,
      page_url TEXT NOT NULL,
      logo_url TEXT,
      raw JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (competition_slug, cbv_club_id)
    );

    CREATE TABLE IF NOT EXISTS cbv_standings_snapshots (
      id BIGSERIAL PRIMARY KEY,
      competition_slug TEXT NOT NULL REFERENCES cbv_competitions(slug) ON DELETE CASCADE,
      source_url TEXT NOT NULL,
      scraped_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cbv_standing_rows (
      snapshot_id BIGINT NOT NULL REFERENCES cbv_standings_snapshots(id) ON DELETE CASCADE,
      position INT NOT NULL,
      cbv_club_id TEXT,
      club_name TEXT NOT NULL,
      points INT,
      matches_played INT,
      wins INT,
      losses INT,
      metric_ms NUMERIC(8, 3),
      metric_mp NUMERIC(8, 3),
      raw JSONB NOT NULL DEFAULT '{}'::jsonb,
      PRIMARY KEY (snapshot_id, position)
    );

    CREATE TABLE IF NOT EXISTS cbv_news_items (
      news_url TEXT PRIMARY KEY,
      competition_slug TEXT NOT NULL REFERENCES cbv_competitions(slug) ON DELETE CASCADE,
      title TEXT NOT NULL,
      published_on DATE,
      raw JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cbv_video_items (
      video_url TEXT PRIMARY KEY,
      competition_slug TEXT NOT NULL REFERENCES cbv_competitions(slug) ON DELETE CASCADE,
      title TEXT NOT NULL,
      platform TEXT NOT NULL,
      raw JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cbv_superliga_raw_snapshots (
      id BIGSERIAL PRIMARY KEY,
      competition_slug TEXT NOT NULL REFERENCES cbv_competitions(slug) ON DELETE CASCADE,
      scraped_at TIMESTAMPTZ NOT NULL,
      payload JSONB NOT NULL
    );
  `);
}

async function ingestSnapshot(snapshot) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL não definido. Configure antes de rodar a ingestão.");
  }

  const combinedHeadings = [...snapshot.h1, ...snapshot.h2];
  const season = detectSeason(combinedHeadings);
  const competitionName = "Superliga A Feminina";

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query("BEGIN");
    await ensureSchema(client);

    await client.query(
      `
        INSERT INTO cbv_competitions (
          slug,
          name,
          season,
          source_url,
          summary,
          metadata,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())
        ON CONFLICT (slug)
        DO UPDATE SET
          name = EXCLUDED.name,
          season = EXCLUDED.season,
          source_url = EXCLUDED.source_url,
          summary = EXCLUDED.summary,
          metadata = EXCLUDED.metadata,
          updated_at = NOW();
      `,
      [
        COMPETITION_SLUG,
        competitionName,
        season,
        snapshot.sourceUrl,
        snapshot.metaDescription || null,
        JSON.stringify({
          pageTitle: snapshot.title,
          headings: combinedHeadings.slice(0, 12),
        }),
      ]
    );

    for (const club of snapshot.clubs) {
      await client.query(
        `
          INSERT INTO cbv_clubs (
            competition_slug,
            cbv_club_id,
            club_slug,
            name,
            page_url,
            logo_url,
            raw,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
          ON CONFLICT (competition_slug, cbv_club_id)
          DO UPDATE SET
            club_slug = EXCLUDED.club_slug,
            name = EXCLUDED.name,
            page_url = EXCLUDED.page_url,
            logo_url = EXCLUDED.logo_url,
            raw = EXCLUDED.raw,
            updated_at = NOW();
        `,
        [
          COMPETITION_SLUG,
          club.cbvClubId,
          club.clubSlug || null,
          normalizeText(club.name),
          club.pageUrl,
          club.logoUrl || null,
          JSON.stringify(club),
        ]
      );
    }

    const snapshotInsert = await client.query(
      `
        INSERT INTO cbv_standings_snapshots (
          competition_slug,
          source_url,
          scraped_at
        )
        VALUES ($1, $2, $3::timestamptz)
        RETURNING id;
      `,
      [COMPETITION_SLUG, snapshot.sourceUrl, snapshot.scrapedAt]
    );

    const standingsSnapshotId = snapshotInsert.rows[0].id;

    for (const row of snapshot.standings) {
      const position = parseIntLoose(row.positionText);
      if (!position) {
        continue;
      }

      await client.query(
        `
          INSERT INTO cbv_standing_rows (
            snapshot_id,
            position,
            cbv_club_id,
            club_name,
            points,
            matches_played,
            wins,
            losses,
            metric_ms,
            metric_mp,
            raw
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb);
        `,
        [
          standingsSnapshotId,
          position,
          row.cbvClubId,
          normalizeText(row.clubName),
          parseIntLoose(row.pointsText),
          parseIntLoose(row.matchesPlayedText),
          parseIntLoose(row.winsText),
          parseIntLoose(row.lossesText),
          parseFloatLoose(row.msText),
          parseFloatLoose(row.mpText),
          JSON.stringify(row.raw),
        ]
      );
    }

    for (const item of snapshot.news) {
      await client.query(
        `
          INSERT INTO cbv_news_items (
            news_url,
            competition_slug,
            title,
            published_on,
            raw,
            updated_at
          )
          VALUES ($1, $2, $3, $4::date, $5::jsonb, NOW())
          ON CONFLICT (news_url)
          DO UPDATE SET
            title = EXCLUDED.title,
            published_on = EXCLUDED.published_on,
            raw = EXCLUDED.raw,
            updated_at = NOW();
        `,
        [
          item.url,
          COMPETITION_SLUG,
          normalizeText(item.title),
          item.publishedOn,
          JSON.stringify(item),
        ]
      );
    }

    for (const item of snapshot.videos) {
      await client.query(
        `
          INSERT INTO cbv_video_items (
            video_url,
            competition_slug,
            title,
            platform,
            raw,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
          ON CONFLICT (video_url)
          DO UPDATE SET
            title = EXCLUDED.title,
            platform = EXCLUDED.platform,
            raw = EXCLUDED.raw,
            updated_at = NOW();
        `,
        [
          item.url,
          COMPETITION_SLUG,
          normalizeText(item.title),
          item.platform,
          JSON.stringify(item),
        ]
      );
    }

    await client.query(
      `
        INSERT INTO cbv_superliga_raw_snapshots (
          competition_slug,
          scraped_at,
          payload
        )
        VALUES ($1, $2::timestamptz, $3::jsonb);
      `,
      [COMPETITION_SLUG, snapshot.scrapedAt, JSON.stringify(snapshot)]
    );

    await client.query("COMMIT");

    return {
      season,
      standingsSnapshotId,
      clubs: snapshot.clubs.length,
      standingsRows: snapshot.standings.length,
      newsItems: snapshot.news.length,
      videos: snapshot.videos.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const pageUrl = process.env.CBV_SUPERLIGA_URL || DEFAULT_CBV_URL;
  const shouldOpenBrowser = process.env.PUPPETEER_HEADLESS !== "false";

  const snapshot = await scrapePage(pageUrl, shouldOpenBrowser);
  if (!snapshot.standings.length) {
    throw new Error("Não foi possível extrair a tabela de classificação.");
  }

  if (dryRun) {
    const preview = {
      sourceUrl: snapshot.sourceUrl,
      scrapedAt: snapshot.scrapedAt,
      title: snapshot.title,
      teams: snapshot.clubs.length,
      standingsRows: snapshot.standings.length,
      newsItems: snapshot.news.length,
      videos: snapshot.videos.length,
      standingsPreview: snapshot.standings.slice(0, 5),
    };

    console.log(JSON.stringify(preview, null, 2));
    return;
  }

  const result = await ingestSnapshot(snapshot);
  console.log(
    JSON.stringify(
      {
        ok: true,
        competition: COMPETITION_SLUG,
        sourceUrl: pageUrl,
        ...result,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("[ingest-cbv-superliga] erro:", error.message);
  process.exit(1);
});
