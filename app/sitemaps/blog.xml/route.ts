import { listPublishedBlogPosts } from '@/lib/blog/repository';
import { sitemapXml, xmlResponse } from '@/lib/seo/xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const posts = await listPublishedBlogPosts();
  return xmlResponse(
    sitemapXml(
      posts
        .filter((post) => !post.noindex)
        .map((post) => ({
          path: `/blog/${post.slug}`,
          lastModified: post.updatedIso ?? post.publishedIso,
        })),
    ),
  );
}
