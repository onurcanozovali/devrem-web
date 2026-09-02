import { AppShowcase } from '@/components/home/app-showcase';
import { BedelliTeaser } from '@/components/home/bedelli-teaser';
import { CommunityDiscovery } from '@/components/home/community-discovery';
import { CookieNotice } from '@/components/home/cookie-notice';
import { EditorialGuides } from '@/components/home/editorial-guides';
import { FinalCTA } from '@/components/home/final-cta';
import { HomeHero } from '@/components/home/home-hero';

export default function HomePage() {
  return (
    <main id="ana-icerik">
      <HomeHero />
      <CommunityDiscovery />
      <BedelliTeaser />
      <EditorialGuides />
      <AppShowcase />
      <FinalCTA />
      <CookieNotice />
    </main>
  );
}
