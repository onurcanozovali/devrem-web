import type { Metadata } from 'next';
import { AppShowcase } from '@/components/home/app-showcase';
import { BedelliTeaser } from '@/components/home/bedelli-teaser';
import { CommunityDiscovery } from '@/components/home/community-discovery';
import { CommunityForumTeaser } from '@/components/home/community-forum-teaser';
import { CookieNotice } from '@/components/home/cookie-notice';
import { EditorialGuides } from '@/components/home/editorial-guides';
import { FinalCTA } from '@/components/home/final-cta';
import { HomeHero } from '@/components/home/home-hero';
import { JsonLd } from '@/components/seo/json-ld';
import { graphSchema, organizationSchema, websiteSchema } from '@/lib/seo/structured-data';
import { createPageMetadata, seoConfig } from '@/src/config/seo';

const homeMetadata = createPageMetadata({
  title: seoConfig.defaultTitle,
  description: seoConfig.defaultDescription,
  path: '/',
});

export const metadata: Metadata = {
  ...homeMetadata,
  title: { absolute: seoConfig.defaultTitle },
};

export default function HomePage() {
  return (
    <main id="ana-icerik">
      <JsonLd data={graphSchema(organizationSchema(), websiteSchema())} />
      <HomeHero />
      <CommunityDiscovery />
      <CommunityForumTeaser />
      <BedelliTeaser />
      <EditorialGuides />
      <AppShowcase />
      <FinalCTA />
      <CookieNotice />
    </main>
  );
}
