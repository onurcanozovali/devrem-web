import { sitemapGroups } from '@/src/config/seo-routes';
import { absoluteUrl } from '@/src/config/seo';
import { escapeXml, xmlResponse } from '@/lib/seo/xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const groups = sitemapGroups
    .map((path) => `<sitemap><loc>${escapeXml(absoluteUrl(path))}</loc></sitemap>`)
    .join('');
  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${groups}</sitemapindex>`,
  );
}
