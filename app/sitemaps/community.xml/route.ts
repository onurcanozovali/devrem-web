import { listCommunitySitemapEntries } from '@/lib/community/repository';
import { sitemapXml, xmlResponse } from '@/lib/seo/xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const entries = await listCommunitySitemapEntries().catch(() => []);
  return xmlResponse(sitemapXml(entries));
}
