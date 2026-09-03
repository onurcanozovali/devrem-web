import { sitemapXml, xmlResponse } from '@/lib/seo/xml';
import { toolSitemapEntries } from '@/src/config/seo-routes';

export const dynamic = 'force-dynamic';

export async function GET() {
  return xmlResponse(sitemapXml(toolSitemapEntries));
}
