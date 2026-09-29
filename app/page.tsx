import type { Metadata } from 'next';
import { CookieNotice } from '@/components/home/cookie-notice';
import { HomeHero } from '@/components/home/home-hero';
import { HomePlatformSections } from '@/components/home/platform-sections';
import { JsonLd } from '@/components/seo/json-ld';
import { listPublishedBlogPosts } from '@/lib/blog/repository';
import { listIndexableMilitaryUnits } from '@/lib/military-units';
import { graphSchema, organizationSchema, websiteSchema } from '@/lib/seo/structured-data';
import { createPageMetadata, seoConfig } from '@/src/config/seo';

export const dynamic = 'force-dynamic';

const homeMetadata = createPageMetadata({
  title: seoConfig.defaultTitle,
  description: seoConfig.defaultDescription,
  path: '/',
});

export const metadata: Metadata = {
  ...homeMetadata,
  title: { absolute: seoConfig.defaultTitle },
};

export default async function HomePage() {
  const [posts, units] = await Promise.all([
    listPublishedBlogPosts().catch(() => []),
    listIndexableMilitaryUnits().catch(() => []),
  ]);

  return (
    <main id="ana-icerik">
      <JsonLd data={graphSchema(organizationSchema(), websiteSchema())} />
      <HomeHero />
      <HomePlatformSections posts={posts} units={units} />
      <CookieNotice />
    </main>
  );
}
