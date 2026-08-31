import { AppShowcase } from '@/components/home/app-showcase';
import { CommunityDiscovery } from '@/components/home/community-discovery';
import { EditorialGuides } from '@/components/home/editorial-guides';
import { FinalCTA } from '@/components/home/final-cta';
import { HomeHero } from '@/components/home/home-hero';
import { MilitaryUpdates } from '@/components/home/military-updates';
import { SponsoredPlacement } from '@/components/home/sponsored-placement';
import { ToolsGrid } from '@/components/home/tools-grid';
import { UnitDiscovery } from '@/components/home/unit-discovery';

export default function HomePage() {
  return (
    <main id="ana-icerik">
      <HomeHero />
      <UnitDiscovery />
      <CommunityDiscovery />
      <ToolsGrid />
      <EditorialGuides />
      <MilitaryUpdates />
      <AppShowcase />
      <SponsoredPlacement />
      <FinalCTA />
    </main>
  );
}
