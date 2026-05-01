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
