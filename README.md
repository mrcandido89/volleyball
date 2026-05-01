# VolleyStats Women

Portal de resultados e estatísticas das principais ligas de voleibol feminino de clubes.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Dados mockados em arquivos separados

## Como executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Rotas principais

- `/` - Página inicial
- `/ligas` - Lista de ligas
- `/ligas/[slug]` - Página da liga
- `/clubes` - Lista de clubes
- `/clubes/[slug]` - Página do clube
- `/jogadoras` - Lista de jogadoras
- `/jogadoras/[slug]` - Página da jogadora

## Estrutura de dados (mock -> API)

Os dados estão em `src/data`:

- `leagues.ts`
- `clubs.ts`
- `players.ts`
- `standings.ts`
- `matches.ts`
- `clubStats.ts`
- `playerStats.ts`
- `playerCareer.ts`

Toda leitura passa por funções em `src/lib/volleyball-data.ts`, como:

- `getLeagueBySlug(slug)`
- `getClubBySlug(slug)`
- `getPlayerBySlug(slug)`
- `getClubsByLeagueId(leagueId)`
- `getPlayersByClubId(clubId)`
- `getStandingsByLeagueId(leagueId)`
- `getMatchesByLeagueId(leagueId)`
- `getMatchesByClubId(clubId)`
- `getPlayerStats(playerId)`
- `getClubStats(clubId)`

## Como substituir por API real depois

1. Mantenha a interface pública das funções em `src/lib/volleyball-data.ts`.
2. Troque as implementações que hoje usam arrays locais por chamadas `fetch()` para seu backend.
3. Preserve os tipos em `src/types/volleyball.ts` para garantir compatibilidade dos componentes.
4. Se desejar, adicione cache/revalidação com Next (`revalidate`, `fetch cache`) sem alterar os componentes de UI.

Essa abordagem já prepara a arquitetura para escalar sem reescrever as páginas.

## Scraping + ingestão PostgreSQL (CBV Superliga Feminina)

O projeto inclui um scraper com **Puppeteer** para a página oficial da CBV e ingestão em banco PostgreSQL:

- URL alvo: `https://cbv.com.br/volei-de-quadra/superliga-a-feminina`
- Script: `scripts/ingest-cbv-superliga.mjs`
- Comando: `npm run ingest:cbv:superliga`

### Dados coletados

- Metadados da competição (título da página e headings principais)
- Classificação (posição, clube, pontos, jogos, vitórias, derrotas, métricas MS/MP)
- Clubes listados (com `cbv_club_id`, slug e link da página do clube)
- Notícias em destaque (título e URL)
- Vídeos em destaque (YouTube e VBTV)
- Snapshot bruto em JSON para auditoria

### Configuração de ambiente

Variáveis suportadas pelo script:

- `DATABASE_URL` (obrigatória) — conexão PostgreSQL
- `CBV_SUPERLIGA_URL` (opcional) — padrão da Superliga Feminina
- `PUPPETEER_HEADLESS` (opcional, use `false` para visualizar o browser) — padrão headless
- `CBV_PUPPETEER_TIMEOUT_MS` (opcional) — padrão `120000`

Exemplo de execução:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/volley \
npm run ingest:cbv:superliga
```

O script cria/atualiza automaticamente as tabelas:

- `cbv_competitions`
- `cbv_clubs`
- `cbv_standings_snapshots`
- `cbv_standing_rows`
- `cbv_news_items`
- `cbv_video_items`
- `cbv_superliga_raw_snapshots`
