import { listPublishedBlogPosts } from '@/lib/blog/repository';
import { sitemapXml, xmlResponse } from '@/lib/seo/xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const posts = await listPublishedBlogPosts();
  const entriesBySlug = new Map<
    string,
    { path: string; lastModified?: string }
  >();

  for (const post of posts) {
    if (post.noindex || !post.slug) continue;
    const existing = entriesBySlug.get(post.slug);
    const lastModified = post.updatedIso ?? post.publishedIso;

    if (
      !existing ||
      (lastModified && lastModified > (existing.lastModified ?? ''))
    ) {
      entriesBySlug.set(post.slug, {
        path: `/blog/${post.slug}`,
        lastModified,
      });
    }
  }

  return xmlResponse(sitemapXml(Array.from(entriesBySlug.values())));
}
