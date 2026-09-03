import { listPublishedBlogPosts } from '@/lib/blog/repository';
import { escapeXml, xmlResponse } from '@/lib/seo/xml';
import { absoluteUrl, seoConfig } from '@/src/config/seo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const posts = (await listPublishedBlogPosts()).filter((post) => !post.noindex);
  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      return `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(
        url,
      )}</link><guid isPermaLink="true">${escapeXml(url)}</guid><description>${escapeXml(
        post.excerpt,
      )}</description><pubDate>${new Date(post.publishedIso).toUTCString()}</pubDate></item>`;
    })
    .join('');
  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(
      `${seoConfig.siteName} Blog`,
    )}</title><link>${escapeXml(absoluteUrl('/blog'))}</link><description>${escapeXml(
      seoConfig.defaultDescription,
    )}</description><language>tr</language>${items}</channel></rss>`,
  );
}
