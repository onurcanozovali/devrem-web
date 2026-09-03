import { absoluteUrl } from '@/src/config/seo';

export function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function xmlResponse(body: string) {
  return new Response(body, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}

export function sitemapXml(
  entries: Array<{ path: string; lastModified?: string | null }>,
) {
  const urls = entries
    .map(
      ({ path, lastModified }) =>
        `<url><loc>${escapeXml(absoluteUrl(path))}</loc>${
          lastModified
            ? `<lastmod>${escapeXml(lastModified.slice(0, 10))}</lastmod>`
            : ''
        }</url>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}
