import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ClubCard } from "@/components/volleyball/ClubCard";
import { getClubs, getCurrentStandingByClubId, getLeagueById } from "@/lib/volleyball-data";

export default function ClubsPage() {
  const clubs = getClubs();

  return (
    <Container className="space-y-8 py-8">
      <PageHeader
        eyebrow="Clubes"
        title="Clubes participantes"
        description="Explore os clubes reais da Superliga A Feminina (CBV) com acesso direto ao perfil completo."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clubs.map((club) => {
          const standing = getCurrentStandingByClubId(club.id);
          const league = getLeagueById(club.leagueId);
          if (!league) return null;

          return <ClubCard key={club.id} club={club} league={league} standing={standing} />;
        })}
      </section>
    </Container>
  );
}
